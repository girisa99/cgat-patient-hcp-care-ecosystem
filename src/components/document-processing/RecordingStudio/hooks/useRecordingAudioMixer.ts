/**
 * Recording Audio Mixer Hook
 * Dynamically captures and mixes audio sources during recording.
 * 
 * CRITICAL FIX: Uses captureStream() instead of createMediaElementSource()
 * because createMediaElementSource can only be called ONCE per audio element
 * for the lifetime of the element. If the element was ever connected to any
 * AudioContext, it cannot be connected again.
 * 
 * Key features:
 * - Audio elements can be added/removed while recording
 * - Handles TTS/voiceover/music being played, stopped, and replayed
 * - Works with audio elements that have already been used
 */

import { useRef, useCallback, useEffect } from 'react';

interface ConnectedAudioInfo {
  sourceNode: MediaStreamAudioSourceNode | MediaElementAudioSourceNode;
  stream: MediaStream;
}

export function useRecordingAudioMixer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const connectedAudioRef = useRef<Map<HTMLAudioElement, ConnectedAudioInfo>>(new Map());
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
      console.log('[AudioMixer] Initialized with captureStream approach');
      
      return destination.stream;
    } catch (err) {
      console.error('[AudioMixer] Failed to initialize:', err);
      return null;
    }
  }, []);

  /**
   * Connect an audio element to the mixer using captureStream()
   * This approach works even if the audio element was previously used
   */
  const connectAudioElement = useCallback((audio: HTMLAudioElement | null, type: string = 'audio') => {
    if (!audio || !audioContextRef.current || !destinationRef.current || !isActiveRef.current) {
      console.log(`[AudioMixer] Cannot connect ${type}: mixer not active or audio null`);
      return false;
    }

    // Check if already connected
    if (connectedAudioRef.current.has(audio)) {
      console.log(`[AudioMixer] ${type} already connected`);
      return true;
    }

    try {
      // Resume context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Use captureStream() to get the audio stream from the element
      // This works even if the element was previously used with another context
      // @ts-ignore - captureStream is not in all TypeScript definitions but is widely supported
      const capturedStream: MediaStream = audio.captureStream ? audio.captureStream() : audio.mozCaptureStream?.();
      
      if (!capturedStream) {
        console.warn(`[AudioMixer] ⚠️ ${type}: captureStream not supported, falling back to createMediaElementSource`);
        // Fallback to createMediaElementSource (may fail if element was used before)
        try {
          const source = audioContextRef.current.createMediaElementSource(audio);
          source.connect(destinationRef.current);
          source.connect(audioContextRef.current.destination);
          connectedAudioRef.current.set(audio, { sourceNode: source, stream: new MediaStream() });
          console.log(`[AudioMixer] ✅ ${type} connected via createMediaElementSource fallback`);
          return true;
        } catch (fallbackErr: any) {
          console.error(`[AudioMixer] Fallback also failed for ${type}:`, fallbackErr.message);
          return false;
        }
      }

      // Create a source from the captured stream
      const source = audioContextRef.current.createMediaStreamSource(capturedStream);
      source.connect(destinationRef.current);
      // Note: No need to connect to speakers - the audio element already plays to speakers
      
      connectedAudioRef.current.set(audio, { sourceNode: source, stream: capturedStream });
      
      console.log(`[AudioMixer] ✅ ${type} connected via captureStream successfully`);
      return true;
    } catch (err: any) {
      console.error(`[AudioMixer] Failed to connect ${type}:`, err.message);
      return false;
    }
  }, []);

  /**
   * Disconnect an audio element from the mixer
   */
  const disconnectAudioElement = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    
    const info = connectedAudioRef.current.get(audio);
    if (info) {
      try {
        info.sourceNode.disconnect();
        connectedAudioRef.current.delete(audio);
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
    connectedAudioRef.current.forEach((info) => {
      try {
        info.sourceNode.disconnect();
      } catch (e) {
        // Ignore disconnect errors during cleanup
      }
    });
    
    // Clear tracking
    connectedAudioRef.current.clear();
    
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
