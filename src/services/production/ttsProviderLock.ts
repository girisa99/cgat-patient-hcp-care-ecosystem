/**
 * TTS Provider Lock — Phase 6C (B-013)
 *
 * Pre-flight TTS provider selection that ensures voice consistency
 * across all chunks in a production. Once locked, every chunk uses
 * the same provider + voice combination.
 *
 * Provider routing (region-aware):
 *   Western → ElevenLabs (best quality) | OpenAI (fast fallback)
 *   CJK → Alibaba Qwen3-TTS (native Mandarin/Japanese/Korean)
 *   MENA → Azure Neural TTS (Arabic viseme support, B-015)
 *   SEA/India → Google Cloud TTS (Hindi, Tamil, Thai, Vietnamese)
 *
 * Lock includes:
 *   - Provider + voice ID selection
 *   - Capability verification (SSML, request stitching, max duration)
 *   - Chunk boundary pre-computation
 *   - TTL-based lock (15 minutes) to prevent stale voice selection
 */

import { supabase } from '@/integrations/supabase/client';
import type { TTSLockResult, TTSProviderLock as TTSProvider } from '@/utils/audioSplitStitch';
import { splitTextIntoChunks, estimateAudioDuration } from '@/utils/audioSplitStitch';

// ─── Voice Registry ─────────────────────────────────────────────────────────

interface VoiceOption {
  id: string;
  name: string;
  provider: TTSProvider;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  style: 'narration' | 'conversational' | 'news' | 'cheerful';
  quality: number; // 1-10
}

const VOICE_REGISTRY: VoiceOption[] = [
  // ElevenLabs (Western)
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', provider: 'elevenlabs', language: 'en', gender: 'female', style: 'narration', quality: 9 },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', provider: 'elevenlabs', language: 'en', gender: 'female', style: 'conversational', quality: 9 },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', provider: 'elevenlabs', language: 'en', gender: 'male', style: 'narration', quality: 9 },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', provider: 'elevenlabs', language: 'en', gender: 'male', style: 'conversational', quality: 8 },
  // OpenAI (fast fallback for any language)
  { id: 'alloy', name: 'Alloy', provider: 'openai', language: 'en', gender: 'neutral', style: 'narration', quality: 7 },
  { id: 'echo', name: 'Echo', provider: 'openai', language: 'en', gender: 'male', style: 'narration', quality: 7 },
  { id: 'nova', name: 'Nova', provider: 'openai', language: 'en', gender: 'female', style: 'conversational', quality: 7 },
  { id: 'shimmer', name: 'Shimmer', provider: 'openai', language: 'en', gender: 'female', style: 'cheerful', quality: 7 },
  // Azure Neural (MENA — Arabic viseme support)
  { id: 'ar-SA-HamedNeural', name: 'Hamed', provider: 'azure', language: 'ar', gender: 'male', style: 'narration', quality: 8 },
  { id: 'ar-SA-ZariyahNeural', name: 'Zariyah', provider: 'azure', language: 'ar', gender: 'female', style: 'narration', quality: 8 },
  { id: 'he-IL-AvriNeural', name: 'Avri', provider: 'azure', language: 'he', gender: 'male', style: 'narration', quality: 7 },
  { id: 'tr-TR-AhmetNeural', name: 'Ahmet', provider: 'azure', language: 'tr', gender: 'male', style: 'narration', quality: 7 },
  // Alibaba Qwen3-TTS (CJK)
  { id: 'zh-CN-sambert-zhichu-v1', name: 'Zhichu', provider: 'alibaba', language: 'zh', gender: 'male', style: 'narration', quality: 8 },
  { id: 'zh-CN-sambert-zhimiao-v1', name: 'Zhimiao', provider: 'alibaba', language: 'zh', gender: 'female', style: 'narration', quality: 8 },
  { id: 'ja-JP-sambert-v1', name: 'Sakura', provider: 'alibaba', language: 'ja', gender: 'female', style: 'narration', quality: 7 },
  { id: 'ko-KR-sambert-v1', name: 'Minho', provider: 'alibaba', language: 'ko', gender: 'male', style: 'narration', quality: 7 },
  // Google Cloud TTS (SEA/India)
  { id: 'hi-IN-Wavenet-A', name: 'Priya', provider: 'google', language: 'hi', gender: 'female', style: 'narration', quality: 7 },
  { id: 'hi-IN-Wavenet-B', name: 'Raj', provider: 'google', language: 'hi', gender: 'male', style: 'narration', quality: 7 },
  { id: 'ta-IN-Wavenet-A', name: 'Lakshmi', provider: 'google', language: 'ta', gender: 'female', style: 'narration', quality: 7 },
  { id: 'th-TH-Standard-A', name: 'Siri', provider: 'google', language: 'th', gender: 'female', style: 'narration', quality: 6 },
  { id: 'vi-VN-Wavenet-A', name: 'Linh', provider: 'google', language: 'vi', gender: 'female', style: 'narration', quality: 7 },
  { id: 'id-ID-Wavenet-A', name: 'Putri', provider: 'google', language: 'id', gender: 'female', style: 'narration', quality: 7 },
];

// ─── Provider Capability Map ────────────────────────────────────────────────

const PROVIDER_CAPABILITIES: Record<TTSProvider, {
  maxChunkDuration: number;
  supportsSSML: boolean;
  supportsRequestStitching: boolean;
  supportedOutputFormats: string[];
  estimatedLatencyMs: number;
}> = {
  elevenlabs: {
    maxChunkDuration: 300,
    supportsSSML: false,
    supportsRequestStitching: true,
    supportedOutputFormats: ['mp3', 'pcm', 'ulaw'],
    estimatedLatencyMs: 800,
  },
  openai: {
    maxChunkDuration: 600,
    supportsSSML: false,
    supportsRequestStitching: false,
    supportedOutputFormats: ['mp3', 'opus', 'aac', 'flac'],
    estimatedLatencyMs: 500,
  },
  azure: {
    maxChunkDuration: 600,
    supportsSSML: true,
    supportsRequestStitching: false,
    supportedOutputFormats: ['mp3', 'wav', 'ogg'],
    estimatedLatencyMs: 400,
  },
  alibaba: {
    maxChunkDuration: 20,
    supportsSSML: false,
    supportsRequestStitching: false,
    supportedOutputFormats: ['mp3', 'wav'],
    estimatedLatencyMs: 600,
  },
  google: {
    maxChunkDuration: 5000,
    supportsSSML: true,
    supportsRequestStitching: false,
    supportedOutputFormats: ['mp3', 'wav', 'ogg'],
    estimatedLatencyMs: 300,
  },
};

// ─── Region-to-Provider Routing ─────────────────────────────────────────────

function selectProviderForRegion(regionCode: string, language: string): TTSProvider {
  // Language-specific routing (highest priority)
  if (['zh', 'ja', 'ko'].includes(language)) return 'alibaba';
  if (['ar', 'he', 'tr', 'fa'].includes(language)) return 'azure';
  if (['hi', 'ta', 'te', 'bn', 'th', 'vi', 'id', 'ms', 'tl'].includes(language)) return 'google';

  // Region-based fallback
  if (regionCode.startsWith('CJK')) return 'alibaba';
  if (regionCode.startsWith('MENA')) return 'azure';
  if (regionCode.startsWith('SEA') || regionCode.startsWith('APAC_IN')) return 'google';

  // Western default
  return 'elevenlabs';
}

function selectVoice(
  provider: TTSProvider,
  language: string,
  gender: 'male' | 'female' | 'neutral' = 'female',
  style: 'narration' | 'conversational' = 'narration',
): VoiceOption {
  // Find exact match
  const exact = VOICE_REGISTRY.find(v =>
    v.provider === provider &&
    v.language === language &&
    v.gender === gender &&
    v.style === style
  );
  if (exact) return exact;

  // Relax: same provider + language
  const langMatch = VOICE_REGISTRY.find(v => v.provider === provider && v.language === language);
  if (langMatch) return langMatch;

  // Relax: same provider, any language
  const providerMatch = VOICE_REGISTRY.find(v => v.provider === provider);
  if (providerMatch) return providerMatch;

  // Ultimate fallback
  return VOICE_REGISTRY[0];
}

// ─── Lock Service ───────────────────────────────────────────────────────────

const LOCK_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Pre-flight TTS provider lock.
 * Selects the best provider + voice for the given region/language,
 * verifies capabilities, and pre-computes chunk boundaries.
 */
export async function lockTTSProvider(params: {
  scriptText: string;
  regionCode: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  style?: 'narration' | 'conversational';
  preferredProvider?: TTSProvider;
}): Promise<TTSLockResult> {
  const provider = params.preferredProvider || selectProviderForRegion(params.regionCode, params.language);
  const voice = selectVoice(provider, params.language, params.gender, params.style);
  const capabilities = PROVIDER_CAPABILITIES[provider];

  // Compute chunk boundaries based on provider limits
  const maxChars = provider === 'alibaba'
    ? 252  // 18s × 14 chars/s
    : 2000; // Most providers handle long text

  const chunks = splitTextIntoChunks(params.scriptText, maxChars);
  let cumulativeTime = 0;

  const chunkBoundaries = chunks.map((text, index) => {
    const duration = estimateAudioDuration(text);
    const boundary = {
      chunkIndex: index,
      text,
      estimatedStartTime: cumulativeTime,
      estimatedEndTime: cumulativeTime + duration,
      characterCount: text.length,
    };
    cumulativeTime += duration;
    return boundary;
  });

  // Verify provider is reachable (optional health check)
  let verificationSuccess = true;
  try {
    const { error } = await supabase.functions.invoke('ai-universal-processor', {
      body: { action: 'health_check', provider },
    });
    if (error) verificationSuccess = false;
  } catch {
    // Non-fatal: proceed with lock anyway
    verificationSuccess = true;
  }

  const reason = params.preferredProvider
    ? `User selected ${provider}`
    : `Auto-selected for ${params.language} in ${params.regionCode}: ${provider} (quality: ${voice.quality}/10)`;

  return {
    success: verificationSuccess,
    lockedProvider: provider,
    lockedVoiceId: voice.id,
    voiceDisplayName: voice.name,
    language: params.language,
    selectionReason: reason,
    verifiedCapabilities: capabilities,
    chunkBoundaries,
    lockedAt: new Date().toISOString(),
    lockTTLMs: LOCK_TTL_MS,
  };
}

/**
 * Check if a lock is still valid.
 */
export function isLockValid(lock: TTSLockResult): boolean {
  const elapsed = Date.now() - new Date(lock.lockedAt).getTime();
  return elapsed < lock.lockTTLMs;
}

/**
 * Get all available voices for a language.
 */
export function getVoicesForLanguage(language: string): VoiceOption[] {
  return VOICE_REGISTRY.filter(v => v.language === language);
}

/**
 * Get all available providers for a region.
 */
export function getProvidersForRegion(regionCode: string): TTSProvider[] {
  const primary = selectProviderForRegion(regionCode, 'en');
  const all = new Set<TTSProvider>([primary, 'openai']); // OpenAI always available as fallback
  return Array.from(all);
}
