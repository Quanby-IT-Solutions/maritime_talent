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

// Helper to get user name and additional metadata from database
async function getUserMetadata(
  supabase: ReturnType<typeof createServerClient>,
  id: string,
  type: string
): Promise<{ name: string; performanceTitle?: string; groupName?: string; studentId?: string }> {
  if (type === "guest") {
    const { data } = await supabase
      .from("guests")
      .select("full_name")
      .eq("guest_id", id)
      .single()
    const guestData = data as { full_name: string } | null
    return { name: guestData?.full_name || `guest_${id}` }
  } else if (type === "contestant_single") {
    const { data } = await supabase
      .from("singles")
      .select("student_id, students!fk_single_student(full_name), performance_title")
      .eq("single_id", id)
      .single()
    const singleData = data as { student_id: string; students: { full_name: string }; performance_title: string } | null
    return {
      name: singleData?.students?.full_name || `single_${id}`,
      performanceTitle: singleData?.performance_title,
      studentId: singleData?.student_id
    }
  } else if (type === "contestant_group") {
    const { data } = await supabase
      .from("groups")
      .select("group_name")
      .eq("group_id", id)
      .single()
    const groupData = data as { group_name: string } | null
    return {
      name: groupData?.group_name || `group_${id}`,
      groupName: groupData?.group_name
    }
  }
  return { name: `user_${id}` }
}

// Helper to generate QR codes for each member in a group
async function generateGroupMemberQRs(
  supabase: ReturnType<typeof createServerClient>,
  groupId: string,
  numericGroupId: number,
  metadata: { name: string; performanceTitle?: string; groupName?: string }
): Promise<string> {
  // Fetch all group members
  const { data: membersData } = await supabase
    .from("group_members")
    .select(`
      group_member_id,
      student_id,
      students!group_members_student_id_fkey(full_name)
    `)
    .eq("group_id", groupId)
  
  const members = membersData as Array<{
    group_member_id: string
    student_id: string
    students: { full_name: string }
  }> | null

  if (!members || members.length === 0) {
    console.log(`No members found for group ${groupId}, creating single QR code`)
    // Fallback: create a single QR code for the group
    const sanitizedGroupName = metadata.groupName
      ? sanitizeFilename(metadata.groupName)
      : 'unknown'
    const filename = `${groupId}_${sanitizedGroupName}.png`
    const filePath = `group/${sanitizedGroupName}/${filename}`
    
    // Generate QR code with group_id as payload
    const pngBuffer = await QRCode.toBuffer(groupId, { type: "png", width: 512 })
    
    await supabase.storage
      .from(BUCKET)
      .upload(filePath, pngBuffer, { contentType: "image/png", upsert: true })
    
    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
    return publicUrlData.publicUrl
  }

  const sanitizedGroupName = metadata.groupName
    ? sanitizeFilename(metadata.groupName)
    : 'unknown'

  // Delete old QR code files for this group
  try {
    // List all member folders in the group
    const { data: memberFolders } = await supabase.storage
      .from(BUCKET)
      .list(`group/${sanitizedGroupName}/member`)
    
    if (memberFolders && memberFolders.length > 0) {
      // For each member folder, list and delete all files inside
      for (const folder of memberFolders) {
        if (folder.name) {
          const { data: filesInFolder } = await supabase.storage
            .from(BUCKET)
            .list(`group/${sanitizedGroupName}/member/${folder.name}`)
          
          if (filesInFolder && filesInFolder.length > 0) {
            const filesToDelete = filesInFolder.map(f => 
              `group/${sanitizedGroupName}/member/${folder.name}/${f.name}`
            )
            await supabase.storage.from(BUCKET).remove(filesToDelete)
          }
        }
      }
    }
  } catch (e) {
    console.log("Could not delete old QR code files", e)
  }

  // Delete existing QR code records for this group
  await supabase.from("qr_codes").delete().eq("group_id", groupId)

  // Upload QR code for each member (each with their own student_id as payload)
  const uploadPromises = members.map(async (member) => {
    const memberName = member.students?.full_name || `member_${member.student_id}`
    const sanitizedMemberName = sanitizeFilename(memberName)
    const filename = `${member.student_id}_${sanitizedMemberName}.png`
    const filePath = `group/${sanitizedGroupName}/member/${sanitizedMemberName}/${filename}`

    // Generate QR code with student_id as payload
    const pngBuffer = await QRCode.toBuffer(member.student_id, { type: "png", width: 512 })

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, pngBuffer, { contentType: "image/png", upsert: true })
    
    if (upErr) {
      console.error(`Error uploading QR for member ${memberName}:`, upErr)
      throw upErr
    }

    // Get public URL for this member's QR code
    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
    
    // Insert QR code record for this member
    const insert = {
      qr_code_url: publicUrlData.publicUrl,
      group_id: groupId
    }
    
    await supabase.from("qr_codes").insert([insert as unknown as never])
    
    return publicUrlData.publicUrl
  })

  const urls = await Promise.all(uploadPromises)

  // Return the first member's QR code URL for backward compatibility
  console.log(`[QR Generate] Successfully saved ${urls.length} QR codes for group ID ${groupId}`)
  return urls[0]
}

async function generateAndUploadQR(
  supabase: ReturnType<typeof createServerClient>,
  item: GenerateItem
) {
  const { id, type, name, manual } = item
  console.log(`Generating QR for item:`, { id, type, name, manual })

  // Convert string ID to number for database queries
  const numericId = parseInt(id, 10)

  // Get user metadata (name, performance title, group name, student_id)
  const metadata = name 
    ? { name, performanceTitle: undefined, groupName: undefined, studentId: undefined }
    : await getUserMetadata(supabase, id, type)
  
  // For group contestants, generate separate QR codes for each member
  if (type === "contestant_group") {
    return await generateGroupMemberQRs(supabase, id, numericId, metadata)
  }

  // QR code contains the student_id for singles, or the id for guests
  const payload = type === "contestant_single" && metadata.studentId ? metadata.studentId : id;
  const pngBuffer = await QRCode.toBuffer(payload, { type: "png", width: 512 })
  
  const sanitizedName = sanitizeFilename(metadata.name)
  const filename = type === "contestant_single" && metadata.studentId 
    ? `${metadata.studentId}_${sanitizedName}.png`
    : `${id}_${sanitizedName}.png`
  
  // Organize folder structure based on type
  let filePath: string
  if (type === "guest") {
    filePath = `guests/${filename}`
  } else if (type === "contestant_single") {
    // single -> performance title -> name -> file
    const sanitizedPerformanceTitle = metadata.performanceTitle 
      ? sanitizeFilename(metadata.performanceTitle)
      : 'unknown'
    filePath = `single/${sanitizedPerformanceTitle}/${sanitizedName}/${filename}`
  } else {
    // This shouldn't be reached for groups anymore
    const sanitizedGroupName = metadata.groupName
      ? sanitizeFilename(metadata.groupName)
      : 'unknown'
    filePath = `group/${sanitizedGroupName}/member/${sanitizedName}/${filename}`
  }

  // Check if there's an existing QR code in the database and delete old file
  const queryField = type === "guest" ? "guest_id" : "single_id"
  const { data: existingQR } = await supabase
    .from("qr_codes")
    .select("qr_code_url")
    .eq(queryField, type === "guest" ? id : id)
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
  // Use the id directly (Supabase will handle UUID conversion)
  if (type === "guest") insert.guest_id = parseInt(id, 10)
  if (type === "contestant_single") insert.single_id = parseInt(id, 10)
  // Note: contestant_group is handled separately in generateGroupMemberQRs

  console.log(`[QR Generate] Inserting QR code for ${type} ID ${id}:`, insert)

  // First try to delete any existing QR code for this user
  const deleteField = type === "guest" ? "guest_id" : "single_id"
  await supabase.from("qr_codes").delete().eq(deleteField, id)

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

