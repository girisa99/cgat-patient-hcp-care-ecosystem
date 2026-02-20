
/**
 * Centralized Authentication State Manager
 * Handles all auth state transitions and cleanup
 */

import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { localSessionStorage } from '@/utils/localSessionStorage';

export class AuthStateManager {
  private static instance: AuthStateManager;
  private authListeners: Set<(user: User | null, session: Session | null) => void> = new Set();

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  /**
   * Clean up all authentication artifacts
   */
  static async cleanupAuthState(): Promise<void> {
    console.log('🧹 Cleaning up authentication state...');

    try {
      // Clear all local session data (auth, genie, app state, recovery)
      localSessionStorage.clearAll();

      // Clear all Supabase localStorage keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('supabase.auth.') || key.includes('sb-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage if it exists
      if (typeof sessionStorage !== 'undefined') {
        const sessionKeysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith('supabase.auth.') || key.includes('sb-'))) {
            sessionKeysToRemove.push(key);
          }
        }
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      }

      console.log('✅ Authentication state cleaned (including local sessions)');
    } catch (error) {
      console.error('❌ Error cleaning auth state:', error);
    }
  }

  /**
   * Perform secure sign out
   */
  static async secureSignOut(): Promise<void> {
    console.log('👋 Starting secure sign out...');
    
    try {
      // Clean up state first
      await AuthStateManager.cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('✅ Global sign out completed');
      } catch (signOutError) {
        console.warn('⚠️ Sign out error (continuing):', signOutError);
      }
      
      // Force page refresh to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('❌ Error during secure sign out:', error);
      // Force refresh anyway
      window.location.href = '/';
    }
  }

  /**
   * Perform secure sign in with cleanup
   */
  static async secureSignIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    console.log('🔐 Starting secure sign in for:', email);
    
    try {
      // Clean up any existing state first
      await AuthStateManager.cleanupAuthState();
      
      // Attempt to sign out any existing session
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('ℹ️ No existing session to clear');
      }
      
      // Short delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Perform sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        }
        
        return { success: false, error: errorMessage };
      }

      if (data.user && data.session) {
        console.log('✅ Sign in successful for user:', data.user.id);
        
        // Force a clean page load to ensure proper state initialization
        setTimeout(() => {
          // Redirect to role-based default route; App will resolve correct dashboard per role
          window.location.href = '/';
        }, 300);
        
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      console.error('💥 Exception during sign in:', error);
      return { success: false, error: 'An unexpected error occurred during sign in' };
    }
  }

  /**
   * Get current session with validation
   */
  static async getCurrentSession(): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        return { user: null, session: null };
      }
      
      return { 
        user: session?.user || null, 
        session: session || null 
      };
    } catch (error) {
      console.error('💥 Exception getting session:', error);
      return { user: null, session: null };
    }
  }
}

// Global auth state manager instance
export const authStateManager = AuthStateManager.getInstance();
