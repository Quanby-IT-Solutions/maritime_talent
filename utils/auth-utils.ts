// Auth utility functions for use across the app
import { QueryClient } from '@tanstack/react-query';
import { authKeys, User } from '@/lib/auth-queries';

/**
 * Prefetch user session - useful for server components or initial page loads
 */
export async function prefetchSession(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      if (!res.ok) return null;
      const data = await res.json();
      return data.user as User | null;
    },
  });
}

/**
 * Get cached user from query client (synchronous)
 */
export function getCachedUser(queryClient: QueryClient): User | null {
  return queryClient.getQueryData(authKeys.session()) || null;
}

/**
 * Invalidate auth cache - useful after external auth changes
 */
export function invalidateAuth(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: authKeys.all });
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: string): boolean {
  return user?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: string[]): boolean {
  return user ? roles.includes(user.role) : false;
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  return user?.full_name || user?.email || 'Guest';
}
