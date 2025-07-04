
/**
 * DATABASE AUTH PROVIDER
 * Fixed auth context with isLoading property
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  user_roles?: Array<{ role: { name: string } }>;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean; // FIXED: Added missing isLoading property
  userRoles: string[];
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const DatabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // FIXED: Added isLoading state
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    // Mock authenticated user for development
    const mockUser = {
      id: '1',
      email: 'admin@example.com'
    };
    
    const mockProfile = {
      id: '1',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      user_roles: [{ role: { name: 'superAdmin' } }]
    };

    // Simulate loading
    setTimeout(() => {
      setUser(mockUser);
      setProfile(mockProfile);
      setIsAuthenticated(true);
      setUserRoles(['superAdmin']);
      setIsLoading(false); // FIXED: Set loading to false after auth check
    }, 100);
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    setUserRoles([]);
    setIsLoading(false);
  };

  const value = {
    user,
    profile,
    isAuthenticated,
    isLoading, // FIXED: Include isLoading in context value
    userRoles,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
