
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAuthError } from '@/utils/authErrorHandler';
import { getUserRolesDirect, getUserProfileSafe } from '@/utils/rlsPolicyHelpers';

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
      
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer loading to prevent RLS conflicts
        setTimeout(() => {
          if (mounted) {
            loadUserDataSafe(session.user.id);
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
        
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer loading to prevent any potential conflicts
          setTimeout(() => {
            if (mounted) {
              loadUserDataSafe(session.user.id);
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

  const loadUserDataSafe = async (userId: string) => {
    console.log('Loading user data safely for:', userId);
    try {
      setLoading(true);

      // Load profile using safe method
      const profileData = await getUserProfileSafe(userId);
      if (profileData) {
        console.log('Profile loaded safely:', profileData.email);
        setProfile(profileData);
      }

      // Load roles using direct method to bypass RLS issues
      const roles = await getUserRolesDirect(userId);
      console.log('User roles loaded safely:', roles);
      setUserRoles(roles);

    } catch (error) {
      logAuthError('loadUserDataSafe', error, userId);
      console.error('Error in loadUserDataSafe:', error);
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
