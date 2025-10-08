import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET - Fetch all singles with their student data
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();

    // Fetch singles with student data using JOIN
    const { data: singlesData, error: singlesError } = await supabase
      .from('singles')
      .select(`
        *,
        students:student_id (
          student_id,
          full_name,
          school
        )
      `)
      .order('single_id', { ascending: false});

    if (singlesError) {
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${singlesError.message}`,
        },
        { status: 500 }
      );
    }

    // Fetch performances to get duration
    const { data: performancesData } = await supabase
      .from('performances')
      .select('student_id, duration');

    // Create a map of student_id to duration
    const durationMap = new Map();
    (performancesData || []).forEach((perf: any) => {
      durationMap.set(perf.student_id, perf.duration);
    });

    // Transform database data to match our expected structure
    const transformedData = (singlesData || []).map((single: any) => {
      return {
        id: single.single_id,
        single_id: single.single_id,
        performance_title: single.performance_title || "Untitled Performance",
        student_id: single.student_id || null,
        created_at: single.created_at || null,
        student_name: single.students?.full_name || null,
        student_school: single.students?.school || null,
        performance_type: single.performance_type || null,
        duration: durationMap.get(single.student_id) || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedData,
    });

  } catch (error) {
    console.error('Error fetching singles:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// PUT - Update a single performance
export async function PUT(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await req.json();
    
    const { single_id, performance_title } = body;

    if (!single_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'single_id is required',
        },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase as any)
      .from('singles')
      .update({
        performance_title,
      })
      .eq('single_id', single_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error updating single:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a single performance
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const single_id = searchParams.get('single_id');

    if (!single_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'single_id is required',
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('singles')
      .delete()
      .eq('single_id', single_id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Single performance deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting single:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}