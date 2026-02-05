/**
 * useCostEstimation Hook
 * 
 * Real-time cost estimation for video assembly configurations
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { videoAssemblyService } from '../VideoAssemblyService';
import type {
  AssemblyConfig,
  AssemblyQuality,
  CostEstimate,
  CostBreakdown,
} from '../types';
import { QUALITY_PRESETS } from '../types';
import type { GlobalTier } from '@/services/shared/globalTierService';

interface UseCostEstimationOptions {
  debounceMs?: number;
}

interface UseCostEstimationReturn {
  // Estimates
  estimate: CostEstimate | null;
  quickEstimate: number;
  isCalculating: boolean;
  
  // Breakdown
  breakdown: CostBreakdown[];
  
  // Validation
  canAfford: boolean;
  warnings: string[];
  
  // Quality options
  availableQualities: AssemblyQuality[];
  validateQuality: (quality: AssemblyQuality) => { valid: boolean; message?: string };
  
  // Actions
  calculateEstimate: (config: AssemblyConfig) => Promise<CostEstimate>;
  getQuickEstimate: (chapterCount: number, quality: AssemblyQuality, hasAvatar: boolean) => number;
}

export function useCostEstimation(
  config: Partial<AssemblyConfig> | null,
  options: UseCostEstimationOptions = {}
): UseCostEstimationReturn {
  const { debounceMs = 300 } = options;

  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Quick estimate based on chapters and quality
  const quickEstimate = useMemo(() => {
    if (!config?.chapters) return 0;
    const hasAvatar = config.fullProductionMode && config.productionConfig?.avatar?.enabled;
    return videoAssemblyService.getQuickEstimate(
      config.chapters.length,
      config.quality || '1080p',
      hasAvatar || false
    );
  }, [config?.chapters?.length, config?.quality, config?.fullProductionMode, config?.productionConfig?.avatar?.enabled]);

  // Available qualities based on tier
  const availableQualities = useMemo(() => {
    if (!config?.userTier) return ['720p', '1080p'] as AssemblyQuality[];
    return videoAssemblyService.getAvailableQualities(config.userTier);
  }, [config?.userTier]);

  // Validate quality selection
  const validateQuality = useCallback((quality: AssemblyQuality) => {
    if (!config?.userTier) return { valid: false, message: 'Tier not specified' };
    return videoAssemblyService.validateQuality(quality, config.userTier);
  }, [config?.userTier]);

  // Full cost calculation
  const calculateEstimate = useCallback(async (fullConfig: AssemblyConfig): Promise<CostEstimate> => {
    setIsCalculating(true);
    try {
      const result = await videoAssemblyService.estimateCost(fullConfig);
      setEstimate(result);
      return result;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Get quick estimate
  const getQuickEstimate = useCallback((
    chapterCount: number,
    quality: AssemblyQuality,
    hasAvatar: boolean
  ): number => {
    return videoAssemblyService.getQuickEstimate(chapterCount, quality, hasAvatar);
  }, []);

  // Auto-calculate when config changes (debounced)
  useEffect(() => {
    if (!config?.chapters || !config?.quality || !config?.userTier) return;

    const timer = setTimeout(async () => {
      const fullConfig: AssemblyConfig = {
        language: config.language || 'en',
        chapters: config.chapters || [],
        quality: config.quality || '1080p',
        aspectRatio: config.aspectRatio || '16:9',
        outputFormat: config.outputFormat || 'mp4',
        videoStyle: config.videoStyle || 'educational',
        fullProductionMode: config.fullProductionMode || false,
        productionConfig: config.productionConfig,
        skipExistingTTS: config.skipExistingTTS || false,
        unifiedAudio: config.unifiedAudio ?? true,
        generatePreview: config.generatePreview || false,
        userTier: config.userTier,
      };

      await calculateEstimate(fullConfig);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [config, debounceMs, calculateEstimate]);

  return {
    estimate,
    quickEstimate,
    isCalculating,
    breakdown: estimate?.breakdown || [],
    canAfford: estimate?.canProceed ?? true,
    warnings: estimate?.warnings || [],
    availableQualities,
    validateQuality,
    calculateEstimate,
    getQuickEstimate,
  };
}

/**
 * Format credits as display string
 */
export function formatCredits(credits: number): string {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`;
  }
  return credits.toFixed(0);
}

/**
 * Get cost breakdown summary
 */
export function getCostSummary(breakdown: CostBreakdown[]): string {
  if (breakdown.length === 0) return '';
  
  const sorted = [...breakdown].sort((a, b) => b.credits - a.credits);
  const top3 = sorted.slice(0, 3);
  
  return top3
    .map(b => `${b.component}: ${formatCredits(b.credits)}`)
    .join(' • ');
}

/**
 * Get quality recommendation based on tier and content
 */
export function getQualityRecommendation(
  tier: GlobalTier,
  chapterCount: number,
  hasAvatar: boolean
): { quality: AssemblyQuality; reason: string } {
  const availableQualities = videoAssemblyService.getAvailableQualities(tier);
  const maxQuality = availableQualities[availableQualities.length - 1];

  // For long videos with avatars, recommend lower quality to save credits
  if (chapterCount > 6 && hasAvatar) {
    if (availableQualities.includes('1080p')) {
      return { quality: '1080p', reason: 'Recommended for long avatar videos to balance quality and cost' };
    }
    return { quality: '720p', reason: 'Best option for your tier with avatar content' };
  }

  // For short videos, use max available quality
  if (chapterCount <= 3) {
    return { quality: maxQuality, reason: 'Maximum quality for short content' };
  }

  // Default to 1080p if available
  if (availableQualities.includes('1080p')) {
    return { quality: '1080p', reason: 'Standard quality for most content' };
  }

  return { quality: maxQuality, reason: 'Best available quality for your tier' };
}
