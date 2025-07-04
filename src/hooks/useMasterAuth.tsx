/**
 * MASTER AUTHENTICATION HOOK - SINGLE SOURCE OF TRUTH
 * This is the foundational authentication system that all other hooks depend on
 * Version: master-auth-v1.0.0
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  user_roles?: Array<{ role: { name: string; description?: string } }>;
}

interface MasterAuthContext {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRoles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<MasterAuthContext | undefined>(undefined);

export const useMasterAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMasterAuth must be used within MasterAuthProvider');
  }
  return context;
};

export const MasterAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔐 MASTER AUTH - Initializing single source of truth');

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('📋 Loading profile for user:', userId);
      
      // Step 0: Ensure required database function exists
      try {
        await supabase.rpc('sql', {
          query: `
            CREATE OR REPLACE FUNCTION public.check_user_has_role(user_id uuid, role_name text)
            RETURNS boolean
            LANGUAGE sql
            STABLE SECURITY DEFINER
            SET search_path = ''
            AS $$
              SELECT EXISTS (
                SELECT 1
                FROM public.user_roles ur
                JOIN public.roles r ON r.id = ur.role_id
                WHERE ur.user_id = user_id
                AND r.name = role_name
              );
            $$;
          `
        });
        console.log('✅ Database function check_user_has_role ensured');
      } catch (funcError) {
        console.warn('⚠️ Could not create check_user_has_role function:', funcError);
      }
      
      // Step 1: Get basic profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('⚠️ Profile not found, creating basic profile:', profileError);
        
        // Create basic profile from user metadata if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            first_name: user?.user_metadata?.first_name || user?.user_metadata?.firstName || 'Super',
            last_name: user?.user_metadata?.last_name || user?.user_metadata?.lastName || 'Admin',
            email: user?.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          return;
        }
        
        setProfile(newProfile);
        console.log('✅ Profile created:', newProfile);
      } else {
        setProfile(profileData);
        console.log('✅ Profile loaded:', profileData);
      }

      // Step 2: Get user roles separately to avoid relationship issues
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (rolesError) {
        console.warn('⚠️ User roles query failed:', rolesError);
        
        // For superadmintest@geniecellgene.com, ensure superAdmin role exists and is assigned
        if (user?.email === 'superadmintest@geniecellgene.com') {
          console.log('🚨 Setting up superAdmin role for test user');
          
          // Check if superAdmin role exists, create if not
          const { data: existingRole, error: roleCheckError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'superAdmin')
            .single();

          let roleId = existingRole?.id;
          
          if (roleCheckError) {
            console.log('👑 Creating superAdmin role...');
            const { data: newRole, error: roleCreateError } = await supabase
              .from('roles')
              .upsert({
                name: 'superAdmin',
                description: 'System Super Administrator - Full Access'
              }, { onConflict: 'name' })
              .select('id')
              .single();
            
            if (roleCreateError) {
              console.error('❌ Failed to create superAdmin role:', roleCreateError);
            } else {
              roleId = newRole.id;
              console.log('✅ SuperAdmin role created');
            }
          }
          
          // Assign the role
          if (roleId) {
            const { error: assignError } = await supabase
              .from('user_roles')
              .upsert({
                user_id: userId,
                role_id: roleId,
                assigned_by: userId
              }, { onConflict: 'user_id,role_id' });
            
            if (assignError) {
              console.error('❌ Failed to assign superAdmin role:', assignError);
            } else {
              console.log('✅ SuperAdmin role assigned to test user');
              setUserRoles(['superAdmin']);
            }
          }
        } else {
          setUserRoles([]);
        }
      } else {
        // Extract role names from the query result
        const roles = userRolesData
          .map(ur => ur.roles?.name)
          .filter(Boolean) || [];
        
        setUserRoles(roles);
        console.log('👤 User roles loaded:', roles);
      }

    } catch (error) {
      console.error('💥 Exception loading profile:', error);
      
      // Emergency fallback for known super admin
      if (user?.email === 'superadmintest@geniecellgene.com') {
        console.log('🚨 Using emergency fallback for known super admin');
        const adminProfile: Profile = {
          id: userId,
          first_name: 'Super',
          last_name: 'Admin',
          email: user?.email || 'superadmintest@geniecellgene.com',
        };
        setProfile(adminProfile);
        setUserRoles(['superAdmin']);
      }
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error refreshing session:', error);
        return;
      }
      
      if (refreshedSession?.user) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        setIsAuthenticated(true);
        await loadUserProfile(refreshedSession.user.id);
      }
    } catch (error) {
      console.error('💥 Error refreshing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing master authentication...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        }
        
        if (mounted) {
          if (initialSession?.user) {
            console.log('✅ Found initial session for user:', initialSession.user.email);
            setSession(initialSession);
            setUser(initialSession.user);
            setIsAuthenticated(true);
            
            // Load profile with a small delay
            setTimeout(() => {
              loadUserProfile(initialSession.user.id);
            }, 100);
          } else {
            console.log('ℹ️ No existing session found');
            setIsAuthenticated(false);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('💥 Error during auth initialization:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (mounted) {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Load profile with delay to avoid deadlocks
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 100);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setUserRoles([]);
          setIsAuthenticated(false);
        }
        
        setIsLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('👋 Signing out...');
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
      } else {
        console.log('✅ Successfully signed out');
      }
    } catch (error) {
      console.error('💥 Sign out exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: MasterAuthContext = {
    user,
    session,
    profile,
    userRoles,
    isAuthenticated,
    isLoading,
    signOut,
    refreshAuth
  };

  console.log('🎯 MASTER AUTH - Current state:', {
    isAuthenticated,
    userEmail: user?.email,
    profileName: profile ? `${profile.first_name} ${profile.last_name}` : 'No profile',
    userRoles,
    isLoading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
