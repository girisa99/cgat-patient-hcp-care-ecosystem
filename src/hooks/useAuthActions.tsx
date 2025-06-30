
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
    console.log('🔑 Starting sign in process for:', email);
    
    try {
      // Clean the email input
      const cleanEmail = email.trim().toLowerCase();
      console.log('🧹 Cleaned email:', cleanEmail);
      
      // Simple, direct sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim(),
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        }
        
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

      if (data.user && data.session) {
        console.log('✅ Sign in successful for user:', data.user.id);
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to Healthcare Portal",
        });
        return { success: true };
      }

      const fallbackError = 'Authentication failed - no user or session returned';
      console.error('❌', fallbackError);
      toast({
        title: "Authentication Failed",
        description: fallbackError,
        variant: "destructive",
      });
      return { success: false, error: fallbackError };
    } catch (error: any) {
      console.error('💥 Exception during sign in:', error);
      const errorMessage = error.message || "An unexpected error occurred during sign in";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole): Promise<AuthResult> => {
    setLoading(true);
    console.log('🚀 Starting signup process for role:', role);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role
          }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        
        let errorMessage = error.message;
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'Password must be at least 6 characters long.';
        }
        
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
          description: !data.user.email_confirmed_at 
            ? `Account created! Please check your email to verify your account.`
            : `Account created and verified successfully!`,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('💥 Signup exception:', error);
      const errorMessage = "An unexpected error occurred during registration";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true);
    console.log('🚪 Starting sign out process');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        toast({
          title: "Error",
          description: "Failed to sign out properly",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
      
      console.log('✅ Sign out successful');
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 Exception during sign out:', error);
      const errorMessage = "An unexpected error occurred during sign out";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
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
