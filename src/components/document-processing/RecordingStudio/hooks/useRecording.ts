/**
 * Recording Hook - Handles MediaRecorder and recording state
 * Uses AudioMixer for dynamic audio capture during recording.
 * 
 * Key improvement: Audio can be started/stopped/replayed during recording
 * without losing the recording session.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { RecordingState } from '../types';
import { useRecordingAudioMixer } from './useRecordingAudioMixer';

interface AudioElements {
  voiceover?: HTMLAudioElement | null;
  tts?: HTMLAudioElement | null;
  music?: HTMLAudioElement | null;
}

interface UseRecordingOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  countdownSeconds?: number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

export function useRecording(
  stream: MediaStream | null,
  options: UseRecordingOptions = {}
) {
  const { onRecordingComplete, countdownSeconds = 5, quality = 'high' } = options;
  
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    isStopped: false,
    duration: 0,
    recordedChunks: [],
  });
  
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  
  // Use the audio mixer for dynamic audio capture
  const audioMixer = useRecordingAudioMixer();

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

  const startRecording = useCallback(() => {
    if (!stream || state.isRecording) return;

    startCountdown(() => {
      try {
        chunksRef.current = [];
        
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
            setState(prev => ({
              ...prev,
              recordedChunks: [...chunksRef.current],
            }));
          }
        };

        recorder.onerror = (event: any) => {
          console.error('[Recording] MediaRecorder error:', event.error);
          // Don't stop recording on minor errors - just log
        };

        recorder.onstop = () => {
          console.log('[Recording] MediaRecorder stopped, chunks:', chunksRef.current.length);
          
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const duration = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
            console.log('[Recording] Created blob:', blob.size, 'bytes, duration:', duration, 's');
            onRecordingComplete?.(blob, duration);
          } else {
            console.error('[Recording] No chunks recorded!');
          }
          
          // Cleanup audio mixer
          audioMixer.cleanup();
        };

        // Request data every second for reliability
        recorder.start(1000);
        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;

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

        console.log('[Recording] Started with dynamic audio mixer');
      } catch (err) {
        console.error('[Recording] Failed to start:', err);
        audioMixer.cleanup();
      }
    });
  }, [stream, state.isRecording, startCountdown, onRecordingComplete, quality, audioMixer]);

  const pauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !state.isRecording) return;

    if (state.isPaused) {
      // Resume
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      console.log('[Recording] Resumed');
    } else {
      // Pause
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      console.log('[Recording] Paused');
    }
  }, [state.isRecording, state.isPaused]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) {
      console.warn('[Recording] No MediaRecorder to stop');
      return;
    }

    console.log('[Recording] Stopping, recorder state:', mediaRecorderRef.current.state);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState(prev => ({ ...prev, isRecording: false, isStopped: true }));

    if (mediaRecorderRef.current.state !== 'inactive') {
      // Request final data before stopping
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {
        // Ignore if not supported
      }
      mediaRecorderRef.current.stop();
    }

    // Cleanup combined stream tracks
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach(track => track.stop());
      combinedStreamRef.current = null;
    }

    console.log('[Recording] Stopped');
  }, []);

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
    };
  }, [audioMixer]);

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
  };
}
