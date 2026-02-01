/**
 * ALIBABA VIDEO GENERATOR - Production Implementation
 * 
 * Uses DashScope API for video generation with Wan models.
 * 
 * Model Availability:
 * - Wan 2.6 models: Available on INTERNATIONAL endpoint (dashscope-intl.aliyuncs.com)
 * - Wan 2.1/2.0 models: Available on CHINA endpoint (dashscope.aliyuncs.com)
 * 
 * API Keys:
 * - ALIBABA_API_KEY: For international region (Singapore/Virginia)
 * - ALIBABA_CHINA_API_KEY: For China (Beijing) region
 * 
 * The function auto-selects the correct endpoint based on the model version.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DashScope endpoints by region
const DASHSCOPE_INTL_URL = 'https://dashscope-intl.aliyuncs.com/api/v1';
const DASHSCOPE_CHINA_URL = 'https://dashscope.aliyuncs.com/api/v1';

// Available Wan video models (latest first)
const WAN_MODELS = {
  // Wan 2.6 - Latest (International endpoint)
  'wan2.6-t2v': 'wan2.6-t2v',                      // Text-to-video
  'wan2.6-i2v': 'wan2.6-i2v',                      // Image-to-video (from your screenshot)
  'wan2.6-flf2v': 'wan2.6-flf2v',                  // First-last-frame-to-video
  
  // Wan 2.1 - Stable (China endpoint)
  'wan2.1-t2v': 'wanx2.1-v1-text-to-video',
  'wan2.1-i2v': 'wanx2.1-v1-image-to-video',
  'wan2.1-turbo': 'wanx2.1-turbo-v1',
  
  // Legacy
  'wan2.0': 'wanx2.0-v1',
} as const;

// Models that use international endpoint
const INTL_MODELS = ['wan2.6-t2v', 'wan2.6-i2v', 'wan2.6-flf2v'];

// API endpoint for video generation (same path, different base URL)
const VIDEO_API_ENDPOINT = '/services/aigc/video-generation/video-synthesis';

interface VideoRequest {
  model?: keyof typeof WAN_MODELS;
  
  // Input
  prompt: string;
  negativePrompt?: string;
  sourceImage?: string;     // URL or base64 for I2V
  
  // Output configuration
  duration?: number;        // 2, 4, 6, 8, 10 seconds
  fps?: number;             // 24, 30
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  
  // Generation params
  seed?: number;
  steps?: number;           // Inference steps
  cfgScale?: number;        // Guidance scale
  
  // Motion control
  motionStrength?: number;  // 0-1, how much motion
  cameraMotion?: 'static' | 'pan_left' | 'pan_right' | 'zoom_in' | 'zoom_out' | 'orbit';
}

interface VideoResult {
  success: boolean;
  model: string;
  provider: 'alibaba';
  region: 'china-beijing';
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
 * Get appropriate API key and endpoint based on model
 */
function getApiConfig(modelKey: string): { apiKey: string | null; baseUrl: string; region: string } {
  const isIntlModel = INTL_MODELS.includes(modelKey);
  
  if (isIntlModel) {
    // Wan 2.6 models - use international endpoint
    const apiKey = Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY') || null;
    return { apiKey, baseUrl: DASHSCOPE_INTL_URL, region: 'international' };
  } else {
    // Wan 2.1/2.0 models - use China endpoint
    const apiKey = Deno.env.get('ALIBABA_CHINA_API_KEY') || Deno.env.get('ALIBABA_API_KEY') || null;
    return { apiKey, baseUrl: DASHSCOPE_CHINA_URL, region: 'china-beijing' };
  }
}

/**
 * Map resolution string to pixel dimensions
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
  maxAttempts: number = 60,
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
      
      console.log(`📊 Video task ${taskId} status: ${taskStatus} (${attempt + 1}/${maxAttempts})`);
      
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
 * Generate video with Wan models (2.6, 2.1, 2.0)
 */
async function generateVideo(request: VideoRequest): Promise<VideoResult> {
  const startTime = Date.now();
  
  // Default to wan2.6-i2v if image provided, otherwise wan2.6-t2v (latest models)
  const modelKey = request.model || (request.sourceImage ? 'wan2.6-i2v' : 'wan2.6-t2v');
  const modelId = WAN_MODELS[modelKey as keyof typeof WAN_MODELS] || modelKey;
  const isI2V = !!request.sourceImage;
  
  // Get correct endpoint based on model version
  const { apiKey, baseUrl, region } = getApiConfig(modelKey);
  
  console.log(`🎬 [Wan ${modelKey}] Starting ${isI2V ? 'image-to-video' : 'text-to-video'} generation`);
  console.log(`🌐 Using ${region} endpoint: ${baseUrl}`);
  
  if (!apiKey) {
    return {
      success: false,
      model: modelKey,
      provider: 'alibaba',
      region: region as 'china-beijing',
      error: `ALIBABA_API_KEY not configured for ${region} region`,
      fallback: true
    };
  }
  
  if (!request.prompt && !request.sourceImage) {
    return {
      success: false,
      model: modelKey,
      provider: 'alibaba',
      region: region as 'china-beijing',
      error: 'Prompt or source image required'
    };
  }
  
  const { width, height } = getResolutionPixels(
    request.resolution || '1080p',
    request.aspectRatio || '16:9'
  );
  
  // Build payload based on model type
  const payload: Record<string, unknown> = {
    model: isI2V ? WAN_MODELS['wan2.1-i2v'] : modelId,
    input: {
      prompt: request.prompt || 'High quality video',
      ...(request.negativePrompt && { negative_prompt: request.negativePrompt }),
      ...(request.sourceImage && { image_url: request.sourceImage }),
    },
    parameters: {
      duration: request.duration || 4,
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
  
  console.log(`🌐 Calling DashScope ${region}: ${baseUrl}${VIDEO_API_ENDPOINT}`);
  
  try {
    const response = await fetch(`${baseUrl}${VIDEO_API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // Video generation is always async
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`DashScope error (${response.status}):`, responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.code === 'AccessDenied' || errorJson.code === 'ModelNotExist') {
          return {
            success: false,
            model: modelKey,
            provider: 'alibaba',
            region: region as 'china-beijing',
            error: `Wan ${modelKey} model not available. Check your account status and model activation in DashScope console.`,
            fallback: true
          };
        }
        return {
          success: false,
          model: modelKey,
          provider: 'alibaba',
          region: region as 'china-beijing',
          error: errorJson.message || `API error: ${response.status}`,
          fallback: true
        };
      } catch {
        return {
          success: false,
          model: modelKey,
          provider: 'alibaba',
          region: region as 'china-beijing',
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
        model: modelKey,
        provider: 'alibaba',
        region: region as 'china-beijing',
        error: 'No task ID returned from API',
        fallback: true
      };
    }
    
    console.log(`📋 Video generation task created: ${taskId}`);
    
    // Poll for completion (video generation takes time)
    const pollResult = await pollTaskStatus(taskId, apiKey, baseUrl, 60, 3000);
    
    if (!pollResult.success) {
      return {
        success: false,
        model: modelKey,
        provider: 'alibaba',
        region: region as 'china-beijing',
        taskId,
        status: 'failed',
        error: pollResult.error
      };
    }
    
    const videoUrl = pollResult.data?.video_url || pollResult.data?.results?.[0]?.url;
    const thumbnailUrl = pollResult.data?.cover_image_url;
    const processingTimeMs = Date.now() - startTime;
    
    console.log(`✅ [Wan ${modelKey}] Video generated in ${processingTimeMs}ms`);
    
    return {
      success: true,
      model: modelKey,
      provider: 'alibaba',
      region: region as 'china-beijing',
      videoUrl,
      thumbnailUrl,
      taskId,
      status: 'completed',
      metadata: {
        duration: request.duration || 4,
        fps: request.fps || 24,
        resolution: request.resolution || '1080p',
        processingTimeMs,
        estimatedCost: 0.086 * (request.duration || 4), // ~$0.086 per second (from your screenshot)
      }
    };
    
  } catch (error) {
    console.error('[Wan Video] Error:', error);
    return {
      success: false,
      model: modelKey,
      provider: 'alibaba',
      region: region as 'china-beijing',
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
    
    console.log(`🎬 [Alibaba Video] Processing request for model: ${request.model || 'wan2.6-t2v (default)'}`);
    
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
        region: 'china-beijing', 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
