/**
 * Recording Audio Mixer Hook - HYBRID APPROACH
 * Pre-connects and mixes audio sources BEFORE recording starts.
 * 
 * KEY FIX: Audio elements must be connected BEFORE MediaRecorder starts.
 * This prevents timing issues where captureStream() captures empty audio.
 * 
 * Flow:
 * 1. preConnect() - Call when user clicks record (before countdown)
 * 2. Audio elements start playing during countdown
 * 3. initialize() - Called when countdown ends, audio already flowing
 * 4. Recording captures audio that's already playing
 */

import { useRef, useCallback, useEffect } from 'react';

interface PreConnectedAudio {
  element: HTMLAudioElement;
  type: string;
  stream?: MediaStream;
  sourceNode?: MediaStreamAudioSourceNode;
}

export function useRecordingAudioMixer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const preConnectedAudioRef = useRef<Map<string, PreConnectedAudio>>(new Map());
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isActiveRef = useRef(false);
  const isPreConnectedRef = useRef(false);

  /**
   * STEP 1: Pre-connect audio elements BEFORE countdown
   * This sets up the AudioContext and prepares audio elements for capture
   * Call this when user clicks "Record" button
   */
  const preConnect = useCallback((audioElements: {
    tts?: HTMLAudioElement | null;
    voiceover?: HTMLAudioElement | null;
    music?: HTMLAudioElement | null;
  }) => {
    console.log('[AudioMixer] Pre-connecting audio elements before countdown...');
    
    // Create AudioContext early
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    // Create destination early
    if (!destinationRef.current && audioContextRef.current) {
      destinationRef.current = audioContextRef.current.createMediaStreamDestination();
    }
    
    // Resume context if suspended
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Pre-register audio elements (they'll be connected when they start playing)
    const types = ['tts', 'voiceover', 'music'] as const;
    types.forEach(type => {
      const element = audioElements[type];
      if (element) {
        preConnectedAudioRef.current.set(type, { element, type });
        console.log(`[AudioMixer] Pre-registered ${type} element`);
        
        // Set up play listener to capture stream when audio starts
        const handlePlay = () => {
          console.log(`[AudioMixer] ${type} started playing - capturing stream`);
          captureAudioElement(element, type);
        };
        
        // Add listener if not already playing
        if (element.paused) {
          element.addEventListener('play', handlePlay, { once: true });
        } else {
          // Already playing, capture immediately
          captureAudioElement(element, type);
        }
      }
    });
    
    isPreConnectedRef.current = true;
    console.log('[AudioMixer] Pre-connection complete');
    
    return true;
  }, []);

  /**
   * Capture audio from a playing element using captureStream
   */
  const captureAudioElement = useCallback((audio: HTMLAudioElement, type: string) => {
    if (!audioContextRef.current || !destinationRef.current) {
      // Silent early return - context will be initialized at recording start
      console.log(`[AudioMixer] ${type} will be captured when recording starts`);
      return false;
    }
    
    try {
      // Use captureStream for reliable capture
      // @ts-ignore - captureStream is not in all TypeScript definitions
      const stream: MediaStream = audio.captureStream ? audio.captureStream() : audio.mozCaptureStream?.();
      
      if (!stream) {
        console.warn(`[AudioMixer] captureStream not available for ${type}`);
        return false;
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(destinationRef.current);
      
      // Update pre-connected info
      const existing = preConnectedAudioRef.current.get(type);
      if (existing) {
        existing.stream = stream;
        existing.sourceNode = source;
      }
      
      console.log(`[AudioMixer] ✅ ${type} captured and connected to mixer`);
      return true;
    } catch (err: any) {
      console.error(`[AudioMixer] Failed to capture ${type}:`, err.message);
      return false;
    }
  }, []);

  /**
   * STEP 2: Initialize the mixer for recording (called when countdown ends)
   * By now, audio elements should already be playing and captured
   */
  const initialize = useCallback((micStream?: MediaStream): MediaStream | null => {
    try {
      // Reuse existing context if pre-connected
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      if (!destinationRef.current) {
        destinationRef.current = audioContextRef.current.createMediaStreamDestination();
      }
      
      // Resume if suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Add microphone if available
      if (micStream && micStream.getAudioTracks().length > 0) {
        const micSource = audioContextRef.current.createMediaStreamSource(
          new MediaStream([micStream.getAudioTracks()[0]])
        );
        micSource.connect(destinationRef.current);
        micSourceRef.current = micSource;
        console.log('[AudioMixer] Microphone connected to mixer');
      }
      
      isActiveRef.current = true;
      
      const connectedCount = Array.from(preConnectedAudioRef.current.values())
        .filter(a => a.sourceNode).length;
      console.log(`[AudioMixer] Initialized - ${connectedCount} audio sources already connected`);
      
      return destinationRef.current.stream;
    } catch (err) {
      console.error('[AudioMixer] Failed to initialize:', err);
      return null;
    }
  }, []);

  /**
   * Connect an audio element dynamically during recording
   * (For audio added after recording started)
   */
  const connectAudioElement = useCallback((audio: HTMLAudioElement | null, type: string = 'audio') => {
    if (!audio) return false;
    
    // If pre-connected, check if already captured
    const existing = preConnectedAudioRef.current.get(type);
    if (existing?.sourceNode) {
      console.log(`[AudioMixer] ${type} already connected via pre-connect`);
      return true;
    }
    
    // If not active yet, just pre-register
    if (!isActiveRef.current) {
      preConnectedAudioRef.current.set(type, { element: audio, type });
      console.log(`[AudioMixer] ${type} pre-registered (mixer not active yet)`);
      
      // Set up play listener
      const handlePlay = () => captureAudioElement(audio, type);
      if (audio.paused) {
        audio.addEventListener('play', handlePlay, { once: true });
      } else {
        captureAudioElement(audio, type);
      }
      return true;
    }
    
    // Active and needs connection - capture now
    return captureAudioElement(audio, type);
  }, [captureAudioElement]);

  /**
   * Disconnect an audio element from the mixer
   */
  const disconnectAudioElement = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    
    // Find and disconnect by element reference
    preConnectedAudioRef.current.forEach((info, type) => {
      if (info.element === audio && info.sourceNode) {
        try {
          info.sourceNode.disconnect();
          preConnectedAudioRef.current.delete(type);
          console.log(`[AudioMixer] ${type} disconnected`);
        } catch (err) {
          console.error('[AudioMixer] Failed to disconnect:', err);
        }
      }
    });
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
    isPreConnectedRef.current = false;
    
    // Disconnect all sources
    preConnectedAudioRef.current.forEach((info) => {
      try {
        info.sourceNode?.disconnect();
      } catch (e) {
        // Ignore disconnect errors during cleanup
      }
    });
    
    preConnectedAudioRef.current.clear();
    
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
  
  /**
   * Check if pre-connected
   */
  const isPreConnected = useCallback(() => isPreConnectedRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    preConnect,
    initialize,
    connectAudioElement,
    disconnectAudioElement,
    getMixedStream,
    cleanup,
    isActive,
    isPreConnected,
  };
}
