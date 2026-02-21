/**
 * useGuideTTS — Connects guide store voiceEnabled state to the guide-tts edge function.
 * 
 * When voice is enabled and a new guide message appears, automatically
 * calls the guide-tts edge function and plays the audio.
 * 
 * Uses the existing AI routing pattern (dedicated edge function with fallbacks).
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGuideStore, type GuideMessage, type GuideAgent } from '@/stores/guideStore';
import { supabase } from '@/integrations/supabase/client';

interface GuideTTSOptions {
  /** Language code for TTS routing (e.g., 'en-US', 'ar-SA') */
  languageCode?: string;
  /** Speech speed multiplier */
  speed?: number;
  /** Whether to auto-play when new messages arrive */
  autoPlay?: boolean;
}

export function useGuideTTS(options: GuideTTSOptions = {}) {
  const { languageCode = 'en-US', speed = 1.0, autoPlay = true } = options;
  const { voiceEnabled, queue, agent } = useGuideStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenId = useRef<string>('');
  const isSpeaking = useRef(false);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    isSpeaking.current = false;
  }, []);

  const speak = useCallback(async (message: GuideMessage) => {
    if (!voiceEnabled || isSpeaking.current) return;
    if (message.id === lastSpokenId.current) return;

    lastSpokenId.current = message.id;
    isSpeaking.current = true;

    try {
      const { data, error } = await supabase.functions.invoke('guide-tts', {
        body: {
          text: message.text,
          agent: message.agent,
          languageCode,
          speed,
        },
      });

      if (error) {
        console.warn('[GuideTTS] Edge function error:', error);
        isSpeaking.current = false;
        return;
      }

      if (!data?.audio) {
        console.warn('[GuideTTS] No audio returned');
        isSpeaking.current = false;
        return;
      }

      // Decode base64 to audio blob
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Play
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        isSpeaking.current = false;
        audioRef.current = null;
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        isSpeaking.current = false;
        audioRef.current = null;
      };
      await audio.play();

      console.log(`🔊 GuideTTS: Playing ${data.agent} via ${data.provider} (${data.chars} chars)`);
    } catch (err) {
      console.warn('[GuideTTS] Failed:', err);
      isSpeaking.current = false;
    }
  }, [voiceEnabled, languageCode, speed]);

  // Auto-speak newest message when queue changes
  useEffect(() => {
    if (!autoPlay || !voiceEnabled || queue.length === 0) return;
    const latest = queue[queue.length - 1];
    if (latest && latest.id !== lastSpokenId.current) {
      speak(latest);
    }
  }, [queue, voiceEnabled, autoPlay, speak]);

  // Stop when voice disabled
  useEffect(() => {
    if (!voiceEnabled) stopSpeaking();
  }, [voiceEnabled, stopSpeaking]);

  return { speak, stopSpeaking, isSpeaking: isSpeaking.current };
}
