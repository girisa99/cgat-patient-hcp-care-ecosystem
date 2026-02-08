/**
 * Marketing Services - Barrel Export
 * 
 * Complete dogfooding marketing engine with:
 * - Global scheduling (3x daily per region, timezone-aware)
 * - Rewards & incentives program
 * - AI generation integration (avatars, 3D, video)
 * - Feature auto-discovery & configurable messaging
 * - Unified ecosystem publishing (cross-product, company pages, industry filtering)
 * - Product version tracking & change detection
 * - AI messaging generator with approval workflow
 * - Dynamic marketing registry (database-driven products/audiences/languages)
 */

// Dynamic Registry (NEW - Database-driven)
export {
  dynamicMarketingRegistryService,
  type MarketingProduct,
  type MarketingAudience,
  type MarketingBrandAsset,
  type MarketingLanguage,
  type LegacyProduct,
  type LegacyAudience,
} from './dynamicMarketingRegistryService';

// Scheduler
export { 
  globalSchedulerService,
  REGIONAL_TIMEZONES,
  SPECIAL_DAYS_CALENDAR,
  type RegionalTimeSlot,
  type ScheduledPost,
  type SpecialDay,
} from './globalSchedulerService';

// Rewards
export {
  rewardsIncentiveService,
  BADGE_CATALOG,
  LEVEL_THRESHOLDS,
  type CreatorProfile,
  type CreatorLevel,
  type Badge,
  type LeaderboardEntry,
  type IncentiveProgram,
  type PublishedShowcase,
} from './rewardsIncentiveService';

// AI Generation
export {
  aiGenerationIntegration,
  REGIONAL_VOICE_CONFIG,
  REGIONAL_AVATAR_CONFIG,
  JOURNEY_TEMPLATES,
  FRAMEWORK_TEMPLATES,
  type GenerationRequest,
  type GenerationType,
  type VisualConfig,
  type AudioConfig,
  type GeneratedAssets,
} from './aiGenerationIntegration';

// Feature Discovery
export {
  featureDiscoveryService,
  MESSAGING_TEMPLATES,
  type DiscoveredFeature,
  type CustomMessaging,
  type FeatureCategory,
  type MessagingTemplate,
  type PositioningStatement,
} from './featureDiscoveryService';

// Product Version Tracking (Change Detection) - Legacy hardcoded, use dynamicMarketingRegistryService for new code
export {
  productVersionTrackingService,
  GENIE_PRODUCTS as VERSION_TRACKED_PRODUCTS,
  type ProductVersion,
  type ChangedFeature,
  type ProductChangeAlert,
  type VersionHistory,
  type GenieProductId,
} from './productVersionTrackingService';

// AI Messaging Generator (Hooks, CTAs, Positioning) - Legacy hardcoded audiences, use dynamicMarketingRegistryService for new code
export {
  aiMessagingGeneratorService,
  MESSAGING_FRAMEWORKS,
  TARGET_AUDIENCES,
  COMPETITOR_DATABASE,
  type MessagingRequest,
  type GeneratedMessaging,
  type CompetitorAnalysis,
} from './aiMessagingGeneratorService';

// Messaging Feedback & Improvement (Bi-weekly analysis)
export {
  messagingFeedbackService,
  IMPROVEMENT_CYCLE_DAYS,
  CONFUSION_SIGNAL_WEIGHTS,
  SENTIMENT_KEYWORDS,
  COMPETITOR_KEYWORDS,
  type UserFeedback,
  type ConfusionSignal,
  type UsagePattern,
  type MessagingImprovement,
  type ImprovementCycle,
  type MessagingAnalysis,
  type FeedbackSource,
} from './messagingFeedbackService';

// Genie Cast Orchestration (Unified Video Pipeline)
export {
  genieCastOrchestrationService,
  TTS_PROVIDERS,
  LANGUAGE_NAMES,
  type ProductScreenshot,
  type LocalizedScript,
  type VideoGenerationRequest,
  type GenerationPipeline,
  type MessagingContext,
} from './genieCastOrchestrationService';

// Unified Ecosystem Publishing (shared across all products)
export {
  unifiedEcosystemPublishingService,
  INDUSTRY_SEGMENTS,
  PLATFORM_CONTENT_LIMITS,
  type GenieProduct,
  type PublishingPlatform,
  type PublishingRequest,
  type PublishingResult,
  type PublishingTarget,
  type UserPublishingAccounts,
  type CompanyPage,
  type WebsiteConfig,
  type IndustrySegment,
  type ContentType,
} from '../unifiedEcosystemPublishingService';

// Framework-Aware Messaging Engine (Full Hybrid: STP + StoryBrand + 4Es + AIDA + JTBD + Blue Ocean)
export {
  frameworkMessagingEngine,
  AUDIENCE_FRAMEWORK_MATRIX,
  PRODUCT_MESSAGING,
  DEFAULT_AUDIENCE_MESSAGING,
  type MarketingFramework,
  type AudienceSegment,
  type MessagingTier,
  type FrameworkConfig,
  type AudienceMessaging,
  type SceneFrameworkTag,
  type FrameworkScriptComposition,
} from './frameworkMessagingEngine';
