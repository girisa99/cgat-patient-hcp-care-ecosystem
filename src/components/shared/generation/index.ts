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
// PUBLISHING SUPPORT (Mobile Compatibility)
// ============================================================================

export { 
  PUBLISHING_MOBILE_SUPPORT,
  getPublishingMobileSupport,
  getMobileLitePublishingFeatures,
  getOfflinePublishingFeatures,
  type PublishingMobileSupportKey,
} from '@/components/mobile/shared-wizard';
