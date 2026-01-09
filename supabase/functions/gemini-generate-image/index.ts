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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    
    if (!LOVABLE_API_KEY && !GOOGLE_API_KEY) {
      throw new Error('No API key configured for image generation');
    }

    const body = await req.json();
    const { prompt, aspectRatio = '1:1', style = 'photographic' } = body;

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

    console.log('[gemini-generate-image] Generating image:', { prompt: prompt.substring(0, 50), aspectRatio, style });
    const startTime = Date.now();

    // Enhanced prompt for safety
    const safePrompt = `Create a ${style} style image: ${prompt}. ${aspectRatio} aspect ratio. Professional, high quality. Safe for all audiences.`;

    let imageUrl: string;

    // Try Lovable AI Gateway first (Nano banana model)
    if (LOVABLE_API_KEY) {
      console.log('[gemini-generate-image] Using Lovable AI Gateway');
      
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
    } 
    // Fallback to direct Google API
    else if (GOOGLE_API_KEY) {
      console.log('[gemini-generate-image] Using direct Google API');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${GOOGLE_API_KEY}`,
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
        throw new Error(data.error?.message || 'No images generated');
      }

      imageUrl = `data:image/png;base64,${data.generatedImages[0].imageBytes}`;
    } else {
      throw new Error('No API key available');
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
        model: 'gemini-image',
        timestamp: new Date().toISOString(),
        contentPolicy: 'Applied'
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
