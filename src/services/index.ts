/**
 * Services Index - Export all services
 */

export { intentDetectionService } from './intentDetectionService';
export type { ResponseIntent } from './intentDetectionService';

export { agentArchitectureIntelligence } from './agentArchitectureIntelligence';
export type { 
  AgentArchitectureType, 
  ArchitectureRecommendation, 
  ArchitectureAnalysis,
  InputFactor 
} from './agentArchitectureIntelligence';

// Regional Context Prompts (LLM, Image, Video, Avatar)
export { 
  RegionalContextPrompts,
  REGIONAL_SYSTEM_PROMPTS,
  REGIONAL_IMAGE_PROMPTS,
  REGIONAL_VIDEO_TONES,
  REGIONAL_AVATAR_STYLES,
  getRegionalSystemPrompt,
  getRegionalImagePrompt,
  getRegionalVideoTone,
  getRegionalAvatarStyle,
  buildRegionalEnhancedPrompt
} from './regionalContextPrompts';

// Content Frameworks Registry (Business, Video, Training, Marketing)
export {
  ContentFrameworksRegistry,
  BUSINESS_PRESENTATION_FRAMEWORKS,
  VIDEO_CONTENT_FRAMEWORKS,
  TRAINING_CONTENT_FRAMEWORKS,
  MARKETING_CONTENT_FRAMEWORKS,
  REGIONAL_FRAMEWORK_PREFERENCES,
  getFrameworksByContentType,
  getFrameworksForRegion,
  getRecommendedFrameworks,
  getFrameworkById,
  getFrameworksStats,
  searchFrameworks
} from './contentFrameworksRegistry';
export type {
  ContentFramework,
  VideoFramework,
  TrainingFramework,
  MarketingFramework,
  RegionalFrameworkPreference,
  FrameworkContentType
} from './contentFrameworksRegistry';

// Regional Presentation Templates (Slide Layouts, Formats, Components)
export {
  RegionalPresentationTemplatesRegistry,
  REGIONAL_SLIDE_PREFERENCES,
  TEMPLATE_CATEGORIES_BY_USE_CASE,
  REGIONAL_SLIDE_FORMATS,
  DEFAULT_SLIDE_COMPONENTS,
  getSlidePreferencesForRegion,
  getTemplateStyleForRegion,
  getSlideFormatForRegion,
  getComponentVariations,
  buildTemplateConfigForRegion
} from './regionalPresentationTemplates';
export type {
  RegionalSlidePreference,
  TemplateCategoryByRegion,
  RegionalSlideFormat,
  SlideComponent,
  SlideDensity,
  AnimationLevel,
  AspectRatio
} from './regionalPresentationTemplates';

// Regional Video Styles & Formats Registry
export {
  RegionalVideoStylesRegistry,
  VIDEO_AESTHETIC_PREFERENCES,
  VIDEO_DURATION_PREFERENCES,
  VIDEO_FORMAT_SPECIFICATIONS,
  REGIONAL_VIDEO_CONTENT_PREFERENCES,
  getVideoAestheticForRegion,
  getVideoDurationForRegion,
  getVideoFormatForPlatform,
  getVideoFormatsForAspectRatio,
  getVideoContentPreferencesForRegion,
  buildVideoConfigForRegion,
  getRecommendedPlatformsForRegion,
  getSupportedVideoRegions
} from './regionalVideoStylesRegistry';
export type {
  VideoPacing,
  MusicStyle,
  MotionGraphicsStyle,
  VideoAestheticPreference,
  VideoDurationPreference,
  VideoFormatSpec,
  RegionalVideoContentPreference
} from './regionalVideoStylesRegistry';

// Regional Avatar & Character Guidelines Registry
export {
  RegionalAvatarGuidelinesRegistry,
  AVATAR_APPEARANCE_PREFERENCES,
  AVATAR_GESTURE_GUIDELINES,
  AVATAR_VOICE_CHARACTERISTICS,
  getAvatarAppearanceForRegion,
  getAvatarGestureGuidelinesForRegion,
  getAvatarVoiceCharacteristicsForRegion,
  buildAvatarConfigForRegion,
  getRecommendedAvatarStyle,
  validateAvatarForRegion,
  getSupportedAvatarRegions
} from './regionalAvatarGuidelines';
export type {
  GenderOption,
  EyeContactLevel,
  VoicePace,
  FormalityLevel,
  AvatarAppearancePreference,
  AvatarGestureGuideline,
  AvatarVoiceCharacteristic
} from './regionalAvatarGuidelines';

// Regional 3D & Motion Graphics Registry
export {
  Regional3DMotionGraphicsRegistry,
  REGIONAL_3D_STYLE_PREFERENCES,
  REGIONAL_MOTION_GRAPHICS_STYLES,
  TOOL_RECOMMENDATIONS,
  MOTION_TEMPLATE_CATEGORIES,
  get3DStyleForRegion,
  getMotionGraphicsStyleForRegion,
  getRecommendedToolsForUseCase,
  getRTLCompatibleTemplates,
  getTemplatesForUseCase,
  build3DMotionConfigForRegion,
  getAnimationPresetForRegion,
  getSupported3DRegions
} from './regional3DMotionGraphicsRegistry';
export type {
  AnimationSpeed,
  LearningCurve,
  EasingStyle,
  Regional3DStylePreference,
  RegionalMotionGraphicsStyle,
  ToolRecommendation,
  MotionTemplateCategory
} from './regional3DMotionGraphicsRegistry';

// Regional Content Types & Categories Registry
export {
  RegionalContentTypesRegistry,
  CONTENT_CATEGORY_DEMAND,
  REGIONAL_USE_CASES,
  CONTENT_TONE_GUIDELINES,
  CONTENT_LENGTH_PREFERENCES,
  getCategoryDemand,
  getTopCategoriesForRegion,
  getUseCasesForRegion,
  getToneGuidelinesForRegion,
  getToneForRegion,
  getContentLengthForRegion,
  buildContentConfigForRegion,
  getSupportedContentRegions,
  isHighDemandCategory,
  getRecommendedContentTypes
} from './regionalContentTypesRegistry';
export type {
  DemandLevel,
  ContentCategory,
  ContentToneType,
  ContentLengthType,
  ContentCategoryDemand,
  RegionalUseCase,
  ContentToneGuideline,
  ContentLengthPreference
} from './regionalContentTypesRegistry';

// Regional Output Formats & File Types Registry
export {
  RegionalOutputFormatsRegistry,
  DOCUMENT_FORMAT_PREFERENCES,
  VIDEO_FORMAT_SPECS,
  REGIONAL_VIDEO_NOTES,
  IMAGE_FORMAT_SPECS,
  AUDIO_FORMAT_SPECS,
  PLATFORM_EXPORT_PRESETS,
  REGION_FORMAT_NOTES,
  getDocumentFormatDemand,
  getTopDocumentFormatsForRegion,
  getVideoFormatSpec,
  getImageFormatSpec,
  getAudioFormatSpec,
  getPlatformExportPreset,
  getPlatformsForRegion,
  getFormatNotesForRegion,
  getVideoNotesForRegion,
  buildOutputConfigForRegion,
  getRecommendedVideoResolution,
  requiresRTLSupport,
  getSupportedOutputFormatRegions
} from './regionalOutputFormatsRegistry';
export type {
  FormatDemand,
  FileSize,
  QualityType,
  SupportLevel,
  DocumentFormat,
  VideoFormat,
  ImageFormat,
  AudioFormat,
  DocumentFormatPreference,
  OutputVideoFormatSpec,
  ImageFormatSpec,
  AudioFormatSpec,
  PlatformExportPreset,
  RegionFormatNote,
  RegionalVideoNote
} from './regionalOutputFormatsRegistry';

// Sanctions & Compliance Registry
export {
  SanctionsComplianceRegistry,
  SANCTIONED_REGIONS,
  BLOCKED_COUNTRY_CODES,
  PROHIBITED_SERVICES_RUSSIA,
  DATA_RESIDENCY_REQUIREMENTS,
  COMPLIANCE_PHASES,
  isSanctionedCountry,
  getSanctionDetails,
  requiresDataResidency,
  getBlockedCountryCodes,
  getAllSanctionedRegions,
  getComplianceStatus,
  getBlockingMessage,
  isRegionAllowed
} from './sanctionsComplianceRegistry';
export type {
  SanctionStatus,
  CompliancePriority,
  BlockAction,
  SanctionedRegion,
  DataResidencyRequirement,
  CompliancePhase,
  ProhibitedService
} from './sanctionsComplianceRegistry';

// Arabic & MENA Localization Registry
export {
  ArabicMenaLocalizationRegistry,
  ARABIC_LANGUAGE_REQUIREMENTS,
  DIALECT_MAPPINGS,
  CULTURAL_CONSIDERATIONS,
  COUNTRY_CONFIGS,
  ARABIC_FONTS,
  getDialectForCountry,
  getDialectMapping,
  getVoiceProviderForCountry,
  getCountryConfig,
  isRTLCountry,
  getRecommendedArabicFont,
  getCulturalGuidelines,
  toEasternArabicNumerals,
  toWesternNumerals,
  buildMenaLocalizationConfig,
  getMenaImplementationStrategy
} from './arabicMenaLocalizationRegistry';
export type {
  ArabicDialect,
  MenaCountryCode,
  NumeralSystem,
  CalendarSystem,
  WeekendDays,
  ArabicLanguageRequirement,
  DialectMapping,
  CulturalConsideration,
  CountryLocalizationConfig,
  ArabicFontConfig
} from './arabicMenaLocalizationRegistry';

// Regional Compliance Registry (Privacy, Terms, Content Policies)
export {
  REGIONAL_PRIVACY_POLICIES,
  REGIONAL_CONTENT_POLICIES,
  REGIONAL_TERMS,
  COUNTRY_TO_REGION,
  getRegionFromCountry,
  getPrivacyPolicy,
  getContentPolicy,
  getTermsOfService,
  getFullComplianceConfig
} from './regionalComplianceRegistry';
export type {
  ComplianceRegion,
  ContentRestrictionLevel,
  RegionalPrivacyPolicy,
  RegionalContentPolicy,
  RegionalTermsOfService
} from './regionalComplianceRegistry';

// Enhanced Content Moderation Service
export {
  enhancedContentModeration
} from './enhancedContentModerationService';
export type {
  ContentModerationConfig,
  ModerationResult,
  ContentViolation,
  ContentWarning,
  RegionalFlag,
  ViolationType,
  ContentCategory as ModerationContentCategory
} from './enhancedContentModerationService';

// Unified Routing Logic (LLM, TTS, STT, Translation)
export {
  selectLLM,
  selectTTS,
  selectSTT,
  selectTranslation,
  getUnifiedRouting,
  getRegionalCostEstimate,
  getAllZoneConfigurations,
  REGIONAL_CONTEXT_PROMPTS,
  CLAUDE_REGIONS,
  QWEN_REGIONS,
  GPT4_ARABIC_REGIONS,
  GEMINI_REGIONS,
  ELEVENLABS_REGIONS,
  CJK_REGIONS
} from './unifiedRoutingLogic';
export type {
  TaskType,
  QualityTier,
  RoutingZone,
  LLMRoutingResult,
  TTSRoutingResult,
  STTRoutingResult,
  TranslationRoutingResult,
  RegionalContextPrompt,
  RegionalCostEstimate,
  UnifiedRoutingConfig,
  UnifiedRoutingResult
} from './unifiedRoutingLogic';

// Quality Benchmarks & Testing Strategy Service
export {
  LLM_QUALITY_BENCHMARKS,
  TTS_QUALITY_BENCHMARKS,
  PROVIDER_LATENCY,
  TESTING_MATRIX,
  AB_TEST_CONFIGS,
  QUALITY_MONITORING_METRICS,
  getLLMQualityForLanguage,
  getTTSQualityForLanguage,
  getProviderLatency,
  assessQualityScore,
  validateTestCriteria,
  getProviderRecommendation,
  getQualityDashboardData
} from './qualityBenchmarkService';
export type {
  QualityRating,
  NaturalnessRating,
  TestStatus,
  LLMQualityBenchmark,
  TTSQualityBenchmark,
  ProviderLatency,
  TestCriteria,
  ABTestConfig,
  QualityMetric,
  ProviderRecommendation,
  QualityDashboardData
} from './qualityBenchmarkService';

// Generation Pipeline Integration (Step 7 Pre-Generation)
export {
  validateGenerationPipeline,
  validateContent,
  getProvidersForWizardStep,
  buildEnhancedGenerationRequest,
  createQualityLog,
  getStep7ValidationSummary
} from './generationPipelineIntegration';
export type {
  GenerationPipelineConfig,
  PipelineValidationResult,
  ContentValidationResult,
  StepProviderConfig,
  EnhancedGenerationRequest,
  GenerationQualityLog
} from './generationPipelineIntegration';

// Resilience Services (P4 Recovery & Error)
export {
  circuitBreakerService,
  gracefulDegradationService,
} from './resilience';
export type {
  CircuitState,
  CircuitBreakerConfig,
  ProviderCircuit,
  CircuitBreakerEvent,
  QualityTier as ResilienceQualityTier,
  DegradationConfig,
  ProviderFallback,
  DegradationEvent,
} from './resilience';

// Collaboration Services (P4 Collaboration)
export {
  approvalWorkflowService,
} from './collaboration';
export type {
  ApprovalStatus,
  ApprovalPriority,
  ApprovalRequest,
  ApprovalStep,
  ApprovalRule,
  ApprovalNotification,
} from './collaboration';

// Advanced Analytics Services (P4 Analytics)
export {
  advancedAnalyticsService,
} from './analytics';
export type {
  RevenueMetrics,
  CohortData,
  FunnelStep,
  PipelineAnalytics,
  ABTestResult,
  ABVariant,
  DashboardWidget,
} from './analytics';
