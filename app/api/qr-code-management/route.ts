import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Type definitions
interface Guest {
  guest_id: string
  full_name: string
  email: string
  registration_date: string
}

interface Student {
  student_id: string
  full_name: string
  email: string
}

interface Single {
  single_id: string
  performance_title: string
  created_at: string
  students: Student | null
}

interface GroupMember {
  student_id: string
  is_leader: boolean
  students: Student | null
}

interface Group {
  group_id: string
  group_name: string
  performance_title: string
  created_at: string
  group_members: GroupMember[]
}

interface QRCode {
  qr_code_url: string
  guest_id?: string
  single_id?: string
  group_id?: string
  created_at: string
}

// GET /api/qr-code-management
// Query params:
// - q: string (search full_name or email)
// - page: number (1-based)
// - pageSize: number
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1),
      100
    )
    console.log("[QR Management API] Fetching combined list:", { q, page, pageSize })

    const supabase = createServerClient()

    // 1) Guests
    let guestsQuery = supabase
      .from("guests")
      .select("guest_id, full_name, email, registration_date")
      .order("guest_id", { ascending: true })
    if (q) {
      guestsQuery = guestsQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
    }
    const { data: guests, error: guestsErr } = await guestsQuery
    if (guestsErr) throw guestsErr
    const guestIds = (guests || []).map((g: Guest) => g.guest_id)
    const { data: guestQrs } = guestIds.length
      ? await supabase
        .from("qr_codes")
        .select("qr_code_url, guest_id, created_at")
        .in("guest_id", guestIds)
      : { data: [] as QRCode[] }
    console.log(`[QR Management API] Found ${guestQrs?.length || 0} QR codes for ${guestIds.length} guests`)
    console.log(`[QR Management API] Guest IDs:`, guestIds)
    console.log(`[QR Management API] Guest QR codes:`, guestQrs?.map(r => ({ guest_id: r.guest_id, url: r.qr_code_url })))
    const guestQrMap = new Map<string, QRCode>()
      ; (guestQrs || []).forEach((r: QRCode) => r.guest_id && guestQrMap.set(r.guest_id, r))
    const guestItems = (guests || []).map((g: Guest) => ({
      type: "guest" as const,
      id: g.guest_id,
      name: g.full_name,
      email: g.email,
      qr: guestQrMap.get(g.guest_id)?.qr_code_url || null,
      qrCreatedAt: guestQrMap.get(g.guest_id)?.created_at || null,
    }))

    // 2) Singles with students (using join)
    const sQuery = supabase
      .from("singles")
      .select(`
        single_id,
        performance_title,
        created_at,
        students!fk_single_student (
          student_id,
          full_name,
          email
        )
      `)
      .order("single_id", { ascending: true })
    const { data: singles, error: singlesErr } = await sQuery
    if (singlesErr) throw singlesErr

    const singleIds = (singles || []).map((s: Single) => s.single_id)
    const { data: singleQrs } = singleIds.length
      ? await supabase
        .from("qr_codes")
        .select("qr_code_url, single_id, created_at")
        .in("single_id", singleIds)
      : { data: [] as QRCode[] }
    console.log(`[QR Management API] Found ${singleQrs?.length || 0} QR codes for ${singleIds.length} singles`)
    console.log(`[QR Management API] Single IDs:`, singleIds)
    console.log(`[QR Management API] Single QR codes:`, singleQrs?.map(r => ({ single_id: r.single_id, url: r.qr_code_url })))
    const singleQrMap = new Map<string, QRCode>()
      ; (singleQrs || []).forEach((r: QRCode) => r.single_id && singleQrMap.set(r.single_id, r))
    const singleItems = (singles || [])
      .map((s: Single) => {
        const student = s.students
        return {
          type: "contestant_single" as const,
          id: s.single_id,
          name: student?.full_name || `Single #${s.single_id}`,
          email: student?.email || "",
          qr: singleQrMap.get(s.single_id)?.qr_code_url || null,
          qrCreatedAt: singleQrMap.get(s.single_id)?.created_at || null,
        }
      })
      .filter((row) =>
        q ? (row.name?.toLowerCase().includes(q.toLowerCase()) || row.email?.toLowerCase().includes(q.toLowerCase())) : true
      )

    // 3) Groups with members (using group_members junction table)
    const grQuery = supabase
      .from("groups")
      .select(`
        group_id,
        group_name,
        performance_title,
        created_at,
        group_members!group_members_group_id_fkey (
          student_id,
          is_leader,
          students!group_members_student_id_fkey (
            student_id,
            full_name,
            email
          )
        )
      `)
      .order("group_id", { ascending: true })
    const { data: groups, error: groupsErr } = await grQuery
    if (groupsErr) throw groupsErr

    const groupIds = (groups || []).map((g: Group) => g.group_id)
    const { data: groupQrs } = groupIds.length
      ? await supabase
        .from("qr_codes")
        .select("qr_code_url, group_id, created_at")
        .in("group_id", groupIds)
      : { data: [] as QRCode[] }
    console.log(`[QR Management API] Found ${groupQrs?.length || 0} QR codes for ${groupIds.length} groups`)
    const groupQrMap = new Map<string, QRCode>()
      ; (groupQrs || []).forEach((r: QRCode) => r.group_id && groupQrMap.set(r.group_id, r))
    const groupItems = (groups || [])
      .map((g: Group) => {
        // Find the leader from group members
        const members = g.group_members || []
        const leader = members.find((m: GroupMember) => m.is_leader)?.students
        const memberCount = members.length

        return {
          type: "contestant_group" as const,
          id: g.group_id,
          name: g.group_name || `Group #${g.group_id}`,
          email: leader?.email || "",
          memberCount,
          qr: groupQrMap.get(g.group_id)?.qr_code_url || null,
          qrCreatedAt: groupQrMap.get(g.group_id)?.created_at || null,
        }
      })
      .filter((row) =>
        q ? (row.name?.toLowerCase().includes(q.toLowerCase()) || row.email?.toLowerCase().includes(q.toLowerCase())) : true
      )

    // Combine and paginate
    const combined = [...guestItems, ...singleItems, ...groupItems]
      .filter((row) =>
        q ? (row.name?.toLowerCase().includes(q.toLowerCase()) || row.email?.toLowerCase().includes(q.toLowerCase())) : true
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))

    const total = combined.length
    console.log(`[QR Management API] Total combined records: ${total}`)
    console.log(`[QR Management API] All records:`, combined.map(i => ({ type: i.type, id: i.id, name: i.name, hasQR: !!i.qr })))

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = combined.slice(start, end)

    console.log(`[QR Management API] Pagination: page=${page}, pageSize=${pageSize}, start=${start}, end=${end}`)
    console.log(`[QR Management API] Returning ${items.length} items (${items.filter(i => i.qr).length} with QR codes)`)
    console.log(`[QR Management API] Items with QR codes:`, items.filter(i => i.qr).map(i => ({ type: i.type, id: i.id, name: i.name, hasQR: !!i.qr })))

    return NextResponse.json({ success: true, page, pageSize, total, items })
  } catch (err) {
    console.error("[QR Management API] Error:", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        details: err instanceof Error ? err.stack : undefined
      },
      { status: 500 }
    )
  }
}

