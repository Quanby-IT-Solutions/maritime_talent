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

    const studentId = (singleData as { student_id: string }).student_id;

    // Fetch performance details (may not exist)
    const { data: performanceData } = await supabase
      .from('performances')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    // Fetch requirements (may not exist)
    const { data: requirementsData } = await supabase
      .from('requirements')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    // Fetch health & fitness (may not exist)
    const { data: healthData } = await supabase
      .from('health_fitness')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    // Fetch consents (may not exist)
    const { data: consentsData } = await supabase
      .from('consents')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    // Fetch endorsements (may not exist)
    const { data: endorsementData } = await supabase
      .from('endorsements')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    // Combine all data
    const completeData = {
      single: singleData,
      student: (singleData as { students: unknown }).students,
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

    const studentId = (singleData as { student_id: string }).student_id;

    // Update singles table
    if (body.single) {
      await supabase
        .from('singles')
        .update(body.single as never)
        .eq('single_id', singleId);
    }

    // Update students table
    if (body.student && studentId) {
      await supabase
        .from('students')
        .update(body.student as never)
        .eq('student_id', studentId);
    }

    // Update performances table
    if (body.performance && studentId) {
      await supabase
        .from('performances')
        .update(body.performance as never)
        .eq('student_id', studentId);
    }

    // Update or insert endorsement
    if (body.endorsement && studentId) {
      // Check if endorsement exists
      const { data: existingEndorsement } = await supabase
        .from('endorsements')
        .select('endorsement_id')
        .eq('student_id', studentId)
        .maybeSingle();

      if (existingEndorsement) {
        // Update existing endorsement
        await supabase
          .from('endorsements')
          .update(body.endorsement as never)
          .eq('student_id', studentId);
      } else if (body.endorsement.official_name || body.endorsement.position) {
        // Insert new endorsement only if there's data
        await supabase
          .from('endorsements')
          .insert({
            student_id: studentId,
            ...body.endorsement,
          } as never);
      }
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

    const studentId = (singleData as { student_id: string }).student_id;

    // Fetch QR code data (may not exist for all singles)
    const { data: qrCodeData, error: qrError } = await supabase
      .from('qr_codes')
      .select('qr_code_url, qr_id')
      .eq('single_id', singleId)
      .maybeSingle() as { data: { qr_code_url?: string; qr_id?: string } | null; error: unknown };

    if (qrError) {
      console.log('QR code query error:', qrError);
    }
    console.log('QR code data found:', qrCodeData);

    // Fetch all file URLs to delete from storage (may not exist for all students)
    const { data: requirementsData } = await supabase
      .from('requirements')
      .select('certification_url, school_id_url')
      .eq('student_id', studentId)
      .maybeSingle() as { data: { certification_url?: string; school_id_url?: string } | null };

    const { data: healthData } = await supabase
      .from('health_fitness')
      .select('student_signature_url, parent_guardian_signature_url')
      .eq('student_id', studentId)
      .maybeSingle() as { data: { student_signature_url?: string; parent_guardian_signature_url?: string } | null };

    const { data: consentsData } = await supabase
      .from('consents')
      .select('student_signature_url, parent_guardian_signature_url')
      .eq('student_id', studentId)
      .maybeSingle() as { data: { student_signature_url?: string; parent_guardian_signature_url?: string } | null };

    const { data: endorsementData } = await supabase
      .from('endorsements')
      .select('signature_url')
      .eq('student_id', studentId)
      .maybeSingle() as { data: { signature_url?: string } | null };

    console.log('Requirements data:', requirementsData);
    console.log('Health data:', healthData);
    console.log('Consents data:', consentsData);
    console.log('Endorsement data:', endorsementData);

    // Collect all file paths to delete from attachment bucket
    const filesToDelete: string[] = [];

    // Collect QR code files to delete from qr-codes bucket
    const qrFilesToDelete: string[] = [];

    if (qrCodeData?.qr_code_url) {
      console.log('QR Code URL:', qrCodeData.qr_code_url);
      // Extract path from URL - format: https://.../storage/v1/object/public/qr-codes/singles/filename.png
      // or singles/filename.png or single/filename.png
      let filePath = '';

      if (qrCodeData.qr_code_url.includes('/qr-codes/')) {
        const urlParts = qrCodeData.qr_code_url.split('/qr-codes/');
        filePath = urlParts[1];
      } else if (qrCodeData.qr_code_url.includes('/public/')) {
        const urlParts = qrCodeData.qr_code_url.split('/public/');
        filePath = urlParts[1];
      } else {
        // Might already be just the path
        filePath = qrCodeData.qr_code_url;
      }

      if (filePath) {
        console.log('Extracted QR file path:', filePath);
        qrFilesToDelete.push(filePath);
      }
    }

    // Helper function to extract file path from URL
    const extractFilePath = (url: string, bucketName: string) => {
      if (!url) return null;
      // Try different URL patterns
      if (url.includes(`/${bucketName}/`)) {
        return url.split(`/${bucketName}/`)[1];
      } else if (url.includes('/public/')) {
        const parts = url.split('/public/');
        if (parts.length > 1) {
          // Remove bucket name from the beginning if present
          const path = parts[1];
          if (path.startsWith(`${bucketName}/`)) {
            return path.substring(bucketName.length + 1);
          }
          return path;
        }
      }
      return null;
    };

    if (requirementsData?.certification_url) {
      const path = extractFilePath((requirementsData as { certification_url: string }).certification_url, 'attachment');
      if (path) {
        console.log('Adding certification file:', path);
        filesToDelete.push(path);
      }
    }
    if (requirementsData?.school_id_url) {
      const path = extractFilePath((requirementsData as { school_id_url: string }).school_id_url, 'attachment');
      if (path) {
        console.log('Adding school_id file:', path);
        filesToDelete.push(path);
      }
    }
    if (healthData?.student_signature_url) {
      const path = extractFilePath((healthData as { student_signature_url: string }).student_signature_url, 'attachment');
      if (path) {
        console.log('Adding health student signature file:', path);
        filesToDelete.push(path);
      }
    }
    if (healthData?.parent_guardian_signature_url) {
      const path = extractFilePath((healthData as { parent_guardian_signature_url: string }).parent_guardian_signature_url, 'attachment');
      if (path) {
        console.log('Adding health parent signature file:', path);
        filesToDelete.push(path);
      }
    }
    if (consentsData?.student_signature_url) {
      const path = extractFilePath((consentsData as { student_signature_url: string }).student_signature_url, 'attachment');
      if (path) {
        console.log('Adding consent student signature file:', path);
        filesToDelete.push(path);
      }
    }
    if (consentsData?.parent_guardian_signature_url) {
      const path = extractFilePath((consentsData as { parent_guardian_signature_url: string }).parent_guardian_signature_url, 'attachment');
      if (path) {
        console.log('Adding consent parent signature file:', path);
        filesToDelete.push(path);
      }
    }
    if (endorsementData?.signature_url) {
      const path = extractFilePath((endorsementData as { signature_url: string }).signature_url, 'attachment');
      if (path) {
        console.log('Adding endorsement signature file:', path);
        filesToDelete.push(path);
      }
    }

    // Delete files from attachment storage
    if (filesToDelete.length > 0) {
      console.log('Attempting to delete attachment files:', filesToDelete);
      const { data: deleteData, error: storageError } = await supabase.storage
        .from('attachment')
        .remove(filesToDelete);

      if (storageError) {
        console.error('Error deleting files from attachment storage:', storageError);
        console.error('Attachment storage error details:', JSON.stringify(storageError));
        // Continue with database deletion even if storage deletion fails
      } else {
        console.log('Successfully deleted attachment files:', deleteData);
      }
    } else {
      console.log('No attachment files to delete');
    }

    // Delete QR code files from qr-codes storage
    if (qrFilesToDelete.length > 0) {
      console.log('Attempting to delete QR files:', qrFilesToDelete);
      const { data: deleteData, error: qrStorageError } = await supabase.storage
        .from('qr-codes')
        .remove(qrFilesToDelete);

      if (qrStorageError) {
        console.error('Error deleting QR code from storage:', qrStorageError);
        console.error('QR Storage error details:', JSON.stringify(qrStorageError));
        // Continue with database deletion even if storage deletion fails
      } else {
        console.log('Successfully deleted QR files:', deleteData);
      }
    } else {
      console.log('No QR files to delete');
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
