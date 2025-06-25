
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
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
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer loading to prevent any potential conflicts
          setTimeout(() => {
            loadUserData(session.user.id);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setUserRoles([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    console.log('Loading user data for:', userId);
    try {
      setLoading(true);

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        const errorInfo = logAuthError('loadProfile', profileError, userId);
        if (profileError.code !== 'PGRST116') { // Not found is ok
          console.error('Profile load error:', errorInfo.message);
        }
      } else if (profileData) {
        console.log('Profile loaded:', profileData.email);
        setProfile(profileData);
      }

      // Load user roles using the new security definer function approach
      try {
        // First test if we can access the roles table
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            roles!inner (
              name
            )
          `)
          .eq('user_id', userId);

        if (rolesError) {
          logAuthError('loadRoles', rolesError, userId);
          console.warn('Could not load roles:', rolesError.message);
          setUserRoles([]);
        } else {
          const roles = rolesData?.map((ur: any) => ur.roles.name) || [];
          console.log('User roles loaded:', roles);
          setUserRoles(roles);
        }
      } catch (error) {
        logAuthError('loadUserRoles', error, userId);
        console.warn('Error loading user roles:', error);
        setUserRoles([]);
      }
    } catch (error) {
      logAuthError('loadUserData', error, userId);
      console.error('Error in loadUserData:', error);
      // Set defaults but don't block auth flow
      setProfile(null);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
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
