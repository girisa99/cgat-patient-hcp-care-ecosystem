/**
 * Unified Provider Routing Adapter
 * 
 * Central hub for routing ALL media requests (Video, Audio, Translation, Multi-Language)
 * through the competitive language matrix and regional language service.
 * 
 * Ensures consistent provider selection with fallback chains across:
 * - Translation (DeepL, Google, Qwen-MT, Azure)
 * - TTS/Voice (ElevenLabs, Azure Neural, Alibaba CosyVoice, Google)
 * - STT (ElevenLabs Scribe, Azure, Google, Whisper)
 * - Video (ModelsLab, Replicate, Azure)
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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type MediaType = 'translation' | 'tts' | 'stt' | 'video' | 'image' | 'dubbing';

export interface ProviderRoute {
  primary: string;
  fallback: string;
  quality: number;
  reason: string;
  isRTL: boolean;
  isMoatLanguage: boolean;
  competitorGap: CompetitorGap | null;
  moat: LanguageMoat;
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
  
  // Provider routes by media type
  translation: ProviderRoute;
  tts: ProviderRoute;
  stt: ProviderRoute;
  video: ProviderRoute;
  dubbing: ProviderRoute;
  
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
// PROVIDER MAPPING (Based on Competitive Matrix Research)
// ============================================================================

// TTS Provider Mapping by Language
const TTS_PROVIDER_MAP: Record<string, { primary: string; fallback: string; quality: number }> = {
  // Arabic Dialects - MOAT (NO ONE has this)
  'ar': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ar-EG': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ar-SA': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ar-AE': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ar-MA': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ar-JO': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ar-IQ': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  
  // Indian Languages - MOAT (Competitors have 1-2 max)
  'hi': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'bn': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'te': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'ta': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'mr': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'kn': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'gu': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ml': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'pa': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'or': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  'as': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  'ur': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  
  // African Languages - FIRST MOVER (NO ONE has this)
  'sw': { primary: 'azure-neural', fallback: 'google-tts', quality: 5 },
  'yo': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ha': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  'ig': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  'zu': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'am': { primary: 'google-tts', fallback: 'azure-neural', quality: 4 },
  'xh': { primary: 'azure-neural', fallback: 'google-tts', quality: 3 },
  'af': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  
  // European - YOU WIN (ElevenLabs + DeepL)
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
  
  // CJK - Premium (Alibaba CosyVoice)
  'ja': { primary: 'alibaba-cosyvoice', fallback: 'azure-neural', quality: 5 },
  'ko': { primary: 'alibaba-cosyvoice', fallback: 'azure-neural', quality: 5 },
  'zh-CN': { primary: 'alibaba-cosyvoice', fallback: 'azure-neural', quality: 5 },
  'zh-TW': { primary: 'alibaba-cosyvoice', fallback: 'azure-neural', quality: 5 },
  'zh-HK': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  
  // Southeast Asia
  'th': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'vi': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'id': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'ms': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  
  // RTL Languages
  'he': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  'fa': { primary: 'azure-neural', fallback: 'google-tts', quality: 4 },
  
  // English variants
  'en': { primary: 'elevenlabs', fallback: 'openai-tts', quality: 5 },
  'en-US': { primary: 'elevenlabs', fallback: 'openai-tts', quality: 5 },
  'en-GB': { primary: 'elevenlabs', fallback: 'openai-tts', quality: 5 },
  'en-AU': { primary: 'elevenlabs', fallback: 'openai-tts', quality: 5 },
};

// Translation Provider Mapping by Language
const TRANSLATION_PROVIDER_MAP: Record<string, { primary: string; fallback: string; quality: number }> = {
  // European - DeepL Excellence
  'de': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'fr': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'es': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'it': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'pt': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'pt-BR': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'nl': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'pl': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  'ru': { primary: 'deepl', fallback: 'azure-translator', quality: 5 },
  
  // CJK - Qwen-MT / Alibaba
  'ja': { primary: 'qwen-mt', fallback: 'deepl', quality: 5 },
  'ko': { primary: 'qwen-mt', fallback: 'deepl', quality: 5 },
  'zh-CN': { primary: 'qwen-mt', fallback: 'google-translate', quality: 5 },
  'zh-TW': { primary: 'qwen-mt', fallback: 'google-translate', quality: 5 },
  
  // Arabic - Azure Translator
  'ar': { primary: 'azure-translator', fallback: 'google-translate', quality: 5 },
  'ar-EG': { primary: 'azure-translator', fallback: 'google-translate', quality: 5 },
  'ar-SA': { primary: 'azure-translator', fallback: 'google-translate', quality: 5 },
  
  // Indian - Google Translate (best coverage)
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
  
  // African - Google + NLLB
  'sw': { primary: 'google-translate', fallback: 'nllb', quality: 5 },
  'yo': { primary: 'google-translate', fallback: 'nllb', quality: 4 },
  'ha': { primary: 'google-translate', fallback: 'nllb', quality: 3 },
  'ig': { primary: 'google-translate', fallback: 'nllb', quality: 3 },
  'zu': { primary: 'google-translate', fallback: 'nllb', quality: 4 },
  'am': { primary: 'google-translate', fallback: 'nllb', quality: 4 },
  
  // Southeast Asia
  'th': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'vi': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  'id': { primary: 'google-translate', fallback: 'azure-translator', quality: 4 },
  
  // RTL
  'he': { primary: 'azure-translator', fallback: 'google-translate', quality: 4 },
  'fa': { primary: 'azure-translator', fallback: 'google-translate', quality: 4 },
  
  // Default English
  'en': { primary: 'deepl', fallback: 'google-translate', quality: 5 },
};

// STT Provider Mapping
const STT_PROVIDER_MAP: Record<string, { primary: string; fallback: string; quality: number }> = {
  // European
  'en': { primary: 'elevenlabs-scribe', fallback: 'whisper', quality: 5 },
  'de': { primary: 'deepgram', fallback: 'azure-stt', quality: 5 },
  'fr': { primary: 'deepgram', fallback: 'azure-stt', quality: 5 },
  'es': { primary: 'elevenlabs-scribe', fallback: 'azure-stt', quality: 5 },
  
  // CJK
  'ja': { primary: 'alibaba-paraformer', fallback: 'google-stt', quality: 5 },
  'ko': { primary: 'alibaba-paraformer', fallback: 'google-stt', quality: 5 },
  'zh-CN': { primary: 'alibaba-paraformer', fallback: 'google-stt', quality: 5 },
  
  // Arabic
  'ar': { primary: 'azure-stt', fallback: 'google-stt', quality: 5 },
  
  // Indian
  'hi': { primary: 'azure-stt', fallback: 'google-stt', quality: 5 },
  'bn': { primary: 'azure-stt', fallback: 'google-stt', quality: 4 },
  'te': { primary: 'azure-stt', fallback: 'google-stt', quality: 4 },
  'ta': { primary: 'azure-stt', fallback: 'google-stt', quality: 4 },
  
  // African
  'sw': { primary: 'azure-stt', fallback: 'google-stt', quality: 4 },
  'am': { primary: 'google-stt', fallback: 'azure-stt', quality: 4 },
};

// Video Provider Mapping (for AI video generation with narration)
const VIDEO_PROVIDER_MAP: Record<string, { primary: string; fallback: string; quality: number }> = {
  // Global - ModelsLab primary
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
  
  // Get TTS provider
  const ttsConfig = TTS_PROVIDER_MAP[languageCode] || TTS_PROVIDER_MAP[baseCode] || 
    { primary: 'azure-neural', fallback: 'google-tts', quality: 3 };
  
  // Get Translation provider
  const translationConfig = TRANSLATION_PROVIDER_MAP[languageCode] || TRANSLATION_PROVIDER_MAP[baseCode] ||
    { primary: 'google-translate', fallback: 'azure-translator', quality: 3 };
  
  // Get STT provider
  const sttConfig = STT_PROVIDER_MAP[languageCode] || STT_PROVIDER_MAP[baseCode] ||
    { primary: 'azure-stt', fallback: 'google-stt', quality: 3 };
  
  // Get Video provider
  const videoConfig = VIDEO_PROVIDER_MAP[languageCode] || VIDEO_PROVIDER_MAP[baseCode] ||
    { primary: 'modelslab', fallback: 'replicate', quality: 4 };
  
  const isMoatLanguage = matrixEntry?.moat !== null && matrixEntry?.moat !== undefined;
  const competitorGap = matrixEntry?.competitorGap || null;
  const moat = matrixEntry?.moat || null;
  
  // Build reason strings
  const getTTSReason = () => {
    if (isMoatLanguage) {
      if (moat === 'arabic_dialects') return 'MOAT: 7 Arabic dialects - NO competitors have this';
      if (moat === 'indian_languages') return 'MOAT: 22 Indian languages - competitors have 1-2 max';
      if (moat === 'african_languages') return 'FIRST MOVER: African languages - NO competitors';
    }
    if (baseCode === 'ja' || baseCode === 'ko' || baseCode.startsWith('zh')) {
      return 'Premium: Alibaba CosyVoice for native CJK handling';
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
  
  return {
    languageCode,
    languageName: matrixEntry?.name || languageCode,
    nativeName: matrixEntry?.nativeName || languageCode,
    direction: isRTL ? 'rtl' : 'ltr',
    region: matrixEntry?.region || 'unknown',
    speakers: matrixEntry?.speakers || 'unknown',
    
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
    
    marketAdvantage: isMoatLanguage 
      ? `Exclusive ${moat?.replace('_', ' ')} support - ${matrixEntry?.speakers} speakers`
      : `${translationConfig.quality >= 5 ? 'Premium' : 'Standard'} quality routing`,
    badge: getCompetitorGapBadge(competitorGap || 'match'),
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
      alibaba: Object.entries(TTS_PROVIDER_MAP).filter(([_, v]) => v.primary === 'alibaba-cosyvoice').length,
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
