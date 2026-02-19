/**
 * Genie Suite Hooks - Barrel Export
 * Re-exports all Genie Suite-specific hooks
 * 
 * For AI capabilities, use useUniversalAIHub which is the single source of truth
 * and includes contextual provider selection via useContextualAIProviders.
 */

// Core Genie Suite hooks from components folder
export { useMediaLibrary } from '@/components/genie-studio/hooks/useMediaLibrary';
export { useShowEvents } from '@/components/genie-studio/hooks/useShowEvents';

// Genie-specific hooks from main hooks folder
export { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
export { useGenieScripts, type GenieScript } from '@/components/genie-studio/useGenieScripts';
export { useGenieSparkSession } from '@/components/genie-studio/useGenieSparkSession';

// Genie management and configuration hooks
export { useGenieAnalytics } from '@/hooks/useGenieAnalytics';
export { useGenieBrandConfig } from '@/hooks/useGenieBrandConfig';
export { useGenieConfiguration } from '@/hooks/useGenieConfiguration';
export { useGenieConversation } from '@/hooks/useGenieConversation';
export { useGenieManagement } from '@/hooks/useGenieManagement';
export { useGenieSession } from '@/hooks/useGenieSession';
export { useGenieState } from '@/hooks/useGenieState';
export { useEnhancedGenieConversation } from '@/hooks/useEnhancedGenieConversation';
export { useConfigurableGenie } from '@/hooks/useConfigurableGenie';

// Vibe-specific hooks
export { useVibeProductionSync } from '@/hooks/useVibeProductionSync';
export { useVibeRecordingPersistence } from '@/hooks/useVibeRecordingPersistence';
export { useVibeSocialPublish } from '@/hooks/useVibeSocialPublish';
export { useVibeThumbnails } from '@/hooks/useVibeThumbnails';

// Cast production project management
export { useCastProjects } from '@/hooks/useCastProjects';
export { useShowCastLinks } from '@/hooks/useShowCastLinks';

// AI Hub - Single Source of Truth for all AI operations
export {
  useUniversalAIHub,
  useContextualAIProviders,
} from '@/hooks/useUniversalAIHub';
