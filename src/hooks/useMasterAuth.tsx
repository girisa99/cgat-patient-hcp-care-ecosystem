
/**
 * MASTER AUTHENTICATION HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all authentication functionality across the application
 * Version: master-auth-v1.0.0
 */
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  userRoles: string[];
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useMasterAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔐 Master Auth Hook - Single source of truth for authentication');

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer data fetching to prevent deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRoles(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('👤 Fetching user profile for:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return;
      }

      setProfile(data);
      console.log('✅ Profile loaded:', data);
    } catch (err) {
      console.error('❌ Profile fetch failed:', err);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    console.log('🏷️ Fetching user roles for:', userId);
    try {
      const { data, error } = await supabase
        .rpc('get_user_roles', { check_user_id: userId });

      if (error) {
        console.error('❌ Roles fetch error:', error);
        return;
      }

      const roles = data?.map((r: any) => r.role_name) || [];
      setUserRoles(roles);
      console.log('✅ User roles loaded:', roles);
    } catch (err) {
      console.error('❌ Roles fetch failed:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Signing in user:', email);
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        console.error('❌ Sign in error:', error);
      }

      return { error };
    } catch (err) {
      console.error('❌ Sign in failed:', err);
      setError('Sign in failed');
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('🔐 Signing up user:', email);
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setError(error.message);
        console.error('❌ Sign up error:', error);
      }

      return { error };
    } catch (err) {
      console.error('❌ Sign up failed:', err);
      setError('Sign up failed');
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔐 Signing out user');
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
      } else {
        console.log('✅ User signed out');
      }
    } catch (err) {
      console.error('❌ Sign out failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    console.log('🔐 Resetting password for:', email);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setError(error.message);
        console.error('❌ Password reset error:', error);
      }

      return { error };
    } catch (err) {
      console.error('❌ Password reset failed:', err);
      setError('Password reset failed');
      return { error: err };
    }
  };

  return {
    // Core auth state
    user,
    session,
    profile,
    userRoles,
    isLoading,
    error,
    
    // Auth actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    
    // Utility functions
    fetchUserProfile,
    fetchUserRoles,
    
    // Meta
    meta: {
      hookName: 'useMasterAuth',
      version: 'master-auth-v1.0.0',
      singleSourceValidated: true,
      dataSource: 'supabase-auth-real-data'
    }
  };
};
