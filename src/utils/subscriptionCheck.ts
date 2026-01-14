/**
 * Subscription Check Utility
 * Checks user subscription status and capabilities for Genie features
 */

import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionCapabilities {
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  canGenerateScripts: boolean;
  canEnhanceScripts: boolean;
  canGenerateTTS: boolean;
  canUseMultiModel: boolean;
  scriptsRemaining: number;
  ttsMinutesRemaining: number;
  isActive: boolean;
}

export const DEFAULT_FREE_CAPABILITIES: SubscriptionCapabilities = {
  tier: 'free',
  canGenerateScripts: false,
  canEnhanceScripts: false,
  canGenerateTTS: false,
  canUseMultiModel: false,
  scriptsRemaining: 0,
  ttsMinutesRemaining: 0,
  isActive: true,
};

export const TIER_CAPABILITIES: Record<string, Partial<SubscriptionCapabilities>> = {
  free: {
    canGenerateScripts: false,
    canEnhanceScripts: false,
    canGenerateTTS: false,
    canUseMultiModel: false,
    scriptsRemaining: 0,
    ttsMinutesRemaining: 0,
  },
  starter: {
    canGenerateScripts: true,
    canEnhanceScripts: true,
    canGenerateTTS: true,
    canUseMultiModel: false,
    scriptsRemaining: 10,
    ttsMinutesRemaining: 30,
  },
  professional: {
    canGenerateScripts: true,
    canEnhanceScripts: true,
    canGenerateTTS: true,
    canUseMultiModel: true,
    scriptsRemaining: 100,
    ttsMinutesRemaining: 300,
  },
  enterprise: {
    canGenerateScripts: true,
    canEnhanceScripts: true,
    canGenerateTTS: true,
    canUseMultiModel: true,
    scriptsRemaining: -1, // Unlimited
    ttsMinutesRemaining: -1, // Unlimited
  },
};

/**
 * Check user's subscription capabilities
 */
export async function checkSubscriptionCapabilities(): Promise<SubscriptionCapabilities> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return DEFAULT_FREE_CAPABILITIES;
    }

    // Check for active subscription in profiles or a dedicated subscriptions table
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return DEFAULT_FREE_CAPABILITIES;
    }

    const tier = (profile as any)?.subscription_tier || 'free';
    const isActive = (profile as any)?.subscription_status === 'active' || tier === 'free';
    
    const tierCapabilities = TIER_CAPABILITIES[tier] || TIER_CAPABILITIES.free;

    return {
      tier: tier as SubscriptionCapabilities['tier'],
      isActive,
      ...tierCapabilities,
    } as SubscriptionCapabilities;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return DEFAULT_FREE_CAPABILITIES;
  }
}

/**
 * Check if user has a specific capability
 */
export async function hasCapability(
  capability: keyof Pick<SubscriptionCapabilities, 'canGenerateScripts' | 'canEnhanceScripts' | 'canGenerateTTS' | 'canUseMultiModel'>
): Promise<boolean> {
  const capabilities = await checkSubscriptionCapabilities();
  return capabilities[capability] === true;
}

/**
 * Get upgrade prompt text based on required capability
 */
export function getUpgradePrompt(capability: string): { title: string; description: string; cta: string } {
  switch (capability) {
    case 'canGenerateScripts':
      return {
        title: 'Generate Scripts with Genie Mind',
        description: 'Create AI-enhanced scripts tailored to your show type. Upgrade to unlock script generation.',
        cta: 'Upgrade to Starter',
      };
    case 'canEnhanceScripts':
      return {
        title: 'Enhance Scripts with AI',
        description: 'Polish and improve your scripts with AI-powered enhancements.',
        cta: 'Upgrade to Starter',
      };
    case 'canGenerateTTS':
      return {
        title: 'Generate Voice with TTS',
        description: 'Convert your scripts to natural-sounding voiceovers.',
        cta: 'Upgrade to Starter',
      };
    case 'canUseMultiModel':
      return {
        title: 'Multi-Model AI Comparison',
        description: 'Compare responses from multiple AI models side-by-side.',
        cta: 'Upgrade to Professional',
      };
    default:
      return {
        title: 'Upgrade Your Plan',
        description: 'Unlock more features with a higher tier subscription.',
        cta: 'View Plans',
      };
  }
}
