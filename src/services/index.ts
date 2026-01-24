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
