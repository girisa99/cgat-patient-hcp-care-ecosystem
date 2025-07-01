
import React, { createContext, useContext, ReactNode } from 'react';
import { useCleanAuth } from '@/hooks/useCleanAuth';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/hooks/useCleanAuth';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userRoles: string[];
  session: Session | null;
  isLoading: boolean;
  loading: boolean; // alias for compatibility
  isAuthenticated: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string; user?: User }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface CleanAuthProviderProps {
  children: ReactNode;
}

export const CleanAuthProvider: React.FC<CleanAuthProviderProps> = ({ children }) => {
  const auth = useCleanAuth();

  const contextValue: AuthContextType = {
    ...auth,
    loading: auth.isLoading, // alias for compatibility  
    initialized: !auth.isLoading // Consider initialized when not loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within a CleanAuthProvider');
  }
  return context;
};
