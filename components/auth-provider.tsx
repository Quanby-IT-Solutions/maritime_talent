'use client';

import { ReactNode } from 'react';
import { useSession } from '@/lib/auth-queries';
import { createContext, useContext } from 'react';
import { User } from '@/lib/auth-queries';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use TanStack Query for session management
  const { data: user, isLoading: loading } = useSession();

  return (
    <AuthContext.Provider value={{ user: user || null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}