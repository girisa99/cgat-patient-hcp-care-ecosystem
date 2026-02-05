/**
 * Genie Cast Components - Rich video production studio UI
 * 
 * Consolidated 4-Tab Structure:
 * - CREATE: Styles, Assets (Logos + Screenshots + Colors + Templates), Messaging (with Matrix)
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
export { BlueprintPreviewModal } from './BlueprintPreviewModal';
export { BlueprintTemplatesGrid } from './BlueprintTemplatesGrid';
export { 
  GenieCastConsolidatedTabs, 
  type ConsolidatedTab,
  type CreateSubTab,
  type ProduceSubTab,
  type ManageSubTab,
  type PublishSubTab,
} from './GenieCastConsolidatedTabs';

// Re-export shared authoring components for convenience
export { useUnifiedAuthoring } from '@/hooks/useUnifiedAuthoring';
export { AuthoringStageIndicator } from '@/components/shared/AuthoringStageIndicator';
export { RegionalDialectSelector, REGIONAL_CONFIG } from '@/components/shared/RegionalDialectSelector';
export { ScriptTemplateMapper } from '@/components/shared/ScriptTemplateMapper';
