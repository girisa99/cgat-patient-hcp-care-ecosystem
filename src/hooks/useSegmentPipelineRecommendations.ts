/**
 * useSegmentPipelineRecommendations Hook
 * 
 * Provides industry-aware pipeline recommendations during wizard flow.
 * Connects to existing tier system, credit calculations, and Ask Genie.
 */

import { useMemo, useCallback } from 'react';
import { useUnifiedTierState } from './useUnifiedTierState';
import {
  SEGMENT_PIPELINE_MAPPINGS,
  CAPABILITY_BUNDLES,
  getMappingsForIndustry,
  getMappingsForBundle,
  getIndustryPositioning,
  getRecommendedMappings,
  getCrossIndustryRecommendations,
  calculateMappingCreditCost,
  getBundleStatistics,
  type IndustryTag,
  type CapabilityBundle,
  type TierRequirement,
  type SegmentPipelineMapping,
} from '@/services/segmentPipelineMappingRegistry';
import { SEGMENT_CREDIT_TIERS, type SegmentType } from '@/hooks/useAICredits';

interface UseSegmentPipelineRecommendationsOptions {
  industry?: IndustryTag;
  segment?: SegmentType;
}

export function useSegmentPipelineRecommendations(options: UseSegmentPipelineRecommendationsOptions = {}) {
  const { industry, segment } = options;
  const { globalTier, numericTier } = useUnifiedTierState();
  
  // Map tier level to requirement
  const tierRequirement = useMemo((): TierRequirement => {
    switch (numericTier) {
      case 1: return 'free';
      case 2: return 'creator';
      case 3: return 'pro';
      default: return 'free';
    }
  }, [numericTier]);

  // Get recommended mappings based on context
  const recommendations = useMemo(() => {
    return getRecommendedMappings({
      industry,
      tier: tierRequirement,
      segment,
    });
  }, [industry, tierRequirement, segment]);

  // Get mappings for current industry
  const industryMappings = useMemo(() => {
    if (!industry) return [];
    return getMappingsForIndustry(industry);
  }, [industry]);

  // Get bundle statistics
  const bundleStats = useMemo(() => getBundleStatistics(), []);

  // Get positioning for a specific mapping
  const getPositioning = useCallback((mappingId: string) => {
    if (!industry) return null;
    return getIndustryPositioning(mappingId, industry);
  }, [industry]);

  // Get cross-industry suggestions
  const getCrossSuggestions = useCallback((mappingId: string) => {
    if (!industry) return [];
    return getCrossIndustryRecommendations(industry, mappingId);
  }, [industry]);

  // Calculate cost for a mapping
  const getCost = useCallback((mappingId: string, baseCredits: number = 10) => {
    return calculateMappingCreditCost(mappingId, segment, baseCredits);
  }, [segment]);

  // Check if mapping is accessible at current tier
  const canAccess = useCallback((mapping: SegmentPipelineMapping): boolean => {
    const tierOrder: TierRequirement[] = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];
    const userTierIndex = tierOrder.indexOf(tierRequirement);
    const minTierIndex = tierOrder.indexOf(mapping.minTier);
    return userTierIndex >= minTierIndex;
  }, [tierRequirement]);

  // Get mappings by bundle
  const getBundleMappings = useCallback((bundle: CapabilityBundle) => {
    return getMappingsForBundle(bundle);
  }, []);

  // Get all bundles available for current industry
  const availableBundles = useMemo(() => {
    if (!industry) return Object.keys(CAPABILITY_BUNDLES) as CapabilityBundle[];
    
    return (Object.keys(CAPABILITY_BUNDLES) as CapabilityBundle[]).filter(bundle => {
      return CAPABILITY_BUNDLES[bundle].sharedIndustries.includes(industry);
    });
  }, [industry]);

  // Group recommendations by bundle
  const recommendationsByBundle = useMemo(() => {
    const grouped: Record<CapabilityBundle, SegmentPipelineMapping[]> = {
      training: [],
      tours: [],
      compliance: [],
      localization: [],
      content: [],
      analytics: [],
      automation: [],
      personalization: [],
    };
    
    recommendations.forEach(r => {
      grouped[r.bundle].push(r);
    });
    
    return grouped;
  }, [recommendations]);

  // Get segment discount info
  const segmentInfo = useMemo(() => {
    if (!segment || !SEGMENT_CREDIT_TIERS[segment]) return null;
    return SEGMENT_CREDIT_TIERS[segment];
  }, [segment]);

  // Summary stats
  const stats = useMemo(() => ({
    totalMappings: SEGMENT_PIPELINE_MAPPINGS.length,
    accessibleMappings: recommendations.filter(canAccess).length,
    industryMappings: industryMappings.length,
    availableBundles: availableBundles.length,
    segmentDiscount: segmentInfo?.discount || 0,
  }), [recommendations, canAccess, industryMappings, availableBundles, segmentInfo]);

  return {
    // Data
    recommendations,
    industryMappings,
    bundleStats,
    currentTier: globalTier,
    recommendationsByBundle,
    availableBundles,
    segmentInfo,
    stats,
    
    // Context
    tierRequirement,
    industry,
    segment,
    
    // Functions
    getPositioning,
    getCrossSuggestions,
    getCost,
    canAccess,
    getBundleMappings,
    
    // Constants
    CAPABILITY_BUNDLES,
    SEGMENT_PIPELINE_MAPPINGS,
  };
}

export default useSegmentPipelineRecommendations;
