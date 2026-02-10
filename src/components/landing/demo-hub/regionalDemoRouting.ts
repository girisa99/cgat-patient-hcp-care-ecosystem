/**
 * Shared Regional Demo Routing — 4-Zone Architecture
 * Source of truth: src/config/master-provider-routing-registry.ts
 * 
 * Claude Zone (Western/EU/LATAM): Claude 3.5 + Azure Neural + DeepL
 * Alibaba Zone (CJK): Qwen Max + CosyVoice + Qwen-MT
 * Alibaba Zone (MENA/RTL): Qwen Max + Azure Neural + Azure Translator
 * Gemini Zone (India/SEA/Africa): Gemini Pro + Azure Neural + Google Translate
 * Fallback: GPT-4o
 */

export interface RegionalProviderConfig {
  zone: string;
  llmProvider: string;
  llmModel: string;
  ttsProvider: string;
  imageProvider: string;
  videoProvider: string;
  avatarProvider: string;
  translationProvider: string;
  displayProviders: string[];
  displayColors: string[];
}

const ZONES: Record<string, RegionalProviderConfig> = {
  western: {
    zone: 'western',
    llmProvider: 'claude', llmModel: 'claude-3.5-sonnet',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'deepl',
    displayProviders: ['Claude 3.5', 'Azure Neural', 'Vertex Veo 3', 'DeepL'],
    displayColors: ['from-amber-500/80 to-amber-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-cyan-500/80 to-cyan-600/80'],
  },
  cjk: {
    zone: 'cjk',
    llmProvider: 'alibaba', llmModel: 'qwen-max',
    ttsProvider: 'alibaba_cosyvoice', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'qwen_mt',
    displayProviders: ['Qwen Max', 'CosyVoice', 'Vertex Veo 3', 'Qwen-MT'],
    displayColors: ['from-orange-500/80 to-orange-600/80', 'from-amber-500/80 to-amber-600/80', 'from-blue-500/80 to-blue-600/80', 'from-red-500/80 to-red-600/80'],
  },
  mena: {
    zone: 'mena',
    llmProvider: 'alibaba', llmModel: 'qwen-max',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'azure_translator',
    displayProviders: ['Qwen Max', 'Azure Neural (7 Arabic)', 'Vertex Veo 3', 'Azure Translator'],
    displayColors: ['from-orange-500/80 to-orange-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-emerald-500/80 to-emerald-600/80'],
  },
  india: {
    zone: 'india',
    llmProvider: 'gemini', llmModel: 'gemini-pro',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['Gemini Pro', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-blue-500/80 to-blue-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  africa: {
    zone: 'africa',
    llmProvider: 'gemini', llmModel: 'gemini-pro',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['Gemini Pro', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-blue-500/80 to-blue-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  fallback: {
    zone: 'fallback',
    llmProvider: 'openai', llmModel: 'gpt-4o',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['GPT-4o (Fallback)', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-emerald-500/80 to-emerald-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
};

// CJK languages
const CJK_LANGS = ['zh', 'ja', 'ko'];
// MENA/RTL languages
const MENA_LANGS = ['ar', 'he', 'fa', 'ur'];
// India/SEA/Africa languages
const INDIA_SEA_LANGS = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'id', 'vi', 'th', 'ms', 'sw', 'yo', 'am'];
// Western/EU languages
const WESTERN_LANGS = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'tr'];

/**
 * Get regional config from language code and/or region string
 * Follows LANGUAGE_TO_ZONE / ZONE_COUNTRIES from master-provider-routing-registry.ts
 */
export function getRegionalConfig(region?: string, lang?: string): RegionalProviderConfig {
  // Language-based detection first (most precise)
  if (lang) {
    const shortLang = lang.split('-')[0];
    if (CJK_LANGS.includes(shortLang)) return ZONES.cjk;
    if (MENA_LANGS.includes(shortLang)) return ZONES.mena;
    if (INDIA_SEA_LANGS.includes(shortLang)) return ZONES.india;
    if (WESTERN_LANGS.includes(shortLang)) return ZONES.western;
  }

  // Region-based detection
  if (region) {
    const r = region.toLowerCase();
    if (['apac', 'cjk', 'china', 'japan', 'korea'].some(z => r.includes(z))) return ZONES.cjk;
    if (['mena', 'arab', 'middle-east'].some(z => r.includes(z))) return ZONES.mena;
    if (['india', 'south-asia', 'sea', 'southeast'].some(z => r.includes(z))) return ZONES.india;
    if (['africa'].some(z => r.includes(z))) return ZONES.africa;
    if (['nam', 'europe', 'latam', 'caribbean'].some(z => r.includes(z))) return ZONES.western;
  }

  return ZONES.western; // Claude Zone default
}

/** RTL check for layout direction */
export function isRTLLanguage(lang: string): boolean {
  const short = lang.split('-')[0];
  return ['ar', 'he', 'fa', 'ur'].includes(short);
}

/** Map short lang code to BCP47 for TTS */
export function toLangBCP47(lang: string): string {
  const map: Record<string, string> = {
    en: 'en-US', ar: 'ar-SA', hi: 'hi-IN', zh: 'zh-CN',
    ja: 'ja-JP', ko: 'ko-KR', es: 'es-ES', fr: 'fr-FR',
    de: 'de-DE', pt: 'pt-BR', it: 'it-IT', nl: 'nl-NL',
    tr: 'tr-TR', ru: 'ru-RU', pl: 'pl-PL', sw: 'sw-KE',
    bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', id: 'id-ID',
    vi: 'vi-VN', th: 'th-TH', ms: 'ms-MY',
  };
  return map[lang] || `${lang}-${lang.toUpperCase()}`;
}

/** Standard language options for demo selectors */
export const DEMO_LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
];
