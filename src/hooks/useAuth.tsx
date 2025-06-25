
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAuthError } from '@/utils/authErrorHandler';

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRoles: UserRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('🔍 Initial session check:', session?.user?.id || 'No user');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Use setTimeout to defer data loading and prevent potential deadlocks
        setTimeout(() => {
          if (mounted) {
            loadUserData(session.user.id);
          }
        }, 100);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.id || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to defer data loading and prevent potential deadlocks
          setTimeout(() => {
            if (mounted) {
              loadUserData(session.user.id);
            }
          }, 200);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setUserRoles([]);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    console.log('📊 Loading user data for:', userId);
    setLoading(true);
    
    try {
      // Load profile - with the simplified RLS policy, this should work
      console.log('👤 Fetching profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        logAuthError('loadProfile', profileError, userId);
      } else if (profileData) {
        console.log('✅ Profile loaded successfully:', profileData);
        setProfile(profileData);
      } else {
        console.log('ℹ️ No profile found for user:', userId);
        setProfile(null);
      }

      // Load user roles - with detailed debugging
      console.log('🔐 Fetching user roles for user:', userId);
      
      // First, let's check if there are any user_roles records for this user
      const { data: userRolesCheck, error: userRolesCheckError } = await supabase
        .from('user_roles')
        .select('id, role_id')
        .eq('user_id', userId);

      console.log('🔍 Raw user_roles check:', userRolesCheck, 'Error:', userRolesCheckError);

      if (userRolesCheckError) {
        console.error('❌ User roles check error:', userRolesCheckError);
      }

      // Now fetch with the role names
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          role_id,
          roles!inner (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (rolesError) {
        console.error('❌ Roles fetch error:', rolesError);
        console.error('❌ Detailed roles error:', JSON.stringify(rolesError, null, 2));
        logAuthError('loadRoles', rolesError, userId);
        setUserRoles([]);
      } else {
        console.log('🔐 Raw roles data with joins:', rolesData);
        if (rolesData && rolesData.length > 0) {
          const roles = rolesData.map((ur: any) => {
            console.log('🔍 Processing role record:', ur);
            return ur.roles.name as UserRole;
          });
          console.log('✅ User roles loaded successfully:', roles);
          setUserRoles(roles);
        } else {
          console.log('⚠️ No roles found for user:', userId);
          console.log('🔍 This could mean:');
          console.log('  1. No roles were assigned during signup');
          console.log('  2. RLS policies are blocking the query');
          console.log('  3. The roles table doesn\'t have the expected data');
          setUserRoles([]);
        }
      }

    } catch (error) {
      console.error('💥 Error in loadUserData:', error);
      logAuthError('loadUserData', error, userId);
      setProfile(null);
      setUserRoles([]);
    } finally {
      console.log('🏁 User data loading complete');
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out user');
      await supabase.auth.signOut();
      setProfile(null);
      setUserRoles([]);
    } catch (error) {
      logAuthError('signOut', error, user?.id);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // For now, we'll use a simple approach since we disabled RLS on some tables
      // This can be enhanced later with proper security definer functions
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permissions!inner (
            name
          )
        `)
        .in('role_id', 
          userRoles.length > 0 
            // If we have roles cached, use them to get role IDs
            ? await supabase
                .from('roles')
                .select('id')
                .in('name', userRoles)
                .then(({ data }) => data?.map(r => r.id) || [])
            : []
        );
      
      if (error) {
        logAuthError('hasPermission', error, user.id);
        return false;
      }
      
      return data?.some((rp: any) => rp.permissions.name === permission) || false;
    } catch (error) {
      logAuthError('hasPermission', error, user.id);
      return false;
    }
  };

  return {
    user,
    session,
    profile,
    userRoles,
    loading,
    signOut,
    hasRole,
    hasPermission,
    refreshUserData
  };
};
