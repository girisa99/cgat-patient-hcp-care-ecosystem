/**
 * Multi-Language Audio Generation Service
 * Frontend service for the multi-language-audio-orchestrator edge function
 * 
 * Provides:
 * - Multi-language voice generation with intelligent provider routing
 * - Tier-based quality selection
 * - Language-specific provider recommendations
 */

import { supabase } from '@/integrations/supabase/client';

export type GlobalTier = 1 | 2 | 3;

export interface VoiceGenerationConfig {
  speed?: number;
  pitch?: number;
  stability?: number;
  gender?: 'male' | 'female' | 'neutral';
}

export interface LanguageAudioResult {
  langCode: string;
  success: boolean;
  provider?: string;
  voiceId?: string;
  audioBase64?: string;
  audioSize?: number;
  error?: string;
}

export interface MultiLanguageAudioResult {
  success: boolean;
  generated: number;
  failed: number;
  total: number;
  results: Record<string, LanguageAudioResult>;
}

export interface ProviderRecommendation {
  providers: string[];
  available: string | null;
}

// Generate voice for single language
export async function generateSingleLanguageAudio(
  text: string,
  languageCode: string,
  tier: GlobalTier = 2,
  config?: VoiceGenerationConfig
): Promise<{ audio: Blob; provider: string; voiceId: string }> {
  const { data, error } = await supabase.functions.invoke('multi-language-audio-orchestrator', {
    body: {
      action: 'generate_single',
      text,
      languageCode,
      tier,
      voiceConfig: config,
    },
  });

  if (error) {
    throw new Error(`Audio generation failed: ${error.message}`);
  }

  // Response is ArrayBuffer, convert to Blob
  const audioBlob = new Blob([data], { type: 'audio/mpeg' });
  
  return {
    audio: audioBlob,
    provider: 'unknown', // Headers not accessible in invoke response
    voiceId: 'unknown',
  };
}

// Generate voice for multiple languages in parallel
export async function generateMultiLanguageAudio(
  texts: Record<string, string>,
  tier: GlobalTier = 2,
  config?: VoiceGenerationConfig
): Promise<MultiLanguageAudioResult> {
  const { data, error } = await supabase.functions.invoke('multi-language-audio-orchestrator', {
    body: {
      action: 'generate_multi_language',
      texts,
      tier,
      voiceConfig: config,
    },
  });

  if (error) {
    throw new Error(`Multi-language audio generation failed: ${error.message}`);
  }

  return data as MultiLanguageAudioResult;
}

// Get provider recommendations for languages
export async function getProviderRecommendations(
  languages: string[],
  tier: GlobalTier = 2
): Promise<Record<string, ProviderRecommendation>> {
  const texts: Record<string, string> = {};
  for (const lang of languages) {
    texts[lang] = 'test'; // Dummy text for recommendation lookup
  }

  const { data, error } = await supabase.functions.invoke('multi-language-audio-orchestrator', {
    body: {
      action: 'get_provider_recommendation',
      texts,
      tier,
    },
  });

  if (error) {
    throw new Error(`Provider recommendation failed: ${error.message}`);
  }

  return data.recommendations;
}

// Generate voice using music-composer-agent (simpler single-call)
export async function generateVoiceSimple(
  text: string,
  options: {
    tier?: GlobalTier;
    languageCode?: string;
    voiceProvider?: string;
    voiceId?: string;
    speed?: number;
    stability?: number;
  } = {}
): Promise<Blob> {
  const { data, error } = await supabase.functions.invoke('music-composer-agent', {
    body: {
      action: 'generate_voice',
      text,
      tier: options.tier ?? 2,
      languageCode: options.languageCode ?? 'en-US',
      voiceProvider: options.voiceProvider,
      voiceId: options.voiceId,
      speed: options.speed,
      stability: options.stability,
    },
  });

  if (error) {
    throw new Error(`Voice generation failed: ${error.message}`);
  }

  return new Blob([data], { type: 'audio/mpeg' });
}

// Generate background music
export async function generateBackgroundMusic(
  prompt: string,
  options: {
    tier?: GlobalTier;
    duration?: number;
    genre?: string;
  } = {}
): Promise<Blob | { message: string; tier: number }> {
  const { data, error } = await supabase.functions.invoke('music-composer-agent', {
    body: {
      action: 'generate_music',
      prompt,
      tier: options.tier ?? 2,
      duration: options.duration ?? 30,
      genre: options.genre,
    },
  });

  if (error) {
    throw new Error(`Music generation failed: ${error.message}`);
  }

  // Check if it's a JSON response (tier 1 fallback)
  if (data && typeof data === 'object' && 'message' in data) {
    return data;
  }

  return new Blob([data], { type: 'audio/mpeg' });
}

// Generate sound effects
export async function generateSoundEffect(
  prompt: string,
  options: {
    tier?: GlobalTier;
    duration?: number;
  } = {}
): Promise<Blob | { message: string; tier: number }> {
  const { data, error } = await supabase.functions.invoke('music-composer-agent', {
    body: {
      action: 'generate_sfx',
      sfxPrompt: prompt,
      tier: options.tier ?? 3, // SFX requires premium by default
      duration: options.duration ?? 5,
    },
  });

  if (error) {
    throw new Error(`SFX generation failed: ${error.message}`);
  }

  // Check if it's a JSON response (non-premium fallback)
  if (data && typeof data === 'object' && 'message' in data) {
    return data;
  }

  return new Blob([data], { type: 'audio/mpeg' });
}

// Check which audio providers are configured
export async function checkConfiguredProviders(): Promise<Record<string, boolean>> {
  const { data, error } = await supabase.functions.invoke('music-composer-agent', {
    body: {
      action: 'check_providers',
    },
  });

  if (error) {
    throw new Error(`Provider check failed: ${error.message}`);
  }

  return data.providers;
}

// Convert base64 audio to Blob
export function base64ToAudioBlob(base64: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'audio/mpeg' });
}

// Create audio URL from base64
export function createAudioUrl(base64: string): string {
  return URL.createObjectURL(base64ToAudioBlob(base64));
}

// Service export
export const multiLanguageAudioService = {
  generateSingleLanguageAudio,
  generateMultiLanguageAudio,
  getProviderRecommendations,
  generateVoiceSimple,
  generateBackgroundMusic,
  generateSoundEffect,
  checkConfiguredProviders,
  base64ToAudioBlob,
  createAudioUrl,
};
