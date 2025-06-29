
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
    
    try {
      console.log('🔐 Starting authentication for:', email);
      
      // Clear any existing session first
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.log('ℹ️ No existing session to clear');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
        }
        
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        console.log('✅ Sign in successful for user:', data.user.id);
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to Healthcare Portal",
        });
        
        // Force a page refresh to ensure clean state
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
        
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      console.error('💥 Exception during sign in:', error);
      const errorMessage = "An unexpected error occurred during sign in";
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
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      console.log('🚀 Starting signup process for role:', role);
      
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
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
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
        
        // Wait a moment for the auth state to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to assign role immediately
        const roleAssignmentResult = await assignUserRole(data.user.id, role);
        
        if (roleAssignmentResult.success) {
          console.log('✅ Role assigned successfully during signup');
          
          if (!data.user.email_confirmed_at) {
            toast({
              title: "Registration Successful",
              description: `Account created with ${role} role! Please check your email to verify your account.`,
            });
          } else {
            toast({
              title: "Registration Successful",
              description: `Account created and verified with ${role} role!`,
            });
          }
        } else {
          console.warn('⚠️ Role assignment failed during signup:', roleAssignmentResult.error);
          toast({
            title: "Registration Successful",
            description: "Account created! Role assignment will be completed automatically.",
          });
        }
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

  const assignUserRole = async (userId: string, roleName: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Assigning role:', roleName, 'to user:', userId);
      
      // First, get the role ID from the roles table
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        console.error('❌ Role not found:', roleName, roleError);
        return { success: false, error: `Role '${roleName}' not found` };
      }

      console.log('✅ Found role ID:', role.id, 'for role:', roleName);

      // Check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', role.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking existing role:', checkError);
        return { success: false, error: 'Error checking existing role assignment' };
      }

      if (existingRole) {
        console.log('ℹ️ User already has this role assigned');
        return { success: true };
      }

      // Assign the role to the user
      console.log('🔄 Attempting to insert role assignment...');
      const { data: insertData, error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id
        })
        .select();

      if (assignError) {
        console.error('❌ Error assigning role:', assignError);
        return { success: false, error: assignError.message };
      }

      console.log('✅ Role assignment successful! Insert result:', insertData);
      return { success: true };
    } catch (error: any) {
      console.error('💥 Exception in role assignment:', error);
      return { success: false, error: 'Unexpected error during role assignment' };
    }
  };

  return {
    signIn,
    signUp,
    assignUserRole,
    loading
  };
};
