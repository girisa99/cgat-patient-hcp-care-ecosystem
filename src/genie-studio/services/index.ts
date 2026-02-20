/**
 * Genie Suite Services Barrel Export
 * 
 * Central export for all Genie ecosystem services.
 */

// Core Generation Services
export { universalPresentationService } from '@/services/universalPresentationService';
export { generationConfigService } from '@/services/generationConfigService';

// Audio & Media Services
export { audioGenerationConfigService } from '@/services/audioGenerationConfigService';
export { multiLanguageAudioOrchestrator } from '@/services/multiLanguageAudioOrchestrator';

// Tier & Framework Services
export { frameworkTierFilterService } from '@/services/frameworkTierFilterService';

// Beta Awards & Gamification
export { betaAwardsService, BETA_BADGES } from '@/services/betaAwardsService';
export type { BetaBadge, BetaParticipant, BetaReward, LeaderboardEntry } from '@/services/betaAwardsService';

// Ecosystem Integration
export { ecosystemIntegrationService } from '@/services/ecosystemIntegrationService';
export type { EcosystemEvent, EcosystemContext, GenerationResult, FeedbackPayload } from '@/services/ecosystemIntegrationService';

// Confidence Loop & Quality
export { confidenceLoopEngine } from '@/services/executionEngines/ConfidenceLoopEngine';

// Feedback & RLHF (Label Studio Background Service)
export { labelStudioService, useLabelStudioBackground } from '@/services/labelStudioBackgroundService';
export type { TrainingEvent, InlineHint } from '@/services/labelStudioBackgroundService';

// Audience Relevance Learning (Option B+C)
export { audienceRelevanceService } from '@/services/audienceRelevanceService';
export type { AudienceRelevanceScore } from '@/services/audienceRelevanceService';

// Ask Genie Knowledge Base (updated with 181 pipelines + editing)
export { 
  askGeniePipelineKnowledgeBase,
  WIZARD_STEPS_KNOWLEDGE,
  EDITING_KNOWLEDGE,
  A2A_AGENT_KNOWLEDGE,
  SUPPORT_KNOWLEDGE,
  ASK_GENIE_AI_CAPABILITIES
} from '@/services/askGeniePipelineKnowledgeBase';

// Routing & Provider Services
export { unifiedProviderRouter } from '@/services/unifiedProviderRoutingAdapter';
export { contextualRecommendationService } from '@/services/contextualRecommendationService';

// Unified Media Infrastructure (JSON2Video + Cloud Run planned)
export { unifiedMediaOrchestrator, MEDIA_PROVIDERS, TIER_QUOTAS } from '@/services/shared/unifiedMediaOrchestrator';
export type { MediaJobConfig, MediaAsset, OutputConfig, MediaJobResult, MediaType } from '@/services/shared/unifiedMediaOrchestrator';

// Proactive Editing
export { proactivePipelineEditorService } from '@/services/proactivePipelineEditorService';

// B1: Universal Script Generator (AI → UniversalScriptLine[] → Manifest)
export { universalScriptGeneratorService, generateUniversalScript, generateMultiRegionScript } from '@/services/universalScriptGeneratorService';
export type { ScriptGenerationRequest, ScriptGenerationResult } from '@/services/universalScriptGeneratorService';

// Framework-Aware Messaging Engine
export { frameworkMessagingEngine, AUDIENCE_FRAMEWORK_MATRIX, PRODUCT_MESSAGING, PROVIDER_CHAR_LIMITS } from '@/services/marketing/frameworkMessagingEngine';
export type { AudienceSegment, FrameworkConfig, AudienceMessaging, FrameworkScriptComposition } from '@/services/marketing/frameworkMessagingEngine';

// Universal Enrichment (product-agnostic content richness for all 7 products)
export {
  useUniversalEnrichment,
  buildEnrichmentContext,
  formatEnrichmentForAI,
  getAllGenieProductsKnowledge,
  formatAllProductsForAI,
} from '@/services/enrichment';
export type {
  UniversalEnrichmentOptions,
  EnrichmentContext,
  UniversalEnrichmentResult,
} from '@/services/enrichment';

// Token ↔ Credit Conversion (dual display: internal tokens, external credits)
export {
  tokensToCredits,
  creditsToTokens,
  getRemainingCredits,
  estimateStepCost,
  buildProjectCostDisplay,
  formatCredits,
  formatTokens,
  formatUsd,
  TIER_CREDIT_CONFIG,
  STEP_ESTIMATION_DEFAULTS,
} from '@/services/tokenCreditService';
export type {
  SubscriptionTier,
  UserContext,
  CostStepType,
  TierCreditConfig,
  StepCostEstimate,
  ProjectCostDisplay,
  PreGenerationEstimate,
} from '@/services/tokenCreditService';
