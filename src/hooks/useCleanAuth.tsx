
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
  facility_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCleanAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...');
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
        }

        if (mounted) {
          if (initialSession?.user) {
            console.log('✅ Found existing session for user:', initialSession.user.id);
            setUser(initialSession.user);
            setSession(initialSession);
            setIsAuthenticated(true);
          } else {
            console.log('ℹ️ No existing session found');
            setIsAuthenticated(false);
          }
          
          // Always set loading to false after checking session
          setIsLoading(false);
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
        }
      }
    };

    // Set loading timeout as fallback
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('⏰ Loading timeout - forcing loading to false');
        setIsLoading(false);
      }
    }, 3000);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          setIsAuthenticated(true);
          
          // Try to get profile
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileData) {
              setProfile(profileData);
            }
          } catch (profileError) {
            console.warn('⚠️ Could not load profile:', profileError);
          }
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
          setUserRoles([]);
          setIsAuthenticated(false);
        }
        
        if (event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Sign in successful');
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      console.error('💥 Sign in exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, role: string) => {
    try {
      console.log('📝 Attempting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            role: role,
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Sign up successful');
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('💥 Sign up exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Sign out successful');
      return { success: true };
    } catch (error: any) {
      console.error('💥 Sign out exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  return {
    user,
    profile,
    userRoles,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
};
