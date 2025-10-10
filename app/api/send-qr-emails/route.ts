import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is not set in environment variables');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Helper function to convert HTML to plain text
function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
    .trim();
}

// Function to fetch image from URL and convert to base64
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return base64;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

// Helper function to get user type label
function getUserTypeLabel(userType: string): string {
  const labels: Record<string, string> = {
    'contestant_single': 'Single Contestant Pass',
    'contestant_group': 'Group Contestant Pass',
    'guest': 'Guest Pass'
  };
  return labels[userType.toLowerCase()] || 'Event Access';
}

// Generate QR code notification email
function generateQRCodeEmail(data: {
  userName: string;
  userType: string;
  qrCodeUrl: string;
}): string {
  const { userName, userType } = data;

  const userTypeLabel = getUserTypeLabel(userType);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Maritime Talent Quest QR Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MARITIME TALENT QUEST 2025</h1>
          <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 16px;">Digital Access Pass</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          <!-- Welcome Message -->
          <div style="margin-bottom: 30px; text-align: center;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Hello ${userName}!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Your personalized QR code for MARITIME TALENT QUEST 2025 is ready. This FREE digital pass will grant you access to the event.
            </p>
          </div>

          <!-- QR Code Display -->
          <div style="background-color: #f8fafc; border: 2px solid #3b82f6; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <div style="margin-bottom: 16px;">
              <h3 style="color: #1e40af; margin: 0; font-size: 18px; font-weight: 600;">Your Digital Access Pass</h3>
            </div>
            <div style="background-color: white; border: 2px dashed #93c5fd; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <!-- In a real implementation, this would be the actual QR code image -->
              <div style="width: 200px; height: 200px; margin: 0 auto; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                <div style="text-align: center; color: #6b7280;">
                  <div style="font-size: 48px; margin-bottom: 8px;">📱</div>
                  <div style="font-size: 14px;">QR Code Image</div>
                  <div style="font-size: 12px; margin-top: 4px;">(Attached to this email)</div>
                </div>
              </div>
            </div>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Present this QR code at the entrance for quick check-in
            </p>
          </div>

          <!-- Instructions -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">How to Use Your QR Code</h3>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
                <li style="margin-bottom: 8px;">📱 <strong>Save the Attachment:</strong> Find the attached QR code image and save it to your phone</li>
                <li style="margin-bottom: 8px;">🚪 <strong>Entrance Access:</strong> Present the QR code at the MARITIME TALENT QUEST entrance hall for authentication</li>
                <li style="margin-bottom: 8px;">⏱️ <strong>Fast Check-in:</strong> Scan the QR code for quick and contactless entry</li>
                <li style="margin-bottom: 8px;">📋 <strong>Multiple Uses:</strong> You can use this QR code throughout the event for various services</li>
                <li style="margin-bottom: 8px;">🔒 <strong>Security:</strong> Keep your QR code private and do not share it with others</li>
                <li>📥 <strong>Backup:</strong> Print a copy or save multiple digital copies as backup</li>
              </ul>
            </div>
          </div>

          <!-- Event Information -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">MARITIME TALENT QUEST 2025 Event Details</h3>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500; width: 120px;">📅 Dates:</span>
                  <span style="color: #1f2937;"></span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500; width: 120px;">📍 Venue:</span>
                  <span style="color: #1f2937;"></span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500; width: 120px;">🕘 Hours:</span>
                  <span style="color: #1f2937;"></span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500; width: 120px;">🎭 Access Type:</span>
                  <span style="color: #1f2937;">${userTypeLabel}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500; width: 120px;">💰 Registration:</span>
                  <span style="color: #10b981; font-weight: bold;">FREE</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="color: #1f2937; margin: 0 0 12px 0;">Need Help?</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">
              If you have any questions about your QR code or MARITIME TALENT QUEST 2025, please contact us:<br>
              <strong>Email:</strong> <a href="mailto:dummyemail@gmail.com" style="color: #2563eb;">dummyemail@gmail.com</a><br>
              <strong>Phone:</strong> +63 123 456 7890
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 MARITIME TALENT QUEST. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send single QR code email
async function sendQRCodeEmail({
  to,
  subject,
  html,
  from,
  qrCodeAttachment,
  userName,
  userType
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  qrCodeAttachment?: {
    content: string; // base64 encoded image
    filename: string;
  };
  userName?: string;
  userType?: string;
}): Promise<boolean> {
  try {
    if (!SENDGRID_API_KEY) {
      console.error('Cannot send email: SENDGRID_API_KEY not configured');
      return false;
    }

    // Generate plain text version of the email
    const plainText = htmlToPlainText(html);

    const msg: any = {
      to,
      from: {
        email: from || 'noreply.maritimetalentquest@gmail.com',
        name: 'MARITIME TALENT QUEST 2025 Team'
      },
      replyTo: 'dummyemail@gmail.com',
      subject,
      content: [
        {
          type: 'text/plain',
          value: plainText
        },
        {
          type: 'text/html',
          value: html
        }
      ],
      // Improved deliverability settings
      trackingSettings: {
        clickTracking: {
          enable: false
        },
        openTracking: {
          enable: false
        }
      },
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      },
      // Add custom headers for tracking
      headers: {
        'X-MTQ-User-Type': userType || 'unknown',
        'X-MTQ-Email-Type': 'qr-code'
      }
    };

    // Add QR code attachment if provided
    if (qrCodeAttachment) {
      msg.attachments = [
        {
          content: qrCodeAttachment.content,
          filename: qrCodeAttachment.filename,
          type: 'image/png',
          disposition: 'attachment'
        }
      ];
    }

    console.log(`Attempting to send QR code email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`User Type: ${userType || 'unknown'}`);

    const result = await sgMail.send(msg);
    console.log(`QR code email sent successfully to ${to}`);
    console.log('SendGrid response:', JSON.stringify(result[0]?.statusCode));
    return true;
  } catch (error) {
    console.error(`Error sending QR code email to ${to}:`, error);
    return false;
  }
}

// POST handler for sending QR code emails
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { recipients, subject, html, from } = await req.json();

    // Validate request data
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required and cannot be empty' },
        { status: 400 }
      );
    }

    const results = {
      totalSent: 0,
      successfulSends: 0,
      failedSends: 0,
      errors: [] as Array<{ email: string; error: string; }>
    };

    // Process emails in batches to avoid rate limiting
    const batchSize = 10; // SendGrid allows up to 1000 recipients per request, but we'll be conservative
    const delayBetweenBatches = 1000; // 1 second delay between batches

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      console.log(`Processing QR code email batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipients.length / batchSize)}`);

      // Process batch in parallel but with controlled concurrency
      const batchPromises = batch.map(async (recipient: any) => {
        try {
          // Validate recipient data
          if (!recipient.email || !recipient.qrCodeUrl) {
            throw new Error('Recipient must have email and qrCodeUrl');
          }

          // Generate QR code email for this recipient
          const emailHTML = generateQRCodeEmail({
            userName: recipient.name || 'Valued Participant',
            userType: recipient.userType || 'Participant',
            qrCodeUrl: recipient.qrCodeUrl
          });

          // Fetch QR code image from Supabase storage and convert to base64 for attachment
          let qrCodeAttachment: { content: string; filename: string } | undefined = undefined;
          try {
            const base64Image = await fetchImageAsBase64(recipient.qrCodeUrl);
            const sanitizedFileName = (recipient.name || 'user').replace(/[^a-zA-Z0-9]/g, '_');
            qrCodeAttachment = {
              content: base64Image,
              filename: `${sanitizedFileName}_MTQ_2025_QR_Code.png`
            };
          } catch (fetchError) {
            console.error(`Failed to fetch QR code image for ${recipient.email}:`, fetchError);
            // Continue without attachment if image fetch fails
          }

          // Send email with QR code attachment
          const success = await sendQRCodeEmail({
            to: recipient.email,
            subject,
            html: emailHTML,
            from,
            userName: recipient.name,
            userType: recipient.userType,
            qrCodeAttachment
          });

          results.totalSent++;

          if (success) {
            results.successfulSends++;
          } else {
            results.failedSends++;
            results.errors.push({
              email: recipient.email,
              error: 'Failed to send email (unknown error)'
            });
          }
        } catch (error) {
          results.totalSent++;
          results.failedSends++;
          results.errors.push({
            email: recipient.email,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        }
      });

      // Wait for batch to complete
      await Promise.allSettled(batchPromises);

      // Delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    console.log(`Bulk QR code email send completed:`, results);
    
    return NextResponse.json({
      success: true,
      message: `Successfully sent ${results.successfulSends} out of ${results.totalSent} emails`,
      results
    });
  } catch (error) {
    console.error('Error in send-qr-emails API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// GET handler (optional - for testing)
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'MARITIME TALENT QUEST 2025 QR Code Email API Endpoint is running' 
  });
}
