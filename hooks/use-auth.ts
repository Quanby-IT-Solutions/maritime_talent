import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getSession } from '@/lib/api-service';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get current user from session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await getSession();
        setUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use custom database authentication (not Supabase Auth)
      const data = await apiLogin(email, password);
      setUser(data.user);
      
      // Store user in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiLogout();
      setUser(null);
      localStorage.removeItem('user');
      router.push('/login');
      router.refresh();
      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement custom registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login');
      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    register,
    isAuthenticated: !!user
  };
};