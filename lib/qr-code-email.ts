// This file contains utility functions for generating QR code email HTML
// Email sending is handled server-side via API endpoints

// QR Code email data interface
export interface QRCodeEmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  userName?: string;
  userType?: string;
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
export async function fetchImageAsBase64(imageUrl: string): Promise<string> {
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
  const type = userType.toLowerCase();
  // Based on schema: guests, singles (contestant_single), groups (contestant_group)
  if (type === 'guest') {
    return 'Guest';
  } else if (type === 'contestant_single' || type === 'contestant_group' || type === 'single' || type === 'group') {
    return 'Contestant';
  }
  return 'Guest'; // Default fallback
}

// Generate email for GUEST
function generateGuestEmail(data: {
  userName: string;
}): string {
  const { userName } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Maritime Talent Quest Guest Pass</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MARITIME TALENT QUEST 2025</h1>
          <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 16px;">🎫 Guest Pass</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          <!-- Welcome Message -->
          <div style="margin-bottom: 30px; text-align: center;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Welcome ${userName}!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Thank you for registering as a guest for MARITIME TALENT QUEST 2025. Your FREE digital guest pass is ready!
            </p>
          </div>

          <!-- QR Code Display -->
          <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <div style="margin-bottom: 16px;">
              <h3 style="color: #059669; margin: 0; font-size: 18px; font-weight: 600;">Your Guest Pass QR Code</h3>
            </div>
            <div style="background-color: white; border: 2px dashed #6ee7b7; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <div style="width: 200px; height: 200px; margin: 0 auto; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                <div style="text-align: center; color: #6b7280;">
                  <div style="font-size: 48px; margin-bottom: 8px;">🎫</div>
                  <div style="font-size: 14px;">QR Code Image</div>
                  <div style="font-size: 12px; margin-top: 4px;">(Attached to this email)</div>
                </div>
              </div>
            </div>
            <p style="color: #065f46; margin: 0; font-size: 14px; font-weight: 500;">
              Present this QR code at the entrance for guest check-in
            </p>
          </div>

          <!-- Guest Benefits -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">As a Guest, You Can:</h3>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px;">
              <ul style="margin: 0; padding-left: 20px; color: #065f46; line-height: 1.6;">
                <li style="margin-bottom: 8px;">👀 <strong>Watch Performances:</strong> Enjoy all the amazing talent showcases</li>
                <li style="margin-bottom: 8px;">🎉 <strong>Event Access:</strong> Full access to the event venue and activities</li>
                <li style="margin-bottom: 8px;">📸 <strong>Photo Opportunities:</strong> Capture memorable moments</li>
                <li style="margin-bottom: 8px;">🍽️ <strong>Refreshments:</strong> Access to food and beverage areas</li>
                <li>🎁 <strong>Souvenirs:</strong> Visit our merchandise booth</li>
              </ul>
            </div>
          </div>

          <!-- Instructions -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">How to Use Your Guest Pass</h3>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
                <li style="margin-bottom: 8px;">📱 <strong>Save QR Code:</strong> Download the attached QR code to your phone</li>
                <li style="margin-bottom: 8px;">🚪 <strong>Guest Entrance:</strong> Use the guest entrance at the venue</li>
                <li style="margin-bottom: 8px;">⏱️ <strong>Quick Entry:</strong> Show your QR code for fast check-in</li>
                <li>📥 <strong>Keep Safe:</strong> Save multiple copies as backup</li>
              </ul>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="color: #1f2937; margin: 0 0 12px 0;">Need Help?</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">
              If you have any questions, please contact us:<br>
              <strong>Email:</strong> <a href="mailto:dummyemail@gmail.com" style="color: #10b981;">dummyemail@gmail.com</a><br>
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

// Generate email for SINGLE CONTESTANT
function generateSingleContestantEmail(data: {
  userName: string;
  performanceTitle?: string;
}): string {
  const { userName, performanceTitle } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Maritime Talent Quest Contestant Pass</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MARITIME TALENT QUEST 2025</h1>
          <p style="color: #ede9fe; margin: 8px 0 0 0; font-size: 16px;">🎤 Single Contestant Pass</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          <!-- Welcome Message -->
          <div style="margin-bottom: 30px; text-align: center;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Hello ${userName}!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Congratulations! You're registered as a <strong>Single Contestant</strong> for MARITIME TALENT QUEST 2025. Get ready to showcase your talent!
            </p>
            ${performanceTitle ? `
            <div style="margin-top: 16px; padding: 12px; background-color: #f5f3ff; border-radius: 8px;">
              <p style="margin: 0; color: #6d28d9; font-weight: 600;">
                🎭 Performance: ${performanceTitle}
              </p>
            </div>
            ` : ''}
          </div>

          <!-- QR Code Display -->
          <div style="background-color: #faf5ff; border: 2px solid #a78bfa; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <div style="margin-bottom: 16px;">
              <h3 style="color: #7c3aed; margin: 0; font-size: 18px; font-weight: 600;">Your Contestant Pass QR Code</h3>
            </div>
            <div style="background-color: white; border: 2px dashed #c4b5fd; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <div style="width: 200px; height: 200px; margin: 0 auto; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                <div style="text-align: center; color: #6b7280;">
                  <div style="font-size: 48px; margin-bottom: 8px;">🎤</div>
                  <div style="font-size: 14px;">QR Code Image</div>
                  <div style="font-size: 12px; margin-top: 4px;">(Attached to this email)</div>
                </div>
              </div>
            </div>
            <p style="color: #5b21b6; margin: 0; font-size: 14px; font-weight: 500;">
              Present this QR code for contestant check-in and backstage access
            </p>
          </div>

          <!-- Contestant Benefits -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Your Contestant Benefits:</h3>
            <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px;">
              <ul style="margin: 0; padding-left: 20px; color: #5b21b6; line-height: 1.6;">
                <li style="margin-bottom: 8px;">🎭 <strong>Performance Slot:</strong> Dedicated time for your performance</li>
                <li style="margin-bottom: 8px;">🎬 <strong>Backstage Access:</strong> Exclusive access to preparation areas</li>
                <li style="margin-bottom: 8px;">🎵 <strong>Sound Check:</strong> Pre-event technical rehearsal</li>
                <li style="margin-bottom: 8px;">🏆 <strong>Competition Entry:</strong> Eligible for awards and recognition</li>
                <li style="margin-bottom: 8px;">📸 <strong>Professional Photos:</strong> Official event photography</li>
                <li>🎁 <strong>Contestant Kit:</strong> Special welcome package</li>
              </ul>
            </div>
          </div>

          <!-- Important Reminders -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Important Reminders:</h3>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.6;">
                <li style="margin-bottom: 8px;">⏰ <strong>Arrive Early:</strong> Be at the venue at least 1 hour before your slot</li>
                <li style="margin-bottom: 8px;">🎤 <strong>Bring Equipment:</strong> Bring any personal instruments or props</li>
                <li style="margin-bottom: 8px;">📋 <strong>Check Schedule:</strong> Confirm your performance time</li>
                <li>🆔 <strong>Valid ID:</strong> Bring identification for verification</li>
              </ul>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="color: #1f2937; margin: 0 0 12px 0;">Need Help?</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">
              If you have any questions, please contact us:<br>
              <strong>Email:</strong> <a href="mailto:dummyemail@gmail.com" style="color: #7c3aed;">dummyemail@gmail.com</a><br>
              <strong>Phone:</strong> +63 123 456 7890
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 MARITIME TALENT QUEST. All rights reserved.<br>
            <span style="color: #7c3aed; font-weight: 600;">Break a leg! 🎭</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate email for GROUP CONTESTANT
function generateGroupContestantEmail(data: {
  userName: string;
  groupName?: string;
  performanceTitle?: string;
}): string {
  const { userName, groupName, performanceTitle } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Maritime Talent Quest Group Pass</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #f87171 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MARITIME TALENT QUEST 2025</h1>
          <p style="color: #fee2e2; margin: 8px 0 0 0; font-size: 16px;">👥 Group Contestant Pass</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          <!-- Welcome Message -->
          <div style="margin-bottom: 30px; text-align: center;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Hello ${userName}!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Congratulations! Your group is registered for MARITIME TALENT QUEST 2025. Get ready to shine together!
            </p>
            ${groupName ? `
            <div style="margin-top: 16px; padding: 12px; background-color: #fef2f2; border-radius: 8px;">
              <p style="margin: 0; color: #dc2626; font-weight: 600; font-size: 18px;">
                👥 ${groupName}
              </p>
            </div>
            ` : ''}
            ${performanceTitle ? `
            <div style="margin-top: 12px; padding: 12px; background-color: #fef2f2; border-radius: 8px;">
              <p style="margin: 0; color: #b91c1c; font-weight: 600;">
                🎭 Performance: ${performanceTitle}
              </p>
            </div>
            ` : ''}
          </div>

          <!-- QR Code Display -->
          <div style="background-color: #fef2f2; border: 2px solid #f87171; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <div style="margin-bottom: 16px;">
              <h3 style="color: #dc2626; margin: 0; font-size: 18px; font-weight: 600;">Your Group Pass QR Code</h3>
            </div>
            <div style="background-color: white; border: 2px dashed #fca5a5; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <div style="width: 200px; height: 200px; margin: 0 auto; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                <div style="text-align: center; color: #6b7280;">
                  <div style="font-size: 48px; margin-bottom: 8px;">👥</div>
                  <div style="font-size: 14px;">QR Code Image</div>
                  <div style="font-size: 12px; margin-top: 4px;">(Attached to this email)</div>
                </div>
              </div>
            </div>
            <p style="color: #991b1b; margin: 0; font-size: 14px; font-weight: 500;">
              Present this QR code for group check-in and backstage access
            </p>
          </div>

          <!-- Group Benefits -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Your Group Benefits:</h3>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px;">
              <ul style="margin: 0; padding-left: 20px; color: #991b1b; line-height: 1.6;">
                <li style="margin-bottom: 8px;">🎭 <strong>Group Performance Slot:</strong> Extended time for your group performance</li>
                <li style="margin-bottom: 8px;">🎬 <strong>Group Backstage Area:</strong> Dedicated preparation space for your team</li>
                <li style="margin-bottom: 8px;">🎵 <strong>Group Sound Check:</strong> Full technical rehearsal with all members</li>
                <li style="margin-bottom: 8px;">🏆 <strong>Team Competition:</strong> Eligible for group category awards</li>
                <li style="margin-bottom: 8px;">📸 <strong>Group Photos:</strong> Professional team photography</li>
                <li style="margin-bottom: 8px;">👕 <strong>Group Coordination:</strong> Assistance with group logistics</li>
                <li>🎁 <strong>Group Kit:</strong> Welcome package for all members</li>
              </ul>
            </div>
          </div>

          <!-- Important Reminders for Groups -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Important Group Reminders:</h3>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.6;">
                <li style="margin-bottom: 8px;">⏰ <strong>Arrive Together:</strong> All members should arrive at least 1.5 hours early</li>
                <li style="margin-bottom: 8px;">👥 <strong>Complete Team:</strong> Ensure all group members are present</li>
                <li style="margin-bottom: 8px;">🎤 <strong>Group Equipment:</strong> Bring all instruments, props, and costumes</li>
                <li style="margin-bottom: 8px;">📋 <strong>Coordination:</strong> Designate a group leader for communication</li>
                <li>🆔 <strong>All IDs:</strong> Each member must bring valid identification</li>
              </ul>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="color: #1f2937; margin: 0 0 12px 0;">Need Help?</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">
              If you have any questions, please contact us:<br>
              <strong>Email:</strong> <a href="mailto:dummyemail@gmail.com" style="color: #dc2626;">dummyemail@gmail.com</a><br>
              <strong>Phone:</strong> +63 123 456 7890
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 MARITIME TALENT QUEST. All rights reserved.<br>
            <span style="color: #dc2626; font-weight: 600;">Good luck to your team! 👥🎭</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate QR code notification email - routes to specific template based on user type
export function generateQRCodeEmail(data: {
  userName: string;
  userType: string;
  qrCodeUrl: string;
  groupName?: string;
  performanceTitle?: string;
}): string {
  const { userType } = data;

  // Route to specific email template based on user type
  if (userType.toLowerCase() === 'contestant_single') {
    return generateSingleContestantEmail(data);
  } else if (userType.toLowerCase() === 'contestant_group') {
    return generateGroupContestantEmail(data);
  } else {
    return generateGuestEmail(data);
  }
}

// Generate email subject based on user type
export function generateEmailSubject(userType: string): string {
  const userTypeLabel = getUserTypeLabel(userType);
  return `Your MARITIME TALENT QUEST 2025 ${userTypeLabel} Pass`;
}
