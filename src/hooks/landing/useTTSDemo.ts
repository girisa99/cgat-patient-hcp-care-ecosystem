/**
 * useTTSDemo — Hook for landing page TTS audio playback
 * 
 * Calls the dialect-tts-demo edge function and plays audio via data URI.
 * Includes client-side audio CACHING to prevent rate limiting.
 * Manages loading states, playback, and cleanup.
 * Returns translatedText from API when text was translated before TTS.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

const SUPABASE_URL = 'https://ithspbabhmdntioslfqe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw';

const THROTTLE_MS = 1500;

interface TTSDemoState {
  isLoading: boolean;
  isPlaying: boolean;
  currentCode: string | null;
  provider: string | null;
  error: string | null;
  /** The translated text that was actually spoken (if translation happened) */
  translatedText: string | null;
  /** Whether the last playback involved translation */
  wasTranslated: boolean;
}

// Module-level audio cache: cacheKey → base64 audio + provider + translated text
const audioCache = new Map<string, { audioContent: string; provider: string; translatedText?: string; wasTranslated?: boolean }>();
let lastCallTimestamp = 0;

export function useTTSDemo() {
  const [state, setState] = useState<TTSDemoState>({
    isLoading: false,
    isPlaying: false,
    currentCode: null,
    provider: null,
    error: null,
    translatedText: null,
    wasTranslated: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      abortRef.current?.abort();
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setState(prev => ({ ...prev, isPlaying: false, currentCode: null }));
  }, []);

  const playBase64Audio = useCallback((base64: string, provider: string, languageCode: string, translatedText?: string, wasTranslated?: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audioUrl = `data:audio/mpeg;base64,${base64}`;
      const audio = new Audio(audioUrl);

      audio.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false, currentCode: null }));
        audioRef.current = null;
        resolve();
      });

      audio.addEventListener('error', () => {
        setState(prev => ({ ...prev, isPlaying: false, currentCode: null, error: 'Playback error' }));
        audioRef.current = null;
        reject(new Error('Playback error'));
      });

      audioRef.current = audio;
      audio.play().then(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isPlaying: true,
          provider,
          translatedText: translatedText || null,
          wasTranslated: wasTranslated || false,
        }));
      }).catch(reject);
    });
  }, []);

  const fetchTTSAudio = useCallback(async (
    cacheKey: string,
    body: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<{ audioContent: string; provider: string; translatedText?: string; wasTranslated?: boolean }> => {
    const cached = audioCache.get(cacheKey);
    if (cached) {
      console.log('[useTTSDemo] Cache HIT:', cacheKey);
      return cached;
    }

    const now = Date.now();
    const elapsed = now - lastCallTimestamp;
    if (elapsed < THROTTLE_MS) {
      const waitMs = THROTTLE_MS - elapsed;
      console.log(`[useTTSDemo] Throttling ${waitMs}ms`);
      await new Promise(r => setTimeout(r, waitMs));
    }
    lastCallTimestamp = Date.now();

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/dialect-tts-demo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
        signal,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'TTS failed' }));
      throw new Error(err.error || err.message || 'TTS generation failed');
    }

    const data = await response.json();
    if (!data.audioContent) {
      throw new Error('No audio content returned');
    }

    const result = { 
      audioContent: data.audioContent, 
      provider: data.provider || 'azure',
      translatedText: data.translatedText,
      wasTranslated: data.wasTranslated,
    };
    
    audioCache.set(cacheKey, result);
    console.log('[useTTSDemo] Cache STORE:', cacheKey, `(${audioCache.size} cached)`);
    
    return result;
  }, []);

  const playTranscreation = useCallback(async (
    languageCode: string,
    mode: 'transcreation' | 'literal' = 'transcreation'
  ) => {
    if (state.currentCode === languageCode && state.isPlaying) {
      stopAudio();
      return;
    }

    stopAudio();
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      currentCode: languageCode,
      error: null,
      translatedText: null,
      wasTranslated: false,
    }));

    try {
      const cacheKey = `tts:${languageCode}:${mode}`;
      const result = await fetchTTSAudio(
        cacheKey,
        {
          action: 'generate_tts',
          languageCode,
          mode: mode === 'literal' ? 'literal' : undefined,
        },
        abortRef.current.signal
      );

      await playBase64Audio(result.audioContent, result.provider, languageCode);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('[useTTSDemo] Error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        currentCode: null,
        error: err.message || 'Failed to generate audio',
      }));
    }
  }, [state.currentCode, state.isPlaying, stopAudio, fetchTTSAudio, playBase64Audio]);

  const playCustomText = useCallback(async (text: string, languageCode: string) => {
    stopAudio();
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      currentCode: languageCode,
      error: null,
      translatedText: null,
      wasTranslated: false,
    }));

    try {
      const textHash = text.slice(0, 50).replace(/\s+/g, '_');
      const cacheKey = `custom:${languageCode}:${textHash}`;
      
      const result = await fetchTTSAudio(
        cacheKey,
        {
          action: 'custom_tts',
          languageCode,
          text,
        },
        abortRef.current.signal
      );

      await playBase64Audio(
        result.audioContent, 
        result.provider, 
        languageCode,
        result.translatedText,
        result.wasTranslated
      );
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        currentCode: null,
        error: err.message || 'Failed to generate audio',
      }));
    }
  }, [stopAudio, fetchTTSAudio, playBase64Audio]);

  return {
    ...state,
    playTranscreation,
    playCustomText,
    stopAudio,
    cacheSize: audioCache.size,
  };
}
