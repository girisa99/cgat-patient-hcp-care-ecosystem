/**
 * Marketing Services - Barrel Export
 * 
 * Complete dogfooding marketing engine with:
 * - Global scheduling (3x daily per region, timezone-aware)
 * - Rewards & incentives program
 * - AI generation integration (avatars, 3D, video)
 * - Feature auto-discovery & configurable messaging
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
