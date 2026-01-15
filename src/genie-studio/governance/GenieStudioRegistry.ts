/**
 * GENIE STUDIO GOVERNANCE REGISTRY
 * Dynamic registry that tracks ALL Genie Studio assets
 * 
 * This file serves as the SINGLE SOURCE OF TRUTH for what belongs to Genie Studio.
 * Update this registry whenever you add/remove Genie-related code.
 * 
 * Last Audit: 2026-01-15
 */

// =============================================================================
// EDGE FUNCTIONS (62 total - verified from supabase/functions/)
// =============================================================================
export const GENIE_EDGE_FUNCTIONS = {
  // TTS & Voice (10)
  tts: [
    'amazon-polly',
    'azure-tts',
    'elevenlabs-voice',
    'elevenlabs-music',
    'google-tts',
    'openai-tts',
    'huggingface-speech',
    'text-to-speech',
    'voice-clone-processor',
    'voice-to-text',
  ],
  
  // AI Processing & Agents (13)
  aiAgents: [
    'ai-universal-processor',
    'ai-video-generator',
    'ai-image-generator',
    'scene-analyzer',
    'music-composer-agent',
    'voice-director-agent',
    'content-analyzer',
    'script-video-matcher',
    'auto-editor-agent',
    'viral-score-predictor',
    'generate-agent-from-prompt',
    'agent-test-runner',
    'distribution-agent',
  ],
  
  // Script & Media Processing (10)
  scriptMedia: [
    'analyze-script',
    'enhance-script',
    'extract-video-audio',
    'video-to-script',
    'audio-mixer',
    'shorts-generator',
    'quiz-video-generator',
    'gemini-generate-video',
    'gemini-generate-image',
    'visual-content-search',
  ],
  
  // Publishing & Social (10)
  publishing: [
    'social-publish',
    'youtube-oauth',
    'linkedin-oauth',
    'auto-thumbnail-generator',
    'og-metadata',
    'seo-service',
    'thread-generator',
    'carousel-creator',
    'scheduled-publish',
    'platform-analytics',
  ],
  
  // Core Genie Infrastructure (13)
  coreInfra: [
    'bulk-operations',
    'recording-processor',
    'workflow-executor',
    'template-marketplace',
    'rag-knowledge-processor',
    'rag-search',
    'crawl-relevant-content',
    'generate-knowledge-content',
    'get-ai-credits',
    'use-ai-credits',
    'purchase-credits',
    'recurring-scheduler',
    'analyze-workflow-suggestions',
  ],
  
  // Misc/Support (6)
  misc: [
    'check-ai-provider',
    'claude-ai-chat',
    'chat-with-claude',
    'test-api-service',
    'rag-status',
    'notify-recording-consent',
  ],
} as const;

// =============================================================================
// HOOKS (50 total - from hooks/index.ts + main index.ts)
// =============================================================================
export const GENIE_HOOKS = {
  // Core Genie (9)
  core: [
    'useGenieAnalytics',
    'useGenieBrandConfig',
    'useGenieConfiguration',
    'useGenieConversation',
    'useGenieManagement',
    'useGenieSession',
    'useGenieState',
    'useEnhancedGenieConversation',
    'useConfigurableGenie',
  ],
  
  // Vibe Production (8)
  vibe: [
    'useVibeProductionSync',
    'useVibeRecordingPersistence',
    'useVibeSocialPublish',
    'useVibeThumbnails',
    'useProductionContext',
    'useProductionFeedbackSync',
    'useProjects',
    'useShows',
  ],
  
  // Media & Script (6)
  media: [
    'useScriptVideoMatcher',
    'useVoiceAnalytics',
    'useVoiceDirector',
    'useMediaRecorder',
    'useBulkJobs',
    'useSocialOAuth',
  ],
  
  // AI Agents (6)
  agents: [
    'useAutoEditorAgent',
    'useDistributionAgent',
    'useMusicComposerAgent',
    'useSceneAnalyzer',
    'usePresentationShare',
    'useVoiceDirector',
  ],
  
  // Component-specific (from genie-studio/hooks) (5)
  componentHooks: [
    'useMediaLibrary',
    'useShowEvents',
    'useGenieMediaLibrary',
    'useGenieScripts',
    'useGenieSparkSession',
  ],
} as const;

// =============================================================================
// SERVICES (32 total - from services/index.ts + main index.ts)
// =============================================================================
export const GENIE_SERVICES = {
  // Script Generation (6)
  scriptGen: [
    'genieScriptService',
    'audioToScriptService',
    'videoToScriptService',
    'documentToScriptService',
    'imageToScriptService',
    'urlToScriptService',
  ],
  
  // Media Production (8)
  mediaProd: [
    'AIMediaService',
    'geminiMediaService',
    'universalMediaService',
    'mediaProductionOrchestrator',
    'multiLanguageDubbingService',
    'externalVisualContentService',
    'bulkVideoGenerationService',
    'socialCutsService',
  ],
  
  // Publishing & Distribution (4)
  publishing: [
    'scheduledPublishingService',
    'seoOptimizationService',
    'unifiedChannelDeploymentService',
    'contentViolationTracker',
  ],
  
  // AI Provider (3)
  aiProvider: [
    'aiProviderService',
    'enhancedAIService',
    'unifiedAIConnector',
  ],
} as const;

// =============================================================================
// DATABASE TABLES (42 Genie-specific)
// =============================================================================
export const GENIE_DATABASE_TABLES = [
  // Scripts & Content
  'scripts', 'script_versions', 'script_collaborators',
  
  // Recordings & Media
  'vibe_recordings', 'vibe_clips', 'media_assets', 'thumbnails',
  
  // Shows & Production
  'shows', 'show_participants', 'show_assets', 'show_sessions',
  'projects', 'production_feedback',
  
  // Bulk Processing
  'bulk_jobs', 'bulk_job_items', 'bulk_job_results',
  
  // Social & Publishing
  'social_connections', 'social_posts', 'scheduled_posts',
  'platform_analytics', 'oauth_tokens',
  
  // AI & Agents (Genie-specific)
  'genie_configurations', 'genie_conversations', 'genie_deployments',
  'agent_sessions', 'agent_workflows', 'agent_actions',
  
  // Content & Knowledge
  'knowledge_base', 'rag_documents', 'content_templates',
  
  // Analytics & Tracking
  'voice_analytics_events', 'content_analytics', 'seo_scores',
  
  // Brand & Config
  'brand_configurations', 'deployment_configs',
] as const;

// =============================================================================
// AI AGENTS (12 Genie-specific)
// =============================================================================
export const GENIE_AI_AGENTS = [
  { id: 'voice_coach_agent', name: 'Voice Coach', category: 'production' },
  { id: 'scene_analyzer_agent', name: 'Scene Analyzer', category: 'analysis' },
  { id: 'music_composer_agent', name: 'Music Composer', category: 'creative' },
  { id: 'auto_editor_agent', name: 'Auto Editor', category: 'production' },
  { id: 'production_orchestrator_agent', name: 'Production Orchestrator', category: 'workflow' },
  { id: 'content_analyzer_agent', name: 'Content Analyzer', category: 'analysis' },
  { id: 'voice_director_agent', name: 'Voice Director', category: 'production' },
  { id: 'script_video_matcher_agent', name: 'Script-Video Matcher', category: 'matching' },
  { id: 'viral_predictor_agent', name: 'Viral Predictor', category: 'analytics' },
  { id: 'social_cuts_agent', name: 'Social Cuts', category: 'production' },
  { id: 'thumbnail_creator_agent', name: 'Thumbnail Creator', category: 'creative' },
  { id: 'seo_optimizer_agent', name: 'SEO Optimizer', category: 'analytics' },
] as const;

// =============================================================================
// PAGES (10 Genie-specific)
// =============================================================================
export const GENIE_PAGES = [
  { path: '/genie-studio', component: 'GenieStudio', description: 'Main unified hub' },
  { path: '/genie-spark', component: 'GenieSpark', description: 'Quick-start content creation' },
  { path: '/genie-vibe', component: 'GenieVibe', description: 'Recording studio' },
  { path: '/genie-mind', component: 'GenieMind', description: 'Script writing & AI' },
  { path: '/genie-arc', component: 'GenieArc', description: 'Advanced production' },
  { path: '/genie-analytics', component: 'GenieAnalyticsPage', description: 'Analytics dashboard' },
  { path: '/genie-studio-auth', component: 'GenieStudioAuth', description: 'Auth page' },
  { path: '/pricing', component: 'GenieStudioPricing', description: 'Pricing page' },
  { path: '/configurable-genie', component: 'ConfigurableGeniePage', description: 'White-label config' },
  { path: '/genie-management', component: 'GenieManagementPage', description: 'Instance management' },
] as const;

// =============================================================================
// CALCULATED METRICS (Dynamic)
// =============================================================================
export const calculateGenieMetrics = () => {
  const edgeFunctionCount = Object.values(GENIE_EDGE_FUNCTIONS).flat().length;
  const hookCount = Object.values(GENIE_HOOKS).flat().length;
  const serviceCount = Object.values(GENIE_SERVICES).flat().length;
  const dbTableCount = GENIE_DATABASE_TABLES.length;
  const agentCount = GENIE_AI_AGENTS.length;
  const pageCount = GENIE_PAGES.length;
  
  return {
    edgeFunctions: edgeFunctionCount,
    hooks: hookCount,
    services: serviceCount,
    databaseTables: dbTableCount,
    aiAgents: agentCount,
    pages: pageCount,
    
    // Breakdown by category
    breakdown: {
      edgeFunctions: {
        tts: GENIE_EDGE_FUNCTIONS.tts.length,
        aiAgents: GENIE_EDGE_FUNCTIONS.aiAgents.length,
        scriptMedia: GENIE_EDGE_FUNCTIONS.scriptMedia.length,
        publishing: GENIE_EDGE_FUNCTIONS.publishing.length,
        coreInfra: GENIE_EDGE_FUNCTIONS.coreInfra.length,
        misc: GENIE_EDGE_FUNCTIONS.misc.length,
      },
      hooks: {
        core: GENIE_HOOKS.core.length,
        vibe: GENIE_HOOKS.vibe.length,
        media: GENIE_HOOKS.media.length,
        agents: GENIE_HOOKS.agents.length,
        componentHooks: GENIE_HOOKS.componentHooks.length,
      },
      services: {
        scriptGen: GENIE_SERVICES.scriptGen.length,
        mediaProd: GENIE_SERVICES.mediaProd.length,
        publishing: GENIE_SERVICES.publishing.length,
        aiProvider: GENIE_SERVICES.aiProvider.length,
      },
    },
    
    lastUpdated: '2026-01-15',
  };
};

// =============================================================================
// VALIDATION: Check if an asset belongs to Genie Studio
// =============================================================================
export const isGenieAsset = {
  edgeFunction: (name: string) => 
    Object.values(GENIE_EDGE_FUNCTIONS).flat().includes(name as any),
  
  hook: (name: string) => 
    Object.values(GENIE_HOOKS).flat().includes(name as any),
  
  service: (name: string) => 
    Object.values(GENIE_SERVICES).flat().includes(name as any),
  
  table: (name: string) => 
    GENIE_DATABASE_TABLES.includes(name as any),
  
  agent: (id: string) => 
    GENIE_AI_AGENTS.some(a => a.id === id),
  
  page: (path: string) => 
    GENIE_PAGES.some(p => p.path === path),
};

// Export calculated metrics for use in Command Center
export const GENIE_DYNAMIC_METRICS = calculateGenieMetrics();
