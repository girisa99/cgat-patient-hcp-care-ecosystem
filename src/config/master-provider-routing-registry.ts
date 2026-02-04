/**
 * MASTER PROVIDER ROUTING REGISTRY
 * 
 * Single source of truth for ALL media capability routing across the Genie ecosystem.
 * This file is IMMUTABLE and should be the canonical reference for provider selection.
 * 
 * ROUTING PHILOSOPHY:
 * - Azure Neural prioritized for Western, MENA, South Asia, Africa (Viseme superiority)
 * - Alibaba CosyVoice prioritized for CJK and secondary global fallback
 * - ElevenLabs relegated to tertiary/premium-only for voice cloning
 * - Vertex AI (Veo 3, Imagen 3) prioritized for video/image generation
 * - DeepSeek prioritized for cost-effective CJK technical content
 * 
 * @version 2.0.0
 * @lastUpdated 2026-02-04
 */

// ============================================
// REGIONAL ZONES (4-Zone Architecture)
// ============================================
export type RegionalZone = 
  | 'claude_zone'    // US, UK, EU, Brazil, Israel, South Africa
  | 'alibaba_zone'   // Japan, Korea, China, HK, Taiwan, MEA (Arabic)
  | 'gemini_zone'    // India, Pakistan, SEA, Africa
  | 'fallback_zone'; // Global fallback

export const ZONE_COUNTRIES: Record<RegionalZone, string[]> = {
  claude_zone: ['US', 'UK', 'CA', 'AU', 'NZ', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BR', 'IL', 'ZA', 'IE', 'BE', 'AT', 'CH'],
  alibaba_zone: ['CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MO', 'SA', 'AE', 'EG', 'MA', 'JO', 'IQ', 'KW', 'QA', 'BH', 'OM', 'LB', 'SY'],
  gemini_zone: ['IN', 'PK', 'BD', 'ID', 'VN', 'TH', 'PH', 'MY', 'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'RW', 'MM', 'KH', 'LA', 'NP', 'LK'],
  fallback_zone: ['*'],
};

// ============================================
// LANGUAGE CODES & ROUTING
// ============================================
export const LANGUAGE_TO_ZONE: Record<string, RegionalZone> = {
  // Claude Zone
  en: 'claude_zone', es: 'claude_zone', fr: 'claude_zone', de: 'claude_zone',
  it: 'claude_zone', pt: 'claude_zone', nl: 'claude_zone', pl: 'claude_zone',
  
  // Alibaba Zone
  zh: 'alibaba_zone', 'zh-CN': 'alibaba_zone', 'zh-TW': 'alibaba_zone',
  ja: 'alibaba_zone', ko: 'alibaba_zone',
  ar: 'alibaba_zone', 'ar-SA': 'alibaba_zone', 'ar-AE': 'alibaba_zone',
  'ar-EG': 'alibaba_zone', 'ar-MA': 'alibaba_zone', he: 'alibaba_zone',
  
  // Gemini Zone
  hi: 'gemini_zone', 'hi-IN': 'gemini_zone', bn: 'gemini_zone', ur: 'gemini_zone',
  ta: 'gemini_zone', te: 'gemini_zone', mr: 'gemini_zone', gu: 'gemini_zone',
  id: 'gemini_zone', ms: 'gemini_zone', vi: 'gemini_zone', th: 'gemini_zone',
  sw: 'gemini_zone', yo: 'gemini_zone', am: 'gemini_zone', ha: 'gemini_zone',
};

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

export const TTS_MASTER_ROUTING: Record<RegionalZone, TTSRoutingConfig> = {
  claude_zone: {
    primary: 'azure_neural',
    secondary: 'alibaba_cosyvoice',
    tertiary: 'google_tts',
    voiceClone: 'elevenlabs',
    visemeSupport: true,
  },
  alibaba_zone: {
    primary: 'alibaba_cosyvoice',
    secondary: 'azure_neural',
    tertiary: 'google_tts',
    voiceClone: 'alibaba_cosyvoice',
    visemeSupport: true,
  },
  gemini_zone: {
    primary: 'azure_neural',
    secondary: 'google_tts',
    tertiary: 'alibaba_cosyvoice',
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
  
  // Spanish (LATAM + Spain)
  es: { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  'es-MX': { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  'es-ES': { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  
  // Portuguese (Brazil + Portugal)
  pt: { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  'pt-BR': { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  
  // CJK Languages
  zh: { primary: 'alibaba_cosyvoice', secondary: 'azure_neural', tertiary: 'google_tts', voiceClone: 'alibaba_cosyvoice', visemeSupport: true },
  'zh-CN': { primary: 'alibaba_cosyvoice', secondary: 'azure_neural', tertiary: 'google_tts', voiceClone: 'alibaba_cosyvoice', visemeSupport: true },
  'zh-TW': { primary: 'alibaba_cosyvoice', secondary: 'azure_neural', tertiary: 'google_tts', voiceClone: 'alibaba_cosyvoice', visemeSupport: true },
  ja: { primary: 'alibaba_cosyvoice', secondary: 'azure_neural', tertiary: 'google_tts', visemeSupport: true },
  ko: { primary: 'alibaba_cosyvoice', secondary: 'azure_neural', tertiary: 'google_tts', visemeSupport: true },
  
  // Arabic dialects (MENA)
  ar: { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  'ar-SA': { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  'ar-AE': { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  'ar-EG': { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  'ar-MA': { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  
  // South Asian
  hi: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  'hi-IN': { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  bn: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  ur: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  ta: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  te: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  
  // SEA
  id: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  vi: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  th: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  ms: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  
  // African
  sw: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: false },
  yo: { primary: 'google_tts', secondary: 'azure_neural', tertiary: 'alibaba_cosyvoice', visemeSupport: false },
  am: { primary: 'google_tts', secondary: 'azure_neural', tertiary: 'alibaba_cosyvoice', visemeSupport: false },
  
  // European
  fr: { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  de: { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  it: { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  nl: { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  pl: { primary: 'azure_neural', secondary: 'alibaba_cosyvoice', tertiary: 'google_tts', visemeSupport: true },
  ru: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
  
  // Hebrew (RTL)
  he: { primary: 'azure_neural', secondary: 'google_tts', tertiary: 'alibaba_cosyvoice', visemeSupport: true },
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
    models: ['gemini-3.0-pro', 'imagen-3.0', 'gemini-2.5-flash', 'flux-pro', 'dall-e-3'],
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
    models: ['gemini-3.0-pro', 'imagen-3.0', 'gemini-2.5-flash', 'flux-schnell', 'dall-e-3'],
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
    primary: 'alibaba_cosyvoice',
    secondary: 'elevenlabs',
    tertiary: 'azure_custom',
    fallback: 'modelslab_voice',
    models: ['cosyvoice-clone', 'elevenlabs-clone', 'azure-custom-neural'],
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
    fallbacks: ['sora2', 'vertex_imagen3', 'alibaba_cosyvoice', 'modelslab'],
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
    fallbacks: ['alibaba_wan26', 'gemini_3_pro', 'alibaba_cosyvoice', 'alibaba_wan22'],
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================
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
    western_europe_latam: 'Azure Neural (PRIMARY) → Alibaba CosyVoice → Google TTS',
    cjk: 'Alibaba CosyVoice (PRIMARY) → Azure Neural → Google TTS',
    mena_rtl: 'Azure Neural (PRIMARY) → Alibaba CosyVoice → Google TTS',
    south_asia_africa: 'Azure Neural (PRIMARY) → Google TTS → Alibaba CosyVoice',
    voice_clone: 'Alibaba CosyVoice (CJK) | ElevenLabs (Premium Western)',
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
Object.freeze(TTS_MASTER_ROUTING);
Object.freeze(TTS_LANGUAGE_ROUTING);
Object.freeze(VIDEO_MASTER_ROUTING);
Object.freeze(IMAGE_MASTER_ROUTING);
Object.freeze(AVATAR_MASTER_ROUTING);
Object.freeze(THREED_MASTER_ROUTING);
Object.freeze(AUDIO_MASTER_ROUTING);
Object.freeze(STYLE_MASTER_ROUTING);
Object.freeze(TEMPLATE_MASTER_ROUTING);
Object.freeze(ROUTING_SUMMARY);
