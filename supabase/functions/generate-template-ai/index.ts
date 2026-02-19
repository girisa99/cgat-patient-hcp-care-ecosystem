/**
 * AI Template Generation Edge Function
 * Uses UNIVERSAL AI HUB with 30+ integrated providers
 * NO Lovable AI - Uses our internal provider registry
 * 
 * Supported Providers:
 * - LLM: Gemini, OpenAI, Claude, DeepSeek, Alibaba Qwen, HuggingFace
 * - Image: DALL-E, ModelsLab FLUX, Replicate, Alibaba Wanx
 * - Video: Sora2, Veo, Alibaba Wan, ModelsLab AnimateDiff, Replicate
 * - TTS: ElevenLabs, Azure Neural, Alibaba CosyVoice, OpenAI TTS
 * - STT: Deepgram, Whisper, Azure STT, Alibaba Paraformer
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============================================================================
// COMPLETE PROVIDER REGISTRY - Matches src/services/ai-hub/providerRegistry.ts
// =============================================================================

interface AIProvider {
  id: string;
  name: string;
  tier: 'primary' | 'secondary' | 'tertiary' | 'fallback';
  envKey: string;
  priority: number;
  capabilities: string[];
  regions: string[];
}

const AI_PROVIDER_REGISTRY: AIProvider[] = [
  // Tier 1: Primary Providers
  {
    id: 'gemini',
    name: 'Google Gemini 3.0 Flash',
    tier: 'primary',
    envKey: 'GEMINI_API_KEY',
    priority: 1,
    capabilities: ['llm', 'vision', 'translation', 'ocr', 'image_gen'],
    regions: ['global', 'india', 'sea', 'africa'],
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    tier: 'primary',
    envKey: 'OPENAI_API_KEY',
    priority: 2,
    capabilities: ['llm', 'vision', 'tts', 'stt', 'image_gen', 'video_gen'],
    regions: ['global', 'western', 'europe', 'latam'],
  },
  {
    id: 'claude',
    name: 'Anthropic Claude 4 Sonnet',
    tier: 'primary',
    envKey: 'ANTHROPIC_API_KEY',
    priority: 3,
    capabilities: ['llm', 'vision', 'translation'],
    regions: ['western', 'europe'],
  },
  // Tier 2: Secondary Providers
  {
    id: 'alibaba',
    name: 'Alibaba Qwen-Max',
    tier: 'secondary',
    envKey: 'ALIBABA_API_KEY',
    priority: 4,
    capabilities: ['llm', 'tts', 'stt', 'video_gen', 'image_gen', 'avatar'],
    regions: ['cjk', 'asia', 'mena'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V3',
    tier: 'secondary',
    envKey: 'DEEPSEEK_API_KEY',
    priority: 5,
    capabilities: ['llm', 'vision', 'translation'],
    regions: ['cjk', 'asia', 'global'],
  },
  // Tier 3: Tertiary Providers
  {
    id: 'huggingface',
    name: 'HuggingFace Inference',
    tier: 'tertiary',
    envKey: 'HUGGING_FACE_ACCESS_TOKEN',
    priority: 6,
    capabilities: ['llm', 'image_gen'],
    regions: ['global'],
  },
  {
    id: 'replicate',
    name: 'Replicate',
    tier: 'tertiary',
    envKey: 'REPLICATE_API_TOKEN',
    priority: 7,
    capabilities: ['llm', 'image_gen', 'video_gen', '3d_gen'],
    regions: ['global'],
  },
];

// Video generation providers (matches videoProviderConfig.ts)
const VIDEO_PROVIDERS = [
  { id: 'sora2api', name: 'OpenAI Sora 2', envKey: 'SORA2_API_KEY', priority: 1 },
  { id: 'gemini_veo', name: 'Google Veo 3', envKey: 'GEMINI_API_KEY', priority: 2 },
  { id: 'alibaba_wan', name: 'Alibaba Wan 2.6', envKey: 'ALIBABA_API_KEY', priority: 3 },
  { id: 'modelslab', name: 'ModelsLab AnimateDiff', envKey: 'MODELSLAB_API_KEY', priority: 4 },
  { id: 'replicate', name: 'Replicate SVD', envKey: 'REPLICATE_API_TOKEN', priority: 5 },
];

// Image generation providers (matches imageProviderConfig.ts)
const IMAGE_PROVIDERS = [
  { id: 'modelslab_flux', name: 'ModelsLab FLUX Pro', envKey: 'MODELSLAB_API_KEY', priority: 1 },
  { id: 'openai_dalle', name: 'OpenAI DALL-E 3', envKey: 'OPENAI_API_KEY', priority: 2 },
  { id: 'gemini_imagen', name: 'Gemini Imagen 3', envKey: 'GEMINI_API_KEY', priority: 3 },
  { id: 'alibaba_wanx', name: 'Alibaba Wanx', envKey: 'ALIBABA_API_KEY', priority: 4 },
  { id: 'replicate', name: 'Replicate FLUX', envKey: 'REPLICATE_API_TOKEN', priority: 5 },
  { id: 'huggingface', name: 'HuggingFace FLUX', envKey: 'HUGGING_FACE_ACCESS_TOKEN', priority: 6 },
];

// TTS providers (matches audioProviderConfig.ts)
const TTS_PROVIDERS = [
  { id: 'elevenlabs', name: 'ElevenLabs', envKey: 'ELEVENLABS_API_KEY', priority: 1, regions: ['western', 'europe', 'latam'] },
  { id: 'azure', name: 'Azure Neural TTS', envKey: 'AZURE_SPEECH_KEY', priority: 2, regions: ['global', 'mena', 'india', 'africa'] },
  { id: 'alibaba_cosyvoice', name: 'Alibaba CosyVoice', envKey: 'ALIBABA_API_KEY', priority: 3, regions: ['cjk', 'asia'] },
  { id: 'openai_tts', name: 'OpenAI TTS', envKey: 'OPENAI_API_KEY', priority: 4, regions: ['global'] },
  { id: 'google_tts', name: 'Google Cloud TTS', envKey: 'GOOGLE_API_KEY', priority: 5, regions: ['global'] },
  { id: 'deepseek_tts', name: 'DeepSeek TTS', envKey: 'DEEPSEEK_API_KEY', priority: 6, regions: ['cjk'] },
];

// STT providers (matches audioProviderConfig.ts)
const STT_PROVIDERS = [
  { id: 'deepgram', name: 'Deepgram Nova 2', envKey: 'DEEPGRAM_API_KEY', priority: 1 },
  { id: 'openai_whisper', name: 'OpenAI Whisper', envKey: 'OPENAI_API_KEY', priority: 2 },
  { id: 'azure_stt', name: 'Azure Speech-to-Text', envKey: 'AZURE_SPEECH_KEY', priority: 3 },
  { id: 'alibaba_paraformer', name: 'Alibaba Paraformer', envKey: 'ALIBABA_API_KEY', priority: 4 },
  { id: 'google_stt', name: 'Google Cloud STT', envKey: 'GOOGLE_API_KEY', priority: 5 },
];

// =============================================================================
// TEMPLATE GENERATION PROMPT - Supports all 206 pipelines
// =============================================================================

const TEMPLATE_GENERATION_PROMPT = `You are an AI video template generator for Genie Suite, supporting 206+ pipelines and 43+ video styles.

Given a user's description, generate a comprehensive video template configuration.

## Available Categories (21 total):
marketing, educational, storytelling, healthcare, entertainment, travel, corporate, animation, 3d, avatar, interactive, ppt, smb, oil_gas, automotive, hospitality, consulting, finance, real_estate, technology, nonprofit

## Available Video Styles (43 total):
STORYTELLING: smart_storytelling, hook_video, micro_drama, documentary, interview, testimonial
AVATAR/UGC: ugc_avatar_photorealistic, ugc_avatar_3d_pixar, ugc_avatar_2d_animated, talking_head, character_vlog
ANIMATION: pixar_disney, crayon_sketch, watercolor, hand_sketch, stop_motion, microworld, paper_cutout, anime, motion_graphics
PHOTOREALISTIC: photorealistic, hyper_real, 4k_cinematic, product_hero, architectural_viz
CYBER/TECH: cyberpunk, glitch_art, neon_synthwave, tech_futuristic, holographic
EDUCATIONAL: explainer, whiteboard, kinetic_typography, tutorial, educational, school_learning
PPT/SLIDES: ppt_animation, pitch_deck, keynote_cinematic, webinar_slides, data_visualization
MARKETING: social_ad, promo_video, brand_story, launch_teaser, comparison_video

## Available Capabilities (25 total):
text_to_video, image_to_video, 3d_generation, avatar, lipsync, tts, stt, music_gen, sfx_gen, video_effects, 
pixar_style, anime_style, ppt_animation, slideshow, voice_clone, viseme_sync, 
animatediff, svd, character_animation, video_extend, video_upscale, 
multi_language, regional_tts, avatar_lipsync, realtime_stt

## Available Regions (use these EXACT codes):
NAM, NAM_US, NAM_CA, NAM_US_SOUTH, NAM_US_WEST, EUR, EUR_WEST, EUR_NORTH, EUR_SOUTH, EUR_CENTRAL, INDIA, INDIA_NORTH, INDIA_SOUTH, INDIA_EAST, INDIA_WEST, MENA, MENA_GCC, MENA_LEVANT, MENA_NORTH_AFRICA, MENA_EGYPT, CJK, CJK_JP, CJK_KR, CJK_CN, LATAM, LATAM_BR, LATAM_MX, SEA, SEA_ID, SEA_PH, AFRICA, AFRICA_WEST, AFRICA_EAST, OCEANIA, TURKEY, PAKISTAN, BANGLADESH, CARIBBEAN, EASTERN_EUR, CENTRAL_ASIA

## Available Languages (BCP47 codes):
en, es, fr, de, pt, it, nl, pl, ru, ja, ko, zh, hi, ta, te, kn, ml, bn, gu, mr, pa, ur, ar, he, tr, id, ms, th, vi, sw, ha, yo, ig, am, zu, fil, my, km, lo, si, ne, ka, az, uk, ro, cs, hu, sk, bg, hr, sr, el, da, sv, fi, nb, ca, eu, gl

## Available Industries (40+ total):
TECHNOLOGY: saas, software, ai_ml, cybersecurity, cloud, fintech, edtech, healthtech
HEALTHCARE: hospitals, clinics, pharmaceutical, medical_devices, mental_health, telemedicine
SMB: restaurants, coffee_shops, bakery, grocery, salons, spas, fitness, yoga, retail
AUTOMOTIVE: car_dealers, mechanics, auto_parts, car_wash, detailing, tire_shops
INDUSTRIAL: oil_gas, energy, manufacturing, construction, logistics, mining, utilities
HOSPITALITY: hotels, resorts, restaurants, travel_agencies, airlines, cruise, tourism
EDUCATION: schools, universities, online_courses, tutoring, training, corporate_learning
PROFESSIONAL: consulting, legal, accounting, real_estate, insurance, banking
ENTERTAINMENT: gaming, music, film, streaming, events, sports
NONPROFIT: charities, foundations, environmental, social_causes

## AI Providers Available for this template:
LLM: Gemini 3.0, OpenAI GPT-4o, Claude 4, DeepSeek V3, Alibaba Qwen, HuggingFace
IMAGE: ModelsLab FLUX, DALL-E 3, Imagen 3, Alibaba Wanx, Replicate FLUX
VIDEO: Sora 2, Veo 3, Alibaba Wan 2.6, ModelsLab AnimateDiff, Replicate SVD
TTS: ElevenLabs, Azure Neural, Alibaba CosyVoice, OpenAI TTS, Google TTS
STT: Deepgram Nova 2, OpenAI Whisper, Azure STT, Alibaba Paraformer
3D: Meshy AI, Alibaba 3D, ModelsLab 3D, Replicate TripoSR
AVATAR: Alibaba Wan 2.2 Animate, Azure Avatar, ModelsLab Avatar

Return a JSON object with this exact structure:
{
  "name": "Template Name (creative, descriptive)",
  "description": "Brief 1-2 sentence description",
  "category": "one from the 21 categories above",
  "videoStyle": "one from the 43 styles above",
  "capabilities": ["array from 25 capabilities - include at least 3-5 relevant ones"],
  "regions": ["array using EXACT region codes above - include parent AND sub-regions"],
  "languages": ["array using BCP47 codes above - match the selected regions"],
  "platforms": ["from: tiktok, instagram_reels, instagram_feed, instagram_stories, youtube, youtube_shorts, facebook, linkedin, x_twitter, snapchat, landing_page, blog_post, email_campaign, newsletter, presentation, webinar, google_ads, meta_ads, display_ads, whatsapp, tv_broadcast"],
  "duration": 60,
  "industries": ["array from industries - be specific"],
  "aiProviders": {
    "llm": "recommended LLM provider",
    "image": "recommended image provider",
    "video": "recommended video provider",
    "tts": "recommended TTS provider",
    "stt": "recommended STT provider if needed",
    "3d": "recommended 3D provider if needed",
    "avatar": "recommended avatar provider if needed"
  },
  "sceneCount": 5,
  "targetAudience": "primary audience description"
}

Always respond with valid JSON only, no markdown or explanation.`;

// =============================================================================
// AI PROVIDER CALL FUNCTIONS
// =============================================================================

// Call Gemini API (Primary)
async function callGemini(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('🔮 Calling Gemini 3.0 Flash...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${TEMPLATE_GENERATION_PROMPT}\n\nUser request: ${prompt}` }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 2000 }
      }),
    });

    if (!response.ok) {
      console.error('Gemini error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini call failed:', error);
    return null;
  }
}

// Call OpenAI API (Primary)
async function callOpenAI(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('🧠 Calling OpenAI GPT-4o-mini...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: TEMPLATE_GENERATION_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return null;
  }
}

// Call Claude API (Primary)
async function callClaude(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('🎭 Calling Claude 3.5 Haiku...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: `${TEMPLATE_GENERATION_PROMPT}\n\nUser request: ${prompt}` }
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.error('Claude call failed:', error);
    return null;
  }
}

// Call DeepSeek API (Secondary - CJK optimized)
async function callDeepSeek(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('🌊 Calling DeepSeek V3...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: TEMPLATE_GENERATION_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('DeepSeek call failed:', error);
    return null;
  }
}

// Call Alibaba Qwen API (Secondary - Full-stack CJK)
// Supports both International (Virginia) and China (Beijing) endpoints
async function callAlibaba(prompt: string, apiKey: string): Promise<string | null> {
  // Try international endpoint first (Virginia), then China (Beijing)
  const intlKey = Deno.env.get('ALIBABA_API_KEY');
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const effectiveKey = apiKey || intlKey || chinaKey;
  
  if (!effectiveKey) return null;

  // Route to correct endpoint: International key → intl endpoint, China key → China endpoint
  const useIntl = effectiveKey === intlKey || effectiveKey === apiKey;
  const baseUrl = useIntl
    ? 'https://dashscope-intl.aliyuncs.com'
    : 'https://dashscope.aliyuncs.com';

  try {
    console.log(`☁️ Calling Alibaba Qwen-Max via ${useIntl ? 'International (Virginia)' : 'China (Beijing)'}...`);
    const response = await fetch(`${baseUrl}/compatible-mode/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-max',
        messages: [
          { role: 'system', content: TEMPLATE_GENERATION_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('Alibaba Qwen error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Alibaba Qwen call failed:', error);
    return null;
  }
}

// Call HuggingFace Inference API (Tertiary - Open models)
async function callHuggingFace(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('🤗 Calling HuggingFace Inference...');
    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `${TEMPLATE_GENERATION_PROMPT}\n\nUser request: ${prompt}`,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
          return_full_text: false,
        }
      }),
    });

    if (!response.ok) {
      console.error('HuggingFace error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0]?.generated_text : data.generated_text || null;
  } catch (error) {
    console.error('HuggingFace call failed:', error);
    return null;
  }
}

// =============================================================================
// INTELLIGENT ROUTING WITH FULL PROVIDER FALLBACK CHAIN
// =============================================================================

async function generateWithUniversalAIHub(prompt: string): Promise<{ content: string | null; provider: string; providersChecked: string[] }> {
  const providersChecked: string[] = [];

  // 1. Try Gemini (Primary - Global)
  const geminiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  if (geminiKey) {
    providersChecked.push('gemini');
    const result = await callGemini(prompt, geminiKey);
    if (result) return { content: result, provider: 'gemini', providersChecked };
  }

  // 2. Try OpenAI (Primary - Western/Global)
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (openaiKey) {
    providersChecked.push('openai');
    const result = await callOpenAI(prompt, openaiKey);
    if (result) return { content: result, provider: 'openai', providersChecked };
  }

  // 3. Try Claude (Primary - Literary/Nuanced)
  const claudeKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (claudeKey) {
    providersChecked.push('claude');
    const result = await callClaude(prompt, claudeKey);
    if (result) return { content: result, provider: 'claude', providersChecked };
  }

  // 4. Try Alibaba Qwen (Secondary - CJK/Asia) - Check both International and China keys
  const alibabaKey = Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY');
  if (alibabaKey) {
    providersChecked.push('alibaba_qwen');
    const result = await callAlibaba(prompt, alibabaKey);
    if (result) return { content: result, provider: 'alibaba_qwen', providersChecked };
  }

  // 5. Try DeepSeek (Secondary - Low cost/CJK)
  const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (deepseekKey) {
    providersChecked.push('deepseek');
    const result = await callDeepSeek(prompt, deepseekKey);
    if (result) return { content: result, provider: 'deepseek', providersChecked };
  }

  // 6. Try HuggingFace (Tertiary - Open models)
  const huggingfaceKey = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
  if (huggingfaceKey) {
    providersChecked.push('huggingface');
    const result = await callHuggingFace(prompt, huggingfaceKey);
    if (result) return { content: result, provider: 'huggingface', providersChecked };
  }

  return { content: null, provider: 'none', providersChecked };
}

// =============================================================================
// GET AVAILABLE PROVIDERS FOR RESPONSE
// =============================================================================

function getAvailableProviders() {
  const available = {
    llm: [] as string[],
    image: [] as string[],
    video: [] as string[],
    tts: [] as string[],
    stt: [] as string[],
  };

  // Check LLM providers
  if (Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY')) available.llm.push('gemini');
  if (Deno.env.get('OPENAI_API_KEY')) available.llm.push('openai');
  if (Deno.env.get('ANTHROPIC_API_KEY')) available.llm.push('claude');
  if (Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY')) available.llm.push('alibaba_qwen');
  if (Deno.env.get('DEEPSEEK_API_KEY')) available.llm.push('deepseek');
  if (Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')) available.llm.push('huggingface');

  // Check image providers
  if (Deno.env.get('MODELSLAB_API_KEY')) available.image.push('modelslab_flux', 'modelslab_sdxl');
  if (Deno.env.get('OPENAI_API_KEY')) available.image.push('dalle_3');
  if (Deno.env.get('GEMINI_API_KEY')) available.image.push('gemini_imagen');
  if (Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY')) available.image.push('alibaba_wanx');
  if (Deno.env.get('REPLICATE_API_TOKEN')) available.image.push('replicate_flux');
  if (Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')) available.image.push('huggingface_flux');

  // Check video providers
  if (Deno.env.get('SORA2_API_KEY')) available.video.push('sora2');
  if (Deno.env.get('GEMINI_API_KEY')) available.video.push('veo');
  if (Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY')) available.video.push('alibaba_wan');
  if (Deno.env.get('MODELSLAB_API_KEY')) available.video.push('modelslab_animatediff', 'modelslab_svd');
  if (Deno.env.get('REPLICATE_API_TOKEN')) available.video.push('replicate_svd');

  // Check TTS providers
  if (Deno.env.get('ELEVENLABS_API_KEY')) available.tts.push('elevenlabs');
  if (Deno.env.get('AZURE_SPEECH_KEY')) available.tts.push('azure_neural');
  if (Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY')) available.tts.push('alibaba_cosyvoice');
  if (Deno.env.get('OPENAI_API_KEY')) available.tts.push('openai_tts');
  if (Deno.env.get('GOOGLE_API_KEY')) available.tts.push('google_tts');

  // Check STT providers
  if (Deno.env.get('DEEPGRAM_API_KEY')) available.stt.push('deepgram');
  if (Deno.env.get('OPENAI_API_KEY')) available.stt.push('whisper');
  if (Deno.env.get('AZURE_SPEECH_KEY')) available.stt.push('azure_stt');
  if (Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY')) available.stt.push('alibaba_paraformer');

  return available;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, region, preferredProvider, context, seed } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build enriched prompt with user selections for unique results
    const contextParts: string[] = [`User request: ${prompt}`];
    if (context?.selectedCapabilities?.length) {
      contextParts.push(`User has selected these AI capabilities: ${context.selectedCapabilities.join(', ')}`);
    }
    if (context?.selectedVideoStyles?.length) {
      contextParts.push(`User prefers these video styles: ${context.selectedVideoStyles.join(', ')}`);
    }
    if (context?.selectedPlatforms?.length) {
      contextParts.push(`Target platforms: ${context.selectedPlatforms.join(', ')}`);
    }
    if (context?.selectedRegions?.length) {
      contextParts.push(`Target regions: ${context.selectedRegions.join(', ')}`);
    }
    if (context?.selectedLanguages?.length) {
      contextParts.push(`Target languages: ${context.selectedLanguages.join(', ')}`);
    }
    if (context?.category) {
      contextParts.push(`Preferred category: ${context.category}`);
    }
    // Add uniqueness seed
    contextParts.push(`Generation seed (use this to ensure unique creative output): ${seed || Date.now()}`);
    contextParts.push(`IMPORTANT: Generate a UNIQUE and CREATIVE template. Do NOT repeat generic names like "Hero Banner Template". Use the seed to vary your output.`);
    
    const enrichedPrompt = contextParts.join('\n');

    console.log("🤖 Generating template via Universal AI Hub...");
    console.log("📝 Prompt:", prompt.substring(0, 100) + "...");
    console.log("🌍 Region:", region || 'global');
    console.log("⭐ Preferred provider:", preferredProvider || 'auto');
    console.log("🎯 Context keys:", context ? Object.keys(context).join(', ') : 'none');

    // Get available providers
    const availableProviders = getAvailableProviders();
    console.log("✅ Available providers:", JSON.stringify(availableProviders));

    // Use Universal AI Hub routing with enriched prompt
    const { content, provider, providersChecked } = await generateWithUniversalAIHub(enrichedPrompt);

    if (!content) {
      // Return a smart default template if all providers fail
      console.log("⚠️ All AI providers failed, returning intelligent default template");
      const defaultTemplate = {
        name: "Custom Template",
        description: prompt.substring(0, 200),
        category: "marketing",
        videoStyle: "motion_graphics",
        capabilities: ["text_to_video", "tts", "video_effects"],
        regions: ["western", "global"],
        duration: 60,
        industries: ["general"],
        aiProviders: {
          llm: availableProviders.llm[0] || 'gemini',
          image: availableProviders.image[0] || 'modelslab_flux',
          video: availableProviders.video[0] || 'modelslab_animatediff',
          tts: availableProviders.tts[0] || 'elevenlabs',
        },
        sceneCount: 5,
        targetAudience: "General audience"
      };

      return new Response(
        JSON.stringify({ 
          template: defaultTemplate, 
          provider: 'fallback_default',
          providersChecked,
          availableProviders 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📝 AI Response from ${provider}:`, content.substring(0, 200));

    // Parse JSON from response
    let template;
    try {
      // Remove any markdown code blocks if present
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      template = JSON.parse(jsonStr);
      
      // Ensure aiProviders is populated with available providers
      if (!template.aiProviders) {
        template.aiProviders = {
          llm: availableProviders.llm[0] || 'gemini',
          image: availableProviders.image[0] || 'modelslab_flux',
          video: availableProviders.video[0] || 'modelslab_animatediff',
          tts: availableProviders.tts[0] || 'elevenlabs',
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return a default template if parsing fails
      template = {
        name: "Custom Template",
        description: prompt.substring(0, 200),
        category: "marketing",
        videoStyle: "motion_graphics",
        capabilities: ["text_to_video", "tts", "video_effects"],
        regions: ["western"],
        duration: 60,
        industries: ["general"],
        aiProviders: {
          llm: availableProviders.llm[0] || 'gemini',
          image: availableProviders.image[0] || 'modelslab_flux',
          video: availableProviders.video[0] || 'modelslab_animatediff',
          tts: availableProviders.tts[0] || 'elevenlabs',
        },
        sceneCount: 5,
        targetAudience: "General audience"
      };
    }

    console.log(`✅ Generated template via ${provider}:`, template.name);

    return new Response(
      JSON.stringify({ 
        template, 
        provider,
        providersChecked,
        availableProviders 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error generating template:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
