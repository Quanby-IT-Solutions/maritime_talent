import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

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
    let gQuery = supabase
      .from("guests")
      .select("guest_id, full_name, email, registration_date")
      .order("guest_id", { ascending: true })
    if (q) gQuery = gQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`) as any
    const { data: guests, error: guestsErr } = await gQuery
    if (guestsErr) throw guestsErr
    const guestIds = (guests || []).map((g: any) => g.guest_id)
    const { data: guestQrs } = guestIds.length
      ? await supabase
          .from("qr_codes")
          .select("qr_code_url, guest_id, created_at")
          .in("guest_id", guestIds)
      : { data: [] as any[] }
    const guestQrMap = new Map<number, any>()
    ;(guestQrs || []).forEach((r: any) => guestQrMap.set(r.guest_id, r))
    const guestItems = (guests || []).map((g: any) => ({
      type: "guest" as const,
      id: g.guest_id as number,
      name: g.full_name as string,
      email: g.email as string,
      qr: guestQrMap.get(g.guest_id)?.qr_code_url || null,
      qrCreatedAt: guestQrMap.get(g.guest_id)?.created_at || null,
    }))

    // 2) Singles with students (using join)
    let sQuery = supabase
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

    const singleIds = (singles || []).map((s: any) => s.single_id)
    const { data: singleQrs } = singleIds.length
      ? await supabase
          .from("qr_codes")
          .select("qr_code_url, single_id, created_at")
          .in("single_id", singleIds)
      : { data: [] as any[] }
    const singleQrMap = new Map<number, any>()
    ;(singleQrs || []).forEach((r: any) => singleQrMap.set(r.single_id, r))
    const singleItems = (singles || [])
      .map((s: any) => {
        const student = s.students
        return {
          type: "contestant_single" as const,
          id: s.single_id as number,
          name: (student?.full_name as string) || `Single #${s.single_id}`,
          email: (student?.email as string) || "",
          qr: singleQrMap.get(s.single_id)?.qr_code_url || null,
          qrCreatedAt: singleQrMap.get(s.single_id)?.created_at || null,
        }
      })
      .filter((row) =>
        q ? (row.name?.toLowerCase().includes(q.toLowerCase()) || row.email?.toLowerCase().includes(q.toLowerCase())) : true
      )

    // 3) Groups with members (using group_members junction table)
    let grQuery = supabase
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

    const groupIds = (groups || []).map((g: any) => g.group_id)
    const { data: groupQrs } = groupIds.length
      ? await supabase
          .from("qr_codes")
          .select("qr_code_url, group_id, created_at")
          .in("group_id", groupIds)
      : { data: [] as any[] }
    const groupQrMap = new Map<number, any>()
    ;(groupQrs || []).forEach((r: any) => groupQrMap.set(r.group_id, r))
    const groupItems = (groups || [])
      .map((g: any) => {
        // Find the leader from group members
        const members = g.group_members || []
        const leader = members.find((m: any) => m.is_leader)?.students
        const memberCount = members.length
        
        return {
          type: "contestant_group" as const,
          id: g.group_id as number,
          name: (g.group_name as string) || `Group #${g.group_id}`,
          email: (leader?.email as string) || "",
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
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = combined.slice(start, end)

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

