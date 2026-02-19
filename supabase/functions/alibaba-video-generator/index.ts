/**
 * ALIBABA VIDEO GENERATOR - Complete Implementation
 * 
 * Supports ALL Alibaba video generation models:
 * - Wan 2.6 (International - Latest T2V/I2V/FLF2V)
 * - Wan 2.6 (Upgraded from 2.1 - Latest T2V/I2V)
 * - Wan 2.0 (China - Legacy)
 * 
 * Regional Routing:
 * - Wan 2.6: dashscope-intl.aliyuncs.com (International)
 * - Wan 2.6/2.0: dashscope-intl.aliyuncs.com (International) / dashscope.aliyuncs.com (China Beijing)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regional endpoints
const DASHSCOPE_INTL_URL = 'https://dashscope-intl.aliyuncs.com/api/v1';
const DASHSCOPE_CHINA_URL = 'https://dashscope.aliyuncs.com/api/v1';

// ============================================================================
// MODEL CONFIGURATIONS - All Available Alibaba Video Models
// ============================================================================

const VIDEO_MODELS = {
  // Wan 2.6 Series - LATEST (International endpoint)
  'wan2.6-t2v': { 
    id: 'wan2.6-t2v', 
    region: 'intl', 
    type: 't2v',
    description: 'Wan 2.6 Text-to-Video (latest)',
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
  },
  'wan2.6-i2v': { 
    id: 'wan2.6-i2v', 
    region: 'intl', 
    type: 'i2v',
    description: 'Wan 2.6 Image-to-Video',
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
  },
  'wan2.6-flf2v': { 
    id: 'wan2.6-flf2v', 
    region: 'intl', 
    type: 'flf2v',
    description: 'First-Last-Frame to Video interpolation',
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
  },
  
  // Wan 2.6 Series - STABLE (International endpoint, upgraded from 2.1)
  'wan2.6-t2v-legacy': {
    id: 'wan2.6-t2v',
    region: 'intl',
    type: 't2v',
    description: 'Wan 2.6 Text-to-Video (upgraded from 2.1)',
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
  },
  'wan2.6-i2v-legacy': {
    id: 'wan2.6-i2v',
    region: 'intl',
    type: 'i2v',
    description: 'Wan 2.6 Image-to-Video (upgraded from 2.1)',
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
  },
  'wan2.6-turbo': {
    id: 'wan2.6-t2v',
    region: 'intl',
    type: 't2v',
    description: 'Wan 2.6 T2V (upgraded from 2.1 Turbo)',
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
  },
  
  // Wan 2.0 - Legacy (China endpoint)
  'wan2.0': { 
    id: 'wanx2.0-v1', 
    region: 'china', 
    type: 't2v',
    description: 'Wan 2.0 Legacy',
    maxDuration: 6,
    resolutions: ['720p'],
  },
} as const;

type VideoModelKey = keyof typeof VIDEO_MODELS;

// API endpoint
const VIDEO_API_ENDPOINT = '/services/aigc/video-generation/video-synthesis';

interface VideoRequest {
  model?: VideoModelKey;
  
  // Input
  prompt: string;
  negativePrompt?: string;
  sourceImage?: string;        // URL or base64 for I2V
  firstFrame?: string;         // URL for FLF2V
  lastFrame?: string;          // URL for FLF2V
  
  // Output configuration
  duration?: number;           // 2, 4, 6, 8, 10 seconds
  fps?: number;                // 24, 30
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  
  // Generation params
  seed?: number;
  steps?: number;
  cfgScale?: number;
  
  // Motion control
  motionStrength?: number;     // 0-1
  cameraMotion?: 'static' | 'pan_left' | 'pan_right' | 'zoom_in' | 'zoom_out' | 'orbit' | 'dolly';
}

interface VideoResult {
  success: boolean;
  provider: 'alibaba';
  region: 'china-beijing' | 'international';
  model: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  taskId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    duration: number;
    fps: number;
    resolution: string;
    processingTimeMs: number;
    estimatedCost: number;
  };
  error?: string;
  fallback?: boolean;
}

/**
 * Get API configuration based on model region
 */
function getApiConfig(modelKey: VideoModelKey): { 
  apiKey: string | null; 
  baseUrl: string; 
  region: 'china-beijing' | 'international';
} {
  const modelConfig = VIDEO_MODELS[modelKey];
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const sgKey = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
  const vaKey = Deno.env.get('ALIBABA_API_KEY');
  
  if (modelConfig.region === 'intl') {
    // International models: prefer SG → VA → China cross-region
    const apiKey = sgKey || vaKey || chinaKey || null;
    return { apiKey, baseUrl: DASHSCOPE_INTL_URL, region: 'international' };
  } else {
    // China models: prefer China → try SG/VA cross-region
    const apiKey = chinaKey || sgKey || vaKey || null;
    const baseUrl = chinaKey ? DASHSCOPE_CHINA_URL : DASHSCOPE_INTL_URL;
    return { apiKey, baseUrl, region: chinaKey ? 'china-beijing' : 'international' };
  }
}

/**
 * Get resolution dimensions
 */
function getResolutionPixels(resolution: string, aspectRatio: string): { width: number; height: number } {
  const resMap: Record<string, Record<string, { width: number; height: number }>> = {
    '720p': {
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '1:1': { width: 720, height: 720 },
      '4:3': { width: 960, height: 720 },
    },
    '1080p': {
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '1:1': { width: 1080, height: 1080 },
      '4:3': { width: 1440, height: 1080 },
    },
    '4k': {
      '16:9': { width: 3840, height: 2160 },
      '9:16': { width: 2160, height: 3840 },
      '1:1': { width: 2160, height: 2160 },
      '4:3': { width: 2880, height: 2160 },
    },
  };
  
  return resMap[resolution]?.[aspectRatio] || resMap['1080p']['16:9'];
}

/**
 * Poll for async task completion
 */
async function pollTaskStatus(
  taskId: string,
  apiKey: string,
  baseUrl: string,
  maxAttempts: number = 90,
  intervalMs: number = 3000
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  const statusUrl = `${baseUrl}/tasks/${taskId}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    
    try {
      const response = await fetch(statusUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      
      if (!response.ok) continue;
      
      const statusData = await response.json();
      const taskStatus = statusData.output?.task_status;
      
      console.log(`📊 Video task ${taskId}: ${taskStatus} (${attempt + 1}/${maxAttempts})`);
      
      if (taskStatus === 'SUCCEEDED') {
        return { success: true, data: statusData.output };
      } else if (taskStatus === 'FAILED') {
        return { success: false, error: statusData.output?.message || 'Video generation failed' };
      }
    } catch (error) {
      console.error(`Poll attempt ${attempt + 1} failed:`, error);
    }
  }
  
  return { success: false, error: 'Video generation timed out' };
}

/**
 * Generate video
 */
async function generateVideo(request: VideoRequest): Promise<VideoResult> {
  const startTime = Date.now();
  
  // Determine model based on input type
  let modelKey: VideoModelKey = request.model || 'wan2.6-t2v';
  
  // Auto-select model based on inputs
  if (!request.model) {
    if (request.firstFrame && request.lastFrame) {
      modelKey = 'wan2.6-flf2v';
    } else if (request.sourceImage) {
      modelKey = 'wan2.6-i2v';
    }
  }
  
  const modelConfig = VIDEO_MODELS[modelKey];
  
  if (!modelConfig) {
    return {
      success: false,
      provider: 'alibaba',
      region: 'china-beijing',
      model: modelKey,
      error: `Invalid model. Available: ${Object.keys(VIDEO_MODELS).join(', ')}`,
    };
  }
  
  const { apiKey, baseUrl, region } = getApiConfig(modelKey);
  
  console.log(`🎬 [Alibaba Video] Model: ${modelKey}, Region: ${region}`);
  
  if (!apiKey) {
    return {
      success: false,
      provider: 'alibaba',
      region,
      model: modelKey,
      error: `API key not configured for ${region} region`,
      fallback: true
    };
  }
  
  // Validate duration
  const duration = Math.min(request.duration || 4, modelConfig.maxDuration);
  
  const { width, height } = getResolutionPixels(
    request.resolution || '1080p',
    request.aspectRatio || '16:9'
  );
  
  // Build payload based on model type
  const payload: Record<string, unknown> = {
    model: modelConfig.id,
    input: {
      prompt: request.prompt || 'High quality video',
      ...(request.negativePrompt && { negative_prompt: request.negativePrompt }),
    },
    parameters: {
      duration,
      fps: request.fps || 24,
      width,
      height,
      ...(request.seed && { seed: request.seed }),
      ...(request.steps && { steps: request.steps }),
      ...(request.cfgScale && { cfg_scale: request.cfgScale }),
      ...(request.motionStrength !== undefined && { motion_strength: request.motionStrength }),
      ...(request.cameraMotion && { camera_motion: request.cameraMotion }),
    }
  };
  
  // Add image inputs based on type
  if (modelConfig.type === 'i2v' && request.sourceImage) {
    (payload.input as Record<string, unknown>).image_url = request.sourceImage;
  } else if (modelConfig.type === 'flf2v') {
    if (request.firstFrame) {
      (payload.input as Record<string, unknown>).first_frame_url = request.firstFrame;
    }
    if (request.lastFrame) {
      (payload.input as Record<string, unknown>).last_frame_url = request.lastFrame;
    }
  }
  
  const apiUrl = `${baseUrl}${VIDEO_API_ENDPOINT}`;
  console.log(`🌐 Calling DashScope: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`DashScope error (${response.status}):`, responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        return {
          success: false,
          provider: 'alibaba',
          region,
          model: modelKey,
          error: errorJson.message || `API error: ${response.status}`,
          fallback: true
        };
      } catch {
        return {
          success: false,
          provider: 'alibaba',
          region,
          model: modelKey,
          error: `API error: ${response.status}`,
          fallback: true
        };
      }
    }
    
    const result = JSON.parse(responseText);
    const taskId = result.output?.task_id;
    
    if (!taskId) {
      return {
        success: false,
        provider: 'alibaba',
        region,
        model: modelKey,
        error: 'No task ID returned',
        fallback: true
      };
    }
    
    console.log(`📋 Video task created: ${taskId}`);
    
    // Poll for completion
    const pollResult = await pollTaskStatus(taskId, apiKey, baseUrl);
    
    if (!pollResult.success) {
      return {
        success: false,
        provider: 'alibaba',
        region,
        model: modelKey,
        taskId,
        status: 'failed',
        error: pollResult.error
      };
    }
    
    const videoUrl = pollResult.data?.video_url || pollResult.data?.results?.[0]?.url;
    const thumbnailUrl = pollResult.data?.cover_image_url;
    const processingTimeMs = Date.now() - startTime;
    
    console.log(`✅ [Alibaba Video] Generated in ${processingTimeMs}ms`);
    
    return {
      success: true,
      provider: 'alibaba',
      region,
      model: modelKey,
      videoUrl,
      thumbnailUrl,
      taskId,
      status: 'completed',
      metadata: {
        duration,
        fps: request.fps || 24,
        resolution: request.resolution || '1080p',
        processingTimeMs,
        estimatedCost: 0.08 * duration, // ~$0.08/second
      }
    };
    
  } catch (error) {
    console.error('[Alibaba Video] Error:', error);
    return {
      success: false,
      provider: 'alibaba',
      region,
      model: modelKey,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: VideoRequest = await req.json();
    
    if (!request.prompt && !request.sourceImage && !request.firstFrame) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt, sourceImage, or firstFrame required',
          availableModels: Object.entries(VIDEO_MODELS).map(([key, config]) => ({
            id: key,
            type: config.type,
            description: config.description,
            region: config.region,
            maxDuration: config.maxDuration,
            resolutions: config.resolutions,
          })),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await generateVideo(request);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Alibaba Video] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        provider: 'alibaba',
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
