import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { 
  GenerationContext, 
  computeA2ARequirements,
  VISUAL_FEATURE_A2A_ROUTING,
  GlobalTierLevel
} from "../_shared/generationContext.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Content moderation - blocked patterns for adult/inappropriate content
const BLOCKED_PATTERNS = [
  /\b(nsfw|xxx|porn|explicit|adult\s*content|nude|naked|sex(ual)?|erotic)\b/i,
  /\b(gore|violent|murder|brutal|blood|weapon)\b/i,
  /\b(hate|racist|discriminat|harass)\b/i,
  /\b(child|minor|kid|underage)\s*(nude|naked|sex)/i,
  /\b(deep\s*fake|fake\s*celebrity)\b/i,
];

function moderatePrompt(prompt: string): { isAllowed: boolean; reason?: string } {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(lowerPrompt)) {
      return { 
        isAllowed: false, 
        reason: 'Content policy violation: Prompt contains prohibited content. Adult, violent, or inappropriate content is not allowed.' 
      };
    }
  }
  
  return { isAllowed: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      prompt, 
      provider = 'auto', 
      model = 'auto', 
      duration = 5,
      aspectRatio = '16:9',
      quality = 'standard',
      referenceImage,
      // Avatar/Lip-sync specific params
      type = 'video', // 'video' | 'avatar' | 'lipsync'
      sourceImage,
      audioUrl,
      script,
      language = 'en-US',
      voiceId,
      // NEW: Visual type for smart routing (130+ types supported)
      visualType = 'default',
      // NEW: Premium feature routing from frontend
      priorityRendering = false, // Use RunPod for dedicated GPU
      fullBody = false, // Use OmniAvatar for full-body
      // NEW: Full Generation Context for A2A routing
      generationContext,
      userTier = 'starter' as GlobalTierLevel,
    } = body;
    
    // Log context if provided
    if (generationContext) {
      const a2aConfig = computeA2ARequirements(generationContext);
      console.log('[Video-Gen] A2A Config:', {
        a2aRequired: a2aConfig.a2aRequired,
        tier: a2aConfig.tier,
        agents: a2aConfig.requiredAgents.length,
      });
    }

    // Handle poll_task — client-side polling for async WAN video generation
    if (body.action === 'poll_task' && body.taskId) {
      const intlKey = Deno.env.get('ALIBABA_API_KEY');
      const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
      const apiKey = intlKey || chinaKey;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'No Alibaba API key' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const pollBase = (chinaKey && !intlKey)
        ? 'https://dashscope.aliyuncs.com/api/v1'
        : 'https://dashscope-intl.aliyuncs.com/api/v1';
      try {
        const resp = await fetch(`${pollBase}/tasks/${body.taskId}`, {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        });
        const data = await resp.json();
        const status = data.output?.task_status || 'UNKNOWN';
        if (status === 'SUCCEEDED') {
          const videoUrl = data.output?.video_url || data.output?.results?.[0]?.url;
          return new Response(JSON.stringify({ success: true, videoUrl, status }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: false, status, message: data.output?.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, status: 'ERROR', message: String(e) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle avatar/lip-sync generation
    if (type === 'avatar' || type === 'lipsync') {
      console.log(`🎭 Generating ${type} with ${provider !== 'auto' ? provider : 'auto-selected'} provider`);
      console.log(`   Priority Rendering: ${priorityRendering}, Full Body: ${fullBody}`);
      
      const avatarResult = await generateAvatarOrLipSync({
        type,
        sourceImage: sourceImage || referenceImage,
        audioUrl,
        script: script || prompt,
        language,
        voiceId,
        // Pass provider override from frontend (determined by useRegionalLanguage)
        providerOverride: provider !== 'auto' ? provider : undefined,
        fullBody,
        priorityRendering,
      });
      
      return new Response(JSON.stringify({
        success: true,
        ...avatarResult,
        type,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Content moderation check
    const moderationResult = moderatePrompt(prompt);
    if (!moderationResult.isAllowed) {
      console.log('🚫 Content blocked:', moderationResult.reason);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: moderationResult.reason,
          blocked: true,
          contentPolicy: true
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract region from request for smart routing
    const region = body.region || 'US';
    
    // Auto-select provider based on visual type, region, and availability
    const selectedProvider = selectProvider(provider, region, visualType);
    const selectedModel = selectModel(selectedProvider, model);
    
    console.log(`🎬 Smart routing: provider=${selectedProvider}, model=${selectedModel}, region=${region}, visualType=${visualType}`);

    let result: VideoResult;
    const startTime = Date.now();

    switch (selectedProvider) {
      case 'sora2api':
        result = await generateWithSora2API(prompt, selectedModel, duration, aspectRatio);
        break;
      case 'openai':
        result = await generateWithOpenAI(prompt, selectedModel, duration, aspectRatio);
        break;
      case 'modelslab':
        result = await generateWithModelsLab(prompt, selectedModel, duration, referenceImage);
        break;
      case 'alibaba':
        result = await generateWithAlibabaWAN(prompt, selectedModel, duration, referenceImage);
        break;
      case 'replicate':
        result = await generateWithReplicate(prompt, selectedModel);
        break;
      case 'gemini':
        result = await generateWithGemini(prompt, duration, aspectRatio);
        break;
      default:
        // Try fallback chain
        result = await generateWithFallbackChain(prompt, duration, aspectRatio, referenceImage);
    }


    const processingTime = Date.now() - startTime;
    
    // If video is still generating async, don't use a placeholder — return task info
    const isAsync = result.asyncGeneration === true || !result.videoUrl;
    const finalVideoUrl = result.videoUrl || null;

    // Log the result for debugging
    console.log(`✅ Video generation ${isAsync ? 'submitted (async)' : 'complete'}: ${result.provider}/${result.model}, videoUrl: ${finalVideoUrl?.substring(0, 80) || '(pending)'}`);

    return new Response(JSON.stringify({
      success: true,
      videoUrl: finalVideoUrl,
      thumbnailUrl: result.thumbnailUrl || null,
      taskId: result.taskId || null,
      processingTime,
      contentModerated: true,
      asyncGeneration: isAsync,
      disclaimer: 'This is AI-generated video content. Please verify before use.',
      metadata: {
        prompt,
        provider: result.provider,
        model: result.model,
        duration,
        aspectRatio,
        timestamp: new Date().toISOString(),
        contentPolicy: 'Applied'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in ai-video-generator function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface VideoResult {
  videoUrl: string;
  thumbnailUrl?: string;
  provider: string;
  model: string;
  taskId?: string;          // For async generation (WAN models) — client can poll later
  asyncGeneration?: boolean; // True when video is still generating
  visemeData?: VisemeData[];
}

interface VisemeData {
  offset: number;
  visemeId: number;
  audioOffset?: number;
}

interface AvatarRequest {
  type: 'avatar' | 'lipsync';
  sourceImage?: string;
  audioUrl?: string;
  script?: string;
  language?: string;
  voiceId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMART MULTI-PROVIDER ROUTING (12+ Providers)
// ═══════════════════════════════════════════════════════════════════════════════

// Regional zone definitions for intelligent routing
const CJK_REGIONS = ['CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MO'];
const INDIA_SEA_REGIONS = ['IN', 'PK', 'BD', 'LK', 'NP', 'ID', 'VN', 'TH', 'PH', 'MY', 'MM'];
const EU_REGIONS = ['DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BE', 'AT', 'CH', 'UK', 'IE'];
const MENA_REGIONS = ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'MA', 'TN'];
const AFRICA_REGIONS = ['NG', 'KE', 'GH', 'ZA', 'ET', 'TZ', 'UG', 'ZW', 'ZM', 'RW', 'SN'];

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL TYPE → PROVIDER ROUTING MATRIX (130+ Visual Types)
// ═══════════════════════════════════════════════════════════════════════════════
interface VisualTypeRouting {
  primaryProvider: string;
  fallbackProviders: string[];
  specialCapabilities?: string[];
}

// Master routing matrix for all visual types
const VISUAL_TYPE_ROUTING_MATRIX: Record<string, VisualTypeRouting> = {
  // ═══ CINEMATIC & REALISTIC (Sora2API Primary) ═══
  'cinematic': { primaryProvider: 'sora2api', fallbackProviders: ['modelslab', 'gemini'] },
  'realistic': { primaryProvider: 'sora2api', fallbackProviders: ['modelslab', 'gemini'] },
  'documentary': { primaryProvider: 'sora2api', fallbackProviders: ['gemini', 'modelslab'] },
  'commercial': { primaryProvider: 'sora2api', fallbackProviders: ['modelslab', 'alibaba'] },
  'film_quality': { primaryProvider: 'sora2api', fallbackProviders: ['modelslab'] },
  'premium_video': { primaryProvider: 'sora2api', fallbackProviders: ['modelslab'] },
  'stock_footage': { primaryProvider: 'sora2api', fallbackProviders: ['modelslab', 'gemini'] },
  
  // ═══ AVATAR & LIP-SYNC (Alibaba Primary) ═══
  'avatar': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'], specialCapabilities: ['face_tracking'] },
  'avatar_lipsync': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'], specialCapabilities: ['audio_sync'] },
  'avatar_fullbody': { primaryProvider: 'alibaba', fallbackProviders: [], specialCapabilities: ['omniavatar'] },
  'talking_head': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'] },
  'presenter': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'] },
  'spokesperson': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'] },
  'ai_anchor': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'] },
  'digital_human': { primaryProvider: 'alibaba', fallbackProviders: [] },
  
  // ═══ 3D & PRODUCT (Meshy/ModelsLab Primary) ═══
  '3d_product': { primaryProvider: 'meshy', fallbackProviders: ['modelslab', 'replicate'] },
  '3d_showcase': { primaryProvider: 'meshy', fallbackProviders: ['modelslab'] },
  '3d_model': { primaryProvider: 'meshy', fallbackProviders: ['modelslab', 'replicate'] },
  '3d_environment': { primaryProvider: 'meshy', fallbackProviders: ['modelslab'] },
  '3d_character': { primaryProvider: 'meshy', fallbackProviders: ['modelslab'] },
  'product_spin': { primaryProvider: 'meshy', fallbackProviders: ['modelslab'] },
  'product_demo': { primaryProvider: 'meshy', fallbackProviders: ['modelslab', 'sora2api'] },
  
  // ═══ ANIMATION & ARTISTIC (ModelsLab Primary) ═══
  'animation': { primaryProvider: 'modelslab', fallbackProviders: ['replicate', 'gemini'] },
  'anime': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  'cartoon': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  'motion_graphics': { primaryProvider: 'modelslab', fallbackProviders: ['gemini'] },
  'animatediff': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  'stable_video': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  'artistic': { primaryProvider: 'modelslab', fallbackProviders: ['replicate', 'sora2api'] },
  'abstract': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  'stylized': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  
  // ═══ CULTURAL & TRADITIONAL (ModelsLab + Alibaba) ═══
  'cultural': { primaryProvider: 'modelslab', fallbackProviders: ['alibaba', 'gemini'] },
  'traditional': { primaryProvider: 'modelslab', fallbackProviders: ['alibaba'] },
  'wayang': { primaryProvider: 'modelslab', fallbackProviders: ['alibaba'], specialCapabilities: ['shadow_puppet'] },
  'panchatantra': { primaryProvider: 'modelslab', fallbackProviders: ['gemini'], specialCapabilities: ['animal_fable'] },
  'sufi_tales': { primaryProvider: 'modelslab', fallbackProviders: ['alibaba'] },
  'arabesque': { primaryProvider: 'modelslab', fallbackProviders: ['alibaba'] },
  'calligraphy': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'] },
  'origami': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'] },
  'ukiyo_e': { primaryProvider: 'alibaba', fallbackProviders: ['modelslab'] },
  'mandala': { primaryProvider: 'modelslab', fallbackProviders: ['gemini'] },
  
  // ═══ KINETIC TYPOGRAPHY & TEXT (Gemini Primary) ═══
  'kinetic_typography': { primaryProvider: 'gemini', fallbackProviders: ['modelslab'] },
  'text_animation': { primaryProvider: 'gemini', fallbackProviders: ['modelslab'] },
  'infographic': { primaryProvider: 'gemini', fallbackProviders: ['modelslab'] },
  'data_visualization': { primaryProvider: 'gemini', fallbackProviders: ['modelslab'] },
  'chart_animation': { primaryProvider: 'gemini', fallbackProviders: ['modelslab'] },
  'logo_animation': { primaryProvider: 'modelslab', fallbackProviders: ['gemini'] },
  
  // ═══ TUTORIAL & EXPLAINER (Gemini/Alibaba) ═══
  'screen_recording': { primaryProvider: 'gemini', fallbackProviders: ['modelslab'] },
  'tutorial': { primaryProvider: 'gemini', fallbackProviders: ['alibaba', 'modelslab'] },
  'explainer': { primaryProvider: 'gemini', fallbackProviders: ['alibaba', 'sora2api'] },
  'how_to': { primaryProvider: 'gemini', fallbackProviders: ['alibaba'] },
  'walkthrough': { primaryProvider: 'gemini', fallbackProviders: ['alibaba'] },
  
  // ═══ VR & IMMERSIVE (ModelsLab/Replicate) ═══
  'vr_360': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'], specialCapabilities: ['360_video'] },
  'immersive': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  'interactive': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  'ar_overlay': { primaryProvider: 'modelslab', fallbackProviders: ['replicate'] },
  
  // ═══ DEFAULT FALLBACK ═══
  'default': { primaryProvider: 'sora2api', fallbackProviders: ['modelslab', 'gemini', 'alibaba'] },
};

interface ProviderConfig {
  id: string;
  available: boolean;
  priority: number;
  bestFor: string[];
}

function getAvailableProviders(): ProviderConfig[] {
  return [
    { 
      id: 'sora2api', 
      available: !!Deno.env.get('SORA2API_KEY'),
      priority: 1,
      bestFor: ['sora', 'premium', 'high-quality', 'cinematic', 'realistic']
    },
    { 
      id: 'modelslab', 
      available: !!Deno.env.get('MODELSLAB_API_KEY'),
      priority: 2,
      bestFor: ['animatediff', 'svd', 'animation', 'anime', 'cultural']
    },
    { 
      id: 'alibaba', 
      available: !!Deno.env.get('ALIBABA_API_KEY'),
      priority: 3,
      bestFor: ['wan', 'cjk', 'avatar', 'full-body', 'lipsync']
    },
    { 
      id: 'gemini', 
      available: !!Deno.env.get('GOOGLE_API_KEY'),
      priority: 4,
      bestFor: ['veo', 'india', 'sea', 'africa', 'typography', 'explainer']
    },
    { 
      id: 'meshy', 
      available: !!Deno.env.get('MESHY_API_KEY'),
      priority: 5,
      bestFor: ['3d', 'product', 'model', 'environment']
    },
    { 
      id: 'replicate', 
      available: !!Deno.env.get('REPLICATE_API_TOKEN'),
      priority: 6,
      bestFor: ['minimax', 'stable-video', 'experimental', 'vr']
    },
    { 
      id: 'openai', 
      available: false, // Official Sora not publicly available
      priority: 99,
      bestFor: ['sora-official']
    },
  ];
}

/**
 * Enhanced provider selection with visual type awareness
 * Priority: Visual Type Routing → Regional Routing → Default Priority
 */
function selectProvider(requestedProvider: string, region?: string, visualType?: string): string {
  // Honor explicit provider request
  if (requestedProvider !== 'auto') {
    const providers = getAvailableProviders();
    const requested = providers.find(p => p.id === requestedProvider);
    if (requested?.available) return requestedProvider;
    console.log(`⚠️ Requested provider ${requestedProvider} not available, using smart routing`);
  }
  
  const providers = getAvailableProviders().filter(p => p.available);
  
  if (providers.length === 0) {
    throw new Error('No video generation API keys configured. Please add SORA2API_KEY, MODELSLAB_API_KEY, ALIBABA_API_KEY, GOOGLE_API_KEY, or REPLICATE_API_TOKEN.');
  }
  
  // 1. VISUAL TYPE ROUTING (Highest Priority)
  if (visualType) {
    const normalizedType = visualType.toLowerCase().replace(/[\s-]/g, '_');
    const routing = VISUAL_TYPE_ROUTING_MATRIX[normalizedType] || VISUAL_TYPE_ROUTING_MATRIX['default'];
    
    // Try primary provider first
    const primary = providers.find(p => p.id === routing.primaryProvider);
    if (primary) {
      console.log(`🎨 Visual Type "${visualType}" → Primary: ${routing.primaryProvider}`);
      return routing.primaryProvider;
    }
    
    // Try fallback providers in order
    for (const fallback of routing.fallbackProviders) {
      const fallbackProvider = providers.find(p => p.id === fallback);
      if (fallbackProvider) {
        console.log(`🎨 Visual Type "${visualType}" → Fallback: ${fallback}`);
        return fallback;
      }
    }
  }
  
  // 2. REGIONAL ROUTING (Second Priority)
  if (region) {
    if (CJK_REGIONS.includes(region)) {
      const alibaba = providers.find(p => p.id === 'alibaba');
      if (alibaba) {
        console.log('🌏 CJK Zone: Routing to Alibaba WAN');
        return 'alibaba';
      }
    }
    
    if ([...INDIA_SEA_REGIONS, ...AFRICA_REGIONS].includes(region)) {
      const gemini = providers.find(p => p.id === 'gemini');
      if (gemini) {
        console.log('🌍 India/SEA/Africa Zone: Routing to Gemini Veo');
        return 'gemini';
      }
    }
  }
  
  // 3. DEFAULT: Use highest priority available provider
  const sorted = providers.sort((a, b) => a.priority - b.priority);
  const selected = sorted[0];
  console.log(`🎯 Smart routing selected: ${selected.id} (priority ${selected.priority})`);
  return selected.id;
}

/**
 * Select avatar provider - Now supports frontend override from useRegionalLanguage
 * Priority: Frontend Override > Alibaba (default) > ModelsLab > Azure
 */
function selectAvatarProvider(providerOverride?: string, fullBody = false): string {
  // If frontend specified provider, use it (from useRegionalLanguage hook)
  if (providerOverride && providerOverride !== 'auto') {
    console.log(`🎯 Using frontend-specified avatar provider: ${providerOverride}`);
    return providerOverride.replace('alibaba-wan2.2', 'alibaba').replace('alibaba-omniavatar', 'alibaba');
  }
  
  // Full-body uses OmniAvatar (always Alibaba)
  if (fullBody) {
    const alibabaKey = Deno.env.get('ALIBABA_API_KEY');
    if (alibabaKey) return 'alibaba';
    throw new Error('ALIBABA_API_KEY is required for full-body avatar (OmniAvatar)');
  }
  
  // Priority for avatar/lip-sync: Alibaba WAN > ModelsLab > Azure
  const alibabaKey = Deno.env.get('ALIBABA_API_KEY');
  const modelsLabKey = Deno.env.get('MODELSLAB_API_KEY');
  const azureKey = Deno.env.get('AZURE_SPEECH_KEY');
  
  if (alibabaKey) return 'alibaba';
  if (modelsLabKey) return 'modelslab';
  if (azureKey) return 'azure';
  
  throw new Error('No avatar generation API keys configured. Please add ALIBABA_API_KEY, MODELSLAB_API_KEY, or AZURE_SPEECH_KEY.');
}

function selectModel(provider: string, requestedModel: string): string {
  if (requestedModel !== 'auto') return requestedModel;
  
  const defaultModels: Record<string, string> = {
    'sora2api': 'sora-1.0-turbo',
    'openai': 'sora-1.0-turbo',
    'modelslab': 'animatediff',
    'alibaba': 'wan2.1-t2v-turbo',
    'replicate': 'minimax/video-01',
    'gemini': 'veo-002',
  };
  
  return defaultModels[provider] || 'auto';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SORA2API - Third-party Sora access via sora2api.ai
// ═══════════════════════════════════════════════════════════════════════════════
async function generateWithSora2API(prompt: string, model: string, duration: number, aspectRatio: string): Promise<VideoResult> {
  const apiKey = Deno.env.get('SORA2API_KEY');
  
  if (!apiKey) {
    console.log('⚠️ SORA2API_KEY not configured, falling back to ModelsLab');
    return generateWithModelsLab(prompt, 'animatediff', duration);
  }

  console.log('🎬 Generating video with Sora2API (sora2api.org)');

  try {
    // Sora2API correct endpoint: sora2api.org/api/generate-video
    const response = await fetch('https://sora2api.org/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: `${prompt}. High quality, cinematic, safe for all audiences.`,
        aspectRatio: aspectRatio || '16:9',
        duration: Math.min(duration, 20),
        type: 'text2video',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sora2API error:', errorText);
      console.log('⚠️ Sora2API failed, falling back to ModelsLab');
      return generateWithModelsLab(prompt, 'animatediff', duration);
    }

    const data = await response.json();
    
    // Handle async task - poll for result using taskId
    if (data.data?.taskId) {
      return await pollSora2APIResult(data.data.taskId, apiKey);
    }

    // Immediate result (unlikely but handle it)
    return {
      videoUrl: data.data?.videoUrl || data.videoUrl || data.url,
      thumbnailUrl: data.data?.thumbnail || data.thumbnail,
      provider: 'sora2api',
      model: model || 'sora-2',
    };
  } catch (error) {
    console.error('Sora2API generation error:', error);
    console.log('⚠️ Sora2API failed, falling back to ModelsLab');
    return generateWithModelsLab(prompt, 'animatediff', duration);
  }
}

async function pollSora2APIResult(taskId: string, apiKey: string): Promise<VideoResult> {
  // Reduced polling: Edge functions have ~30s timeout, so limit to ~20s of polling
  const maxAttempts = 4; // 4 attempts * 4 seconds = 16 seconds max
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 4000)); // 4 second intervals
    attempts++;

    try {
      // Correct polling endpoint: sora2api.org/api/check-video-status
      const response = await fetch('https://sora2api.org/api/check-video-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();
      const status = data.data?.status || data.status;
      const progress = data.data?.progress || data.progress || 0;
      console.log(`⏳ Sora2API status (attempt ${attempts}/${maxAttempts}): ${status}, progress: ${progress}%`);

      if (status === 'succeeded' || status === 'completed' || status === 'success') {
        return {
          videoUrl: data.data?.videoUrl || data.videoUrl || data.url,
          thumbnailUrl: data.data?.thumbnail || data.thumbnail,
          provider: 'sora2api',
          model: 'sora-2',
        };
      } else if (status === 'failed' || status === 'error') {
        console.log('⚠️ Sora2API failed, falling back to ModelsLab');
        break; // Will fallback after loop
      }
    } catch (error) {
      console.warn(`Polling attempt ${attempts} error:`, error);
      if (attempts >= maxAttempts) break;
    }
  }

  // If polling didn't complete, return a placeholder and log that video is still processing
  console.log('⚠️ Sora2API still processing, returning placeholder (video will complete async)');
  return {
    videoUrl: '', // Empty triggers placeholder in main handler
    thumbnailUrl: '',
    provider: 'sora2api',
    model: 'sora-2',
  };
}

// OpenAI Video Generation - Official Sora API not publicly available, skip directly to ModelsLab
async function generateWithOpenAI(prompt: string, model: string, duration: number, aspectRatio: string): Promise<VideoResult> {
  // Note: OpenAI's official Sora API is not publicly available yet (as of 2025)
  // Immediately fallback to ModelsLab AnimateDiff which is production-ready
  console.log('⚠️ Official OpenAI Sora API not publicly available, using ModelsLab AnimateDiff');
  return generateWithModelsLab(prompt, 'animatediff', duration);
}

// ModelsLab AnimateDiff / SVD Video Generation
async function generateWithModelsLab(prompt: string, model: string, duration: number, referenceImage?: string): Promise<VideoResult> {
  const apiKey = Deno.env.get('MODELSLAB_API_KEY');
  
  if (!apiKey) {
    throw new Error('MODELSLAB_API_KEY is not configured');
  }

  console.log('🎥 Generating video with ModelsLab:', model);

  const endpoint = referenceImage 
    ? 'https://modelslab.com/api/v6/video/img2video'
    : 'https://modelslab.com/api/v6/video/text2video';

  const requestBody: Record<string, unknown> = {
    key: apiKey,
    model_id: model || 'animatediff',
    prompt: `${prompt}. High quality, smooth animation, safe for all audiences.`,
    negative_prompt: 'blurry, jittery, distorted, low quality, nsfw',
    width: 512,
    height: 512,
    num_frames: Math.min(duration * 8, 64), // 8 FPS, max 64 frames
    fps: 8,
    guidance_scale: 7.5,
    num_inference_steps: 25,
  };

  if (referenceImage) {
    requestBody.init_image = referenceImage;
    requestBody.strength = 0.8;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ModelsLab API error:', errorText);
    throw new Error(`ModelsLab API error: ${response.status}`);
  }

  const data = await response.json();

  // Handle async processing
  if (data.status === 'processing' && data.fetch_result) {
    return await pollModelsLabResult(data.fetch_result, apiKey);
  }

  return {
    videoUrl: data.output?.[0] || data.future_links?.[0] || data.output,
    provider: 'modelslab',
    model: model,
  };
}

async function pollModelsLabResult(fetchUrl: string, apiKey: string): Promise<VideoResult> {
  // Reduced polling for edge function timeout: ~16 seconds max
  const maxAttempts = 4;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 4000)); // 4 second intervals
    attempts++;

    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey }),
      });

      const data = await response.json();
      console.log(`⏳ ModelsLab status (attempt ${attempts}/${maxAttempts}):`, data.status);

      if (data.status === 'success') {
        return {
          videoUrl: data.output?.[0] || data.output,
          provider: 'modelslab',
          model: 'animatediff',
        };
      } else if (data.status === 'failed' || data.status === 'error') {
        console.log('⚠️ ModelsLab failed:', data.message);
        break;
      }
    } catch (error) {
      console.warn(`ModelsLab polling attempt ${attempts} error:`, error);
      if (attempts >= maxAttempts) break;
    }
  }

  // Return empty to trigger placeholder
  console.log('⚠️ ModelsLab still processing, returning placeholder');
  return {
    videoUrl: '',
    provider: 'modelslab',
    model: 'animatediff',
  };
}

// Gemini Veo Video Generation
async function generateWithGemini(prompt: string, duration: number, aspectRatio: string): Promise<VideoResult> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured');
  }

  console.log('🎥 Generating video with Gemini Veo');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-002:generateVideo?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${prompt}. Safe for all audiences, high quality.`,
        duration: Math.min(duration, 8), // Veo max 8 seconds
        aspectRatio: aspectRatio,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini Veo API error:', errorText);
    throw new Error(`Gemini Veo API error: ${response.status}`);
  }

  const data = await response.json();

  // Handle async operation
  if (data.name) {
    return await pollGeminiOperation(data.name, apiKey);
  }

  return {
    videoUrl: data.video?.uri || data.generatedVideos?.[0]?.uri,
    provider: 'gemini',
    model: 'veo-002',
  };
}

async function pollGeminiOperation(operationName: string, apiKey: string): Promise<VideoResult> {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`
    );

    const data = await response.json();
    console.log(`⏳ Gemini Veo status (attempt ${attempts}):`, data.done ? 'done' : 'processing');

    if (data.done) {
      if (data.error) {
        throw new Error(data.error.message || 'Video generation failed');
      }
      return {
        videoUrl: data.response?.generatedVideos?.[0]?.uri,
        provider: 'gemini',
        model: 'veo-002',
      };
    }
  }

  throw new Error('Gemini Veo video generation timed out');
}

// Replicate Video Generation
async function generateWithReplicate(prompt: string, model: string): Promise<VideoResult> {
  const apiKey = Deno.env.get('REPLICATE_API_TOKEN');
  
  if (!apiKey) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }

  const versionId = getReplicateVersion(model);
  const safePrompt = `${prompt}. Safe for all audiences, no explicit content.`;
  
  console.log('📡 Creating Replicate prediction for model:', model);

  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: versionId,
      input: { prompt: safePrompt },
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.text();
    console.error('Replicate API error:', errorData);
    throw new Error(`Replicate API error: ${createResponse.status}`);
  }

  const prediction = await createResponse.json();
  console.log('📋 Prediction created:', prediction.id);

  // Poll for completion
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    });

    const status = await statusResponse.json();
    console.log(`⏳ Prediction status (attempt ${attempts}):`, status.status);

    if (status.status === 'succeeded') {
      const output = status.output;
      let videoUrl: string;
      
      if (typeof output === 'string') {
        videoUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        videoUrl = output[0];
      } else if (output?.video) {
        videoUrl = output.video;
      } else {
        throw new Error('Unexpected output format from Replicate');
      }
      
      return {
        videoUrl,
        provider: 'replicate',
        model: model,
      };
    } else if (status.status === 'failed') {
      throw new Error(status.error || 'Video generation failed');
    }
  }

  throw new Error('Video generation timed out');
}

// Fallback chain for auto provider selection
async function generateWithFallbackChain(
  prompt: string, 
  duration: number, 
  aspectRatio: string, 
  referenceImage?: string
): Promise<VideoResult> {
  const providers = [
    { name: 'openai', fn: () => generateWithOpenAI(prompt, 'sora-1.0-turbo', duration, aspectRatio) },
    { name: 'modelslab', fn: () => generateWithModelsLab(prompt, 'animatediff', duration, referenceImage) },
    { name: 'alibaba', fn: () => generateWithAlibabaWAN(prompt, 'wan2.1-t2v-turbo', duration, referenceImage) },
    { name: 'gemini', fn: () => generateWithGemini(prompt, duration, aspectRatio) },
    { name: 'replicate', fn: () => generateWithReplicate(prompt, 'minimax/video-01') },
  ];

  for (const provider of providers) {
    try {
      console.log(`🔄 Trying ${provider.name}...`);
      return await provider.fn();
    } catch (error) {
      console.warn(`⚠️ ${provider.name} failed:`, error instanceof Error ? error.message : error);
      continue;
    }
  }

  throw new Error('All video generation providers failed. Please check your API key configuration.');
}

function getReplicateVersion(model: string): string {
  const versions: Record<string, string> = {
    'minimax/video-01': 'abafe05d52e3f2fb91bbcd8baee6cf7848e85b29c949e3aae1d7e1b3ebc',
    'stability-ai/stable-video-diffusion': 'db7c0cf87879d76a3b0379f8c5f04dce8c29f69fcb7ec8bfe09e0c2e7d6fc1f5',
    'anotherjesse/zeroscope-v2-xl': 'a87c2b1a5cc55cfe9a25b739ac72f4febc0ce85b1f4a65ff5c9b6f0f1a9b2e9c',
    'lucataco/animatediff': 'beecf59c4aee8d1c1a0f5f5b7c0e8e4c0f5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
  };

  return versions[model] || versions['minimax/video-01'];
}

// =============================================================================
// ALIBABA WAN 2.2 ANIMATE - Character Animation & Avatar Video
// =============================================================================
async function generateWithAlibabaWAN(
  prompt: string, 
  model: string, 
  duration: number, 
  referenceImage?: string
): Promise<VideoResult> {
  // Prefer international (Singapore) endpoint. Only use China if ONLY the China key exists.
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const intlKey = Deno.env.get('ALIBABA_API_KEY');

  if (!chinaKey && !intlKey) {
    throw new Error('Neither ALIBABA_CHINA_API_KEY nor ALIBABA_API_KEY is configured');
  }

  // CRITICAL: apiKey must match the endpoint. Don't send China key to international endpoint.
  const useChina = !!chinaKey && !intlKey;
  const apiKey = useChina ? chinaKey! : intlKey!;
  const baseUrl = useChina
    ? 'https://dashscope.aliyuncs.com/api/v1'
    : 'https://dashscope-intl.aliyuncs.com/api/v1';

  // Correct endpoint paths from official DashScope docs:
  //   Text-to-video: /services/aigc/video-generation/video-synthesis
  //   Image-to-video: /services/aigc/image2video/video-synthesis
  const isI2V = !!referenceImage;
  const endpointPath = isI2V
    ? '/services/aigc/image2video/video-synthesis'
    : '/services/aigc/video-generation/video-synthesis';
  const endpoint = `${baseUrl}${endpointPath}`;

  // DashScope model names (from official API docs):
  //   Text-to-video: wan2.6-t2v, wan2.5-t2v-preview, wan2.2-t2v-plus, wan2.1-t2v-turbo, wan2.1-t2v-plus
  //   Image-to-video: wan2.2-kf2v-flash, wan2.1-kf2v-plus
  //   Lip-sync:       wan2.2-s2v
  const MODEL_MAP: Record<string, string> = {
    // Text-to-video aliases
    'wan2.6-t2v': 'wan2.1-t2v-turbo',     // wan2.6 free tier exhausted — fallback to turbo
    'wan2.1-t2v': 'wan2.1-t2v-turbo',
    'wan-2.2': 'wan2.2-t2v-plus',          // Map old name to new
    'wan-2.2-animate': 'wan2.2-t2v-plus',
    // Image-to-video aliases
    'wan2.6-i2v': 'wan2.2-kf2v-flash',    // Best i2v model on intl
    'wan2.1-i2v': 'wan2.1-kf2v-plus',
  };
  const resolvedModel = MODEL_MAP[model] || model || 'wan2.1-t2v-turbo';

  console.log(`🎥 Alibaba WAN: model=${resolvedModel}, endpoint=${useChina ? 'China' : 'International'}, path=${endpointPath}`);

  // Models that support custom duration (others use fixed duration)
  const DURATION_SUPPORTED = new Set(['wan2.6-t2v', 'wan2.6-t2v-us', 'wan2.5-t2v-preview', 'wan2.2-t2v-plus']);

  const params: Record<string, unknown> = {
    size: '1280*720',
    prompt_extend: true,  // Let DashScope enhance the prompt
  };
  // Only add duration for models and modes that support it
  if (!isI2V && DURATION_SUPPORTED.has(resolvedModel)) {
    params.duration = Math.min(duration, 10);
  }

  const requestBody: Record<string, unknown> = {
    model: resolvedModel,
    input: {
      prompt: `${prompt}. High quality, smooth character animation, safe for all audiences.`,
      negative_prompt: 'blurry, distorted, low quality, nsfw',
    },
    parameters: params,
  };

  // Image-to-video mode
  if (referenceImage) {
    (requestBody.input as Record<string, unknown>).image_url = referenceImage;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Alibaba WAN API error (${response.status}):`, errorText);
    console.error(`Request: model=${resolvedModel}, endpoint=${endpoint}`);
    throw new Error(`Alibaba WAN API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();

  // Handle async processing — WAN models are async (1-5 min generation time).
  // Edge functions have ~60s timeout, so poll briefly then return task_id for client-side polling.
  if (data.output?.task_id) {
    try {
      return await pollAlibabaTask(data.output.task_id, apiKey, baseUrl);
    } catch (pollErr) {
      // Polling timed out within edge function limits — return task_id for client
      console.log(`⏳ WAN generation still in progress, returning task_id for deferred retrieval`);
      return {
        videoUrl: '', // Will be resolved by client polling
        provider: 'alibaba',
        model: resolvedModel,
        taskId: data.output.task_id,
        asyncGeneration: true,
      };
    }
  }

  return {
    videoUrl: data.output?.video_url || data.output?.results?.[0]?.url,
    provider: 'alibaba',
    model: resolvedModel,
  };
}

async function pollAlibabaTask(taskId: string, apiKey: string, baseUrl?: string): Promise<VideoResult> {
  // Poll within edge function runtime. If timeout was extended in Supabase dashboard, increase this.
  // Default: 12 attempts × 5s = 60s. For extended timeouts, increase maxAttempts.
  const maxAttempts = 24; // 24 × 5s = 120s — covers most WAN generations
  let attempts = 0;
  // Use the same baseUrl as the submission request to ensure endpoint consistency
  const pollBaseUrl = baseUrl || (Deno.env.get('ALIBABA_CHINA_API_KEY') && !Deno.env.get('ALIBABA_API_KEY')
    ? 'https://dashscope.aliyuncs.com/api/v1'
    : 'https://dashscope-intl.aliyuncs.com/api/v1');

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const response = await fetch(
      `${pollBaseUrl}/tasks/${taskId}`,
      {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    console.log(`⏳ Alibaba WAN status (attempt ${attempts}):`, data.output?.task_status);

    if (data.output?.task_status === 'SUCCEEDED') {
      return {
        videoUrl: data.output?.video_url || data.output?.results?.[0]?.url,
        provider: 'alibaba',
        model: 'wan-video',
      };
    } else if (data.output?.task_status === 'FAILED') {
      throw new Error(data.output?.message || 'Alibaba WAN video generation failed');
    }
  }

  throw new Error('Alibaba WAN video generation timed out');
}

// =============================================================================
// AVATAR & LIP-SYNC GENERATION - Using Central Routing from Frontend
// =============================================================================
interface AvatarRequestWithRouting extends AvatarRequest {
  providerOverride?: string; // From useRegionalLanguage.avatarProvider
  fullBody?: boolean; // Use OmniAvatar for full-body
  priorityRendering?: boolean; // Use RunPod for priority
}

async function generateAvatarOrLipSync(request: AvatarRequestWithRouting): Promise<{
  videoUrl: string;
  audioUrl?: string;
  visemeData?: VisemeData[];
  provider: string;
  model: string;
}> {
  // Select provider using frontend override or auto-selection
  const avatarProvider = selectAvatarProvider(request.providerOverride, request.fullBody);
  const modelName = request.fullBody ? 'omniavatar' : 'wan2.2-s2v';
  
  console.log(`🎭 Using ${avatarProvider} for ${request.type} generation`);
  console.log(`   Model: ${modelName}, Full Body: ${request.fullBody}, Priority: ${request.priorityRendering}`);

  switch (avatarProvider) {
    case 'alibaba':
      return await generateAvatarWithAlibaba(request, request.fullBody);
    case 'modelslab':
      return await generateAvatarWithModelsLab(request);
    case 'azure':
      return await generateLipSyncWithAzure(request);
    case 'replicate':
      // Fallback provider from routing
      return await generateAvatarWithModelsLab(request);
    default:
      throw new Error(`Unsupported avatar provider: ${avatarProvider}`);
  }
}

// Alibaba WAN Avatar Animation (supports regular + full-body OmniAvatar)
async function generateAvatarWithAlibaba(request: AvatarRequest, fullBody = false): Promise<{
  videoUrl: string;
  audioUrl?: string;
  provider: string;
  model: string;
}> {
  // Prefer international endpoint (Singapore). China only if ONLY China key exists.
  const chinaApiKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const intlApiKey = Deno.env.get('ALIBABA_API_KEY');
  if (!chinaApiKey && !intlApiKey) throw new Error('ALIBABA_API_KEY or ALIBABA_CHINA_API_KEY is not configured');

  const useChina = !!chinaApiKey && !intlApiKey;
  const apiKey = useChina ? chinaApiKey! : intlApiKey!;

  // DashScope lip-sync model: wan2.2-s2v (works on both endpoints)
  const modelName = fullBody ? 'omniavatar' : 'wan2.2-s2v';
  console.log(`🎭 Generating avatar with Alibaba ${fullBody ? 'OmniAvatar' : 'WAN 2.2 S2V'}`);
  console.log(`   Using ${useChina ? 'China (Beijing)' : 'International (Singapore)'} API endpoint`);

  // Step 1: Generate audio with Azure TTS as primary (more reliable), Alibaba Qwen3-TTS as fallback
  let audioUrl = request.audioUrl;
  if (!audioUrl && request.script) {
    try {
      // Try Azure Neural TTS first (more reliable for lip-sync visemes)
      audioUrl = await generateAudioWithAzure(request.script, request.language || 'en-US');
    } catch (azureErr) {
      console.warn('⚠️ Azure TTS failed, trying Alibaba Qwen3-TTS:', azureErr);
      if (chinaApiKey) {
        try {
          audioUrl = await generateAudioWithAlibabaCosyVoice(request.script, request.language || 'en-US', chinaApiKey);
        } catch (aliErr) {
          console.warn('⚠️ Alibaba Qwen3-TTS also failed:', aliErr);
        }
      }
    }
    
    // Final fallback: Return without audio URL, client can use existing audio
    if (!audioUrl) {
      console.warn('⚠️ All TTS providers failed, proceeding without generated audio');
    }
  }

  // Step 2: Animate the source image with lip-sync via DashScope
  const baseUrl = useChina
    ? 'https://dashscope.aliyuncs.com/api/v1'
    : 'https://dashscope-intl.aliyuncs.com/api/v1';
  const endpoint = fullBody
    ? `${baseUrl}/services/aigc/omniavatar/generation`
    : `${baseUrl}/services/aigc/image2video/video-synthesis`;
  
  const requestBody = {
    model: modelName,
    input: {
      image_url: request.sourceImage,
      audio_url: audioUrl,
    },
    parameters: {
      size: fullBody ? '1920*1080' : '1280*720',
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Alibaba Avatar API error (${response.status}):`, errorText);
      throw new Error(`Alibaba Avatar API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.output?.task_id) {
      const result = await pollAlibabaTask(data.output.task_id, chinaApiKey);
      return { ...result, audioUrl };
    }

    return {
      videoUrl: data.output?.video_url,
      audioUrl,
      provider: 'alibaba',
      model: 'wan-video',
    };
  } catch (err) {
    console.warn('⚠️ Alibaba Avatar failed, falling back to ModelsLab:', err);
    return await generateAvatarWithModelsLab(request);
  }
}

// Azure Neural TTS for reliable audio generation
async function generateAudioWithAzure(text: string, language: string): Promise<string> {
  const azureKey = Deno.env.get('AZURE_SPEECH_KEY');
  const azureRegion = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  
  if (!azureKey) throw new Error('AZURE_SPEECH_KEY not configured');

  const voiceMap: Record<string, string> = {
    'en-US': 'en-US-JennyNeural',
    'en-GB': 'en-GB-SoniaNeural',
    'zh-CN': 'zh-CN-XiaoxiaoNeural',
    'ja-JP': 'ja-JP-NanamiNeural',
    'ko-KR': 'ko-KR-SunHiNeural',
    'ar-SA': 'ar-SA-ZariyahNeural',
    'hi-IN': 'hi-IN-SwaraNeural',
    'es-ES': 'es-ES-ElviraNeural',
    'fr-FR': 'fr-FR-DeniseNeural',
    'de-DE': 'de-DE-KatjaNeural',
  };

  const voice = voiceMap[language] || voiceMap['en-US'];

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
      <voice name="${voice}">${text}</voice>
    </speak>
  `;

  const response = await fetch(
    `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      body: ssml,
    }
  );

  if (!response.ok) {
    throw new Error(`Azure TTS error: ${response.status}`);
  }

  // Convert audio to base64 data URL
  const audioBlob = await response.blob();
  const audioBuffer = await audioBlob.arrayBuffer();
  const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
  
  console.log('✅ Azure TTS generated audio successfully');
  return `data:audio/mp3;base64,${audioBase64}`;
}

// Alibaba Qwen3-TTS (China region fallback)
async function generateAudioWithAlibabaCosyVoice(
  text: string, 
  language: string, 
  apiKey: string
): Promise<string> {
  console.log('🎙️ Generating audio with Alibaba Qwen3-TTS (China region)');
  
  const voiceMap: Record<string, string> = {
    'en-US': 'cosyvoice-longxiaochun-en',
    'zh-CN': 'cosyvoice-longxiaochun',
    'ja-JP': 'cosyvoice-longxiaochun-jp',
    'ko-KR': 'cosyvoice-longxiaochun-kr',
  };

  const response = await fetch(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-speech/synthesis',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'cosyvoice-v1',
        input: { text },
        parameters: {
          voice: voiceMap[language] || voiceMap['zh-CN'],
          format: 'mp3',
        }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Alibaba Qwen3-TTS error: ${response.status}`);
  }

  const data = await response.json();
  return data.output?.audio_url || data.output?.audio;
}

// ModelsLab Avatar Animation
async function generateAvatarWithModelsLab(request: AvatarRequest): Promise<{
  videoUrl: string;
  audioUrl?: string;
  provider: string;
  model: string;
}> {
  const apiKey = Deno.env.get('MODELSLAB_API_KEY');
  if (!apiKey) throw new Error('MODELSLAB_API_KEY is not configured');

  console.log('🎭 Generating avatar with ModelsLab');

  // ModelsLab voice clone + animation endpoint
  const endpoint = request.type === 'lipsync' 
    ? 'https://modelslab.com/api/v6/video/lipsync'
    : 'https://modelslab.com/api/v6/video/talking_avatar';

  const requestBody: Record<string, unknown> = {
    key: apiKey,
    init_image: request.sourceImage,
    text: request.script,
    voice_id: request.voiceId || 'default',
    language: request.language || 'en-US',
  };

  if (request.audioUrl) {
    requestBody.audio_url = request.audioUrl;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`ModelsLab Avatar API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === 'processing' && data.fetch_result) {
    const result = await pollModelsLabResult(data.fetch_result, apiKey);
    return {
      videoUrl: result.videoUrl,
      provider: 'modelslab',
      model: 'talking-avatar',
    };
  }

  return {
    videoUrl: data.output?.[0] || data.output,
    audioUrl: data.audio_url,
    provider: 'modelslab',
    model: 'talking-avatar',
  };
}

// Azure Speech + Viseme for Lip-Sync Data
async function generateLipSyncWithAzure(request: AvatarRequest): Promise<{
  videoUrl: string;
  audioUrl: string;
  visemeData: VisemeData[];
  provider: string;
  model: string;
}> {
  const azureKey = Deno.env.get('AZURE_SPEECH_KEY');
  const azureRegion = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  
  if (!azureKey) throw new Error('AZURE_SPEECH_KEY is not configured');

  console.log('🎙️ Generating lip-sync audio with Azure Speech + Visemes');

  // Get voice based on language
  const voiceMap: Record<string, string> = {
    'en-US': 'en-US-JennyNeural',
    'en-GB': 'en-GB-SoniaNeural',
    'zh-CN': 'zh-CN-XiaoxiaoNeural',
    'ja-JP': 'ja-JP-NanamiNeural',
    'ko-KR': 'ko-KR-SunHiNeural',
    'es-ES': 'es-ES-ElviraNeural',
    'fr-FR': 'fr-FR-DeniseNeural',
    'de-DE': 'de-DE-KatjaNeural',
  };

  const voice = voiceMap[request.language || 'en-US'] || voiceMap['en-US'];

  // SSML with viseme output
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
           xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${request.language || 'en-US'}">
      <voice name="${voice}">
        <mstts:viseme type="redlips_front"/>
        ${request.script}
      </voice>
    </speak>
  `;

  const response = await fetch(
    `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'X-Microsoft-Viseme': 'true',
      },
      body: ssml,
    }
  );

  if (!response.ok) {
    throw new Error(`Azure Speech API error: ${response.status}`);
  }

  // Parse viseme data from response headers
  const visemeHeader = response.headers.get('X-Microsoft-Viseme-Data');
  const visemeData: VisemeData[] = visemeHeader 
    ? JSON.parse(visemeHeader) 
    : [];

  // Get audio blob and convert to data URL
  const audioBlob = await response.blob();
  const audioBuffer = await audioBlob.arrayBuffer();
  const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
  const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

  // For Azure, we return viseme data for client-side animation
  // The video URL will be generated client-side using the viseme data
  return {
    videoUrl: '', // Client will generate using viseme data
    audioUrl,
    visemeData,
    provider: 'azure',
    model: 'azure-neural-tts-viseme',
  };
}
