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
    const { prompt, provider = 'replicate', model = 'minimax/video-01', duration = 5 } = body;

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

    console.log('🎬 Generating video with provider:', provider, 'model:', model);

    let videoUrl: string;
    const startTime = Date.now();

    switch (provider) {
      case 'replicate':
        videoUrl = await generateWithReplicate(prompt, model);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const processingTime = Date.now() - startTime;

    return new Response(JSON.stringify({ 
      success: true,
      videoUrl,
      processingTime,
      contentModerated: true,
      disclaimer: 'This is AI-generated video content. Please verify before use. Adult content is prohibited.',
      metadata: {
        prompt,
        provider,
        model,
        duration,
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

async function generateWithReplicate(prompt: string, model: string): Promise<string> {
  const apiKey = Deno.env.get('REPLICATE_API_TOKEN');
  
  if (!apiKey) {
    throw new Error('REPLICATE_API_TOKEN is not configured. Please add it to your Edge Function secrets.');
  }

  // Get version ID for the model
  const versionId = getReplicateVersion(model);
  
  // Add safety guidance to prompt
  const safePrompt = `${prompt}. Safe for all audiences, no explicit content.`;
  
  console.log('📡 Creating Replicate prediction for model:', model);

  // Create prediction
  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: versionId,
      input: {
        prompt: safePrompt,
      },
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.text();
    console.error('Replicate API error:', errorData);
    throw new Error(`Replicate API error: ${createResponse.status}`);
  }

  const prediction = await createResponse.json();
  console.log('📋 Prediction created:', prediction.id);

  // Poll for completion (max 5 minutes)
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    attempts++;

    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    const status = await statusResponse.json();
    console.log(`⏳ Prediction status (attempt ${attempts}):`, status.status);

    if (status.status === 'succeeded') {
      const output = status.output;
      // Handle different output formats
      if (typeof output === 'string') {
        return output;
      } else if (Array.isArray(output) && output.length > 0) {
        return output[0];
      } else if (output?.video) {
        return output.video;
      }
      throw new Error('Unexpected output format from Replicate');
    } else if (status.status === 'failed') {
      throw new Error(status.error || 'Video generation failed');
    }
  }

  throw new Error('Video generation timed out');
}

function getReplicateVersion(model: string): string {
  const versions: Record<string, string> = {
    'minimax/video-01': 'abafe05d52e3f2fb91bbcd8baee6cf7848e85b29c949e3aae1d7e1b3ebc',
    'stability-ai/stable-video-diffusion': 'db7c0cf87879d76a3b0379f8c5f04dce8c29f69fcb7ec8bfe09e0c2e7d6fc1f5',
    'anotherjesse/zeroscope-v2-xl': 'a87c2b1a5cc55cfe9a25b739ac72f4febc0ce85b1f4a65ff5c9b6f0f1a9b2e9c',
  };

  return versions[model] || versions['minimax/video-01'];
}
