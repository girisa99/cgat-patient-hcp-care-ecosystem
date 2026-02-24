/**
 * useTierGatedAction — Credit + Tier check before any AI operation
 *
 * Combines:
 * - Tier feature gating (from tierFeatureGating.ts)
 * - Credit affordability check (from useAICredits.ts)
 * - Automatic credit deduction on execution
 *
 * Usage:
 *   const { execute, canExecute, creditCost, upgradeNeeded } = useTierGatedAction('avatar');
 *   if (!canExecute) show upgrade prompt or credit purchase;
 *   else await execute(() => generateAvatar());
 */

import { useCallback, useMemo } from 'react';
import { useAICredits } from '@/hooks/useAICredits';
import { isFeatureAvailable, getFeatureLimit } from '@/config/tierFeatureGating';
import type { TierFeatures } from '@/config/tierFeatureGating';
import type { SubscriptionTier } from '@/config/genieStudioNavItems';
import { toast } from 'sonner';

// Tier hierarchy for upgrade suggestions
const TIER_ORDER: SubscriptionTier[] = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];

interface UseTierGatedActionReturn {
  /** Whether the user can execute this action (tier allows + credits sufficient) */
  canExecute: boolean;
  /** Whether the feature is available at user's tier (ignoring credits) */
  tierAllows: boolean;
  /** Whether user has enough credits (ignoring tier) */
  creditsAvailable: boolean;
  /** Credit cost for this action (from ai_feature_costs table) */
  creditCost: number;
  /** Current credit balance */
  creditBalance: number;
  /** Feature limit for this tier (-1 = unlimited) */
  featureLimit: number;
  /** If tier doesn't allow, returns the minimum tier needed. Null if allowed. */
  upgradeNeeded: SubscriptionTier | null;
  /** Execute the action: checks tier + deducts credits + runs callback */
  execute: (action: () => Promise<void>, units?: number) => Promise<boolean>;
  /** Human-readable reason why action is blocked (or null if allowed) */
  blockReason: string | null;
}

export function useTierGatedAction(
  feature: keyof TierFeatures,
  userTier: SubscriptionTier = 'free',
  featureCostId?: string,
): UseTierGatedActionReturn {
  const credits = useAICredits();

  const tierAllows = useMemo(() => isFeatureAvailable(feature, userTier), [feature, userTier]);
  const featureLimit = useMemo(() => getFeatureLimit(feature, userTier), [feature, userTier]);

  const creditCost = useMemo(() => {
    if (!featureCostId) return 0;
    const cost = credits.getFeatureCost(featureCostId);
    return cost?.credits_per_unit ?? 0;
  }, [featureCostId, credits]);

  const creditBalance = credits.credits?.credits_balance ?? 0;
  const creditsAvailable = creditCost <= 0 || creditBalance >= creditCost;

  const canExecute = tierAllows && creditsAvailable;

  const upgradeNeeded = useMemo((): SubscriptionTier | null => {
    if (tierAllows) return null;
    // Find the minimum tier that enables this feature
    for (const tier of TIER_ORDER) {
      if (isFeatureAvailable(feature, tier)) return tier;
    }
    return 'enterprise';
  }, [tierAllows, feature]);

  const blockReason = useMemo((): string | null => {
    if (canExecute) return null;
    if (!tierAllows) {
      return `This feature requires ${upgradeNeeded} tier or higher`;
    }
    if (!creditsAvailable) {
      return `Insufficient credits (need ${creditCost}, have ${creditBalance})`;
    }
    return null;
  }, [canExecute, tierAllows, creditsAvailable, upgradeNeeded, creditCost, creditBalance]);

  const execute = useCallback(async (action: () => Promise<void>, units: number = 1): Promise<boolean> => {
    if (!tierAllows) {
      toast.error(`Upgrade to ${upgradeNeeded} to use this feature`);
      return false;
    }

    // Deduct credits if there's a cost
    if (featureCostId && creditCost > 0) {
      const result = await credits.useCredits(featureCostId, units);
      if (!result?.success) {
        toast.error(result?.error || 'Insufficient credits');
        return false;
      }
    }

    try {
      await action();
      return true;
    } catch (err) {
      toast.error('Action failed');
      return false;
    }
  }, [tierAllows, upgradeNeeded, featureCostId, creditCost, credits]);

  return {
    canExecute,
    tierAllows,
    creditsAvailable,
    creditCost,
    creditBalance,
    featureLimit,
    upgradeNeeded,
    execute,
    blockReason,
  };
}
