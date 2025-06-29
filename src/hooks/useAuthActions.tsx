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
    console.log('🔑 Starting sign in process for:', email);
    
    try {
      const result = await AuthStateManager.secureSignIn(email, password);
      
      if (!result.success) {
        console.error('❌ Sign in failed:', result.error);
        toast({
          title: "Authentication Failed",
          description: result.error || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        console.log('✅ Sign in successful');
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
    console.log('🚀 Starting signup process for role:', role);
    
    try {
      // Clean up first
      await AuthStateManager.cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
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
        
        // Automatically assign the selected role after successful signup
        if (data.user.email_confirmed_at) {
          console.log('📝 Email confirmed, assigning role:', role);
          await assignUserRole(data.user.id, role);
        }
        
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

  const resendVerificationEmail = async (email: string): Promise<AuthResult> => {
    setLoading(true);
    console.log('📧 Resending verification email for:', email);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Clean email input
      const cleanEmail = email.trim().toLowerCase();
      console.log('🧹 Cleaned email:', cleanEmail);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('❌ Resend verification error:', error);
        let errorMessage = error.message;
        
        // Enhanced error handling for email validation issues
        if (error.message.includes('Email address') && error.message.includes('invalid')) {
          errorMessage = `The email address "${cleanEmail}" was rejected by the email service. This could be due to:
          
• Corporate email domain restrictions
• Email address format issues  
• Blacklisted domain or address
• Email service configuration problems

Try using a personal email address (Gmail, Yahoo, Outlook) or contact your administrator.`;
        } else if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Email rate limit exceeded. Please wait a few minutes before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'This email address is not yet confirmed. We\'ll send a new verification email.';
        }
        
        toast({
          title: "Email Verification Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
      
      console.log('✅ Verification email resent successfully');
      toast({
        title: "Verification Email Sent",
        description: `Verification email has been sent to ${cleanEmail}. Please check your inbox and spam folder.`,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 Exception during resend verification:', error);
      let errorMessage = "An unexpected error occurred while resending verification email";
      
      // Handle network or other errors
      if (error.message) {
        errorMessage = `Email sending failed: ${error.message}`;
      }
      
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
    console.log('🔄 Assigning role:', roleName, 'to user:', userId);
    
    try {
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
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true);
    console.log('🚪 Starting sign out process');
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
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
      
      // Clean up auth state
      await AuthStateManager.cleanupAuthState();
      
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
    assignUserRole,
    resendVerificationEmail,
    loading
  };
};
