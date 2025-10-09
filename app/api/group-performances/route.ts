import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/group-performances
export async function GET() {
  try {
    const supabase = createServerClient()

    console.log('[Group Performances API] Fetching groups...')

    // Fetch groups from Supabase
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .order('group_id', { ascending: false })

    if (groupsError) {
      console.error('[Group Performances API] Error fetching groups:', groupsError)
      return NextResponse.json(
        { success: false, error: groupsError.message },
        { status: 500 }
      )
    }

    console.log(`[Group Performances API] Found ${groupsData?.length || 0} groups`)

    // Fetch students for each group via group_members junction table
    const groupsWithMembers = await Promise.all(
      (groupsData || []).map(async (group: Record<string, unknown>) => {
        // First, get the group member relationships
        const { data: groupMembers, error: groupMembersError } = await supabase
          .from('group_members')
          .select('student_id, is_leader')
          .eq('group_id', group.group_id as string)

        if (groupMembersError) {
          console.error('[Group Performances API] Error fetching group members for group:', group.group_id, groupMembersError)
          return { ...group, students: [] }
        }

        if (!groupMembers || groupMembers.length === 0) {
          return { ...group, students: [] }
        }

        // Then, fetch the actual student details
        const studentIds = groupMembers.map((gm: { student_id: string; is_leader: boolean }) => gm.student_id)
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('student_id, full_name, age, gender, contact_number, email, school, course_year')
          .in('student_id', studentIds)

        if (studentsError) {
          console.error('[Group Performances API] Error fetching students for group:', group.group_id, studentsError)
          return { ...group, students: [] }
        }

        // Merge student data with is_leader info
        type GroupMember = { student_id: string; is_leader: boolean }
        const studentsWithLeaderInfo = (students || []).map((student: { student_id: string;[key: string]: unknown }) => {
          const memberInfo = (groupMembers as GroupMember[]).find((gm: GroupMember) => gm.student_id === student.student_id)
          return {
            ...student,
            is_leader: memberInfo?.is_leader || false
          }
        })

        return { ...group, students: studentsWithLeaderInfo }
      })
    )

    console.log(`[Group Performances API] Successfully fetched ${groupsWithMembers.length} groups with members`)

    return NextResponse.json({
      success: true,
      groups: groupsWithMembers
    })
  } catch (err) {
    console.error('[Group Performances API] Unexpected error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
