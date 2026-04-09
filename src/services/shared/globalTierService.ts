/**
 * Global Tier Service - Unified tier-based routing across Genie Suite
 * Shared by Deck, Vibe, Arc, Production Hub, Mind, Spark
 */

export type GlobalTier = 'standard' | 'advanced' | 'premium';

export interface TierConfig {
  id: GlobalTier;
  label: string;
  description: string;
  costMultiplier: number;
  qualityScore: number;
  speedScore: number;
}

export const TIER_CONFIGS: Record<GlobalTier, TierConfig> = {
  standard: {
    id: 'standard',
    label: 'Tier 1 - Standard',
    description: 'Fast, cost-effective processing',
    costMultiplier: 1.0,
    qualityScore: 70,
    speedScore: 95,
  },
  advanced: {
    id: 'advanced',
    label: 'Tier 2 - Advanced',
    description: 'Balanced quality and speed',
    costMultiplier: 2.5,
    qualityScore: 85,
    speedScore: 75,
  },
  premium: {
    id: 'premium',
    label: 'Tier 3 - Premium',
    description: 'Maximum quality output',
    costMultiplier: 5.0,
    qualityScore: 98,
    speedScore: 50,
  },
};

// Provider tier mappings for cross-product consistency
export const PROVIDER_TIERS: Record<string, GlobalTier> = {
  // Text/LLM
  'gemini-flash': 'standard',
  'gemini-pro': 'advanced',
  'gpt-4o': 'premium',
  'claude-opus-4-5': 'premium',
  'deepseek-v3': 'standard',
  
  // Image
  'stability-core': 'standard',
  'flux-schnell': 'standard',
  'flux-pro': 'advanced',
  'dall-e-3': 'advanced',
  'midjourney-v6': 'premium',
  'modelslab-realvision': 'advanced',
  
  // Video
  'modelslab-animatediff': 'advanced',
  'pika-labs': 'advanced',
  'runway-gen3': 'premium',
  'openai-sora': 'premium',
  
  // Video Assembly (RunPod FFmpeg)
  'runpod-ffmpeg-standard': 'standard',
  'runpod-ffmpeg-hd': 'advanced',
  'runpod-ffmpeg-4k': 'premium',
  
  // Voice
  'google-tts': 'standard',
  'aws-polly': 'standard',
  'openai-tts': 'advanced',
  'azure-neural': 'advanced',
  'elevenlabs': 'premium',
  'alibaba-qwen3-tts': 'advanced',
  
  // Avatar (Phase 2 - Cloud Run)
  'avatar-preset': 'standard',
  'avatar-custom': 'advanced',
  'avatar-wan-lipsync': 'premium',
  
  // 3D/VR (Phase 2 - Cloud Run)
  'meshy-basic': 'advanced',
  'meshy-hd': 'premium',
  'taoavatar-vr': 'premium',
  
  // Translation
  'google-translate': 'standard',
  'deepl': 'advanced',
  'azure-translator': 'advanced',
  'alibaba-translate': 'standard',
};

export function getProviderTier(providerId: string): GlobalTier {
  return PROVIDER_TIERS[providerId] || 'standard';
}

export function filterProvidersByTier(providers: string[], maxTier: GlobalTier): string[] {
  const tierOrder: GlobalTier[] = ['standard', 'advanced', 'premium'];
  const maxTierIndex = tierOrder.indexOf(maxTier);
  
  return providers.filter(provider => {
    const providerTier = getProviderTier(provider);
    return tierOrder.indexOf(providerTier) <= maxTierIndex;
  });
}

export function getTierConfig(tier: GlobalTier): TierConfig {
  return TIER_CONFIGS[tier];
}

export function calculateTierCost(baseCost: number, tier: GlobalTier): number {
  return baseCost * TIER_CONFIGS[tier].costMultiplier;
}

// Quality to output mapping
export function getOutputQualityFromTier(tier: GlobalTier): '720p' | '1080p' | '4k' {
  switch (tier) {
    case 'standard': return '720p';
    case 'advanced': return '1080p';
    case 'premium': return '4k';
  }
}
