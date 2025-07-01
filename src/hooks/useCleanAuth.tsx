
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: any;
  userRoles: string[];
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return null;
      }

      console.log('✅ Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return null;
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log('🔐 Fetching roles for user:', userId);
      
      // Use the has_role function to avoid infinite recursion
      const { data: isSuperAdmin } = await supabase.rpc('has_role', {
        user_id: userId,
        role_name: 'superAdmin'
      });

      const { data: isOnboardingTeam } = await supabase.rpc('has_role', {
        user_id: userId,
        role_name: 'onboardingTeam'
      });

      const roles = [];
      if (isSuperAdmin) roles.push('superAdmin');
      if (isOnboardingTeam) roles.push('onboardingTeam');

      console.log('✅ Roles fetched successfully:', roles);
      return roles;
    } catch (error) {
      console.error('❌ Roles fetch error:', error);
      return [];
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
    } else {
      console.log('✅ Signed out successfully');
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRoles([]);
    }
  };

  useEffect(() => {
    console.log('🔄 Initializing authentication...');
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('✅ User session found:', session.user.id);
          setUser(session.user);
          setSession(session);
          
          // Fetch profile and roles
          const [profileData, rolesData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
          
          setProfile(profileData);
          setUserRoles(rolesData);
        } else {
          console.log('ℹ️ No user session found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event);
        
        if (session) {
          console.log('✅ User session found:', session.user.id);
          setUser(session.user);
          setSession(session);
          
          // Fetch profile and roles
          const [profileData, rolesData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
          
          setProfile(profileData);
          setUserRoles(rolesData);
        } else {
          console.log('ℹ️ No user session');
          setUser(null);
          setSession(null);
          setProfile(null);
          setUserRoles([]);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    profile,
    userRoles,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
