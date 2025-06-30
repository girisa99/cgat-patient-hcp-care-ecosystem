
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
  isAuthenticated: boolean;
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
      console.log('🔄 Refreshing user data for authenticated session');
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
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 Auth state change:', {
          event,
          hasSession: !!newSession,
          hasUser: !!newSession?.user,
          userEmail: newSession?.user?.email
        });
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          console.log('✅ Valid session, fetching user data...');
          const [roles, profileData] = await Promise.all([
            fetchUserRoles(newSession.user.id),
            fetchUserProfile(newSession.user.id)
          ]);
          if (mounted) {
            setUserRoles(roles);
            setProfile(profileData);
          }
        } else {
          console.log('⚠️ No valid session, clearing user data');
          if (mounted) {
            setUserRoles([]);
            setProfile(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        // Set a maximum loading time
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 10000);
        });

        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session: initialSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('🔄 Initial session check:', {
          hasSession: !!initialSession,
          hasUser: !!initialSession?.user,
          userEmail: initialSession?.user?.email
        });

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('✅ Valid initial session found, fetching user data...');
            const [roles, profileData] = await Promise.all([
              fetchUserRoles(initialSession.user.id),
              fetchUserProfile(initialSession.user.id)
            ]);
            if (mounted) {
              setUserRoles(roles);
              setProfile(profileData);
            }
          } else {
            console.log('⚠️ No valid initial session found');
            if (mounted) {
              setUserRoles([]);
              setProfile(null);
            }
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      console.log('🔄 AuthProvider: Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!(session && user);

  const value = {
    user,
    session,
    userRoles,
    loading,
    signOut,
    profile,
    refreshUserData,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
