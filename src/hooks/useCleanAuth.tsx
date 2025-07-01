
import { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  facility_id?: string;
  created_at: string;
  updated_at?: string;
  email_confirmed_at?: string;
}

interface UserRole {
  roles: {
    name: string;
    description: string | null;
  };
}

export const useCleanAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('👤 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ No profile found for user:', userId);
        return null;
      }

      console.log('✅ Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
      return null;
    }
  };

  const fetchUserRoles = async (userId: string): Promise<string[]> => {
    try {
      console.log('🔐 Fetching roles for user:', userId);
      
      // Query user_roles table with join to get role names
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Roles fetch error:', error);
        return [];
      }

      const roles = data?.map((item: any) => item.roles?.name).filter(Boolean) || [];
      console.log('✅ Roles fetched successfully:', roles);
      return roles;
    } catch (error) {
      console.error('❌ Error in fetchUserRoles:', error);
      return [];
    }
  };

  const loadUserData = useCallback(async (currentUser: User) => {
    if (!currentUser?.id) return;

    try {
      setIsLoading(true);
      
      // Fetch profile and roles in parallel
      const [profileData, rolesData] = await Promise.all([
        fetchProfile(currentUser.id),
        fetchUserRoles(currentUser.id)
      ]);

      setProfile(profileData);
      setUserRoles(rolesData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          console.log('✅ User session found:', initialSession.user.id);
          setSession(initialSession);
          setUser(initialSession.user);
          await loadUserData(initialSession.user);
        } else {
          console.log('❌ No user session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error getting initial session:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 Auth state change:', event);
        
        setSession(newSession);
        setUser(newSession?.user || null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          console.log('✅ User signed in:', newSession.user.id);
          // Defer loading to avoid potential deadlocks
          setTimeout(() => {
            loadUserData(newSession.user);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setProfile(null);
          setUserRoles([]);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
          },
        },
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clean up local state first
      setProfile(null);
      setUserRoles([]);
      setIsAuthenticated(false);
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    user,
    profile,
    userRoles,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshUserData: () => user && loadUserData(user)
  };
};
