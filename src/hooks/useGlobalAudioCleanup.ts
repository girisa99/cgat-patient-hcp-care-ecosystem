/**
 * GLOBAL AUDIO CLEANUP HOOK
 * 
 * Ensures all audio stops when:
 * - Page is refreshed/unloaded
 * - User navigates away
 * - Tab becomes hidden
 * - Component unmounts
 */

import { useEffect, useRef, useCallback } from 'react';

// Global registry of active audio cleanup functions
const audioCleanupRegistry = new Set<() => void>();

// Global cleanup function
export function cleanupAllAudio() {
  console.log('[GlobalAudioCleanup] Cleaning up', audioCleanupRegistry.size, 'audio instances');
  audioCleanupRegistry.forEach(cleanup => {
    try {
      cleanup();
    } catch (e) {
      console.error('[GlobalAudioCleanup] Cleanup error:', e);
    }
  });
  audioCleanupRegistry.clear();
}

// Setup global event listeners (runs once)
let globalListenersInitialized = false;

function initGlobalListeners() {
  if (globalListenersInitialized) return;
  globalListenersInitialized = true;

  // Stop audio on page unload
  window.addEventListener('beforeunload', cleanupAllAudio);
  
  // Stop audio when tab becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('[GlobalAudioCleanup] Tab hidden, pausing all audio');
      cleanupAllAudio();
    }
  });
  
  // Stop audio on page hide (iOS Safari)
  window.addEventListener('pagehide', cleanupAllAudio);
  
  console.log('[GlobalAudioCleanup] Global listeners initialized');
}

/**
 * Hook to register audio cleanup with global registry
 * Returns a function to register cleanup callbacks
 */
export function useGlobalAudioCleanup() {
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initialize global listeners
  useEffect(() => {
    initGlobalListeners();
  }, []);

  // Register a cleanup function
  const registerCleanup = useCallback((cleanup: () => void) => {
    // Remove previous cleanup if exists
    if (cleanupRef.current) {
      audioCleanupRegistry.delete(cleanupRef.current);
    }
    
    // Register new cleanup
    cleanupRef.current = cleanup;
    audioCleanupRegistry.add(cleanup);
  }, []);

  // Unregister cleanup
  const unregisterCleanup = useCallback(() => {
    if (cleanupRef.current) {
      audioCleanupRegistry.delete(cleanupRef.current);
      cleanupRef.current = null;
    }
  }, []);

  // Force cleanup now
  const forceCleanup = useCallback(() => {
    if (cleanupRef.current) {
      try {
        cleanupRef.current();
      } catch (e) {
        console.error('[GlobalAudioCleanup] Force cleanup error:', e);
      }
      audioCleanupRegistry.delete(cleanupRef.current);
      cleanupRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      forceCleanup();
    };
  }, [forceCleanup]);

  return {
    registerCleanup,
    unregisterCleanup,
    forceCleanup,
    cleanupAllAudio,
  };
}

export default useGlobalAudioCleanup;
