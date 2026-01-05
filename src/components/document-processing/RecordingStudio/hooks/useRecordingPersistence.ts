/**
 * Recording Persistence Hook
 * 
 * Provides robust state persistence and stream health monitoring to prevent
 * recording session loss during long recordings (5+ minutes).
 * 
 * Key features:
 * - IndexedDB storage for recorded chunks (survives page refresh)
 * - Stream health monitoring with automatic recovery
 * - Visibility change detection (tab switching protection)
 * - Heartbeat to detect silent failures
 * - Auto-save chunks every 10 seconds
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RecordingSession {
  id: string;
  startTime: number;
  lastSaveTime: number;
  duration: number;
  chunkCount: number;
  status: 'active' | 'paused' | 'recovered' | 'completed';
}

const DB_NAME = 'GenieVibeRecordings';
const DB_VERSION = 1;
const STORE_NAME = 'recording_chunks';
const SESSION_STORE = 'sessions';
const CHUNK_SAVE_INTERVAL = 10000; // Save chunks every 10 seconds
const HEALTH_CHECK_INTERVAL = 3000; // Check stream health every 3 seconds
const MAX_RECORDING_DURATION_MS = 3600000; // 1 hour max (browser limitation)

export function useRecordingPersistence() {
  const dbRef = useRef<IDBDatabase | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const chunksToSaveRef = useRef<Blob[]>([]);
  const saveIntervalRef = useRef<number | null>(null);
  const healthCheckIntervalRef = useRef<number | null>(null);
  const lastChunkTimeRef = useRef<number>(Date.now());
  const visibilityHandlerRef = useRef<(() => void) | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreamHealthy, setIsStreamHealthy] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<RecordingSession | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Initialize IndexedDB
  const initDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (dbRef.current) {
        resolve(dbRef.current);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[RecordingPersistence] Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        dbRef.current = request.result;
        console.log('[RecordingPersistence] IndexedDB initialized');
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Chunks store - blob data
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const chunkStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          chunkStore.createIndex('sessionId', 'sessionId', { unique: false });
          chunkStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Sessions store - metadata
        if (!db.objectStoreNames.contains(SESSION_STORE)) {
          db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
        }
      };
    });
  }, []);

  // Create a new recording session
  const createSession = useCallback(async (): Promise<string> => {
    const db = await initDB();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: RecordingSession = {
      id: sessionId,
      startTime: Date.now(),
      lastSaveTime: Date.now(),
      duration: 0,
      chunkCount: 0,
      status: 'active'
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSION_STORE], 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      const request = store.add(session);

      request.onsuccess = () => {
        sessionIdRef.current = sessionId;
        setSessionInfo(session);
        console.log('[RecordingPersistence] Session created:', sessionId);
        resolve(sessionId);
      };

      request.onerror = () => {
        console.error('[RecordingPersistence] Failed to create session:', request.error);
        reject(request.error);
      };
    });
  }, [initDB]);

  // Save chunks to IndexedDB
  const saveChunks = useCallback(async (chunks: Blob[], force = false) => {
    if (chunks.length === 0) return;
    if (!sessionIdRef.current) return;

    try {
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME, SESSION_STORE], 'readwrite');
      const chunkStore = transaction.objectStore(STORE_NAME);
      const sessionStore = transaction.objectStore(SESSION_STORE);

      // Save each chunk
      let savedCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkData = {
          id: `${sessionIdRef.current}_chunk_${Date.now()}_${i}`,
          sessionId: sessionIdRef.current,
          data: chunk,
          timestamp: Date.now(),
          size: chunk.size
        };
        chunkStore.add(chunkData);
        savedCount++;
      }

      // Update session info
      const sessionRequest = sessionStore.get(sessionIdRef.current);
      sessionRequest.onsuccess = () => {
        const session = sessionRequest.result as RecordingSession;
        if (session) {
          session.lastSaveTime = Date.now();
          session.chunkCount += savedCount;
          session.duration = Math.floor((Date.now() - session.startTime) / 1000);
          sessionStore.put(session);
          setSessionInfo(session);
        }
      };

      console.log(`[RecordingPersistence] Saved ${savedCount} chunks to IndexedDB`);
      lastChunkTimeRef.current = Date.now();
    } catch (err) {
      console.error('[RecordingPersistence] Failed to save chunks:', err);
    }
  }, [initDB]);

  // Recover chunks from IndexedDB
  const recoverSession = useCallback(async (sessionId: string): Promise<Blob[]> => {
    try {
      const db = await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('sessionId');
        const request = index.getAll(sessionId);

        request.onsuccess = () => {
          const chunks = request.result
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((c) => c.data as Blob);
          console.log(`[RecordingPersistence] Recovered ${chunks.length} chunks from session:`, sessionId);
          resolve(chunks);
        };

        request.onerror = () => {
          console.error('[RecordingPersistence] Failed to recover session:', request.error);
          reject(request.error);
        };
      });
    } catch (err) {
      console.error('[RecordingPersistence] Recovery failed:', err);
      return [];
    }
  }, [initDB]);

  // Get incomplete sessions (for recovery UI)
  const getIncompleteSessions = useCallback(async (): Promise<RecordingSession[]> => {
    try {
      const db = await initDB();
      
      return new Promise((resolve) => {
        const transaction = db.transaction([SESSION_STORE], 'readonly');
        const store = transaction.objectStore(SESSION_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          const sessions = (request.result as RecordingSession[])
            .filter(s => s.status === 'active' || s.status === 'paused')
            .filter(s => Date.now() - s.lastSaveTime < 86400000); // Within 24 hours
          resolve(sessions);
        };

        request.onerror = () => {
          resolve([]);
        };
      });
    } catch {
      return [];
    }
  }, [initDB]);

  // Clear session data
  const clearSession = useCallback(async (sessionId: string) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME, SESSION_STORE], 'readwrite');
      const chunkStore = transaction.objectStore(STORE_NAME);
      const sessionStore = transaction.objectStore(SESSION_STORE);

      // Delete chunks
      const index = chunkStore.index('sessionId');
      const keysRequest = index.getAllKeys(sessionId);
      keysRequest.onsuccess = () => {
        keysRequest.result.forEach(key => chunkStore.delete(key));
      };

      // Delete session
      sessionStore.delete(sessionId);

      console.log('[RecordingPersistence] Session cleared:', sessionId);
    } catch (err) {
      console.error('[RecordingPersistence] Failed to clear session:', err);
    }
  }, [initDB]);

  // Use ref for sessionInfo in health check to avoid stale closure
  const sessionInfoRef = useRef<RecordingSession | null>(null);
  sessionInfoRef.current = sessionInfo;

  // Start health monitoring for a stream
  const startHealthMonitoring = useCallback((
    stream: MediaStream,
    mediaRecorder: MediaRecorder,
    onHealthIssue: () => void
  ) => {
    streamRef.current = stream;
    mediaRecorderRef.current = mediaRecorder;
    
    // Stop any existing monitoring
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    healthCheckIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const currentSessionInfo = sessionInfoRef.current;
      
      // Check 1: MediaRecorder state
      if (mediaRecorder.state === 'inactive' && currentSessionInfo?.status === 'active') {
        console.warn('[RecordingPersistence] MediaRecorder became inactive unexpectedly');
        setIsStreamHealthy(false);
        toast.error('Recording stopped unexpectedly. Your progress has been saved.', {
          duration: 5000,
          id: 'recording-stopped'
        });
        onHealthIssue();
        return;
      }

      // Check 2: Stream tracks ended
      const videoTracks = stream.getVideoTracks();
      const allTracksEnded = videoTracks.every(t => t.readyState === 'ended');
      if (allTracksEnded && videoTracks.length > 0) {
        console.warn('[RecordingPersistence] All video tracks ended');
        setIsStreamHealthy(false);
        toast.warning('Camera connection lost. Attempting to recover...', {
          duration: 3000,
          id: 'camera-lost'
        });
        onHealthIssue();
        return;
      }

      // Check 3: No new chunks for too long (silent failure)
      const timeSinceLastChunk = now - lastChunkTimeRef.current;
      if (timeSinceLastChunk > 30000 && currentSessionInfo?.status === 'active') {
        console.warn('[RecordingPersistence] No new chunks for 30+ seconds');
        // Don't fail yet, but log warning
        toast.warning('Recording may be stalled. Please check your recording.', {
          duration: 3000,
          id: 'recording-stall-warning'
        });
      }

      // Check 4: Recording duration limit
      if (currentSessionInfo && Date.now() - currentSessionInfo.startTime > MAX_RECORDING_DURATION_MS) {
        console.warn('[RecordingPersistence] Recording exceeded max duration');
        toast.warning('Recording reached 1 hour limit. Please save and start a new recording.', {
          duration: 5000,
          id: 'recording-duration-limit'
        });
      }

      setIsStreamHealthy(true);
    }, HEALTH_CHECK_INTERVAL);

    console.log('[RecordingPersistence] Health monitoring started');
  }, []); // Empty deps - uses refs instead

  // Start auto-save interval
  const startAutoSave = useCallback((getChunks: () => Blob[]) => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    saveIntervalRef.current = window.setInterval(() => {
      if (!autoSaveEnabled) return;
      
      const chunks = getChunks();
      if (chunks.length > 0) {
        const newChunks = chunks.slice(chunksToSaveRef.current.length);
        if (newChunks.length > 0) {
          saveChunks(newChunks);
          chunksToSaveRef.current = chunks;
        }
      }
    }, CHUNK_SAVE_INTERVAL);

    console.log('[RecordingPersistence] Auto-save started');
  }, [autoSaveEnabled, saveChunks]);

  // Handle visibility changes (tab switching) - use ref to avoid dependency on sessionInfo
  const saveChunksRef = useRef(saveChunks);
  saveChunksRef.current = saveChunks;
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentSessionInfo = sessionInfoRef.current;
      if (document.hidden && currentSessionInfo?.status === 'active') {
        console.log('[RecordingPersistence] Tab hidden during recording - saving state');
        // Force save current chunks
        if (chunksToSaveRef.current.length > 0) {
          saveChunksRef.current(chunksToSaveRef.current, true);
        }
        
        toast.info('Recording continues in background. Avoid switching tabs for best quality.', {
          duration: 3000,
          id: 'tab-switch-warning'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityHandlerRef.current = handleVisibilityChange;

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty deps - uses refs

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    sessionIdRef.current = null;
    chunksToSaveRef.current = [];
    setSessionInfo(null);
    console.log('[RecordingPersistence] Monitoring stopped');
  }, []);

  // Complete session (mark as done)
  const completeSession = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      const db = await initDB();
      const transaction = db.transaction([SESSION_STORE], 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      
      const request = store.get(sessionIdRef.current);
      request.onsuccess = () => {
        const session = request.result as RecordingSession;
        if (session) {
          session.status = 'completed';
          session.duration = Math.floor((Date.now() - session.startTime) / 1000);
          store.put(session);
        }
      };

      console.log('[RecordingPersistence] Session completed');
    } catch (err) {
      console.error('[RecordingPersistence] Failed to complete session:', err);
    }
  }, [initDB]);

  return {
    // Session management
    createSession,
    completeSession,
    clearSession,
    getIncompleteSessions,
    recoverSession,
    sessionInfo,
    
    // Health monitoring
    startHealthMonitoring,
    stopMonitoring,
    isStreamHealthy,
    
    // Auto-save
    startAutoSave,
    saveChunks,
    autoSaveEnabled,
    setAutoSaveEnabled,
  };
}
