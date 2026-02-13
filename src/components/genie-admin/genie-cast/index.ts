/**
 * Genie Cast Components - Rich video production studio UI
 * 
 * Consolidated 4-Tab Structure:
 * - CREATE: Templates, Messaging, Production Setup (Styles + Assets + Regional)
 * - PRODUCE: Generate, Matrix (Video Batch), Studio, Review
 * - MANAGE: Library, Analytics, Flow, Repurpose
 * - PUBLISH: Scheduler, Distribution, SEO, A/B Testing
 */

export { GenieCastHub } from './GenieCastHub';
export { GenieCastHero } from './GenieCastHero';
export { GenieCastOverview } from './GenieCastOverview';
export { VideoStyleCards, type VideoStyleType } from './VideoStyleCards';
export { AIProviderShowcase } from './AIProviderShowcase';
export { BrandAssetsPanel } from './BrandAssetsPanel';
export { VirtualizedMessagingMatrix } from './VirtualizedMessagingMatrix';
export { ScriptPreviewPanel } from './ScriptPreviewPanel';
export { TranslationTranscreationToggle } from './TranslationTranscreationToggle';
export { LiveGenerationPreview } from './LiveGenerationPreview';
export { BlueprintPreviewModal } from './BlueprintPreviewModal';
export { BlueprintTemplatesGrid } from './BlueprintTemplatesGrid';
export { SmartTemplateRecommender } from './SmartTemplateRecommender';
export { TemplateComparisonView } from './TemplateComparisonView';
export { ContentLibraryGrid } from './ContentLibraryGrid';

// New fully-implemented tab components
export { SmartSchedulerPanel } from './SmartSchedulerPanel';
export { AnalyticsDashboard } from './AnalyticsDashboard';
export { ContentRepurposingPanel } from './ContentRepurposingPanel';
export { DistributionPanel } from './DistributionPanel';
export { SEOOptimizerPanel } from './SEOOptimizerPanel';
export { ABTestingPanel } from './ABTestingPanel';
export { PoweredByEndCard, type PoweredByData } from './PoweredByEndCard';
export { CharacterLimitIndicator } from './CharacterLimitIndicator';

// Premium SEO Features
export { CompetitorAnalysisPanel } from './seo/CompetitorAnalysisPanel';
export { RealTimeTrendsPanel } from './seo/RealTimeTrendsPanel';
export { SERPPreviewPanel } from './seo/SERPPreviewPanel';
export { PerformanceTrackingPanel } from './seo/PerformanceTrackingPanel';
export { SEO_FEATURE_TIERS, isPremiumSEOFeature } from './seo';

export { 
  GenieCastConsolidatedTabs, 
  type ConsolidatedTab,
  type CreateSubTab,
  type ProduceSubTab,
  type PublishSubTab,
} from './GenieCastConsolidatedTabs';

export { LandingPageScriptsPanel } from './LandingPageScriptsPanel';
export { HeroBannerCarouselMode, HERO_BANNER_SLIDES } from './HeroBannerCarouselMode';

export { WorkflowContextBanner } from './WorkflowContextBanner';

// Re-export shared authoring components for convenience
export { useUnifiedAuthoring } from '@/hooks/useUnifiedAuthoring';
export { useGenieCastSession } from '@/hooks/useGenieCastSession';
export { AuthoringStageIndicator } from '@/components/shared/AuthoringStageIndicator';
export { RegionalDialectSelector, REGIONAL_CONFIG } from '@/components/shared/RegionalDialectSelector';
export { ScriptTemplateMapper } from '@/components/shared/ScriptTemplateMapper';
export { AVSyncPreview, type SyncStatus, type AVSyncPreviewProps } from '@/components/shared/AVSyncPreview';
export { ApprovalDashboard } from '@/components/shared/ApprovalDashboard';

// Re-export P2 Live Generation hooks and types
export { useLiveTTSPreview, type TTSAudioResult, type TTSGenerationProgress, type TTSPlaybackState } from '@/hooks/useLiveTTSPreview';
export { useLiveVideoPreview, type VideoGenerationResult, type VideoGenerationProgress, type VideoAssemblyConfig } from '@/hooks/useLiveVideoPreview';
export type { UseLiveTTSPreviewReturn } from '@/hooks/useLiveTTSPreview';
export type { UseLiveVideoPreviewReturn } from '@/hooks/useLiveVideoPreview';
