import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// POST /api/auth/change-password
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated by checking the session cookie
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      console.log('[Change Password API] No session token found');
      return Response.json(
        { error: 'Unauthorized: Please log in to change your password' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let payload;
    try {
      const decoded = await jwtVerify(sessionToken, JWT_SECRET);
      payload = decoded.payload;
    } catch (error) {
      console.error('[Change Password API] Invalid session token:', error);
      return Response.json(
        { error: 'Invalid session token' },
        { status: 401 }
      );
    }

    // Get user from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: dbUser, error } = await supabase
      .from('users')
      .select('user_id, email, full_name, role, password_hash') // Only select necessary fields
      .eq('user_id', payload.userId)
      .single();

    if (error || !dbUser) {
      console.log('[Change Password API] User not found in database:', error);
      return Response.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmNewPassword }: ChangePasswordRequest = await request.json();

    // Validate request body
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return Response.json(
        { error: 'Missing required fields: currentPassword, newPassword, confirmNewPassword' },
        { status: 400 }
      );
    }

    // Check that new passwords match
    if (newPassword !== confirmNewPassword) {
      return Response.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    // Check password length
    if (newPassword.length < 6) {
      return Response.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // In a real implementation, you would call your backend API to verify the current password
    // and update with the new password in the database
    // For now, I'll implement the direct database update using Supabase
    const changePasswordResult = await changePasswordInDatabase(
      dbUser.user_id,
      currentPassword,
      newPassword,
      dbUser.password_hash // Use the correct field name from the database
    );

    if (!changePasswordResult.success) {
      return Response.json(
        { error: changePasswordResult.error || 'Failed to change password' },
        { status: 400 }
      );
    }

    return Response.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Change password error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Function to change password in database
// This implementation assumes you have access to bcrypt for password hashing

async function changePasswordInDatabase(
  userId: string,
  currentPassword: string,
  newPassword: string,
  storedHashedPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the current password against the stored hashed password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedHashedPassword);
    
    if (!isCurrentPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash the new password
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database using Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('users')
      .update({ password_hash: newHashedPassword }) // Update the correct field name
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating password:', error);
      return { success: false, error: 'Failed to update password in database' };
    }

    console.log(`Password updated successfully for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error in changePasswordInDatabase:', error);
    return { success: false, error: 'Internal server error during password change' };
  }
}