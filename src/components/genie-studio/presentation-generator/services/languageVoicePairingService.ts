/**
 * Language-Voice Pairing Service
 * Enforces language-specific voice provider selection with multi-provider support
 * 
 * Providers: ElevenLabs, Azure, Alibaba, Google, AWS, OpenAI
 */

import { GlobalTier } from './tierAudioProviderService';

export type VoiceQuality = 'standard' | 'neural' | 'premium' | 'ultra';

export interface LanguageVoiceConfig {
  languageCode: string;
  languageName: string;
  region?: string;
  providers: {
    tier1: ProviderVoiceMapping[];
    tier2: ProviderVoiceMapping[];
    tier3: ProviderVoiceMapping[];
  };
  defaultVoiceGender?: 'male' | 'female' | 'neutral';
}

export interface ProviderVoiceMapping {
  providerId: string;
  providerName: string;
  voiceId: string;
  voiceName: string;
  quality: VoiceQuality;
  gender: 'male' | 'female' | 'neutral';
  isRecommended?: boolean;
  supportsCloning?: boolean;
  supportsSSML?: boolean;
  specialization?: string; // e.g., 'business', 'casual', 'news'
}

// Comprehensive language-voice pairings with all providers
export const COMPREHENSIVE_LANGUAGE_VOICE_PAIRINGS: LanguageVoiceConfig[] = [
  // ==========================================
  // CJK LANGUAGES - Alibaba/Azure prioritized
  // ==========================================
  {
    languageCode: 'zh-CN',
    languageName: 'Chinese (Simplified)',
    region: 'Mainland China',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'cmn-CN-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female', supportsSSML: true },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Zhiyu', voiceName: 'Zhiyu', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'alibaba-qwen3-tts', providerName: 'Alibaba Qwen3-TTS', voiceId: 'longxiaochun', voiceName: 'Xiaochun', quality: 'neural', gender: 'female', isRecommended: true, specialization: 'business' },
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'zh-CN-XiaoxiaoNeural', voiceName: 'Xiaoxiao', quality: 'neural', gender: 'female', supportsSSML: true },
        { providerId: 'google-wavenet', providerName: 'Google WaveNet', voiceId: 'cmn-CN-Wavenet-A', voiceName: 'WaveNet Female', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'alibaba-qwen3-tts-pro', providerName: 'Alibaba Qwen3-TTS Pro', voiceId: 'longxiaochun-pro', voiceName: 'Xiaochun Pro', quality: 'premium', gender: 'female', isRecommended: true, supportsCloning: true },
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'zh-CN-XiaoxiaoMultilingualNeural', voiceName: 'Xiaoxiao HD', quality: 'premium', gender: 'female' },
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'chinese-female-1', voiceName: 'Chinese Female', quality: 'premium', gender: 'female', supportsCloning: true },
      ],
    },
    defaultVoiceGender: 'female',
  },
  {
    languageCode: 'zh-TW',
    languageName: 'Chinese (Traditional)',
    region: 'Taiwan',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'cmn-TW-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
      ],
      tier2: [
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'zh-TW-HsiaoChenNeural', voiceName: 'HsiaoChen', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'google-wavenet', providerName: 'Google WaveNet', voiceId: 'cmn-TW-Wavenet-A', voiceName: 'WaveNet Female', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'zh-TW-HsiaoChenNeural', voiceName: 'HsiaoChen HD', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'chinese-tw-female', voiceName: 'TW Female', quality: 'premium', gender: 'female' },
      ],
    },
  },
  {
    languageCode: 'ja',
    languageName: 'Japanese',
    region: 'Japan',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'ja-JP-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Mizuki', voiceName: 'Mizuki', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'ja-JP-NanamiNeural', voiceName: 'Nanami', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'google-wavenet', providerName: 'Google WaveNet', voiceId: 'ja-JP-Wavenet-A', voiceName: 'WaveNet Female', quality: 'neural', gender: 'female' },
        { providerId: 'openai-tts', providerName: 'OpenAI TTS', voiceId: 'nova', voiceName: 'Nova', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'ja-JP-NanamiNeural', voiceName: 'Nanami HD', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'jp-female-1', voiceName: 'Japanese Female', quality: 'premium', gender: 'female', supportsCloning: true },
      ],
    },
    defaultVoiceGender: 'female',
  },
  {
    languageCode: 'ko',
    languageName: 'Korean',
    region: 'South Korea',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'ko-KR-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Seoyeon', voiceName: 'Seoyeon', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'ko-KR-SunHiNeural', voiceName: 'SunHi', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'google-wavenet', providerName: 'Google WaveNet', voiceId: 'ko-KR-Wavenet-A', voiceName: 'WaveNet Female', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'ko-KR-SunHiNeural', voiceName: 'SunHi HD', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'ko-female-1', voiceName: 'Korean Female', quality: 'premium', gender: 'female' },
      ],
    },
  },

  // ==========================================
  // EUROPEAN LANGUAGES - ElevenLabs/Azure prioritized
  // ==========================================
  {
    languageCode: 'en-US',
    languageName: 'English (US)',
    region: 'United States',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'en-US-Standard-C', voiceName: 'Standard Female', quality: 'standard', gender: 'female', supportsSSML: true },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Joanna', voiceName: 'Joanna', quality: 'neural', gender: 'female' },
        { providerId: 'openai-tts', providerName: 'OpenAI TTS', voiceId: 'alloy', voiceName: 'Alloy', quality: 'neural', gender: 'neutral' },
      ],
      tier2: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'JBFqnCBsd6RMkjVDRZzb', voiceName: 'George', quality: 'neural', gender: 'male', isRecommended: true, supportsCloning: true },
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'en-US-JennyNeural', voiceName: 'Jenny', quality: 'neural', gender: 'female', supportsSSML: true },
        { providerId: 'google-wavenet', providerName: 'Google WaveNet', voiceId: 'en-US-Wavenet-C', voiceName: 'WaveNet Female', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'pNInz6obpgDQGcFmaJgB', voiceName: 'Adam', quality: 'premium', gender: 'male', isRecommended: true, supportsCloning: true },
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'en-US-AriaNeural', voiceName: 'Aria HD', quality: 'premium', gender: 'female' },
        { providerId: 'playht', providerName: 'PlayHT', voiceId: 'en-US-female-pro', voiceName: 'Pro Female', quality: 'ultra', gender: 'female' },
      ],
    },
    defaultVoiceGender: 'female',
  },
  {
    languageCode: 'en-GB',
    languageName: 'English (UK)',
    region: 'United Kingdom',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'en-GB-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Amy', voiceName: 'Amy', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'ThT5KcBeYPX3keUQqHPh', voiceName: 'Dorothy', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'en-GB-SoniaNeural', voiceName: 'Sonia', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'british-premium', voiceName: 'British Pro', quality: 'premium', gender: 'male', isRecommended: true, supportsCloning: true },
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'en-GB-SoniaNeural', voiceName: 'Sonia HD', quality: 'premium', gender: 'female' },
      ],
    },
  },
  {
    languageCode: 'es',
    languageName: 'Spanish',
    region: 'Spain',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'es-ES-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Lucia', voiceName: 'Lucia', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'spanish-female-1', voiceName: 'Spanish Female', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'es-ES-ElviraNeural', voiceName: 'Elvira', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'spanish-premium', voiceName: 'Spanish Pro', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'es-ES-ElviraNeural', voiceName: 'Elvira HD', quality: 'premium', gender: 'female' },
      ],
    },
  },
  {
    languageCode: 'fr',
    languageName: 'French',
    region: 'France',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'fr-FR-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Celine', voiceName: 'Celine', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'french-female-1', voiceName: 'French Female', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'fr-FR-DeniseNeural', voiceName: 'Denise', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'french-premium', voiceName: 'French Pro', quality: 'premium', gender: 'female', isRecommended: true, supportsCloning: true },
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'fr-FR-DeniseNeural', voiceName: 'Denise HD', quality: 'premium', gender: 'female' },
      ],
    },
  },
  {
    languageCode: 'de',
    languageName: 'German',
    region: 'Germany',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'de-DE-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Marlene', voiceName: 'Marlene', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'german-female-1', voiceName: 'German Female', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'de-DE-KatjaNeural', voiceName: 'Katja', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'german-premium', voiceName: 'German Pro', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'de-DE-KatjaNeural', voiceName: 'Katja HD', quality: 'premium', gender: 'female' },
      ],
    },
  },

  // ==========================================
  // MIDDLE EAST & SOUTH ASIA - Azure/Google prioritized
  // ==========================================
  {
    languageCode: 'ar',
    languageName: 'Arabic',
    region: 'Saudi Arabia',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'ar-XA-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Zeina', voiceName: 'Zeina', quality: 'standard', gender: 'female' },
      ],
      tier2: [
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'ar-SA-HamedNeural', voiceName: 'Hamed', quality: 'neural', gender: 'male', isRecommended: true },
        { providerId: 'google-wavenet', providerName: 'Google WaveNet', voiceId: 'ar-XA-Wavenet-A', voiceName: 'WaveNet Female', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'ar-SA-ZariyahNeural', voiceName: 'Zariyah HD', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'arabic-female', voiceName: 'Arabic Female', quality: 'premium', gender: 'female' },
      ],
    },
  },
  {
    languageCode: 'hi',
    languageName: 'Hindi',
    region: 'India',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'hi-IN-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Aditi', voiceName: 'Aditi', quality: 'standard', gender: 'female' },
      ],
      tier2: [
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'hi-IN-SwaraNeural', voiceName: 'Swara', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'google-wavenet', providerName: 'Google WaveNet', voiceId: 'hi-IN-Wavenet-A', voiceName: 'WaveNet Female', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'hi-IN-SwaraNeural', voiceName: 'Swara HD', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'hindi-female', voiceName: 'Hindi Female', quality: 'premium', gender: 'female' },
      ],
    },
  },

  // ==========================================
  // ADDITIONAL LANGUAGES
  // ==========================================
  {
    languageCode: 'pt-BR',
    languageName: 'Portuguese (Brazil)',
    region: 'Brazil',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'pt-BR-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Vitoria', voiceName: 'Vitoria', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'portuguese-br-female', voiceName: 'Brazilian Female', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'pt-BR-FranciscaNeural', voiceName: 'Francisca', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'portuguese-br-premium', voiceName: 'Brazilian Pro', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'pt-BR-FranciscaNeural', voiceName: 'Francisca HD', quality: 'premium', gender: 'female' },
      ],
    },
  },
  {
    languageCode: 'it',
    languageName: 'Italian',
    region: 'Italy',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'it-IT-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Carla', voiceName: 'Carla', quality: 'neural', gender: 'female' },
      ],
      tier2: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'italian-female', voiceName: 'Italian Female', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'it-IT-ElsaNeural', voiceName: 'Elsa', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'italian-premium', voiceName: 'Italian Pro', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'it-IT-ElsaNeural', voiceName: 'Elsa HD', quality: 'premium', gender: 'female' },
      ],
    },
  },
  {
    languageCode: 'ru',
    languageName: 'Russian',
    region: 'Russia',
    providers: {
      tier1: [
        { providerId: 'google-standard', providerName: 'Google TTS', voiceId: 'ru-RU-Standard-A', voiceName: 'Standard Female', quality: 'standard', gender: 'female' },
        { providerId: 'aws-polly', providerName: 'AWS Polly', voiceId: 'Tatyana', voiceName: 'Tatyana', quality: 'standard', gender: 'female' },
      ],
      tier2: [
        { providerId: 'azure-neural', providerName: 'Azure Neural', voiceId: 'ru-RU-SvetlanaNeural', voiceName: 'Svetlana', quality: 'neural', gender: 'female', isRecommended: true },
        { providerId: 'google-wavenet', providerName: 'Google WaveNet', voiceId: 'ru-RU-Wavenet-A', voiceName: 'WaveNet Female', quality: 'neural', gender: 'female' },
      ],
      tier3: [
        { providerId: 'azure-neural-hd', providerName: 'Azure Neural HD', voiceId: 'ru-RU-SvetlanaNeural', voiceName: 'Svetlana HD', quality: 'premium', gender: 'female', isRecommended: true },
        { providerId: 'elevenlabs', providerName: 'ElevenLabs', voiceId: 'russian-female', voiceName: 'Russian Female', quality: 'premium', gender: 'female' },
      ],
    },
  },
];

// Get voice config for language and tier
export function getVoiceForLanguage(
  languageCode: string,
  tier: GlobalTier,
  preferredGender?: 'male' | 'female' | 'neutral'
): ProviderVoiceMapping | null {
  // Normalize language code (e.g., 'en' -> 'en-US')
  const normalizedCode = normalizeLanguageCode(languageCode);
  
  const langConfig = COMPREHENSIVE_LANGUAGE_VOICE_PAIRINGS.find(
    l => l.languageCode === normalizedCode || l.languageCode.startsWith(languageCode)
  );
  
  if (!langConfig) {
    // Fallback to English US if language not found
    return getVoiceForLanguage('en-US', tier, preferredGender);
  }
  
  const tierKey = `tier${tier}` as 'tier1' | 'tier2' | 'tier3';
  const providers = langConfig.providers[tierKey];
  
  if (!providers || providers.length === 0) {
    // Fall back to lower tier
    if (tier > 1) {
      return getVoiceForLanguage(languageCode, (tier - 1) as GlobalTier, preferredGender);
    }
    return null;
  }
  
  // Find recommended or matching gender
  const gender = preferredGender || langConfig.defaultVoiceGender || 'female';
  
  // First try recommended with matching gender
  let voice = providers.find(p => p.isRecommended && p.gender === gender);
  
  // Then any recommended
  if (!voice) {
    voice = providers.find(p => p.isRecommended);
  }
  
  // Then matching gender
  if (!voice) {
    voice = providers.find(p => p.gender === gender);
  }
  
  // Finally, first available
  return voice || providers[0] || null;
}

// Normalize language code
function normalizeLanguageCode(code: string): string {
  const mappings: Record<string, string> = {
    'en': 'en-US',
    'zh': 'zh-CN',
    'pt': 'pt-BR',
    'es-MX': 'es',
    'es-LA': 'es',
  };
  return mappings[code] || code;
}

// Get all voices for a language across all tiers
export function getAllVoicesForLanguage(languageCode: string): ProviderVoiceMapping[] {
  const normalizedCode = normalizeLanguageCode(languageCode);
  
  const langConfig = COMPREHENSIVE_LANGUAGE_VOICE_PAIRINGS.find(
    l => l.languageCode === normalizedCode || l.languageCode.startsWith(languageCode)
  );
  
  if (!langConfig) return [];
  
  return [
    ...langConfig.providers.tier1,
    ...langConfig.providers.tier2,
    ...langConfig.providers.tier3,
  ];
}

// Get recommended provider for multi-language audio orchestration
export function getMultiLanguageVoiceConfig(
  languages: string[],
  tier: GlobalTier
): Record<string, ProviderVoiceMapping | null> {
  const result: Record<string, ProviderVoiceMapping | null> = {};
  
  for (const lang of languages) {
    result[lang] = getVoiceForLanguage(lang, tier);
  }
  
  return result;
}

// Check if provider is optimal for language
export function isOptimalProviderForLanguage(
  providerId: string,
  languageCode: string
): { isOptimal: boolean; reason?: string } {
  const normalizedCode = normalizeLanguageCode(languageCode);
  
  // CJK languages prefer Alibaba/Azure
  const cjkLanguages = ['zh-CN', 'zh-TW', 'ja', 'ko'];
  if (cjkLanguages.some(l => normalizedCode.startsWith(l))) {
    if (providerId.includes('alibaba') || providerId.includes('azure')) {
      return { isOptimal: true };
    }
    return { 
      isOptimal: false, 
      reason: 'Alibaba or Azure recommended for CJK languages' 
    };
  }
  
  // European languages prefer ElevenLabs
  const europeanLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt'];
  if (europeanLanguages.some(l => normalizedCode.startsWith(l))) {
    if (providerId.includes('elevenlabs')) {
      return { isOptimal: true };
    }
    return { 
      isOptimal: false, 
      reason: 'ElevenLabs recommended for European languages' 
    };
  }
  
  return { isOptimal: true };
}

// Service export
export const languageVoicePairingService = {
  getVoiceForLanguage,
  getAllVoicesForLanguage,
  getMultiLanguageVoiceConfig,
  isOptimalProviderForLanguage,
  COMPREHENSIVE_LANGUAGE_VOICE_PAIRINGS,
};
