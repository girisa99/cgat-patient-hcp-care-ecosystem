
import React, { createContext, useContext, ReactNode } from 'react';
import { useCleanAuth } from '@/hooks/useCleanAuth';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/hooks/useCleanAuth';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userRoles: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface CleanAuthProviderProps {
  children: ReactNode;
}

export const CleanAuthProvider: React.FC<CleanAuthProviderProps> = ({ children }) => {
  const auth = useCleanAuth();

  return (
    <AuthContext.Provider value={auth}>
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
