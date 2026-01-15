/**
 * GENIE STUDIO - Product Root Index
 * 
 * This is the main entry point for Genie Studio product.
 * All Genie-specific components, hooks, services, and types should be
 * exported from here or their respective sub-indexes.
 * 
 * IMPORTANT: This product is designed for commercial launch.
 * Do NOT import healthcare-specific code into this module.
 * 
 * VERIFIED METRICS (2026-01-15 from folder structure):
 * - Pages: 10 (from pages/index.ts)
 * - Components: 55 exports (from components/index.ts)
 * - Hooks: 24 exports (from hooks/index.ts) + 26 additional here = 50 total
 * - Services: 18 exports (from services/index.ts) + 14 additional here = 32 total
 * - Edge Functions: 62 Genie-specific (out of 140 total)
 * - DB Tables: 42 Genie-specific (out of 180 total)
 * - AI Agents: 12 Genie-specific (out of 15 total)
 * 
 * @see src/shared/config/product-config.ts for product boundaries
 */

// =============================================================================
// PRODUCT METADATA
// =============================================================================
export const GENIE_STUDIO_PRODUCT = {
  id: 'genie-studio',
  name: 'Genie Studio',
  version: '2.0.0',
  tagline: 'Mind to Media',
  products: ['Genie Mind', 'Genie Vibe', 'Genie Spark', 'Genie Arc', 'Genie Hub'],
  description: 'AI-Powered Media Production Suite',
  commercialLaunch: true,
  
  // Verified metrics from folder structure audit
  metrics: {
    pages: 10,
    components: 55,
    hooks: 50,       // 24 from hooks/index + 26 additional exports here
    services: 32,    // 18 from services/index + 14 additional exports here
    edgeFunctions: 62,
    databaseTables: 42,
    aiAgents: 12,
    mobileComponents: 18,
  },
  
  subProducts: [
    { id: 'mind', name: 'Genie Mind', description: 'Script Writing & AI Intelligence' },
    { id: 'vibe', name: 'Genie Vibe', description: 'Recording Studio & Production' },
    { id: 'spark', name: 'Genie Spark', description: 'Quick-Start Content Creation' },
    { id: 'arc', name: 'Genie Arc', description: 'Advanced Production Workflows' },
    { id: 'hub', name: 'Genie Hub', description: 'Production Management & Collaboration' },
  ],
  
  agents: [
    'voice_coach_agent',
    'scene_analyzer_agent', 
    'music_composer_agent',
    'auto_editor_agent',
    'production_orchestrator_agent',
    'content_analyzer_agent',
    'voice_director_agent',
    'script_video_matcher_agent',
    'viral_predictor_agent',
    'social_cuts_agent',
    'thumbnail_creator_agent',
    'seo_optimizer_agent',
  ],
  
  ttsProviders: ['elevenlabs', 'google', 'azure', 'amazon', 'openai'],
} as const;

// =============================================================================
// MODULE EXPORTS (Phase 2 - Organized by domain)
// =============================================================================

// Pages - All Genie Studio pages
export * from './pages';

// Components - All Genie Studio components
export * from './components';

// Hooks - All Genie Studio hooks
export * from './hooks';

// Services - All Genie Studio services
export * from './services';

// Diagrams - Architecture and documentation
export * from './diagrams';

// =============================================================================
// ADDITIONAL RE-EXPORTS (Legacy compatibility)

// Key Genie Studio Components (individual exports - no index.ts yet)
export { AskGenie } from '@/components/genie-studio/AskGenie';
export { SmartContentPipeline } from '@/components/genie-studio/SmartContentPipeline';
export { FullPipelineWorkflow } from '@/components/genie-studio/FullPipelineWorkflow';
export { PipelineOrchestrationPanel } from '@/components/genie-studio/PipelineOrchestrationPanel';
export { ScriptEditorTab } from '@/components/genie-studio/ScriptEditorTab';
export { DashboardWelcome } from '@/components/genie-studio/DashboardWelcome';
export { GenieStudioInfoBanner } from '@/components/genie-studio/GenieStudioInfoBanner';
export { KnowledgeSearchPanel } from '@/components/genie-studio/KnowledgeSearchPanel';
export { VoiceSelector } from '@/components/genie-studio/VoiceSelector';

// Key Genie Components (individual exports)
export { GenieModelDropdown } from '@/components/genie/GenieModelDropdown';
export { GenieFeatureDropdown } from '@/components/genie/GenieFeatureDropdown';
export { ContextManager } from '@/components/genie/ContextManager';
export { GenieSessionManager } from '@/components/genie/GenieSessionManager';

// =============================================================================
// HOOKS (Phase 1 - Re-exports from current locations)
// =============================================================================
export { useGenieAnalytics } from '@/hooks/useGenieAnalytics';
export { useGenieBrandConfig } from '@/hooks/useGenieBrandConfig';
export { useGenieConfiguration } from '@/hooks/useGenieConfiguration';
export { useGenieConversation } from '@/hooks/useGenieConversation';
export { useGenieManagement } from '@/hooks/useGenieManagement';
export { useGenieSession } from '@/hooks/useGenieSession';
export { useGenieState } from '@/hooks/useGenieState';
export { useBulkJobs } from '@/hooks/useBulkJobs';
export { useVibeSocialPublish } from '@/hooks/useVibeSocialPublish';
export { useVibeProductionSync } from '@/hooks/useVibeProductionSync';
export { useVibeRecordingPersistence } from '@/hooks/useVibeRecordingPersistence';
export { useVibeThumbnails } from '@/hooks/useVibeThumbnails';
export { useSocialOAuth } from '@/hooks/useSocialOAuth';
export { useProductionContext } from '@/hooks/useProductionContext';
export { useProductionFeedbackSync } from '@/hooks/useProductionFeedbackSync';
export { useAutoEditorAgent } from '@/hooks/useAutoEditorAgent';
export { useDistributionAgent } from '@/hooks/useDistributionAgent';
export { useMusicComposerAgent } from '@/hooks/useMusicComposerAgent';
export { useVoiceDirector } from '@/hooks/useVoiceDirector';
export { useSceneAnalyzer } from '@/hooks/useSceneAnalyzer';
export { useScriptVideoMatcher } from '@/hooks/useScriptVideoMatcher';
export { usePresentationShare } from '@/hooks/usePresentationShare';
export { useConfigurableGenie } from '@/hooks/useConfigurableGenie';
export { useShows } from '@/hooks/useShows';
export { useProjects } from '@/hooks/useProjects';

// =============================================================================
// SERVICES (Phase 1 - Re-exports)
// =============================================================================
export { AIMediaService } from '@/services/aiMediaService';
export { geminiMediaService } from '@/services/geminiMediaService';
export { bulkVideoGenerationService } from '@/services/bulkVideoGenerationService';
export { seoOptimizationService } from '@/services/seoOptimizationService';
export { socialCutsService } from '@/services/socialCutsService';
export { universalMediaService } from '@/services/universalMediaService';
export { audioToScriptService } from '@/services/audioToScriptService';
export { documentToScriptService } from '@/services/documentToScriptService';
export { imageToScriptService } from '@/services/imageToScriptService';
export { videoToScriptService } from '@/services/videoToScriptService';
export { urlToScriptService } from '@/services/urlToScriptService';
export { mediaProductionOrchestrator } from '@/services/mediaProductionOrchestrator';
export { scheduledPublishingService } from '@/services/scheduledPublishingService';
export { multiLanguageDubbingService } from '@/services/multiLanguageDubbingService';

// =============================================================================
// PRODUCT ROUTES
// =============================================================================
export const GENIE_ROUTES = {
  studio: '/genie-studio',
  vibe: '/genie-vibe',
  productionHub: '/production-hub',
  contentTools: '/content-tools',
  landing: '/genie-studio-landing',
  storyboard: '/genie-studio-storyboard',
  mobileRecording: '/genie-studio-mobile-recording',
  settings: '/genie-settings',
  oauthCallback: '/social-oauth-callback',
  pricing: '/pricing',
  subscribe: '/subscribe',
} as const;

// =============================================================================
// FEATURE FLAGS (Can be toggled for gradual rollout)
// =============================================================================
export const GENIE_FEATURES = {
  // Core Features (Always enabled)
  scriptManagement: true,
  recordingStudio: true,
  ttsGeneration: true,
  exportPipeline: true,
  
  // P2 Features
  voiceCoachingAgent: true,
  sceneAnalysisAgent: true,
  contentAnalyzerAgent: true,
  askGenieAssistant: true,
  
  // P3 Features (Being rolled out)
  bulkVideoGeneration: true,
  autoThumbnails: true,
  seoOptimization: true,
  socialCuts: true,
  platformPublishing: true,
  innovativePublishing: true,
  bulkContentPanel: true,
  
  // P4 Features (Planned)
  multiLanguageSupport: false,
  realTimeCollaboration: false,
  versionControl: false,
  advancedAnalytics: false,
  
  // P5 Features (Enterprise)
  ssoSaml: false,
  whiteLabel: false,
  dataResidency: false,
} as const;
