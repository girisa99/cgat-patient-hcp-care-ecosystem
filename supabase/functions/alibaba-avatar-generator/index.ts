/**
 * ALIBABA AVATAR GENERATOR - Production Implementation
 * 
 * Uses DashScope China (Beijing) API for avatar/animation models:
 * - Wan2.2-Animate (Digital Human Video Animation)
 * - Wan2.2-S2V (Speech-to-Video / Talking Head)
 * - TaoAvatar (3D Gaussian Splatting Avatars)
 * - MACH - Make-A-Character (Text-to-3D Avatar)
 * 
 * CRITICAL: These models are ONLY available in China (Beijing) region
 * Requires: ALIBABA_CHINA_API_KEY (sk- prefix, Beijing region)
 * Endpoint: https://dashscope.aliyuncs.com
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DashScope endpoints - tri-region with cross-region fallback
const DASHSCOPE_CHINA_URL = 'https://dashscope.aliyuncs.com/api/v1';
const DASHSCOPE_INTL_URL = 'https://dashscope-intl.aliyuncs.com/api/v1';

// Model identifiers in DashScope
const DASHSCOPE_MODELS = {
  'wan2.2-animate': 'wanx-v2-animate',      // Digital human animation
  'wan2.2-s2v': 'wanx-s2v-v1',              // Speech-to-video
  'taoavatar': 'taoavatar-3dgs-v1',         // 3D Gaussian Splatting
  'mach': 'mach-v1',                         // Text-to-3D character
} as const;

// API endpoints per model type
const API_ENDPOINTS = {
  'wan2.2-animate': '/services/aigc/video-generation/generation',
  'wan2.2-s2v': '/services/aigc/video-generation/speech-to-video',
  'taoavatar': '/services/aigc/3d-generation/taoavatar',
  'mach': '/services/aigc/3d-generation/mach',
} as const;

interface AvatarRequest {
  model: keyof typeof DASHSCOPE_MODELS;
  
  // Common params
  prompt?: string;
  negativePrompt?: string;
  
  // Image/video input
  sourceImage?: string;       // URL or base64
  referenceVideo?: string;    // URL for motion reference
  
  // Audio input (for S2V and lip-sync)
  audioUrl?: string;
  audioBase64?: string;
  
  // Output configuration
  outputFormat?: 'mp4' | 'webm' | 'glb' | 'gltf' | 'fbx';
  duration?: number;          // Seconds
  fps?: number;               // 24, 30, 60
  resolution?: '720p' | '1080p' | '4k';
  
  // Model-specific params
  perspective?: 'portrait' | 'bust' | 'full_body';
  style?: string;
  seed?: number;
  expressionStrength?: number; // 0-1
}

interface GenerationResult {
  success: boolean;
  model: string;
  provider: 'alibaba';
  region: 'china-beijing';
  outputUrl?: string;
  outputBase64?: string;
  taskId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    duration?: number;
    fps?: number;
    resolution?: string;
    processingTimeMs?: number;
    estimatedCost?: number;
  };
  error?: string;
  fallback?: boolean;
}

/**
 * Get the Alibaba API key with tri-region fallback: China → Singapore → Virginia
 * Returns all available configs for cross-region attempts
 */
function getAllApiKeys(): Array<{ key: string; region: string; baseUrl: string }> {
  const configs: Array<{ key: string; region: string; baseUrl: string }> = [];
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const sgKey = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
  const vaKey = Deno.env.get('ALIBABA_API_KEY');

  // China key gets priority for China-only models, but we try all
  if (chinaKey) configs.push({ key: chinaKey, region: 'china-beijing', baseUrl: DASHSCOPE_CHINA_URL });
  if (sgKey) configs.push({ key: sgKey, region: 'singapore', baseUrl: DASHSCOPE_INTL_URL });
  if (vaKey) configs.push({ key: vaKey, region: 'virginia', baseUrl: DASHSCOPE_INTL_URL });

  return configs;
}

function getApiKey(): string | null {
  const configs = getAllApiKeys();
  return configs.length > 0 ? configs[0].key : null;
}

/**
 * Call DashScope API with async task support
 */
async function callDashScopeAPI(
  endpoint: string,
  payload: Record<string, unknown>,
  apiKey: string,
  enableAsync: boolean = true,
  baseUrl: string = DASHSCOPE_CHINA_URL,
): Promise<{ success: boolean; data?: any; taskId?: string; error?: string }> {
  
  const url = `${baseUrl}${endpoint}`;
  console.log(`🌐 Calling DashScope (${baseUrl === DASHSCOPE_CHINA_URL ? 'China' : 'International'}): ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': enableAsync ? 'enable' : 'disable',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`DashScope error (${response.status}):`, responseText);
      
      // Parse error for specific messages
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.code === 'AccessDenied') {
          return {
            success: false,
            error: `Model not activated in DashScope console. Please enable the model in Model Square (China Beijing region).`
          };
        }
        return {
          success: false,
          error: errorJson.message || `API error: ${response.status}`
        };
      } catch {
        return { success: false, error: `API error: ${response.status} - ${responseText}` };
      }
    }

    const result = JSON.parse(responseText);
    
    // Check if async task was created
    if (result.output?.task_id) {
      return {
        success: true,
        taskId: result.output.task_id,
        data: result
      };
    }
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error('DashScope API call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Poll for async task completion
 */
async function pollTaskStatus(
  taskId: string,
  apiKey: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  // Use China URL as default for avatar models (China-only)
  const statusUrl = `${DASHSCOPE_CHINA_URL}/tasks/${taskId}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    
    try {
      const response = await fetch(statusUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (!response.ok) continue;
      
      const statusData = await response.json();
      const taskStatus = statusData.output?.task_status;
      
      console.log(`📊 Task ${taskId} status: ${taskStatus} (attempt ${attempt + 1}/${maxAttempts})`);
      
      if (taskStatus === 'SUCCEEDED') {
        return { success: true, data: statusData.output };
      } else if (taskStatus === 'FAILED') {
        return {
          success: false,
          error: statusData.output?.message || 'Task failed'
        };
      }
      // Continue polling for PENDING/RUNNING states
      
    } catch (error) {
      console.error(`Poll attempt ${attempt + 1} failed:`, error);
    }
  }
  
  return { success: false, error: 'Task timed out' };
}

/**
 * Generate with Wan2.2-Animate (Digital Human Animation)
 */
async function generateWithWan22Animate(
  request: AvatarRequest,
  apiKey: string
): Promise<GenerationResult> {
  console.log('[Wan2.2-Animate] Starting digital human animation');
  const startTime = Date.now();
  
  if (!request.sourceImage) {
    return {
      success: false,
      model: 'wan2.2-animate',
      provider: 'alibaba',
      region: 'china-beijing',
      error: 'Source image required for animation'
    };
  }
  
  const payload = {
    model: DASHSCOPE_MODELS['wan2.2-animate'],
    input: {
      image_url: request.sourceImage,
      prompt: request.prompt || 'natural talking animation',
      ...(request.referenceVideo && { ref_video_url: request.referenceVideo }),
    },
    parameters: {
      duration: request.duration || 5,
      fps: request.fps || 30,
      resolution: request.resolution === '4k' ? '2160p' : (request.resolution || '1080p'),
      ...(request.seed && { seed: request.seed }),
    }
  };
  
  const apiResult = await callDashScopeAPI(
    API_ENDPOINTS['wan2.2-animate'],
    payload,
    apiKey
  );
  
  if (!apiResult.success) {
    return {
      success: false,
      model: 'wan2.2-animate',
      provider: 'alibaba',
      region: 'china-beijing',
      error: apiResult.error,
      fallback: true
    };
  }
  
  // If async, poll for completion
  let outputUrl: string | undefined;
  if (apiResult.taskId) {
    const pollResult = await pollTaskStatus(apiResult.taskId, apiKey);
    if (pollResult.success && pollResult.data?.video_url) {
      outputUrl = pollResult.data.video_url;
    } else {
      return {
        success: false,
        model: 'wan2.2-animate',
        provider: 'alibaba',
        region: 'china-beijing',
        taskId: apiResult.taskId,
        status: 'failed',
        error: pollResult.error || 'Failed to complete generation'
      };
    }
  } else {
    outputUrl = apiResult.data?.output?.video_url;
  }
  
  const processingTimeMs = Date.now() - startTime;
  
  return {
    success: true,
    model: 'wan2.2-animate',
    provider: 'alibaba',
    region: 'china-beijing',
    outputUrl,
    taskId: apiResult.taskId,
    status: 'completed',
    metadata: {
      duration: request.duration || 5,
      fps: request.fps || 30,
      resolution: request.resolution || '1080p',
      processingTimeMs,
      estimatedCost: 0.05 * (request.duration || 5), // ~$0.05 per second
    }
  };
}

/**
 * Generate with Wan2.2-S2V (Speech-to-Video / Talking Avatar)
 */
async function generateWithWan22S2V(
  request: AvatarRequest,
  apiKey: string
): Promise<GenerationResult> {
  console.log('[Wan2.2-S2V] Starting speech-to-video generation');
  const startTime = Date.now();
  
  if (!request.sourceImage) {
    return {
      success: false,
      model: 'wan2.2-s2v',
      provider: 'alibaba',
      region: 'china-beijing',
      error: 'Source portrait image required'
    };
  }
  
  if (!request.audioUrl && !request.audioBase64) {
    return {
      success: false,
      model: 'wan2.2-s2v',
      provider: 'alibaba',
      region: 'china-beijing',
      error: 'Audio input required for speech-to-video'
    };
  }
  
  const payload = {
    model: DASHSCOPE_MODELS['wan2.2-s2v'],
    input: {
      image_url: request.sourceImage,
      ...(request.audioUrl && { audio_url: request.audioUrl }),
      ...(request.audioBase64 && { audio: request.audioBase64 }),
    },
    parameters: {
      fps: request.fps || 30,
      resolution: request.resolution || '1080p',
      expression_strength: request.expressionStrength || 0.8,
    }
  };
  
  const apiResult = await callDashScopeAPI(
    API_ENDPOINTS['wan2.2-s2v'],
    payload,
    apiKey
  );
  
  if (!apiResult.success) {
    return {
      success: false,
      model: 'wan2.2-s2v',
      provider: 'alibaba',
      region: 'china-beijing',
      error: apiResult.error,
      fallback: true
    };
  }
  
  let outputUrl: string | undefined;
  if (apiResult.taskId) {
    const pollResult = await pollTaskStatus(apiResult.taskId, apiKey);
    if (pollResult.success && pollResult.data?.video_url) {
      outputUrl = pollResult.data.video_url;
    } else {
      return {
        success: false,
        model: 'wan2.2-s2v',
        provider: 'alibaba',
        region: 'china-beijing',
        taskId: apiResult.taskId,
        status: 'failed',
        error: pollResult.error
      };
    }
  } else {
    outputUrl = apiResult.data?.output?.video_url;
  }
  
  const processingTimeMs = Date.now() - startTime;
  
  return {
    success: true,
    model: 'wan2.2-s2v',
    provider: 'alibaba',
    region: 'china-beijing',
    outputUrl,
    taskId: apiResult.taskId,
    status: 'completed',
    metadata: {
      fps: 30,
      resolution: request.resolution || '1080p',
      processingTimeMs,
      estimatedCost: 0.03, // Per generation
    }
  };
}

/**
 * Generate with TaoAvatar (3D Gaussian Splatting)
 */
async function generateWithTaoAvatar(
  request: AvatarRequest,
  apiKey: string
): Promise<GenerationResult> {
  console.log('[TaoAvatar] Starting 3D Gaussian Splatting avatar generation');
  const startTime = Date.now();
  
  if (!request.sourceImage) {
    return {
      success: false,
      model: 'taoavatar',
      provider: 'alibaba',
      region: 'china-beijing',
      error: 'Source image required for TaoAvatar'
    };
  }
  
  const payload = {
    model: DASHSCOPE_MODELS['taoavatar'],
    input: {
      image_url: request.sourceImage,
      ...(request.prompt && { prompt: request.prompt }),
    },
    parameters: {
      output_format: request.outputFormat || 'glb',
      perspective: request.perspective || 'bust',
    }
  };
  
  const apiResult = await callDashScopeAPI(
    API_ENDPOINTS['taoavatar'],
    payload,
    apiKey
  );
  
  if (!apiResult.success) {
    return {
      success: false,
      model: 'taoavatar',
      provider: 'alibaba',
      region: 'china-beijing',
      error: apiResult.error,
      fallback: true
    };
  }
  
  let outputUrl: string | undefined;
  if (apiResult.taskId) {
    const pollResult = await pollTaskStatus(apiResult.taskId, apiKey, 60, 3000); // Longer timeout for 3D
    if (pollResult.success && pollResult.data?.model_url) {
      outputUrl = pollResult.data.model_url;
    } else {
      return {
        success: false,
        model: 'taoavatar',
        provider: 'alibaba',
        region: 'china-beijing',
        taskId: apiResult.taskId,
        status: 'failed',
        error: pollResult.error
      };
    }
  } else {
    outputUrl = apiResult.data?.output?.model_url;
  }
  
  const processingTimeMs = Date.now() - startTime;
  
  return {
    success: true,
    model: 'taoavatar',
    provider: 'alibaba',
    region: 'china-beijing',
    outputUrl,
    taskId: apiResult.taskId,
    status: 'completed',
    metadata: {
      processingTimeMs,
      estimatedCost: 0.10, // 3D generation is more expensive
    }
  };
}

/**
 * Generate with MACH (Make-A-Character - Text-to-3D)
 */
async function generateWithMACH(
  request: AvatarRequest,
  apiKey: string
): Promise<GenerationResult> {
  console.log('[MACH] Starting text-to-3D character generation');
  const startTime = Date.now();
  
  if (!request.prompt) {
    return {
      success: false,
      model: 'mach',
      provider: 'alibaba',
      region: 'china-beijing',
      error: 'Text prompt required for MACH'
    };
  }
  
  const payload = {
    model: DASHSCOPE_MODELS['mach'],
    input: {
      prompt: request.prompt,
      ...(request.negativePrompt && { negative_prompt: request.negativePrompt }),
      ...(request.sourceImage && { reference_image: request.sourceImage }),
    },
    parameters: {
      output_format: request.outputFormat || 'glb',
      style: request.style || 'realistic',
      ...(request.seed && { seed: request.seed }),
    }
  };
  
  const apiResult = await callDashScopeAPI(
    API_ENDPOINTS['mach'],
    payload,
    apiKey
  );
  
  if (!apiResult.success) {
    return {
      success: false,
      model: 'mach',
      provider: 'alibaba',
      region: 'china-beijing',
      error: apiResult.error,
      fallback: true
    };
  }
  
  let outputUrl: string | undefined;
  if (apiResult.taskId) {
    const pollResult = await pollTaskStatus(apiResult.taskId, apiKey, 90, 3000); // Very long for 3D from text
    if (pollResult.success && pollResult.data?.model_url) {
      outputUrl = pollResult.data.model_url;
    } else {
      return {
        success: false,
        model: 'mach',
        provider: 'alibaba',
        region: 'china-beijing',
        taskId: apiResult.taskId,
        status: 'failed',
        error: pollResult.error
      };
    }
  } else {
    outputUrl = apiResult.data?.output?.model_url;
  }
  
  const processingTimeMs = Date.now() - startTime;
  
  return {
    success: true,
    model: 'mach',
    provider: 'alibaba',
    region: 'china-beijing',
    outputUrl,
    taskId: apiResult.taskId,
    status: 'completed',
    metadata: {
      processingTimeMs,
      estimatedCost: 0.15, // Text-to-3D is expensive
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ALIBABA_CHINA_API_KEY not configured. These models require a China (Beijing) region API key.',
          fallback: true
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: AvatarRequest = await req.json();
    const { model } = request;
    
    const validModels = Object.keys(DASHSCOPE_MODELS);
    if (!model || !validModels.includes(model)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid model. Available models: ${validModels.join(', ')}`,
          availableModels: validModels,
          documentation: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`🎭 [Alibaba Avatar] Processing ${model} request`);
    console.log(`🇨🇳 Using China (Beijing) DashScope endpoint`);
    
    let result: GenerationResult;
    
    switch (model) {
      case 'wan2.2-animate':
        result = await generateWithWan22Animate(request, apiKey);
        break;
      case 'wan2.2-s2v':
        result = await generateWithWan22S2V(request, apiKey);
        break;
      case 'taoavatar':
        result = await generateWithTaoAvatar(request, apiKey);
        break;
      case 'mach':
        result = await generateWithMACH(request, apiKey);
        break;
      default:
        result = { 
          success: false, 
          model, 
          provider: 'alibaba',
          region: 'china-beijing',
          error: 'Model handler not implemented' 
        };
    }
    
    if (result.success) {
      console.log(`✅ [Alibaba Avatar] ${model} completed in ${result.metadata?.processingTimeMs}ms`);
    } else {
      console.error(`❌ [Alibaba Avatar] ${model} failed: ${result.error}`);
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Alibaba Avatar] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        provider: 'alibaba',
        region: 'china-beijing', 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
