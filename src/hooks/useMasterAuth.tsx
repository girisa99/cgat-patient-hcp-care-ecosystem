
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
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role:roles(name, description)
          )
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('⚠️ Profile query failed, using fallback:', profileError);
        
        // Fallback: Create basic profile from user metadata
        const basicProfile: Profile = {
          id: userId,
          first_name: user?.user_metadata?.first_name || '',
          last_name: user?.user_metadata?.last_name || '',
          email: user?.email || '',
          user_roles: []
        };
        setProfile(basicProfile);
        setUserRoles([]);
        return;
      }

      if (profileData) {
        console.log('✅ Profile loaded successfully:', profileData.first_name, profileData.last_name);
        
        let roles: string[] = [];
        
        if (Array.isArray(profileData.user_roles)) {
          roles = profileData.user_roles
            .map((ur: any) => ur.role?.name)
            .filter(Boolean) || [];
        }
        
        setProfile(profileData);
        setUserRoles(roles);
        console.log('👤 User roles set:', roles);
      }
    } catch (error) {
      console.error('💥 Exception loading profile:', error);
      
      // Emergency fallback for known super admin
      if (userId === '48c5ebe7-a92e-4c6b-86ea-3a239a4dca6d') {
        console.log('🚨 Using emergency fallback for known super admin');
        const adminProfile: Profile = {
          id: userId,
          first_name: 'Super',
          last_name: 'Admin',
          email: user?.email || 'admin@system.com',
          user_roles: [{ role: { name: 'superAdmin' } }]
        };
        setProfile(adminProfile);
        setUserRoles(['superAdmin', 'onboardingTeam']); // Give full access
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
