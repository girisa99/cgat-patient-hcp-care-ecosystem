/**
 * Shared Generation Components - Suite-Wide Standard
 * 
 * These components are now universal across all Genie products:
 * Deck, Spark, Mind, Vibe, Arc, Hub, Ask Genie
 * 
 * Migration: Replaces product-specific implementations with unified patterns
 * Last Updated: 2026-01-23
 */

// ============================================================================
// UNIVERSAL INPUT GATEWAY (UIG) COMPONENTS
// ============================================================================

/**
 * UnifiedInputStep - Primary UI for multi-modal content ingestion
 * Supports: Text, Document, Image, Video, Audio, URL, Screen Recording
 * Mobile-ready with offline fallback for text input
 */
export { 
  UnifiedInputStep, 
  type UnifiedInputStepProps,
  type UnifiedInputState 
} from '@/components/genie-studio/presentation-generator/steps/UnifiedInputStep';

// ============================================================================
// DYNAMIC PIPELINE SELECTION
// ============================================================================

/**
 * DynamicPipelineSelector - Intelligent pipeline selection from 100+ transformations
 * Features: Compatibility scoring, tier-gating, context-aware recommendations
 * Replaces hardcoded pipeline logic across all products
 */
export { 
  DynamicPipelineSelector,
  InlinePipelineSelector,
} from '@/components/genie-studio/presentation-generator/components/DynamicPipelineSelector';

/**
 * useDynamicPipeline - Hook for programmatic pipeline filtering
 * Integrates with useRegionalLanguage for tier-aware selection
 */
export { 
  useDynamicPipeline,
  type PipelineContext,
  type PipelineSelection,
  type UseDynamicPipelineReturn,
} from '@/hooks/useDynamicPipeline';

// ============================================================================
// AI MODEL SELECTION
// ============================================================================

/**
 * OutputModelSelector - Primary + Override + Multi-Select pattern
 * Tier-based filtering, AI-recommended primary with fallbacks
 */
export { 
  OutputModelSelector,
  type OutputModelSelectorProps,
} from '@/components/genie-studio/presentation-generator/components/OutputModelSelector';

/**
 * GlobalTierFilter - Standard/Advanced/Premium tier toggle
 * Cascades quality settings through entire generation pipeline
 */
export { 
  GlobalTierFilter,
} from '@/components/genie-studio/presentation-generator/components/GlobalTierFilter';

// Re-export tier type from service
export type { GlobalTier } from '@/services/shared/globalTierService';

// ============================================================================
// VISUAL FEATURES & OUTPUT CONFIGURATION
// ============================================================================

/**
 * VisualFeaturesDropdown - Multi-select with compatibility badges
 * Filters sub-options by output medium and tier
 */
export { 
  VisualFeaturesDropdown,
  VISUAL_FEATURES,
  type VisualFeatureSelection,
} from '@/components/genie-studio/presentation-generator/components/VisualFeaturesDropdown';

// ============================================================================
// SCRIPT REVIEW & EDITING
// ============================================================================

/**
 * ScriptReviewPanel - Multi-touchpoint workflow for TTS preparation
 * Review → Edit/Skip/Accept → Generate TTS
 */
export { 
  ScriptReviewPanel,
  type SlideScript,
  type ScriptReviewState,
} from '@/components/genie-studio/presentation-generator/components/ScriptReviewPanel';

// ============================================================================
// PROVIDER & VOICE SELECTION
// ============================================================================

/**
 * VoiceProviderDropdown - AI voice/TTS provider selection
 * ElevenLabs, OpenAI, Google, Azure, Amazon Polly
 */
export { 
  VoiceProviderDropdown,
} from '@/components/genie-studio/presentation-generator/components/VoiceProviderDropdown';

/**
 * AIProviderSelector - Universal AI provider dropdown
 * Auto/OpenAI/Gemini/Claude/Hugging Face with content-type recommendations
 */
export { 
  AIProviderSelector,
  AI_PROVIDERS,
  type AIProviderType,
  type AIProvider,
} from '@/components/genie-studio/AIProviderSelector';

/**
 * AgentProviderSelector - Agent-specific provider selection
 * Tier-grouped options with recommended indicators
 */
export { 
  AgentProviderSelector,
  AgentProviderBadge,
} from '@/components/genie-studio/presentation-generator/components/AgentProviderSelector';

// ============================================================================
// REGIONAL LANGUAGE & ROUTING (Central Hook)
// ============================================================================

/**
 * useRegionalLanguage - Master hook for ecosystem-wide routing
 * Combines: 4-Zone LLM, Auto-Fallback, Tier Filtering, Regional Bundles
 * REPLACES: useGlobalTier, useLanguageBundles, useEcosystemRouting
 */
export { 
  useRegionalLanguage,
  type UseRegionalLanguageReturn,
  type PremiumFeaturesRouting,
  type TextDirection,
} from '@/hooks/useRegionalLanguage';

// Re-export LLM Zone type from routing strategy
export type { LLMZone } from '@/services/llmRoutingStrategy';

// Re-export Language Bundle types from service
export type { 
  LanguageBundle,
  LanguageInfo,
  BundleType,
} from '@/services/regionLanguageBundles';

export { 
  CONTENT_TYPES, 
  TONE_OPTIONS, 
  DURATION_OPTIONS,
  getContentTypeById 
} from '@/components/genie-studio/shared/constants';

export type { 
  ContentTypeOption, 
  ToneOption, 
  DurationOption,
  OutputFormatOption,
} from '@/components/genie-studio/shared/types';

// ============================================================================
// ADAPTIVE EDITOR INTEGRATION
// ============================================================================

/**
 * EmbeddedEditorPanel - Bridge between wizard and Adaptive Hybrid Workspace
 * Converts PresentationSlide[] → UniversalElement[] for canvas/timeline editing
 * Includes InlinePipelineSelector for on-the-fly pipeline changes
 */
export { 
  EmbeddedEditorPanel,
} from '@/components/genie-studio/presentation-generator/components/EmbeddedEditorPanel';

// ============================================================================
// OUTPUT COMPATIBILITY & VALIDATION
// ============================================================================

/**
 * OutputCompatibilityWarning - Visual feature vs output medium validation
 * Shows warnings when features are incompatible with selected outputs
 */
export { 
  OutputCompatibilityWarning,
  useOutputCompatibility,
  OUTPUT_COMPATIBILITY_CONFIGS,
} from '@/components/genie-studio/presentation-generator/components/OutputCompatibilityWarning';

/**
 * ProviderTierBadge - Visual indicator for provider quality tiers
 * Consistent tier styling across all products
 */
export { 
  ProviderTierBadge,
  ProviderItem,
  GroupedProviderList,
  TIER_STYLES,
} from '@/components/genie-studio/presentation-generator/components/ProviderTierBadge';

// ============================================================================
// TOKEN & CREDIT MANAGEMENT
// ============================================================================

/**
 * TokenBalanceHeader - Real-time token/credit balance display
 * Shows remaining credits and usage status
 */
export { 
  TokenBalanceHeader,
} from '@/components/genie-studio/presentation-generator/components/TokenBalanceHeader';

/**
 * TokenBreakdownPanel - Detailed token cost estimation
 * Shows per-feature cost breakdown before generation
 */
export { 
  TokenBreakdownPanel,
} from '@/components/genie-studio/presentation-generator/components/TokenBreakdownPanel';

/**
 * TokenUsageDashboard - Comprehensive usage analytics
 * Historical usage, trends, and optimization suggestions
 */
export { 
  TokenUsageDashboard,
} from '@/components/genie-studio/presentation-generator/components/TokenUsageDashboard';

/**
 * CreditBurnDisplay - Visual credit consumption indicator
 * Shows multiplier-based cost for different output types
 */
export { 
  CreditBurnDisplay,
} from '@/components/genie-studio/presentation-generator/components/CreditBurnDisplay';

/**
 * RefreshCapsDisplay - Rate limit and refresh cap indicator
 * Shows remaining API calls and reset timing
 */
export { 
  RefreshCapsDisplay,
} from '@/components/genie-studio/presentation-generator/components/RefreshCapsDisplay';

// ============================================================================
// WIZARD NAVIGATION & PROGRESS
// ============================================================================

/**
 * SmartStepIndicator - Intelligent wizard step progress
 * Shows completion status, validation state, and step navigation
 */
export { 
  SmartStepIndicator,
} from '@/components/genie-studio/presentation-generator/components/SmartStepIndicator';

/**
 * StepGuidancePanel - Contextual help for each wizard step
 * Provides tips and best practices for current step
 */
export { 
  StepGuidancePanel,
} from '@/components/genie-studio/presentation-generator/components/StepGuidancePanel';

/**
 * StepAlertBanner - Warning/info banners for step-specific issues
 * Shows tier limitations, missing configs, etc.
 */
export { 
  StepAlertBanner,
} from '@/components/genie-studio/presentation-generator/components/StepAlertBanner';

/**
 * StepFeedbackPanel - Post-generation feedback collection
 * Allows users to rate and improve generation quality
 */
export { 
  StepFeedbackPanel,
} from '@/components/genie-studio/presentation-generator/components/StepFeedbackPanel';

// ============================================================================
// PRE-GENERATION VALIDATION
// ============================================================================

/**
 * PreGenerationConfirmationPanel - Final validation before generation
 * Shows summary, cost estimate, and confirms user intent
 */
export { 
  PreGenerationConfirmationPanel,
} from '@/components/genie-studio/presentation-generator/components/PreGenerationConfirmationPanel';

/**
 * SlideCountRecommendation - AI-recommended slide/chapter counts
 * Based on content length and output type
 */
export { 
  SlideCountRecommendation,
} from '@/components/genie-studio/presentation-generator/components/SlideCountRecommendation';

/**
 * ContentFitIndicator - Content length vs output capacity
 * Warns when content may not fit selected format
 */
export { 
  ContentFitIndicator,
} from '@/components/genie-studio/presentation-generator/components/ContentFitIndicator';

// ============================================================================
// LANGUAGE & TRANSLATION
// ============================================================================

/**
 * LanguageMultiSelectDropdown - Multi-language selection for generation
 * Supports 120+ languages with regional grouping
 */
export { 
  LanguageMultiSelectDropdown,
} from '@/components/genie-studio/presentation-generator/components/LanguageMultiSelectDropdown';

/**
 * AutoTranslateInput - Real-time translation preview
 * Shows how content translates to selected languages
 */
export { 
  AutoTranslateInput,
} from '@/components/genie-studio/presentation-generator/components/AutoTranslateInput';

// ============================================================================
// FRAMEWORK & TEMPLATE SELECTION
// ============================================================================

/**
 * ConsultingFrameworkQuickSelect - Fast framework picker
 * One-click selection of common business frameworks
 */
export { 
  ConsultingFrameworkQuickSelect,
} from '@/components/genie-studio/presentation-generator/components/ConsultingFrameworkQuickSelect';

/**
 * TemplateRecommendationPanel - AI-suggested templates
 * Based on industry, content type, and past preferences
 */
export { 
  TemplateRecommendationPanel,
} from '@/components/genie-studio/presentation-generator/components/TemplateRecommendationPanel';

/**
 * TemplateAIModelSelector - Template-specific AI model config
 * Allows overriding default models per template
 */
export { 
  TemplateAIModelSelector,
} from '@/components/genie-studio/presentation-generator/components/TemplateAIModelSelector';

// ============================================================================
// OUTPUT TYPE SELECTION
// ============================================================================

/**
 * OutputTypeDropdown - Comprehensive output format selector
 * Doc, Static, Video, Immersive categories with tier gating
 */
export { 
  OutputTypeDropdown,
} from '@/components/genie-studio/presentation-generator/components/OutputTypeDropdown';

// ============================================================================
// VISUALIZATION RECOMMENDATIONS
// ============================================================================

/**
 * VisualizationRecommendationBadges - AI-suggested visual elements
 * Shows recommended charts, diagrams based on content analysis
 */
export { 
  VisualizationRecommendationBadges,
  VisualizationRecommendationChips,
} from '@/components/genie-studio/presentation-generator/components/VisualizationRecommendationBadges';

// ============================================================================
// PUBLISHING SUPPORT (Mobile Compatibility)
// ============================================================================

export { 
  PUBLISHING_MOBILE_SUPPORT,
  getPublishingMobileSupport,
  getMobileLitePublishingFeatures,
  getOfflinePublishingFeatures,
  type PublishingMobileSupportKey,
} from '@/components/mobile/shared-wizard';

// ============================================================================
// A2A ORCHESTRATION SERVICE
// ============================================================================

/**
 * useA2ACoordinatorService - Agent-to-Agent orchestration hook
 * Validates, routes, and executes multi-agent generation tasks
 */
export { 
  useA2ACoordinatorService,
} from '@/hooks/useA2ACoordinatorService';
