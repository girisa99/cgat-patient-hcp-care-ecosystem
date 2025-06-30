
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export interface AuthResult {
  success: boolean;
  error?: string;
}

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    console.log('🔑 Starting sign in for:', email);
    
    try {
      // Clear any existing session first
      await supabase.auth.signOut({ scope: 'global' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        const errorMessage = error.message.includes('Invalid login credentials') 
          ? 'Invalid email or password. Please check your credentials.'
          : error.message;
        
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

      if (data.user && data.session) {
        console.log('✅ Sign in successful for user:', data.user.id);
        
        // Verify user has roles in database
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            roles (
              name,
              description
            )
          `)
          .eq('user_id', data.user.id);

        if (roleError) {
          console.error('❌ Error fetching user roles:', roleError);
        } else {
          const roles = roleData?.map(ur => ur.roles?.name).filter(Boolean) || [];
          console.log('👤 User roles found:', roles);
          
          if (roles.length === 0) {
            toast({
              title: "No Roles Assigned",
              description: "Your account doesn't have any roles assigned. Please contact an administrator.",
              variant: "destructive",
            });
            return { success: false, error: 'No roles assigned to user' };
          }
        }

        toast({
          title: "Welcome Back",
          description: "Successfully signed in",
        });
        
        // Force page reload to ensure clean state
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      console.error('💥 Sign in exception:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole): Promise<AuthResult> => {
    setLoading(true);
    console.log('🚀 Starting signup for role:', role);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { role }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        const errorMessage = error.message.includes('User already registered')
          ? 'An account with this email already exists.'
          : error.message;
        
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        console.log('✅ User created:', data.user.id);
        toast({
          title: "Registration Successful",
          description: "Account created successfully!",
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('💥 Signup exception:', error);
      toast({
        title: "Error",
        description: "Registration failed",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true);
    console.log('🚪 Signing out user...');
    
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('❌ Error signing out:', error);
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
      
      console.log('✅ User signed out successfully');
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
      
      // Force page reload for clean state
      window.location.href = '/';
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    loading
  };
};
