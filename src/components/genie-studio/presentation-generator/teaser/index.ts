/**
 * Combination Teaser Exports
 * 
 * Centralized exports for the teaser system
 */

export { 
  CombinationTeaserPreview,
  InlineTeaserCard,
  TeaserGallery 
} from '../CombinationTeaserPreview';

export { useTeaserIntegration } from '../hooks/useTeaserIntegration';

export type { UseTeaserIntegrationReturn } from '../hooks/useTeaserIntegration';

// Re-export service types
export type {
  CombinationType,
  TeaserPreview,
  TeaserEngagement,
  TeaserScope
} from '@/services/combinationTeaserService';

export { 
  useCombinationTeaser,
  combinationTeaserService,
  TEASER_CATALOG 
} from '@/services/combinationTeaserService';
