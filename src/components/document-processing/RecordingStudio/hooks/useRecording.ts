/**
 * Recording Hook - Handles MediaRecorder and recording state
 * Uses AudioMixer for dynamic audio capture during recording.
 * 
 * Key improvements:
 * - Audio can be started/stopped/replayed during recording without losing session
 * - IndexedDB persistence for long recordings (survives tab/browser issues)
 * - Stream health monitoring with automatic recovery warnings
 * - Visibility change handling (tab switching protection)
 * - Dynamic stream acquisition via getStream function (prevents stale closures)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { RecordingState } from '../types';
import { useRecordingAudioMixer } from './useRecordingAudioMixer';
import { useRecordingPersistence } from './useRecordingPersistence';

// Constants for configuration
const RECORDING_QUALITY = {
  low: 1_000_000,
  medium: 2_500_000,
  high: 5_000_000,
  ultra: 8_000_000,
} as const;

const CHUNK_INTERVAL_MS = 1000;
const STOP_DELAY_MS = 250;
const RECOVERY_TOAST_DURATION_MS = 10000;
const ERROR_TOAST_DURATION_MS = 5000;
const STREAM_ERROR_TOAST_DURATION_MS = 8000;

interface AudioElements {
  voiceover?: HTMLAudioElement | null;
  tts?: HTMLAudioElement | null;
  music?: HTMLAudioElement | null;
}

type RecordingQualityLevel = 'low' | 'medium' | 'high' | 'ultra';

interface UseRecordingOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  countdownSeconds?: number;
  quality?: RecordingQualityLevel;
  enablePersistence?: boolean;
  /** Maximum recording duration in seconds (0 = unlimited) */
  maxDuration?: number;
  /** Callback when max duration is reached */
  onMaxDurationReached?: () => void;
}

// The hook now accepts a getStream function instead of a direct stream reference
// This prevents stale closure issues when recording mode changes
export function useRecording(
  getStream: () => Promise<MediaStream | null> | MediaStream | null,
  options: UseRecordingOptions = {}
) {
  const { 
    onRecordingComplete, 
    countdownSeconds = 5, 
    quality = 'high',
    enablePersistence = true,
    maxDuration = 0,
    onMaxDurationReached,
  } = options;
  
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    isStopped: false,
    duration: 0,
    recordedChunks: [],
  });
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasRecovery, setHasRecovery] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const lastChunkCountRef = useRef<number>(0);
  const isCancelledRef = useRef(false);
  
  // Use the audio mixer for dynamic audio capture
  const audioMixer = useRecordingAudioMixer();
  
  // Recording persistence for long recordings
  const persistence = useRecordingPersistence();

  /**
   * Connect audio element to recording (can be called anytime during recording)
   */
  const connectAudio = useCallback((audio: HTMLAudioElement | null, type: 'tts' | 'voiceover' | 'music') => {
    if (audioMixer.isActive() && audio) {
      audioMixer.connectAudioElement(audio, type);
    }
  }, [audioMixer]);

  const startCountdown = useCallback((onComplete: () => void) => {
    isCancelledRef.current = false;
    let count = countdownSeconds;
    setCountdown(count);
    
    countdownIntervalRef.current = window.setInterval(() => {
      // Check if cancelled
      if (isCancelledRef.current) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        return;
      }
      
      count--;
      if (count <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        onComplete();
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [countdownSeconds]);

  /**
   * Cancel recording during countdown (before recording actually starts)
   */
  const cancelRecording = useCallback(() => {
    console.log('[Recording] cancelRecording called');
    
    // If in countdown, cancel it
    if (countdownIntervalRef.current) {
      isCancelledRef.current = true;
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      setCountdown(null);
      console.log('[Recording] Countdown cancelled');
      toast.info('Recording cancelled');
      return;
    }
    
    // If recording, stop it without saving
    if (state.isRecording && mediaRecorderRef.current) {
      console.log('[Recording] Cancelling active recording');
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop recorder without triggering onRecordingComplete
      const recorder = mediaRecorderRef.current;
      recorder.ondataavailable = null;
      recorder.onstop = () => {
        console.log('[Recording] Recording cancelled, no blob created');
      };
      
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch (e) {
          console.warn('[Recording] Error stopping during cancel:', e);
        }
      }
      
      // Reset state
      chunksRef.current = [];
      setState({
        isRecording: false,
        isPaused: false,
        isStopped: false,
        duration: 0,
        recordedChunks: [],
      });
      
      audioMixer.cleanup();
      persistence.stopMonitoring();
      
      toast.info('Recording cancelled');
    }
  }, [state.isRecording, audioMixer, persistence]);

  // Track if we've already shown recovery toast
  const recoveryToastShownRef = useRef(false);

  // Check for recoverable sessions on mount - only once
  useEffect(() => {
    const checkForRecovery = async () => {
      if (!enablePersistence) return;
      if (recoveryToastShownRef.current) return;
      
      try {
        const sessions = await persistence.getIncompleteSessions();
        if (sessions.length > 0) {
          setHasRecovery(true);
          const latestSession = sessions[0];
          
          recoveryToastShownRef.current = true;
          toast.info(
            `Found recoverable recording (${Math.floor(latestSession.duration / 60)}m ${latestSession.duration % 60}s). Check your library.`,
            { duration: RECOVERY_TOAST_DURATION_MS, id: 'recovery-toast' }
          );
          console.log('[Recording] Found recoverable sessions:', sessions.length);
        }
      } catch (err) {
        console.warn('[Recording] Failed to check for recovery:', err);
      }
    };
    
    checkForRecovery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle stream health issues
  const handleStreamHealthIssue = useCallback(() => {
    console.warn('[Recording] Stream health issue detected');
    
    if (enablePersistence && chunksRef.current.length > 0) {
      persistence.saveChunks(chunksRef.current, true);
    }
    
    toast.error(
      'Recording interrupted. Your progress has been saved and can be recovered.',
      { duration: STREAM_ERROR_TOAST_DURATION_MS }
    );
  }, [enablePersistence, persistence]);

  const startRecording = useCallback(async () => {
    console.log('[Recording] startRecording called');
    
    if (state.isRecording) {
      console.warn('[Recording] Recording already in progress');
      return;
    }
    
    // Get stream dynamically at recording start time
    // This is the KEY FIX - we get fresh stream when recording starts
    console.log('[Recording] Getting fresh stream...');
    let stream: MediaStream | null;
    try {
      const result = getStream();
      stream = result instanceof Promise ? await result : result;
    } catch (err) {
      console.error('[Recording] Failed to get stream:', err);
      toast.error('Failed to access camera/screen. Please try again.');
      return;
    }
    
    console.log('[Recording] Stream check:', {
      hasStream: !!stream,
      videoTracks: stream?.getVideoTracks().length || 0,
      audioTracks: stream?.getAudioTracks().length || 0,
    });
    
    if (!stream) {
      console.error('[Recording] Cannot start recording: stream is null');
      toast.error('Camera not available. Please enable your camera first.');
      return;
    }
    
    // Store the active stream reference
    activeStreamRef.current = stream;
    
    // Validate stream has active tracks
    const videoTracks = stream.getVideoTracks();
    
    if (videoTracks.length === 0) {
      console.error('[Recording] Stream has no video tracks');
      toast.error('No video source available. Please check your camera.');
      return;
    }
    
    // Check if video track is live
    const videoTrack = videoTracks[0];
    console.log('[Recording] Video track state:', videoTrack.readyState, 'enabled:', videoTrack.enabled);
    
    if (videoTrack.readyState !== 'live') {
      console.error('[Recording] Video track is not live, state:', videoTrack.readyState);
      toast.error('Camera stream ended. Please restart camera.');
      return;
    }
    
    if (!videoTrack.enabled) {
      console.warn('[Recording] Video track is disabled, enabling...');
      videoTrack.enabled = true;
    }

    startCountdown(async () => {
      try {
        // Double-check stream is still valid after countdown
        if (!activeStreamRef.current) {
          console.error('[Recording] Stream became null during countdown');
          toast.error('Recording cancelled - stream unavailable.');
          return;
        }
        
        const currentStream = activeStreamRef.current;
        const currentVideoTrack = currentStream.getVideoTracks()[0];
        if (!currentVideoTrack || currentVideoTrack.readyState !== 'live') {
          console.error('[Recording] Video track died during countdown');
          toast.error('Camera disconnected. Please try again.');
          return;
        }
        
        chunksRef.current = [];
        lastChunkCountRef.current = 0;
        
        if (enablePersistence) {
          try {
            await persistence.createSession();
            console.log('[Recording] Persistence session created');
          } catch (err) {
            console.warn('[Recording] Persistence init failed, continuing without:', err);
          }
        }
        
        // Initialize audio mixer with microphone
        const mixedAudioStream = audioMixer.initialize(currentStream);
        
        // Create combined stream with video + mixed audio
        const videoTracksForRecording = currentStream.getVideoTracks();
        let recordingStream: MediaStream;
        
        if (mixedAudioStream) {
          recordingStream = new MediaStream([
            ...videoTracksForRecording,
            ...mixedAudioStream.getAudioTracks(),
          ]);
          console.log('[Recording] Created stream with dynamic audio mixer');
        } else {
          recordingStream = currentStream;
          console.log('[Recording] Using original stream (no mixer)');
        }
        
        combinedStreamRef.current = recordingStream;
        
        const videoBitsPerSecond = RECORDING_QUALITY[quality] || RECORDING_QUALITY.high;
        
        const mimeOptions = { 
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond,
        };
        let mimeType = mimeOptions.mimeType;
        
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }

        const recorderOptions: MediaRecorderOptions = mimeType ? { mimeType } : {};
        if (videoBitsPerSecond && mimeType) {
          recorderOptions.videoBitsPerSecond = videoBitsPerSecond;
        }

        const recorder = new MediaRecorder(recordingStream, recorderOptions);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
            const chunkCount = chunksRef.current.length;
            
            if (chunkCount % 10 === 0 || chunkCount === 1) {
              console.log('[Recording] Chunk received:', event.data.size, 'bytes, total:', chunkCount);
            }
            
            setState(prev => ({
              ...prev,
              recordedChunks: [...chunksRef.current],
            }));
          }
        };

        recorder.onerror = (event: Event) => {
          const errorEvent = event as ErrorEvent;
          console.error('[Recording] MediaRecorder error:', errorEvent.error);
          
          if (enablePersistence && chunksRef.current.length > 0) {
            persistence.saveChunks(chunksRef.current, true);
            toast.error('Recording error occurred. Progress saved.', { duration: ERROR_TOAST_DURATION_MS });
          }
        };

        recorder.onstop = () => {
          console.log('[Recording] MediaRecorder stopped, chunks:', chunksRef.current.length);
          
          persistence.stopMonitoring();
          
          if (enablePersistence) {
            persistence.completeSession();
          }
          
          const duration = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
          
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            console.log('[Recording] Created blob:', blob.size, 'bytes, duration:', duration, 's');
            onRecordingComplete?.(blob, duration);
          } else {
            console.warn('[Recording] No chunks recorded - attempting recovery from persistence');
            
            if (enablePersistence && persistence.sessionInfo?.id) {
              persistence.recoverSession(persistence.sessionInfo.id).then(recoveredChunks => {
                if (recoveredChunks.length > 0) {
                  const blob = new Blob(recoveredChunks, { type: 'video/webm' });
                  console.log('[Recording] Recovered from persistence:', blob.size, 'bytes');
                  toast.success('Recording recovered from backup!');
                  onRecordingComplete?.(blob, duration);
                } else {
                  const emptyBlob = new Blob([], { type: 'video/webm' });
                  onRecordingComplete?.(emptyBlob, duration);
                }
              });
            } else {
              const emptyBlob = new Blob([], { type: 'video/webm' });
              onRecordingComplete?.(emptyBlob, duration);
            }
          }
          
          audioMixer.cleanup();
        };

        // Set state FIRST before starting recorder and timer
        setState({
          isRecording: true,
          isPaused: false,
          isStopped: false,
          duration: 0,
          recordedChunks: [],
        });
        
        console.log('[Recording] State set to recording=true, starting MediaRecorder...');
        
        try {
          recorder.start(CHUNK_INTERVAL_MS);
          console.log('[Recording] MediaRecorder started successfully, state:', recorder.state);
        } catch (startError) {
          console.error('[Recording] MediaRecorder.start() failed:', startError);
          toast.error('Failed to start recording. Please try again.');
          setState({
            isRecording: false,
            isPaused: false,
            isStopped: false,
            duration: 0,
            recordedChunks: [],
          });
          return;
        }
        
        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;

        if (enablePersistence) {
          persistence.startHealthMonitoring(recordingStream, recorder, handleStreamHealthIssue);
          persistence.startAutoSave(() => chunksRef.current);
        }

        timerRef.current = window.setInterval(() => {
          setState(prev => {
            if (prev.isPaused) return prev;
            const newDuration = prev.duration + 1;
            if (newDuration % 10 === 0) {
              console.log('[Recording] Timer tick:', newDuration, 's');
            }
            
            // Check max duration limit
            if (maxDuration > 0 && newDuration >= maxDuration) {
              console.log('[Recording] Max duration reached:', maxDuration, 's');
              // Use setTimeout to avoid calling stopRecording during setState
              setTimeout(() => {
                onMaxDurationReached?.();
                toast.info(`Maximum recording duration (${Math.floor(maxDuration / 60)}m ${maxDuration % 60}s) reached`);
              }, 0);
            }
            
            return { ...prev, duration: newDuration };
          });
        }, 1000);

        console.log('[Recording] Started successfully with persistence enabled:', enablePersistence);
      } catch (err) {
        console.error('[Recording] Failed to start:', err);
        audioMixer.cleanup();
        persistence.stopMonitoring();
      }
    });
  }, [getStream, state.isRecording, startCountdown, onRecordingComplete, quality, audioMixer, enablePersistence, persistence, handleStreamHealthIssue]);

  const pauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !state.isRecording) return;

    if (state.isPaused) {
      mediaRecorderRef.current.resume();
      if (pauseStartRef.current > 0) {
        pausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = 0;
      }
      setState(prev => ({ ...prev, isPaused: false }));
      console.log('[Recording] Resumed');
    } else {
      mediaRecorderRef.current.pause();
      pauseStartRef.current = Date.now();
      
      if (enablePersistence && chunksRef.current.length > 0) {
        persistence.saveChunks(chunksRef.current, true);
        console.log('[Recording] Chunks saved on pause');
      }
      
      setState(prev => ({ ...prev, isPaused: true }));
      console.log('[Recording] Paused');
    }
  }, [state.isRecording, state.isPaused, enablePersistence, persistence]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) {
      console.warn('[Recording] No MediaRecorder to stop');
      return;
    }

    const recorder = mediaRecorderRef.current;
    console.log('[Recording] Stopping, recorder state:', recorder.state, 'chunks so far:', chunksRef.current.length);

    persistence.stopMonitoring();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (enablePersistence && chunksRef.current.length > 0) {
      persistence.saveChunks(chunksRef.current, true);
    }

    setState(prev => ({ ...prev, isRecording: false, isStopped: true }));

    if (recorder.state !== 'inactive') {
      try {
        recorder.requestData();
        console.log('[Recording] Requested final data chunk');
      } catch (e) {
        console.warn('[Recording] requestData not supported:', e);
      }
      
      setTimeout(() => {
        try {
          if (recorder.state !== 'inactive') {
            recorder.stop();
            console.log('[Recording] MediaRecorder.stop() called');
          }
        } catch (e) {
          console.warn('[Recording] Error stopping recorder:', e);
        }
      }, STOP_DELAY_MS);
    }

    // Cleanup combined stream tracks (but don't stop original camera)
    const currentActiveStream = activeStreamRef.current;
    if (combinedStreamRef.current && combinedStreamRef.current !== currentActiveStream) {
      combinedStreamRef.current.getTracks().forEach(track => {
        if (!currentActiveStream?.getTracks().includes(track)) {
          track.stop();
        }
      });
      combinedStreamRef.current = null;
    }
    
    activeStreamRef.current = null;

    console.log('[Recording] Stop initiated');
  }, [enablePersistence, persistence]);

  // Get current recording blob (useful for preview during pause)
  const getCurrentBlob = useCallback((): Blob | null => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: 'video/webm' });
  }, []);

  // Format duration as MM:SS
  const formattedDuration = `${Math.floor(state.duration / 60).toString().padStart(2, '0')}:${(state.duration % 60).toString().padStart(2, '0')}`;

  // Trim the last N seconds from recording
  const trimLastSeconds = useCallback((seconds: number): Blob | null => {
    if (chunksRef.current.length === 0) return null;
    
    const totalSize = chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
    const bytesPerSecond = totalSize / Math.max(1, state.duration);
    const bytesToTrim = Math.floor(bytesPerSecond * seconds);
    
    let bytesRemoved = 0;
    const trimmedChunks = [...chunksRef.current];
    
    while (bytesRemoved < bytesToTrim && trimmedChunks.length > 1) {
      const removedChunk = trimmedChunks.pop();
      if (removedChunk) {
        bytesRemoved += removedChunk.size;
      }
    }
    
    if (trimmedChunks.length > 0) {
      chunksRef.current = trimmedChunks;
      const newDuration = Math.max(0, state.duration - seconds);
      setState(prev => ({
        ...prev,
        duration: newDuration,
        recordedChunks: trimmedChunks,
      }));
      
      return new Blob(trimmedChunks, { type: 'video/webm' });
    }
    
    return null;
  }, [state.duration]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isRecording && enablePersistence) {
        console.log('[Recording] Tab hidden - forcing chunk save');
        if (chunksRef.current.length > 0) {
          persistence.saveChunks(chunksRef.current, true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isRecording, enablePersistence, persistence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      audioMixer.cleanup();
      persistence.stopMonitoring();
    };
  }, [audioMixer, persistence]);

  // Recover a specific session
  const recoverSession = useCallback(async (sessionId: string): Promise<Blob | null> => {
    try {
      const chunks = await persistence.recoverSession(sessionId);
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('[Recording] Recovered session:', blob.size, 'bytes');
        return blob;
      }
    } catch (err) {
      console.error('[Recording] Recovery failed:', err);
    }
    return null;
  }, [persistence]);

  // Clear recovery data
  const clearRecovery = useCallback(async () => {
    try {
      const sessions = await persistence.getIncompleteSessions();
      for (const session of sessions) {
        await persistence.clearSession(session.id);
      }
      setHasRecovery(false);
      console.log('[Recording] Recovery data cleared');
    } catch (err) {
      console.error('[Recording] Failed to clear recovery:', err);
    }
  }, [persistence]);

  return {
    ...state,
    countdown,
    hasRecovery,
    formattedDuration,
    isStreamHealthy: persistence.isStreamHealthy,
    sessionInfo: persistence.sessionInfo,
    startRecording,
    pauseRecording,
    stopRecording,
    cancelRecording,
    trimLastSeconds,
    getCurrentBlob,
    connectAudio,
    recoverSession,
    clearRecovery,
  };
}
