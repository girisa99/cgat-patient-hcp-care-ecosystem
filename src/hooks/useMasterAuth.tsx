
/**
 * MASTER AUTHENTICATION HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all authentication functionality across the application
 * Version: master-auth-v3.0.0 - Local Session Storage integration
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthStateManager } from '@/utils/auth/authStateManager';
import { localSessionStorage } from '@/utils/localSessionStorage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  userRoles: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshAuth: (userId?: string) => Promise<void>;
  hasAnyRole: (roleNames: string[]) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const MasterAuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('🔑 MasterAuthProvider rendering...');

  // Hydrate initial state from local cache for instant display
  const cachedAuth = localSessionStorage.loadAuthSession();

  const [user, setUser] = useState<User | null>(cachedAuth?.user ?? null);
  const [session, setSession] = useState<Session | null>(cachedAuth?.session ?? null);
  const [profile, setProfile] = useState<any>(cachedAuth?.profile ?? null);
  const [userRoles, setUserRoles] = useState<string[]>(cachedAuth?.userRoles ?? []);
  const [isLoading, setIsLoading] = useState(!cachedAuth); // Skip loading spinner if cached
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Master Auth Provider - Single source of truth for authentication

  const isAuthenticated = !!user && !!session;

  // Retry mechanism for failed auth operations
  const retryAuth = async () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(null);
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to retry authentication');
      }
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user data on any session event (INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED)
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setTimeout(() => {
              if (mounted) {
                fetchUserProfile(session.user.id);
                fetchUserRoles(session.user.id);
              }
            }, 100);
          }
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session once
    const checkSession = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Session check failed:', error);
          setIsLoading(false);
          return;
        }
        
        // The auth state change listener will handle the rest
        if (!session) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ Session check error:', err);
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // No dependencies to prevent re-runs

  // Persist auth state to local storage whenever it changes
  useEffect(() => {
    if (user && session) {
      localSessionStorage.saveAuthSession({ user, session, profile, userRoles });
    }
  }, [user, session, profile, userRoles]);

  // Force loading to complete after 5 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('🚨 Auth loading timeout (5s) - force completing...');
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const fetchUserProfile = async (userId: string) => {
    console.log('👤 Fetching user profile for:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

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
      // Use optimized RPC function with performance improvements
      const { data, error } = await supabase
        .rpc('get_user_roles', { check_user_id: userId });

      if (error) {
        console.error('❌ Roles fetch error:', error);
        return;
      }

      const roles = data?.map((r: any) => r.role_name) || [];
      setUserRoles(roles);
      console.log('✅ User roles loaded (optimized):', roles);
    } catch (err) {
      console.error('❌ Roles fetch failed:', err);
    }
  };

  // Optimized role checking function using new DB function
  const hasAnyRole = async (roleNames: string[]) => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('user_has_any_role', { 
          check_user_id: user.id, 
          role_names: roleNames 
        });

      if (error) {
        console.error('❌ Role check error:', error);
        return false;
      }

      return data || false;
    } catch (err) {
      console.error('❌ Role check failed:', err);
      return false;
    }
  };

  const refreshAuth = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (targetUserId) {
      await fetchUserProfile(targetUserId);
      await fetchUserRoles(targetUserId);
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
    console.log('🔐 Signing out user using AuthStateManager');
    setIsLoading(true);
    setError(null);

    try {
      // Clear all local session data first
      localSessionStorage.clearAll();
      // Use AuthStateManager for secure sign out with proper cleanup
      await AuthStateManager.secureSignOut();
      console.log('✅ Secure sign out completed');
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

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    userRoles,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshAuth,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useMasterAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMasterAuth must be used within a MasterAuthProvider');
  }
  return context;
};
