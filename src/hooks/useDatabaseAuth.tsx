/**
 * Database-Aligned Authentication Hook
 * Following verification and registry standards for type safety and database alignment
 */
import * as React from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Database-aligned types following verification standards
type DatabaseUserRole = Database['public']['Enums']['user_role'];

export interface DatabaseProfile {
  readonly id: string;
  readonly first_name?: string | null;
  readonly last_name?: string | null;
  readonly email?: string | null;
  readonly role?: DatabaseUserRole | null;
  readonly is_active?: boolean | null;
  readonly facility_id?: string | null;
  readonly created_at?: string | null;
  readonly updated_at?: string | null;
}

// Authentication state following database entity patterns
interface DatabaseAuthState {
  readonly user: User | null;
  readonly profile: DatabaseProfile | null;
  readonly userRoles: string[];
  readonly session: Session | null;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
}

// Authentication actions aligned with database operations
interface DatabaseAuthActions {
  readonly signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  readonly signUp: (email: string, password: string, role: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  readonly signOut: () => Promise<{ success: boolean; error?: string }>;
}

export type DatabaseAuthContext = DatabaseAuthState & DatabaseAuthActions;

export const useDatabaseAuth = (): DatabaseAuthContext => {
  // Use React hooks with proper null checking
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<DatabaseProfile | null>(null);
  const [userRoles, setUserRoles] = React.useState<string[]>([]);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;

    const initializeDatabaseAuth = async () => {
      try {
        console.log('🔐 Initializing database-aligned authentication...');
        
        // Get initial session following database patterns
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Database session error:', sessionError);
        }

        if (mounted) {
          if (initialSession?.user) {
            console.log('✅ Found existing database session for user:', initialSession.user.id);
            setUser(initialSession.user);
            setSession(initialSession);
            setIsAuthenticated(true);
            
            // Load profile data aligned with database schema
            await loadDatabaseProfile(initialSession.user.id);
          } else {
            console.log('ℹ️ No existing database session found');
            setIsAuthenticated(false);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('💥 Database auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
        }
      }
    };

    // Load profile and user roles following database schema
    const loadDatabaseProfile = async (userId: string) => {
      try {
        console.log('📋 Loading profile and roles for user:', userId);
        console.log('🔍 TESTING: Starting immediate role query only...');
        
        // Test roles query directly with timeout
        console.log('🔍 About to call supabase.from user_roles...');
        const roleQuery = supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', userId);
          
        console.log('🔍 Query created, now executing...');
        const { data: userRoleIds, error: rolesError } = await roleQuery;
        console.log('🔍 Query completed!');

        console.log('🔍 IMMEDIATE TEST - User role IDs:', { userRoleIds, rolesError });

        let roleNames: string[] = [];
        
        if (userRoleIds && userRoleIds.length > 0 && !rolesError) {
          console.log('🔍 Getting role names for IDs:', userRoleIds.map(ur => ur.role_id));
          
          console.log('🔍 About to call supabase.from roles...');
          const { data: rolesData, error: roleNamesError } = await supabase
            .from('roles')
            .select('name')
            .in('id', userRoleIds.map(ur => ur.role_id));
          console.log('🔍 Roles query completed!');
          
          console.log('🔍 Role names result:', { rolesData, roleNamesError });
          
          if (rolesData && !roleNamesError) {
            roleNames = rolesData.map(r => r.name);
            console.log('✅ Successfully loaded roles:', roleNames);
          }
        } else {
          console.log('❌ No user role IDs found or error occurred');
        }

        console.log('🔍 About to check mounted state...');
        if (mounted) {
          console.log('🔍 Component is mounted, setting user roles...');
          // Set user roles array
          setUserRoles(roleNames);
          console.log('✅ Loaded user roles:', roleNames);

          // Create a minimal profile with just the user ID and primary role
          const primaryRole = roleNames[0] as DatabaseUserRole || null;
          const dbProfile: DatabaseProfile = {
            id: userId,
            first_name: null,
            last_name: null,
            email: null,
            role: primaryRole,
            is_active: true,
            facility_id: null,
            created_at: null,
            updated_at: null,
          };
          setProfile(dbProfile);
          console.log('✅ Set minimal profile with role:', primaryRole);
        }
      } catch (error) {
        console.error('💥 Database profile/roles load error:', error);
      }
    };

    // Set loading timeout as fallback
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('⏰ Database auth loading timeout - forcing loading to false');
        setIsLoading(false);
      }
    }, 3000);

    // Set up auth state listener following database patterns
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Database auth state changed:', event, session?.user?.id);
      
      if (mounted) {
        if (session?.user) {
          console.log('✅ User found, setting auth state...');
          setUser(session.user);
          setSession(session);
          setIsAuthenticated(true);
          
          // Load profile aligned with database
          console.log('📋 Loading profile and roles...');
          await loadDatabaseProfile(session.user.id);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
          setUserRoles([]);
          setIsAuthenticated(false);
        }
        
        if (event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      }
    });

    initializeDatabaseAuth();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Database-aligned authentication methods
  const signIn = React.useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting database sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Database sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Database sign in successful');
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Database authentication failed' };
    } catch (error: any) {
      console.error('💥 Database sign in exception:', error);
      return { success: false, error: error.message || 'An unexpected database error occurred' };
    }
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, role: string) => {
    try {
      console.log('📝 Attempting database sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            role: role,
          }
        }
      });

      if (error) {
        console.error('❌ Database sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Database sign up successful');
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Database registration failed' };
    } catch (error: any) {
      console.error('💥 Database sign up exception:', error);
      return { success: false, error: error.message || 'An unexpected database error occurred' };
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      console.log('👋 Signing out from database...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Database sign out error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Database sign out successful');
      return { success: true };
    } catch (error: any) {
      console.error('💥 Database sign out exception:', error);
      return { success: false, error: error.message || 'An unexpected database error occurred' };
    }
  }, []);

  return {
    user,
    profile,
    userRoles,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
};