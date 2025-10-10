import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { Database } from "@/schema/schema"

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

    // Fetch detailed data for each group and its members
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

        // Fetch detailed student data with all related information
        const studentIds = groupMembers.map((gm: { student_id: string; is_leader: boolean }) => gm.student_id)

        // Fetch students
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .in('student_id', studentIds)

        if (studentsError) {
          console.error('[Group Performances API] Error fetching students for group:', group.group_id, studentsError)
          return { ...group, students: [] }
        }

        // Fetch requirements for all students in parallel
        const { data: requirementsData } = await supabase
          .from('requirements')
          .select('*')
          .in('student_id', studentIds)

        // Fetch health & fitness for all students
        const { data: healthData } = await supabase
          .from('health_fitness')
          .select('*')
          .in('student_id', studentIds)

        // Fetch consents for all students
        const { data: consentsData } = await supabase
          .from('consents')
          .select('*')
          .in('student_id', studentIds)

        // Fetch endorsements for all students
        const { data: endorsementsData } = await supabase
          .from('endorsements')
          .select('*')
          .in('student_id', studentIds)

        // Fetch performances for all students
        const { data: performancesData } = await supabase
          .from('performances')
          .select('*')
          .in('student_id', studentIds)

        // Create maps for quick lookup
        const requirementsMap = new Map((requirementsData || []).map((r: { student_id: string }) => [r.student_id, r]))
        const healthMap = new Map((healthData || []).map((h: { student_id: string }) => [h.student_id, h]))
        const consentsMap = new Map((consentsData || []).map((c: { student_id: string }) => [c.student_id, c]))
        const endorsementsMap = new Map((endorsementsData || []).map((e: { student_id: string }) => [e.student_id, e]))
        const performancesMap = new Map((performancesData || []).map((p: { student_id: string }) => [p.student_id, p]))

        // Merge all data for each student
        type GroupMember = { student_id: string; is_leader: boolean }
        const studentsWithCompleteInfo = (students || []).map((student: { student_id: string;[key: string]: unknown }) => {
          const memberInfo = (groupMembers as GroupMember[]).find((gm: GroupMember) => gm.student_id === student.student_id)

          return {
            ...student,
            is_leader: memberInfo?.is_leader || false,
            requirements: requirementsMap.get(student.student_id) || null,
            health: healthMap.get(student.student_id) || null,
            consents: consentsMap.get(student.student_id) || null,
            endorsement: endorsementsMap.get(student.student_id) || null,
            performance: performancesMap.get(student.student_id) || null,
          }
        })

        return { ...group, students: studentsWithCompleteInfo }
      })
    )

    console.log(`[Group Performances API] Successfully fetched ${groupsWithMembers.length} groups with complete member data`)

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

// PUT /api/group-performances - Update group
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { group_id, group_name, performance_type, description } = body

    if (!group_id) {
      return NextResponse.json(
        { success: false, error: 'Group ID is required' },
        { status: 400 }
      )
    }

    console.log('[Group Performances API] Updating group:', group_id)

    // Map performance type back to DB format
    let dbPerformanceType = performance_type
    if (performance_type === "Dance") {
      dbPerformanceType = "Dancing"
    } else if (performance_type === "Drama") {
      dbPerformanceType = "Theatrical/Drama"
    } else if (performance_type === "Musical") {
      dbPerformanceType = "Musical Instrument"
    }

    const updateData: Database['public']['Tables']['groups']['Update'] = {}
    if (group_name !== undefined) updateData.group_name = group_name
    if (dbPerformanceType !== undefined) updateData.performance_type = dbPerformanceType as Database['public']['Enums']['PerformanceType']
    if (description !== undefined) updateData.performance_title = description

    const { data, error } = await supabase
      .from('groups')
      // @ts-expect-error - Supabase type inference issue with partial updates
      .update(updateData)
      .eq('group_id', group_id)
      .select()
      .single()

    if (error) {
      console.error('[Group Performances API] Error updating group:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('[Group Performances API] Group updated successfully:', data)

    return NextResponse.json({
      success: true,
      group: data
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

// DELETE /api/group-performances - Delete group
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const group_id = searchParams.get('group_id')

    if (!group_id) {
      return NextResponse.json(
        { success: false, error: 'Group ID is required' },
        { status: 400 }
      )
    }

    console.log('[Group Performances API] Deleting group:', group_id)

    // Delete group members first (if not cascading)
    const { error: membersError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group_id)

    if (membersError) {
      console.error('[Group Performances API] Error deleting group members:', membersError)
    }

    // Delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('group_id', group_id)

    if (error) {
      console.error('[Group Performances API] Error deleting group:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('[Group Performances API] Group deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully'
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
