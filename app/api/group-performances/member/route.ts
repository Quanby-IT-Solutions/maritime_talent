import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { Database } from "@/schema/schema"

// PUT /api/group-performances/member - Update group member
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { member_id, group_id, full_name, role, email, contact_number } = body

    if (!member_id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    console.log('[Group Member API] Updating member:', member_id)

    // Update student information
    const updateData: Database['public']['Tables']['students']['Update'] = {}
    
    if (full_name !== undefined) updateData.full_name = full_name
    if (role !== undefined) updateData.course_year = role
    if (email !== undefined) updateData.email = email
    if (contact_number !== undefined) updateData.contact_number = contact_number

    const { data, error } = await supabase
      .from('students')
      // @ts-expect-error - Supabase type inference issue with partial updates
      .update(updateData)
      .eq('student_id', member_id)
      .select()
      .single()

    if (error) {
      console.error('[Group Member API] Error updating member:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('[Group Member API] Member updated successfully:', data)

    return NextResponse.json({
      success: true,
      member: data
    })
  } catch (err) {
    console.error('[Group Member API] Unexpected error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
