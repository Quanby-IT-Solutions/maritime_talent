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
      .order('single_id', { ascending: false });

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
      .select('student_id, duration, performance_type');

    console.log('All performances data:', JSON.stringify(performancesData, null, 2));

    // Create a map of student_id to duration
    const durationMap = new Map<string, string>();
    (performancesData || []).forEach((perf: { student_id: string; duration?: string; performance_type?: string }) => {
      if (perf.duration) {
        durationMap.set(perf.student_id, perf.duration);
        console.log(`Added to map - student_id: ${perf.student_id}, duration: ${perf.duration}`);
      } else {
        console.log(`Skipped (no duration) - student_id: ${perf.student_id}`);
      }
    });

    console.log('Duration map size:', durationMap.size);

    // Transform database data to match our expected structure
    const transformedData = (singlesData || []).map((single: {
      single_id: string;
      performance_title?: string;
      student_id: string;
      created_at?: string;
      performance_type?: string;
      students?: { full_name?: string; school?: string } | null;
    }) => {
      // Handle both nested object and direct reference - safely handle null
      const studentData = single.students || {};
      const studentName = studentData?.full_name || "Not assigned";
      const studentSchool = studentData?.school || "Not assigned";

      const duration = durationMap.get(single.student_id) || null;
      console.log(`Single ${single.single_id} - student_id: ${single.student_id}, student_name: ${studentName}, duration from map: ${duration}`);

      // Warn about missing student data
      if (!single.students) {
        console.warn(`⚠️ Single ${single.single_id} (${single.performance_title}) has no student record! student_id: ${single.student_id}`);
      }

      return {
        id: single.single_id,
        single_id: single.single_id,
        performance_title: single.performance_title || "Untitled Performance",
        student_id: single.student_id || null,
        created_at: single.created_at || null,
        student_name: studentName,
        student_school: studentSchool,
        performance_type: single.performance_type || null,
        duration: duration,
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

    const { data, error } = await supabase
      .from('singles')
      .update({
        performance_title,
      } as never)
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

// DELETE - Delete a single performance and all related data including files
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

    // Get student_id and all file URLs before deletion
    const { data: singleData } = await supabase
      .from('singles')
      .select(`
        student_id,
        students:student_id (
          student_id
        )
      `)
      .eq('single_id', single_id)
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
      .eq('single_id', single_id)
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
      const path = extractFilePath(requirementsData.certification_url, 'attachment');
      if (path) {
        console.log('Adding certification file:', path);
        filesToDelete.push(path);
      }
    }
    if (requirementsData?.school_id_url) {
      const path = extractFilePath(requirementsData.school_id_url, 'attachment');
      if (path) {
        console.log('Adding school_id file:', path);
        filesToDelete.push(path);
      }
    }
    if (healthData?.student_signature_url) {
      const path = extractFilePath(healthData.student_signature_url, 'attachment');
      if (path) {
        console.log('Adding health student signature file:', path);
        filesToDelete.push(path);
      }
    }
    if (healthData?.parent_guardian_signature_url) {
      const path = extractFilePath(healthData.parent_guardian_signature_url, 'attachment');
      if (path) {
        console.log('Adding health parent signature file:', path);
        filesToDelete.push(path);
      }
    }
    if (consentsData?.student_signature_url) {
      const path = extractFilePath(consentsData.student_signature_url, 'attachment');
      if (path) {
        console.log('Adding consent student signature file:', path);
        filesToDelete.push(path);
      }
    }
    if (consentsData?.parent_guardian_signature_url) {
      const path = extractFilePath(consentsData.parent_guardian_signature_url, 'attachment');
      if (path) {
        console.log('Adding consent parent signature file:', path);
        filesToDelete.push(path);
      }
    }
    if (endorsementData?.signature_url) {
      const path = extractFilePath(endorsementData.signature_url, 'attachment');
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
    await supabase.from('qr_codes').delete().eq('single_id', single_id);

    // Delete the single performance
    await supabase.from('singles').delete().eq('single_id', single_id);

    // Finally delete the student
    await supabase.from('students').delete().eq('student_id', studentId);

    return NextResponse.json({
      success: true,
      message: 'Single performance and all related data deleted successfully',
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