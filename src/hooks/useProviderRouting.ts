/**
 * useProviderRouting — Single Source of Truth for AI Provider Selection
 *
 * REPLACES: scattered provider defaults in ScriptPreviewPanel, AIModelsTab,
 * CreateTemplateDialog, and aiProvidersConfig.ts.
 *
 * ALL Genie Cast components MUST use this hook for provider selection.
 * Reads from master-provider-routing-registry.ts ONLY.
 *
 * Priority chain:
 *   1. User Override (localStorage per session)  → HIGHEST
 *   2. Template Config (Supabase per template)   → MEDIUM
 *   3. Master Registry (region-based defaults)   → LOWEST (always correct)
 *
 * @version 1.0.0
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  getTTSRouting,
  getVideoRouting,
  getImageRouting,
  getAvatarRouting,
  get3DRouting,
  getAudioRouting,
  getZoneForLanguage,
  getVideoRegionRouting,
  getAvatarRegionRouting,
  getTranslationRegionRouting,
  getImageRegionRouting,
  TTS_MASTER_ROUTING,
  RTL_LANGUAGES,
  ARABIC_DIALECTS,
  type RegionalZone,
  type TTSRoutingConfig,
} from '@/config/master-provider-routing-registry';

// ============================================
// TYPES
// ============================================

export type ProviderCapability =
  | 'tts' | 'video' | 'avatar' | 'image' | 'translation'
  | 'llm' | 'stt' | 'music' | 'sfx' | 'threeD' | 'arVr';

export interface ResolvedProvider {
  provider: string;
  fallbackChain: string[];
  model?: string;
}

export interface ResolvedTTSProvider extends ResolvedProvider {
  voiceId?: string;
  locale: string;
  visemeSupport: boolean;
  voiceClone?: string;
}

export interface ResolvedVideoProvider extends ResolvedProvider {
  videoType: string;
}

export interface ResolvedAvatarProvider extends ResolvedProvider {
  avatarType: string;
  lipSyncMethod: string;
}

export interface ResolvedTranslationProvider extends ResolvedProvider {
  isRTL: boolean;
}

export interface ProviderRoutingResult {
  // Resolved providers (respecting override → template → registry priority)
  tts: ResolvedTTSProvider;
  video: ResolvedVideoProvider;
  avatar: ResolvedAvatarProvider;
  image: ResolvedProvider;
  translation: ResolvedTranslationProvider;
  llm: ResolvedProvider;
  stt: ResolvedProvider;
  music: ResolvedProvider;
  sfx: ResolvedProvider;
  threeD: ResolvedProvider;
  arVr: ResolvedProvider;

  // Zone info
  zone: RegionalZone;
  languageCode: string;
  isRTL: boolean;

  // Override management
  overrides: Map<ProviderCapability, string>;
  setOverride: (capability: ProviderCapability, provider: string) => void;
  clearOverride: (capability: ProviderCapability) => void;
  clearAllOverrides: () => void;
  hasOverride: (capability: ProviderCapability) => boolean;
}

// ============================================
// STORAGE KEY
// ============================================
const STORAGE_KEY = 'genie-cast-provider-overrides';

function loadOverrides(): Map<ProviderCapability, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed) as [ProviderCapability, string][]);
    }
  } catch {
    // Ignore parse errors
  }
  return new Map();
}

function saveOverrides(overrides: Map<ProviderCapability, string>) {
  try {
    const obj = Object.fromEntries(overrides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore storage errors
  }
}

// ============================================
// TRANSLATION ROUTING (Region-based)
// ============================================
function getTranslationProvider(zone: RegionalZone, languageCode: string): ResolvedTranslationProvider {
  const baseLang = languageCode.split('-')[0];
  const isRTL = (RTL_LANGUAGES as readonly string[]).includes(languageCode) ||
    (RTL_LANGUAGES as readonly string[]).includes(baseLang);

  const routingMap: Record<string, { provider: string; chain: string[] }> = {
    // European languages → DeepL primary
    en: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    es: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    fr: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    de: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    it: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    nl: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    pt: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    pl: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    ru: { provider: 'deepl', chain: ['deepl', 'azure_translator', 'google_translate'] },
    // CJK → Alibaba Qwen-MT primary
    zh: { provider: 'alibaba_qwen_mt', chain: ['alibaba_qwen_mt', 'deepl', 'google_translate'] },
    ja: { provider: 'alibaba_qwen_mt', chain: ['alibaba_qwen_mt', 'deepl', 'google_translate'] },
    ko: { provider: 'alibaba_qwen_mt', chain: ['alibaba_qwen_mt', 'deepl', 'google_translate'] },
    // MENA/RTL → Azure Translator primary
    ar: { provider: 'azure_translator', chain: ['azure_translator', 'alibaba_qwen_mt', 'google_translate'] },
    he: { provider: 'azure_translator', chain: ['azure_translator', 'google_translate', 'deepl'] },
    fa: { provider: 'azure_translator', chain: ['azure_translator', 'google_translate', 'alibaba_qwen_mt'] },
    ur: { provider: 'azure_translator', chain: ['azure_translator', 'google_translate'] },
    // India/SEA/Africa → Google Translate primary
    hi: { provider: 'google_translate', chain: ['google_translate', 'azure_translator', 'deepl'] },
    bn: { provider: 'google_translate', chain: ['google_translate', 'azure_translator'] },
    ta: { provider: 'google_translate', chain: ['google_translate', 'azure_translator'] },
    te: { provider: 'google_translate', chain: ['google_translate', 'azure_translator'] },
    id: { provider: 'google_translate', chain: ['google_translate', 'azure_translator'] },
    vi: { provider: 'google_translate', chain: ['google_translate', 'azure_translator'] },
    th: { provider: 'google_translate', chain: ['google_translate', 'azure_translator'] },
    sw: { provider: 'google_translate', chain: ['google_translate', 'azure_translator'] },
  };

  const routing = routingMap[baseLang] || { provider: 'google_translate', chain: ['google_translate', 'azure_translator', 'aws_translate'] };

  return {
    provider: routing.provider,
    fallbackChain: routing.chain,
    isRTL,
  };
}

// ============================================
// LLM ROUTING (Zone-based)
// ============================================
function getLLMProvider(zone: RegionalZone): ResolvedProvider {
  const routingMap: Record<RegionalZone, { provider: string; model: string; chain: string[] }> = {
    claude_zone: { provider: 'claude', model: 'claude-4-sonnet', chain: ['claude', 'openai_gpt4o', 'gemini', 'deepseek'] },
    alibaba_zone: { provider: 'alibaba_qwen_max', model: 'qwen-max', chain: ['alibaba_qwen_max', 'openai_gpt4o', 'claude', 'deepseek'] },
    gemini_zone: { provider: 'gemini', model: 'gemini-3-pro', chain: ['gemini', 'openai_gpt4o', 'claude', 'deepseek'] },
    fallback_zone: { provider: 'openai_gpt4o', model: 'gpt-4o', chain: ['openai_gpt4o', 'claude', 'gemini', 'deepseek'] },
  };

  const routing = routingMap[zone];
  return { provider: routing.provider, model: routing.model, fallbackChain: routing.chain };
}

// ============================================
// MAIN HOOK
// ============================================
export function useProviderRouting(
  languageCode: string = 'en',
  templateOverrides?: Partial<Record<ProviderCapability, string>>,
): ProviderRoutingResult {
  const [overrides, setOverrides] = useState<Map<ProviderCapability, string>>(loadOverrides);

  // Persist overrides to localStorage
  useEffect(() => {
    saveOverrides(overrides);
  }, [overrides]);

  const zone = useMemo(() => getZoneForLanguage(languageCode), [languageCode]);

  const baseLang = languageCode.split('-')[0];
  const isRTL = useMemo(
    () => (RTL_LANGUAGES as readonly string[]).includes(languageCode) ||
      (RTL_LANGUAGES as readonly string[]).includes(baseLang),
    [languageCode, baseLang],
  );

  // Override management
  const setOverride = useCallback((capability: ProviderCapability, provider: string) => {
    setOverrides(prev => {
      const next = new Map(prev);
      next.set(capability, provider);
      return next;
    });
  }, []);

  const clearOverride = useCallback((capability: ProviderCapability) => {
    setOverrides(prev => {
      const next = new Map(prev);
      next.delete(capability);
      return next;
    });
  }, []);

  const clearAllOverrides = useCallback(() => {
    setOverrides(new Map());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasOverride = useCallback((capability: ProviderCapability) => overrides.has(capability), [overrides]);

  // Resolve effective provider: override → template → registry
  const resolve = useCallback(
    (capability: ProviderCapability, registryProvider: string): string => {
      return overrides.get(capability)
        ?? templateOverrides?.[capability]
        ?? registryProvider;
    },
    [overrides, templateOverrides],
  );

  // Resolve all providers
  const result = useMemo((): ProviderRoutingResult => {
    // TTS
    const ttsRouting = getTTSRouting(languageCode);
    const tts: ResolvedTTSProvider = {
      provider: resolve('tts', ttsRouting.primary),
      fallbackChain: [ttsRouting.primary, ttsRouting.secondary, ttsRouting.tertiary],
      locale: languageCode,
      visemeSupport: ttsRouting.visemeSupport,
      voiceClone: ttsRouting.voiceClone,
    };

    // Video — zone-specific routing (R-6 fix)
    const videoRegion = getVideoRegionRouting(zone);
    const video: ResolvedVideoProvider = {
      provider: resolve('video', videoRegion.primary),
      fallbackChain: [videoRegion.primary, videoRegion.secondary, videoRegion.tertiary],
      videoType: 'text_to_video',
    };

    // Avatar — zone-specific with RTL lip-sync routing (R-7 fix)
    const avatarRegion = getAvatarRegionRouting(zone);
    const avatar: ResolvedAvatarProvider = {
      provider: resolve('avatar', avatarRegion.primary),
      fallbackChain: [avatarRegion.primary, avatarRegion.secondary],
      avatarType: 'talking_head',
      lipSyncMethod: avatarRegion.lipSync,
    };

    // Image — zone-specific routing (R-12 fix)
    const imageRegion = getImageRegionRouting(zone);
    const image: ResolvedProvider = {
      provider: resolve('image', imageRegion.primary),
      fallbackChain: [imageRegion.primary, imageRegion.secondary, imageRegion.tertiary],
    };

    // Translation — zone-specific routing (R-8 fix)
    const translationRegion = getTranslationRegionRouting(zone);
    const translation: ResolvedTranslationProvider = {
      provider: resolve('translation', translationRegion.primary),
      fallbackChain: [translationRegion.primary, translationRegion.secondary, translationRegion.tertiary],
      isRTL,
    };

    // LLM
    const llmBase = getLLMProvider(zone);
    const llm: ResolvedProvider = {
      ...llmBase,
      provider: resolve('llm', llmBase.provider),
    };

    // STT
    const sttRouting = getAudioRouting('stt');
    const stt: ResolvedProvider = {
      provider: resolve('stt', zone === 'alibaba_zone' ? 'alibaba_paraformer' : sttRouting.primary),
      fallbackChain: [sttRouting.primary, sttRouting.secondary, sttRouting.tertiary, sttRouting.fallback],
    };

    // Music
    const musicRouting = getAudioRouting('music_generation');
    const music: ResolvedProvider = {
      provider: resolve('music', musicRouting.primary),
      fallbackChain: [musicRouting.primary, musicRouting.secondary, musicRouting.tertiary, musicRouting.fallback],
    };

    // SFX
    const sfxRouting = getAudioRouting('sfx_generation');
    const sfx: ResolvedProvider = {
      provider: resolve('sfx', sfxRouting.primary),
      fallbackChain: [sfxRouting.primary, sfxRouting.secondary, sfxRouting.tertiary, sfxRouting.fallback],
    };

    // 3D
    const threeDRouting = get3DRouting('text_to_3d');
    const threeD: ResolvedProvider = {
      provider: resolve('threeD', threeDRouting.primary),
      fallbackChain: [threeDRouting.primary, threeDRouting.secondary, threeDRouting.tertiary, threeDRouting.fallback],
    };

    // AR/VR
    const arVrRouting = get3DRouting('ar_avatar');
    const arVr: ResolvedProvider = {
      provider: resolve('arVr', arVrRouting.primary),
      fallbackChain: [arVrRouting.primary, arVrRouting.secondary, arVrRouting.tertiary, arVrRouting.fallback],
    };

    return {
      tts, video, avatar, image, translation, llm, stt, music, sfx, threeD, arVr,
      zone, languageCode, isRTL,
      overrides, setOverride, clearOverride, clearAllOverrides, hasOverride,
    };
  }, [languageCode, zone, isRTL, overrides, resolve, setOverride, clearOverride, clearAllOverrides, hasOverride]);

  return result;
}

// ============================================
// PROVIDER DISPLAY NAMES (for UI badges)
// ============================================
export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  azure_neural: 'Azure Neural',
  alibaba_qwen3_tts: 'Qwen3-TTS',
  elevenlabs: 'ElevenLabs',
  google_tts: 'Google TTS',
  openai_tts: 'OpenAI TTS',
  amazon_polly: 'Amazon Polly',
  vertex_veo3: 'Vertex Veo 3',
  sora2: 'Sora 2',
  alibaba_wan26: 'WAN 2.6',
  alibaba_wan22: 'WAN 2.2',
  modelslab: 'ModelsLab',
  replicate: 'Replicate',
  gemini_3_pro: 'Gemini 3 Pro',
  vertex_imagen3: 'Imagen 3',
  alibaba_wanx: 'WanX',
  openai_dalle: 'DALL-E 3',
  meshy_text2_3d: 'Meshy AI',
  alibaba_omniavatar: 'OmniAvatar',
  alibaba_taoavatar: 'TaoAvatar',
  alibaba_mach: 'MACH',
  azure_viseme: 'Azure Viseme',
  deepl: 'DeepL',
  alibaba_qwen_mt: 'Qwen-MT',
  azure_translator: 'Azure Translator',
  google_translate: 'Google Translate',
  aws_translate: 'AWS Translate',
  claude: 'Claude 4 Sonnet',
  alibaba_qwen_max: 'Qwen Max',
  gemini: 'Gemini 3 Pro',
  openai_gpt4o: 'GPT-4o',
  deepseek: 'DeepSeek V3',
  deepgram_nova2: 'Deepgram Nova 2',
  alibaba_paraformer: 'Paraformer',
  alibaba_funaudio: 'FunAudio',
  elevenlabs_music: '11Labs Music',
  elevenlabs_sfx: '11Labs SFX',
};

export function getProviderDisplayName(providerId: string): string {
  return PROVIDER_DISPLAY_NAMES[providerId] || providerId;
}

// ============================================
// CHARACTER LIMITS (Complete for all TTS providers)
// ============================================
export const TTS_CHARACTER_LIMITS: Record<string, { soft: number; hard: number }> = {
  azure_neural: { soft: 5000, hard: 10000 },
  alibaba_qwen3_tts: { soft: 2500, hard: 4000 },
  elevenlabs: { soft: 2000, hard: 3000 },
  google_tts: { soft: 5000, hard: 10000 },
  openai_tts: { soft: 4000, hard: 8000 },
  amazon_polly: { soft: 3000, hard: 6000 },
};

export function getTTSCharacterLimit(providerId: string): { soft: number; hard: number } {
  return TTS_CHARACTER_LIMITS[providerId] || { soft: 3000, hard: 5000 };
}
