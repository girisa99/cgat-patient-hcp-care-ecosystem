/**
 * ALIBABA 3D GENERATOR - Production Implementation
 * 
 * Uses DashScope China (Beijing) API for 3D generation:
 * - Richdreamer (Image-to-3D)
 * - OmniAvatar (Real-time 3D Avatars)
 * - 3D Animate Hub (Photo to Animated 3D)
 * - Animate3D (3D Model Animation)
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

// DashScope China (Beijing) endpoint
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

// Available 3D models
const MODEL_CONFIG = {
  'richdreamer': {
    id: 'richdreamer-v1',
    endpoint: '/services/aigc/3d-generation/richdreamer',
    description: 'Image-to-3D mesh with textures',
    inputType: 'image',
  },
  'omni-avatar': {
    id: 'omniavatar-v1',
    endpoint: '/services/aigc/3d-generation/omniavatar',
    description: 'Real-time 3D avatar generation',
    inputType: 'image',
  },
  '3d-animate-hub': {
    id: '3d-animate-hub-v1',
    endpoint: '/services/aigc/3d-generation/animate-hub',
    description: 'Photo to animated 3D character',
    inputType: 'image',
  },
  'animate3d': {
    id: 'animate3d-v1',
    endpoint: '/services/aigc/3d-generation/animate3d',
    description: 'Animate existing 3D models',
    inputType: 'model',
  },
  'text-to-3d': {
    id: 'text-to-3d-v1',
    endpoint: '/services/aigc/3d-generation/text-to-3d',
    description: 'Generate 3D from text prompt',
    inputType: 'text',
  },
} as const;

type ModelType = keyof typeof MODEL_CONFIG;

interface ThreeDRequest {
  model: ModelType;
  
  // Input based on model type
  prompt?: string;            // For text-to-3d
  sourceImage?: string;       // URL or base64 for image-to-3d
  sourceModel?: string;       // URL for 3D model animation
  
  // Output configuration
  outputFormat?: 'glb' | 'gltf' | 'fbx' | 'obj' | 'usdz';
  textureResolution?: '1k' | '2k' | '4k';
  polyCount?: 'low' | 'medium' | 'high'; // Triangle count
  
  // Animation params (for animate3d and 3d-animate-hub)
  animationType?: 'idle' | 'walk' | 'run' | 'talk' | 'custom';
  animationDuration?: number;
  fps?: number;
  
  // Style params
  style?: 'realistic' | 'stylized' | 'cartoon' | 'anime';
  seed?: number;
  
  // Advanced
  generateNormals?: boolean;
  generateUVs?: boolean;
  optimizeForAR?: boolean;
}

interface ThreeDResult {
  success: boolean;
  model: string;
  provider: 'alibaba';
  region: 'china-beijing';
  modelUrl?: string;           // 3D model file URL
  textureUrls?: string[];      // Texture files
  animationUrl?: string;       // Animation file if applicable
  previewUrl?: string;         // 2D preview render
  taskId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    polyCount?: number;
    textureResolution?: string;
    outputFormat?: string;
    processingTimeMs?: number;
    estimatedCost?: number;
  };
  error?: string;
  fallback?: boolean;
}

/**
 * Get API key with China region priority
 */
function getApiKey(): string | null {
  return Deno.env.get('ALIBABA_CHINA_API_KEY') || Deno.env.get('ALIBABA_API_KEY') || null;
}

/**
 * Poll for async task completion
 */
async function pollTaskStatus(
  taskId: string,
  apiKey: string,
  maxAttempts: number = 90,
  intervalMs: number = 4000
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  const statusUrl = `${DASHSCOPE_BASE_URL}/tasks/${taskId}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    
    try {
      const response = await fetch(statusUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      
      if (!response.ok) continue;
      
      const statusData = await response.json();
      const taskStatus = statusData.output?.task_status;
      
      console.log(`📊 3D task ${taskId} status: ${taskStatus} (${attempt + 1}/${maxAttempts})`);
      
      if (taskStatus === 'SUCCEEDED') {
        return { success: true, data: statusData.output };
      } else if (taskStatus === 'FAILED') {
        return { success: false, error: statusData.output?.message || '3D generation failed' };
      }
    } catch (error) {
      console.error(`Poll attempt ${attempt + 1} failed:`, error);
    }
  }
  
  return { success: false, error: '3D generation timed out (models may take several minutes)' };
}

/**
 * Generate 3D model with specified model type
 */
async function generate3D(request: ThreeDRequest, apiKey: string): Promise<ThreeDResult> {
  const startTime = Date.now();
  
  const modelConfig = MODEL_CONFIG[request.model];
  if (!modelConfig) {
    return {
      success: false,
      model: request.model,
      provider: 'alibaba',
      region: 'china-beijing',
      error: `Invalid model. Available: ${Object.keys(MODEL_CONFIG).join(', ')}`
    };
  }
  
  console.log(`🧊 [${request.model}] Starting ${modelConfig.description}`);
  
  // Validate input based on model type
  if (modelConfig.inputType === 'image' && !request.sourceImage) {
    return {
      success: false,
      model: request.model,
      provider: 'alibaba',
      region: 'china-beijing',
      error: 'Source image required for this model'
    };
  }
  
  if (modelConfig.inputType === 'text' && !request.prompt) {
    return {
      success: false,
      model: request.model,
      provider: 'alibaba',
      region: 'china-beijing',
      error: 'Text prompt required for text-to-3D'
    };
  }
  
  if (modelConfig.inputType === 'model' && !request.sourceModel) {
    return {
      success: false,
      model: request.model,
      provider: 'alibaba',
      region: 'china-beijing',
      error: '3D model URL required for animation'
    };
  }
  
  // Build payload
  const payload: Record<string, unknown> = {
    model: modelConfig.id,
    input: {
      ...(request.prompt && { prompt: request.prompt }),
      ...(request.sourceImage && { image_url: request.sourceImage }),
      ...(request.sourceModel && { model_url: request.sourceModel }),
    },
    parameters: {
      output_format: request.outputFormat || 'glb',
      texture_resolution: request.textureResolution || '2k',
      poly_count: request.polyCount || 'medium',
      style: request.style || 'realistic',
      ...(request.seed && { seed: request.seed }),
      ...(request.generateNormals !== undefined && { generate_normals: request.generateNormals }),
      ...(request.generateUVs !== undefined && { generate_uvs: request.generateUVs }),
      ...(request.optimizeForAR && { optimize_for_ar: request.optimizeForAR }),
      // Animation params
      ...(request.animationType && { animation_type: request.animationType }),
      ...(request.animationDuration && { animation_duration: request.animationDuration }),
      ...(request.fps && { fps: request.fps }),
    }
  };
  
  const apiUrl = `${DASHSCOPE_BASE_URL}${modelConfig.endpoint}`;
  console.log(`🇨🇳 Calling DashScope China: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // 3D generation is always async
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`DashScope error (${response.status}):`, responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.code === 'AccessDenied') {
          return {
            success: false,
            model: request.model,
            provider: 'alibaba',
            region: 'china-beijing',
            error: `3D model "${request.model}" not activated. Enable it in DashScope Model Square (China Beijing region).`,
            fallback: true
          };
        }
        return {
          success: false,
          model: request.model,
          provider: 'alibaba',
          region: 'china-beijing',
          error: errorJson.message || `API error: ${response.status}`,
          fallback: true
        };
      } catch {
        return {
          success: false,
          model: request.model,
          provider: 'alibaba',
          region: 'china-beijing',
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
        model: request.model,
        provider: 'alibaba',
        region: 'china-beijing',
        error: 'No task ID returned from API',
        fallback: true
      };
    }
    
    console.log(`📋 3D generation task created: ${taskId}`);
    
    // Poll for completion (3D generation can take several minutes)
    const pollResult = await pollTaskStatus(taskId, apiKey, 90, 4000);
    
    if (!pollResult.success) {
      return {
        success: false,
        model: request.model,
        provider: 'alibaba',
        region: 'china-beijing',
        taskId,
        status: 'failed',
        error: pollResult.error
      };
    }
    
    const modelUrl = pollResult.data?.model_url || pollResult.data?.results?.[0]?.model_url;
    const textureUrls = pollResult.data?.texture_urls || [];
    const animationUrl = pollResult.data?.animation_url;
    const previewUrl = pollResult.data?.preview_url || pollResult.data?.thumbnail_url;
    const processingTimeMs = Date.now() - startTime;
    
    console.log(`✅ [${request.model}] 3D model generated in ${processingTimeMs}ms`);
    
    return {
      success: true,
      model: request.model,
      provider: 'alibaba',
      region: 'china-beijing',
      modelUrl,
      textureUrls,
      animationUrl,
      previewUrl,
      taskId,
      status: 'completed',
      metadata: {
        polyCount: pollResult.data?.poly_count,
        textureResolution: request.textureResolution || '2k',
        outputFormat: request.outputFormat || 'glb',
        processingTimeMs,
        estimatedCost: 0.20, // 3D generation is relatively expensive
      }
    };
    
  } catch (error) {
    console.error('[Alibaba 3D] Error:', error);
    return {
      success: false,
      model: request.model,
      provider: 'alibaba',
      region: 'china-beijing',
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
    const apiKey = getApiKey();
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ALIBABA_CHINA_API_KEY not configured. 3D models require a China (Beijing) region API key.',
          availableModels: Object.keys(MODEL_CONFIG),
          fallback: true
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: ThreeDRequest = await req.json();
    
    if (!request.model) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Model parameter required',
          availableModels: Object.entries(MODEL_CONFIG).map(([key, config]) => ({
            id: key,
            description: config.description,
            inputType: config.inputType,
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`🧊 [Alibaba 3D] Processing ${request.model} request`);
    console.log(`🇨🇳 Using China (Beijing) DashScope endpoint`);
    
    const result = await generate3D(request, apiKey);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Alibaba 3D] Error:', error);
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
