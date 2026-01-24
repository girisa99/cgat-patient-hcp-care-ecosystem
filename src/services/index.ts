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
