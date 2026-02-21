/**
 * useGuideTTS — Connects guide store to the regionalized guide-tts edge function.
 * 
 * Now passes regional context (zone, sub-region, language, country) from
 * useIPBasedContent + guideStore.regionalContext so the edge function uses
 * the correct TTS provider chain and sub-regional voice (parent-child inheritance).
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGuideStore, type GuideMessage } from '@/stores/guideStore';
import { supabase } from '@/integrations/supabase/client';

interface GuideTTSOptions {
  /** Override language code (otherwise uses store's regional context) */
  languageCode?: string;
  /** Sub-region code from IP detection (e.g., 'MENA_GULF', 'INDIA_SOUTH_TA') */
  region?: string;
  /** ISO country code from IP detection */
  countryCode?: string;
  /** Speech speed multiplier */
  speed?: number;
  /** Whether to auto-play when new messages arrive */
  autoPlay?: boolean;
}

export function useGuideTTS(options: GuideTTSOptions = {}) {
  const { speed = 1.0, autoPlay = true } = options;
  const { voiceEnabled, queue, regionalContext } = useGuideStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenId = useRef<string>('');
  const isSpeaking = useRef(false);

  // Resolve language from options → store regional context
  const languageCode = options.languageCode || regionalContext.languageCode;
  const region = options.region;
  const countryCode = options.countryCode;

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
          region,
          countryCode,
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

      console.log(`🔊 GuideTTS: Playing ${data.agent} via ${data.provider} zone=${data.zone} locale=${data.locale} (${data.chars} chars)`);
    } catch (err) {
      console.warn('[GuideTTS] Failed:', err);
      isSpeaking.current = false;
    }
  }, [voiceEnabled, languageCode, region, countryCode, speed]);

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
