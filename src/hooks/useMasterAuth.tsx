
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface MasterAuthContextType {
  user: User | null;
  userRoles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  availableModules: string[];
  profile: any; // Add profile property
  refreshAuth: () => Promise<void>; // Add refreshAuth method
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const MasterAuthContext = createContext<MasterAuthContextType | undefined>(undefined);

export function MasterAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  console.log('🔐 MASTER AUTH - Initializing single source of truth');

  useEffect(() => {
    console.log('🔄 Initializing master authentication...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      console.log('🔄 Auth state changed: INITIAL_SESSION', session?.user?.email ?? 'undefined');
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email ?? 'undefined');
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Fetch user roles when user signs in
        if (session?.user) {
          fetchUserRoles(session.user.id);
          fetchUserProfile(session.user.id);
        } else {
          setUserRoles([]);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data: roles } = await supabase.rpc('get_user_roles', {
        check_user_id: userId
      });
      
      // Extract role names from the response
      const roleNames = roles?.map((role: { role_name: string }) => role.role_name) || [];
      setUserRoles(roleNames);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  };

  const refreshAuth = async () => {
    if (user) {
      await fetchUserRoles(user.id);
      await fetchUserProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUserRoles([]);
    setProfile(null);
  };

  // Log current state for debugging
  const currentState = {
    isAuthenticated: !!user,
    userEmail: user?.email ?? 'undefined',
    profileName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'No profile' : 'No profile',
    userRoles,
    isLoading,
  };

  console.log('🎯 MASTER AUTH - Current state:', currentState);
  console.log('🎯 SINGLE SOURCE OF TRUTH - Architecture Check:', {
    isAuthenticated: !!user,
    isLoading,
    userEmail: user?.email ?? 'undefined',
    userRoles,
    timestamp: new Date().toISOString(),
  });

  const value: MasterAuthContextType = {
    user,
    userRoles,
    isAuthenticated: !!user,
    isLoading,
    permissions: [],
    availableModules: [],
    profile,
    refreshAuth,
    signIn,
    signOut,
  };

  return (
    <MasterAuthContext.Provider value={value}>
      {children}
    </MasterAuthContext.Provider>
  );
}

export function useMasterAuth() {
  const context = useContext(MasterAuthContext);
  if (context === undefined) {
    throw new Error('useMasterAuth must be used within a MasterAuthProvider');
  }
  return context;
}
