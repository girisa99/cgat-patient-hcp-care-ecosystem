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
        reason: 'Content policy violation: Adult, violent, or inappropriate content is not allowed.' 
      };
    }
  }
  return { isAllowed: true };
}

// Image generation models available through Universal AI connector
const IMAGE_MODELS = {
  // Lovable AI Gateway models (via Universal AI connector)
  'gemini-nano-banana': 'google/gemini-2.5-flash-image-preview',
  'gemini-3-pro-image': 'google/gemini-3-pro-image-preview',
  // OpenAI models
  'dall-e-3': 'dall-e-3',
  'dall-e-2': 'dall-e-2',
  // Stability AI models
  'stable-diffusion-xl': 'stable-diffusion-xl-1024-v1-0',
  'stable-diffusion-3': 'sd3-large',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const STABILITY_API_KEY = Deno.env.get('STABILITY_API_KEY');
    
    const body = await req.json();
    const { 
      prompt, 
      aspectRatio = '1:1', 
      style = 'photographic',
      model = 'gemini-nano-banana',  // Default to nano banana
      provider = 'lovable'  // Default provider
    } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Content moderation check
    const moderationResult = moderatePrompt(prompt);
    if (!moderationResult.isAllowed) {
      console.log('[gemini-generate-image] Content blocked:', moderationResult.reason);
      return new Response(JSON.stringify({ 
        success: false, 
        error: moderationResult.reason, 
        blocked: true,
        violationType: 'prohibited_content'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[gemini-generate-image] Generating image:', { 
      prompt: prompt.substring(0, 50), 
      aspectRatio, 
      style,
      model,
      provider 
    });
    const startTime = Date.now();

    // Enhanced prompt for safety
    const safePrompt = `Create a ${style} style image: ${prompt}. ${aspectRatio} aspect ratio. Professional, high quality. Safe for all audiences.`;

    let imageUrl: string;
    let usedModel = model;
    let usedProvider = provider;

    // Route to appropriate provider based on model selection
    if (provider === 'lovable' || model.includes('gemini') || model.includes('nano-banana')) {
      // Use Lovable AI Gateway (Universal AI connector pattern)
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured for image generation');
      }
      
      const gatewayModel = IMAGE_MODELS[model as keyof typeof IMAGE_MODELS] || 'google/gemini-2.5-flash-image-preview';
      console.log('[gemini-generate-image] Using Lovable AI Gateway with model:', gatewayModel);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: gatewayModel,
          messages: [{ role: 'user', content: safePrompt }],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[gemini-generate-image] Lovable AI error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Rate limit exceeded. Please try again later.' 
          }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'API credits exhausted. Please add funds.' 
          }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        
        throw new Error(`Lovable AI error: ${response.status}`);
      }

      const data = await response.json();
      const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!generatedImage) {
        console.error('[gemini-generate-image] No image in response:', JSON.stringify(data).substring(0, 200));
        throw new Error('No image generated');
      }
      
      imageUrl = generatedImage;
      usedModel = gatewayModel;
      usedProvider = 'lovable-ai-gateway';
    } 
    else if (provider === 'openai' || model.includes('dall-e')) {
      // Use OpenAI DALL-E
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured for image generation');
      }
      
      const dalleModel = model.includes('dall-e-2') ? 'dall-e-2' : 'dall-e-3';
      console.log('[gemini-generate-image] Using OpenAI DALL-E:', dalleModel);
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: dalleModel,
          prompt: safePrompt,
          n: 1,
          size: aspectRatio === '16:9' ? '1792x1024' : aspectRatio === '9:16' ? '1024x1792' : '1024x1024',
          quality: 'hd',
          style: style === 'photographic' ? 'natural' : 'vivid'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[gemini-generate-image] OpenAI error:', response.status, errorText);
        throw new Error(`OpenAI error: ${response.status}`);
      }

      const data = await response.json();
      imageUrl = data.data?.[0]?.url;
      
      if (!imageUrl) {
        throw new Error('No image generated from OpenAI');
      }
      
      usedModel = dalleModel;
      usedProvider = 'openai';
    }
    else if (provider === 'stability' || model.includes('stable-diffusion')) {
      // Use Stability AI
      if (!STABILITY_API_KEY) {
        throw new Error('STABILITY_API_KEY not configured for image generation');
      }
      
      console.log('[gemini-generate-image] Using Stability AI');
      
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [{ text: safePrompt, weight: 1 }],
          cfg_scale: 7,
          height: aspectRatio === '16:9' ? 576 : 1024,
          width: aspectRatio === '16:9' ? 1024 : aspectRatio === '9:16' ? 576 : 1024,
          samples: 1,
          steps: 30,
          style_preset: style === 'photographic' ? 'photographic' : 'digital-art'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[gemini-generate-image] Stability AI error:', response.status, errorText);
        throw new Error(`Stability AI error: ${response.status}`);
      }

      const data = await response.json();
      const base64Image = data.artifacts?.[0]?.base64;
      
      if (!base64Image) {
        throw new Error('No image generated from Stability AI');
      }
      
      imageUrl = `data:image/png;base64,${base64Image}`;
      usedModel = 'stable-diffusion-xl';
      usedProvider = 'stability-ai';
    }
    else {
      // Fallback to Lovable AI Gateway with nano banana
      if (!LOVABLE_API_KEY) {
        throw new Error('No API key configured for image generation');
      }
      
      console.log('[gemini-generate-image] Fallback to Lovable AI Gateway');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [{ role: 'user', content: safePrompt }],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = await response.json();
      imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        throw new Error('No image generated');
      }
      
      usedModel = 'google/gemini-2.5-flash-image-preview';
      usedProvider = 'lovable-ai-gateway';
    }

    const processingTime = Date.now() - startTime;
    console.log('[gemini-generate-image] Success in', processingTime, 'ms');

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl, 
      mediaUrl: imageUrl, 
      processingTime,
      contentModerated: true,
      disclaimer: 'AI-generated content. Please verify before use. Adult content is prohibited.',
      metadata: { 
        prompt: prompt.substring(0, 100), 
        aspectRatio, 
        style, 
        model: usedModel,
        provider: usedProvider,
        timestamp: new Date().toISOString(),
        contentPolicy: 'Applied',
        availableModels: Object.keys(IMAGE_MODELS)
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[gemini-generate-image] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});