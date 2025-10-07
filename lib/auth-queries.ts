// TanStack Query hooks for authentication
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, logout as apiLogout, getSession } from '@/lib/api-service';
import { useRouter } from 'next/navigation';

// Query keys for cache management
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

// Hook to get current session/user
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      console.log('[useSession] Fetching session...');
      const data = await getSession();
      console.log('[useSession] getSession returned:', data);
      console.log('[useSession] user from data:', data.user);
      return data.user as User | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

// Hook for login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const data = await apiLogin(credentials.email, credentials.password);
      return data as AuthResponse;
    },
    onSuccess: (data) => {
      // Update the session cache with the new user
      queryClient.setQueryData(authKeys.session(), data.user);
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Invalidate and refetch session to ensure sync
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
    },
  });
}

// Hook for logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiLogout();
    },
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      
      // Clear localStorage
      localStorage.removeItem('user');
      
      // Redirect to login
      router.push('/login');
      router.refresh();
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
    },
  });
}

// Hook for registration mutation
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { email: string; password: string; name?: string }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      return result;
    },
    onSuccess: () => {
      router.push('/login');
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
    },
  });
}
