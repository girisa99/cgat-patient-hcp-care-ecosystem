/**
 * LOCALIZATION ORCHESTRATOR
 *
 * Orchestrates the auto-localization pipeline:
 *   English base → per-language script translation → TTS regeneration
 *   → text overlay translation → timeline reassembly
 *
 * Supports:
 *   - 85+ languages (via regional registry)
 *   - RTL text for Arabic/Hebrew/Urdu
 *   - Cultural adaptation (wardrobe, settings, greetings)
 *   - Per-language voice routing (regional TTS providers)
 *
 * @see src/config/universal-script-schema.ts — script contract
 * @see src/services/cast/projectPipelineGenerator.ts — pipeline config
 * @see src/utils/castTimelineEngine.ts — timeline assembly
 */

import type {
  UniversalEpisodeManifest,
  UniversalScriptLine,
  UniversalSceneDefinition,
  VoiceConfig,
  CulturalTraits,
} from '@/config/universal-script-schema';

// ─── LOCALIZATION TYPES ─────────────────────────────────────────────────────

/** Languages that use right-to-left text direction */
const RTL_LANGUAGES = new Set([
  'ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'ku', 'dv',
  'ar-SA', 'ar-AE', 'ar-EG', 'ar-MA', 'he-IL', 'fa-IR', 'ur-PK',
]);

/** Status of a single language localization */
export type LocalizationStatus =
  | 'pending'
  | 'translating'
  | 'tts-generating'
  | 'assembling'
  | 'completed'
  | 'failed';

/** Localized variant of the base production */
export interface LocalizedVariant {
  /** Target language code (BCP47) */
  language: string;
  /** Localization status */
  status: LocalizationStatus;
  /** Translated script lines */
  scriptLines: Record<string, UniversalScriptLine>;
  /** Language-specific voice routing */
  voiceRouting: Record<string, VoiceConfig>;
  /** Cultural adaptations applied */
  culturalAdaptations: CulturalTraits;
  /** Whether this language is RTL */
  isRTL: boolean;
  /** Storage paths for localized assets */
  storagePaths: {
    ttsPrefix: string;
    assemblyPrefix: string;
  };
  /** Error message if failed */
  error?: string;
  /** Progress percentage (0-100) */
  progress: number;
}

/** Full localization plan for a project */
export interface LocalizationPlan {
  /** Base manifest (English source) */
  baseManifest: UniversalEpisodeManifest;
  /** Target languages */
  targetLanguages: string[];
  /** Localized variants (one per language) */
  variants: Record<string, LocalizedVariant>;
  /** Which assets are shared across languages (music = universal) */
  sharedAssets: {
    music: boolean;
    sfx: boolean;
    visuals: boolean;
  };
  /** Overall progress */
  overallProgress: number;
}

// ─── LANGUAGE → VOICE PROVIDER MAPPING ──────────────────────────────────────

/** Regional voice provider preferences by language zone */
const LANGUAGE_VOICE_MAP: Record<string, { provider: VoiceConfig['provider']; voiceHints: string[] }> = {
  // Latin/European → ElevenLabs primary, Azure fallback
  'en': { provider: 'elevenlabs', voiceHints: ['Brian', 'Rachel'] },
  'es': { provider: 'elevenlabs', voiceHints: ['Pedro', 'Isabel'] },
  'fr': { provider: 'elevenlabs', voiceHints: ['Jacques', 'Claire'] },
  'de': { provider: 'elevenlabs', voiceHints: ['Hans', 'Greta'] },
  'it': { provider: 'elevenlabs', voiceHints: ['Marco', 'Sofia'] },
  'pt': { provider: 'elevenlabs', voiceHints: ['Miguel', 'Ana'] },
  'nl': { provider: 'azure', voiceHints: ['nl-NL-MaartenNeural'] },
  'pl': { provider: 'azure', voiceHints: ['pl-PL-MarekNeural'] },
  'ro': { provider: 'azure', voiceHints: ['ro-RO-EmilNeural'] },

  // CJK → Alibaba CosyVoice primary
  'zh': { provider: 'alibaba', voiceHints: ['longxiaochun', 'longxiaoxia'] },
  'ja': { provider: 'alibaba', voiceHints: ['longyue_jp', 'longyuki_jp'] },
  'ko': { provider: 'azure', voiceHints: ['ko-KR-InJoonNeural'] },

  // South/Southeast Asian → Alibaba or Azure
  'hi': { provider: 'azure', voiceHints: ['hi-IN-MadhurNeural'] },
  'bn': { provider: 'azure', voiceHints: ['bn-IN-BashkarNeural'] },
  'ta': { provider: 'azure', voiceHints: ['ta-IN-ValluvarNeural'] },
  'te': { provider: 'azure', voiceHints: ['te-IN-MohanNeural'] },
  'th': { provider: 'azure', voiceHints: ['th-TH-NiwatNeural'] },
  'vi': { provider: 'azure', voiceHints: ['vi-VN-NamMinhNeural'] },
  'id': { provider: 'azure', voiceHints: ['id-ID-ArdiNeural'] },
  'ms': { provider: 'azure', voiceHints: ['ms-MY-OsmanNeural'] },

  // MENA → Azure or Alibaba
  'ar': { provider: 'azure', voiceHints: ['ar-SA-HamedNeural'] },
  'he': { provider: 'azure', voiceHints: ['he-IL-AvriNeural'] },
  'fa': { provider: 'azure', voiceHints: ['fa-IR-FaridNeural'] },
  'ur': { provider: 'azure', voiceHints: ['ur-PK-AsadNeural'] },
  'tr': { provider: 'azure', voiceHints: ['tr-TR-AhmetNeural'] },

  // Eurasian
  'ru': { provider: 'azure', voiceHints: ['ru-RU-DmitryNeural'] },
  'uk': { provider: 'azure', voiceHints: ['uk-UA-OstapNeural'] },
};

// ─── ORCHESTRATOR FUNCTIONS ─────────────────────────────────────────────────

/**
 * Create a localization plan for a base manifest.
 * This is the first step — creates the plan structure without executing.
 */
export function createLocalizationPlan(
  baseManifest: UniversalEpisodeManifest,
  targetLanguages: string[]
): LocalizationPlan {
  const variants: Record<string, LocalizedVariant> = {};

  for (const lang of targetLanguages) {
    const baseLang = lang.split('-')[0]; // 'en-US' → 'en'
    const isRTL = RTL_LANGUAGES.has(lang) || RTL_LANGUAGES.has(baseLang);

    variants[lang] = {
      language: lang,
      status: 'pending',
      scriptLines: {},
      voiceRouting: buildVoiceRouting(baseManifest, lang),
      culturalAdaptations: buildCulturalAdaptations(lang),
      isRTL,
      storagePaths: {
        ttsPrefix: `${baseManifest.id}/localized/${lang}/tts`,
        assemblyPrefix: `${baseManifest.id}/localized/${lang}/assembly`,
      },
      progress: 0,
    };
  }

  return {
    baseManifest,
    targetLanguages,
    variants,
    sharedAssets: {
      music: true, // Instrumental music is universal
      sfx: true,   // SFX are universal
      visuals: true, // Base visuals stay the same (only text overlays change)
    },
    overallProgress: 0,
  };
}

/**
 * Build voice routing for a target language.
 * Maps each character to the best available voice provider for that language.
 */
function buildVoiceRouting(
  baseManifest: UniversalEpisodeManifest,
  targetLanguage: string
): Record<string, VoiceConfig> {
  const baseLang = targetLanguage.split('-')[0];
  const langVoice = LANGUAGE_VOICE_MAP[baseLang] || LANGUAGE_VOICE_MAP['en'];
  const routing: Record<string, VoiceConfig> = {};

  for (const [charKey, baseVoice] of Object.entries(baseManifest.voiceRouting)) {
    routing[charKey] = {
      ...baseVoice,
      provider: langVoice.provider,
      voiceId: langVoice.voiceHints[0] || '',
      fallbackProvider: 'azure',
      fallbackVoice: `${targetLanguage}-Neural`,
      locale: targetLanguage,
    };
  }

  return routing;
}

/**
 * Build cultural adaptations for a target language.
 */
function buildCulturalAdaptations(targetLanguage: string): CulturalTraits {
  const baseLang = targetLanguage.split('-')[0];
  const isRTL = RTL_LANGUAGES.has(targetLanguage) || RTL_LANGUAGES.has(baseLang);

  // Basic cultural traits by language group
  const traits: Record<string, Partial<CulturalTraits>> = {
    'ar': { isRTL: true, greeting: 'السلام عليكم', colorPalette: 'desert-gold' },
    'he': { isRTL: true, greeting: 'שלום', colorPalette: 'mediterranean-blue' },
    'fa': { isRTL: true, greeting: 'سلام', colorPalette: 'persian-rose' },
    'ur': { isRTL: true, greeting: 'السلام علیکم', colorPalette: 'emerald-green' },
    'hi': { greeting: 'नमस्ते', colorPalette: 'saffron-green' },
    'zh': { greeting: '你好', colorPalette: 'imperial-red' },
    'ja': { greeting: 'こんにちは', colorPalette: 'cherry-blossom' },
    'ko': { greeting: '안녕하세요', colorPalette: 'celadon-blue' },
    'es': { greeting: 'Hola', colorPalette: 'warm-terracotta' },
    'fr': { greeting: 'Bonjour', colorPalette: 'french-blue' },
    'de': { greeting: 'Hallo', colorPalette: 'forest-green' },
    'pt': { greeting: 'Olá', colorPalette: 'tropical-green' },
    'ru': { greeting: 'Здравствуйте', colorPalette: 'deep-red' },
  };

  return {
    isRTL,
    ...(traits[baseLang] || {}),
  };
}

/**
 * Translate script lines for a target language.
 * This is a placeholder that returns the structure — actual translation
 * is done by calling the AI provider (via edge function).
 */
export function prepareTranslationPayload(
  baseManifest: UniversalEpisodeManifest,
  targetLanguage: string
): {
  lines: Array<{ key: string; sourceText: string; voice: string; direction: string }>;
  targetLanguage: string;
  context: string;
} {
  const lines = Object.values(baseManifest.scriptLines).map(line => ({
    key: line.key,
    sourceText: line.text,
    voice: line.voice,
    direction: line.direction,
  }));

  return {
    lines,
    targetLanguage,
    context: `${baseManifest.title} — ${baseManifest.purpose} for ${baseManifest.product}`,
  };
}

/**
 * Apply translated lines back to a localized variant.
 */
export function applyTranslations(
  variant: LocalizedVariant,
  baseManifest: UniversalEpisodeManifest,
  translations: Array<{ key: string; translatedText: string }>
): LocalizedVariant {
  const translatedLines: Record<string, UniversalScriptLine> = {};

  for (const { key, translatedText } of translations) {
    const baseLine = baseManifest.scriptLines[key];
    if (baseLine) {
      translatedLines[key] = {
        ...baseLine,
        text: translatedText,
        regionCode: variant.language,
        culturalTraits: variant.culturalAdaptations,
      };
    }
  }

  return {
    ...variant,
    scriptLines: translatedLines,
    status: 'tts-generating',
    progress: 30,
  };
}

/**
 * Build a localized manifest from a base manifest + translated variant.
 * This creates a complete manifest that can be sent to the orchestrator.
 */
export function buildLocalizedManifest(
  baseManifest: UniversalEpisodeManifest,
  variant: LocalizedVariant
): UniversalEpisodeManifest {
  return {
    ...baseManifest,
    id: `${baseManifest.id}-${variant.language}`,
    language: variant.language,
    regionCode: variant.language,
    scriptLines: variant.scriptLines,
    voiceRouting: variant.voiceRouting,
    storagePaths: {
      ...baseManifest.storagePaths,
      ttsPrefix: variant.storagePaths.ttsPrefix,
    },
  };
}

/**
 * Check if a language requires RTL text handling.
 */
export function isRTLLanguage(language: string): boolean {
  const baseLang = language.split('-')[0];
  return RTL_LANGUAGES.has(language) || RTL_LANGUAGES.has(baseLang);
}

/**
 * Get available voice providers for a language.
 */
export function getVoiceProvidersForLanguage(language: string): {
  primary: { provider: string; voiceHints: string[] };
  fallback: { provider: string };
} {
  const baseLang = language.split('-')[0];
  const langVoice = LANGUAGE_VOICE_MAP[baseLang] || LANGUAGE_VOICE_MAP['en'];

  return {
    primary: langVoice,
    fallback: { provider: 'azure' },
  };
}

/**
 * Calculate localization progress across all variants.
 */
export function calculateOverallProgress(plan: LocalizationPlan): number {
  const variants = Object.values(plan.variants);
  if (variants.length === 0) return 0;
  const totalProgress = variants.reduce((sum, v) => sum + v.progress, 0);
  return Math.round(totalProgress / variants.length);
}
