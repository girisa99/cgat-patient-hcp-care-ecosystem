/**
 * Segment Features - Cross-Industry Pipeline Components
 * 
 * Components for displaying and selecting P4-SEG features
 * that work across multiple industries.
 */

export { SegmentPipelineRecommendationPanel } from './SegmentPipelineRecommendationPanel';
export { default as useSegmentPipelineRecommendations } from '@/hooks/useSegmentPipelineRecommendations';

// Re-export registry types and functions
export {
  SEGMENT_PIPELINE_MAPPINGS,
  CAPABILITY_BUNDLES,
  getMappingsForIndustry,
  getMappingsForBundle,
  getIndustryPositioning,
  getRecommendedMappings,
  getCrossIndustryRecommendations,
  calculateMappingCreditCost,
  getBundleStatistics,
  validateMappings,
  type IndustryTag,
  type CapabilityBundle,
  type TierRequirement,
  type SegmentPipelineMapping,
} from '@/services/segmentPipelineMappingRegistry';
