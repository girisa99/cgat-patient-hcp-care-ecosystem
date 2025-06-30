
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
        console.log('✅ Sign in successful');
        toast({
          title: "Welcome Back",
          description: "Successfully signed in",
        });
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
      const { error } = await supabase.auth.signOut();
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

  const assignUserRole = async (userId: string, role: UserRole): Promise<AuthResult> => {
    setLoading(true);
    console.log('🔄 Assigning role:', role, 'to user:', userId);
    
    try {
      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleError || !roleData) {
        throw new Error(`Role '${role}' not found`);
      }

      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', roleData.id)
        .maybeSingle();

      if (existingRole) {
        toast({
          title: "Role Already Assigned",
          description: `User already has the ${role} role`,
        });
        return { success: true };
      }

      // Assign the role
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id
        });

      if (assignError) {
        throw new Error(assignError.message);
      }

      console.log('✅ Role assigned successfully');
      toast({
        title: "Role Assigned",
        description: `Successfully assigned ${role} role to user`,
      });
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error assigning role:', error);
      toast({
        title: "Role Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
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
        console.error('❌ Error resending verification email:', error);
        toast({
          title: "Failed to Resend Email",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      console.log('✅ Verification email sent successfully');
      toast({
        title: "Email Sent",
        description: `Verification email sent to ${email}`,
      });
      return { success: true };
    } catch (error: any) {
      console.error('❌ Exception resending verification email:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email",
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
    assignUserRole,
    resendVerificationEmail,
    loading
  };
};
