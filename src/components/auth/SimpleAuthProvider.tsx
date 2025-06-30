
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: UserRole[];
  loading: boolean;
  signOut: () => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  profile: any | null;
  refreshUserData: () => Promise<void>;
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
  refreshUserData: async () => {},
  isAuthenticated: false,
  initialized: false,
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within SimpleAuthProvider');
  }
  return context;
};

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSimpleAuth();

  const refreshUserData = async () => {
    if (auth.session?.user) {
      console.log('🔄 Refreshing user data');
      window.location.reload();
    }
  };

  const value = {
    ...auth,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
