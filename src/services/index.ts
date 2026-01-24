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
