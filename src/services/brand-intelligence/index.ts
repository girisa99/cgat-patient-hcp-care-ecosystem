/**
 * Brand Intelligence Engine — Barrel Export
 *
 * Unified marketing intelligence layer for GenieSuite ecosystem.
 * From Fortune 500 boardrooms to roadside food carts — one engine, all businesses.
 *
 * Architecture:
 *   brandIntelligenceEngine    → Core types, business tiers, marketing frameworks
 *   informalEconomyProfiles    → Pre-built profiles for micro-businesses globally
 *   creativeProductionPipeline → Universal production pipeline (all input/output types)
 *   castCreativeStylesRegistry → Pixar/Disney/Anime/Regional styles with cultural mapping
 *   crossProductIntelligenceBus→ Connects brand context across all 6 products
 *   castEndToEndPromptEngine   → Full production from prompt to final video
 *   simplifiedOnboarding       → Natural language → marketing intelligence
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
} from './castCreativeStylesRegistry';

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
