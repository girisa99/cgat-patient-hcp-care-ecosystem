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
 */

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

// Product Version Tracking (Change Detection)
export {
  productVersionTrackingService,
  GENIE_PRODUCTS as VERSION_TRACKED_PRODUCTS,
  type ProductVersion,
  type ChangedFeature,
  type ProductChangeAlert,
  type VersionHistory,
  type GenieProductId,
} from './productVersionTrackingService';

// AI Messaging Generator (Hooks, CTAs, Positioning)
export {
  aiMessagingGeneratorService,
  MESSAGING_FRAMEWORKS,
  TARGET_AUDIENCES,
  COMPETITOR_DATABASE,
  type MessagingRequest,
  type GeneratedMessaging,
  type CompetitorAnalysis,
} from './aiMessagingGeneratorService';

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
