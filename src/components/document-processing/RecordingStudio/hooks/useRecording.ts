/**
 * Recording Hook - Handles MediaRecorder and recording state
 */

import { useState, useCallback, useRef } from 'react';
import type { RecordingState } from '../types';

interface UseRecordingOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  countdownSeconds?: number;
}

export function useRecording(
  stream: MediaStream | null,
  options: UseRecordingOptions = {}
) {
  const { onRecordingComplete, countdownSeconds = 3 } = options;
  
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
        
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        let mimeType = options.mimeType;
        
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const duration = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
          onRecordingComplete?.(blob, duration);
        };

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

        console.log('[Recording] Started');
      } catch (err) {
        console.error('[Recording] Failed to start:', err);
      }
    });
  }, [stream, state.isRecording, startCountdown, onRecordingComplete]);

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
    if (!mediaRecorderRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState(prev => ({ ...prev, isRecording: false, isStopped: true }));

    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    console.log('[Recording] Stopped');
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    countdown,
    formattedDuration: formatDuration(state.duration),
    startRecording,
    pauseRecording,
    stopRecording,
  };
}
