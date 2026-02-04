/**
 * Genie Cast Components - Rich video production studio UI
 * 
 * Consolidated 4-Tab Structure:
 * - CREATE: Styles, Assets (Logos + Screenshots + Colors + Templates), Messaging
 * - PRODUCE: Generate, Matrix, Studio, Review
 * - MANAGE: Library, Analytics, Flow, Repurpose
 * - PUBLISH: Scheduler, Distribution, SEO, A/B Testing
 */

export { GenieCastHero } from './GenieCastHero';
export { GenieCastOverview } from './GenieCastOverview';
export { VideoStyleCards, type VideoStyleType } from './VideoStyleCards';
export { AIProviderShowcase } from './AIProviderShowcase';
export { BrandAssetsPanel } from './BrandAssetsPanel';
export { VirtualizedMessagingMatrix } from './VirtualizedMessagingMatrix';
export { 
  GenieCastConsolidatedTabs, 
  type ConsolidatedTab,
  type CreateSubTab,
  type ProduceSubTab,
  type ManageSubTab,
  type PublishSubTab,
} from './GenieCastConsolidatedTabs';
