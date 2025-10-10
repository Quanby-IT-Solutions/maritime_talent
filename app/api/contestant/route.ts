import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import * as QRCode from 'qrcode';
import type { PerformerFormData, EmailRecipient } from '@/types/contestant';

const BUCKET_NAME = 'attachment';
const QR_BUCKET_NAME = 'qr-codes';

// Helper function to sanitize folder/file names
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

// Helper function to upload file to Supabase Storage
async function uploadFileToStorage(
  supabase: ReturnType<typeof createServerClient>,
  file: File,
  folder: string,
  fileName: string,
  bucketName: string = BUCKET_NAME
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `${folder}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Helper function to upload base64 signature to storage
async function uploadSignatureToStorage(
  supabase: ReturnType<typeof createServerClient>,
  base64Data: string,
  folder: string,
  fileName: string,
  bucketName: string = BUCKET_NAME
): Promise<string> {
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64String, 'base64');
  const filePath = `${folder}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload signature: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Helper function to generate and upload QR code
async function generateAndUploadQRCode(
  supabase: ReturnType<typeof createServerClient>,
  studentId: string,
  type: 'contestant_single' | 'contestant_group',
  studentName: string,
  performanceTitle?: string,
  groupName?: string
): Promise<string> {
  // QR code payload is always the student_id
  const payload = studentId;
  const pngBuffer = await QRCode.toBuffer(payload, { type: 'png', width: 512 });
  
  const sanitizedStudentName = sanitizeName(studentName);
  const fileName = `${studentId}_${sanitizedStudentName}.png`;
  
  let filePath: string;
  if (type === 'contestant_single') {
    // single/[PerformanceTitle]/[FullName]/file.png
    const sanitizedPerformanceTitle = sanitizeName(performanceTitle || 'Untitled');
    filePath = `single/${sanitizedPerformanceTitle}/${sanitizedStudentName}/${fileName}`;
  } else {
    // group/[GroupName]/member/[FullName]/file.png
    const sanitizedGroupName = sanitizeName(groupName || 'Untitled');
    filePath = `group/${sanitizedGroupName}/member/${sanitizedStudentName}/${fileName}`;
  }

  const { error: uploadError } = await supabase.storage
    .from(QR_BUCKET_NAME)
    .upload(filePath, pngBuffer, { contentType: 'image/png', upsert: true });

  if (uploadError) {
    throw new Error(`Failed to upload QR code: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(QR_BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Helper function to send QR code email
async function sendQRCodeEmail(
  recipients: EmailRecipient[]
): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/send-qr-emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

// Helper function to process performer files and signatures
async function processPerformerFiles(
  supabase: ReturnType<typeof createServerClient>,
  performer: PerformerFormData,
  folder: string,
  timestamp: number
) {
  const urls = {
    certificationUrl: null as string | null,
    schoolIdUrl: null as string | null,
    studentSigUrl: null as string | null,
    parentSigUrl: null as string | null,
  };

  if (performer.schoolCertification) {
    urls.certificationUrl = await uploadFileToStorage(
      supabase,
      performer.schoolCertification,
      folder,
      `certification_${timestamp}.${performer.schoolCertification.name.split('.').pop()}`
    );
  }

  if (performer.schoolIdCopy) {
    urls.schoolIdUrl = await uploadFileToStorage(
      supabase,
      performer.schoolIdCopy,
      folder,
      `school_id_${timestamp}.${performer.schoolIdCopy.name.split('.').pop()}`
    );
  }

  if (performer.studentSignature) {
    urls.studentSigUrl = await uploadSignatureToStorage(
      supabase,
      performer.studentSignature,
      folder,
      `student_signature_${timestamp}.png`
    );
  }

  if (performer.parentGuardianSignature) {
    urls.parentSigUrl = await uploadSignatureToStorage(
      supabase,
      performer.parentGuardianSignature,
      folder,
      `parent_signature_${timestamp}.png`
    );
  }

  return urls;
}

// Helper function to insert student and related records
async function insertStudentRecords(
  supabase: ReturnType<typeof createServerClient>,
  performer: PerformerFormData,
  performanceType: string,
  performanceTitle: string,
  performanceDuration: string,
  numberOfPerformers: number,
  urls: {
    certificationUrl: string | null;
    schoolIdUrl: string | null;
    studentSigUrl: string | null;
    parentSigUrl: string | null;
  },
  groupId?: string | null,
  singleId?: string | null
): Promise<string> {
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
      group_id: groupId || null,
      single_id: singleId || null,
    } as any)
    .select()
    .single();

  if (studentError) throw new Error(`Failed to create student: ${studentError.message}`);
  const studentId = (studentData as any).student_id;

  // Insert performance record
  await supabase.from('performances').insert({
    student_id: studentId,
    performance_type: performanceType,
    title: performanceTitle,
    duration: performanceDuration,
    num_performers: numberOfPerformers,
    group_members: null,
  } as any);

  // Insert requirements
  if (urls.certificationUrl || urls.schoolIdUrl) {
    await supabase.from('requirements').insert({
      student_id: studentId,
      certification_url: urls.certificationUrl,
      school_id_url: urls.schoolIdUrl,
    } as any);
  }

  // Insert health & fitness declaration
  await supabase.from('health_fitness').insert({
    student_id: studentId,
    is_physically_fit: performer.healthDeclaration,
    student_signature_url: urls.studentSigUrl,
    parent_guardian_signature_url: urls.parentSigUrl,
  } as any);

  // Insert consent
  await supabase.from('consents').insert({
    student_id: studentId,
    info_correct: performer.informationConsent,
    agree_to_rules: performer.rulesAgreement,
    consent_to_publicity: performer.publicityConsent,
    student_signature_url: urls.studentSigUrl,
    parent_guardian_signature_url: urls.parentSigUrl,
  } as any);

  return studentId;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Parse form data
    const formData = await req.formData();
    
    // Extract performance details
    const rawPerformanceType = formData.get('performanceType') as string;
    const performanceTitle = formData.get('performanceTitle') as string;
    const performanceDuration = formData.get('performanceDuration') as string;
    const numberOfPerformers = parseInt(formData.get('numberOfPerformers') as string);
    const groupMembers = formData.get('groupMembers') as string || null;

    // Validate required fields
    if (!rawPerformanceType || rawPerformanceType.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Performance type is required. Please select a performance type.',
        },
        { status: 400 }
      );
    }

    if (!performanceTitle || performanceTitle.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Performance title is required.',
        },
        { status: 400 }
      );
    }

    // Normalize performance type to match database enum values
    const performanceTypeMap: Record<string, string> = {
      'singing': 'Singing',
      'dancing': 'Dancing',
      'musical instrument': 'Musical Instrument',
      'spoken word/poetry': 'Spoken Word/Poetry',
      'theatrical/drama': 'Theatrical/Drama',
      'other': 'Other',
    };

    const performanceType = performanceTypeMap[rawPerformanceType.toLowerCase()] || rawPerformanceType;
    
    // Extract school endorsement
    const schoolOfficialName = formData.get('schoolOfficialName') as string || null;
    const schoolOfficialPosition = formData.get('schoolOfficialPosition') as string || null;
    
    console.log('School Endorsement Data:', { schoolOfficialName, schoolOfficialPosition });
    
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

    // Check for duplicate emails in existing registrations
    const allEmails = performers.map((p: any) => p.email);
    const { data: existingStudents, error: emailCheckError } = await supabase
      .from('students')
      .select('email')
      .in('email', allEmails);
    
    if (emailCheckError) {
      console.error('Email check error:', emailCheckError);
    }
    
    if (existingStudents && existingStudents.length > 0) {
      const duplicateEmails = existingStudents.map((student: any) => student.email);
      throw new Error(`Email address already registered: ${duplicateEmails.join(', ')}`);
    }

    let groupId: string | null = null;
    let singleId: string | null = null;
    let qrCodeUrl: string = '';
    let leadEmail: string = '';
    let leadName: string = '';
    const memberQrCodes: Array<{ email: string; name: string; qrCodeUrl: string }> = [];

    if (isGroup) {
      // Create group entry
      const performersNamesList = performers.map(p => p.fullName).join(', ');
      const groupName = `${performanceTitle} Group`;
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          group_name: groupName,
          performance_title: performanceTitle,
          performance_type: performanceType,
        } as any)
        .select()
        .single();

      if (groupError) throw new Error(`Failed to create group: ${groupError.message}`);
      groupId = (groupData as any).group_id;

      // Process each performer in the group
      for (let i = 0; i < performers.length; i++) {
        const performer = performers[i];
        const timestamp = Date.now();
        const sanitizedName = sanitizeName(performer.fullName);
        const sanitizedPerformanceTitle = sanitizeName(performanceTitle);
        // Attachment folder: group/[GroupName]/member/[FullName]/
        const performerFolder = `group/${sanitizedPerformanceTitle}/member/${sanitizedName}`;

        // Process files and signatures
        const urls = await processPerformerFiles(supabase, performer, performerFolder, timestamp);

        // Insert student and related records
        const studentId = await insertStudentRecords(
          supabase,
          performer,
          performanceType,
          performanceTitle,
          performanceDuration,
          numberOfPerformers,
          urls,
          groupId
        );

        // Add student to group_members table
        const isLeader = i === 0;
        await supabase.from('group_members').insert({
          group_id: groupId,
          student_id: studentId,
          is_leader: isLeader,
        } as any);

        // Generate individual QR code for each member
        const memberQrCodeUrl = await generateAndUploadQRCode(
          supabase, 
          studentId, 
          'contestant_group', 
          performer.fullName,
          performanceTitle,
          groupName
        );

        // Insert QR code record for each member, linked to student
        await supabase.from('qr_codes').insert({
          qr_code_url: memberQrCodeUrl,
          group_id: groupId,
        } as any);
        
        // Update student record with qr_id
        const { data: qrData } = await supabase
          .from('qr_codes')
          .select('qr_id')
          .eq('qr_code_url', memberQrCodeUrl)
          .single();
        
        if (qrData) {
          await (supabase as any)
            .from('students')
            .update({ qr_id: (qrData as any).qr_id })
            .eq('student_id', studentId);
        }

        // Store member QR code info
        memberQrCodes.push({
          email: performer.email,
          name: performer.fullName,
          qrCodeUrl: memberQrCodeUrl
        });

        // Set leader email and name
        if (isLeader) {
          leadEmail = performer.email;
          leadName = performer.fullName;
          qrCodeUrl = memberQrCodeUrl; // Set the leader's QR as the main one
        }
      }

      // Insert school endorsement if provided
      console.log('Attempting to insert group endorsement:', { schoolOfficialName, schoolOfficialPosition });
      if (schoolOfficialName && schoolOfficialPosition) {
        // Get the leader's student_id from group_members
        const { data: groupMemberData, error: leaderError } = await supabase
          .from('group_members')
          .select('student_id')
          .eq('group_id', groupId as any)
          .eq('is_leader', true)
          .limit(1)
          .single();

        console.log('Leader data:', groupMemberData, 'Error:', leaderError);

        if (groupMemberData) {
          const endorsementData = {
            student_id: (groupMemberData as any).student_id,
            official_name: schoolOfficialName,
            position: schoolOfficialPosition,
          };
          console.log('Inserting group endorsement:', endorsementData);
          
          const { error: endorsementError } = await supabase.from('endorsements').insert(endorsementData as any);
          
          if (endorsementError) {
            console.error('Failed to insert group endorsement:', endorsementError);
          } else {
            console.log('Group endorsement inserted successfully');
          }
        }
      } else {
        console.log('Skipping group endorsement - missing data');
      }

    } else {
      // Single performer
      const performer = performers[0];
      const timestamp = Date.now();
      const sanitizedName = sanitizeName(performer.fullName);
      const sanitizedPerformanceTitle = sanitizeName(performanceTitle);

      // Create single entry first
      const { data: singleData, error: singleError } = await supabase
        .from('singles')
        .insert({
          performance_title: performanceTitle,
          performance_type: performanceType,
        } as any)
        .select()
        .single();

      if (singleError) throw new Error(`Failed to create single entry: ${singleError.message}`);
      singleId = (singleData as any).single_id;

      // Attachment folder: single/[PerformanceTitle]/[FullName]/
      const performerFolder = `single/${sanitizedPerformanceTitle}/${sanitizedName}`;

      // Process files and signatures
      const urls = await processPerformerFiles(supabase, performer, performerFolder, timestamp);

      // Insert student and related records
      const studentId = await insertStudentRecords(
        supabase,
        performer,
        performanceType,
        performanceTitle,
        performanceDuration,
        numberOfPerformers,
        urls,
        null,
        singleId
      );

      // Update single entry with student_id
      const { error: updateError } = await (supabase as any)
        .from('singles')
        .update({ student_id: studentId })
        .eq('single_id', singleId);
      
      if (updateError) throw new Error(`Failed to update single entry: ${updateError.message}`);

      leadEmail = performer.email;
      leadName = performer.fullName;

      // Insert school endorsement if provided
      console.log('Attempting to insert single endorsement:', { schoolOfficialName, schoolOfficialPosition, studentId });
      if (schoolOfficialName && schoolOfficialPosition) {
        const endorsementData = {
          student_id: studentId,
          official_name: schoolOfficialName,
          position: schoolOfficialPosition,
        };
        console.log('Inserting single endorsement:', endorsementData);
        
        const { error: endorsementError } = await supabase.from('endorsements').insert(endorsementData as any);
        
        if (endorsementError) {
          console.error('Failed to insert single endorsement:', endorsementError);
        } else {
          console.log('Single endorsement inserted successfully');
        }
      } else {
        console.log('Skipping single endorsement - missing data');
      }

      // Generate QR code for single
      if (!singleId) throw new Error('Single ID is required');
      qrCodeUrl = await generateAndUploadQRCode(
        supabase, 
        studentId, 
        'contestant_single', 
        performer.fullName,
        performanceTitle
      );

      // Insert QR code record
      await supabase.from('qr_codes').insert({
        qr_code_url: qrCodeUrl,
        single_id: singleId,
      } as any);
      
      // Update student record with qr_id
      const { data: qrData } = await supabase
        .from('qr_codes')
        .select('qr_id')
        .eq('qr_code_url', qrCodeUrl)
        .single();
      
      if (qrData) {
        await (supabase as any)
          .from('students')
          .update({ qr_id: (qrData as any).qr_id })
          .eq('student_id', studentId);
      }
    }

    // Prepare email recipients
    let emailRecipients: EmailRecipient[];
    
    if (isGroup) {
      // For groups, send individual QR codes to each member
      emailRecipients = memberQrCodes.map(member => ({
        email: member.email,
        name: member.name,
        qrCodeUrl: member.qrCodeUrl,
        userType: 'contestant_group' as const
      }));
    } else {
      // For singles, send the single QR code
      emailRecipients = [{
        email: performers[0].email,
        name: performers[0].fullName,
        qrCodeUrl,
        userType: 'contestant_single' as const
      }];
    }
    
    // Send QR code emails
    const emailSent = await sendQRCodeEmail(emailRecipients);

    return NextResponse.json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        isGroup,
        groupId,
        singleId,
        qrCodeUrl,
        emailSent,
        emailRecipients: emailRecipients.map(recipient => ({
          email: recipient.email,
          name: recipient.name
        })),
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
