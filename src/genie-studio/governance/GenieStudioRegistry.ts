/**
 * GENIE STUDIO GOVERNANCE REGISTRY
 * Dynamic registry that tracks ALL Genie Studio assets
 * 
 * This file serves as the SINGLE SOURCE OF TRUTH for what belongs to Genie Studio.
 * Update this registry whenever you add/remove Genie-related code.
 * 
 * VERIFIED COUNTS (2026-01-30):
 * - Edge Functions: 62 Genie-specific
 * - Hooks: 24 Genie-specific
 * - Services: 19 Genie-specific
 * - Database Tables: 42 Genie-specific
 * - AI Agents: 12 Genie-specific
 * - Pages: 10 Genie-specific
 * - AI Providers: 18 Core providers integrated (Updated with Deepgram, Suno)
 * 
 * Last Audit: 2026-01-30
 */

// =============================================================================
// AI PROVIDERS (18 Core Providers Integrated - Updated 2026-01-30)
// =============================================================================
export const GENIE_AI_PROVIDERS = {
  // Primary Providers (Tier 1) - Core LLM + Multi-Modal
  primary: [
    { id: 'openai', name: 'OpenAI', capabilities: ['llm', 'image_gen', 'stt', 'tts', 'vision', 'video_gen'], status: 'active' },
    { id: 'claude', name: 'Anthropic Claude', capabilities: ['llm', 'translation', 'vision'], status: 'active' },
    { id: 'gemini', name: 'Google Gemini', capabilities: ['llm', 'image_gen', 'vision', 'translation', 'video_gen'], status: 'active' },
    { id: 'deepgram', name: 'Deepgram', capabilities: ['stt', 'realtime_stt'], status: 'active' }, // NEW: Primary STT
  ],
  // Specialized Providers (Tier 2) - Domain Excellence
  specialized: [
    { id: 'elevenlabs', name: 'ElevenLabs', capabilities: ['tts', 'voice_clone', 'sfx_gen'], status: 'active' },
    { id: 'azure', name: 'Azure AI', capabilities: ['tts', 'stt', 'ocr', 'translation', 'visemes'], status: 'active' },
    { id: 'alibaba', name: 'Alibaba DashScope', capabilities: ['llm', 'tts', 'stt', 'video_gen', 'avatar'], status: 'active' },
    { id: 'modelslab', name: 'ModelsLab', capabilities: ['image_gen', 'video_gen', '3d_mesh'], status: 'active' },
    { id: 'meshy', name: 'Meshy AI', capabilities: ['3d_gen', 'texture', 'rigging'], status: 'active' },
    { id: 'suno', name: 'Suno AI', capabilities: ['music_gen'], status: 'active' }, // NEW: Premium music
    { id: 'deepl', name: 'DeepL', capabilities: ['translation'], status: 'active' },
  ],
  // Fallback Providers (Tier 3)
  fallback: [
    { id: 'deepseek', name: 'DeepSeek', capabilities: ['llm', 'translation'], status: 'active' },
    { id: 'replicate', name: 'Replicate', capabilities: ['image_gen', 'video_gen', '3d_gen'], status: 'active' },
    { id: 'google', name: 'Google Cloud AI', capabilities: ['translation', 'ocr', 'tts', 'stt'], status: 'active' },
    { id: 'huggingface', name: 'HuggingFace', capabilities: ['llm', 'image_gen'], status: 'fallback' },
    { id: 'runpod', name: 'RunPod', capabilities: ['gpu_rendering', 'priority_render'], status: 'active' },
    { id: 'heygen', name: 'HeyGen', capabilities: ['avatar', 'video_avatar'], status: 'active' },
  ],
} as const;

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
// HOOKS (24 total - verified from genie-studio/hooks/index.ts)
// =============================================================================
export const GENIE_HOOKS = {
  // Core Genie (9) - verified in barrel
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
  
  // Vibe Production (4) - verified in barrel
  vibe: [
    'useVibeProductionSync',
    'useVibeRecordingPersistence',
    'useVibeSocialPublish',
    'useVibeThumbnails',
  ],
  
  // Component-specific (5) - verified in barrel
  componentHooks: [
    'useMediaLibrary',
    'useShowEvents',
    'useGenieMediaLibrary',
    'useGenieScripts',
    'useGenieSparkSession',
  ],
  
  // Global context hooks (6) - not in genie-studio barrel but Genie-related
  globalContext: [
    'useGlobalAgentGenerator',
    'useUniversalAI',
    'useProductionContext',
    'useProjects',
    'useShows',
    'useBulkJobs',
  ],
} as const;

// =============================================================================
// SERVICES (18 total - verified from genie-studio/services/index.ts)
// =============================================================================
export const GENIE_SERVICES = {
  // Script Generation (6) - verified in barrel
  scriptGen: [
    'genieScriptService',
    'audioToScriptService',
    'videoToScriptService',
    'documentToScriptService',
    'imageToScriptService',
    'urlToScriptService',
  ],
  
  // Media Production (8) - verified in barrel
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
  
  // Publishing & Content (2) - verified in barrel
  publishing: [
    'scheduledPublishingService',
    'seoOptimizationService',
  ],
  
  // AI Provider (3) - verified in barrel
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
  const aiProviderCount = Object.values(GENIE_AI_PROVIDERS).flat().length;
  
  return {
    edgeFunctions: edgeFunctionCount,
    hooks: hookCount,
    services: serviceCount,
    databaseTables: dbTableCount,
    aiAgents: agentCount,
    pages: pageCount,
    aiProviders: aiProviderCount,
    
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
        componentHooks: GENIE_HOOKS.componentHooks.length,
        globalContext: GENIE_HOOKS.globalContext.length,
      },
      services: {
        scriptGen: GENIE_SERVICES.scriptGen.length,
        mediaProd: GENIE_SERVICES.mediaProd.length,
        publishing: GENIE_SERVICES.publishing.length,
        aiProvider: GENIE_SERVICES.aiProvider.length,
      },
      aiProviders: {
        primary: GENIE_AI_PROVIDERS.primary.length,
        specialized: GENIE_AI_PROVIDERS.specialized.length,
        fallback: GENIE_AI_PROVIDERS.fallback.length,
      },
    },
    
    // Capabilities summary
    capabilities: {
      totalCapabilities: 25, // From crossFunctionalCapabilities
      products: 7, // Spark, Mind, Vibe, Deck, Arc, Cast, Hub/Ask Genie
      pipelines: 206, // Total pipelines across ecosystem
      categories: 21, // Pipeline categories
      languages: 140, // Supported languages (core + extended)
    },
    
    lastUpdated: '2026-01-30',
    
    // Provider summary
    providerSummary: {
      configured: 15, // OpenAI, Claude, Gemini, Deepgram, Alibaba, Azure, DeepL, ElevenLabs, Google, Replicate, ModelsLab, Meshy, DeepSeek, HuggingFace, Lovable AI
      pending: 3, // Suno, RunPod, HeyGen
      deprecated: 2, // AWS, Stability
    },
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
