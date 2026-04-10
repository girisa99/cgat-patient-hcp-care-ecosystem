import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { resolveModel, resolveModelSync } from '../_shared/dynamic-model-resolver.ts';

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

/**
 * Image Generation via Universal AI Connector Pattern
 * 
 * Supported providers/models:
 * - lovable (default): gemini-nano-banana, gemini-3-pro-image (via Lovable AI Gateway)
 * - openai: gpt-image-1
 * - stability: stable-diffusion-xl, stable-diffusion-3
 * - google: imagen-3 (direct Google API)
 * 
 * All routes go through Universal AI pattern for consistency
 */

// Universal AI model mappings
const UNIVERSAL_AI_MODELS = {
  // Lovable AI Gateway image models (nano banana = gemini flash image)
  'gemini-nano-banana': { gateway: 'lovable', model: 'google/gemini-2.5-flash-image-preview' },
  'gemini-3-pro-image': { gateway: 'lovable', model: 'google/gemini-3-pro-image-preview' },
  // OpenAI image models
  'gpt-image-1': { gateway: 'openai', model: 'gpt-image-1' },
  // Stability AI models
  'stable-diffusion-xl': { gateway: 'stability', model: 'stable-diffusion-xl-1024-v1-0' },
  'stable-diffusion-3': { gateway: 'stability', model: 'sd3-large' },
  // Direct Google Imagen
  'imagen-3': { gateway: 'google', model: 'imagen-3.0-generate-001' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      prompt, 
      aspectRatio = '1:1', 
      style = 'photographic',
      model = 'gemini-nano-banana',  // Default to nano banana via Universal AI
      provider  // Optional: override provider detection
    } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Content moderation check
    const moderationResult = moderatePrompt(prompt);
    if (!moderationResult.isAllowed) {
      console.log('[UniversalAI-Image] Content blocked:', moderationResult.reason);
      return new Response(JSON.stringify({ 
        success: false, 
        error: moderationResult.reason, 
        blocked: true,
        violationType: 'prohibited_content'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Resolve model configuration from Universal AI registry
    const modelConfig = UNIVERSAL_AI_MODELS[model as keyof typeof UNIVERSAL_AI_MODELS] 
      || UNIVERSAL_AI_MODELS['gemini-nano-banana'];
    
    const targetGateway = provider || modelConfig.gateway;
    const targetModel = modelConfig.model;

    console.log('[UniversalAI-Image] Generating image:', { 
      prompt: prompt.substring(0, 50), 
      aspectRatio, 
      style,
      model,
      gateway: targetGateway,
      targetModel
    });

    const startTime = Date.now();

    // Enhanced prompt for safety
    const safePrompt = `Create a ${style} style image: ${prompt}. ${aspectRatio} aspect ratio. Professional, high quality. Safe for all audiences.`;

    let imageUrl: string;
    let usedModel = targetModel;
    let usedProvider = targetGateway;

    // Route through Universal AI based on gateway
    switch (targetGateway) {
      case 'lovable': {
        // Use Lovable AI Gateway (Universal AI connector)
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
          throw new Error('LOVABLE_API_KEY not configured. Add it via Supabase secrets.');
        }
        
        console.log('[UniversalAI-Image] Routing to Lovable AI Gateway:', targetModel);
        
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: 'user', content: safePrompt }],
            modalities: ['image', 'text']
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[UniversalAI-Image] Lovable AI error:', response.status, errorText);
          
          if (response.status === 429) {
            return new Response(JSON.stringify({ 
              success: false, error: 'Rate limit exceeded. Please try again later.' 
            }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          if (response.status === 402) {
            return new Response(JSON.stringify({ 
              success: false, error: 'API credits exhausted. Please add funds.' 
            }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          
          throw new Error(`Lovable AI error: ${response.status}`);
        }

        const data = await response.json();
        imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (!imageUrl) {
          throw new Error('No image generated from Lovable AI Gateway');
        }
        
        usedProvider = 'universal-ai-lovable';
        break;
      }
      
      case 'openai': {
        // Route to OpenAI DALL-E via Universal AI pattern
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY not configured. Add it via Supabase secrets.');
        }
        
        console.log('[UniversalAI-Image] Routing to OpenAI DALL-E:', targetModel);
        
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: targetModel,
            prompt: safePrompt,
            n: 1,
            size: aspectRatio === '16:9' ? '1792x1024' : aspectRatio === '9:16' ? '1024x1792' : '1024x1024',
            quality: 'hd',
            style: style === 'photographic' ? 'natural' : 'vivid'
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI DALL-E error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        imageUrl = data.data?.[0]?.url;
        
        if (!imageUrl) {
          throw new Error('No image generated from OpenAI');
        }
        
        usedProvider = 'universal-ai-openai';
        break;
      }
      
      case 'stability': {
        // Route to Stability AI via Universal AI pattern
        const STABILITY_API_KEY = Deno.env.get('STABILITY_API_KEY');
        if (!STABILITY_API_KEY) {
          throw new Error('STABILITY_API_KEY not configured. Add it via Supabase secrets.');
        }
        
        console.log('[UniversalAI-Image] Routing to Stability AI:', targetModel);
        
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
          throw new Error(`Stability AI error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const base64Image = data.artifacts?.[0]?.base64;
        
        if (!base64Image) {
          throw new Error('No image generated from Stability AI');
        }
        
        imageUrl = `data:image/png;base64,${base64Image}`;
        usedProvider = 'universal-ai-stability';
        break;
      }
      
      case 'google': {
        // Route to Google Imagen directly
        const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
        if (!GOOGLE_API_KEY) {
          throw new Error('GOOGLE_API_KEY not configured. Add it via Supabase secrets.');
        }
        
        console.log('[UniversalAI-Image] Routing to Google Imagen:', targetModel);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateImage?key=${GOOGLE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: safePrompt,
              config: { 
                aspectRatio, 
                safetyFilterLevel: 'BLOCK_MOST',
                personGeneration: 'DONT_ALLOW'
              }
            }),
          }
        );

        const data = await response.json();
        if (!response.ok || !data.generatedImages?.length) {
          throw new Error(data.error?.message || 'No images generated from Google');
        }

        imageUrl = `data:image/png;base64,${data.generatedImages[0].imageBytes}`;
        usedProvider = 'universal-ai-google';
        break;
      }
      
      default:
        throw new Error(`Unsupported gateway: ${targetGateway}`);
    }

    const processingTime = Date.now() - startTime;
    console.log('[UniversalAI-Image] Success in', processingTime, 'ms');

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
        universalAI: true,
        timestamp: new Date().toISOString(),
        contentPolicy: 'Applied',
        availableModels: Object.keys(UNIVERSAL_AI_MODELS)
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[UniversalAI-Image] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});