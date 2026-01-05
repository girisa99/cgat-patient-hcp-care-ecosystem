/**
 * Recording Hook - Handles MediaRecorder and recording state
 * Uses AudioMixer for dynamic audio capture during recording.
 * 
 * Key improvements:
 * - Audio can be started/stopped/replayed during recording without losing session
 * - IndexedDB persistence for long recordings (survives tab/browser issues)
 * - Stream health monitoring with automatic recovery warnings
 * - Visibility change handling (tab switching protection)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { RecordingState } from '../types';
import { useRecordingAudioMixer } from './useRecordingAudioMixer';
import { useRecordingPersistence } from './useRecordingPersistence';

interface AudioElements {
  voiceover?: HTMLAudioElement | null;
  tts?: HTMLAudioElement | null;
  music?: HTMLAudioElement | null;
}

interface UseRecordingOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  countdownSeconds?: number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enablePersistence?: boolean;
}

export function useRecording(
  stream: MediaStream | null,
  options: UseRecordingOptions = {}
) {
  const { 
    onRecordingComplete, 
    countdownSeconds = 5, 
    quality = 'high',
    enablePersistence = true 
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
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const lastChunkCountRef = useRef<number>(0);
  
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
    let count = countdownSeconds;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        onComplete();
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [countdownSeconds]);

  // Track if we've already shown recovery toast
  const recoveryToastShownRef = useRef(false);

  // Check for recoverable sessions on mount - only once
  useEffect(() => {
    const checkForRecovery = async () => {
      if (!enablePersistence) return;
      if (recoveryToastShownRef.current) return; // Already shown
      
      try {
        const sessions = await persistence.getIncompleteSessions();
        if (sessions.length > 0) {
          setHasRecovery(true);
          const latestSession = sessions[0];
          
          // Only show toast once per app session
          recoveryToastShownRef.current = true;
          toast.info(
            `Found recoverable recording (${Math.floor(latestSession.duration / 60)}m ${latestSession.duration % 60}s). Check your library.`,
            { duration: 10000, id: 'recovery-toast' }
          );
          console.log('[Recording] Found recoverable sessions:', sessions.length);
        }
      } catch (err) {
        console.warn('[Recording] Failed to check for recovery:', err);
      }
    };
    
    checkForRecovery();
    // Only run once on mount, not on dependency changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle stream health issues
  const handleStreamHealthIssue = useCallback(() => {
    console.warn('[Recording] Stream health issue detected');
    
    // Force save current chunks
    if (enablePersistence && chunksRef.current.length > 0) {
      persistence.saveChunks(chunksRef.current, true);
    }
    
    // Show recovery notification
    toast.error(
      'Recording interrupted. Your progress has been saved and can be recovered.',
      { duration: 8000 }
    );
  }, [enablePersistence, persistence]);

  const startRecording = useCallback(async () => {
    if (!stream || state.isRecording) return;

    startCountdown(async () => {
      try {
        chunksRef.current = [];
        lastChunkCountRef.current = 0;
        
        // Create persistence session for long recordings
        if (enablePersistence) {
          try {
            await persistence.createSession();
            console.log('[Recording] Persistence session created');
          } catch (err) {
            console.warn('[Recording] Persistence init failed, continuing without:', err);
          }
        }
        
        // Initialize audio mixer with microphone
        const mixedAudioStream = audioMixer.initialize(stream);
        
        // Create combined stream with video + mixed audio
        const videoTracks = stream.getVideoTracks();
        let recordingStream: MediaStream;
        
        if (mixedAudioStream) {
          recordingStream = new MediaStream([
            ...videoTracks,
            ...mixedAudioStream.getAudioTracks(),
          ]);
          console.log('[Recording] Created stream with dynamic audio mixer');
        } else {
          // Fallback to original stream
          recordingStream = stream;
          console.log('[Recording] Using original stream (no mixer)');
        }
        
        combinedStreamRef.current = recordingStream;
        
        // Quality settings for video bitrate
        const qualitySettings: Record<string, number> = {
          low: 1000000,
          medium: 2500000,
          high: 5000000,
          ultra: 8000000,
        };
        const videoBitsPerSecond = qualitySettings[quality] || qualitySettings.high;
        
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
            
            // Log periodically (every 10 chunks) to avoid console spam
            if (chunkCount % 10 === 0 || chunkCount === 1) {
              console.log('[Recording] Chunk received:', event.data.size, 'bytes, total:', chunkCount);
            }
            
            setState(prev => ({
              ...prev,
              recordedChunks: [...chunksRef.current],
            }));
          }
        };

        recorder.onerror = (event: any) => {
          console.error('[Recording] MediaRecorder error:', event.error);
          
          // Save chunks on error
          if (enablePersistence && chunksRef.current.length > 0) {
            persistence.saveChunks(chunksRef.current, true);
            toast.error('Recording error occurred. Progress saved.', { duration: 5000 });
          }
        };

        recorder.onstop = () => {
          console.log('[Recording] MediaRecorder stopped, chunks:', chunksRef.current.length);
          
          // Stop health monitoring
          persistence.stopMonitoring();
          
          // Mark session complete
          if (enablePersistence) {
            persistence.completeSession();
          }
          
          // Calculate duration
          const duration = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
          
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            console.log('[Recording] Created blob:', blob.size, 'bytes, duration:', duration, 's');
            onRecordingComplete?.(blob, duration);
          } else {
            console.warn('[Recording] No chunks recorded - attempting recovery from persistence');
            
            // Try to recover from persistence
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
          
          // Cleanup audio mixer
          audioMixer.cleanup();
        };

        // Request data frequently (every 1 second) for better persistence
        recorder.start(1000);
        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;

        // Start health monitoring and auto-save
        if (enablePersistence) {
          persistence.startHealthMonitoring(recordingStream, recorder, handleStreamHealthIssue);
          persistence.startAutoSave(() => chunksRef.current);
        }

        // Start timer
        timerRef.current = window.setInterval(() => {
          setState(prev => {
            if (prev.isPaused) return prev;
            return { ...prev, duration: prev.duration + 1 };
          });
        }, 1000);

        setState({
          isRecording: true,
          isPaused: false,
          isStopped: false,
          duration: 0,
          recordedChunks: [],
        });

        console.log('[Recording] Started with persistence enabled:', enablePersistence);
      } catch (err) {
        console.error('[Recording] Failed to start:', err);
        audioMixer.cleanup();
        persistence.stopMonitoring();
      }
    });
  }, [stream, state.isRecording, startCountdown, onRecordingComplete, quality, audioMixer, enablePersistence, persistence, handleStreamHealthIssue]);

  const pauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !state.isRecording) return;

    if (state.isPaused) {
      // Resume
      mediaRecorderRef.current.resume();
      // Track pause duration
      if (pauseStartRef.current > 0) {
        pausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = 0;
      }
      setState(prev => ({ ...prev, isPaused: false }));
      console.log('[Recording] Resumed');
    } else {
      // Pause
      mediaRecorderRef.current.pause();
      pauseStartRef.current = Date.now();
      
      // Save chunks when pausing (safety save)
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

    // Stop health monitoring
    persistence.stopMonitoring();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Final save before stopping
    if (enablePersistence && chunksRef.current.length > 0) {
      persistence.saveChunks(chunksRef.current, true);
    }

    setState(prev => ({ ...prev, isRecording: false, isStopped: true }));

    if (recorder.state !== 'inactive') {
      // Request final data before stopping - this is important!
      try {
        recorder.requestData();
        console.log('[Recording] Requested final data chunk');
      } catch (e) {
        console.warn('[Recording] requestData not supported:', e);
      }
      
      // Longer delay to ensure the final chunk is captured properly
      // This helps with the "0 chunks recorded" issue
      setTimeout(() => {
        try {
          if (recorder.state !== 'inactive') {
            recorder.stop();
            console.log('[Recording] MediaRecorder.stop() called');
          }
        } catch (e) {
          console.warn('[Recording] Error stopping recorder:', e);
        }
      }, 250); // Increased from 100ms to 250ms
    }

    // Cleanup combined stream tracks (but don't stop original camera)
    if (combinedStreamRef.current && combinedStreamRef.current !== stream) {
      combinedStreamRef.current.getTracks().forEach(track => {
        // Only stop tracks that were created for recording, not camera tracks
        if (!stream?.getTracks().includes(track)) {
          track.stop();
        }
      });
      combinedStreamRef.current = null;
    }

    console.log('[Recording] Stop initiated');
  }, [stream, enablePersistence, persistence]);

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
    
    chunksRef.current = trimmedChunks;
    setState(prev => ({
      ...prev,
      duration: Math.max(0, prev.duration - seconds),
      recordedChunks: trimmedChunks,
    }));
    
    console.log('[Recording] Trimmed', seconds, 'seconds');
    return new Blob(trimmedChunks, { type: 'video/webm' });
  }, [state.duration]);

  // Get current recording blob (for transcription during pause)
  const getCurrentBlob = useCallback((): Blob | null => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: 'video/webm' });
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

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

  // Recover recording from persistence
  const recoverRecording = useCallback(async (sessionId: string): Promise<Blob | null> => {
    try {
      const chunks = await persistence.recoverSession(sessionId);
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('[Recording] Recovered recording:', blob.size, 'bytes');
        toast.success('Recording recovered successfully!');
        return blob;
      }
      return null;
    } catch (err) {
      console.error('[Recording] Recovery failed:', err);
      toast.error('Failed to recover recording');
      return null;
    }
  }, [persistence]);

  // Clear recovery data
  const clearRecoveryData = useCallback(async (sessionId: string) => {
    await persistence.clearSession(sessionId);
    setHasRecovery(false);
  }, [persistence]);

  return {
    ...state,
    countdown,
    formattedDuration: formatDuration(state.duration),
    startRecording,
    pauseRecording,
    stopRecording,
    trimLastSeconds,
    getCurrentBlob,
    // Expose method to connect audio dynamically during recording
    connectAudio,
    // Recovery features
    hasRecovery,
    recoverRecording,
    clearRecoveryData,
    getIncompleteSessions: persistence.getIncompleteSessions,
    isStreamHealthy: persistence.isStreamHealthy,
    sessionInfo: persistence.sessionInfo,
  };
}
