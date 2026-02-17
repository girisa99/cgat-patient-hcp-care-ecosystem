/**
 * Recording Library Hook - Stores recordings in IndexedDB
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { LibraryRecording } from '../types';

const DB_NAME = 'RecordingStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

export function useRecordingLibrary() {
  const [recordings, setRecordings] = useState<LibraryRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  const dbRef = useRef<IDBDatabase | null>(null);

  const initDB = useCallback(async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        dbRef.current = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }, []);

  const loadRecordings = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = dbRef.current || await initDB();
      
      return new Promise<LibraryRecording[]>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');
        
        const results: LibraryRecording[] = [];
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            setRecordings(results);
            setIsLoading(false);
            resolve(results);
          }
        };
        
        request.onerror = () => {
          setIsLoading(false);
          reject(request.error);
        };
      });
    } catch (err) {
      console.error('[Library] Failed to load:', err);
      setIsLoading(false);
      return [];
    }
  }, [initDB]);

  const saveRecording = useCallback(async (
    blob: Blob,
    metadata: {
      name?: string;
      duration?: number;
      scriptTitle?: string | null;
      hasVoiceover?: boolean;
      hasMusic?: boolean;
      hasCaptions?: boolean;
      captionsText?: string;
      format?: string;
    }
  ): Promise<number> => {
    try {
      const db = dbRef.current || await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const recording: Omit<LibraryRecording, 'id'> = {
          blob,
          name: metadata.name || `Recording ${new Date().toLocaleString()}`,
          timestamp: Date.now(),
          duration: metadata.duration || 0,
          size: blob.size,
          type: blob.type,
          scriptTitle: metadata.scriptTitle,
          hasVoiceover: metadata.hasVoiceover,
          hasMusic: metadata.hasMusic,
          hasCaptions: metadata.hasCaptions,
          captionsText: metadata.captionsText,
          format: metadata.format,
        };
        
        const request = store.add(recording);
        
        request.onsuccess = () => {
          console.log('[Library] Recording saved:', request.result);
          loadRecordings();
          resolve(request.result as number);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[Library] Failed to save:', err);
      throw err;
    }
  }, [initDB, loadRecordings]);

  const deleteRecording = useCallback(async (id: number) => {
    try {
      const db = dbRef.current || await initDB();
      
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('[Library] Recording deleted:', id);
          loadRecordings();
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[Library] Failed to delete:', err);
      throw err;
    }
  }, [initDB, loadRecordings]);

  const downloadRecording = useCallback(async (id: number) => {
    try {
      const db = dbRef.current || await initDB();
      
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => {
          const recording = request.result as LibraryRecording;
          if (!recording) {
            reject(new Error('Recording not found'));
            return;
          }
          
          const url = URL.createObjectURL(recording.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = recording.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.webm';
          a.click();
          
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[Library] Failed to download:', err);
      throw err;
    }
  }, [initDB]);

  const getRecordingBlob = useCallback(async (id: number): Promise<Blob | null> => {
    try {
      const db = dbRef.current || await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => {
          const recording = request.result as LibraryRecording;
          resolve(recording?.blob || null);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[Library] Failed to get blob:', err);
      return null;
    }
  }, [initDB]);

  // Get full recording with metadata (for preview with captions etc)
  const getRecording = useCallback(async (id: number): Promise<LibraryRecording | null> => {
    try {
      const db = dbRef.current || await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => {
          const recording = request.result as LibraryRecording;
          resolve(recording || null);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[Library] Failed to get recording:', err);
      return null;
    }
  }, [initDB]);

  // Initialize on mount
  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  return {
    recordings,
    isLoading,
    isOpen,
    setIsOpen,
    saveRecording,
    deleteRecording,
    downloadRecording,
    getRecordingBlob,
    getRecording,
    refresh: loadRecordings,
  };
}
