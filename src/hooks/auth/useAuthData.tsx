
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AuthStateManager } from '@/utils/auth/authStateManager';

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuthData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
      setLoading(true);

      try {
        // Get current session using the auth state manager
        const { user: currentUser, session: currentSession } = await AuthStateManager.getCurrentSession();
        
        if (!mounted) return;
        
        console.log('🔍 Current session:', currentSession?.user?.id || 'No user');
        setSession(currentSession);
        setUser(currentUser);
        
        if (currentUser) {
          // Load user data with a small delay to prevent race conditions
          setTimeout(() => {
            if (mounted) {
              loadUserData(currentUser.id);
            }
          }, 100);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setUserRoles([]);
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.id || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer data loading to prevent potential issues
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

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string, retryCount = 0) => {
    console.log('📊 Loading user data for:', userId, 'Attempt:', retryCount + 1);
    setLoading(true);
    
    try {
      // Load profile with error handling
      console.log('👤 Fetching profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
      } else {
        console.log('✅ Profile loaded:', profileData ? 'Found' : 'Not found');
        setProfile(profileData);
      }

      // Load user roles with comprehensive error handling
      console.log('🔐 Fetching user roles...');
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
        
        // If it's a permission error and we haven't retried, try once more
        if (rolesError.message.includes('permission') && retryCount < 2) {
          console.log('🔄 Retrying role fetch after permission error...');
          setTimeout(() => loadUserData(userId, retryCount + 1), 1000);
          return;
        }
        
        setUserRoles([]);
      } else {
        console.log('🔐 Raw roles data:', rolesData);
        if (rolesData && rolesData.length > 0) {
          const roles = rolesData.map((ur: any) => ur.roles.name as UserRole);
          console.log('✅ User roles loaded:', roles);
          setUserRoles(roles);
        } else {
          console.log('⚠️ No roles found for user');
          setUserRoles([]);
        }
      }

    } catch (error) {
      console.error('💥 Error in loadUserData:', error);
      
      // Retry on unexpected errors (up to 2 times)
      if (retryCount < 2) {
        console.log('🔄 Retrying data load after error...');
        setTimeout(() => loadUserData(userId, retryCount + 1), 1500);
        return;
      }
      
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

  return {
    user,
    session,
    profile,
    userRoles,
    loading,
    refreshUserData
  };
};
