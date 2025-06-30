
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuthData } from '@/hooks/auth/useAuthData';
import { AuthStateManager } from '@/utils/auth/authStateManager';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: UserRole[];
  loading: boolean;
  signOut: () => Promise<void>;
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
  profile: null,
  refreshUserData: async () => {},
  isAuthenticated: false,
  initialized: false,
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authData = useAuthData();

  const signOut = async () => {
    try {
      console.log('🚪 Starting secure sign out process...');
      await AuthStateManager.secureSignOut();
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      // Force redirect anyway to ensure user is logged out
      window.location.href = '/';
    }
  };

  // Simplified refresh function
  const refreshUserData = async () => {
    if (authData.session?.user) {
      console.log('🔄 Refreshing user data');
      // The useAuthData hook will handle the refresh automatically
      window.location.reload();
    }
  };

  const value = {
    ...authData,
    signOut,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
