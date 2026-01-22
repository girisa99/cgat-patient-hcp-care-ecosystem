/**
 * Bounded History Hook for Universal Editor
 * HIGH FIX: Limits undo/redo history to prevent memory leaks
 */

import { useCallback, useRef, useEffect } from 'react';
import type { ActiveProject } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_HISTORY_SIZE = 50;
const CLEANUP_INTERVAL_MS = 60000; // 1 minute
const BLOB_URL_PATTERN = /^blob:/;

// ============================================================================
// TYPES
// ============================================================================

export interface HistoryState {
  entries: ActiveProject[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  size: number;
  memoryEstimate: number;
}

export interface HistoryActions {
  push: (project: ActiveProject) => void;
  undo: () => ActiveProject | null;
  redo: () => ActiveProject | null;
  clear: () => void;
  getMemoryUsage: () => number;
}

// ============================================================================
// HOOK
// ============================================================================

export function useBoundedHistory(initialProject?: ActiveProject): [HistoryState, HistoryActions] {
  const entriesRef = useRef<ActiveProject[]>(initialProject ? [initialProject] : []);
  const indexRef = useRef<number>(initialProject ? 0 : -1);
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const stateRef = useRef<HistoryState>({
    entries: entriesRef.current,
    currentIndex: indexRef.current,
    canUndo: false,
    canRedo: false,
    size: entriesRef.current.length,
    memoryEstimate: 0,
  });

  // ============================================================================
  // MEMORY CLEANUP
  // ============================================================================

  const cleanupBlobUrls = useCallback((project: ActiveProject) => {
    // Find all blob URLs in the project
    const findBlobUrls = (obj: unknown): string[] => {
      const urls: string[] = [];
      if (typeof obj === 'string' && BLOB_URL_PATTERN.test(obj)) {
        urls.push(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach(item => urls.push(...findBlobUrls(item)));
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(value => urls.push(...findBlobUrls(value)));
      }
      return urls;
    };

    const projectBlobUrls = findBlobUrls(project);
    
    // Revoke blob URLs that are no longer in use
    blobUrlsRef.current.forEach(url => {
      if (!projectBlobUrls.includes(url)) {
        try {
          URL.revokeObjectURL(url);
          blobUrlsRef.current.delete(url);
        } catch (e) {
          // Ignore errors from already-revoked URLs
        }
      }
    });

    // Track new blob URLs
    projectBlobUrls.forEach(url => blobUrlsRef.current.add(url));
  }, []);

  const estimateMemorySize = useCallback((obj: unknown): number => {
    if (obj === null || obj === undefined) return 0;
    if (typeof obj === 'boolean') return 4;
    if (typeof obj === 'number') return 8;
    if (typeof obj === 'string') return obj.length * 2;
    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + estimateMemorySize(item), 0);
    }
    if (typeof obj === 'object') {
      return Object.entries(obj).reduce(
        (sum, [key, value]) => sum + key.length * 2 + estimateMemorySize(value),
        0
      );
    }
    return 0;
  }, []);

  const getMemoryUsage = useCallback((): number => {
    return entriesRef.current.reduce(
      (total, entry) => total + estimateMemorySize(entry),
      0
    );
  }, [estimateMemorySize]);

  // ============================================================================
  // HISTORY OPERATIONS
  // ============================================================================

  const updateState = useCallback(() => {
    stateRef.current = {
      entries: entriesRef.current,
      currentIndex: indexRef.current,
      canUndo: indexRef.current > 0,
      canRedo: indexRef.current < entriesRef.current.length - 1,
      size: entriesRef.current.length,
      memoryEstimate: getMemoryUsage(),
    };
  }, [getMemoryUsage]);

  const push = useCallback((project: ActiveProject) => {
    // Remove any future entries if we're not at the end
    if (indexRef.current < entriesRef.current.length - 1) {
      const removedEntries = entriesRef.current.slice(indexRef.current + 1);
      removedEntries.forEach(entry => cleanupBlobUrls(entry));
      entriesRef.current = entriesRef.current.slice(0, indexRef.current + 1);
    }

    // Deep clone to prevent mutation issues
    const clonedProject = JSON.parse(JSON.stringify(project));
    entriesRef.current.push(clonedProject);
    indexRef.current = entriesRef.current.length - 1;

    // Enforce maximum history size
    if (entriesRef.current.length > MAX_HISTORY_SIZE) {
      const removed = entriesRef.current.shift();
      if (removed) cleanupBlobUrls(removed);
      indexRef.current = Math.max(0, indexRef.current - 1);
    }

    cleanupBlobUrls(clonedProject);
    updateState();
  }, [cleanupBlobUrls, updateState]);

  const undo = useCallback((): ActiveProject | null => {
    if (indexRef.current <= 0) return null;
    
    indexRef.current--;
    updateState();
    return entriesRef.current[indexRef.current];
  }, [updateState]);

  const redo = useCallback((): ActiveProject | null => {
    if (indexRef.current >= entriesRef.current.length - 1) return null;
    
    indexRef.current++;
    updateState();
    return entriesRef.current[indexRef.current];
  }, [updateState]);

  const clear = useCallback(() => {
    // Cleanup all blob URLs
    entriesRef.current.forEach(entry => cleanupBlobUrls(entry));
    
    // Clear all entries
    entriesRef.current = [];
    indexRef.current = -1;
    blobUrlsRef.current.clear();
    
    updateState();
  }, [cleanupBlobUrls, updateState]);

  // ============================================================================
  // PERIODIC CLEANUP
  // ============================================================================

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Force garbage collection hint (browser may ignore)
      if (typeof window !== 'undefined' && 'gc' in window) {
        try {
          (window as unknown as { gc: () => void }).gc();
        } catch (e) {
          // gc() not available in production
        }
      }

      // Log memory usage for debugging
      const memoryUsage = getMemoryUsage();
      const historySize = entriesRef.current.length;
      console.debug(`[History] Size: ${historySize}/${MAX_HISTORY_SIZE}, Memory: ~${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);

      // Aggressive cleanup if memory is high
      if (memoryUsage > 50 * 1024 * 1024 && entriesRef.current.length > 10) { // 50MB
        const toRemove = Math.floor(entriesRef.current.length / 2);
        for (let i = 0; i < toRemove; i++) {
          const removed = entriesRef.current.shift();
          if (removed) cleanupBlobUrls(removed);
        }
        indexRef.current = Math.max(0, indexRef.current - toRemove);
        updateState();
        console.warn(`[History] Aggressive cleanup: removed ${toRemove} entries due to memory pressure`);
      }
    }, CLEANUP_INTERVAL_MS);

    return () => {
      clearInterval(cleanupInterval);
      // Cleanup on unmount
      blobUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore
        }
      });
    };
  }, [cleanupBlobUrls, getMemoryUsage, updateState]);

  // Initialize state
  useEffect(() => {
    updateState();
  }, [updateState]);

  return [
    stateRef.current,
    { push, undo, redo, clear, getMemoryUsage },
  ];
}

// ============================================================================
// UTILITY: Create history-aware reducer wrapper
// ============================================================================

export function createBoundedHistoryReducer<S, A>(
  reducer: (state: S, action: A) => S,
  shouldSaveToHistory: (action: A) => boolean,
  projectExtractor: (state: S) => ActiveProject
) {
  const history: ActiveProject[] = [];
  let historyIndex = -1;

  return (state: S, action: A): S => {
    const newState = reducer(state, action);
    
    if (shouldSaveToHistory(action)) {
      // Truncate future if needed
      if (historyIndex < history.length - 1) {
        history.splice(historyIndex + 1);
      }
      
      // Add new entry
      history.push(JSON.parse(JSON.stringify(projectExtractor(newState))));
      historyIndex = history.length - 1;
      
      // Enforce limit
      if (history.length > MAX_HISTORY_SIZE) {
        history.shift();
        historyIndex--;
      }
    }
    
    return newState;
  };
}
