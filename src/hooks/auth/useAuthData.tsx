
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAuthError } from '@/utils/authErrorHandler';

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Core hook for managing authentication state and data
 */
export const useAuthData = () => {
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
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        logAuthError('loadProfile', profileError, userId);
      } else {
        setProfile(profileData);
      }

      // Load user roles
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
        logAuthError('loadRoles', rolesError, userId);
        setUserRoles([]);
      } else {
        const roles = rolesData?.map((ur: any) => ur.roles.name as UserRole) || [];
        setUserRoles(roles);
      }

    } catch (error) {
      console.error('💥 Error in loadUserData:', error);
      logAuthError('loadUserData', error, userId);
      setProfile(null);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  return {
    user,
    session,
    profile,
    userRoles,
    loading,
    refreshUserData
  };
};
