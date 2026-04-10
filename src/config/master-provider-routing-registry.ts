/**
 * MASTER PROVIDER ROUTING REGISTRY
 * 
 * Single source of truth for ALL media capability routing across the Genie ecosystem.
 * This file is IMMUTABLE and should be the canonical reference for provider selection.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * INTEGRATED PROVIDER REGISTRY (17-18 Core Providers)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * VIDEO GENERATION:
 *   - Vertex Veo 3.0/3.1 (PRIMARY - text-to-video, image-to-video)
 *   - Sora 2.0 (SECONDARY - high-quality creative)
 *   - Alibaba Wan 2.6/2.2 (CJK/Avatar/Motion Control)
 *   - ModelsLab (AnimateDiff, SDXL, transitions, effects)
 *   - Replicate (fallback chain)
 *   - DeepSeek (CJK technical content optimization)
 * 
 * IMAGE GENERATION:
 *   - Gemini 3 Pro (PRIMARY - text-to-image)
 *   - Vertex Imagen 3.0 (SECONDARY - image editing)
 *   - Banana Nano / Gemini 2.5 Flash (TERTIARY - fast thumbnails)
 *   - ModelsLab FLUX/SDXL (fallback)
 *   - Stability AI SDXL (fallback via ModelsLab)
 *   - OpenAI DALL-E (LAST RESORT ONLY)
 * 
 * LLM (Large Language Models):
 *   - Claude 3.5 Sonnet (Claude Zone - Western/EU)
 *   - Alibaba Qwen Max (Alibaba Zone - CJK/MENA)
 *   - Google Gemini Pro (Gemini Zone - India/SEA/Africa)
 *   - OpenAI GPT-4o (Fallback for all zones)
 *   - DeepSeek V3 (CJK technical, cost-effective)
 *   - Mistral (EU technical)
 *   - Cohere (enterprise embeddings)
 *   - Groq (ultra-fast inference)
 * 
 * TTS (Text-to-Speech):
 *   - Azure Neural (PRIMARY - Western, MENA/RTL, South Asia, Africa - VISEME SUPPORT)
 *   - Alibaba Qwen3-TTS (PRIMARY - CJK, SECONDARY - global fallback)
 *   - Google TTS (TERTIARY - fallback)
 *   - ElevenLabs (Premium voice cloning ONLY, NOT production primary)
 *   - OpenAI TTS (last resort)
 *   - Amazon Polly (enterprise fallback)
 * 
 * STT (Speech-to-Text):
 *   - Deepgram Nova 2 (PRIMARY - <100ms real-time)
 *   - Alibaba Paraformer (CJK primary)
 *   - Azure STT (fallback)
 *   - OpenAI Whisper (universal fallback)
 * 
 * AVATAR/3D:
 *   - Alibaba Wan 2.2 S2V (talking head, lip-sync, dubbing)
 *   - Alibaba OmniAvatar (full-body)
 *   - Alibaba TaoAvatar (AR, 90 FPS)
 *   - Alibaba MACH (photo-to-avatar)
 *   - Alibaba RichDreamer (image-to-3D)
 *   - Meshy AI (text-to-3D, image-to-3D, VR scenes, textures)
 *   - ModelsLab 3D (fallback)
 * 
 * AUDIO:
 *   - Alibaba Qwen3-TTS v2 (voice cloning)
 *   - ElevenLabs (SFX, premium clone)
 *   - Alibaba FunAudio (music generation)
 *   - Deepgram Enhance (noise removal)
 * 
 * TRANSLATION:
 *   - DeepL (European languages)
 *   - Alibaba Qwen-MT (CJK)
 *   - Azure Translator (MENA/RTL)
 *   - Google Translate (Gemini zone)
 *   - AWS Translate (enterprise fallback)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * TTS ROUTING PHILOSOPHY (DIFFERENTIATOR-FIRST):
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * WHY AZURE NEURAL PRIMARY FOR MENA/RTL (Not Alibaba)?
 * - Azure Neural provides superior VISEME DATA for lip-sync animations
 * - 7 Arabic dialects supported: ar-SA, ar-AE, ar-EG, ar-MA, ar-JO, ar-IQ, ar-LB
 * - RTL text rendering integration
 * - Alibaba Qwen3-TTS is SECONDARY for Arabic (better for CJK)
 * 
 * WHY ALIBABA QWEN3-TTS PRIMARY FOR CJK?
 * - Native dialect handling (keigo for Japanese, tones for Chinese)
 * - Better number/date formatting for Asian scripts
 * - Qwen3-TTS supports voice cloning for CJK
 * 
 * WHY ELEVENLABS IS TERTIARY (NOT PRIMARY)?
 * - Premium tier only (cost)
 * - Best for voice cloning, NOT production TTS
 * - Azure Neural provides equivalent quality + Visemes
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * @version 2.1.0
 * @lastUpdated 2026-02-04
 */

// ============================================
// INTEGRATED PROVIDER REGISTRY (19 Core Providers)
// ============================================
export const INTEGRATED_PROVIDERS = {
  // Video Generation (AI-based content creation)
  video_generation: ['vertex_veo3', 'sora2', 'alibaba_wan26', 'alibaba_wan22', 'modelslab', 'replicate', 'deepseek'],
  
  // Video Assembly/Stitching (Composition layer - NOT AI generation)
  video_assembly: ['runpod_ffmpeg', 'cloud_run_gpu'],
  
  // Image Generation
  image: ['gemini_3_pro', 'vertex_imagen3', 'banana_nano', 'modelslab_flux', 'modelslab_sdxl', 'stability_sdxl', 'openai_dalle'],
  
  // LLM
  llm: ['claude_35_sonnet', 'alibaba_qwen_max', 'google_gemini_pro', 'openai_gpt4o', 'deepseek_v3', 'mistral', 'cohere', 'groq'],
  
  // TTS
  tts: ['azure_neural', 'alibaba_qwen3_tts', 'google_tts', 'elevenlabs', 'openai_tts', 'amazon_polly'],
  
  // STT
  stt: ['deepgram_nova2', 'alibaba_paraformer', 'azure_stt', 'openai_whisper'],
  
  // Avatar
  avatar: ['alibaba_wan22', 'alibaba_omniavatar', 'alibaba_taoavatar', 'alibaba_mach', 'meshy', 'modelslab_3d'],
  
  // 3D/VR/AR Generation
  threed_vr_ar: ['meshy', 'alibaba_richdreamer', 'alibaba_mach', 'alibaba_taoavatar', 'modelslab_3d', 'replicate_3d'],
  
  // Audio
  audio: ['alibaba_qwen3_tts', 'elevenlabs', 'alibaba_funaudio', 'deepgram'],
  
  // Translation
  translation: ['deepl', 'alibaba_qwen_mt', 'azure_translator', 'google_translate', 'aws_translate'],
} as const;

// Total unique providers count (including RunPod FFmpeg)
export const TOTAL_PROVIDER_COUNT = 19;

// ============================================
// VIDEO ASSEMBLY ROUTING (Composition Layer)
// ============================================
/**
 * RunPod FFmpeg is the video ASSEMBLY provider (stitching TTS + visuals)
 * NOT a video GENERATION provider (AI content creation)
 *
 * Primary: RunPod Serverless FFmpeg worker (current)
 * Fallback: Cloud Run GPU infrastructure (future cost reduction)
 */
export const VIDEO_ASSEMBLY_ROUTING = {
  timeline_stitching: {
    primary: 'runpod-ffmpeg',
    fallback: 'cloud_run_gpu',
    features: ['tts_audio_sync', 'screenshot_composition', 'transition_effects', 'multi_language_output'],
  },
  constraints: {
    requires_public_urls: true,
    max_render_time_minutes: 10,
    async_polling_required: true,
  },
} as const;

// ============================================
// REGIONAL ZONES (4-Zone Architecture)
// ============================================
export type RegionalZone = 
  | 'claude_zone'    // US, UK, EU, Brazil, Israel, South Africa
  | 'alibaba_zone'   // Japan, Korea, China, HK, Taiwan, MEA (Arabic)
  | 'gemini_zone'    // India, Pakistan, SEA, Africa
  | 'fallback_zone'; // Global fallback

export const ZONE_COUNTRIES: Record<RegionalZone, string[]> = {
  claude_zone: ['US', 'UK', 'CA', 'AU', 'NZ', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BR', 'IL', 'ZA', 'IE', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'CZ', 'RO', 'HU', 'GR', 'MX', 'AR', 'CL', 'CO', 'PE'],
  alibaba_zone: ['CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MO', 'SA', 'AE', 'EG', 'MA', 'JO', 'IQ', 'KW', 'QA', 'BH', 'OM', 'LB', 'SY', 'TR', 'TN', 'DZ', 'LY', 'PS', 'YE'],
  gemini_zone: ['IN', 'PK', 'BD', 'ID', 'VN', 'TH', 'PH', 'MY', 'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'RW', 'MM', 'KH', 'LA', 'NP', 'LK', 'MV', 'BT', 'SN', 'CM', 'CI', 'MZ', 'ZM', 'ZW', 'JM', 'TT', 'BB', 'BZ'],
  fallback_zone: ['*'],
};

// ============================================
// LANGUAGE CODES & ROUTING
// ============================================
export const LANGUAGE_TO_ZONE: Record<string, RegionalZone> = {
  // Claude Zone
  en: 'claude_zone', es: 'claude_zone', fr: 'claude_zone', de: 'claude_zone',
  it: 'claude_zone', pt: 'claude_zone', nl: 'claude_zone', pl: 'claude_zone',
  
  // Alibaba Zone (CJK + Arabic/MENA)
  zh: 'alibaba_zone', 'zh-CN': 'alibaba_zone', 'zh-TW': 'alibaba_zone',
  ja: 'alibaba_zone', ko: 'alibaba_zone',
  ar: 'alibaba_zone', 'ar-SA': 'alibaba_zone', 'ar-AE': 'alibaba_zone',
  'ar-EG': 'alibaba_zone', 'ar-MA': 'alibaba_zone', 'ar-JO': 'alibaba_zone',
  'ar-IQ': 'alibaba_zone', 'ar-LB': 'alibaba_zone', he: 'alibaba_zone',
  
  // Gemini Zone
  hi: 'gemini_zone', 'hi-IN': 'gemini_zone', bn: 'gemini_zone', ur: 'gemini_zone',
  ta: 'gemini_zone', te: 'gemini_zone', mr: 'gemini_zone', gu: 'gemini_zone',
  id: 'gemini_zone', ms: 'gemini_zone', vi: 'gemini_zone', th: 'gemini_zone',
  sw: 'gemini_zone', yo: 'gemini_zone', am: 'gemini_zone', ha: 'gemini_zone',
};

// ============================================
// ARABIC DIALECT SUPPORT (7 Dialects)
// ============================================
export const ARABIC_DIALECTS = {
  'ar-SA': { name: 'Gulf Arabic (Saudi)', provider: 'azure_neural', quality: 5 },
  'ar-AE': { name: 'Gulf Arabic (UAE)', provider: 'azure_neural', quality: 5 },
  'ar-EG': { name: 'Egyptian Arabic', provider: 'azure_neural', quality: 5 },
  'ar-MA': { name: 'Maghrebi Arabic (Morocco)', provider: 'azure_neural', quality: 4 },
  'ar-JO': { name: 'Levantine Arabic (Jordan)', provider: 'azure_neural', quality: 4 },
  'ar-IQ': { name: 'Mesopotamian Arabic (Iraq)', provider: 'azure_neural', quality: 4 },
  'ar-LB': { name: 'Levantine Arabic (Lebanon)', provider: 'azure_neural', quality: 4 },
} as const;

// RTL Languages
export const RTL_LANGUAGES = ['ar', 'ar-SA', 'ar-AE', 'ar-EG', 'ar-MA', 'ar-JO', 'ar-IQ', 'ar-LB', 'he', 'fa', 'ur'] as const;

// ============================================
// TTS ROUTING (DIFFERENTIATOR-FIRST)
// ============================================
export interface TTSRoutingConfig {
  primary: string;
  secondary: string;
  tertiary: string;
  voiceClone?: string;
  visemeSupport: boolean;
}

/**
 * ZONE-BASED TTS ROUTING
 * 
 * Claude Zone (Western/EU): Azure Neural PRIMARY (Viseme support for lip-sync)
 * Alibaba Zone (CJK): Alibaba Qwen3-TTS PRIMARY (native dialect handling)
 * Alibaba Zone (MENA/RTL): Azure Neural PRIMARY (7 Arabic dialects + RTL)
 * Gemini Zone (India/SEA/Africa): Azure Neural PRIMARY (Viseme + regional voices)
 */
export const TTS_MASTER_ROUTING: Record<RegionalZone, TTSRoutingConfig> = {
  claude_zone: {
    primary: 'azure_neural',      // Viseme support for lip-sync
    secondary: 'alibaba_qwen3_tts', // Better than ElevenLabs for production
    tertiary: 'google_tts',
    voiceClone: 'elevenlabs',     // Premium feature only
    visemeSupport: true,
  },
  alibaba_zone: {
    primary: 'alibaba_qwen3_tts', // CJK native handling (keigo, tones)
    secondary: 'azure_neural',    // Arabic dialects (7 supported)
    tertiary: 'google_tts',
    voiceClone: 'alibaba_qwen3_tts', // Qwen3-TTS clone
    visemeSupport: true,
  },
  gemini_zone: {
    primary: 'azure_neural',      // South Asian + African voices
    secondary: 'google_tts',
    tertiary: 'alibaba_qwen3_tts',
    voiceClone: 'elevenlabs',
    visemeSupport: true,
  },
  fallback_zone: {
    primary: 'azure_neural',
    secondary: 'google_tts',
    tertiary: 'openai_tts',
    visemeSupport: false,
  },
};

// Per-language TTS routing for specific dialects
export const TTS_LANGUAGE_ROUTING: Record<string, TTSRoutingConfig> = {
  // English variants
  en: { primary: 'azure_neural', secondary: 'elevenlabs', tertiary: 'google_tts', visemeSupport: true },
  'en-US': { primary: 'azure_neural', secondary: 'elevenlabs', tertiary: 'google_tts', visemeSupport: true },
  'en-GB': { primary: 'azure_neural', secondary: 'elevenlabs', tertiary: 'google_tts', visemeSupport: true },
  'en-AU': { primary: 'azure_neural', secondary: 'elevenlabs', tertiary: 'google_tts', visemeSupport: true },
  
  // Spanish (LATAM + Spain) - Azure PRIMARY for Visemes
  es: { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'es-MX': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'es-ES': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  
  // Portuguese (Brazil + Portugal)
  pt: { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'pt-BR': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  
  // CJK Languages - Alibaba Qwen3-TTS PRIMARY
  zh: { primary: 'alibaba_qwen3_tts', secondary: 'azure_neural', tertiary: 'google_tts', voiceClone: 'alibaba_qwen3_tts', visemeSupport: true },
  'zh-CN': { primary: 'alibaba_qwen3_tts', secondary: 'azure_neural', tertiary: 'google_tts', voiceClone: 'alibaba_qwen3_tts', visemeSupport: true },
  'zh-TW': { primary: 'alibaba_qwen3_tts', secondary: 'azure_neural', tertiary: 'google_tts', voiceClone: 'alibaba_qwen3_tts', visemeSupport: true },
  ja: { primary: 'alibaba_qwen3_tts', secondary: 'azure_neural', tertiary: 'google_tts', visemeSupport: true },
  ko: { primary: 'alibaba_qwen3_tts', secondary: 'azure_neural', tertiary: 'google_tts', visemeSupport: true },
  
  // Arabic dialects (7 dialects) - Azure Neural PRIMARY for RTL + Visemes
  ar: { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'ar-SA': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'ar-AE': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'ar-EG': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'ar-MA': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'ar-JO': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'ar-IQ': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  'ar-LB': { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  
  // South Asian - Azure Neural PRIMARY for Visemes
  hi: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  'hi-IN': { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  bn: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  ur: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  ta: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  te: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  
  // SEA
  id: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  vi: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  th: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  ms: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  
  // African
  sw: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: false },
  yo: { primary: 'google_tts', secondary: 'azure_neural', tertiary: 'alibaba_qwen3_tts', visemeSupport: false },
  am: { primary: 'google_tts', secondary: 'azure_neural', tertiary: 'alibaba_qwen3_tts', visemeSupport: false },
  
  // European
  fr: { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  de: { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  it: { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  nl: { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  pl: { primary: 'azure_neural', secondary: 'alibaba_qwen3_tts', tertiary: 'google_tts', visemeSupport: true },
  ru: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  
  // Hebrew (RTL) - Azure PRIMARY for RTL support
  he: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
  
  // Persian (RTL)
  fa: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_qwen3_tts', visemeSupport: true },
};

// ============================================
// VIDEO GENERATION ROUTING
// ============================================
export interface VideoRoutingConfig {
  primary: string;
  secondary: string;
  tertiary: string;
  fallback: string;
  models: string[];
}

export const VIDEO_MASTER_ROUTING = {
  text_to_video: {
    primary: 'vertex_veo3',
    secondary: 'sora2',
    tertiary: 'alibaba_wan26',
    fallback: 'modelslab',
    models: ['veo-3.0', 'sora-2.0', 'wan2.6-t2v', 'animatediff'],
  },
  image_to_video: {
    primary: 'vertex_veo3',
    secondary: 'alibaba_wan26',
    tertiary: 'modelslab_svd',
    fallback: 'replicate_svd',
    models: ['veo-3.0-i2v', 'wan2.6-i2v', 'svd', 'svd-xt'],
  },
  video_to_video: {
    primary: 'alibaba_wan26',
    secondary: 'vertex_veo3',
    tertiary: 'modelslab',
    fallback: 'replicate',
    models: ['wan2.6-v2v', 'veo-3.0-v2v', 'video2video'],
  },
  video_transition: {
    primary: 'modelslab_animatediff',
    secondary: 'alibaba_wan26',
    tertiary: 'vertex_veo3',
    fallback: 'replicate',
    models: ['animatediff-transition', 'wan2.6-flf2v', 'veo-3.0'],
  },
  video_extend: {
    primary: 'vertex_veo3',
    secondary: 'alibaba_wan26',
    tertiary: 'sora2',
    fallback: 'modelslab',
    models: ['veo-3.0-extend', 'wan2.6-extend', 'sora-2.0-extend'],
  },
  video_effects: {
    primary: 'modelslab',
    secondary: 'alibaba_wan26',
    tertiary: 'vertex_veo3',
    fallback: 'replicate',
    models: ['video-effects', 'wan2.6-fx', 'veo-3.0-fx'],
  },
  motion_control: {
    primary: 'alibaba_wan26',
    secondary: 'modelslab',
    tertiary: 'vertex_veo3',
    fallback: 'replicate',
    models: ['wan2.6-motion', 'animatediff-motion', 'veo-3.0-motion'],
  },
} as const;

// ============================================
// IMAGE GENERATION ROUTING
// ============================================
export const IMAGE_MASTER_ROUTING = {
  text_to_image: {
    primary: 'gemini_3_pro',
    secondary: 'vertex_imagen3',
    tertiary: 'banana_nano',
    fallback: 'modelslab_flux',
    last_resort: 'openai_dalle',
    models: ['gemini-3.0-pro', 'imagen-3.0', 'gemini-2.5-flash', 'flux-pro', 'gpt-image-1'],
  },
  image_to_image: {
    primary: 'vertex_imagen3',
    secondary: 'gemini_3_pro',
    tertiary: 'modelslab_sdxl',
    fallback: 'replicate',
    last_resort: 'openai_dalle',
    models: ['imagen-3.0-edit', 'gemini-3.0-pro', 'sdxl-inpaint', 'flux-edit'],
  },
  thumbnail: {
    primary: 'gemini_3_pro',
    secondary: 'vertex_imagen3',
    tertiary: 'banana_nano',
    fallback: 'huggingface_flux',
    last_resort: 'openai_dalle',
    models: ['gemini-3.0-pro', 'imagen-3.0', 'gemini-2.5-flash', 'flux-schnell', 'gpt-image-1'],
  },
} as const;

// ============================================
// AVATAR GENERATION ROUTING (GLOBAL - NOT REGIONAL)
// ============================================
export const AVATAR_MASTER_ROUTING = {
  talking_head: {
    primary: 'alibaba_wan22',
    secondary: 'azure_video',
    tertiary: 'modelslab',
    fallback: 'replicate',
    models: ['wan2.2-s2v', 'azure-avatar', 'modelslab-avatar'],
  },
  full_body: {
    primary: 'alibaba_omniavatar',
    secondary: 'alibaba_taoavatar',
    tertiary: 'meshy_3d',
    fallback: 'modelslab',
    models: ['omni-avatar', 'taoavatar', 'meshy-avatar', '3d-animate-hub'],
  },
  lip_sync: {
    primary: 'alibaba_wan22',
    secondary: 'azure_viseme',
    tertiary: 'modelslab',
    fallback: 'replicate',
    models: ['wan2.2-s2v', 'azure-viseme', 'wav2lip'],
  },
  dubbing: {
    primary: 'alibaba_wan22',
    secondary: 'azure_viseme',
    tertiary: 'modelslab',
    fallback: 'replicate',
    models: ['wan2.2-s2v', 'azure-dubbing', 'modelslab-dub'],
  },
  photo_to_avatar: {
    primary: 'alibaba_mach',
    secondary: 'meshy_image2_3d',
    tertiary: 'modelslab_3d',
    fallback: 'replicate',
    models: ['mach', 'meshy-image-to-3d', '3d-animate-hub'],
  },
} as const;

// ============================================
// 3D / VR / AR ROUTING (GLOBAL)
// ============================================
export const THREED_MASTER_ROUTING = {
  text_to_3d: {
    primary: 'meshy_text2_3d',
    secondary: 'alibaba_mach',
    tertiary: 'modelslab_3d',
    fallback: 'replicate_3d',
    models: ['meshy-text-to-3d', 'mach', 'modelslab-3d', 'shap-e'],
  },
  image_to_3d: {
    primary: 'meshy_image2_3d',
    secondary: 'alibaba_richdreamer',
    tertiary: 'modelslab_3d',
    fallback: 'replicate_3d',
    models: ['meshy-image-to-3d', 'richdreamer', 'modelslab-3d'],
  },
  ar_avatar: {
    primary: 'alibaba_taoavatar',
    secondary: 'meshy_3d',
    tertiary: 'modelslab_3d',
    fallback: 'replicate_3d',
    models: ['taoavatar', 'meshy-ar', 'modelslab-ar'],
  },
  vr_scene: {
    primary: 'meshy_3d',
    secondary: 'alibaba_3d',
    tertiary: 'modelslab_3d',
    fallback: 'replicate_3d',
    models: ['meshy-scene', 'alibaba-3d-scene', 'modelslab-scene'],
  },
  texture_generation: {
    primary: 'meshy_texture',
    secondary: 'modelslab_texture',
    tertiary: 'alibaba_texture',
    fallback: 'replicate',
    models: ['meshy-texture', 'modelslab-texture', 'alibaba-texture'],
  },
} as const;

// ============================================
// AUDIO GENERATION ROUTING
// ============================================
export const AUDIO_MASTER_ROUTING = {
  voice_clone: {
    primary: 'alibaba_qwen3_tts',
    secondary: 'elevenlabs',
    tertiary: 'azure_custom',
    fallback: 'modelslab_voice',
    models: ['qwen3-tts-clone', 'elevenlabs-clone', 'azure-custom-neural'],
  },
  noise_removal: {
    primary: 'deepgram',
    secondary: 'adobe_podcast',
    tertiary: 'azure_audio',
    fallback: 'modelslab',
    models: ['deepgram-enhance', 'adobe-enhance', 'azure-enhance'],
  },
  music_generation: {
    primary: 'alibaba_funaudio',
    secondary: 'elevenlabs_music',
    tertiary: 'modelslab_musicgen',
    fallback: 'replicate_musicgen',
    models: ['fun-audio', 'elevenlabs-music', 'musicgen'],
  },
  sfx_generation: {
    primary: 'elevenlabs_sfx',
    secondary: 'alibaba_sfx',
    tertiary: 'modelslab_bark',
    fallback: 'replicate',
    models: ['elevenlabs-sfx', 'alibaba-sfx', 'bark'],
  },
  stt: {
    primary: 'deepgram_nova2',
    secondary: 'azure_stt',
    tertiary: 'alibaba_paraformer',
    fallback: 'openai_whisper',
    models: ['nova-2', 'azure-stt', 'paraformer', 'whisper-v3'],
  },
} as const;

// ============================================
// STYLE TRANSFORM ROUTING
// ============================================
export const STYLE_MASTER_ROUTING = {
  anime: {
    primary: 'modelslab_anime',
    secondary: 'alibaba_wan26',
    tertiary: 'replicate',
    fallback: 'huggingface',
    models: ['animatediff-anime', 'wan2.6-anime', 'anime-style'],
  },
  pixar_3d: {
    primary: 'alibaba_wan26',
    secondary: 'modelslab',
    tertiary: 'meshy_3d',
    fallback: 'replicate',
    models: ['wan2.6-3d-pixar', 'modelslab-pixar', 'meshy-style'],
  },
  photorealistic: {
    primary: 'vertex_veo3',
    secondary: 'sora2',
    tertiary: 'alibaba_wan26',
    fallback: 'modelslab',
    models: ['veo-3.0-photo', 'sora-2.0', 'wan2.6-photo'],
  },
  cinematic: {
    primary: 'vertex_veo3',
    secondary: 'sora2',
    tertiary: 'alibaba_wan26',
    fallback: 'modelslab',
    models: ['veo-3.0-cinema', 'sora-2.0', 'wan2.6-cinema'],
  },
  watercolor: {
    primary: 'modelslab',
    secondary: 'vertex_imagen3',
    tertiary: 'alibaba',
    fallback: 'replicate',
    models: ['sdxl-watercolor', 'imagen-style', 'wan2.6-art'],
  },
} as const;

// ============================================
// TEMPLATE GENERATION ROUTING
// ============================================
export const TEMPLATE_MASTER_ROUTING = {
  marketing: {
    videoProvider: 'vertex_veo3',
    imageProvider: 'gemini_3_pro',
    ttsProvider: 'azure_neural',
    avatarProvider: 'alibaba_wan22',
    fallbacks: ['sora2', 'vertex_imagen3', 'alibaba_qwen3_tts', 'modelslab'],
  },
  educational: {
    videoProvider: 'alibaba_wan26',
    imageProvider: 'vertex_imagen3',
    ttsProvider: 'azure_neural',
    avatarProvider: 'alibaba_wan22',
    fallbacks: ['modelslab', 'gemini_3_pro', 'google_tts', 'azure_video'],
  },
  entertainment: {
    videoProvider: 'vertex_veo3',
    imageProvider: 'gemini_3_pro',
    ttsProvider: 'elevenlabs',
    avatarProvider: 'alibaba_omniavatar',
    fallbacks: ['sora2', 'vertex_imagen3', 'azure_neural', 'alibaba_wan22'],
  },
  enterprise: {
    videoProvider: 'azure_video',
    imageProvider: 'vertex_imagen3',
    ttsProvider: 'azure_neural',
    avatarProvider: 'azure_avatar',
    fallbacks: ['alibaba_wan26', 'gemini_3_pro', 'alibaba_qwen3_tts', 'alibaba_wan22'],
  },
} as const;

// ============================================
// REGION-SPECIFIC ROUTING (Video, Avatar, Translation, Image)
// Fills gaps identified in routing audit — R-6, R-7, R-8, R-12
// ============================================

/**
 * VIDEO_REGION_ROUTING — Zone-specific primary video provider.
 * CJK prefers Alibaba WAN 2.6 (native content optimization).
 * All other zones default to Vertex Veo 3.
 */
export const VIDEO_REGION_ROUTING: Record<RegionalZone, { primary: string; secondary: string; tertiary: string }> = {
  claude_zone:   { primary: 'vertex_veo3',   secondary: 'sora2',          tertiary: 'alibaba_wan26' },
  alibaba_zone:  { primary: 'alibaba_wan26', secondary: 'vertex_veo3',    tertiary: 'sora2' },
  gemini_zone:   { primary: 'vertex_veo3',   secondary: 'alibaba_wan26',  tertiary: 'modelslab' },
  fallback_zone: { primary: 'vertex_veo3',   secondary: 'modelslab',      tertiary: 'replicate' },
};

/**
 * AVATAR_REGION_ROUTING — Zone-specific avatar + lip-sync method.
 * MENA/RTL: Azure Viseme PRIMARY for lip-sync (7 Arabic dialects).
 * CJK: Alibaba WAN 2.2 native (keigo, tones, cultural nuance).
 */
export const AVATAR_REGION_ROUTING: Record<RegionalZone, { primary: string; lipSync: string; secondary: string }> = {
  claude_zone:   { primary: 'alibaba_wan22', lipSync: 'azure_viseme',    secondary: 'modelslab' },
  alibaba_zone:  { primary: 'alibaba_wan22', lipSync: 'alibaba_wan22',   secondary: 'azure_viseme' },
  gemini_zone:   { primary: 'alibaba_wan22', lipSync: 'azure_viseme',    secondary: 'modelslab' },
  fallback_zone: { primary: 'alibaba_wan22', lipSync: 'azure_viseme',    secondary: 'modelslab' },
};

/**
 * TRANSLATION_REGION_ROUTING — Zone-specific translation provider.
 * EU → DeepL (best quality for European languages).
 * CJK → Alibaba Qwen-MT (native CJK handling).
 * MENA → Azure Translator (RTL + Arabic dialect support).
 * India/SEA/Africa → Google Translate (widest coverage).
 */
export const TRANSLATION_REGION_ROUTING: Record<RegionalZone, { primary: string; secondary: string; tertiary: string }> = {
  claude_zone:   { primary: 'deepl',              secondary: 'azure_translator',  tertiary: 'google_translate' },
  alibaba_zone:  { primary: 'alibaba_qwen_mt',    secondary: 'azure_translator',  tertiary: 'google_translate' },
  gemini_zone:   { primary: 'google_translate',    secondary: 'azure_translator',  tertiary: 'deepl' },
  fallback_zone: { primary: 'google_translate',    secondary: 'azure_translator',  tertiary: 'aws_translate' },
};

/**
 * IMAGE_REGION_ROUTING — Zone-specific image generation provider.
 * CJK → Alibaba WanX (native style optimization).
 * All others → Gemini 3 Pro (best general quality).
 */
export const IMAGE_REGION_ROUTING: Record<RegionalZone, { primary: string; secondary: string; tertiary: string }> = {
  claude_zone:   { primary: 'gemini_3_pro',    secondary: 'vertex_imagen3', tertiary: 'modelslab_flux' },
  alibaba_zone:  { primary: 'alibaba_wanx',    secondary: 'gemini_3_pro',   tertiary: 'vertex_imagen3' },
  gemini_zone:   { primary: 'gemini_3_pro',    secondary: 'vertex_imagen3', tertiary: 'modelslab_flux' },
  fallback_zone: { primary: 'gemini_3_pro',    secondary: 'modelslab_flux', tertiary: 'openai_dalle' },
};

Object.freeze(VIDEO_REGION_ROUTING);
Object.freeze(AVATAR_REGION_ROUTING);
Object.freeze(TRANSLATION_REGION_ROUTING);
Object.freeze(IMAGE_REGION_ROUTING);

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getVideoRegionRouting(zone: RegionalZone) {
  return VIDEO_REGION_ROUTING[zone];
}

export function getAvatarRegionRouting(zone: RegionalZone) {
  return AVATAR_REGION_ROUTING[zone];
}

export function getTranslationRegionRouting(zone: RegionalZone) {
  return TRANSLATION_REGION_ROUTING[zone];
}

export function getImageRegionRouting(zone: RegionalZone) {
  return IMAGE_REGION_ROUTING[zone];
}

export function getTTSRouting(languageCode: string): TTSRoutingConfig {
  // Check specific language first
  if (TTS_LANGUAGE_ROUTING[languageCode]) {
    return TTS_LANGUAGE_ROUTING[languageCode];
  }
  
  // Extract base language
  const baseLang = languageCode.split('-')[0];
  if (TTS_LANGUAGE_ROUTING[baseLang]) {
    return TTS_LANGUAGE_ROUTING[baseLang];
  }
  
  // Fall back to zone-based routing
  const zone = LANGUAGE_TO_ZONE[languageCode] || LANGUAGE_TO_ZONE[baseLang] || 'fallback_zone';
  return TTS_MASTER_ROUTING[zone];
}

export function getVideoRouting(type: keyof typeof VIDEO_MASTER_ROUTING) {
  return VIDEO_MASTER_ROUTING[type];
}

export function getImageRouting(type: keyof typeof IMAGE_MASTER_ROUTING) {
  return IMAGE_MASTER_ROUTING[type];
}

export function getAvatarRouting(type: keyof typeof AVATAR_MASTER_ROUTING) {
  return AVATAR_MASTER_ROUTING[type];
}

export function get3DRouting(type: keyof typeof THREED_MASTER_ROUTING) {
  return THREED_MASTER_ROUTING[type];
}

export function getAudioRouting(type: keyof typeof AUDIO_MASTER_ROUTING) {
  return AUDIO_MASTER_ROUTING[type];
}

export function getStyleRouting(style: keyof typeof STYLE_MASTER_ROUTING) {
  return STYLE_MASTER_ROUTING[style];
}

export function getZoneForCountry(countryCode: string): RegionalZone {
  for (const [zone, countries] of Object.entries(ZONE_COUNTRIES)) {
    if (countries.includes(countryCode)) {
      return zone as RegionalZone;
    }
  }
  return 'fallback_zone';
}

export function getZoneForLanguage(languageCode: string): RegionalZone {
  const baseLang = languageCode.split('-')[0];
  return LANGUAGE_TO_ZONE[languageCode] || LANGUAGE_TO_ZONE[baseLang] || 'fallback_zone';
}

// ============================================
// EXPORT SUMMARY FOR DOCUMENTATION
// ============================================
export const ROUTING_SUMMARY = {
  tts: {
    western_europe_latam: 'Azure Neural (PRIMARY) → Alibaba Qwen3-TTS → Google TTS',
    cjk: 'Alibaba Qwen3-TTS (PRIMARY) → Azure Neural → Google TTS',
    mena_rtl: 'Azure Neural (PRIMARY) → Alibaba Qwen3-TTS → Google TTS',
    south_asia_africa: 'Azure Neural (PRIMARY) → Google TTS → Alibaba Qwen3-TTS',
    voice_clone: 'Alibaba Qwen3-TTS (CJK) | ElevenLabs (Premium Western)',
  },
  video: {
    text_to_video: 'Vertex Veo 3 → Sora 2 → Alibaba Wan 2.6 → ModelsLab',
    image_to_video: 'Vertex Veo 3 → Alibaba Wan 2.6 → ModelsLab SVD → Replicate',
    video_effects: 'ModelsLab → Alibaba Wan 2.6 → Vertex Veo 3',
  },
  image: {
    generation: 'Gemini 3 Pro → Vertex Imagen 3 → Banana Nano → ModelsLab FLUX',
    last_resort: 'OpenAI DALL-E 3 (only when all else fails)',
  },
  avatar: {
    talking_head: 'Alibaba Wan 2.2 (GLOBAL PRIMARY) → Azure → ModelsLab',
    full_body: 'Alibaba OmniAvatar (GLOBAL PRIMARY) → TaoAvatar → Meshy',
    lip_sync: 'Alibaba Wan 2.2 (S2V) + Azure Viseme data',
  },
  threed: {
    text_to_3d: 'Meshy (PRIMARY) → Alibaba MACH → ModelsLab',
    image_to_3d: 'Meshy → Alibaba Richdreamer → ModelsLab',
    ar_vr: 'Alibaba TaoAvatar (90 FPS) → Meshy → ModelsLab',
  },
  audio: {
    stt: 'Deepgram Nova 2 (PRIMARY) → Azure → Alibaba Paraformer',
    music: 'Alibaba FunAudio → ElevenLabs → ModelsLab MusicGen',
    sfx: 'ElevenLabs SFX → Alibaba → ModelsLab Bark',
  },
} as const;

// Freeze all routing configs to prevent mutation
Object.freeze(INTEGRATED_PROVIDERS);
Object.freeze(VIDEO_ASSEMBLY_ROUTING);
Object.freeze(TTS_MASTER_ROUTING);
Object.freeze(TTS_LANGUAGE_ROUTING);
Object.freeze(VIDEO_MASTER_ROUTING);
Object.freeze(IMAGE_MASTER_ROUTING);
Object.freeze(AVATAR_MASTER_ROUTING);
Object.freeze(THREED_MASTER_ROUTING);  // VR/AR included here
Object.freeze(AUDIO_MASTER_ROUTING);
Object.freeze(STYLE_MASTER_ROUTING);
Object.freeze(TEMPLATE_MASTER_ROUTING);
Object.freeze(ROUTING_SUMMARY);
Object.freeze(ARABIC_DIALECTS);
Object.freeze(ZONE_COUNTRIES);
Object.freeze(LANGUAGE_TO_ZONE);
