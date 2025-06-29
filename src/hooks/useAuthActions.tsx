
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthStateManager } from '@/utils/auth/authStateManager';
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
      const result = await AuthStateManager.secureSignIn(email, password);
      
      if (!result.success) {
        toast({
          title: "Authentication Failed",
          description: result.error || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to Healthcare Portal",
        });
      }
      
      return result;
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
      // Clean up first
      await AuthStateManager.cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      console.log('🚀 Starting signup process for role:', role);
      
      const { supabase } = await import('@/integrations/supabase/client');
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

  const assignUserRole = async (userId: string, roleName: UserRole): Promise<AuthResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Assigning role:', roleName, 'to user:', userId);
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get role ID
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

      // Assign the role
      const { data: insertData, error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id
        })
        .select();

      if (assignError) {
        console.error('❌ Error assigning role:', assignError);
        toast({
          title: "Error",
          description: assignError.message,
          variant: "destructive",
        });
        return { success: false, error: assignError.message };
      }

      console.log('✅ Role assignment successful! Insert result:', insertData);
      toast({
        title: "Role Assigned",
        description: `Successfully assigned ${roleName} role to user`,
      });
      return { success: true };
    } catch (error: any) {
      console.error('💥 Exception in role assignment:', error);
      const errorMessage = "An unexpected error occurred during role assignment";
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
    assignUserRole,
    loading
  };
};
