/**
 * VOICE CATALOG — Single source of truth for ALL voice IDs across the Genie Suite.
 * 
 * Any component or service that needs voice options should import from here
 * instead of hardcoding voice IDs.
 * 
 * @see src/config/universal-script-schema.ts — DEFAULT_ELEVENLABS_VOICE_ID, DEFAULT_FALLBACK_VOICE
 * @see src/config/regional-routing-registry.ts — region-specific voice routing
 */

import { DEFAULT_ELEVENLABS_VOICE_ID, DEFAULT_FALLBACK_VOICE } from '@/config/universal-script-schema';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface VoiceCatalogEntry {
  id: string;
  name: string;
  style: string;
  gender?: 'male' | 'female' | 'neutral';
  locale?: string;
}

export type VoiceProvider = 'openai' | 'elevenlabs' | 'azure' | 'alibaba' | 'alibaba-qwen3-tts' | 'amazon-polly' | 'google';

// ─── VOICE CATALOGS PER PROVIDER ─────────────────────────────────────────────

export const ELEVENLABS_VOICES: VoiceCatalogEntry[] = [
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', style: 'Male Narrator', gender: 'male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', style: 'Female', gender: 'female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', style: 'Female Warm', gender: 'female' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', style: 'Male', gender: 'male' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', style: 'British Male', gender: 'male' },
  { id: DEFAULT_ELEVENLABS_VOICE_ID, name: 'Daniel', style: 'Deep Male', gender: 'male' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', style: 'Female', gender: 'female' },
];

export const OPENAI_VOICES: VoiceCatalogEntry[] = [
  { id: 'alloy', name: 'Alloy', style: 'Neutral', gender: 'neutral' },
  { id: 'echo', name: 'Echo', style: 'Male', gender: 'male' },
  { id: 'fable', name: 'Fable', style: 'Storytelling', gender: 'neutral' },
  { id: 'onyx', name: 'Onyx', style: 'Deep Male', gender: 'male' },
  { id: 'nova', name: 'Nova', style: 'Female', gender: 'female' },
  { id: 'shimmer', name: 'Shimmer', style: 'Soft Female', gender: 'female' },
];

export const AZURE_VOICES: VoiceCatalogEntry[] = [
  { id: 'en-US-JennyNeural', name: 'Jenny', style: 'US Female', gender: 'female', locale: 'en-US' },
  { id: 'en-US-GuyNeural', name: 'Guy', style: 'US Male', gender: 'male', locale: 'en-US' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', style: 'UK Female', gender: 'female', locale: 'en-GB' },
];

export const GOOGLE_VOICES: VoiceCatalogEntry[] = [
  { id: 'en-US-Neural2-D', name: 'David', style: 'US Male', gender: 'male', locale: 'en-US' },
  { id: 'en-US-Neural2-C', name: 'Claire', style: 'US Female', gender: 'female', locale: 'en-US' },
];

export const ALIBABA_VOICES: VoiceCatalogEntry[] = [
  { id: DEFAULT_FALLBACK_VOICE.voiceId, name: 'Xiaochun', style: 'Chinese Female', gender: 'female', locale: 'zh-CN' },
  { id: 'longxiaoxia', name: 'Xiaoxia', style: 'Chinese Female', gender: 'female', locale: 'zh-CN' },
  { id: 'longyue', name: 'Yue', style: 'Japanese Female', gender: 'female', locale: 'ja-JP' },
  { id: 'longfei', name: 'Fei', style: 'Korean Female', gender: 'female', locale: 'ko-KR' },
];

export const ALIBABA_QWEN3_VOICES: VoiceCatalogEntry[] = [
  { id: 'qwen3-tts-flash', name: 'Qwen3-TTS Flash', style: 'CJK Fast', gender: 'neutral' },
  { id: 'qwen3-tts-pro', name: 'Qwen3-TTS Pro', style: 'Premium', gender: 'neutral' },
];

export const AMAZON_POLLY_VOICES: VoiceCatalogEntry[] = [
  { id: 'Matthew', name: 'Matthew', style: 'Male US', gender: 'male', locale: 'en-US' },
  { id: 'Joanna', name: 'Joanna', style: 'Female US', gender: 'female', locale: 'en-US' },
  { id: 'Amy', name: 'Amy', style: 'Female UK', gender: 'female', locale: 'en-GB' },
  { id: 'Brian', name: 'Brian', style: 'Male UK', gender: 'male', locale: 'en-GB' },
  { id: 'Ivy', name: 'Ivy', style: 'Child Female', gender: 'female', locale: 'en-US' },
  { id: 'Justin', name: 'Justin', style: 'Child Male', gender: 'male', locale: 'en-US' },
];

// ─── COMBINED CATALOG ────────────────────────────────────────────────────────

/** All voices keyed by provider — single source of truth */
export const VOICE_CATALOG: Record<string, VoiceCatalogEntry[]> = {
  openai: OPENAI_VOICES,
  elevenlabs: ELEVENLABS_VOICES,
  azure: AZURE_VOICES,
  google: GOOGLE_VOICES,
  alibaba: ALIBABA_VOICES,
  'alibaba-qwen3-tts': ALIBABA_QWEN3_VOICES,
  'amazon-polly': AMAZON_POLLY_VOICES,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Get voices for a specific provider */
export function getVoicesForProvider(provider: string): VoiceCatalogEntry[] {
  return VOICE_CATALOG[provider] || [];
}

/** Get default voice for a provider */
export function getDefaultVoice(provider: string): VoiceCatalogEntry | undefined {
  return VOICE_CATALOG[provider]?.[0];
}

/** Find a voice by ID across all providers */
export function findVoiceById(voiceId: string): { provider: string; voice: VoiceCatalogEntry } | undefined {
  for (const [provider, voices] of Object.entries(VOICE_CATALOG)) {
    const voice = voices.find(v => v.id === voiceId);
    if (voice) return { provider, voice };
  }
  return undefined;
}
