/**
 * Unified Provider Routing Adapter
 * 
 * Central hub for routing ALL media requests (Video, Audio, Translation, Multi-Language)
 * through the 4-Zone LLM Routing Strategy from Excel:
 * 
 * 1. CLAUDE ZONE: US, UK, EU, Brazil, Israel, South Africa (Claude + ElevenLabs + DeepL)
 * 2. ALIBABA ZONE: Japan, Korea, China, HK, Taiwan, MEA/Arabic (Qwen + Qwen3-TTS + Qwen-MT)
 * 3. GEMINI ZONE: India, Pakistan, SEA, Africa (Gemini + Azure + Google Translate)
 * 4. FALLBACK: GPT-4o (When primary fails)
 * 
 * RTL Support: Automatic layout direction detection for Arabic, Hebrew, Persian, Urdu
 */

import { 
  COMPLETE_LANGUAGE_MATRIX, 
  getProviderForLanguage as getCompetitiveProviderEntry,
  isCompetitiveMoatLanguage,
  getCompetitorGapBadge,
  type LanguageProviderEntry,
  type CompetitorGap,
  type LanguageMoat,
  LANGUAGE_MOATS,
} from './competitiveLanguageMatrix';

import {
  REGIONAL_PROVIDER_CONFIG,
  REGIONAL_LANGUAGES,
  AFRICAN_LANGUAGE_CONFIG,
  type RegionalCluster,
  type RegionalProviderConfig,
  type TextDirection,
} from './regionalLanguageService';

import {
  COMPLETE_ROUTING_TABLE,
  ZONE_SUMMARY,
  getLLMRouteByCountry,
  selectLLM,
  selectTTS,
  selectTranslation,
  type LLMZone,
  type LLMRoutingConfig,
} from './llmRoutingStrategy';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type MediaType = 'translation' | 'tts' | 'stt' | 'video' | 'image' | 'dubbing' | 'voiceClone' | 'avatar' | 'fullBodyAvatar' | 'priorityRendering';

export interface ProviderRoute {
  primary: string;
  fallback: string;
  quality: number;
  reason: string;
  isRTL: boolean;
  isMoatLanguage: boolean;
  competitorGap: CompetitorGap | null;
  moat: LanguageMoat;
  zone?: LLMZone;
  isGlobal?: boolean; // True for non-regional routing (avatar, priority rendering)
}

export interface BadgeInfo {
  label: string;
  color: string;
  icon: string;
}

export interface UnifiedProviderResult {
  languageCode: string;
  languageName: string;
  nativeName: string;
  direction: TextDirection;
  region: RegionalCluster | string;
  speakers: string;
  zone: LLMZone;
  
  // Provider routes by media type
  llm: ProviderRoute;
  translation: ProviderRoute;
  tts: ProviderRoute;
  stt: ProviderRoute;
  video: ProviderRoute;
  dubbing: ProviderRoute;
  
  // Premium/Upsell features - Global routing (not zone-based)
  voiceClone: ProviderRoute;
  avatar: ProviderRoute;
  fullBodyAvatar: ProviderRoute;
  priorityRendering: ProviderRoute;
  
  // Competitive intelligence
  marketAdvantage: string;
  badge: BadgeInfo;
}

export interface FallbackChain {
  providers: string[];
  selectedProvider: string;
  selectedIndex: number;
  reason: string;
}

// ============================================================================
// LLM PROVIDER MAPPING BY ZONE (From Excel Strategy)
// ============================================================================

const LLM_PROVIDER_MAP: Record<string, { primary: string; fallback: string; zone: LLMZone; quality: number }> = {
  // CLAUDE ZONE: US, UK, EU, Brazil, Israel, South Africa
  'en': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'en-US': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'en-GB': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'de': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'fr': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'es': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'it': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'pt-BR': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'pt-PT': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'nl': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'pl': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'ru': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 5 },
  'he': { primary: 'claude-3-5-sonnet', fallback: 'gpt-4o', zone: 'claude', quality: 4 },
  
  // ALIBABA ZONE: CJK, Arabic
  'ja': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'ko': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'zh-CN': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'zh-TW': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'zh-HK': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'ar': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'ar-EG': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'ar-SA': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'ar-AE': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 5 },
  'ar-MA': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 4 },
  'ar-IQ': { primary: 'qwen-max', fallback: 'gpt-4o', zone: 'alibaba', quality: 4 },
  
  // GEMINI ZONE: India, SEA, Africa
  'hi': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 5 },
  'bn': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 5 },
  'te': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 5 },
  'ta': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 5 },
  'mr': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'gu': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'kn': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'ml': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'pa': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'ur': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'id': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'vi': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'th': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'fil': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'ms': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'sw': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 5 },
  'yo': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'ha': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 3 },
  'ig': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 3 },
  'am': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
  'zu': { primary: 'gemini-pro', fallback: 'gpt-4o', zone: 'gemini', quality: 4 },
};

// TTS Provider Mapping by Zone
const TTS_PROVIDER_MAP: Record<string, { primary: string; fallback: string; quality: number }> = {
  // CLAUDE ZONE - ElevenLabs for premium European voices
  'en': { primary: 'elevenlabs', fallback: 'openai-tts', quality: 5 },
  'en-US': { primary: 'elevenlabs', fallback: 'openai-tts', quality: 5 },
  'en-GB': { primary: 'elevenlabs', fallback: 'openai-tts', quality: 5 },
  'en-AU': { primary: 'elevenlabs', fallback: 'openai-tts', quality: 5 },
  'de': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'fr': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'es': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'es-MX': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'it': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'pt-BR': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'pt-PT': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'nl': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'pl': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  'ru': { primary: 'elevenlabs', fallback: 'azure-neural', quality: 5 },
  
  // ALIBABA ZONE - Qwen3-TTS for CJK, Azure for Arabic
  'ja': { primary: 'alibaba-qwen3-tts', fallback: 'azure-neural', quality: 5 },
  'ko': { primary: 'alibaba-qwen3-tts', fallback: 'azure-neural', quality: 5 },
  'zh-CN': { primary: 'alibaba-qwen3-tts', fallback: 'azure-neural', quality: 5 },
  'zh-TW': { primary: 'alibaba-qwen3-tts', fallback: 'azure-neural', quality: 5 },
  'zh-HK': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ar': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ar-EG': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ar-SA': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ar-AE': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ar-MA': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ar-JO': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ar-IQ': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  
  // GEMINI ZONE - Azure Neural for India/SEA/Africa (Visemes support)
  'hi': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'bn': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'te': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ta': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'mr': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'kn': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'gu': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ml': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'pa': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ur': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  // SEA Languages - Azure Neural PRIMARY (moved from Alibaba Zone for Visemes)
  'id': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'vi': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'th': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'fil': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ms': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  // African Languages - Azure Neural PRIMARY
  'sw': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'yo': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ha': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  'ig': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  'zu': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'am': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'xh': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  'af': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  
  // RTL Languages
  'he': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'fa': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
};

// Translation Provider Mapping by Zone
const TRANSLATION_PROVIDER_MAP: Record<string, { primary: string; fallback: string; quality: number }> = {
  // CLAUDE ZONE - DeepL for European (best quality)
  'de': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'fr': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'es': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'it': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'pt': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'pt-BR': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'pt-PT': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'nl': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'pl': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'ru': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'en': { primary: 'deepl', fallback: 'google-translate', quality: 5 },
  
  // ALIBABA ZONE - Qwen-MT for CJK, Azure for Arabic
  'ja': { primary: 'qwen-mt', fallback: 'deepl', quality: 5 },
  'ko': { primary: 'qwen-mt', fallback: 'deepl', quality: 5 },
  'zh-CN': { primary: 'qwen-mt', fallback: 'google-translate', quality: 5 },
  'zh-TW': { primary: 'qwen-mt', fallback: 'google-translate', quality: 5 },
  'ar': { primary: 'azure-translator', fallback: 'google-translate', quality: 5 },
  'ar-EG': { primary: 'azure-translator', fallback: 'google-translate', quality: 5 },
  'ar-SA': { primary: 'azure-translator', fallback: 'google-translate', quality: 5 },
  'ar-AE': { primary: 'azure-translator', fallback: 'google-translate', quality: 5 },
  
  // GEMINI ZONE - Google for India/SEA/Africa
  'hi': { primary: 'google-translate', fallback: 'azure-translator', quality: 5 },
  'bn': { primary: 'google-translate', fallback: 'azure-translator', quality: 5 },
  'te': { primary: 'google-translate', fallback: 'azure-translator', quality: 5 },
  'ta': { primary: 'google-translate', fallback: 'azure-translator', quality: 5 },
  'mr': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'gu': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'kn': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'ml': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'pa': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'ur': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'id': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'vi': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'th': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'fil': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'ms': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'sw': { primary: 'google-translate', fallback: 'nllb', quality: 5 },
  'yo': { primary: 'google-translate', fallback: 'nllb', quality: 4 },
  'ha': { primary: 'google-translate', fallback: 'nllb', quality: 3 },
  'ig': { primary: 'google-translate', fallback: 'nllb', quality: 3 },
  'zu': { primary: 'google-translate', fallback: 'nllb', quality: 4 },
  'am': { primary: 'google-translate', fallback: 'nllb', quality: 4 },
  
  // RTL
  'he': { primary: 'azure-translator', fallback: 'google-translate', quality: 4 },
  'fa': { primary: 'azure-translator', fallback: 'google-translate', quality: 4 },
};

// STT Provider Mapping
const STT_PROVIDER_MAP: Record<string, { primary: string; fallback: string; quality: number }> = {
  // CLAUDE ZONE - Whisper universal, ElevenLabs Scribe premium
  'en': { primary: 'elevenlabs-scribe', fallback: 'whisper', quality: 5 },
  'de': { primary: 'whisper', fallback: 'azure-stt', quality: 5 },
  'fr': { primary: 'whisper', fallback: 'azure-stt', quality: 5 },
  'es': { primary: 'whisper', fallback: 'azure-stt', quality: 5 },
  
  // ALIBABA ZONE - Paraformer for CJK
  'ja': { primary: 'alibaba-paraformer', fallback: 'whisper', quality: 5 },
  'ko': { primary: 'alibaba-paraformer', fallback: 'whisper', quality: 5 },
  'zh-CN': { primary: 'alibaba-paraformer', fallback: 'whisper', quality: 5 },
  'ar': { primary: 'whisper', fallback: 'azure-stt', quality: 5 },
  
  // GEMINI ZONE - Whisper universal
  'hi': { primary: 'whisper', fallback: 'azure-stt', quality: 5 },
  'bn': { primary: 'whisper', fallback: 'azure-stt', quality: 4 },
  'te': { primary: 'whisper', fallback: 'azure-stt', quality: 4 },
  'ta': { primary: 'whisper', fallback: 'azure-stt', quality: 4 },
  'sw': { primary: 'whisper', fallback: 'azure-stt', quality: 4 },
  'am': { primary: 'whisper', fallback: 'google-stt', quality: 4 },
};

// Video Provider Mapping (for AI video generation with narration)
const VIDEO_PROVIDER_MAP: Record<string, { primary: string; fallback: string; quality: number }> = {
  'en': { primary: 'modelslab', fallback: 'replicate', quality: 5 },
  'de': { primary: 'modelslab', fallback: 'azure-video', quality: 5 },
  'fr': { primary: 'modelslab', fallback: 'azure-video', quality: 5 },
  'es': { primary: 'modelslab', fallback: 'azure-video', quality: 5 },
  'ja': { primary: 'modelslab', fallback: 'replicate', quality: 5 },
  'ko': { primary: 'modelslab', fallback: 'replicate', quality: 5 },
  'zh-CN': { primary: 'modelslab', fallback: 'replicate', quality: 5 },
  'ar': { primary: 'modelslab', fallback: 'azure-video', quality: 4 },
  'hi': { primary: 'modelslab', fallback: 'azure-video', quality: 4 },
};

// ============================================================================
// PREMIUM FEATURES - GLOBAL ROUTING (Not Zone-Based)
// These features use the same provider globally, regardless of user region
// ============================================================================

/**
 * AVATAR PROVIDERS - Global Routing
 * Primary: Alibaba Wan2.2 (S2V) for all regions
 * Fallback: Replicate
 * NOT zone-based - same provider everywhere for consistency
 */
const AVATAR_PROVIDER_CONFIG = {
  primary: 'alibaba-wan2.2',
  fallback: 'replicate',
  quality: 5,
  reason: 'Alibaba Wan2.2-S2V: Best-in-class avatar animation globally',
};

/**
 * FULL-BODY AVATAR PROVIDERS - Global Routing
 * Primary: Alibaba OmniAvatar (premium upsell feature)
 * Fallback: NONE (premium feature, no fallback)
 */
const FULL_BODY_AVATAR_PROVIDER_CONFIG = {
  primary: 'alibaba-omniavatar',
  fallback: 'none', // Premium feature, no fallback
  quality: 5,
  reason: 'Alibaba OmniAvatar: Full-body animation - premium feature',
};

/**
 * PRIORITY RENDERING - Global Routing
 * Primary: RunPod (dedicated GPU resources)
 * Fallback: Replicate (shared resources)
 */
const PRIORITY_RENDERING_PROVIDER_CONFIG = {
  primary: 'runpod',
  fallback: 'replicate',
  quality: 5,
  reason: 'RunPod: Dedicated GPU for priority rendering',
};

// RTL Languages Set
const RTL_LANGUAGES = new Set([
  'ar', 'ar-EG', 'ar-SA', 'ar-AE', 'ar-MA', 'ar-JO', 'ar-IQ', 'ar-DZ',
  'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'dv'
]);

// ============================================================================
// MAIN ROUTING FUNCTIONS
// ============================================================================

/**
 * Get unified provider routing for a language across all media types
 */
export function getUnifiedProviderRouting(languageCode: string): UnifiedProviderResult {
  const baseCode = languageCode.split('-')[0];
  const isRTL = RTL_LANGUAGES.has(languageCode) || RTL_LANGUAGES.has(baseCode);
  
  // Get from competitive matrix first
  const matrixEntry = COMPLETE_LANGUAGE_MATRIX.find(
    e => e.code === languageCode || e.code === baseCode
  );
  
  // Get LLM provider from zone mapping
  const llmConfig = LLM_PROVIDER_MAP[languageCode] || LLM_PROVIDER_MAP[baseCode] || 
    { primary: 'gpt-4o', fallback: 'claude-3-5-sonnet', zone: 'fallback' as LLMZone, quality: 4 };
  
  // Get TTS provider
  const ttsConfig = TTS_PROVIDER_MAP[languageCode] || TTS_PROVIDER_MAP[baseCode] || 
    { primary: 'azure-neural', fallback: 'google-tts', quality: 3 };
  
  // Get Translation provider
  const translationConfig = TRANSLATION_PROVIDER_MAP[languageCode] || TRANSLATION_PROVIDER_MAP[baseCode] ||
    { primary: 'google-translate', fallback: 'azure-translator', quality: 3 };
  
  // Get STT provider
  const sttConfig = STT_PROVIDER_MAP[languageCode] || STT_PROVIDER_MAP[baseCode] ||
    { primary: 'whisper', fallback: 'azure-stt', quality: 3 };
  
  // Get Video provider
  const videoConfig = VIDEO_PROVIDER_MAP[languageCode] || VIDEO_PROVIDER_MAP[baseCode] ||
    { primary: 'modelslab', fallback: 'replicate', quality: 4 };
  
  const isMoatLanguage = matrixEntry?.moat !== null && matrixEntry?.moat !== undefined;
  const competitorGap = matrixEntry?.competitorGap || null;
  const moat = matrixEntry?.moat || null;
  const zone = llmConfig.zone;
  
  // Build reason strings
  const getTTSReason = () => {
    if (isMoatLanguage) {
      if (moat === 'arabic_dialects') return 'MOAT: 7 Arabic dialects - NO competitors have this';
      if (moat === 'indian_languages') return 'MOAT: 22 Indian languages - competitors have 1-2 max';
      if (moat === 'african_languages') return 'FIRST MOVER: African languages - NO competitors';
    }
    if (baseCode === 'ja' || baseCode === 'ko' || baseCode.startsWith('zh')) {
      return 'Premium: Alibaba Qwen3-TTS for native CJK handling';
    }
    if (['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru'].includes(baseCode)) {
      return 'You WIN: ElevenLabs for natural European voices';
    }
    return 'Standard provider routing';
  };
  
  const getTranslationReason = () => {
    if (['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru'].includes(baseCode)) {
      return 'You WIN: DeepL excellence for European languages';
    }
    if (baseCode === 'ja' || baseCode === 'ko' || baseCode.startsWith('zh')) {
      return 'Premium: Qwen-MT for native CJK translation';
    }
    if (isMoatLanguage && moat === 'indian_languages') {
      return 'MOAT: Google Translate best coverage for Indian languages';
    }
    if (isMoatLanguage && moat === 'african_languages') {
      return 'FIRST MOVER: Google + NLLB for African languages';
    }
    return 'Standard provider routing';
  };

  const getLLMReason = () => {
    if (zone === 'claude') return 'Claude Zone: Best for EU/US formal tone';
    if (zone === 'alibaba') return 'Alibaba Zone: Native CJK/Arabic handling';
    if (zone === 'gemini') return 'Gemini Zone: Best for India/SEA/Africa';
    return 'Fallback: GPT-4o general purpose';
  };
  
  return {
    languageCode,
    languageName: matrixEntry?.name || languageCode,
    nativeName: matrixEntry?.nativeName || languageCode,
    direction: isRTL ? 'rtl' : 'ltr',
    region: matrixEntry?.region || 'unknown',
    speakers: matrixEntry?.speakers || 'unknown',
    zone,
    
    llm: {
      primary: llmConfig.primary,
      fallback: llmConfig.fallback,
      quality: llmConfig.quality,
      reason: getLLMReason(),
      isRTL,
      isMoatLanguage,
      competitorGap,
      moat,
      zone,
    },
    
    translation: {
      primary: translationConfig.primary,
      fallback: translationConfig.fallback,
      quality: translationConfig.quality,
      reason: getTranslationReason(),
      isRTL,
      isMoatLanguage,
      competitorGap,
      moat,
    },
    
    tts: {
      primary: ttsConfig.primary,
      fallback: ttsConfig.fallback,
      quality: ttsConfig.quality,
      reason: getTTSReason(),
      isRTL,
      isMoatLanguage,
      competitorGap,
      moat,
    },
    
    stt: {
      primary: sttConfig.primary,
      fallback: sttConfig.fallback,
      quality: sttConfig.quality,
      reason: isMoatLanguage ? 'MOAT language with specialized STT' : 'Standard STT routing',
      isRTL,
      isMoatLanguage,
      competitorGap,
      moat,
    },
    
    video: {
      primary: videoConfig.primary,
      fallback: videoConfig.fallback,
      quality: videoConfig.quality,
      reason: 'ModelsLab primary for video generation with RTL-aware subtitling',
      isRTL,
      isMoatLanguage,
      competitorGap,
      moat,
    },
    
    dubbing: {
      primary: ttsConfig.primary, // Dubbing uses same TTS provider
      fallback: ttsConfig.fallback,
      quality: ttsConfig.quality,
      reason: getTTSReason(),
      isRTL,
      isMoatLanguage,
      competitorGap,
      moat,
    },
    
    // Voice Clone follows TTS zone routing (same as dubbing)
    voiceClone: {
      primary: ttsConfig.primary,
      fallback: ttsConfig.fallback,
      quality: ttsConfig.quality,
      reason: `Voice Clone: ${getTTSReason()} - follows TTS zone routing`,
      isRTL,
      isMoatLanguage,
      competitorGap,
      moat,
      isGlobal: false, // Zone-based, same as TTS
    },
    
    // Avatar - Global routing (Alibaba Wan2.2 everywhere)
    avatar: {
      primary: AVATAR_PROVIDER_CONFIG.primary,
      fallback: AVATAR_PROVIDER_CONFIG.fallback,
      quality: AVATAR_PROVIDER_CONFIG.quality,
      reason: AVATAR_PROVIDER_CONFIG.reason,
      isRTL,
      isMoatLanguage: false,
      competitorGap: null,
      moat: null,
      isGlobal: true, // NOT zone-based
    },
    
    // Full-body Avatar - Global routing (Alibaba OmniAvatar, premium)
    fullBodyAvatar: {
      primary: FULL_BODY_AVATAR_PROVIDER_CONFIG.primary,
      fallback: FULL_BODY_AVATAR_PROVIDER_CONFIG.fallback,
      quality: FULL_BODY_AVATAR_PROVIDER_CONFIG.quality,
      reason: FULL_BODY_AVATAR_PROVIDER_CONFIG.reason,
      isRTL,
      isMoatLanguage: false,
      competitorGap: null,
      moat: null,
      isGlobal: true, // NOT zone-based
    },
    
    // Priority Rendering - Global routing (RunPod)
    priorityRendering: {
      primary: PRIORITY_RENDERING_PROVIDER_CONFIG.primary,
      fallback: PRIORITY_RENDERING_PROVIDER_CONFIG.fallback,
      quality: PRIORITY_RENDERING_PROVIDER_CONFIG.quality,
      reason: PRIORITY_RENDERING_PROVIDER_CONFIG.reason,
      isRTL,
      isMoatLanguage: false,
      competitorGap: null,
      moat: null,
      isGlobal: true, // NOT zone-based
    },
    
    marketAdvantage: isMoatLanguage 
      ? `Exclusive ${moat?.replace('_', ' ')} support - ${matrixEntry?.speakers} speakers`
      : `${translationConfig.quality >= 5 ? 'Premium' : 'Standard'} quality routing`,
    badge: getCompetitorGapBadge(competitorGap || 'match') as BadgeInfo,
  };
}

/**
 * Get provider for specific media type
 */
export function getProviderForMediaType(
  languageCode: string, 
  mediaType: MediaType
): ProviderRoute {
  const unified = getUnifiedProviderRouting(languageCode);
  return unified[mediaType];
}

/**
 * Get fallback chain for a language and media type
 */
export function getFallbackChain(
  languageCode: string,
  mediaType: MediaType,
  configuredProviders: Record<string, boolean>
): FallbackChain {
  const route = getProviderForMediaType(languageCode, mediaType);
  
  // Build full fallback chain
  const providers = [route.primary, route.fallback];
  
  // Add additional fallbacks based on media type
  if (mediaType === 'tts') {
    providers.push('google-tts', 'openai-tts');
  } else if (mediaType === 'translation') {
    providers.push('google-translate', 'ai-gemini');
  } else if (mediaType === 'stt') {
    providers.push('whisper', 'google-stt');
  }
  
  // Find first configured provider
  const selectedIndex = providers.findIndex(p => {
    const providerKey = p.replace(/-/g, '_').toUpperCase();
    return configuredProviders[p] || configuredProviders[providerKey] || true; // Default to true if not in list
  });
  
  const selectedProvider = providers[selectedIndex] || providers[0];
  
  return {
    providers,
    selectedProvider,
    selectedIndex: selectedIndex >= 0 ? selectedIndex : 0,
    reason: selectedIndex === 0 
      ? `Using primary provider: ${route.reason}`
      : `Fallback to ${selectedProvider}: Primary provider not configured`,
  };
}

/**
 * Check if language requires RTL layout
 */
export function requiresRTLLayout(languageCode: string): boolean {
  const baseCode = languageCode.split('-')[0];
  return RTL_LANGUAGES.has(languageCode) || RTL_LANGUAGES.has(baseCode);
}

/**
 * Get all supported languages with provider info
 */
export function getAllSupportedLanguages(): UnifiedProviderResult[] {
  return COMPLETE_LANGUAGE_MATRIX.map(entry => 
    getUnifiedProviderRouting(entry.code)
  );
}

/**
 * Get languages by moat type
 */
export function getLanguagesByMoat(moat: LanguageMoat): UnifiedProviderResult[] {
  return COMPLETE_LANGUAGE_MATRIX
    .filter(entry => entry.moat === moat)
    .map(entry => getUnifiedProviderRouting(entry.code));
}

/**
 * Get competitive advantage summary
 */
export function getCompetitiveAdvantageSummary() {
  return {
    moats: LANGUAGE_MOATS,
    totalLanguages: COMPLETE_LANGUAGE_MATRIX.length,
    moatLanguages: COMPLETE_LANGUAGE_MATRIX.filter(e => e.moat).length,
    rtlLanguages: [...RTL_LANGUAGES],
    providerCoverage: {
      elevenlabs: Object.entries(TTS_PROVIDER_MAP).filter(([_, v]) => v.primary === 'elevenlabs').length,
      azure: Object.entries(TTS_PROVIDER_MAP).filter(([_, v]) => v.primary === 'azure-neural').length,
      alibaba: Object.entries(TTS_PROVIDER_MAP).filter(([_, v]) => v.primary === 'alibaba-qwen3-tts').length,
      deepl: Object.entries(TRANSLATION_PROVIDER_MAP).filter(([_, v]) => v.primary === 'deepl').length,
      google: Object.entries(TRANSLATION_PROVIDER_MAP).filter(([_, v]) => v.primary === 'google-translate').length,
    },
  };
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const unifiedProviderRouter = {
  getUnifiedProviderRouting,
  getProviderForMediaType,
  getFallbackChain,
  requiresRTLLayout,
  getAllSupportedLanguages,
  getLanguagesByMoat,
  getCompetitiveAdvantageSummary,
  
  // Direct access to maps for edge functions
  TTS_PROVIDER_MAP,
  TRANSLATION_PROVIDER_MAP,
  STT_PROVIDER_MAP,
  VIDEO_PROVIDER_MAP,
  RTL_LANGUAGES,
};

export default unifiedProviderRouter;
