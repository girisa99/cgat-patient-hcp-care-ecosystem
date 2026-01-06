/**
 * Consolidated Audio Element Utility Hook
 * Handles proper audio element creation, cleanup, readyState checks, and timeout handling
 * 
 * Fixes common issues:
 * - Memory leaks from unreleased Audio elements
 * - Race conditions with loadedmetadata event on cached audio
 * - Missing cleanup on component unmount
 */

import { useCallback, useRef, useEffect } from 'react';

export interface AudioElementOptions {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: MediaError | null) => void;
  onLoadedMetadata?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  volume?: number;
  metadataTimeoutMs?: number;
}

export interface AudioElementControls {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seek: (time: number) => void;
  isPlaying: () => boolean;
}

/**
 * Creates a properly managed audio element with cleanup
 */
export function createManagedAudio(
  url: string,
  options: AudioElementOptions = {}
): { audio: HTMLAudioElement; cleanup: () => void } {
  const audio = new Audio(url);
  const {
    onPlay,
    onPause,
    onEnded,
    onError,
    onLoadedMetadata,
    onTimeUpdate,
    volume = 1,
    metadataTimeoutMs = 10000,
  } = options;

  // Set initial volume
  audio.volume = Math.max(0, Math.min(1, volume));

  // Track if metadata callback was fired
  let metadataFired = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Event handlers
  const handlePlay = () => onPlay?.();
  const handlePause = () => onPause?.();
  const handleEnded = () => onEnded?.();
  const handleError = () => onError?.(audio.error);
  const handleTimeUpdate = () => onTimeUpdate?.(audio.currentTime);

  const handleLoadedMetadata = () => {
    if (metadataFired) return;
    metadataFired = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    onLoadedMetadata?.(audio.duration || 0);
  };

  // Check if already loaded (cached audio) - prevents race condition
  if (audio.readyState >= 1 && audio.duration) {
    // Defer to next tick to ensure consistent async behavior
    setTimeout(() => {
      if (!metadataFired) {
        metadataFired = true;
        onLoadedMetadata?.(audio.duration);
      }
    }, 0);
  } else {
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Timeout fallback to prevent hanging
    if (onLoadedMetadata) {
      timeoutId = setTimeout(() => {
        if (!metadataFired) {
          metadataFired = true;
          console.warn('[useAudioElement] Metadata timeout, using current duration:', audio.duration);
          onLoadedMetadata(audio.duration || 0);
        }
      }, metadataTimeoutMs);
    }
  }

  // Add event listeners
  if (onPlay) audio.addEventListener('play', handlePlay);
  if (onPause) audio.addEventListener('pause', handlePause);
  if (onEnded) audio.addEventListener('ended', handleEnded);
  if (onError) audio.addEventListener('error', handleError);
  if (onTimeUpdate) audio.addEventListener('timeupdate', handleTimeUpdate);

  // Cleanup function
  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Remove all event listeners
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    if (onPlay) audio.removeEventListener('play', handlePlay);
    if (onPause) audio.removeEventListener('pause', handlePause);
    if (onEnded) audio.removeEventListener('ended', handleEnded);
    if (onError) audio.removeEventListener('error', handleError);
    if (onTimeUpdate) audio.removeEventListener('timeupdate', handleTimeUpdate);

    // Stop playback and release resources
    audio.pause();
    audio.src = '';
    audio.removeAttribute('src');
    audio.load(); // Reset the audio element
  };

  return { audio, cleanup };
}

/**
 * Hook for managing a single audio element with automatic cleanup
 */
export function useAudioElement(options: AudioElementOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
        audioRef.current = null;
      }
    };
  }, []);

  const loadAudio = useCallback((url: string, audioOptions?: AudioElementOptions) => {
    // Cleanup previous audio
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    const mergedOptions = { ...options, ...audioOptions };
    const { audio, cleanup } = createManagedAudio(url, mergedOptions);
    
    audioRef.current = audio;
    cleanupRef.current = cleanup;

    return audio;
  }, [options]);

  const getControls = useCallback((): AudioElementControls | null => {
    const audio = audioRef.current;
    if (!audio) return null;

    return {
      play: async () => {
        try {
          await audio.play();
        } catch (err) {
          console.error('[useAudioElement] Play failed:', err);
          throw err;
        }
      },
      pause: () => audio.pause(),
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
      },
      setVolume: (volume: number) => {
        audio.volume = Math.max(0, Math.min(1, volume));
      },
      getCurrentTime: () => audio.currentTime,
      getDuration: () => audio.duration || 0,
      seek: (time: number) => {
        audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
      },
      isPlaying: () => !audio.paused && !audio.ended,
    };
  }, []);

  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      audioRef.current = null;
    }
  }, []);

  return {
    audioRef,
    loadAudio,
    getControls,
    cleanup,
  };
}

/**
 * Get audio duration with proper readyState check and timeout
 */
export async function getAudioDuration(
  url: string,
  timeoutMs: number = 10000
): Promise<number> {
  return new Promise((resolve) => {
    const { audio, cleanup } = createManagedAudio(url, {
      onLoadedMetadata: (duration) => {
        resolve(duration);
        cleanup();
      },
      onError: () => {
        resolve(0);
        cleanup();
      },
      metadataTimeoutMs: timeoutMs,
    });

    // Additional timeout fallback
    const timeoutId = setTimeout(() => {
      resolve(audio.duration || 0);
      cleanup();
    }, timeoutMs);

    // Clear extra timeout if metadata loads
    const originalCleanup = cleanup;
    const enhancedCleanup = () => {
      clearTimeout(timeoutId);
      originalCleanup();
    };

    // Override cleanup in the promise handlers
    audio.addEventListener('loadedmetadata', () => clearTimeout(timeoutId), { once: true });
    audio.addEventListener('error', () => clearTimeout(timeoutId), { once: true });
  });
}

/**
 * Play audio one-shot with automatic cleanup after completion
 */
export function playAudioOneShot(
  url: string,
  options: Omit<AudioElementOptions, 'onEnded'> & {
    onComplete?: () => void;
    onError?: (error: MediaError | null) => void;
  } = {}
): { stop: () => void } {
  const { onComplete, onError, ...audioOptions } = options;

  const { audio, cleanup } = createManagedAudio(url, {
    ...audioOptions,
    onEnded: () => {
      onComplete?.();
      cleanup();
    },
    onError: (error) => {
      onError?.(error);
      cleanup();
    },
  });

  audio.play().catch((err) => {
    console.error('[useAudioElement] One-shot play failed:', err);
    onError?.(null);
    cleanup();
  });

  return {
    stop: () => {
      audio.pause();
      cleanup();
    },
  };
}

export default useAudioElement;
