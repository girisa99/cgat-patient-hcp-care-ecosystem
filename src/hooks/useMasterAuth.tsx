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
  facilityIds: string[]; // Tenant isolation
  activeFacilityId: string | null;
  setActiveFacilityId: (id: string | null) => void;
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
  const [facilityIds, setFacilityIds] = useState<string[]>([]);
  const [activeFacilityId, setActiveFacilityId] = useState<string | null>(null);

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
        fetchUserFacilities(session.user.id);
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
          fetchUserFacilities(session.user.id);
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
      // Preferred: use RPC for fine-grained security
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_roles', {
        check_user_id: userId,
      });

      if (!rpcError && rpcData) {
        const roleNames = (rpcData as any[]).map((r) => r.role_name);
        setUserRoles(roleNames);
        return;
      }

      // Fallback: direct select (works in dev when RPC not yet deployed)
      console.warn('[Auth] RPC get_user_roles failed or not present – falling back to direct select');
      const { data: rows, error } = await supabase
        .from('user_roles')
        .select(' role:roles ( name )')
        .eq('user_id', userId);

      if (error) throw error;

      const roleNames = (rows as any[]).map((row) => row.role?.name).filter(Boolean);
      setUserRoles(roleNames);
    } catch (err) {
      console.error('[Auth] Error fetching user roles:', err);
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

  const fetchUserFacilities = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_facilities')
        .select('facility_id, is_primary')
        .eq('user_id', userId);

      if (error) throw error;
      const ids = (data as any[]).map((r) => r.facility_id);
      setFacilityIds(ids);
      const primary = (data as any[]).find((r) => r.is_primary)?.facility_id;
      setActiveFacilityId(primary ?? ids[0] ?? null);
      console.log('[Auth] facilities linked to user', ids);
    } catch (err) {
      console.error('[Auth] Error fetching user facilities:', err);
    }
  };

  const refreshAuth = async () => {
    if (user) {
      await fetchUserRoles(user.id);
      await fetchUserProfile(user.id);
      await fetchUserFacilities(user.id);
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
    facilityIds,
    activeFacilityId,
    setActiveFacilityId,
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
