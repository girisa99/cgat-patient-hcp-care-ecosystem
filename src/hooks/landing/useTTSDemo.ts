/**
 * useTTSDemo — Hook for landing page TTS audio playback
 * 
 * Calls the dialect-tts-demo edge function and plays audio via data URI.
 * Manages loading states, playback, and cleanup.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TTSDemoState {
  isLoading: boolean;
  isPlaying: boolean;
  currentCode: string | null;
  provider: string | null;
  error: string | null;
}

export function useTTSDemo() {
  const [state, setState] = useState<TTSDemoState>({
    isLoading: false,
    isPlaying: false,
    currentCode: null,
    provider: null,
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
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

  const playTranscreation = useCallback(async (
    languageCode: string,
    mode: 'transcreation' | 'literal' = 'transcreation'
  ) => {
    // If same language is playing, stop it
    if (state.currentCode === languageCode && state.isPlaying) {
      stopAudio();
      return;
    }

    // Stop any current playback
    stopAudio();
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      currentCode: languageCode,
      error: null,
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dialect-tts-demo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'generate_tts',
            languageCode,
            mode: mode === 'literal' ? 'literal' : undefined,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'TTS failed' }));
        throw new Error(err.error || 'TTS generation failed');
      }

      const data = await response.json();

      if (!data.audioContent) {
        throw new Error('No audio content returned');
      }

      // Play via data URI — browser natively decodes base64
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);

      audio.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false, currentCode: null }));
        audioRef.current = null;
      });

      audio.addEventListener('error', () => {
        setState(prev => ({ ...prev, isPlaying: false, currentCode: null, error: 'Playback error' }));
        audioRef.current = null;
      });

      audioRef.current = audio;
      await audio.play();

      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: true,
        provider: data.provider || 'azure',
      }));
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
  }, [state.currentCode, state.isPlaying, stopAudio]);

  const playCustomText = useCallback(async (text: string, languageCode: string) => {
    stopAudio();
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      currentCode: languageCode,
      error: null,
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dialect-tts-demo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'custom_tts',
            languageCode,
            text,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'TTS failed' }));
        throw new Error(err.error || 'TTS generation failed');
      }

      const data = await response.json();
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);

      audio.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false, currentCode: null }));
        audioRef.current = null;
      });

      audioRef.current = audio;
      await audio.play();

      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: true,
        provider: data.provider || 'azure',
      }));
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
  }, [stopAudio]);

  return {
    ...state,
    playTranscreation,
    playCustomText,
    stopAudio,
  };
}
