
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔑 Attempting sign in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Sign in successful:', data.user.email);
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        return { success: true, user: data.user };
      }

      return { success: false, error: 'No user returned' };
    } catch (err: any) {
      console.error('💥 Sign in exception:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      console.log('📝 Attempting sign up with:', email, 'role:', role);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            firstName: '',
            lastName: '',
            role: role
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Sign up successful:', data.user.email);
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        });
        return { success: true, user: data.user };
      }

      return { success: false, error: 'No user returned' };
    } catch (err: any) {
      console.error('💥 Sign up exception:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('🚪 Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Sign out successful');
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
      return { success: true };
    } catch (err: any) {
      console.error('💥 Sign out exception:', err);
      return { success: false, error: err.message };
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
