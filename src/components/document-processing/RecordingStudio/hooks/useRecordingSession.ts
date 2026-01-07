/**
 * Recording Session Hook
 * 
 * Combines recording state, preloaded audio, and teleprompter sync
 * into a single unified interface for the RecordingStudio.
 * 
 * This simplifies the RecordingStudio by removing audio state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRecording } from './useRecording';
import { usePreloadedAudioRecorder } from './usePreloadedAudioRecorder';
import { useTeleprompterSync } from './useTeleprompterSync';
import type { RecordingMode } from './useRecordingStream';

interface AudioConfig {
  ttsUrl?: string | null;
  ttsName?: string;
  musicUrl?: string | null;
  musicName?: string;
  musicLoop?: boolean;
}

interface UseRecordingSessionOptions {
  /** Function to get the video stream */
  getVideoStream: () => Promise<MediaStream | null>;
  /** Microphone stream */
  micStream?: MediaStream | null;
  /** Recording quality */
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  /** Countdown seconds */
  countdownSeconds?: number;
  /** Max recording duration */
  maxDuration?: number;
  /** Callback when recording completes */
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  /** Callback when max duration reached */
  onMaxDurationReached?: () => void;
  /** Script content for teleprompter */
  scriptContent?: string | null;
}

export function useRecordingSession(options: UseRecordingSessionOptions) {
  const {
    getVideoStream,
    micStream,
    quality = 'high',
    countdownSeconds = 5,
    maxDuration = 30 * 60,
    onRecordingComplete,
    onMaxDurationReached,
    scriptContent,
  } = options;

  // Audio configuration state
  const [audioConfig, setAudioConfig] = useState<AudioConfig | null>(null);
  const audioConfigRef = useRef<AudioConfig | null>(null);

  // Pre-loaded audio system
  const preloadedAudio = usePreloadedAudioRecorder({
    micStream,
    getVideoStream,
    enableDucking: true,
    duckedVolume: 0.08,
  });

  // Combined stream getter that includes audio
  const getCombinedStream = useCallback(async (): Promise<MediaStream | null> => {
    if (preloadedAudio.state.isReady) {
      const combined = await preloadedAudio.getRecordingStream();
      if (combined) {
        console.log('[RecordingSession] Using combined stream with audio');
        return combined;
      }
    }
    
    // Fallback to video only
    const videoStream = await getVideoStream();
    console.log('[RecordingSession] Using video-only stream');
    return videoStream;
  }, [preloadedAudio, getVideoStream]);

  // Recording hook
  const recording = useRecording(getCombinedStream, {
    quality,
    countdownSeconds,
    maxDuration,
    enablePersistence: true,
    onRecordingComplete: (blob, duration) => {
      // Stop audio when recording completes
      preloadedAudio.stopPlayback();
      preloadedAudio.cleanup();
      onRecordingComplete?.(blob, duration);
    },
    onMaxDurationReached,
    onRecordingStarted: () => {
      // Start audio playback when recording actually starts
      console.log('[RecordingSession] Recording started - starting audio playback');
      preloadedAudio.startPlayback();
    },
  });

  // Teleprompter sync
  const teleprompter = useTeleprompterSync({
    scriptContent: scriptContent || null,
    audioCurrentTime: preloadedAudio.currentTime,
    audioDuration: preloadedAudio.duration,
    isAudioPlaying: preloadedAudio.isPlaying,
    isRecording: recording.isRecording,
    isPaused: recording.isPaused,
  });

  // Prepare audio before recording
  const prepareAudio = useCallback(async (config: AudioConfig) => {
    audioConfigRef.current = config;
    setAudioConfig(config);

    if (config.ttsUrl || config.musicUrl) {
      await preloadedAudio.prepare({
        tts: config.ttsUrl ? { 
          url: config.ttsUrl, 
          name: config.ttsName || 'TTS', 
          volume: 1.0 
        } : null,
        music: config.musicUrl ? { 
          url: config.musicUrl, 
          name: config.musicName || 'Music', 
          volume: 0.3, 
          loop: config.musicLoop ?? true 
        } : null,
      });
      console.log('[RecordingSession] Audio prepared');
    }
  }, [preloadedAudio]);

  // Start recording with optional audio
  const startRecording = useCallback(async (config?: AudioConfig) => {
    if (config) {
      await prepareAudio(config);
    }
    recording.startRecording();
  }, [prepareAudio, recording]);

  // Pause/resume recording (also pauses/resumes audio)
  const pauseRecording = useCallback(() => {
    if (recording.isPaused) {
      // Resuming
      preloadedAudio.resumePlayback();
    } else {
      // Pausing
      preloadedAudio.pausePlayback();
    }
    recording.pauseRecording();
  }, [recording, preloadedAudio]);

  // Stop recording
  const stopRecording = useCallback(() => {
    preloadedAudio.stopPlayback();
    recording.stopRecording();
  }, [recording, preloadedAudio]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    preloadedAudio.stopPlayback();
    preloadedAudio.cleanup();
    recording.cancelRecording();
  }, [recording, preloadedAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      preloadedAudio.cleanup();
    };
  }, [preloadedAudio]);

  return {
    // Recording state
    isRecording: recording.isRecording,
    isPaused: recording.isPaused,
    duration: recording.duration,
    formattedDuration: recording.formattedDuration,
    countdown: recording.countdown,
    hasRecovery: recording.hasRecovery,
    recordedChunks: recording.recordedChunks,

    // Audio state
    isAudioReady: preloadedAudio.state.isReady,
    isAudioPlaying: preloadedAudio.isPlaying,
    audioCurrentTime: preloadedAudio.currentTime,
    audioDuration: preloadedAudio.duration,

    // Teleprompter state
    teleprompter: {
      currentWordIndex: teleprompter.currentWordIndex,
      totalWords: teleprompter.totalWords,
      progress: teleprompter.progress,
      isActive: teleprompter.isActive,
      words: teleprompter.words,
      reset: teleprompter.reset,
    },

    // Methods
    prepareAudio,
    startRecording,
    pauseRecording,
    stopRecording,
    cancelRecording,
    
    // Raw refs for advanced usage
    preloadedAudio,
    recording,
  };
}
