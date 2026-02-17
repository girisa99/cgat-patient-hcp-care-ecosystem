import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * ModelsLab Unified Media Generation
 * 
 * Single API for: Image, Video, Audio, 3D, Voice Clone
 * Hosts: Stable Diffusion, FLUX, Midjourney-style, CivitAI models
 * 
 * Endpoints:
 * - /text2img: Text to Image
 * - /img2img: Image to Image
 * - /inpaint: Inpainting
 * - /controlnet: ControlNet
 * - /text2video: Text to Video
 * - /img2video: Image to Video
 * - /text2audio: Text to Audio/Music
 * - /voice_clone: Voice cloning
 * - /text2mesh: 3D generation
 */

const MODELSLAB_BASE_URL = 'https://modelslab.com/api/v6';

// Model presets for different use cases - Updated 2026-02-01
const MODEL_PRESETS = {
  // Image Models (Use actual ModelsLab model IDs)
  'realistic': 'realistic-vision-v5-1-inpainting', // Use actual model ID
  'sdxl': 'sdxl-base-1.0',
  'sd3': 'sd3-medium',
  'flux-schnell': 'flux-schnell', // May need enterprise access
  'flux-dev': 'flux-dev',
  'midjourney-style': 'midjourney-v4',
  'anime': 'anything-v5',
  'dreamshaper': 'dreamshaper-xl',
  'protogen': 'protogen-x3.4',
  'juggernaut': 'juggernaut-xl-v9',
  // Stable Diffusion Default
  'default': 'sdxl-base-1.0',
  // Video Models
  'animatediff': 'animatediff-v2',
  'svd': 'stable-video-diffusion-img2vid',
  // Audio Models
  'musicgen': 'musicgen-medium',
  'bark': 'bark',
};

// Content moderation
const BLOCKED_PATTERNS = [
  /\b(nsfw|xxx|porn|explicit|adult\s*content|nude|naked|sex(ual)?|erotic)\b/i,
  /\b(gore|violent|murder|brutal|blood|weapon)\b/i,
  /\b(hate|racist|discriminat|harass)\b/i,
  /\b(child|minor|kid|underage)\s*(nude|naked|sex)/i,
];

function moderatePrompt(prompt: string): { allowed: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(prompt)) {
      return { allowed: false, reason: 'Content policy violation' };
    }
  }
  return { allowed: true };
}

interface GenerationRequest {
  type: 'image' | 'video' | 'audio' | '3d' | 'voice_clone';
  prompt: string;
  model?: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance_scale?: number;
  seed?: number;
  samples?: number;
  // Video specific
  duration?: number;
  fps?: number;
  // Audio specific
  audio_duration?: number;
  // Image-to-X
  init_image?: string;
  strength?: number;
  // ControlNet
  controlnet_type?: string;
  controlnet_image?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
  if (!MODELSLAB_API_KEY) {
    return new Response(
      JSON.stringify({ 
        error: 'MODELSLAB_API_KEY not configured',
        setup: 'Add MODELSLAB_API_KEY to your Supabase secrets'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: GenerationRequest = await req.json();
    const { type, prompt, model, ...options } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Content moderation
    const moderation = moderatePrompt(prompt);
    if (!moderation.allowed) {
      return new Response(
        JSON.stringify({ error: moderation.reason, blocked: true }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let endpoint: string;
    let requestBody: Record<string, unknown>;
    const selectedModel = model ? (MODEL_PRESETS[model as keyof typeof MODEL_PRESETS] || model) : MODEL_PRESETS.default;

    switch (type) {
      case 'image':
        endpoint = `${MODELSLAB_BASE_URL}/images/text2img`;
        requestBody = {
          key: MODELSLAB_API_KEY,
          model_id: selectedModel,
          prompt: prompt,
          negative_prompt: options.negative_prompt || 'blurry, bad quality, distorted',
          width: options.width || 1024,
          height: options.height || 1024,
          samples: options.samples || 1,
          num_inference_steps: options.steps || 30,
          guidance_scale: options.guidance_scale || 7.5,
          seed: options.seed || null,
          safety_checker: true,
          enhance_prompt: true,
        };
        break;

      case 'video':
        endpoint = options.init_image 
          ? `${MODELSLAB_BASE_URL}/video/img2video`
          : `${MODELSLAB_BASE_URL}/video/text2video`;
        // ModelsLab requires minimum 16 FPS for video and max 25 frames
        const videoFps = Math.max(options.fps || 16, 16);
        const videoDuration = options.duration || 2;
        // Cap frames at 25 (ModelsLab limit) - adjust duration if needed
        const targetFrames = Math.min(videoDuration * videoFps, 25);
        requestBody = {
          key: MODELSLAB_API_KEY,
          model_id: selectedModel || 'animatediff',
          prompt: prompt,
          negative_prompt: options.negative_prompt || 'blurry, jittery, distorted',
          width: options.width || 512,
          height: options.height || 512,
          num_frames: targetFrames,
          fps: videoFps,
          init_image: options.init_image || null,
          strength: options.strength || 0.8,
        };
        console.log(`📹 ModelsLab video: ${targetFrames} frames @ ${videoFps}fps (~${(targetFrames / videoFps).toFixed(1)}s)`);
        break;

      case 'audio':
        endpoint = `${MODELSLAB_BASE_URL}/voice/text2audio`;
        requestBody = {
          key: MODELSLAB_API_KEY,
          model_id: selectedModel || 'musicgen',
          prompt: prompt,
          duration: options.audio_duration || 10,
        };
        break;

      case '3d':
        endpoint = `${MODELSLAB_BASE_URL}/3d/text2mesh`;
        requestBody = {
          key: MODELSLAB_API_KEY,
          prompt: prompt,
          negative_prompt: options.negative_prompt,
        };
        break;

      case 'voice_clone':
        endpoint = `${MODELSLAB_BASE_URL}/voice/voice_clone`;
        requestBody = {
          key: MODELSLAB_API_KEY,
          init_audio: options.init_image, // reusing init_image for audio source
          prompt: prompt,
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`🎨 ModelsLab ${type} generation:`, { model: selectedModel, prompt: prompt.slice(0, 50) });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.status === 'error') {
      console.error('ModelsLab error:', data);
      return new Response(
        JSON.stringify({ error: data.message || 'ModelsLab generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle async generation (processing status)
    if (data.status === 'processing') {
      return new Response(
        JSON.stringify({
          status: 'processing',
          id: data.id,
          eta: data.eta || 30,
          fetch_url: data.fetch_result || null,
          message: 'Generation in progress. Poll fetch_url for results.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success - return output
    return new Response(
      JSON.stringify({
        success: true,
        type,
        model: selectedModel,
        output: data.output || data.future_links || data.proxy_links,
        meta: data.meta || null,
        generationTime: data.generationTime || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ModelsLab error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
