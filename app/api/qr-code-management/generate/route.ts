import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { createServerClient } from "@/lib/supabase"

type GenerateItem = { id: number; type: "guest" | "contestant_single" | "contestant_group" }
type GenerateBody = {
  // Back-compat for earlier payload
  userIds?: number[]
  // New preferred payload
  items?: GenerateItem[]
}

const BUCKET = "qr-codes"

async function generateAndUploadQR(
  supabase: ReturnType<typeof createServerClient>,
  item: GenerateItem
) {
  const { id, type } = item
  const payload = JSON.stringify({ type, id })
  const pngBuffer = await QRCode.toBuffer(payload, { type: "png", width: 512 })

  const dir = type === "guest" ? "guests" : type === "contestant_single" ? "singles" : "groups"
  const filePath = `${dir}/${id}.png`

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, pngBuffer, { contentType: "image/png", upsert: true })
  if (upErr) throw upErr

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  const publicUrl = publicUrlData.publicUrl

  const insert: any = { qr_code_url: publicUrl }
  if (type === "guest") insert.guest_id = id
  if (type === "contestant_single") insert.single_id = id
  if (type === "contestant_group") insert.group_id = id

  const onConflict = type === "guest" ? "guest_id" : type === "contestant_single" ? "single_id" : "group_id"
  const { error: dbErr } = await supabase.from("qr_codes").upsert(insert, { onConflict })
  if (dbErr) throw dbErr

  return publicUrl
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody
    let items: GenerateItem[] = []
    if (Array.isArray(body?.items) && body.items.length) {
      items = body.items
    } else if (Array.isArray(body?.userIds) && body.userIds.length) {
      // Back-compat: treat as guest ids
      items = body.userIds.map((id) => ({ id, type: "guest" as const }))
    }
    if (!items.length) {
      return NextResponse.json({ success: false, error: "Provide items: [{id,type}] or userIds[]" }, { status: 400 })
    }

    const supabase = createServerClient()

    const results: Array<{ id: number; type: string; url?: string; error?: string }> = []
    for (const it of items) {
      try {
        const url = await generateAndUploadQR(supabase, it)
        results.push({ id: it.id, type: it.type, url })
      } catch (e) {
        results.push({ id: it.id, type: it.type, error: e instanceof Error ? e.message : "unknown error" })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error("/api/qr-code-management/generate POST error", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}

