
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

export const useCleanAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Aggressive auth state cleanup
  const forceCleanAuthState = () => {
    console.log('🧹 Force cleaning all auth state...');
    
    // Clear all possible localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('supabase') || key.includes('sb-') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear session storage too
    sessionStorage.clear();
    
    // Reset all state
    setUser(null);
    setSession(null);
    setUserRoles([]);
    setProfile(null);
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('🔑 Starting clean sign in process...');
    
    try {
      // Step 1: Force clean state
      forceCleanAuthState();
      
      // Step 2: Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 3: Global sign out to ensure clean slate
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.log('Sign out error (ignoring):', signOutError);
      }
      
      // Step 4: Wait another moment
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 5: Attempt sign in
      console.log('🔑 Attempting sign in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        console.error('❌ Sign in error details:', {
          message: error.message,
          name: error.name,
          status: error.status
        });
        
        toast({
          title: "Authentication Failed",
          description: error.message,
          variant: "destructive",
        });
        
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        console.log('✅ Sign in successful!');
        console.log('📧 User email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
        console.log('🔑 Session expires at:', data.session.expires_at);
        
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to GENIE",
        });
        
        // Force immediate page refresh for clean state
        window.location.href = '/dashboard';
        return { success: true };
      }

      return { success: false, error: 'No user data returned' };
    } catch (error: any) {
      console.error('💥 Sign in exception:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to authentication service. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    console.log('🚪 Starting clean sign out...');
    
    try {
      forceCleanAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
      
      // Force page refresh
      window.location.href = '/';
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      // Force refresh anyway
      window.location.href = '/';
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      console.log('🔍 Fetching user data for:', userId);
      
      // CRITICAL FIX: Use direct database query instead of edge function for role fetching
      console.log('🔍 Fetching user roles directly from database...');
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          roles!inner (
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (roleError) {
        console.error('❌ Role fetch error:', roleError);
        console.error('❌ Role error details:', {
          message: roleError.message,
          code: roleError.code,
          details: roleError.details
        });
        setUserRoles([]);
      } else {
        console.log('📊 Raw role data:', roleData);
        const roles = roleData?.map(ur => ur.roles?.name).filter(Boolean) as UserRole[] || [];
        console.log('✅ User roles extracted:', roles);
        
        if (roles.length === 0) {
          console.warn('⚠️ No roles found for user. This might indicate:');
          console.warn('  1. User has no role assignments in user_roles table');
          console.warn('  2. Role data is malformed');
          console.warn('  3. RLS policy is blocking role access');
          
          // Let's also try a simpler query to debug
          const { data: debugRoles, error: debugError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId);
          
          console.log('🔍 Debug: Raw user_roles data:', debugRoles);
          console.log('🔍 Debug: Error (if any):', debugError);
        }
        
        setUserRoles(roles);
      }

      // Get user profile
      console.log('🔍 Fetching user profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
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

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing clean auth system...');
        
        // Check for existing session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          forceCleanAuthState();
        } else if (currentSession) {
          console.log('✅ Found existing session for user:', currentSession.user?.email);
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            
            // Fetch additional data immediately
            if (currentSession.user) {
              await fetchUserData(currentSession.user.id);
            }
          }
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        forceCleanAuthState();
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
        console.log('🔄 Auth state change:', event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !newSession) {
          console.log('👋 User signed out, clearing state');
          setSession(null);
          setUser(null);
          setUserRoles([]);
          setProfile(null);
        } else if (event === 'SIGNED_IN' && newSession) {
          console.log('👋 User signed in:', newSession.user?.email);
          setSession(newSession);
          setUser(newSession.user);
          
          // Fetch user data immediately on sign in
          if (newSession.user) {
            await fetchUserData(newSession.user.id);
          }
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

  return {
    user,
    session,
    userRoles,
    profile,
    loading,
    isAuthenticated: !!(session && user),
    initialized,
    signIn,
    signOut
  };
};
