import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
      referenceImage
    } = body;

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

    // Auto-select provider based on availability
    const selectedProvider = selectProvider(provider);
    const selectedModel = selectModel(selectedProvider, model);
    
    console.log('🎬 Generating video with provider:', selectedProvider, 'model:', selectedModel);

    let result: VideoResult;
    const startTime = Date.now();

    switch (selectedProvider) {
      case 'openai':
        result = await generateWithOpenAI(prompt, selectedModel, duration, aspectRatio);
        break;
      case 'modelslab':
        result = await generateWithModelsLab(prompt, selectedModel, duration, referenceImage);
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
}

function selectProvider(requestedProvider: string): string {
  if (requestedProvider !== 'auto') return requestedProvider;
  
  // Check available API keys and select best provider
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const modelsLabKey = Deno.env.get('MODELSLAB_API_KEY');
  const replicateKey = Deno.env.get('REPLICATE_API_TOKEN');
  const googleKey = Deno.env.get('GOOGLE_API_KEY');
  
  // Priority: OpenAI (Sora) > ModelsLab (AnimateDiff) > Gemini (Veo) > Replicate
  if (openaiKey) return 'openai';
  if (modelsLabKey) return 'modelslab';
  if (googleKey) return 'gemini';
  if (replicateKey) return 'replicate';
  
  throw new Error('No video generation API keys configured. Please add OPENAI_API_KEY, MODELSLAB_API_KEY, or REPLICATE_API_TOKEN.');
}

function selectModel(provider: string, requestedModel: string): string {
  if (requestedModel !== 'auto') return requestedModel;
  
  const defaultModels: Record<string, string> = {
    'openai': 'sora-1.0-turbo',
    'modelslab': 'animatediff',
    'replicate': 'minimax/video-01',
    'gemini': 'veo-001',
  };
  
  return defaultModels[provider] || 'auto';
}

// OpenAI Sora / AnimateDiff Video Generation
async function generateWithOpenAI(prompt: string, model: string, duration: number, aspectRatio: string): Promise<VideoResult> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  console.log('🎥 Generating video with OpenAI Sora:', model);

  // OpenAI Video API (Sora)
  const response = await fetch('https://api.openai.com/v1/videos/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'sora-1.0-turbo',
      prompt: `${prompt}. Safe for all audiences, high quality cinematic video.`,
      n: 1,
      duration: Math.min(duration, 20), // Sora max 20 seconds
      aspect_ratio: aspectRatio,
      style: 'natural',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI Video API error:', errorText);
    
    // Fall back to image-to-video if Sora not available
    if (response.status === 404 || response.status === 400) {
      console.log('⚠️ Sora not available, falling back to AnimateDiff via ModelsLab');
      return generateWithModelsLab(prompt, 'animatediff', duration);
    }
    
    throw new Error(`OpenAI Video API error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    videoUrl: data.data[0]?.url || data.data[0]?.video_url,
    thumbnailUrl: data.data[0]?.thumbnail_url,
    provider: 'openai',
    model: model,
  };
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
