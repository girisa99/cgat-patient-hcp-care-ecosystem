/**
 * Recording Hook - Handles MediaRecorder and recording state
 * Now supports combining multiple audio sources (voiceover, TTS, music) into recording
 */

import { useState, useCallback, useRef } from 'react';
import type { RecordingState } from '../types';

interface AudioSources {
  voiceover?: HTMLAudioElement | null;
  tts?: HTMLAudioElement | null;
  music?: HTMLAudioElement | null;
}

interface UseRecordingOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  countdownSeconds?: number;
  audioSources?: AudioSources;
}

export function useRecording(
  stream: MediaStream | null,
  options: UseRecordingOptions = {}
) {
  const { onRecordingComplete, countdownSeconds = 3, audioSources } = options;
  
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
  const audioContextRef = useRef<AudioContext | null>(null);

  // Create combined stream with all audio sources
  const createCombinedStream = useCallback((
    videoStream: MediaStream,
    audios: AudioSources
  ): MediaStream => {
    try {
      // Create AudioContext for mixing
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const destination = audioContext.createMediaStreamDestination();
      
      // Add microphone audio from video stream
      const audioTracks = videoStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const micSource = audioContext.createMediaStreamSource(
          new MediaStream([audioTracks[0]])
        );
        micSource.connect(destination);
        console.log('[Recording] Added microphone audio');
      }
      
      // Add voiceover audio
      if (audios.voiceover && !audios.voiceover.paused) {
        const voiceoverSource = audioContext.createMediaElementSource(audios.voiceover);
        voiceoverSource.connect(destination);
        voiceoverSource.connect(audioContext.destination); // Also play through speakers
        console.log('[Recording] Added voiceover audio');
      }
      
      // Add TTS audio
      if (audios.tts && !audios.tts.paused) {
        const ttsSource = audioContext.createMediaElementSource(audios.tts);
        ttsSource.connect(destination);
        ttsSource.connect(audioContext.destination);
        console.log('[Recording] Added TTS audio');
      }
      
      // Add music audio
      if (audios.music && !audios.music.paused) {
        const musicSource = audioContext.createMediaElementSource(audios.music);
        musicSource.connect(destination);
        musicSource.connect(audioContext.destination);
        console.log('[Recording] Added music audio');
      }
      
      // Combine video tracks with mixed audio
      const videoTracks = videoStream.getVideoTracks();
      const combinedStream = new MediaStream([
        ...videoTracks,
        ...destination.stream.getAudioTracks(),
      ]);
      
      combinedStreamRef.current = combinedStream;
      console.log('[Recording] Created combined stream with', combinedStream.getTracks().length, 'tracks');
      
      return combinedStream;
    } catch (err) {
      console.error('[Recording] Failed to create combined stream:', err);
      return videoStream; // Fallback to original stream
    }
  }, []);

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
        
        // Create combined stream with audio sources if provided
        let recordingStream = stream;
        if (audioSources) {
          recordingStream = createCombinedStream(stream, audioSources);
        }
        
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        let mimeType = options.mimeType;
        
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }

        const recorder = new MediaRecorder(
          recordingStream, 
          mimeType ? { mimeType } : undefined
        );
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
            // Update state with current chunks for trim functionality
            setState(prev => ({
              ...prev,
              recordedChunks: [...chunksRef.current],
            }));
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const duration = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
          onRecordingComplete?.(blob, duration);
          
          // Cleanup audio context
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
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

        console.log('[Recording] Started with combined audio');
      } catch (err) {
        console.error('[Recording] Failed to start:', err);
      }
    });
  }, [stream, state.isRecording, startCountdown, onRecordingComplete, audioSources, createCombinedStream]);

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

    // Cleanup combined stream
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach(track => track.stop());
      combinedStreamRef.current = null;
    }

    console.log('[Recording] Stopped');
  }, []);

  // Trim the last N seconds from recording
  const trimLastSeconds = useCallback((seconds: number): Blob | null => {
    if (chunksRef.current.length === 0) return null;
    
    // Estimate bytes per second based on total size and duration
    const totalSize = chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
    const bytesPerSecond = totalSize / Math.max(1, state.duration);
    const bytesToTrim = Math.floor(bytesPerSecond * seconds);
    
    // Remove chunks from the end until we've trimmed enough bytes
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

  return {
    ...state,
    countdown,
    formattedDuration: formatDuration(state.duration),
    startRecording,
    pauseRecording,
    stopRecording,
    trimLastSeconds,
    getCurrentBlob,
  };
}
