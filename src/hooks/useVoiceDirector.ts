/**
 * Voice Director Agent Hook
 * Multi-provider TTS with coaching, narration, dialogue, and presentation modes
 * Supports: ElevenLabs, OpenAI, Google Cloud TTS
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VoiceProvider = 'elevenlabs' | 'openai' | 'google' | 'auto';
export type VoiceMode = 'coaching' | 'narration' | 'dialogue' | 'presentation';

export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
}

export interface VoiceDirectorConfig {
  provider: VoiceProvider;
  voice?: string;
  mode?: VoiceMode;
  speed?: number;
  pitch?: number;
  emotion?: string;
  voiceSettings?: VoiceSettings;
}

export interface VoiceDirectorResult {
  audioContent: string;
  audioUrl: string;
  provider: string;
  voice: string;
  duration_estimate: number;
  metadata: {
    mode?: string;
    textLength: number;
    wordCount: number;
    coachingFeedback?: string[];
    [key: string]: unknown;
  };
}

// Provider-specific voice options
export const VOICE_OPTIONS = {
  elevenlabs: [
    { id: 'professional', name: 'Daniel (Professional)', style: 'professional' },
    { id: 'friendly', name: 'Alice (Friendly)', style: 'friendly' },
    { id: 'narrator', name: 'Brian (Narrator)', style: 'narrator' },
    { id: 'energetic', name: 'Charlie (Energetic)', style: 'energetic' },
    { id: 'calm', name: 'River (Calm)', style: 'calm' },
    { id: 'warm', name: 'Matilda (Warm)', style: 'warm' },
  ],
  openai: [
    { id: 'alloy', name: 'Alloy', style: 'neutral' },
    { id: 'echo', name: 'Echo', style: 'warm' },
    { id: 'fable', name: 'Fable', style: 'expressive' },
    { id: 'onyx', name: 'Onyx', style: 'deep' },
    { id: 'nova', name: 'Nova', style: 'bright' },
    { id: 'shimmer', name: 'Shimmer', style: 'soft' },
    { id: 'ash', name: 'Ash', style: 'clear' },
    { id: 'coral', name: 'Coral', style: 'pleasant' },
    { id: 'sage', name: 'Sage', style: 'thoughtful' },
  ],
  google: [
    { id: 'en-US-Neural2-D', name: 'David (US Male)', style: 'neutral' },
    { id: 'en-US-Neural2-C', name: 'Claire (US Female)', style: 'friendly' },
    { id: 'en-US-Neural2-J', name: 'James (US Male)', style: 'professional' },
    { id: 'en-GB-Neural2-B', name: 'Benjamin (UK Male)', style: 'british' },
    { id: 'en-GB-Neural2-A', name: 'Alice (UK Female)', style: 'british' },
  ],
};

export const MODE_DESCRIPTIONS: Record<VoiceMode, string> = {
  coaching: 'Real-time feedback and expressive delivery for coaching scenarios',
  narration: 'Smooth, consistent pacing ideal for storytelling and documentaries',
  dialogue: 'Natural, conversational tone for character interactions',
  presentation: 'Clear, professional speech for business and educational content',
};

export function useVoiceDirector() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceDirectorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateVoice = useCallback(async (
    text: string,
    config: VoiceDirectorConfig
  ): Promise<VoiceDirectorResult | null> => {
    if (!text.trim()) {
      toast.error('Please enter text to generate voice');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('[VoiceDirector] Generating voice:', { provider: config.provider, mode: config.mode });

      const { data, error: invokeError } = await supabase.functions.invoke('voice-director-agent', {
        body: {
          text,
          provider: config.provider,
          voice: config.voice,
          mode: config.mode || 'narration',
          speed: config.speed,
          pitch: config.pitch,
          emotion: config.emotion,
          voiceSettings: config.voiceSettings,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Create audio URL from base64
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;

      const result: VoiceDirectorResult = {
        audioContent: data.audioContent,
        audioUrl,
        provider: data.provider,
        voice: data.voice,
        duration_estimate: data.duration_estimate,
        metadata: data.metadata,
      };

      setLastResult(result);

      // Show coaching feedback if available
      if (result.metadata.coachingFeedback?.length) {
        result.metadata.coachingFeedback.forEach((feedback, i) => {
          setTimeout(() => toast.info(feedback), i * 1000);
        });
      }

      toast.success(`Voice generated with ${data.provider} (${data.voice})`);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate voice';
      console.error('[VoiceDirector] Error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const playAudio = useCallback((audioUrl: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setCurrentAudio(audio);

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setIsPlaying(false);
      toast.error('Failed to play audio');
      audioRef.current = null;
    };

    audio.play().catch(err => {
      console.error('[VoiceDirector] Playback error:', err);
      toast.error('Failed to play audio');
    });
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    } else if (lastResult?.audioUrl) {
      playAudio(lastResult.audioUrl);
    }
  }, [isPlaying, lastResult?.audioUrl, playAudio]);

  const downloadAudio = useCallback((result?: VoiceDirectorResult) => {
    const audio = result || lastResult;
    if (!audio?.audioContent) {
      toast.error('No audio to download');
      return;
    }

    // Convert base64 to blob
    const byteCharacters = atob(audio.audioContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-${audio.provider}-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Audio downloaded');
  }, [lastResult]);

  const getVoicesForProvider = useCallback((provider: VoiceProvider) => {
    if (provider === 'auto') {
      return VOICE_OPTIONS.elevenlabs; // Default to ElevenLabs for auto
    }
    return VOICE_OPTIONS[provider] || [];
  }, []);

  return {
    // State
    isGenerating,
    isPlaying,
    lastResult,
    error,
    currentAudio,

    // Actions
    generateVoice,
    playAudio,
    stopAudio,
    togglePlayback,
    downloadAudio,

    // Helpers
    getVoicesForProvider,
    voiceOptions: VOICE_OPTIONS,
    modeDescriptions: MODE_DESCRIPTIONS,
  };
}

export default useVoiceDirector;
