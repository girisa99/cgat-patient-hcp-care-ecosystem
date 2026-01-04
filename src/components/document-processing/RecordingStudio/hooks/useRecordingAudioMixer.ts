/**
 * Recording Audio Mixer Hook
 * Dynamically captures and mixes audio sources during recording.
 * Solves the issue where audio started/stopped during recording would be lost.
 * 
 * Key features:
 * - Audio elements can be added/removed while recording
 * - Handles TTS/voiceover/music being played, stopped, and replayed
 * - Maintains persistent connections via WeakMap to prevent double-connections
 */

import { useRef, useCallback, useEffect } from 'react';

interface AudioMixerState {
  isActive: boolean;
  connectedSources: Set<HTMLAudioElement>;
}

export function useRecordingAudioMixer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const sourceMapRef = useRef<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>(new WeakMap());
  const connectedElementsRef = useRef<Set<HTMLAudioElement>>(new Set());
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isActiveRef = useRef(false);

  /**
   * Initialize the audio mixer for recording
   * Returns the mixed audio stream to be added to the recording
   */
  const initialize = useCallback((micStream?: MediaStream): MediaStream | null => {
    try {
      // Create AudioContext
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Create destination for mixed audio
      const destination = audioContext.createMediaStreamDestination();
      destinationRef.current = destination;
      
      // Add microphone if available
      if (micStream && micStream.getAudioTracks().length > 0) {
        const micSource = audioContext.createMediaStreamSource(
          new MediaStream([micStream.getAudioTracks()[0]])
        );
        micSource.connect(destination);
        micSourceRef.current = micSource;
        console.log('[AudioMixer] Microphone connected to mixer');
      }
      
      isActiveRef.current = true;
      console.log('[AudioMixer] Initialized');
      
      return destination.stream;
    } catch (err) {
      console.error('[AudioMixer] Failed to initialize:', err);
      return null;
    }
  }, []);

  /**
   * Connect an audio element to the mixer
   * Safe to call multiple times - will only connect once per element
   */
  const connectAudioElement = useCallback((audio: HTMLAudioElement | null, type: string = 'audio') => {
    if (!audio || !audioContextRef.current || !destinationRef.current || !isActiveRef.current) {
      return;
    }

    // Check if already connected via WeakMap
    if (sourceMapRef.current.has(audio)) {
      console.log(`[AudioMixer] ${type} already connected`);
      return;
    }

    try {
      // Resume context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Create source and connect to mixer destination
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(destinationRef.current);
      // Also connect to speakers so user can hear it
      source.connect(audioContextRef.current.destination);
      
      // Store in WeakMap to track connection
      sourceMapRef.current.set(audio, source);
      connectedElementsRef.current.add(audio);
      
      console.log(`[AudioMixer] ${type} connected to mixer`);
    } catch (err: any) {
      // "InvalidStateError" means the audio is already connected to a different context
      // This can happen if the audio element was previously used
      if (err.name === 'InvalidStateError') {
        console.warn(`[AudioMixer] ${type} already has a source in another context - may need fresh Audio element`);
      } else {
        console.error(`[AudioMixer] Failed to connect ${type}:`, err);
      }
    }
  }, []);

  /**
   * Disconnect an audio element from the mixer
   */
  const disconnectAudioElement = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    
    const source = sourceMapRef.current.get(audio);
    if (source) {
      try {
        source.disconnect();
        sourceMapRef.current.delete(audio);
        connectedElementsRef.current.delete(audio);
        console.log('[AudioMixer] Audio element disconnected');
      } catch (err) {
        console.error('[AudioMixer] Failed to disconnect:', err);
      }
    }
  }, []);

  /**
   * Get the mixed audio stream (for adding to recording)
   */
  const getMixedStream = useCallback((): MediaStream | null => {
    return destinationRef.current?.stream || null;
  }, []);

  /**
   * Cleanup the mixer
   */
  const cleanup = useCallback(() => {
    isActiveRef.current = false;
    
    // Disconnect all sources
    connectedElementsRef.current.forEach(audio => {
      const source = sourceMapRef.current.get(audio);
      if (source) {
        try {
          source.disconnect();
        } catch (e) {
          // Ignore disconnect errors during cleanup
        }
      }
    });
    
    // Clear tracking
    connectedElementsRef.current.clear();
    sourceMapRef.current = new WeakMap();
    
    // Disconnect mic
    if (micSourceRef.current) {
      try {
        micSourceRef.current.disconnect();
      } catch (e) {
        // Ignore
      }
      micSourceRef.current = null;
    }
    
    // Close context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignore
      }
      audioContextRef.current = null;
    }
    
    destinationRef.current = null;
    
    console.log('[AudioMixer] Cleaned up');
  }, []);

  /**
   * Check if mixer is active
   */
  const isActive = useCallback(() => isActiveRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    initialize,
    connectAudioElement,
    disconnectAudioElement,
    getMixedStream,
    cleanup,
    isActive,
  };
}
