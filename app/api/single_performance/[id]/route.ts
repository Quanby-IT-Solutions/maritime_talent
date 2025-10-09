import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET - Fetch single performance details with all related data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const singleId = id;

    if (!singleId) {
      return NextResponse.json(
        { success: false, error: 'Invalid single ID' },
        { status: 400 }
      );
    }

    // Fetch single performance with student data
    const { data: singleData, error: singleError } = await supabase
      .from('singles')
      .select(`
        *,
        students:student_id (
          *
        )
      `)
      .eq('single_id', singleId)
      .single();

    if (singleError || !singleData) {
      return NextResponse.json(
        { success: false, error: 'Single performance not found' },
        { status: 404 }
      );
    }

    const studentId = (singleData as any).student_id;

    // Fetch performance details
    const { data: performanceData } = await supabase
      .from('performances')
      .select('*')
      .eq('student_id', studentId)
      .single();

    // Fetch requirements
    const { data: requirementsData } = await supabase
      .from('requirements')
      .select('*')
      .eq('student_id', studentId)
      .single();

    // Fetch health & fitness
    const { data: healthData } = await supabase
      .from('health_fitness')
      .select('*')
      .eq('student_id', studentId)
      .single();

    // Fetch consents
    const { data: consentsData } = await supabase
      .from('consents')
      .select('*')
      .eq('student_id', studentId)
      .single();

    // Fetch endorsements
    const { data: endorsementData } = await supabase
      .from('endorsements')
      .select('*')
      .eq('student_id', studentId)
      .single();

    // Combine all data
    const completeData = {
      single: singleData,
      student: (singleData as any).students,
      performance: performanceData,
      requirements: requirementsData,
      health: healthData,
      consents: consentsData,
      endorsement: endorsementData,
    };

    return NextResponse.json({
      success: true,
      data: completeData,
    });

  } catch (error) {
    console.error('Error fetching single performance details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// PUT - Update single performance
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const singleId = id;
    const body = await req.json();

    if (!singleId) {
      return NextResponse.json(
        { success: false, error: 'Invalid single ID' },
        { status: 400 }
      );
    }

    // Get student_id from singles table
    const { data: singleData } = await supabase
      .from('singles')
      .select('student_id')
      .eq('single_id', singleId)
      .single();

    if (!singleData) {
      return NextResponse.json(
        { success: false, error: 'Single performance not found' },
        { status: 404 }
      );
    }

    const studentId = (singleData as any).student_id;

    // Update singles table
    if (body.single) {
      await (supabase as any)
        .from('singles')
        .update(body.single)
        .eq('single_id', singleId);
    }

    // Update students table
    if (body.student && studentId) {
      await (supabase as any)
        .from('students')
        .update(body.student)
        .eq('student_id', studentId);
    }

    // Update performances table
    if (body.performance && studentId) {
      await (supabase as any)
        .from('performances')
        .update(body.performance)
        .eq('student_id', studentId);
    }

    return NextResponse.json({
      success: true,
      message: 'Single performance updated successfully',
    });

  } catch (error) {
    console.error('Error updating single performance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete single performance and all related data including files
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const singleId = id;

    if (!singleId) {
      return NextResponse.json(
        { success: false, error: 'Invalid single ID' },
        { status: 400 }
      );
    }

    // Get student_id and all file URLs before deletion
    const { data: singleData } = await supabase
      .from('singles')
      .select(`
        student_id,
        students:student_id (
          student_id
        )
      `)
      .eq('single_id', singleId)
      .single();

    if (!singleData) {
      return NextResponse.json(
        { success: false, error: 'Single performance not found' },
        { status: 404 }
      );
    }

    const studentId = (singleData as any).student_id;

    // Fetch all file URLs to delete from storage
    const { data: requirementsData } = await supabase
      .from('requirements')
      .select('certification_url, school_id_url')
      .eq('student_id', studentId)
      .single() as { data: any };

    const { data: healthData } = await supabase
      .from('health_fitness')
      .select('student_signature_url, parent_guardian_signature_url')
      .eq('student_id', studentId)
      .single() as { data: any };

    const { data: consentsData } = await supabase
      .from('consents')
      .select('student_signature_url, parent_guardian_signature_url')
      .eq('student_id', studentId)
      .single() as { data: any };

    const { data: endorsementData } = await supabase
      .from('endorsements')
      .select('signature_url')
      .eq('student_id', studentId)
      .single() as { data: any };

    // Collect all file paths to delete
    const filesToDelete: string[] = [];
    
    if (requirementsData?.certification_url) {
      const path = requirementsData.certification_url.split('/attachment/')[1];
      if (path) filesToDelete.push(path);
    }
    if (requirementsData?.school_id_url) {
      const path = requirementsData.school_id_url.split('/attachment/')[1];
      if (path) filesToDelete.push(path);
    }
    if (healthData?.student_signature_url) {
      const path = healthData.student_signature_url.split('/attachment/')[1];
      if (path) filesToDelete.push(path);
    }
    if (healthData?.parent_guardian_signature_url) {
      const path = healthData.parent_guardian_signature_url.split('/attachment/')[1];
      if (path) filesToDelete.push(path);
    }
    if (consentsData?.student_signature_url) {
      const path = consentsData.student_signature_url.split('/attachment/')[1];
      if (path) filesToDelete.push(path);
    }
    if (consentsData?.parent_guardian_signature_url) {
      const path = consentsData.parent_guardian_signature_url.split('/attachment/')[1];
      if (path) filesToDelete.push(path);
    }
    if (endorsementData?.signature_url) {
      const path = endorsementData.signature_url.split('/attachment/')[1];
      if (path) filesToDelete.push(path);
    }

    // Delete files from storage
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('attachment')
        .remove(filesToDelete);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database tables (in correct order due to foreign keys)
    // Delete related records first
    await supabase.from('requirements').delete().eq('student_id', studentId);
    await supabase.from('health_fitness').delete().eq('student_id', studentId);
    await supabase.from('consents').delete().eq('student_id', studentId);
    await supabase.from('endorsements').delete().eq('student_id', studentId);
    await supabase.from('performances').delete().eq('student_id', studentId);
    await supabase.from('qr_codes').delete().eq('single_id', singleId);
    
    // Delete the single performance
    await supabase.from('singles').delete().eq('single_id', singleId);
    
    // Finally delete the student
    await supabase.from('students').delete().eq('student_id', studentId);

    return NextResponse.json({
      success: true,
      message: 'Single performance and all related data deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting single performance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
