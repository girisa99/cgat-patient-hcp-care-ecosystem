/**
 * useAudioMixer — React hook wrapping the audio-mixer edge function
 *
 * Provides 6 audio processing capabilities:
 * - mix: Mix multiple audio tracks (voice, music, SFX, ambient)
 * - normalize: Broadcast-standard loudness normalization (-16 LUFS)
 * - add_background: Add background music with ducking
 * - remove_background: Vocal separation / background removal
 * - enhance: Noise reduction, de-essing, compression
 * - analyze: Peak/RMS/LUFS analysis, silence detection
 *
 * Used by: Genie Cast (podcast production), Genie Vibe (recording studio),
 * Genie Mind (audio editing), Pipeline Orchestrator (automated chains)
 *
 * @see supabase/functions/audio-mixer/index.ts — edge function
 * @see src/services/pipelineOrchestrator.ts — automated pipeline chains
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AudioMixerAction = 'mix' | 'normalize' | 'add_background' | 'remove_background' | 'enhance' | 'analyze';

export type AudioTrackType = 'voice' | 'music' | 'sfx' | 'ambient';

export interface AudioTrack {
  url: string;
  type: AudioTrackType;
  volume?: number;     // 0-1, default 1
  pan?: number;        // -1 (left) to 1 (right), default 0
  fadeIn?: number;      // seconds
  fadeOut?: number;     // seconds
  startOffset?: number; // seconds from beginning
}

export interface MixRequest {
  tracks: AudioTrack[];
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  sampleRate?: number;
  duckingEnabled?: boolean;
  duckingAmount?: number; // dB reduction when voice active
}

export interface NormalizeRequest {
  audioUrl: string;
  targetLoudness?: number; // LUFS, default -16
  peakLimit?: number;      // dBFS, default -1
}

export interface AddBackgroundRequest {
  voiceUrl: string;
  musicUrl: string;
  musicVolume?: number;    // 0-1
  duckingEnabled?: boolean;
  duckingAmount?: number;  // dB reduction
}

export interface RemoveBackgroundRequest {
  audioUrl: string;
  mode?: 'vocals_only' | 'instrumental_only';
}

export interface EnhanceRequest {
  audioUrl: string;
  noiseReduction?: boolean;
  deEssing?: boolean;
  compression?: boolean;
  equalization?: 'podcast' | 'music' | 'voice' | 'custom';
}

export interface AnalyzeRequest {
  audioUrl: string;
}

export interface AudioAnalysisResult {
  peakDb: number;
  rmsDb: number;
  lufs: number;
  duration: number;
  silenceRegions: Array<{ start: number; end: number }>;
  sampleRate: number;
  channels: number;
}

export interface AudioMixerResult {
  success: boolean;
  outputUrl?: string;
  analysis?: AudioAnalysisResult;
  error?: string;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAudioMixer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<AudioMixerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invokeAudioMixer = useCallback(async (
    action: AudioMixerAction,
    payload: Record<string, unknown>,
  ): Promise<AudioMixerResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('audio-mixer', {
        body: { action, ...payload },
      });

      if (fnError) {
        const result: AudioMixerResult = { success: false, error: fnError.message };
        setLastResult(result);
        setError(fnError.message);
        return result;
      }

      const result: AudioMixerResult = data;
      setLastResult(result);
      return result;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Audio mixer failed';
      const result: AudioMixerResult = { success: false, error: errorMsg };
      setLastResult(result);
      setError(errorMsg);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /** Mix multiple audio tracks with volume, pan, fade controls */
  const mix = useCallback((request: MixRequest) =>
    invokeAudioMixer('mix', request as unknown as Record<string, unknown>), [invokeAudioMixer]);

  /** Normalize audio to broadcast standard (-16 LUFS) */
  const normalize = useCallback((request: NormalizeRequest) =>
    invokeAudioMixer('normalize', request as unknown as Record<string, unknown>), [invokeAudioMixer]);

  /** Add background music with auto-ducking */
  const addBackground = useCallback((request: AddBackgroundRequest) =>
    invokeAudioMixer('add_background', request as unknown as Record<string, unknown>), [invokeAudioMixer]);

  /** Remove background noise / separate vocals */
  const removeBackground = useCallback((request: RemoveBackgroundRequest) =>
    invokeAudioMixer('remove_background', request as unknown as Record<string, unknown>), [invokeAudioMixer]);

  /** Enhance audio: noise reduction, de-essing, compression */
  const enhance = useCallback((request: EnhanceRequest) =>
    invokeAudioMixer('enhance', request as unknown as Record<string, unknown>), [invokeAudioMixer]);

  /** Analyze audio: peak, RMS, LUFS, silence detection */
  const analyze = useCallback((request: AnalyzeRequest) =>
    invokeAudioMixer('analyze', request as unknown as Record<string, unknown>), [invokeAudioMixer]);

  return {
    // Actions
    mix,
    normalize,
    addBackground,
    removeBackground,
    enhance,
    analyze,
    // Raw invoke for custom actions
    invokeAudioMixer,
    // State
    isProcessing,
    lastResult,
    error,
  };
}
