import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import * as QRCode from 'qrcode';

const BUCKET_NAME = 'attachment';

// Helper function to upload file to Supabase Storage
async function uploadFileToStorage(
  supabase: ReturnType<typeof createServerClient>,
  file: File,
  folder: string,
  fileName: string
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const filePath = `${folder}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Helper function to upload base64 signature to storage
async function uploadSignatureToStorage(
  supabase: ReturnType<typeof createServerClient>,
  base64Data: string,
  folder: string,
  fileName: string
): Promise<string> {
  // Remove data:image/png;base64, prefix if present
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64String, 'base64');
  
  const filePath = `${folder}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload signature: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Helper function to generate and upload QR code with student name
async function generateAndUploadQRCode(
  supabase: ReturnType<typeof createServerClient>,
  id: number,
  type: 'contestant_single' | 'contestant_group',
  studentName?: string
): Promise<string> {
  const payload = JSON.stringify({ type, id });
  const pngBuffer = await QRCode.toBuffer(payload, { type: 'png', width: 512 });

  let dir = type === 'contestant_single' ? 'singles' : 'groups';
  
  // Use student name in filename if provided, otherwise use ID
  let fileName = id + '.png';
  if (studentName) {
    const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    fileName = `${id}_${sanitizedName}.png`;
  }
  
  const filePath = `${dir}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('qr-codes')
    .upload(filePath, pngBuffer, { contentType: 'image/png', upsert: true });

  if (uploadError) {
    throw new Error(`Failed to upload QR code: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('qr-codes')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Helper function to send QR code email
async function sendQRCodeEmail(
  email: string,
  name: string,
  qrCodeUrl: string,
  userType: string,
  additionalRecipients?: Array<{email: string, name: string, qrCodeUrl: string, userType: string}>
) {
  try {
    const recipients = [
      {
        email,
        name,
        qrCodeUrl,
        userType,
      },
    ];
    
    // Add additional recipients if provided (for group registrations)
    if (additionalRecipients && additionalRecipients.length > 0) {
      recipients.push(...additionalRecipients);
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-qr-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients,
        subject: 'Your Maritime Talent Quest 2025 QR Code',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send QR code email:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending QR code email:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Parse form data
    const formData = await req.formData();
    
    // Extract performance details
    const performanceType = formData.get('performanceType') as string;
    const performanceTitle = formData.get('performanceTitle') as string;
    const performanceDuration = formData.get('performanceDuration') as string;
    const numberOfPerformers = parseInt(formData.get('numberOfPerformers') as string);
    
    // Determine if it's a group or single performance
    const isGroup = numberOfPerformers >= 2;
    
    // Parse performers data
    const performers = [];
    for (let i = 0; i < numberOfPerformers; i++) {
      const performerData = {
        fullName: formData.get(`performers[${i}].fullName`) as string,
        age: parseInt(formData.get(`performers[${i}].age`) as string),
        gender: formData.get(`performers[${i}].gender`) as string,
        school: formData.get(`performers[${i}].school`) as string,
        courseYear: formData.get(`performers[${i}].courseYear`) as string,
        contactNumber: formData.get(`performers[${i}].contactNumber`) as string,
        email: formData.get(`performers[${i}].email`) as string,
        schoolCertification: formData.get(`performers[${i}].schoolCertification`) as File | null,
        schoolIdCopy: formData.get(`performers[${i}].schoolIdCopy`) as File | null,
        healthDeclaration: formData.get(`performers[${i}].healthDeclaration`) === 'true',
        informationConsent: formData.get(`performers[${i}].informationConsent`) === 'true',
        rulesAgreement: formData.get(`performers[${i}].rulesAgreement`) === 'true',
        publicityConsent: formData.get(`performers[${i}].publicityConsent`) === 'true',
        studentSignature: formData.get(`performers[${i}].studentSignature`) as string,
        signatureDate: formData.get(`performers[${i}].signatureDate`) as string,
        parentGuardianSignature: formData.get(`performers[${i}].parentGuardianSignature`) as string || null,
        schoolOfficialName: formData.get(`performers[${i}].schoolOfficialName`) as string || null,
        schoolOfficialPosition: formData.get(`performers[${i}].schoolOfficialPosition`) as string || null,
      };
      performers.push(performerData);
    }

    let groupId: number | null = null;
    let singleId: number | null = null;
    let qrCodeUrl: string = '';
    let leadEmail: string = '';
    let leadName: string = '';

    if (isGroup) {
      // Create group entry
      const performersNamesList = performers.map(p => p.fullName).join(', ');
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          group_name: `${performanceTitle} Group`,
          performance_title: performanceTitle,
          performance_description: performersNamesList,
        } as any)
        .select()
        .single();

      if (groupError) throw new Error(`Failed to create group: ${groupError.message}`);
      groupId = (groupData as any).group_id;

      // Process each performer in the group
      for (let i = 0; i < performers.length; i++) {
        const performer = performers[i];
        const timestamp = Date.now();
        const sanitizedName = performer.fullName.replace(/[^a-zA-Z0-9]/g, '_');
        const performerFolder = `group_${groupId}/performer_${i + 1}_${sanitizedName}`;

        // Upload files to storage
        let certificationUrl: string | null = null;
        let schoolIdUrl: string | null = null;
        let studentSigUrl: string | null = null;
        let parentSigUrl: string | null = null;

        if (performer.schoolCertification) {
          certificationUrl = await uploadFileToStorage(
            supabase,
            performer.schoolCertification,
            performerFolder,
            `certification_${timestamp}.${performer.schoolCertification.name.split('.').pop()}`
          );
        }

        if (performer.schoolIdCopy) {
          schoolIdUrl = await uploadFileToStorage(
            supabase,
            performer.schoolIdCopy,
            performerFolder,
            `school_id_${timestamp}.${performer.schoolIdCopy.name.split('.').pop()}`
          );
        }

        if (performer.studentSignature) {
          studentSigUrl = await uploadSignatureToStorage(
            supabase,
            performer.studentSignature,
            performerFolder,
            `student_signature_${timestamp}.png`
          );
        }

        if (performer.parentGuardianSignature) {
          parentSigUrl = await uploadSignatureToStorage(
            supabase,
            performer.parentGuardianSignature,
            performerFolder,
            `parent_signature_${timestamp}.png`
          );
        }

        // Insert student record
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .insert({
            full_name: performer.fullName,
            age: performer.age,
            gender: performer.gender,
            school: performer.school,
            course_year: performer.courseYear,
            contact_number: performer.contactNumber,
            email: performer.email,
          } as any)
          .select()
          .single();

        if (studentError) throw new Error(`Failed to create student: ${studentError.message}`);

        const studentId = (studentData as any).student_id;

        // Add student to group_members table
        const isLeader = i === 0;
        await supabase.from('group_members').insert({
          group_id: groupId,
          student_id: studentId,
          is_leader: isLeader,
        } as any);

        // Set leader email and name
        if (isLeader) {
          leadEmail = performer.email;
          leadName = performer.fullName;
        }

        // Insert requirements
        if (certificationUrl || schoolIdUrl) {
          await supabase.from('requirements').insert({
            student_id: studentId,
            certification_url: certificationUrl,
            school_id_url: schoolIdUrl,
          } as any);
        }

        // Insert health & fitness declaration
        await supabase.from('health_fitness').insert({
          student_id: studentId,
          is_physically_fit: performer.healthDeclaration,
          student_signature_url: studentSigUrl,
          parent_guardian_signature_url: parentSigUrl,
        } as any);

        // Insert consent
        await supabase.from('consents').insert({
          student_id: studentId,
          info_correct: performer.informationConsent,
          agree_to_rules: performer.rulesAgreement,
          consent_to_publicity: performer.publicityConsent,
          student_signature_url: studentSigUrl,
          parent_guardian_signature_url: parentSigUrl,
        } as any);

        // Insert performance record
        await supabase.from('performances').insert({
          student_id: studentId,
          performance_type: performanceType as any,
          title: performanceTitle,
          duration: performanceDuration,
          num_performers: numberOfPerformers,
          group_members: null,
        } as any);

        // Insert school endorsement if provided for this performer
        if (performer.schoolOfficialName) {
          await supabase.from('endorsements').insert({
            student_id: studentId,
            school_official_name: performer.schoolOfficialName,
            position: performer.schoolOfficialPosition,
          } as any);
        }
      }

      // Generate QR code for group
      qrCodeUrl = await generateAndUploadQRCode(supabase, groupId as any, 'contestant_group', performers[0]?.fullName || 'group');

      // Insert QR code record for the group
      await supabase.from('qr_codes').insert({
        qr_code_url: qrCodeUrl,
        group_id: groupId,
      } as any);

    } else {
      // Single performer
      const performer = performers[0];
      const timestamp = Date.now();
      const sanitizedName = performer.fullName.replace(/[^a-zA-Z0-9]/g, '_');

      // Create single entry first
      const { data: singleData, error: singleError } = await supabase
        .from('singles')
        .insert({
          performance_title: performanceTitle,
        } as any)
        .select()
        .single();

      if (singleError) throw new Error(`Failed to create single entry: ${singleError.message}`);
      singleId = (singleData as any).single_id;

      const performerFolder = `single_${singleId}_${sanitizedName}`;

      // Upload files to storage
      let certificationUrl: string | null = null;
      let schoolIdUrl: string | null = null;
      let studentSigUrl: string | null = null;
      let parentSigUrl: string | null = null;

      if (performer.schoolCertification) {
        certificationUrl = await uploadFileToStorage(
          supabase,
          performer.schoolCertification,
          performerFolder,
          `certification_${timestamp}.${performer.schoolCertification.name.split('.').pop()}`
        );
      }

      if (performer.schoolIdCopy) {
        schoolIdUrl = await uploadFileToStorage(
          supabase,
          performer.schoolIdCopy,
          performerFolder,
          `school_id_${timestamp}.${performer.schoolIdCopy.name.split('.').pop()}`
        );
      }

      if (performer.studentSignature) {
        studentSigUrl = await uploadSignatureToStorage(
          supabase,
          performer.studentSignature,
          performerFolder,
          `student_signature_${timestamp}.png`
        );
      }

      if (performer.parentGuardianSignature) {
        parentSigUrl = await uploadSignatureToStorage(
          supabase,
          performer.parentGuardianSignature,
          performerFolder,
          `parent_signature_${timestamp}.png`
        );
      }

      // Insert student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          full_name: performer.fullName,
          age: performer.age,
          gender: performer.gender,
          school: performer.school,
          course_year: performer.courseYear,
          contact_number: performer.contactNumber,
          email: performer.email,
        } as any)
        .select()
        .single();

      if (studentError) throw new Error(`Failed to create student: ${studentError.message}`);

      const studentId = (studentData as any).student_id;

      // Update single entry with student_id
      const { error: updateError } = await (supabase as any)
        .from('singles')
        .update({ student_id: studentId })
        .eq('single_id', singleId);
      
      if (updateError) throw new Error(`Failed to update single entry: ${updateError.message}`);

      leadEmail = performer.email;
      leadName = performer.fullName;

      // Insert requirements
      if (certificationUrl || schoolIdUrl) {
        await supabase.from('requirements').insert({
          student_id: studentId,
          certification_url: certificationUrl,
          school_id_url: schoolIdUrl,
        } as any);
      }

      // Insert health & fitness declaration
      await supabase.from('health_fitness').insert({
        student_id: studentId,
        is_physically_fit: performer.healthDeclaration,
        student_signature_url: studentSigUrl,
        parent_guardian_signature_url: parentSigUrl,
      } as any);

      // Insert consent
      await supabase.from('consents').insert({
        student_id: studentId,
        info_correct: performer.informationConsent,
        agree_to_rules: performer.rulesAgreement,
        consent_to_publicity: performer.publicityConsent,
        student_signature_url: studentSigUrl,
        parent_guardian_signature_url: parentSigUrl,
      } as any);

      // Insert performance record
      await supabase.from('performances').insert({
        student_id: studentId,
        performance_type: performanceType as any,
        title: performanceTitle,
        duration: performanceDuration,
        num_performers: numberOfPerformers,
        group_members: null,
      } as any);

      // Insert school endorsement if provided
      if (performer.schoolOfficialName) {
        await supabase.from('endorsements').insert({
          student_id: studentId,
          school_official_name: performer.schoolOfficialName,
          position: performer.schoolOfficialPosition,
        } as any);
      }

      // Generate QR code for single
      qrCodeUrl = await generateAndUploadQRCode(supabase, singleId as any, 'contestant_single', performers[0]?.fullName);

      // Insert QR code record
      await supabase.from('qr_codes').insert({
        qr_code_url: qrCodeUrl,
        single_id: singleId,
      } as any);
    }

    let emailSent = false;
    
    if (isGroup) {
      // Send QR code email to all group members
      const groupEmailRecipients = performers.map(performer => ({
        email: performer.email,
        name: performer.fullName,
        qrCodeUrl,
        userType: 'contestant_group'
      }));
      
      // Send to all group members using the first member as the primary
      emailSent = await sendQRCodeEmail(
        performers[0].email, // Primary email
        performers[0].fullName,
        qrCodeUrl,
        'contestant_group',
        groupEmailRecipients
      );
    } else {
      // Send QR code email to single performer
      emailSent = await sendQRCodeEmail(
        leadEmail,
        leadName,
        qrCodeUrl,
        'contestant_single'
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        isGroup,
        groupId,
        singleId,
        qrCodeUrl,
        emailSent,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Contestant registration API endpoint',
  });
}
