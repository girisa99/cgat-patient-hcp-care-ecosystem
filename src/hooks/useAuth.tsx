
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
        loadUserData(session.user.id);
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
          // Small delay to ensure RLS policies are ready
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
      // Load profile with the new simplified RLS policy (users can only see their own profile)
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
        // Profile might not exist - this is normal for new users
        setProfile(null);
      }

      // Load user roles with the new simplified RLS policy (users can only see their own roles)
      console.log('🔐 Fetching user roles...');
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          roles!inner (
            name
          )
        `)
        .eq('user_id', userId);

      if (rolesError) {
        console.error('❌ Roles error:', rolesError);
        logAuthError('loadRoles', rolesError, userId);
        setUserRoles([]);
      } else if (rolesData && rolesData.length > 0) {
        const roles = rolesData.map((ur: any) => ur.roles.name as UserRole);
        console.log('✅ User roles loaded successfully:', roles);
        setUserRoles(roles);
      } else {
        console.log('ℹ️ No roles found for user:', userId);
        setUserRoles([]);
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
      const { data, error } = await supabase.rpc('has_permission', {
        user_id: user.id,
        permission_name: permission
      });
      
      if (error) {
        logAuthError('hasPermission', error, user.id);
        return false;
      }
      
      return data || false;
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
    hasPermission
  };
};
