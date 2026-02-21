/**
 * useGuideTTS — Connects guide store to the regionalized guide-tts edge function.
 * 
 * NOW USES REGIONAL ROUTING: Picks character-specific voices from
 * getRegionVoiceOptions() (regional-routing-registry.ts) so Ori gets a female
 * voice and Arc gets a male voice, matched to the user's detected region.
 * 
 * Fallback chain: Region Voice → Zone Default → ElevenLabs Default
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useGuideStore, type GuideMessage, type GuideAgent } from '@/stores/guideStore';
import { supabase } from '@/integrations/supabase/client';
import { getRegionVoiceOptions, getZoneFromRegion, type VoiceOption } from '@/config/regional-routing-registry';
import { ELEVENLABS_VOICES } from '@/config/voice-catalog';

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

/** Character → preferred gender mapping for voice selection */
const CHARACTER_VOICE_GENDER: Record<GuideAgent, 'female' | 'male'> = {
  ori: 'female',  // Ori = Creative Guide, female voice
  arc: 'male',    // Arc = Systems Guide, male voice
};

/** ElevenLabs fallback voices per character */
const ELEVENLABS_FALLBACKS: Record<GuideAgent, { voiceId: string; voiceName: string }> = {
  ori: { voiceId: 'FGY2WhTYpPnrIDTdsKH5', voiceName: 'Laura' },  // Warm female
  arc: { voiceId: 'onwK4e9ZLuTAKqWW03F9', voiceName: 'Daniel' },  // Deep male
};

/**
 * Resolve the best voice for a character from regional voice options.
 * Strategy: match gender → pick default or first match → fallback to ElevenLabs
 */
function resolveCharacterVoice(
  agent: GuideAgent,
  regionCode?: string,
): { provider: string; voiceId: string; voiceName: string; locale: string } {
  const preferredGender = CHARACTER_VOICE_GENDER[agent];
  
  // Try region-specific voices first
  if (regionCode) {
    const voices = getRegionVoiceOptions(regionCode);
    if (voices.length > 0) {
      // Find a voice matching the character's preferred gender
      const genderMatch = voices.find(v => v.gender === preferredGender);
      // If no gender match, use the default or first voice
      const selected = genderMatch || voices.find(v => v.isDefault) || voices[0];
      return {
        provider: selected.provider,
        voiceId: selected.voiceId,
        voiceName: selected.voiceName,
        locale: selected.locale,
      };
    }
  }

  // Fallback: ElevenLabs character-specific voice
  const fb = ELEVENLABS_FALLBACKS[agent];
  return {
    provider: 'elevenlabs',
    voiceId: fb.voiceId,
    voiceName: fb.voiceName,
    locale: 'en-US',
  };
}

export function useGuideTTS(options: GuideTTSOptions = {}) {
  const { speed = 1.0, autoPlay = true } = options;
  const { voiceEnabled, queue, regionalContext, agent } = useGuideStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenId = useRef<string>('');
  const isSpeaking = useRef(false);

  // Resolve language from options → store regional context
  const languageCode = options.languageCode || regionalContext.languageCode;
  const region = options.region;
  const countryCode = options.countryCode;

  // Resolve voice based on active agent + detected region
  const resolvedVoice = useMemo(
    () => resolveCharacterVoice(agent, region || regionalContext.zone),
    [agent, region, regionalContext.zone],
  );

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

    // Resolve voice for the message's specific agent (may differ from active)
    const voice = resolveCharacterVoice(message.agent, region || regionalContext.zone);

    try {
      const { data, error } = await supabase.functions.invoke('guide-tts', {
        body: {
          text: message.text,
          agent: message.agent,
          languageCode,
          region,
          countryCode,
          speed,
          // Pass resolved voice info so edge function uses correct provider/voice
          voiceProvider: voice.provider,
          voiceId: voice.voiceId,
          voiceLocale: voice.locale,
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

      console.log(`🔊 GuideTTS: ${message.agent}(${voice.voiceName}) via ${voice.provider} region=${region || regionalContext.zone} locale=${voice.locale} (${data.chars || message.text.length} chars)`);
    } catch (err) {
      console.warn('[GuideTTS] Failed:', err);
      isSpeaking.current = false;
    }
  }, [voiceEnabled, languageCode, region, countryCode, speed, regionalContext.zone]);

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

  return { speak, stopSpeaking, isSpeaking: isSpeaking.current, resolvedVoice };
}
