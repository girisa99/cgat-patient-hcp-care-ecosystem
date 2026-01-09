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
      return { isAllowed: false, reason: 'Content policy violation: Adult, violent, or inappropriate content is not allowed.' };
    }
  }
  return { isAllowed: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is not set');

    const body = await req.json();
    const { prompt, aspectRatio = '1:1', style = 'photographic' } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const moderationResult = moderatePrompt(prompt);
    if (!moderationResult.isAllowed) {
      return new Response(JSON.stringify({ success: false, error: moderationResult.reason, blocked: true }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const enhancedPrompt = `Create a ${style} style image: ${prompt}. ${aspectRatio} aspect ratio. High quality, professional. Safe for all audiences.`;
    const startTime = Date.now();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: enhancedPrompt, config: { aspectRatio, safetyFilterLevel: 'BLOCK_MOST', personGeneration: 'DONT_ALLOW' } }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `Gemini API error: ${response.status}`);
    if (!data.generatedImages?.length) throw new Error('No images generated');

    const imageUrl = `data:image/png;base64,${data.generatedImages[0].imageBytes}`;

    return new Response(JSON.stringify({ 
      success: true, imageUrl, mediaUrl: imageUrl, processingTime: Date.now() - startTime,
      contentModerated: true, disclaimer: 'AI-generated content. Verify before use.',
      metadata: { prompt, aspectRatio, style, model: 'imagen-3.0-generate-001', timestamp: new Date().toISOString() }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
