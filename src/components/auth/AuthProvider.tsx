
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: UserRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  profile: any | null;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRoles: [],
  loading: true,
  signOut: async () => {},
  profile: null,
  refreshUserData: async () => {},
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log('🔍 Fetching user roles for:', userId);
      
      const { data: userRoleData, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching user roles:', error);
        return [];
      }

      const roles = userRoleData?.map(ur => ur.roles?.name).filter(Boolean) as UserRole[] || [];
      console.log('✅ User roles fetched:', roles);
      return roles;
    } catch (error) {
      console.error('❌ Exception fetching user roles:', error);
      return [];
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching user profile:', error);
        return null;
      }

      console.log('✅ User profile fetched:', profileData);
      return profileData;
    } catch (error) {
      console.error('❌ Exception fetching user profile:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (session?.user) {
      const [roles, profileData] = await Promise.all([
        fetchUserRoles(session.user.id),
        fetchUserProfile(session.user.id)
      ]);
      setUserRoles(roles);
      setProfile(profileData);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
        throw error;
      }
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider: Setting up auth state listener...');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email, 'Access token present:', !!session?.access_token);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && session?.access_token) {
          console.log('✅ Valid session with access token, fetching user data...');
          // Fetch user roles and profile when user is authenticated
          const [roles, profileData] = await Promise.all([
            fetchUserRoles(session.user.id),
            fetchUserProfile(session.user.id)
          ]);
          setUserRoles(roles);
          setProfile(profileData);
        } else {
          console.log('⚠️ No session or access token, clearing user data');
          setUserRoles([]);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔄 AuthProvider: Initial session check:', session?.user?.email, 'Access token present:', !!session?.access_token);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && session?.access_token) {
        console.log('✅ Initial session valid, fetching user data...');
        Promise.all([
          fetchUserRoles(session.user.id),
          fetchUserProfile(session.user.id)
        ]).then(([roles, profileData]) => {
          setUserRoles(roles);
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        console.log('⚠️ No initial session or access token');
        setLoading(false);
      }
    });

    return () => {
      console.log('🔄 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    userRoles,
    loading,
    signOut,
    profile,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
