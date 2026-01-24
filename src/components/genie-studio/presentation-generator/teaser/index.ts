/**
 * Teaser System Exports
 * 
 * Centralized exports for combination teasers (premium features)
 * and product marketing teasers (Genie Suite features)
 */

// Combination Teasers (3D, Avatars, Immersive, Animation)
export { 
  CombinationTeaserPreview,
  InlineTeaserCard,
  TeaserGallery 
} from '../CombinationTeaserPreview';

export { useTeaserIntegration } from '../hooks/useTeaserIntegration';
export type { UseTeaserIntegrationReturn } from '../hooks/useTeaserIntegration';

export type {
  CombinationType,
  TeaserPreview,
  TeaserEngagement,
  TeaserScope,
  TeaserDecision,
  WizardTeaserContext
} from '@/services/combinationTeaserService';

export { 
  useCombinationTeaser,
  combinationTeaserService,
  TEASER_CATALOG 
} from '@/services/combinationTeaserService';

// Product Marketing Teasers (Spark, Mind, Vibe, Deck, Arc, Hub)
export {
  FeatureTeaserCard,
  ProductDiscoveryPanel,
  FloatingProductTeaser
} from './ProductFeatureTeaser';

export {
  useProductMarketingTeaser,
  productMarketingTeaserService,
  PRODUCT_FEATURES
} from '@/services/productMarketingTeaserService';

export type {
  GenieProduct,
  ProductFeatureTeaser,
  ProductFeatureCategory,
  ProductMarketingProfile
} from '@/services/productMarketingTeaserService';
