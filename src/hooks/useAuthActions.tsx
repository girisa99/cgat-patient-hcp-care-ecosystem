
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
      
      console.log('🚀 Starting signup process for role:', role);
      
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
        console.error('❌ Signup error:', error);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
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
    } catch (error) {
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
      console.log('🔍 Current auth user:', (await supabase.auth.getUser()).data.user?.id);
      
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
      console.log('🔄 Attempting to insert role assignment with new RLS policies...');
      const { data: insertData, error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id
        })
        .select();

      if (assignError) {
        console.error('❌ Error assigning role:', assignError);
        console.error('❌ Full error details:', JSON.stringify(assignError, null, 2));
        
        // Check if it's a policy violation
        if (assignError.code === '42501' || assignError.message?.includes('policy')) {
          console.error('🔒 RLS Policy violation - checking auth context...');
          const { data: currentUser } = await supabase.auth.getUser();
          console.log('🔍 Current user context:', currentUser.user?.id);
          console.log('🔍 Target user:', userId);
          console.log('🔍 Are they the same?', currentUser.user?.id === userId);
        }
        
        return { success: false, error: assignError.message };
      }

      console.log('✅ Role assignment successful! Insert result:', insertData);
      console.log('✅ Role assigned successfully:', roleName, 'to user:', userId);
      return { success: true };
    } catch (error) {
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
