
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

  const resendVerificationEmail = async (email: string): Promise<AuthResult> => {
    setLoading(true);
    console.log('📧 Resending verification email for:', email);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('❌ Resend verification error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to resend verification email",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      console.log('✅ Verification email resent successfully');
      toast({
        title: "Email Sent",
        description: "Verification email has been resent. Please check your inbox.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 Exception during resend verification:', error);
      const errorMessage = "An unexpected error occurred while resending verification email";
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

  const assignUserRole = async (userId: string, roleName: UserRole): Promise<AuthResult> => {
    setLoading(true);
    console.log('🔄 Assigning role:', roleName, 'to user:', userId);
    
    try {
      // Get the role ID from the roles table
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        console.error('❌ Role not found:', roleName, roleError);
        const errorMessage = `Role '${roleName}' not found`;
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

      // Check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', role.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking existing role:', checkError);
        const errorMessage = 'Error checking existing role assignment';
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

      if (existingRole) {
        console.log('ℹ️ User already has this role assigned');
        toast({
          title: "Role Already Assigned",
          description: "User already has this role assigned",
        });
        return { success: true };
      }

      // Assign the role to the user
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id
        });

      if (assignError) {
        console.error('❌ Error assigning role:', assignError);
        toast({
          title: "Error",
          description: assignError.message || "Failed to assign role",
          variant: "destructive",
        });
        return { success: false, error: assignError.message };
      }

      console.log('✅ Role assignment successful!');
      toast({
        title: "Role Assigned",
        description: `Role '${roleName}' has been assigned successfully`,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 Exception in role assignment:', error);
      const errorMessage = error.message || "Failed to assign role";
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
    resendVerificationEmail,
    assignUserRole,
    loading
  };
};
