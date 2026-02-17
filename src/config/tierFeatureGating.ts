/**
 * TIER FEATURE GATING CONFIGURATION
 * Controls access to premium features based on subscription tier
 * 
 * Tiers: free, starter, creator, pro, business, enterprise
 */

import type { SubscriptionTier } from './genieStudioNavItems';

export interface FeatureLimit {
  enabled: boolean;
  limit?: number; // -1 = unlimited
  unit?: string;
  upgradeMessage?: string;
}

export interface TierFeatures {
  // Mix-and-match combinations
  avatar: FeatureLimit;
  threeD: FeatureLimit;
  animation: FeatureLimit;
  vrAr: FeatureLimit;
  immersive: FeatureLimit;
  
  // Core features
  lipsync: FeatureLimit;
  dubbing: FeatureLimit;
  musicGeneration: FeatureLimit;
  voiceCloning: FeatureLimit;
  
  // Limits
  monthlyCredits: number;
  maxLanguages: number;
  maxCombinations: number; // Mix-and-match per project
}

/**
 * Feature access by subscription tier
 * Lipsync/Dubbing: Available from Creator tier onwards
 * Mix-and-match: Teaser in free/starter, full in creator+
 */
export const TIER_FEATURE_CONFIG: Record<SubscriptionTier, TierFeatures> = {
  free: {
    avatar: { enabled: true, limit: 1, unit: 'preview', upgradeMessage: 'Upgrade to Creator for unlimited avatars' },
    threeD: { enabled: true, limit: 1, unit: 'preview', upgradeMessage: 'Upgrade to Creator for 3D content' },
    animation: { enabled: true, limit: 2, unit: 'clips', upgradeMessage: 'Upgrade for more animations' },
    vrAr: { enabled: false, upgradeMessage: 'VR/AR available on Pro tier' },
    immersive: { enabled: false, upgradeMessage: 'Immersive content available on Pro tier' },
    lipsync: { enabled: true, limit: 1, unit: 'minute preview', upgradeMessage: 'Upgrade to Creator for lip-sync' },
    dubbing: { enabled: true, limit: 1, unit: 'minute preview', upgradeMessage: 'Upgrade to Creator for dubbing' },
    musicGeneration: { enabled: true, limit: 3, unit: 'tracks', upgradeMessage: 'Upgrade for more music' },
    voiceCloning: { enabled: false, upgradeMessage: 'Voice cloning on Starter+' },
    monthlyCredits: 50,
    maxLanguages: 2,
    maxCombinations: 1,
  },
  starter: {
    avatar: { enabled: true, limit: 5, unit: 'per month', upgradeMessage: 'Upgrade to Creator for more avatars' },
    threeD: { enabled: true, limit: 3, unit: 'per month', upgradeMessage: 'Upgrade for more 3D' },
    animation: { enabled: true, limit: 10, unit: 'clips', upgradeMessage: 'Upgrade for more animations' },
    vrAr: { enabled: false, upgradeMessage: 'VR/AR available on Pro tier' },
    immersive: { enabled: false, upgradeMessage: 'Immersive content available on Pro tier' },
    lipsync: { enabled: true, limit: 5, unit: 'minutes', upgradeMessage: 'Upgrade to Creator for more lip-sync' },
    dubbing: { enabled: true, limit: 5, unit: 'minutes', upgradeMessage: 'Upgrade to Creator for more dubbing' },
    musicGeneration: { enabled: true, limit: 10, unit: 'tracks', upgradeMessage: 'Upgrade for more music' },
    voiceCloning: { enabled: true, limit: 2, unit: 'voices', upgradeMessage: 'Upgrade for more voices' },
    monthlyCredits: 200,
    maxLanguages: 5,
    maxCombinations: 3,
  },
  creator: {
    avatar: { enabled: true, limit: 30, unit: 'per month' },
    threeD: { enabled: true, limit: 20, unit: 'per month' },
    animation: { enabled: true, limit: 50, unit: 'clips' },
    vrAr: { enabled: false, upgradeMessage: 'VR/AR available on Pro tier' },
    immersive: { enabled: false, upgradeMessage: 'Immersive content available on Pro tier' },
    lipsync: { enabled: true, limit: 30, unit: 'minutes' },
    dubbing: { enabled: true, limit: 30, unit: 'minutes' },
    musicGeneration: { enabled: true, limit: 50, unit: 'tracks' },
    voiceCloning: { enabled: true, limit: 5, unit: 'voices' },
    monthlyCredits: 500,
    maxLanguages: 15,
    maxCombinations: 10,
  },
  pro: {
    avatar: { enabled: true, limit: 100, unit: 'per month' },
    threeD: { enabled: true, limit: 75, unit: 'per month' },
    animation: { enabled: true, limit: 200, unit: 'clips' },
    vrAr: { enabled: true, limit: 10, unit: 'experiences' },
    immersive: { enabled: true, limit: 10, unit: 'experiences' },
    lipsync: { enabled: true, limit: 120, unit: 'minutes' },
    dubbing: { enabled: true, limit: 120, unit: 'minutes' },
    musicGeneration: { enabled: true, limit: 200, unit: 'tracks' },
    voiceCloning: { enabled: true, limit: 15, unit: 'voices' },
    monthlyCredits: 1500,
    maxLanguages: 40,
    maxCombinations: 25,
  },
  business: {
    avatar: { enabled: true, limit: -1 },
    threeD: { enabled: true, limit: -1 },
    animation: { enabled: true, limit: -1 },
    vrAr: { enabled: true, limit: 50, unit: 'experiences' },
    immersive: { enabled: true, limit: 50, unit: 'experiences' },
    lipsync: { enabled: true, limit: -1 },
    dubbing: { enabled: true, limit: -1 },
    musicGeneration: { enabled: true, limit: -1 },
    voiceCloning: { enabled: true, limit: 50, unit: 'voices' },
    monthlyCredits: 5000,
    maxLanguages: 70,
    maxCombinations: -1,
  },
  enterprise: {
    avatar: { enabled: true, limit: -1 },
    threeD: { enabled: true, limit: -1 },
    animation: { enabled: true, limit: -1 },
    vrAr: { enabled: true, limit: -1 },
    immersive: { enabled: true, limit: -1 },
    lipsync: { enabled: true, limit: -1 },
    dubbing: { enabled: true, limit: -1 },
    musicGeneration: { enabled: true, limit: -1 },
    voiceCloning: { enabled: true, limit: -1 },
    monthlyCredits: -1,
    maxLanguages: -1,
    maxCombinations: -1,
  },
};

/**
 * Cross-functional features available across products
 */
export const CROSS_FUNCTIONAL_FEATURES = {
  music: {
    availableIn: ['mind', 'vibe', 'deck'] as const,
    description: 'AI music generation for background tracks',
    category: 'audio',
  },
  lipsync: {
    availableIn: ['vibe'] as const,
    description: 'AI lip-sync for avatar and video content',
    category: 'video',
    minTier: 'creator' as SubscriptionTier,
  },
  dubbing: {
    availableIn: ['vibe'] as const,
    description: 'Multi-language voice dubbing',
    category: 'audio',
    minTier: 'creator' as SubscriptionTier,
  },
  voiceCloning: {
    availableIn: ['mind', 'vibe'] as const,
    description: 'Clone voices for consistent narration',
    category: 'audio',
    minTier: 'starter' as SubscriptionTier,
  },
  avatar: {
    availableIn: ['vibe', 'deck'] as const,
    description: 'AI avatars for presentations and videos',
    category: 'visual',
  },
  threeD: {
    availableIn: ['vibe', 'deck'] as const,
    description: '3D object and scene generation',
    category: 'visual',
  },
  vrAr: {
    availableIn: ['vibe', 'deck'] as const,
    description: 'VR/AR immersive experiences',
    category: 'immersive',
    minTier: 'pro' as SubscriptionTier,
  },
};

/**
 * Check if a feature is available for a tier
 */
export function isFeatureAvailable(
  feature: keyof TierFeatures,
  tier: SubscriptionTier
): boolean {
  const config = TIER_FEATURE_CONFIG[tier];
  if (!config) return false;
  
  const featureConfig = config[feature];
  if (typeof featureConfig === 'number') return true;
  
  return featureConfig?.enabled ?? false;
}

/**
 * Get feature limit for a tier
 */
export function getFeatureLimit(
  feature: keyof TierFeatures,
  tier: SubscriptionTier
): number {
  const config = TIER_FEATURE_CONFIG[tier];
  if (!config) return 0;
  
  const featureConfig = config[feature];
  if (typeof featureConfig === 'number') return featureConfig;
  
  return featureConfig?.limit ?? 0;
}

/**
 * Get upgrade message for a locked feature
 */
export function getUpgradeMessage(
  feature: keyof TierFeatures,
  tier: SubscriptionTier
): string | null {
  const config = TIER_FEATURE_CONFIG[tier];
  if (!config) return null;
  
  const featureConfig = config[feature];
  if (typeof featureConfig === 'number') return null;
  
  return featureConfig?.upgradeMessage ?? null;
}
