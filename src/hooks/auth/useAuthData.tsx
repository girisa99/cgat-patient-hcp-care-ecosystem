
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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
  created_at: string | null;
  updated_at: string | null;
}

export const useAuthData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchUserData = async (userId: string) => {
    try {
      console.log('🔍 Fetching user data for:', userId);
      
      // Fetch user roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (roleError) {
        console.error('❌ Error fetching roles:', roleError);
      } else {
        const roles = roleData?.map(ur => ur.roles?.name).filter(Boolean) as UserRole[] || [];
        console.log('✅ User roles:', roles);
        setUserRoles(roles);
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
      } else {
        console.log('✅ User profile:', profileData);
        setProfile(profileData);
      }

    } catch (error) {
      console.error('❌ Exception fetching user data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        } else {
          console.log('🔄 Initial session:', !!initialSession);
          
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            
            if (initialSession?.user) {
              await fetchUserData(initialSession.user.id);
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
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
        console.log('🔄 Auth state change:', event, !!newSession);
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user && event === 'SIGNED_IN') {
          // Defer data fetching to prevent deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchUserData(newSession.user.id);
            }
          }, 100);
        } else {
          setUserRoles([]);
          setProfile(null);
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

  const isAuthenticated = !!(session && user);

  return {
    user,
    session,
    userRoles,
    profile,
    loading,
    isAuthenticated,
    initialized
  };
};
