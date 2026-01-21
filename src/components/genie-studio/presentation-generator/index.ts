/**
 * Presentation Generator - Module Exports
 * Part of Genie Spark - Mind to Media Production
 * 
 * Extended with:
 * - Template & theme selection
 * - Branding customization (logo, colors)
 * - Table & chart editing
 * - Multi-language parallel generation
 * - Drag-and-drop layout editing
 * - Agent-based generation with real-time streaming
 * - Version comparison and enhancement
 */

export * from './types';
export { SlideAIEnhancer } from './SlideAIEnhancer';
export { BulletPointEditor } from './BulletPointEditor';
export { SlideCard } from './SlideCard';
export type { SlideConfidence } from './SlideCard';
export { PresentationGeneratorPanel } from './PresentationGeneratorPanel';
export { PresentationWizard } from './PresentationWizard';
export { VideoExportPanel } from './VideoExportPanel';
export { LanguageSelector } from './LanguageSelector';
export { ComplianceChecker } from './ComplianceChecker';
export { RichSlideEditor } from './RichSlideEditor';
export { AIProviderPanel } from './AIProviderPanel';
export { GenerationProgressPanel, type SlideGenerationStatus, type ChapterGenerationStatus, type ElementGenerationStatus, type GenerationPhase } from './GenerationProgressPanel';
export { OutputTypePanel, getDefaultOutputSettings, type OutputTypeSettings } from './OutputTypePanel';
export { TemplateThemeSelector, TEMPLATES, COLOR_PALETTES, FONT_OPTIONS } from './TemplateThemeSelector';
export { BrandingCustomizer } from './BrandingCustomizer';
export { TemplateBrandingPanelV2, DEFAULT_BRAND_CONFIG, type BrandConfig } from './TemplateBrandingPanelV2';
export { TableEditor, ChartEditor } from './TableChartEditor';
export { MultiLanguageGenerator, useMultiLanguageGeneration, SUPPORTED_LANGUAGES } from './MultiLanguageGenerator';
export type { LanguageConfig, LanguageGenerationStatus } from './MultiLanguageGenerator';
export { DraggableSlideLayout } from './DraggableSlideLayout';
export type { LayoutElement } from './DraggableSlideLayout';

// Agent-based multi-language generation components
export { LanguageModelSelector } from './LanguageModelSelector';
export { LanguageConfigPopup } from './LanguageConfigPopup';
export { GenerationSummaryPanel } from './GenerationSummaryPanel';
export { VersionComparisonPanel } from './VersionComparisonPanel';
export { SlideEnhancerPanel } from './SlideEnhancerPanel';
export type { SlideEnhancementType } from './SlideEnhancerPanel';
export { RealTimeSlideStreamer } from './RealTimeSlideStreamer';

// Wizard Constants & Types (centralized configuration)
export { 
  COLLATERAL_TYPES,
  INDUSTRY_CATEGORIES,
  CONSULTING_TEMPLATES,
  AI_MODELS,
  THEME_PRESETS,
  SEGMENTS,
  getRecommendedProviders,
  type CollateralType,
  type IndustryCategory,
  type ConsultingTemplate,
  type AIModelConfig,
  type FinalWorkflowConfig,
  type Segment,
  type AIProviderRecommendation,
  type ThemeConfig,
  type SlideLayout,
  type LayoutZone,
} from './wizardConstants';

// Agent architecture definitions
export { 
  AGENT_TYPES, 
  AGENT_CATALOG,
  type AgentType,
  type AgentConfig,
  type AgentMessageType,
  type AgentMessage,
  type AgentExecutionContext,
} from './AgentArchitecture';

// Template Repository & Library
export { TemplateRepository } from './TemplateRepository';
export { VoiceAudioConfigPanel } from './VoiceAudioConfigPanel';
export { ContentContextPanel } from './ContentContextPanel';
export { AgentLanguageConfigPanel } from './AgentLanguageConfigPanel';

// AI Provider Constants & Selectors
export * from './constants/aiProviderConstants';
export { AgentProviderSelector, AgentProviderBadge } from './components/AgentProviderSelector';

// Template Recommendation & Creation with AI Model Selection
export { TemplateRecommendationPanel } from './components/TemplateRecommendationPanel';
export { TemplateAIModelSelector } from './components/TemplateAIModelSelector';
export { CreateTemplateDialog } from './components/CreateTemplateDialog';

// Quick Actions & Review System
export { QuickActionsBar } from './components/QuickActionsBar';
export { useReviewActions } from './hooks/useReviewActions';
export type { UseReviewActionsReturn, UseReviewActionsOptions } from './hooks/useReviewActions';

// Review Action Types & Service
export * from './types/reviewActions';
export { reviewActionService } from './services/reviewActionService';

// Visualization Recommendation Service (flexible, non-restrictive)
export { 
  visualizationRecommendationService,
  getVisualizationRecommendations,
  filterVisualFeaturesByTier,
  getAllVisualFeatures,
} from './services/visualizationRecommendationService';
export type { 
  VisualizationSuggestion, 
  VisualizationRecommendation, 
  VisualizationContext 
} from './services/visualizationRecommendationService';

// Output-Aware Generation Service (with Audio Integration)
export { outputAwareGenerationService } from './services/outputAwareGenerationService';
export type { 
  SlideRenderDecision, 
  HybridRenderOutput, 
  ContentFitResult,
  OutputAwareSlideContent,
  AudioGenerationConfig,
  SlideAudioOutput,
} from './services/outputAwareGenerationService';

// Token Estimation & Optimization Service
export { 
  estimateTokens, 
  formatTokens, 
  getUsageColor,
  TOKEN_COSTS,
  TOKENS_PER_CREDIT,
} from './services/tokenEstimationService';
export type { 
  TokenEstimate, 
  TokenBreakdown, 
  OptimizationSuggestion,
  EstimationConfig,
} from './services/tokenEstimationService';

// Tier-Based Audio Provider Routing Service
export { 
  tierAudioProviderService,
  getAudioProviders,
  getDefaultAudioProvider,
  getProvidersUpToTier,
  getRecommendedVoiceProvider,
  buildTierAudioConfig,
  calculateAudioTokenCost,
  VOICE_PROVIDERS_BY_TIER,
  MUSIC_PROVIDERS_BY_TIER,
  SFX_PROVIDERS_BY_TIER,
  LANGUAGE_VOICE_PAIRINGS,
} from './services/tierAudioProviderService';
export type {
  GlobalTier,
  AudioType,
  AudioProviderConfig,
  LanguageVoicePairing,
  TierAudioConfig,
} from './services/tierAudioProviderService';

// Token UI Components
export { TokenBalanceHeader } from './components/TokenBalanceHeader';
export { TokenBreakdownPanel } from './components/TokenBreakdownPanel';
export { TokenUsageDashboard } from './components/TokenUsageDashboard';

// Smart Tooltip System
export { GenieTooltipProvider, useGenieTooltip, GENIE_DECK_TOOLTIPS } from './context/TooltipContext';
export type { TooltipDefinition } from './context/TooltipContext';
export { SmartTooltip, HelpTooltip } from './components/SmartTooltip';

// Generation History Service
export { generationHistoryService } from './services/generationHistoryService';
export type { GenerationRecord, ActualUsageBreakdown } from './services/generationHistoryService';

// Auto-Translate Input
export { AutoTranslateInput } from './components/AutoTranslateInput';

// Hero Component
export { GenieDeckHero } from './components/GenieDeckHero';

// Generation Config Service (from src/services)
export { generationConfigService } from '@/services/generationConfigService';

// Re-export template library hook and types
export { 
  default as useTemplateLibrary,
  AI_PROVIDERS,
  getProvidersByCategory,
  getRecommendedAIConfig,
} from '@/hooks/useTemplateLibrary';
export type {
  ConsultingFramework,
  IndustryTemplate,
  TemplateAIModelConfig,
  AIProvider,
} from '@/hooks/useTemplateLibrary';
