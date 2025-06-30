
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  department: string | null;
  facility_id: string | null;
}

export const useSimpleAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  const clearAuthState = () => {
    console.log('🧹 Clearing auth state');
    // Clear localStorage completely
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    setUser(null);
    setSession(null);
    setUserRoles([]);
    setProfile(null);
  };

  const fetchUserData = async (userId: string) => {
    try {
      console.log('🔍 Fetching user data for:', userId);
      
      // Fetch user roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (roleError) {
        console.error('❌ Error fetching roles:', roleError);
        setUserRoles([]);
      } else {
        const roles = roleData?.map(ur => ur.roles?.name).filter(Boolean) as UserRole[] || [];
        console.log('✅ User roles:', roles);
        setUserRoles(roles);
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        setProfile(null);
      } else {
        console.log('✅ User profile:', profileData);
        setProfile(profileData);
      }

    } catch (error) {
      console.error('❌ Exception fetching user data:', error);
      setUserRoles([]);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('🔑 Starting sign in for:', email);
    
    try {
      // Clear any existing session first
      clearAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        
        let errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = `Authentication failed. Please check:
• Email address is correct: ${email.trim()}
• Password is correct
• User exists in the system
• Email is confirmed (check Supabase Auth > Users)`;
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        }
        
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { success: false, error: errorMessage };
      }

      if (data.user && data.session) {
        console.log('✅ Sign in successful for user:', data.user.id);
        console.log('📧 User email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
        
        toast({
          title: "Welcome Back",
          description: "Successfully signed in",
        });
        
        // Force page reload to ensure clean state
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        
        return { success: true };
      }

      return { success: false, error: 'Authentication failed - no user or session returned' };
    } catch (error: any) {
      console.error('💥 Sign in exception:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    console.log('🚪 Signing out user...');
    
    try {
      clearAuthState();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('❌ Error signing out:', error);
      }
      
      console.log('✅ User signed out successfully');
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
      
      // Force page reload for clean state
      window.location.href = '/';
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        } else {
          console.log('🔄 Initial session:', !!initialSession);
          console.log('👤 Initial user:', initialSession?.user?.email || 'None');
          
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            
            if (initialSession?.user) {
              await fetchUserData(initialSession.user.id);
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 Auth state change:', event, !!newSession);
        console.log('👤 Session user:', newSession?.user?.email || 'None');
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user && event === 'SIGNED_IN') {
          // Defer data fetching to prevent deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchUserData(newSession.user.id);
            }
          }, 100);
        } else {
          setUserRoles([]);
          setProfile(null);
        }
        
        if (initialized) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const isAuthenticated = !!(session && user);

  return {
    user,
    session,
    userRoles,
    profile,
    loading,
    isAuthenticated,
    initialized,
    signIn,
    signOut
  };
};
