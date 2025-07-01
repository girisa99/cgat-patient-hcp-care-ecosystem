
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: Database['public']['Enums']['user_role'];
  facility_id?: string;
  created_at?: string;
  updated_at?: string;
};

type UserRole = Database['public']['Enums']['user_role'];

interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export const useCleanAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('👤 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return null;
      }

      console.log('✅ Profile fetched successfully:', data);
      return data as Profile;
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return null;
    }
  };

  const fetchUserRoles = async (userId: string): Promise<string[]> => {
    try {
      console.log('🔐 Fetching roles for user:', userId);
      
      // Use the has_role function to avoid infinite recursion
      const { data: isSuperAdmin } = await supabase.rpc('has_role', {
        user_id: userId,
        role_name: 'superAdmin'
      });

      const { data: isOnboardingTeam } = await supabase.rpc('has_role', {
        user_id: userId,
        role_name: 'onboardingTeam'
      });

      const roles = [];
      if (isSuperAdmin) roles.push('superAdmin');
      if (isOnboardingTeam) roles.push('onboardingTeam');

      console.log('✅ Roles fetched successfully:', roles);
      return roles;
    } catch (error) {
      console.error('❌ Roles fetch error:', error);
      return [];
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      console.log('🔄 Attempting sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Sign in successful');
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, role: UserRole): Promise<AuthResult> => {
    try {
      console.log('🔄 Attempting sign up...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Sign up successful');
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    try {
      console.log('🔄 Attempting sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Sign out successful');
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRoles([]);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    console.log('🔄 Initializing authentication...');
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('✅ User session found:', session.user.id);
          setUser(session.user);
          setSession(session);
          
          setTimeout(async () => {
            const [profileData, rolesData] = await Promise.all([
              fetchProfile(session.user.id),
              fetchUserRoles(session.user.id)
            ]);
            
            setProfile(profileData);
            setUserRoles(rolesData);
          }, 0);
        } else {
          console.log('ℹ️ No user session found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event);
        
        if (session) {
          console.log('✅ User session found:', session.user.id);
          setUser(session.user);
          setSession(session);
          
          setTimeout(async () => {
            const [profileData, rolesData] = await Promise.all([
              fetchProfile(session.user.id),
              fetchUserRoles(session.user.id)
            ]);
            
            setProfile(profileData);
            setUserRoles(rolesData);
          }, 0);
        } else {
          console.log('ℹ️ No user session');
          setUser(null);
          setSession(null);
          setProfile(null);
          setUserRoles([]);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    profile,
    userRoles,
    signIn,
    signUp,
    signOut,
  };
};
