import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { createServerClient } from "@/lib/supabase"

type GenerateItem = {
  id: string;
  type: "guest" | "contestant_single" | "contestant_group";
  name?: string;
  manual?: boolean;
}
type GenerateBody = {
  // Back-compat for earlier payload
  userIds?: string[]
  // New preferred payload
  items?: GenerateItem[]
}

const BUCKET = "qr-codes"

// Helper to sanitize filename
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

// Helper to get user name from database
async function getUserName(
  supabase: ReturnType<typeof createServerClient>,
  id: string,
  type: string
): Promise<string> {
  if (type === "guest") {
    const { data } = await supabase
      .from("guests")
      .select("full_name")
      .eq("guest_id", id)
      .single()
    return (data as any)?.full_name || `guest_${id}`
  } else if (type === "contestant_single") {
    const { data } = await supabase
      .from("singles")
      .select("students!fk_single_student(full_name)")
      .eq("single_id", id)
      .single()
    return (data as any)?.students?.full_name || `single_${id}`
  } else if (type === "contestant_group") {
    const { data } = await supabase
      .from("groups")
      .select("group_name")
      .eq("group_id", id)
      .single()
    return (data as any)?.group_name || `group_${id}`
  }
  return `user_${id}`
}

async function generateAndUploadQR(
  supabase: ReturnType<typeof createServerClient>,
  item: GenerateItem
) {
  const { id, type, name, manual } = item
  console.log(`Generating QR for item:`, { id, type, name, manual })

  // QR code contains just the ID (single_id, group_id, or guest_id)
  const payload = id;
  const pngBuffer = await QRCode.toBuffer(payload, { type: "png", width: 512 })

  const dir = type === "guest" ? "guests" : type === "contestant_single" ? "singles" : "groups"
  console.log(`Using directory: ${dir} for type: ${type}`)

  // Get or use provided name
  const userName = name || await getUserName(supabase, id, type)
  const sanitizedName = sanitizeFilename(userName)

  // Generate filename based on whether it's manual or bulk
  const filename = manual
    ? `${sanitizedName}_manual_qr_code.png`
    : `${id}.png`

  const filePath = `${dir}/${filename}`

  // If manual generation, check for and delete old QR code first
  if (manual) {
    // Check if there's an existing QR code in the database
    const queryField = type === "guest" ? "guest_id" : type === "contestant_single" ? "single_id" : "group_id"
    const { data: existingQR } = await supabase
      .from("qr_codes")
      .select("qr_code_url")
      .eq(queryField, id)
      .single()

    const existingQRData = existingQR as any
    if (existingQRData?.qr_code_url) {
      // Extract the old file path from the URL
      try {
        const urlObj = new URL(existingQRData.qr_code_url)
        const pathParts = urlObj.pathname.split(`/${BUCKET}/`)
        if (pathParts.length > 1) {
          const oldFilePath = pathParts[1]
          // Delete the old file (ignore errors if it doesn't exist)
          await supabase.storage.from(BUCKET).remove([oldFilePath])
          console.log(`Deleted old QR code: ${oldFilePath}`)
        }
      } catch (e) {
        console.log("Could not delete old QR code file", e)
        // Continue anyway
      }
    }
  }

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
    console.log('QR Generate API received body:', JSON.stringify(body, null, 2))

    let items: GenerateItem[] = []
    if (Array.isArray(body?.items) && body.items.length) {
      items = body.items
      console.log('Processing items:', items)
    } else if (Array.isArray(body?.userIds) && body.userIds.length) {
      // Back-compat: treat as guest ids
      items = body.userIds.map((id) => ({ id, type: "guest" as const }))
      console.log('Processing userIds (back-compat):', items)
    }
    if (!items.length) {
      return NextResponse.json({ success: false, error: "Provide items: [{id,type}] or userIds[]" }, { status: 400 })
    }

    const supabase = createServerClient()

    const results: Array<{ id: string; type: string; url?: string; error?: string }> = []
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

