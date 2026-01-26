/**
 * Unified Tier State Hook - Centralized tier management across wizard
 * 
 * Features:
 * - Syncs with subscription tier from SubscriptionProvider
 * - Provides tier-aware filtering for providers, frameworks, features
 * - Persists tier selection to session storage for wizard recovery
 * - Exposes utilities for tier-based cost calculations
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  GlobalTier, 
  TIER_CONFIGS, 
  getProviderTier, 
  filterProvidersByTier,
  getOutputQualityFromTier,
  calculateTierCost 
} from '@/services/shared/globalTierService';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';

export interface TierStateOptions {
  defaultTier?: GlobalTier;
  sessionKey?: string;
  syncWithSubscription?: boolean;
  onTierChange?: (tier: GlobalTier) => void;
}

export interface UnifiedTierState {
  // Current tier state
  globalTier: GlobalTier;
  numericTier: 1 | 2 | 3;
  setGlobalTier: (tier: GlobalTier) => void;
  setNumericTier: (tier: 1 | 2 | 3) => void;
  
  // Tier configuration
  tierConfig: typeof TIER_CONFIGS[GlobalTier];
  tierOptions: typeof TIER_CONFIGS[keyof typeof TIER_CONFIGS][];
  
  // Filtering utilities
  filterProviders: (providers: string[]) => string[];
  filterFrameworks: <T extends { tier: 1 | 2 | 3 }>(items: T[]) => T[];
  filterByTier: <T extends { tier?: 1 | 2 | 3 | GlobalTier }>(items: T[]) => T[];
  
  // Provider info
  getProviderTierInfo: (providerId: string) => { 
    tier: GlobalTier; 
    numericTier: 1 | 2 | 3;
    isAllowed: boolean;
    label: string;
  };
  
  // Cost & quality
  outputQuality: '720p' | '1080p' | '4k';
  calculateCost: (baseCost: number) => number;
  costMultiplier: number;
  
  // Subscription sync
  subscriptionTier: string | null;
  isSubscriptionSynced: boolean;
}

// Map numeric tiers to GlobalTier
const numericToGlobalTier = (n: 1 | 2 | 3): GlobalTier => {
  switch (n) {
    case 1: return 'standard';
    case 2: return 'advanced';
    case 3: return 'premium';
  }
};

// Map GlobalTier to numeric
const globalToNumericTier = (t: GlobalTier): 1 | 2 | 3 => {
  switch (t) {
    case 'standard': return 1;
    case 'advanced': return 2;
    case 'premium': return 3;
  }
};

// Map subscription tier to GlobalTier
const subscriptionToGlobalTier = (subscriptionTier: string | undefined): GlobalTier => {
  switch (subscriptionTier) {
    case 'free':
    case 'starter':
      return 'standard';
    case 'professional':
    case 'pro':
      return 'advanced';
    case 'enterprise':
    case 'business':
      return 'premium';
    default:
      return 'advanced'; // Default for unknown tiers
  }
};

export function useUnifiedTierState(options: TierStateOptions = {}): UnifiedTierState {
  const { 
    defaultTier = 'advanced', 
    sessionKey = 'genie-wizard-tier',
    syncWithSubscription = true,
    onTierChange 
  } = options;

  // Try to get subscription context (may not exist if not wrapped in provider)
  let subscriptionTier: string | null = null;
  try {
    const subscriptionContext = useSubscriptionContext();
    // Access subscription tier from the hook's return value
    subscriptionTier = (subscriptionContext as any)?.subscription?.tier || null;
  } catch {
    // Not wrapped in SubscriptionProvider, continue without sync
  }

  // Initialize tier from session storage or default
  const getInitialTier = (): GlobalTier => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(sessionKey);
      if (stored && ['standard', 'advanced', 'premium'].includes(stored)) {
        return stored as GlobalTier;
      }
    }
    
    // Sync with subscription if available
    if (syncWithSubscription && subscriptionTier) {
      return subscriptionToGlobalTier(subscriptionTier);
    }
    
    return defaultTier;
  };

  const [globalTier, setGlobalTierState] = useState<GlobalTier>(getInitialTier);

  // Persist tier to session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(sessionKey, globalTier);
    }
  }, [globalTier, sessionKey]);

  // Sync with subscription when it changes
  useEffect(() => {
    if (syncWithSubscription && subscriptionTier) {
      const mappedTier = subscriptionToGlobalTier(subscriptionTier);
      if (mappedTier !== globalTier) {
        setGlobalTierState(mappedTier);
      }
    }
  }, [subscriptionTier, syncWithSubscription]);

  // Set tier with callback
  const setGlobalTier = useCallback((tier: GlobalTier) => {
    setGlobalTierState(tier);
    onTierChange?.(tier);
  }, [onTierChange]);

  // Set tier from numeric value
  const setNumericTier = useCallback((tier: 1 | 2 | 3) => {
    setGlobalTier(numericToGlobalTier(tier));
  }, [setGlobalTier]);

  // Derived values
  const numericTier = useMemo(() => globalToNumericTier(globalTier), [globalTier]);
  const tierConfig = useMemo(() => TIER_CONFIGS[globalTier], [globalTier]);
  const outputQuality = useMemo(() => getOutputQualityFromTier(globalTier), [globalTier]);
  const costMultiplier = useMemo(() => tierConfig.costMultiplier, [tierConfig]);

  // Filter providers by tier
  const filterProviders = useCallback((providers: string[]) => {
    return filterProvidersByTier(providers, globalTier);
  }, [globalTier]);

  // Filter frameworks by tier (numeric tier comparison)
  const filterFrameworks = useCallback(<T extends { tier: 1 | 2 | 3 }>(items: T[]): T[] => {
    return items.filter(item => item.tier <= numericTier);
  }, [numericTier]);

  // Generic tier filter (supports both numeric and string tiers)
  const filterByTier = useCallback(<T extends { tier?: 1 | 2 | 3 | GlobalTier }>(items: T[]): T[] => {
    return items.filter(item => {
      if (!item.tier) return true;
      
      if (typeof item.tier === 'number') {
        return item.tier <= numericTier;
      }
      
      const tierOrder: GlobalTier[] = ['standard', 'advanced', 'premium'];
      return tierOrder.indexOf(item.tier as GlobalTier) <= tierOrder.indexOf(globalTier);
    });
  }, [globalTier, numericTier]);

  // Get provider tier info
  const getProviderTierInfo = useCallback((providerId: string) => {
    const tier = getProviderTier(providerId);
    const providerNumericTier = globalToNumericTier(tier);
    const isAllowed = filterProvidersByTier([providerId], globalTier).length > 0;
    
    return {
      tier,
      numericTier: providerNumericTier,
      isAllowed,
      label: TIER_CONFIGS[tier].label,
    };
  }, [globalTier]);

  // Calculate cost with tier multiplier
  const calculateCost = useCallback((baseCost: number) => {
    return calculateTierCost(baseCost, globalTier);
  }, [globalTier]);

  return {
    globalTier,
    numericTier,
    setGlobalTier,
    setNumericTier,
    tierConfig,
    tierOptions: Object.values(TIER_CONFIGS),
    filterProviders,
    filterFrameworks,
    filterByTier,
    getProviderTierInfo,
    outputQuality,
    calculateCost,
    costMultiplier,
    subscriptionTier,
    isSubscriptionSynced: syncWithSubscription && !!subscriptionTier,
  };
}

// Export tier conversion utilities
export { numericToGlobalTier, globalToNumericTier, subscriptionToGlobalTier };
