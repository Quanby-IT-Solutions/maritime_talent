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
    const guestData = data as { full_name: string } | null
    return guestData?.full_name || `guest_${id}`
  } else if (type === "contestant_single") {
    const { data } = await supabase
      .from("singles")
      .select("students!fk_single_student(full_name)")
      .eq("single_id", id)
      .single()
    const singleData = data as { students: { full_name: string } } | null
    return singleData?.students?.full_name || `single_${id}`
  } else if (type === "contestant_group") {
    const { data } = await supabase
      .from("groups")
      .select("group_name")
      .eq("group_id", id)
      .single()
    const groupData = data as { group_name: string } | null
    return groupData?.group_name || `group_${id}`
  }
  return `user_${id}`
}

async function generateAndUploadQR(
  supabase: ReturnType<typeof createServerClient>,
  item: GenerateItem
) {
  const { id, type, name, manual } = item
  console.log(`Generating QR for item:`, { id, type, name, manual })

  // Convert string ID to number for database queries
  const numericId = parseInt(id, 10)

  // QR code contains just the ID (single_id, group_id, or guest_id)
  const payload = id;
  const pngBuffer = await QRCode.toBuffer(payload, { type: "png", width: 512 })

  const dir = type === "guest" ? "guests" : type === "contestant_single" ? "singles" : "groups"

  // Always use consistent filename format: {id}_{sanitized_name}.png
  const userName = name || await getUserName(supabase, id, type)
  const sanitizedName = sanitizeFilename(userName)
  const filename = `${id}_${sanitizedName}.png`
  const filePath = `${dir}/${filename}`

  // Check if there's an existing QR code in the database and delete old file
  const queryField = type === "guest" ? "guest_id" : type === "contestant_single" ? "single_id" : "group_id"
  const { data: existingQR } = await supabase
    .from("qr_codes")
    .select("qr_code_url")
    .eq(queryField, numericId)
    .single()

  const existingQRData = existingQR as { qr_code_url: string } | null
  if (existingQRData?.qr_code_url) {
    // Extract the old file path from the URL
    try {
      const urlObj = new URL(existingQRData.qr_code_url)
      const pathParts = urlObj.pathname.split(`/${BUCKET}/`)
      if (pathParts.length > 1) {
        const oldFilePath = pathParts[1]
        // Delete the old file only if it has a different name
        if (oldFilePath !== filePath) {
          await supabase.storage.from(BUCKET).remove([oldFilePath])
        }
      }
    } catch (e) {
      console.log("Could not delete old QR code file", e)
      // Continue anyway
    }
  }

  // Upload the QR code (upsert will overwrite if same filename exists)
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, pngBuffer, { contentType: "image/png", upsert: true })
  if (upErr) throw upErr

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  const publicUrl = publicUrlData.publicUrl

  // Build the insert object based on type
  type QRCodeInsert = {
    qr_code_url: string
    guest_id?: number
    single_id?: number
    group_id?: number
  }

  const insert: QRCodeInsert = {
    qr_code_url: publicUrl
  }
  // Use the numericId we already converted at the top
  if (type === "guest") insert.guest_id = numericId
  if (type === "contestant_single") insert.single_id = numericId
  if (type === "contestant_group") insert.group_id = numericId

  console.log(`[QR Generate] Inserting QR code for ${type} ID ${id}:`, insert)

  // First try to delete any existing QR code for this user (use numeric ID)
  const deleteField = type === "guest" ? "guest_id" : type === "contestant_single" ? "single_id" : "group_id"
  await supabase.from("qr_codes").delete().eq(deleteField, numericId)

  // Then insert the new one
  const insertResult = await supabase.from("qr_codes").insert([insert as unknown as never])
  if (insertResult.error) {
    console.error(`[QR Generate] Database error for ${type} ID ${id}:`, insertResult.error)
    throw insertResult.error
  }
  console.log(`[QR Generate] Successfully saved QR code for ${type} ID ${id}`)

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

