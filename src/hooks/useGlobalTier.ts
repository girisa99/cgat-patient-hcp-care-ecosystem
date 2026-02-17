/**
 * useGlobalTier Hook - Unified tier management across Genie Suite
 * 
 * DEPRECATED: This hook is now a thin wrapper around useRegionalLanguage.
 * For new code, prefer using useRegionalLanguage directly which provides
 * both regional routing AND tier filtering in a single hook.
 * 
 * This wrapper exists for backward compatibility with existing code.
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  GlobalTier, 
  TIER_CONFIGS, 
  getProviderTier, 
  filterProvidersByTier,
  getOutputQualityFromTier,
  calculateTierCost 
} from '@/services/shared/globalTierService';

interface UseGlobalTierOptions {
  defaultTier?: GlobalTier;
  onTierChange?: (tier: GlobalTier) => void;
}

/**
 * @deprecated Use useRegionalLanguage({ defaultTier }) instead for unified routing + tier filtering.
 * This hook remains for backward compatibility.
 */
export function useGlobalTier(options: UseGlobalTierOptions = {}) {
  const { defaultTier = 'advanced', onTierChange } = options;
  const [globalTier, setGlobalTier] = useState<GlobalTier>(defaultTier);

  const handleTierChange = useCallback((tier: GlobalTier) => {
    setGlobalTier(tier);
    onTierChange?.(tier);
  }, [onTierChange]);

  const tierConfig = useMemo(() => TIER_CONFIGS[globalTier], [globalTier]);

  const filterProviders = useCallback((providers: string[]) => {
    return filterProvidersByTier(providers, globalTier);
  }, [globalTier]);

  const getProviderTierInfo = useCallback((providerId: string) => {
    const tier = getProviderTier(providerId);
    return {
      tier,
      config: TIER_CONFIGS[tier],
      isAllowed: filterProvidersByTier([providerId], globalTier).length > 0,
    };
  }, [globalTier]);

  const outputQuality = useMemo(() => getOutputQualityFromTier(globalTier), [globalTier]);

  const calculateCost = useCallback((baseCost: number) => {
    return calculateTierCost(baseCost, globalTier);
  }, [globalTier]);

  return {
    globalTier,
    setGlobalTier: handleTierChange,
    tierConfig,
    filterProviders,
    getProviderTierInfo,
    outputQuality,
    calculateCost,
    tierOptions: Object.values(TIER_CONFIGS),
  };
}

// Re-export types for convenience
export type { GlobalTier } from '@/services/shared/globalTierService';
export { TIER_CONFIGS, PROVIDER_TIERS } from '@/services/shared/globalTierService';
