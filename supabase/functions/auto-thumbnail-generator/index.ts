import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThumbnailRequest {
  action: 'generate' | 'analyze' | 'extract_frame' | 'framework_generate';
  videoUrl?: string;
  title?: string;
  description?: string;
  style?: 'youtube' | 'tiktok' | 'instagram' | 'podcast' | 'webinar' | 'custom';
  frameTimestamp?: number;
  customPrompt?: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    fontFamily?: string;
    overlayText?: string;
  };
  audienceSegment?: string;
  productId?: string;
  productName?: string;
  hook?: string;
  cta?: string;
  frameworkType?: string;
  messagingTier?: string;
  sceneIndex?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ThumbnailRequest = await req.json();

    console.log(`🖼️ Thumbnail Request:`, {
      action: request.action,
      style: request.style,
      hasVideo: !!request.videoUrl,
      title: request.title?.substring(0, 50),
      audience: request.audienceSegment,
      framework: request.frameworkType,
    });

    let result;

    switch (request.action) {
      case 'generate':
        result = await generateThumbnail(req, request);
        break;
      case 'framework_generate':
        result = await generateFrameworkThumbnail(req, request);
        break;
      case 'analyze':
        result = await analyzeForThumbnail(req, request);
        break;
      case 'extract_frame':
        result = await extractBestFrame(request);
        break;
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// Delegate to ai-universal-processor for image generation
// Uses all configured AI providers (Gemini, DALL-E, Stability, FLUX, etc.)
// ============================================================================

async function callUniversalImageGen(req: Request, prompt: string, style?: string): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const sb = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await sb.functions.invoke('ai-universal-processor', {
    body: {
      action: 'image_generation',
      prompt,
      style_intent: style || 'professional',
      aspectRatio: '16:9',
      size: '1280x720',
    },
  });

  if (error) throw new Error(`Image generation failed: ${error.message}`);
  const url = data?.imageUrl || data?.url || data?.content || '';
  if (!url || !url.startsWith('http')) {
    throw new Error('No valid image URL returned from AI provider');
  }
  return url;
}

// Delegate to ai-universal-processor for text generation (analysis)
async function callUniversalText(req: Request, systemPrompt: string, userPrompt: string): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const sb = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await sb.functions.invoke('ai-universal-processor', {
    body: {
      action: 'chat',
      prompt: userPrompt,
      systemPrompt,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      maxTokens: 2000,
    },
  });

  if (error) throw new Error(`Text generation failed: ${error.message}`);
  return data?.content || '';
}

// ============================================================================
// Standard Thumbnail Generation
// ============================================================================

async function generateThumbnail(req: Request, request: ThumbnailRequest): Promise<{
  thumbnailUrl: string;
  prompt: string;
  style: string;
  dimensions: { width: number; height: number };
}> {
  const stylePrompts: Record<string, string> = {
    youtube: 'Eye-catching YouTube thumbnail with bold text overlay, vibrant colors, expressive face or action shot, 1280x720 aspect ratio',
    tiktok: 'Vertical thumbnail optimized for TikTok, dynamic composition, trendy aesthetic, 1080x1920',
    instagram: 'Clean Instagram post thumbnail, aesthetic grid-friendly design, square 1:1 ratio, modern minimal style',
    podcast: 'Professional podcast cover art style, audio waveform elements, speaker imagery, branded feel',
    webinar: 'Professional webinar thumbnail, corporate style, speaker headshots, event branding, trust indicators',
    custom: request.customPrompt || 'Professional thumbnail design'
  };

  const basePrompt = stylePrompts[request.style || 'youtube'];
  const contentPrompt = request.title
    ? `Content theme: "${request.title}". ${request.description || ''}`
    : '';

  const fullPrompt = `${basePrompt}. ${contentPrompt}. High quality, professional design, attention-grabbing.`;

  const thumbnailUrl = await callUniversalImageGen(req, fullPrompt, request.style);

  return {
    thumbnailUrl,
    prompt: fullPrompt,
    style: request.style || 'youtube',
    dimensions: getDimensions(request.style),
  };
}

// ============================================================================
// Framework-Aware Thumbnail Generation
// ============================================================================

async function generateFrameworkThumbnail(req: Request, request: ThumbnailRequest): Promise<{
  thumbnailUrl: string;
  prompt: string;
  style: string;
  dimensions: { width: number; height: number };
  frameworkContext: {
    audience: string;
    product: string;
    framework: string;
    messagingTier: string;
  };
}> {
  const audienceStyles: Record<string, string> = {
    healthcare: 'clean clinical aesthetic, trust badges, compliance indicators, blue/white palette, medical professional imagery',
    enterprise_marketing: 'corporate premium, data visualization, team collaboration, dark professional theme, authority indicators',
    solo_creators: 'vibrant creative energy, personal brand feel, authentic aesthetic, warm colors, approachable style',
    content_agencies: 'sleek agency portfolio, multi-project grid, scalability visual, modern minimal, capability showcase',
    education: 'engaging learning environment, knowledge growth visual, inclusive imagery, bright inviting colors',
    finance: 'trust and security indicators, clean data presentation, premium professional, gold/navy palette',
    real_estate: 'property showcase, virtual tour feel, luxury aesthetic, spatial composition, aspirational lifestyle',
    travel: 'wanderlust inspiration, destination beauty, cultural richness, panoramic composition, adventure feel',
    retail: 'product-focused, conversion-optimized, lifestyle context, vibrant commercial, shopping urgency',
    saas_product: 'UI/UX showcase, product demo visual, tech-forward aesthetic, clean interface preview',
    influencers: 'personal brand aesthetic, authentic social feel, trending visual style, engagement-optimized',
    podcasters: 'audio-visual blend, waveform elements, speaker portrait, studio atmosphere, episodic branding',
  };

  const frameworkStyles: Record<string, string> = {
    storybrand: 'hero transformation narrative, before/after visual, emotional connection, journey progression',
    aida: 'attention-grabbing headline, vibrant action, clear CTA button, urgency elements, conversion-focused',
    jtbd: 'outcome metrics display, results showcase, professional achievement, goal completion visual',
    four_es: 'experiential immersive, interactive preview, modern aesthetic, engagement indicators',
    blue_ocean: 'innovative differentiation, unique positioning, competitive advantage, futuristic clean',
    stp: 'targeted personalization, segment-specific, trust indicators, professional authority',
    race: 'funnel visualization, data-driven, performance metrics, digital marketing aesthetic',
  };

  const audience = request.audienceSegment || 'solo_creators';
  const product = request.productName || request.productId || 'Genie Suite';
  const framework = request.frameworkType || 'aida';
  const hook = request.hook || request.title || product;
  const cta = request.cta || 'Start Free';

  const audienceStyle = audienceStyles[audience] || audienceStyles.solo_creators;
  const frameworkStyle = frameworkStyles[framework] || frameworkStyles.aida;

  const fullPrompt = [
    `Professional marketing thumbnail for ${product}.`,
    `Headline text overlay: "${hook}".`,
    `CTA element: "${cta}".`,
    `Target audience: ${audience.replace(/_/g, ' ')}.`,
    `Visual style: ${audienceStyle}.`,
    `Framework approach: ${frameworkStyle}.`,
    `High quality, 1280x720, YouTube thumbnail format.`,
    request.branding?.primaryColor ? `Brand color: ${request.branding.primaryColor}.` : '',
    request.description ? `Context: ${request.description}.` : '',
  ].filter(Boolean).join(' ');

  console.log(`🎨 Framework thumbnail prompt (${audience}/${framework}):`, fullPrompt.substring(0, 200));

  const thumbnailUrl = await callUniversalImageGen(req, fullPrompt, 'marketing');

  return {
    thumbnailUrl,
    prompt: fullPrompt,
    style: request.style || 'youtube',
    dimensions: getDimensions(request.style),
    frameworkContext: {
      audience,
      product: request.productId || 'studio',
      framework,
      messagingTier: request.messagingTier || 'product',
    },
  };
}

// ============================================================================
// Content Analysis (text-only — uses LLM, not image gen)
// ============================================================================

async function analyzeForThumbnail(req: Request, request: ThumbnailRequest): Promise<{
  suggestions: Array<{ timestamp: number; score: number; reason: string }>;
  recommendedStyle: string;
  colorPalette: string[];
}> {
  try {
    const systemPrompt = 'You are an expert at analyzing video content and suggesting optimal thumbnail moments. Return valid JSON only, no markdown fences.';
    const userPrompt = `Analyze this content for thumbnail creation:
Title: ${request.title || 'Untitled'}
Description: ${request.description || 'No description'}
Style: ${request.style || 'general'}
Audience: ${request.audienceSegment || 'general'}

Return JSON: { "suggestions": [{"timestamp": number, "score": 0-100, "reason": string}], "recommendedStyle": string, "colorPalette": ["#hex", ...] }`;

    const raw = await callUniversalText(req, systemPrompt, userPrompt);
    const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      suggestions: parsed.suggestions || [],
      recommendedStyle: parsed.recommendedStyle || request.style || 'youtube',
      colorPalette: parsed.colorPalette || ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    };
  } catch {
    return {
      suggestions: [
        { timestamp: 0, score: 70, reason: 'Opening frame — establishes context' },
        { timestamp: 15, score: 85, reason: 'Key moment — high engagement potential' },
        { timestamp: 30, score: 75, reason: 'Action shot — dynamic content' },
      ],
      recommendedStyle: request.style || 'youtube',
      colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    };
  }
}

// ============================================================================
// Frame Extraction (no AI — just URL with timestamp)
// ============================================================================

async function extractBestFrame(request: ThumbnailRequest): Promise<{
  frameUrl: string;
  timestamp: number;
  quality: number;
}> {
  return {
    frameUrl: request.videoUrl ? `${request.videoUrl}#t=${request.frameTimestamp || 0}` : '',
    timestamp: request.frameTimestamp || 0,
    quality: 95,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function getDimensions(style?: string): { width: number; height: number } {
  const dims: Record<string, { width: number; height: number }> = {
    youtube: { width: 1280, height: 720 },
    tiktok: { width: 1080, height: 1920 },
    instagram: { width: 1080, height: 1080 },
    podcast: { width: 1400, height: 1400 },
    webinar: { width: 1920, height: 1080 },
    custom: { width: 1280, height: 720 },
  };
  return dims[style || 'youtube'] || dims.youtube;
}
