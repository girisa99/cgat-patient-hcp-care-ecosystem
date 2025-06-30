
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { useCleanAuth } from '@/hooks/useCleanAuth';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: UserRole[];
  loading: boolean;
  signOut: () => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  profile: any | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRoles: [],
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
  profile: null,
  isAuthenticated: false,
  initialized: false,
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within CleanAuthProvider');
  }
  return context;
};

export const CleanAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useCleanAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
