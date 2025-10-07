// Optimized auth hook using TanStack Query
import { useSession, useLogin, useLogout, useRegister } from '@/lib/auth-queries';

export const useAuth = () => {
  // Use TanStack Query hooks for data fetching and mutations
  const { data: user, isLoading: sessionLoading, error: sessionError } = useSession();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();

  // Login handler
  const handleLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Logout failed' };
    }
  };

  // Register handler
  const handleRegister = async (email: string, password: string, name?: string) => {
    try {
      await registerMutation.mutateAsync({ email, password, name });
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  return {
    user,
    loading: sessionLoading || loginMutation.isPending || logoutMutation.isPending || registerMutation.isPending,
    error: sessionError?.message || loginMutation.error?.message || logoutMutation.error?.message || registerMutation.error?.message || null,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    isAuthenticated: !!user,
    // Expose mutation states for granular control
    loginState: {
      isPending: loginMutation.isPending,
      isError: loginMutation.isError,
      error: loginMutation.error,
    },
    logoutState: {
      isPending: logoutMutation.isPending,
      isError: logoutMutation.isError,
      error: logoutMutation.error,
    },
  };
};