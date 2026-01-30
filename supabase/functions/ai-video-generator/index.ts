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
    
    // Auto-select provider based on availability AND regional routing
    const selectedProvider = selectProvider(provider, region);
    const selectedModel = selectModel(selectedProvider, model);
    
    console.log(`🎬 Smart routing: provider=${selectedProvider}, model=${selectedModel}, region=${region}`);

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

    return new Response(JSON.stringify({ 
      success: true,
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      processingTime,
      contentModerated: true,
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
      bestFor: ['sora', 'premium', 'high-quality', 'cinematic']
    },
    { 
      id: 'modelslab', 
      available: !!Deno.env.get('MODELSLAB_API_KEY'),
      priority: 2,
      bestFor: ['animatediff', 'svd', 'general', 'budget']
    },
    { 
      id: 'alibaba', 
      available: !!Deno.env.get('ALIBABA_API_KEY'),
      priority: 3,
      bestFor: ['wan', 'cjk', 'avatar', 'full-body']
    },
    { 
      id: 'gemini', 
      available: !!Deno.env.get('GOOGLE_API_KEY'),
      priority: 4,
      bestFor: ['veo', 'india', 'sea', 'africa']
    },
    { 
      id: 'replicate', 
      available: !!Deno.env.get('REPLICATE_API_TOKEN'),
      priority: 5,
      bestFor: ['minimax', 'stable-video', 'experimental']
    },
    { 
      id: 'openai', 
      available: false, // Official Sora not publicly available
      priority: 99,
      bestFor: ['sora-official'] // Reserved for future
    },
  ];
}

function selectProvider(requestedProvider: string, region?: string): string {
  // Honor explicit provider request
  if (requestedProvider !== 'auto') {
    const providers = getAvailableProviders();
    const requested = providers.find(p => p.id === requestedProvider);
    if (requested?.available) return requestedProvider;
    console.log(`⚠️ Requested provider ${requestedProvider} not available, using smart routing`);
  }
  
  const providers = getAvailableProviders().filter(p => p.available);
  
  if (providers.length === 0) {
    throw new Error('No video generation API keys configured. Please add MODELSLAB_API_KEY, ALIBABA_API_KEY, GOOGLE_API_KEY, or REPLICATE_API_TOKEN.');
  }
  
  // Regional routing logic
  if (region) {
    // CJK Zone: Prefer Alibaba WAN for Asian content
    if (CJK_REGIONS.includes(region)) {
      const alibaba = providers.find(p => p.id === 'alibaba');
      if (alibaba) {
        console.log('🌏 CJK Zone: Routing to Alibaba WAN');
        return 'alibaba';
      }
    }
    
    // India/SEA/Africa Zone: Prefer Gemini Veo
    if ([...INDIA_SEA_REGIONS, ...AFRICA_REGIONS].includes(region)) {
      const gemini = providers.find(p => p.id === 'gemini');
      if (gemini) {
        console.log('🌍 India/SEA/Africa Zone: Routing to Gemini Veo');
        return 'gemini';
      }
    }
  }
  
  // Default: Use highest priority available provider
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
    'alibaba': 'wan-2.2-animate',
    'replicate': 'minimax/video-01',
    'gemini': 'veo-001',
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

  console.log('🎬 Generating video with Sora2API (sora2api.ai)');

  try {
    // Sora2API uses OpenAI-compatible format
    const response = await fetch('https://api.sora2api.ai/v1/video/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'sora-1.0-turbo',
        prompt: `${prompt}. High quality, cinematic, safe for all audiences.`,
        duration: Math.min(duration, 20), // Sora2API max duration
        aspect_ratio: aspectRatio,
        quality: 'high',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sora2API error:', errorText);
      // Fallback to ModelsLab on error
      console.log('⚠️ Sora2API failed, falling back to ModelsLab');
      return generateWithModelsLab(prompt, 'animatediff', duration);
    }

    const data = await response.json();
    
    // Handle async task - poll for result
    if (data.task_id || data.id) {
      return await pollSora2APIResult(data.task_id || data.id, apiKey);
    }

    return {
      videoUrl: data.data?.url || data.url || data.video_url,
      thumbnailUrl: data.data?.thumbnail || data.thumbnail,
      provider: 'sora2api',
      model: model || 'sora-1.0-turbo',
    };
  } catch (error) {
    console.error('Sora2API generation error:', error);
    console.log('⚠️ Sora2API failed, falling back to ModelsLab');
    return generateWithModelsLab(prompt, 'animatediff', duration);
  }
}

async function pollSora2APIResult(taskId: string, apiKey: string): Promise<VideoResult> {
  const maxAttempts = 120; // 10 minutes max
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second intervals
    attempts++;

    try {
      const response = await fetch(`https://api.sora2api.ai/v1/video/generations/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();
      console.log(`⏳ Sora2API status (attempt ${attempts}):`, data.status);

      if (data.status === 'completed' || data.status === 'success') {
        return {
          videoUrl: data.data?.url || data.url || data.video_url,
          thumbnailUrl: data.data?.thumbnail || data.thumbnail,
          provider: 'sora2api',
          model: 'sora-1.0-turbo',
        };
      } else if (data.status === 'failed' || data.status === 'error') {
        throw new Error(data.message || data.error || 'Sora2API video generation failed');
      }
    } catch (error) {
      if (attempts >= maxAttempts) throw error;
    }
  }

  throw new Error('Sora2API video generation timed out');
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
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: apiKey }),
    });

    const data = await response.json();
    console.log(`⏳ ModelsLab status (attempt ${attempts}):`, data.status);

    if (data.status === 'success') {
      return {
        videoUrl: data.output?.[0] || data.output,
        provider: 'modelslab',
        model: 'animatediff',
      };
    } else if (data.status === 'failed' || data.status === 'error') {
      throw new Error(data.message || 'Video generation failed');
    }
  }

  throw new Error('ModelsLab video generation timed out');
}

// Gemini Veo Video Generation
async function generateWithGemini(prompt: string, duration: number, aspectRatio: string): Promise<VideoResult> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured');
  }

  console.log('🎥 Generating video with Gemini Veo');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-001:generateVideo?key=${apiKey}`,
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
    model: 'veo-001',
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
        model: 'veo-001',
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
    { name: 'alibaba', fn: () => generateWithAlibabaWAN(prompt, 'wan-2.2-animate', duration, referenceImage) },
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
  const apiKey = Deno.env.get('ALIBABA_API_KEY');
  
  if (!apiKey) {
    throw new Error('ALIBABA_API_KEY is not configured');
  }

  console.log('🎥 Generating video with Alibaba WAN 2.2 Animate:', model);

  // Alibaba DashScope WAN Video API
  const endpoint = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation';
  
  const requestBody: Record<string, unknown> = {
    model: 'wan-2.2',
    input: {
      prompt: `${prompt}. High quality, smooth character animation, safe for all audiences.`,
      negative_prompt: 'blurry, distorted, low quality, nsfw',
    },
    parameters: {
      duration: Math.min(duration, 10), // WAN max 10 seconds
      resolution: '720p',
      fps: 24,
    }
  };

  // Image-to-video mode for avatar animation
  if (referenceImage) {
    requestBody.input = {
      ...requestBody.input as Record<string, unknown>,
      image_url: referenceImage,
      mode: 'animate', // Character animation mode
    };
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
    console.error('Alibaba WAN API error:', errorText);
    throw new Error(`Alibaba WAN API error: ${response.status}`);
  }

  const data = await response.json();

  // Handle async processing
  if (data.output?.task_id) {
    return await pollAlibabaTask(data.output.task_id, apiKey);
  }

  return {
    videoUrl: data.output?.video_url || data.output?.results?.[0]?.url,
    provider: 'alibaba',
    model: 'wan-2.2-animate',
  };
}

async function pollAlibabaTask(taskId: string, apiKey: string): Promise<VideoResult> {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
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
        model: 'wan-2.2-animate',
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
  const apiKey = Deno.env.get('ALIBABA_API_KEY');
  if (!apiKey) throw new Error('ALIBABA_API_KEY is not configured');

  const modelName = fullBody ? 'omniavatar' : 'wan-2.2';
  console.log(`🎭 Generating avatar with Alibaba ${fullBody ? 'OmniAvatar (full-body)' : 'WAN 2.2 Animate'}`);

  // Step 1: Generate audio with Alibaba CosyVoice if script provided
  let audioUrl = request.audioUrl;
  if (!audioUrl && request.script) {
    audioUrl = await generateAudioWithAlibabaCosyVoice(request.script, request.language || 'en-US', apiKey);
  }

  // Step 2: Animate the source image with lip-sync
  const endpoint = fullBody 
    ? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/omniavatar/generation'
    : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation';
  
  const requestBody = {
    model: modelName,
    input: {
      image_url: request.sourceImage,
      audio_url: audioUrl,
      mode: fullBody 
        ? 'full_body_animation' 
        : (request.type === 'lipsync' ? 'lip_sync' : 'talking_head'),
    },
    parameters: {
      resolution: fullBody ? '1080p' : '720p',
      preserve_expression: true,
      smooth_motion: true,
      ...(fullBody && { body_motion: 'natural', gesture_sync: true }),
    }
  };

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
    throw new Error(`Alibaba Avatar API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.output?.task_id) {
    const result = await pollAlibabaTask(data.output.task_id, apiKey);
    return { ...result, audioUrl };
  }

  return {
    videoUrl: data.output?.video_url,
    audioUrl,
    provider: 'alibaba',
    model: 'wan-2.2-animate',
  };
}

// Alibaba CosyVoice TTS
async function generateAudioWithAlibabaCosyVoice(
  text: string, 
  language: string, 
  apiKey: string
): Promise<string> {
  console.log('🎙️ Generating audio with Alibaba CosyVoice');
  
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
          voice: voiceMap[language] || voiceMap['en-US'],
          format: 'mp3',
        }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Alibaba CosyVoice error: ${response.status}`);
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
