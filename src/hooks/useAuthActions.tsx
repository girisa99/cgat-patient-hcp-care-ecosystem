
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

  const assignUserRole = async (userId: string, roleName: UserRole): Promise<AuthResult> => {
    setLoading(true);
    console.log('🔄 Assigning role:', roleName, 'to user:', userId);
    
    try {
      // First, get the role ID from the roles table
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        console.error('❌ Role not found:', roleName, roleError);
        toast({
          title: "Error",
          description: `Role '${roleName}' not found`,
          variant: "destructive",
        });
        return { success: false, error: `Role '${roleName}' not found` };
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
        toast({
          title: "Error",
          description: "Error checking existing role assignment",
          variant: "destructive",
        });
        return { success: false, error: 'Error checking existing role assignment' };
      }

      if (existingRole) {
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
          description: "Failed to assign role",
          variant: "destructive",
        });
        return { success: false, error: assignError.message };
      }

      console.log('✅ Role assignment successful!');
      toast({
        title: "Role Assigned",
        description: "User role has been updated successfully",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 Exception in role assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
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
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      console.log('✅ Verification email resent successfully');
      toast({
        title: "Email Sent",
        description: "Verification email has been resent successfully",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 Exception resending verification email:', error);
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
