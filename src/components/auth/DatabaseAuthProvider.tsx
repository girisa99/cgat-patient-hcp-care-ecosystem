
/**
 * DATABASE AUTH PROVIDER - FIXED VERSION
 * Complete auth context with all required properties and real user display
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  user_roles?: Array<{ role: { name: string } }>;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRoles: string[];
  signOut: () => Promise<void>;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const DatabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    console.log('🔐 DatabaseAuthProvider - Setting up auth state...');

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        } else if (initialSession?.user) {
          console.log('✅ Found initial session for user:', initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          setIsAuthenticated(true);
          await loadUserProfile(initialSession.user.id);
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('💥 Error during initial session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setIsAuthenticated(true);
        
        // Load profile with a small delay to avoid deadlocks
        setTimeout(() => {
          loadUserProfile(session.user.id);
        }, 100);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setUserRoles([]);
      }
      
      setIsLoading(false);
    });

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
          console.error('❌ Error loading profile:', profileError);
          // Create a basic profile if none exists
          const basicProfile: Profile = {
            id: userId,
            first_name: user?.user_metadata?.first_name || '',
            last_name: user?.user_metadata?.last_name || '',
            email: user?.email || '',
            user_roles: []
          };
          setProfile(basicProfile);
          setUserRoles([]);
        } else if (profileData) {
          console.log('✅ Profile loaded:', profileData.first_name, profileData.last_name);
          
          // Handle the case where user_roles might be an error or valid data
          let processedProfile: Profile;
          let roles: string[] = [];
          
          if (Array.isArray(profileData.user_roles)) {
            roles = profileData.user_roles.map((ur: any) => ur.role.name) || [];
            processedProfile = {
              ...profileData,
              user_roles: profileData.user_roles
            };
          } else {
            // Handle case where user_roles query failed
            console.warn('⚠️ User roles query failed, using basic profile');
            processedProfile = {
              id: profileData.id,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              email: profileData.email,
              user_roles: []
            };
          }
          
          setProfile(processedProfile);
          setUserRoles(roles);
          console.log('👤 User roles set:', roles);
        }
      } catch (error) {
        console.error('💥 Exception loading profile:', error);
        setUserRoles([]);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

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

  const value = {
    user,
    profile,
    isAuthenticated,
    isLoading,
    userRoles,
    signOut,
    session
  };

  console.log('🎯 DatabaseAuthProvider - Current state:', {
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
