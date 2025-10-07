import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    console.log('[Session API] Session token exists:', !!sessionToken);

    if (!sessionToken) {
      console.log('[Session API] No session token found');
      return NextResponse.json({ user: null });
    }

    // Verify JWT token
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    console.log('[Session API] JWT payload:', payload);

    // Get user from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', payload.userId)
      .single();

    console.log('[Session API] Database user:', dbUser);
    console.log('[Session API] Database error:', error);

    if (error || !dbUser) {
      console.log('[Session API] User not found in database');
      return NextResponse.json({ user: null });
    }

    const userData = {
      id: dbUser.user_id,
      email: dbUser.email,
      full_name: dbUser.full_name,
      role: dbUser.role
    };

    console.log('[Session API] Returning user data:', userData);

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json({ user: null });
  }
}