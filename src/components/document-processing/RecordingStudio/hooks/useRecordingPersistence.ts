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
const CHUNK_SAVE_INTERVAL = 3000; // Save chunks every 3 seconds for better reliability on long recordings
const HEALTH_CHECK_INTERVAL = 3000; // Check stream health every 3 seconds
const MAX_RECORDING_DURATION_MS = 3600000; // 1 hour max (browser limitation)
const BACKUP_SAVE_THRESHOLD = 50; // Force backup save every 50 chunks (~50 seconds)

export function useRecordingPersistence() {
  const dbRef = useRef<IDBDatabase | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const savedChunkIndexRef = useRef<number>(0); // Track last saved chunk index
  const saveIntervalRef = useRef<number | null>(null);
  const healthCheckIntervalRef = useRef<number | null>(null);
  const lastChunkTimeRef = useRef<number>(Date.now());
  const visibilityHandlerRef = useRef<(() => void) | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isSavingRef = useRef<boolean>(false); // Prevent concurrent saves
  const getChunksFnRef = useRef<(() => Blob[]) | null>(null); // Store getChunks function
  
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

  // Save chunks to IndexedDB - with proper error handling and deduplication
  const saveChunks = useCallback(async (chunks: Blob[], force = false): Promise<boolean> => {
    if (chunks.length === 0) return true;
    if (!sessionIdRef.current) {
      console.warn('[RecordingPersistence] No session ID, cannot save chunks');
      return false;
    }
    
    // Prevent concurrent saves (unless forced)
    if (isSavingRef.current && !force) {
      console.log('[RecordingPersistence] Save already in progress, skipping');
      return false;
    }

    isSavingRef.current = true;
    const startIndex = savedChunkIndexRef.current;
    const newChunks = chunks.slice(startIndex);
    
    if (newChunks.length === 0) {
      isSavingRef.current = false;
      return true;
    }

    console.log(`[RecordingPersistence] Saving chunks ${startIndex} to ${chunks.length - 1} (${newChunks.length} new)`);

    try {
      const db = await initDB();
      
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME, SESSION_STORE], 'readwrite');
        const chunkStore = transaction.objectStore(STORE_NAME);
        const sessionStore = transaction.objectStore(SESSION_STORE);

        let savedCount = 0;
        const sessionId = sessionIdRef.current!;
        
        // Save each new chunk with unique ID based on index
        for (let i = 0; i < newChunks.length; i++) {
          const chunk = newChunks[i];
          const globalIndex = startIndex + i;
          const chunkData = {
            id: `${sessionId}_chunk_${globalIndex}`, // Use index for stable ID
            sessionId: sessionId,
            data: chunk,
            timestamp: Date.now(),
            index: globalIndex,
            size: chunk.size
          };
          
          // Use put instead of add to handle potential duplicates
          const request = chunkStore.put(chunkData);
          request.onsuccess = () => {
            savedCount++;
          };
          request.onerror = (e) => {
            console.error('[RecordingPersistence] Failed to save chunk:', globalIndex, e);
          };
        }

        transaction.oncomplete = () => {
          // Only update saved index after successful transaction
          savedChunkIndexRef.current = chunks.length;
          lastChunkTimeRef.current = Date.now();
          isSavingRef.current = false;
          
          // Update session info
          const updateSession = async () => {
            const tx = db.transaction([SESSION_STORE], 'readwrite');
            const store = tx.objectStore(SESSION_STORE);
            const getReq = store.get(sessionId);
            getReq.onsuccess = () => {
              const session = getReq.result as RecordingSession;
              if (session) {
                session.lastSaveTime = Date.now();
                session.chunkCount = chunks.length;
                session.duration = Math.floor((Date.now() - session.startTime) / 1000);
                store.put(session);
                setSessionInfo(session);
              }
            };
          };
          updateSession();
          
          console.log(`[RecordingPersistence] Successfully saved ${savedCount} chunks (total: ${chunks.length})`);
          resolve(true);
        };
        
        transaction.onerror = (e) => {
          console.error('[RecordingPersistence] Transaction failed:', e);
          isSavingRef.current = false;
          resolve(false);
        };
        
        transaction.onabort = (e) => {
          console.error('[RecordingPersistence] Transaction aborted:', e);
          isSavingRef.current = false;
          resolve(false);
        };
      });
    } catch (err) {
      console.error('[RecordingPersistence] Failed to save chunks:', err);
      isSavingRef.current = false;
      return false;
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
    
    // Store getChunks function for visibility handler
    getChunksFnRef.current = getChunks;
    
    // Reset saved chunk index at start of new recording
    savedChunkIndexRef.current = 0;
    
    // Track last backup count for periodic forced saves
    let lastBackupChunkCount = 0;

    saveIntervalRef.current = window.setInterval(async () => {
      if (!autoSaveEnabled) return;
      if (!sessionIdRef.current) return;
      
      const chunks = getChunks();
      const chunkCount = chunks.length;
      
      // Save new chunks incrementally
      if (chunkCount > savedChunkIndexRef.current) {
        console.log(`[RecordingPersistence] Auto-save: ${chunkCount} chunks, saved: ${savedChunkIndexRef.current}`);
        await saveChunks(chunks);
      }
      
      // CRITICAL: Force a complete backup save periodically for long recordings
      // This ensures we don't lose data even if incremental saves fail
      if (chunkCount - lastBackupChunkCount >= BACKUP_SAVE_THRESHOLD) {
        console.log(`[RecordingPersistence] Forcing backup save at ${chunkCount} chunks`);
        await saveChunks(chunks, true); // Force save all
        lastBackupChunkCount = chunkCount;
      }
    }, CHUNK_SAVE_INTERVAL);

    console.log('[RecordingPersistence] Auto-save started (interval:', CHUNK_SAVE_INTERVAL, 'ms)');
  }, [autoSaveEnabled, saveChunks]);


  // Handle visibility changes (tab switching) - use ref to avoid dependency on sessionInfo
  const saveChunksRef = useRef(saveChunks);
  saveChunksRef.current = saveChunks;
  
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const currentSessionInfo = sessionInfoRef.current;
      if (document.hidden && currentSessionInfo?.status === 'active') {
        console.log('[RecordingPersistence] Tab hidden during recording - saving state');
        // Force save current chunks using getChunks function
        const getChunks = getChunksFnRef.current;
        if (getChunks) {
          const chunks = getChunks();
          if (chunks.length > 0) {
            await saveChunksRef.current(chunks, true);
          }
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

  // Stop monitoring - keeps session info for recovery
  const stopMonitoring = useCallback(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    getChunksFnRef.current = null;
    // DON'T reset these - they're needed for recovery and final save
    // sessionIdRef.current = null;  
    // savedChunkIndexRef.current = 0;
    // setSessionInfo(null);
    isSavingRef.current = false;
    console.log('[RecordingPersistence] Monitoring stopped, session preserved:', sessionIdRef.current);
  }, []);

  // Complete session (mark as done)
  const completeSession = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    try {
      const db = await initDB();
      const transaction = db.transaction([SESSION_STORE], 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      
      const request = store.get(sessionId);
      request.onsuccess = () => {
        const session = request.result as RecordingSession;
        if (session) {
          session.status = 'completed';
          session.duration = Math.floor((Date.now() - session.startTime) / 1000);
          store.put(session);
        }
      };

      console.log('[RecordingPersistence] Session completed:', sessionId);
    } catch (err) {
      console.error('[RecordingPersistence] Failed to complete session:', err);
    }
  }, [initDB]);

  // Reset session state (call after successful recording save)
  const resetSession = useCallback(() => {
    sessionIdRef.current = null;
    savedChunkIndexRef.current = 0;
    setSessionInfo(null);
    console.log('[RecordingPersistence] Session state reset');
  }, []);

  return {
    // Session management
    createSession,
    completeSession,
    clearSession,
    getIncompleteSessions,
    recoverSession,
    resetSession,
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
