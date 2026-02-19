/**
 * GENIE SUITE AUTH HOOK
 * Clean, separate authentication system for Genie Suite
 * Uses Google OAuth as primary authentication method
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';

// Genie Suite Role Types (matches database enum)
export type GenieStudioRole = 
  | 'super_admin'
  | 'content_manager'
  | 'marketing_lead'
  | 'creator'
  | 'subscriber_free'
  | 'subscriber_starter'
  | 'subscriber_creator'
  | 'subscriber_pro'
  | 'subscriber_business'
  | 'subscriber_enterprise'
  | 'freelancer';

// Genie Suite User Profile
export interface GenieStudioUser {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  current_subscription_tier: string;
  subscription_status: string;
  credit_balance: number;
  is_internal: boolean;
  is_verified: boolean;
  created_at: string;
  roles: GenieStudioRole[];
  marketing_access?: {
    access_level: string;
    can_generate: boolean;
    can_publish: boolean;
    can_schedule: boolean;
    can_manage_templates: boolean;
    monthly_generation_limit: number;
    generations_used_this_month: number;
    is_active: boolean;
  } | null;
}

interface GenieStudioAuthState {
  user: User | null;
  session: Session | null;
  genieUser: GenieStudioUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasMarketingAccess: boolean;
  isInternalUser: boolean;
}

// Cache key for internal user status - prevents Genie Cast tab flicker
const INTERNAL_USER_CACHE_KEY = 'genie_studio_is_internal';

export function useGenieStudioAuth() {
  const { toast } = useToast();
  
  // Initialize isInternalUser from cache to prevent navigation flicker
  const [state, setState] = useState<GenieStudioAuthState>(() => {
    const cachedIsInternal = localStorage.getItem(INTERNAL_USER_CACHE_KEY);
    return {
      user: null,
      session: null,
      genieUser: null,
      isLoading: true,
      isAuthenticated: false,
      hasMarketingAccess: false,
      isInternalUser: cachedIsInternal === 'true', // Use cached value immediately
    };
  });

  // Fetch Genie Suite user profile
  const fetchGenieUserProfile = useCallback(async (authUserId: string): Promise<GenieStudioUser | null> => {
    try {
      // Get user profile
      const { data: userProfile, error: userError } = await supabase
        .from('genie_studio_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (userError || !userProfile) {
        console.log('🔍 No Genie Suite profile found, will create on first login');
        return null;
      }

      // Get user roles
      const { data: rolesData } = await supabase
        .from('genie_studio_user_roles')
        .select('role')
        .eq('user_id', userProfile.id);

      // Get marketing access (use maybeSingle to handle no rows)
      const { data: marketingAccess } = await supabase
        .from('genie_marketing_access')
        .select('*')
        .eq('user_id', userProfile.id)
        .maybeSingle();

      return {
        ...userProfile,
        roles: (rolesData?.map(r => r.role) || []) as GenieStudioRole[],
        marketing_access: marketingAccess || null,
      };
    } catch (error) {
      console.error('❌ Error fetching Genie Suite profile:', error);
      return null;
    }
  }, []);

  // Create Genie Suite user profile (for new users) + sync to profiles table
  // Also checks for domain whitelist to auto-flag internal users
  const createGenieUserProfile = useCallback(async (
    authUser: User, 
    selectedTier?: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise'
  ): Promise<GenieStudioUser | null> => {
    try {
      // Import domain whitelist check
      const { isInternalDomain } = await import('@/utils/genie/internalDomainWhitelist');
      
      // Extract name from Google metadata or email
      const fullName = authUser.user_metadata?.full_name || 
                       authUser.user_metadata?.name || 
                       '';
      const nameParts = fullName.split(' ');
      const firstName = authUser.user_metadata?.given_name || nameParts[0] || authUser.email?.split('@')[0] || 'Genie';
      const lastName = authUser.user_metadata?.family_name || nameParts.slice(1).join(' ') || 'User';
      const displayName = fullName || `${firstName} ${lastName}`;
      
      // Check if user email is from internal domain
      const isInternal = isInternalDomain(authUser.email || '');

      // Determine subscription tier and role
      const tier = selectedTier || 'free';
      const roleMap: Record<string, GenieStudioRole> = {
        'free': 'subscriber_free',
        'starter': 'subscriber_starter',
        'creator': 'subscriber_creator',
        'pro': 'subscriber_pro',
        'business': 'subscriber_business',
        'enterprise': 'subscriber_enterprise',
      };
      const subscriberRole = roleMap[tier] || 'subscriber_free';

      // 1. Insert into genie_studio_users
      const { data: newUser, error: insertError } = await supabase
        .from('genie_studio_users')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email!,
          display_name: displayName,
          avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
          is_verified: !!authUser.email_confirmed_at,
          email_verified_at: authUser.email_confirmed_at || null,
          current_subscription_tier: tier,
          subscription_status: tier === 'free' ? 'active' : 'pending',
          is_internal: isInternal, // Auto-flag internal users based on domain
        })
        .select()
        .single();

      if (insertError) {
        // If conflict (user exists), fetch existing
        if (insertError.code === '23505') {
          return await fetchGenieUserProfile(authUser.id);
        }
        throw insertError;
      }

      // 2. Assign subscriber role
      await supabase
        .from('genie_studio_user_roles')
        .insert({
          user_id: newUser.id,
          role: subscriberRole,
        });

      // 3. ALSO sync to profiles table for compatibility
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email!,
          first_name: firstName,
          last_name: lastName,
          avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
          is_email_verified: !!authUser.email_confirmed_at,
        }, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (profileError) {
        console.warn('⚠️ Could not sync to profiles table:', profileError.message);
        // Non-blocking - continue even if profiles sync fails
      } else {
        console.log('✅ Synced user to profiles table');
      }

      console.log('✅ Created new Genie Suite user:', newUser.email, 'with tier:', tier);

      return {
        ...newUser,
        roles: [subscriberRole] as GenieStudioRole[],
        marketing_access: null,
      };
    } catch (error) {
      console.error('❌ Error creating Genie Suite profile:', error);
      return null;
    }
  }, [fetchGenieUserProfile]);

  // Initialize auth state — single profile fetch to prevent race conditions
  useEffect(() => {
    let mounted = true;
    let profileFetchInProgress = false;

    const loadProfile = async (user: User) => {
      // Prevent duplicate concurrent fetches (race between onAuthStateChange + getSession)
      if (profileFetchInProgress) return;
      profileFetchInProgress = true;
      
      try {
        let genieUser = await fetchGenieUserProfile(user.id);
        if (!genieUser) {
          genieUser = await createGenieUserProfile(user);
        }

        if (mounted) {
          if (genieUser) {
            localStorage.setItem(INTERNAL_USER_CACHE_KEY, String(genieUser.is_internal));
          }
          setState(prev => ({
            ...prev,
            genieUser,
            hasMarketingAccess: !!genieUser?.marketing_access?.is_active,
            isInternalUser: genieUser?.is_internal || false,
            isLoading: false,
          }));
        }
      } catch (e) {
        console.error('❌ Profile load error:', e);
        if (mounted) setState(prev => ({ ...prev, isLoading: false }));
      } finally {
        profileFetchInProgress = false;
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session,
          isAuthenticated: !!session?.user,
        }));

        if (session?.user) {
          // Defer to avoid Supabase deadlock, but use shared guard
          setTimeout(() => {
            if (mounted) loadProfile(session.user);
          }, 0);
        } else {
          localStorage.removeItem(INTERNAL_USER_CACHE_KEY);
          setState(prev => ({
            ...prev,
            genieUser: null,
            hasMarketingAccess: false,
            isInternalUser: false,
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session: session,
        isAuthenticated: !!session?.user,
      }));

      if (session?.user) {
        await loadProfile(session.user);
      } else {
        if (mounted) setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchGenieUserProfile, createGenieUserProfile]);

  // Sign in with Google (PRIMARY method)
  // For custom domains, bypass auth-bridge to prevent redirect issues
  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    try {
      const finalRedirectTo = redirectTo || `${window.location.origin}/genie-studio`;
      
      // Detect if we're on a custom domain (not Lovable preview)
      const isCustomDomain = 
        !window.location.hostname.includes('lovable.app') &&
        !window.location.hostname.includes('lovableproject.com') &&
        !window.location.hostname.includes('localhost');

      if (isCustomDomain) {
        // Bypass auth-bridge by getting OAuth URL directly
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: finalRedirectTo,
            skipBrowserRedirect: true, // Critical: prevents automatic redirect through auth-bridge
          },
        });

        if (error) throw error;

        // Validate OAuth URL before redirect (security: prevent open redirect)
        if (data?.url) {
          const oauthUrl = new URL(data.url);
          const allowedHosts = ['accounts.google.com', 'www.google.com'];
          if (!allowedHosts.some(host => oauthUrl.hostname === host || oauthUrl.hostname.endsWith('.google.com'))) {
            throw new Error('Invalid OAuth redirect URL');
          }
          window.location.href = data.url; // Manual redirect
        }
      } else {
        // For Lovable domains, use normal flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: finalRedirectTo,
          },
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      toast({
        title: 'Sign-in Failed',
        description: error instanceof Error ? error.message : 'Failed to sign in with Google',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Sign in with email/password (backup method)
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome to Genie Suite! 🎉',
        description: 'Redirecting to your creative workspace...',
      });

      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Email sign-in error:', error);
      toast({
        title: 'Sign-in Failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  }, [toast]);

  // Sign up with email/password
  const signUpWithEmail = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { firstName?: string; lastName?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/genie-studio`,
          data: {
            first_name: metadata?.firstName,
            last_name: metadata?.lastName,
            full_name: [metadata?.firstName, metadata?.lastName].filter(Boolean).join(' '),
            signup_source: 'genie_studio',
          },
        },
      });

      if (error) throw error;

      if (data.user?.email_confirmed_at) {
        toast({
          title: 'Account Created! 🎉',
          description: 'Welcome to Genie Suite!',
        });
      } else {
        toast({
          title: 'Account Created! ✨',
          description: 'Please check your email to confirm your account.',
        });
      }

      return { success: true, user: data.user, needsConfirmation: !data.user?.email_confirmed_at };
    } catch (error) {
      console.error('❌ Sign-up error:', error);
      toast({
        title: 'Sign-up Failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  }, [toast]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setState({
        user: null,
        session: null,
        genieUser: null,
        isLoading: false,
        isAuthenticated: false,
        hasMarketingAccess: false,
        isInternalUser: false,
      });
      toast({
        title: 'Signed Out',
        description: 'Come back soon!',
      });
    } catch (error) {
      console.error('❌ Sign-out error:', error);
    }
  }, [toast]);

  // Check if user has specific role
  const hasRole = useCallback((role: GenieStudioRole): boolean => {
    return state.genieUser?.roles.includes(role) || false;
  }, [state.genieUser]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: GenieStudioRole[]): boolean => {
    return roles.some(role => state.genieUser?.roles.includes(role));
  }, [state.genieUser]);

  // Check subscription tier
  const hasSubscriptionTier = useCallback((minTier: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise'): boolean => {
    const tierHierarchy = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];
    const userTier = state.genieUser?.current_subscription_tier || 'free';
    return tierHierarchy.indexOf(userTier) >= tierHierarchy.indexOf(minTier);
  }, [state.genieUser]);

  return {
    // State
    ...state,
    
    // Auth methods
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasSubscriptionTier,
    
    // Convenience
    isSuperAdmin: hasRole('super_admin'),
    isMarketingLead: hasRole('marketing_lead'),
    isCreator: hasRole('creator'),
  };
}
