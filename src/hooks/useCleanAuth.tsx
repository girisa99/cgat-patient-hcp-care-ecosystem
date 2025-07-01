
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  department?: string;
  facility_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useCleanAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('✅ User session found:', session.user.id);
          setUser(session.user);
          setSession(session);
          setIsAuthenticated(true);
          
          // Fetch profile and roles
          await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
        } else {
          console.log('ℹ️ No active session found');
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchProfile = async (userId: string) => {
      try {
        console.log('👤 Fetching profile for user:', userId);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('❌ Profile fetch error:', error);
          return;
        }

        if (data && mounted) {
          console.log('✅ Profile loaded:', data);
          setProfile(data);
        } else {
          console.log('ℹ️ No profile found for user');
        }
      } catch (error) {
        console.error('❌ Profile fetch error:', error);
      }
    };

    const fetchUserRoles = async (userId: string) => {
      try {
        console.log('🔐 Fetching roles for user:', userId);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            roles (
              name
            )
          `)
          .eq('user_id', userId);

        if (error) {
          console.error('❌ Roles fetch error:', error);
          return;
        }

        if (data && mounted) {
          const roles = data.map((item: any) => item.roles?.name).filter(Boolean);
          console.log('✅ Roles loaded:', roles);
          setUserRoles(roles);
        }
      } catch (error) {
        console.error('❌ Roles fetch error:', error);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setSession(session);
          setIsAuthenticated(true);
          await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setProfile(null);
          setUserRoles([]);
          setIsAuthenticated(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      console.log('🔑 Attempting sign in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Sign in successful:', data.user.email);
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        return { success: true, user: data.user };
      }

      return { success: false, error: 'No user returned' };
    } catch (err: any) {
      console.error('💥 Sign in exception:', err);
      return { success: false, error: err.message };
    }
  };

  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🚪 Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      console.log('✅ Signed out successfully');
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    session,
    profile,
    userRoles,
    isLoading,
    isAuthenticated,
    signIn,
    signOut
  };
};
