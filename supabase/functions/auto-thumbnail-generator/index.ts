import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  // Framework-aware generation fields
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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`🖼️ Thumbnail Request:`, {
      action: request.action,
      style: request.style,
      hasVideo: !!request.videoUrl,
      title: request.title?.substring(0, 50),
      audience: request.audienceSegment,
      product: request.productId,
      framework: request.frameworkType,
    });

    const apiKey = GEMINI_API_KEY || LOVABLE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'No AI API key configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (request.action) {
      case 'generate':
        result = await generateThumbnail(apiKey, request);
        break;

      case 'framework_generate':
        result = await generateFrameworkThumbnail(apiKey, request);
        break;

      case 'analyze':
        result = await analyzeForThumbnail(apiKey, request);
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
// Standard Thumbnail Generation
// ============================================================================

async function generateThumbnail(apiKey: string, request: ThumbnailRequest): Promise<{
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

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image',
      messages: [{ role: 'user', content: fullPrompt }],
      modalities: ['image', 'text'],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI generation error: ${error}`);
  }

  const data = await response.json();
  const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url 
    || data.choices?.[0]?.message?.content;

  const dimensions = getDimensions(request.style);

  return {
    thumbnailUrl: imageData || `generated_thumbnail_${Date.now()}.png`,
    prompt: fullPrompt,
    style: request.style || 'youtube',
    dimensions,
  };
}

// ============================================================================
// Framework-Aware Thumbnail Generation (NEW)
// ============================================================================

async function generateFrameworkThumbnail(apiKey: string, request: ThumbnailRequest): Promise<{
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
  // Build framework-aware prompt
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
  const product = request.productName || request.productId || 'Genie Studio';
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

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image',
      messages: [{ role: 'user', content: fullPrompt }],
      modalities: ['image', 'text'],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Framework thumbnail generation error: ${error}`);
  }

  const data = await response.json();
  const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url 
    || data.choices?.[0]?.message?.content;

  const dimensions = getDimensions(request.style);

  return {
    thumbnailUrl: imageData || `framework_thumbnail_${Date.now()}.png`,
    prompt: fullPrompt,
    style: request.style || 'youtube',
    dimensions,
    frameworkContext: {
      audience,
      product: request.productId || 'studio',
      framework,
      messagingTier: request.messagingTier || 'product',
    },
  };
}

// ============================================================================
// Content Analysis
// ============================================================================

async function analyzeForThumbnail(apiKey: string, request: ThumbnailRequest): Promise<{
  suggestions: Array<{ timestamp: number; score: number; reason: string }>;
  recommendedStyle: string;
  colorPalette: string[];
}> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing video content and suggesting optimal thumbnail moments. Return JSON with timestamp suggestions, scores, and style recommendations.'
        },
        {
          role: 'user',
          content: `Analyze this content for thumbnail creation:
Title: ${request.title || 'Untitled'}
Description: ${request.description || 'No description'}
Style: ${request.style || 'general'}
Audience: ${request.audienceSegment || 'general'}

Provide thumbnail suggestions in JSON format with: suggestions (array with timestamp, score 0-100, reason), recommendedStyle, colorPalette (array of hex colors).`
        }
      ]
    }),
  });

  if (!response.ok) {
    return {
      suggestions: [
        { timestamp: 0, score: 70, reason: 'Opening frame - establishes context' },
        { timestamp: 15, score: 85, reason: 'Key moment - high engagement potential' },
        { timestamp: 30, score: 75, reason: 'Action shot - dynamic content' }
      ],
      recommendedStyle: request.style || 'youtube',
      colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content);
    return {
      suggestions: parsed.suggestions || [],
      recommendedStyle: parsed.recommendedStyle || request.style || 'youtube',
      colorPalette: parsed.colorPalette || ['#FF6B6B', '#4ECDC4', '#45B7D1']
    };
  } catch {
    return {
      suggestions: [
        { timestamp: 0, score: 70, reason: 'Opening frame' },
        { timestamp: 15, score: 85, reason: 'Key moment' }
      ],
      recommendedStyle: request.style || 'youtube',
      colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1']
    };
  }
}

// ============================================================================
// Frame Extraction
// ============================================================================

async function extractBestFrame(request: ThumbnailRequest): Promise<{
  frameUrl: string;
  timestamp: number;
  quality: number;
}> {
  return {
    frameUrl: request.videoUrl ? `${request.videoUrl}#t=${request.frameTimestamp || 0}` : '',
    timestamp: request.frameTimestamp || 0,
    quality: 95
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
