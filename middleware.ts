import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;
  let isAuthenticated = false;

  console.log('[Middleware] Path:', request.nextUrl.pathname);
  console.log('[Middleware] Session token exists:', !!sessionToken);

  // Verify JWT token
  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, JWT_SECRET);
      isAuthenticated = true;
      console.log('[Middleware] Token verified successfully');
    } catch (error) {
      // Token is invalid or expired
      console.log('[Middleware] Token verification failed:', error);
      isAuthenticated = false;
    }
  }

  // Define protected paths (admin routes)
  const isProtectedPath = request.nextUrl.pathname.startsWith('/admin')

  // For protected paths, check if user is authenticated
  if (isProtectedPath && !isAuthenticated) {
    console.log('[Middleware] Redirecting to login - protected path without auth');
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `next=${encodeURIComponent(request.nextUrl.pathname)}`
    return NextResponse.redirect(url)
  }

  // If user is on login page and already has a session, redirect to admin dashboard
  if (request.nextUrl.pathname === '/login' && isAuthenticated) {
    console.log('[Middleware] Redirecting to admin - already authenticated');
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  console.log('[Middleware] Allowing request to proceed');
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}