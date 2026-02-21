/**
 * Brand Intelligence Engine — Barrel Export
 *
 * Unified marketing intelligence layer for GenieSuite ecosystem.
 * From Fortune 500 boardrooms to roadside food carts — one engine, all businesses.
 *
 * Architecture:
 *   brandIntelligenceEngine      → Core types, business tiers, marketing frameworks
 *   informalEconomyProfiles      → Pre-built profiles for nano/micro businesses (11 archetypes)
 *   economyProfilesExpansion     → SMB/mid-market/enterprise archetypes (25+ archetypes)
 *   creativeProductionPipeline   → Universal production pipeline (all input/output types)
 *   castCreativeStylesRegistry   → Pixar/Disney/Anime styles + 9 core regional variants
 *   regionalCreativeExpansion    → 40+ expanded regional variants (EU, MENA, Africa, Asia, LATAM, Oceania)
 *   crossProductIntelligenceBus  → Connects brand context across all 7 products
 *   castEndToEndPromptEngine     → Full production from prompt to final video
 *   simplifiedOnboarding         → Natural language → marketing intelligence
 *   universalEnrichmentBridge    → Connects ALL intelligence services into unified pipeline
 *
 * Data flow:
 *   User prompt → UniversalEnrichmentBridge → [brand + competitive + regional + product context]
 *     → enrichPromptWithRegion() checks core (9) + expanded (40+) regions
 *     → getRegionalMusicPrompt() / getRegionalNarrativeStyle() / getRegionalCompanionCreature()
 *     → ALL resolve from both core and expansion registries transparently
 *     → Cast production pipeline receives fully enriched prompts
 */

// ─── Core Engine ─────────────────────────────────────────────────────────────
export type {
  BusinessTier,
  InformalEconomyType,
  MarketingFramework,
  MessagingPillar,
  ToneOfVoice,
  CompetitivePosition,
  AudiencePersona,
  BrandIntelligenceProfile,
  STORMFramework,
  FourPsFramework,
  FourEsFramework,
} from './brandIntelligenceEngine';

export {
  BUSINESS_TIER_CONFIG,
  GENIESUITE_BRAND_PROFILE,
  createDefaultProfile,
  inferBusinessTier,
} from './brandIntelligenceEngine';

// ─── Informal Economy Profiles ───────────────────────────────────────────────
export type { InformalBusinessArchetype } from './informalEconomyProfiles';

export {
  STREET_FOOD_ARCHETYPES,
  SERVICE_BUSINESS_ARCHETYPES,
  ALL_BUSINESS_ARCHETYPES,
  findArchetypesByRegion,
  findArchetypesByType,
  findArchetypeById,
  getLocalizedArchetypeName,
  getSamplePrompt,
  generatePersonaFromArchetype,
} from './informalEconomyProfiles';

// ─── Economy Profiles Expansion (SMB → Enterprise) ──────────────────────────
export {
  RETAIL_ARCHETYPES,
  DIGITAL_FREELANCE_ARCHETYPES,
  AGRICULTURAL_ARCHETYPES,
  SMB_ARCHETYPES,
  MID_MARKET_ARCHETYPES,
  ENTERPRISE_ARCHETYPES,
  ALL_EXPANDED_ARCHETYPES,
  findExpandedArchetypesByTier,
  findExpandedArchetypesByRegion,
  getArchetypesByCategory,
} from './economyProfilesExpansion';

// ─── Creative Production Pipeline ────────────────────────────────────────────
export type {
  InputSourceType,
  PipelineInput,
  AssetHandling,
  AssetEnhancementOptions,
  OutputFormat,
  AspectRatio,
  QualityTier,
  OutputSpec,
  OutputDeliverable,
  ProductionScene,
  SceneInput,
  SceneVisualSpec,
  CharacterInScene,
  SceneAudioSpec,
  SceneTextOverlay,
  TransitionType,
  GeneratedAsset,
  ProductionMode,
  ProductionPlan,
  ProductionUseCase,
  PipelineRoute,
  PipelineStep,
  PipelineProviderConfig,
  UseCaseTemplate,
} from './creativeProductionPipeline';

export {
  PIPELINE_PROVIDERS,
  USE_CASE_TEMPLATES,
  getProviderForStep,
  getModelForStep,
  buildPipelineForUseCase,
  getUseCaseTemplate,
  getTemplatesForTier,
  estimateProductionCost,
} from './creativeProductionPipeline';

// ─── Cast Creative Styles Registry ───────────────────────────────────────────
export type {
  CreativeStyleFamily,
  AnimeSubStyle,
  CharacterType,
  CharacterDesign,
  CreativeStyleProfile,
  RegionalStyleVariant,
  HumorType,
} from './castCreativeStylesRegistry';

export {
  CREATIVE_STYLES,
  enrichPromptWithRegion,
  getRegionalMusicPrompt,
  getRegionalNarrativeStyle,
  getRegionalCompanionCreature,
  getStyleForRegion,
  getAllStyleFamilies,
  getStyleById,
  getAllSupportedRegionCodes,
  getRegionalVariant,
} from './castCreativeStylesRegistry';

// ─── Regional Creative Expansion (40+ zones) ────────────────────────────────
export {
  REGIONAL_EXPANSION,
  getExpandedRegionalVariant,
  getAllExpandedRegionCodes,
} from './regionalCreativeExpansion';

// ─── Cross-Product Intelligence Bus ──────────────────────────────────────────
export type {
  BusMessageType,
  GenieSuiteProduct,
  BusMessage,
  SparkContext,
  MindContext,
  DeckContext,
  CastContext,
  VibeContext,
  ArcContext,
} from './crossProductIntelligenceBus';

export {
  IntelligenceBus,
  getIntelligenceBus,
  resetIntelligenceBus,
} from './crossProductIntelligenceBus';

// ─── Cast End-to-End Prompt Engine ───────────────────────────────────────────
export type {
  CastPromptConfig,
  SceneScript,
  FullProductionScript,
} from './castEndToEndPromptEngine';

export {
  STYLE_PROMPT_TEMPLATES,
  PLATFORM_OUTPUT_CONFIGS,
  generateScenePrompts,
  buildFullProductionScript,
  getRecommendedPlatforms,
  getPlatformConfig,
} from './castEndToEndPromptEngine';

// ─── Simplified Onboarding ───────────────────────────────────────────────────
export type {
  OnboardingQuestion,
  OnboardingResponse,
  InferredProfile,
} from './simplifiedOnboarding';

export {
  ONBOARDING_QUESTIONS,
  inferProfileFromDescription,
  getQuestionsForTier,
  getQuestionInLanguage,
  getMinimumQuestionsForProfile,
} from './simplifiedOnboarding';

// ─── Universal Enrichment Bridge ────────────────────────────────────────────
export type {
  CompetitiveEnrichment,
  RegionalCreativeEnrichment,
  UnifiedProductContext,
  EnrichmentResult,
  BridgeConfig,
} from './universalEnrichmentBridge';

export {
  UniversalEnrichmentBridge,
  getEnrichmentBridge,
  resetEnrichmentBridge,
} from './universalEnrichmentBridge';
