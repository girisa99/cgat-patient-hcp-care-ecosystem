
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Authentication Failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Welcome Back",
        description: "Successfully signed in to Healthcare Portal",
      });
      return { success: true };
    } catch (error) {
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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      // If user is created and confirmed, assign the role
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account. Your selected role will be assigned upon verification.",
        });
      } else if (data.user && data.user.email_confirmed_at) {
        // User is immediately confirmed, assign role now
        await assignUserRole(data.user.id, role);
        toast({
          title: "Registration Successful",
          description: `Account created successfully with ${role} role!`,
        });
      }

      return { success: true };
    } catch (error) {
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

  const assignUserRole = async (userId: string, roleName: UserRole) => {
    try {
      // Get the role ID from the roles table
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        console.error('Role not found:', roleName);
        return;
      }

      // Assign the role to the user
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id
        });

      if (assignError) {
        console.error('Error assigning role:', assignError);
      }
    } catch (error) {
      console.error('Error in role assignment:', error);
    }
  };

  return {
    signIn,
    signUp,
    loading
  };
};
