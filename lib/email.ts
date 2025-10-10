import sgMail from '@sendgrid/mail';
import QRCode from 'qrcode';

// Initialize SendGrid - will be set when first email is sent
let isInitialized = false;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@manilaegc.com';

function initializeSendGrid() {
  if (!isInitialized) {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set in environment variables');
      return false;
    }
    sgMail.setApiKey(SENDGRID_API_KEY);
    isInitialized = true;
  }
  return true;
}

// Generate high-quality QR code and convert to base64 with MARITIME TALENT QUEST styling
const generateQRCodeAsBase64 = async (data: string): Promise<string> => {
  // First generate the QR code as data URL with custom styling
  const qrCodeDataUrl = await QRCode.toDataURL(data, {
    width: 800,
    margin: 4,
    color: {
      dark: "#0c4a6e", // MARITIME TALENT QUEST deep blue color
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
    type: "image/png",
  });

  // Convert data URL to base64 (remove data:image/png;base64, prefix)
  return qrCodeDataUrl.split(',')[1];
};

// Email service interface
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  templateData?: Record<string, any>;
  userId?: string; // Add userId for QR code generation
}

// Registration email data (Contestant or Guest - FREE)
export interface RegistrationEmailData {
  userEmail: string;
  userName: string;
  userId: string; // Add userId for QR code
  registrationId: string;
  userType: 'contestant_single' | 'contestant_group' | 'guest'; // Single contestant, group contestant, or guest
  eventDate?: string;
  eventVenue?: string;
  eventTime?: string;
  // For group contestants
  groupName?: string;
  groupMembers?: string[];
  performanceTitle?: string;
}

// Helper function to convert HTML to plain text
function htmlToPlainText(html: string): string {
  // Remove HTML tags and decode entities
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

// Send email function
export async function sendEmail({ to, subject, html, from, userId }: EmailData): Promise<boolean> {
  try {
    // Initialize SendGrid with API key
    if (!initializeSendGrid()) {
      console.error('Cannot send email: SENDGRID_API_KEY not configured');
      return false;
    }

    // Generate plain text version of the email
    const plainText = htmlToPlainText(html);

    const msg: any = {
      to,
      from: {
        email: from || SENDGRID_FROM_EMAIL,
        name: 'MARITIME TALENT QUEST 2025 Team'
      },
      replyTo: SENDGRID_FROM_EMAIL,
      subject,
      // Add both HTML and plain text content for better deliverability
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
          enable: false // Disabled - send real emails
        }
      }
    };

    // Generate and attach QR code if userId is provided
    if (userId) {
      try {
        console.log(`Generating QR code for user: ${userId}`);
        const base64Image = await generateQRCodeAsBase64(userId);

        msg.attachments = [
          {
            content: base64Image,
            filename: `MTQ_2025_Conference_Pass_${userId.slice(-8)}.png`,
            type: 'image/png',
            disposition: 'attachment',
            contentId: 'qrcode'
          }
        ];
        console.log('QR code generated and attached successfully');
      } catch (qrError) {
        console.error('Failed to generate QR code, sending email without it:', qrError);
        // Continue sending email without QR code
      }
    }

    console.log(`Attempting to send email to: ${to}`);
    console.log(`Email subject: ${subject}`);
    console.log(`From address: ${msg.from}`);

    const result = await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    console.log('SendGrid response:', JSON.stringify(result[0]?.statusCode));
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Generate registration confirmation email HTML (FREE for Contestant/Guest)
export function generateRegistrationEmail(data: RegistrationEmailData): string {
  const {
    userName,
    registrationId,
    userType,
    eventDate,
    eventVenue,
    eventTime,
    groupName,
    groupMembers,
    performanceTitle
  } = data;

  const userTypeLabel = getUserTypeLabel(userType);
  const isGroup = userType === 'contestant_group';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MARITIME TALENT QUEST 2025 Registration Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MARITIME TALENT QUEST 2025</h1>
          <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 16px;">Registration Confirmation</p>
        </div>

        <!-- Success Message -->
        <div style="padding: 30px; text-align: center; background-color: #f0fdf4; border-bottom: 1px solid #e5e7eb;">
          <div style="width:60px; height:60px; background-color: #10b981; border-radius:50%; margin:0 auto 16px; text-align:center; line-height:60px;">
            <span style="color:#ffffff;font-size:24px;display:inline-block;">✅</span>
          </div>
          <h2 style="color: #059669; margin: 0 0 8px 0; font-size: 24px;">Registration Confirmed!</h2>
          <p style="color: #065f46; margin: 0; font-size: 16px;">Your FREE registration has been successfully confirmed</p>
        </div>

        <!-- Registration Details -->
        <div style="padding: 30px;">
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Registration Details</h3>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Registration ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">${registrationId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Name:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Access Type:</td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #1e40af; font-weight: bold;">${userTypeLabel}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Registration Fee:</td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #10b981; font-weight: bold; font-size: 18px;">FREE</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          ${isGroup && (groupName || performanceTitle || groupMembers) ? `
          <!-- Group Information -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Group Information</h3>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              ${groupName ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 500;">👥 Group Name:</span>
                <span style="color: #1f2937; font-weight: bold; margin-left: 8px;">${groupName}</span>
              </div>
              ` : ''}
              ${performanceTitle ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 500;">🎭 Performance:</span>
                <span style="color: #1f2937; margin-left: 8px;">${performanceTitle}</span>
              </div>
              ` : ''}
              ${groupMembers && groupMembers.length > 0 ? `
              <div>
                <span style="color: #6b7280; font-weight: 500;">👤 Members:</span>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #4b5563;">
                  ${groupMembers.map(member => `<li style="margin-bottom: 4px;">${member}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
            </div>
          </div>
          ` : ''}

          <!-- Event Information -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Event Information</h3>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              <div style="display: grid; gap: 12px;">
                ${eventDate ? `
                <div style="display: flex; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500; width: 120px;">📅 Date:</span>
                  <span style="color: #1f2937;">${eventDate}</span>
                </div>
                ` : ''}
                ${eventVenue ? `
                <div style="display: flex; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500; width: 120px;">📍 Venue:</span>
                  <span style="color: #1f2937;">${eventVenue}</span>
                </div>
                ` : ''}
                ${eventTime ? `
                <div style="display: flex; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500; width: 120px;">🕘 Time:</span>
                  <span style="color: #1f2937;">${eventTime}</span>
                </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- What's Next -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">What's Next?</h3>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 12px 0; color: #059669; font-weight: 500;">
                <strong>✅ You're All Set!</strong>
              </p>
              <p style="margin: 0; color: #065f46; line-height: 1.5;">
                Your QR code will be sent to you shortly. Please check your email for the QR code attachment which you'll need to present at the event entrance.
              </p>
            </div>
          </div>

          <!-- Important Reminders -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Important Reminders</h3>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
                <li style="margin-bottom: 8px;">📱 Save your QR code to your phone for easy access</li>
                <li style="margin-bottom: 8px;">🚪 Present your QR code at the entrance for check-in</li>
                <li style="margin-bottom: 8px;">📧 Check your email for event updates and announcements</li>
                <li style="margin-bottom: 8px;">🆔 Bring a valid ID for verification</li>
                <li>⏰ Arrive early to avoid queues</li>
              </ul>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="color: #1f2937; margin: 0 0 12px 0;">Need Help?</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">
              If you have any questions, please contact us:<br>
              <strong>Email:</strong> <a href="mailto:dummyemail@gmail.com" style="color: #2563eb;">dummyemail@gmail.com</a><br>
              <strong>Phone:</strong> +63 123 456 7890<br>
              <strong>Registration ID:</strong> ${registrationId}
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

// Send registration confirmation email
export async function sendRegistrationEmail(data: RegistrationEmailData): Promise<boolean> {
  const emailHTML = generateRegistrationEmail(data);

  const userTypeLabel = getUserTypeLabel(data.userType);
  const subject = `MARITIME TALENT QUEST 2025 - ${userTypeLabel} Registration Confirmed (FREE)`;

  return await sendEmail({
    to: data.userEmail,
    subject,
    html: emailHTML,
    from: 'noreply@manilaegc.com', // Using your email as sender
    userId: data.userId // Pass userId for QR code generation
  });
}

// Payment status notification email data
export interface PaymentStatusEmailData {
  userEmail: string;
  userName: string;
  conferenceId: string;
  oldStatus: string;
  newStatus: 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  totalAmount: number;
  referenceNumber?: string;
  notes?: string;
  selectedEvents: Array<{
    eventName: string;
    eventDates: Date[];
    eventPrice: number;
  }>;
  userId?: string; // Add userId for QR code generation when payment is CONFIRMED
}

// QR Code email data interface
export interface QRCodeEmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  userName?: string;
  userType?: string;
  userId: string; // Required for QR code generation
}

// Bulk QR code email data
export interface BulkQRCodeEmailData {
  recipients: Array<{
    email: string;
    name?: string;
    userId: string;
    userType?: string;
    qrCodeUrl: string;
  }>;
  subject: string;
  html: string;
  from?: string;
}

// Send QR code notification email
export async function sendQRCodeEmail(data: QRCodeEmailData): Promise<boolean> {
  const { to, subject, html, from, userId } = data;

  try {
    // Generate QR code using the existing functionality in sendEmail
    return await sendEmail({
      to,
      subject,
      html,
      from: from || 'noreply@manilaegc.com',
      userId // Pass userId to generate QR code
    });
  } catch (error) {
    console.error('Error sending QR code email:', error);
    return false;
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

// Generate email subject based on user type
export function generateEmailSubject(userType: string): string {
  const userTypeLabel = getUserTypeLabel(userType);
  return `Your MARITIME TALENT QUEST 2025 ${userTypeLabel} QR Code`;
}
