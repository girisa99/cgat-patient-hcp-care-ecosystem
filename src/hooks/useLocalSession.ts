/**
 * useLocalSession - React Hook for Local Session Management
 *
 * Provides a unified API to persist, hydrate, export, and import
 * all session data via localStorage. Works alongside Supabase for
 * instant page-load hydration and offline-friendly session access.
 *
 * Usage:
 *   const { snapshot, exportSession, importSession, clearAll, summary } = useLocalSession();
 */

import { useState, useCallback, useEffect } from 'react';
import {
  localSessionStorage,
  type LocalSessionSnapshot,
} from '@/utils/localSessionStorage';

export interface UseLocalSessionReturn {
  /** Current in-memory snapshot (updated on changes) */
  snapshot: LocalSessionSnapshot | null;
  /** Storage summary for debug panels */
  summary: ReturnType<typeof localSessionStorage.getStorageSummary>;
  /** Export current session as a JSON-serializable snapshot */
  exportSession: () => LocalSessionSnapshot;
  /** Export current session as a downloadable JSON file */
  downloadSession: (filename?: string) => void;
  /** Import a snapshot from a file or object */
  importSession: (snapshot: LocalSessionSnapshot) => { imported: string[]; skipped: string[] };
  /** Import from a JSON file (File API) */
  importFromFile: (file: File) => Promise<{ imported: string[]; skipped: string[] }>;
  /** Clear all local session data */
  clearAll: () => void;
  /** Refresh the in-memory snapshot from localStorage */
  refresh: () => void;
}

export function useLocalSession(): UseLocalSessionReturn {
  const [snapshot, setSnapshot] = useState<LocalSessionSnapshot | null>(null);
  const [summary, setSummary] = useState(() => localSessionStorage.getStorageSummary());

  const refresh = useCallback(() => {
    const snap = localSessionStorage.exportSnapshot();
    setSnapshot(snap);
    setSummary(localSessionStorage.getStorageSummary());
  }, []);

  // Load initial snapshot on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('genie_local_') || e.key.startsWith('genie_session_') || e.key === 'genie-cast-session')) {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refresh]);

  const exportSession = useCallback((): LocalSessionSnapshot => {
    return localSessionStorage.exportSnapshot();
  }, []);

  const downloadSession = useCallback((filename?: string) => {
    const snap = localSessionStorage.exportSnapshot();
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `genie-session-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const importSession = useCallback((snap: LocalSessionSnapshot) => {
    const result = localSessionStorage.importSnapshot(snap);
    refresh();
    return result;
  }, [refresh]);

  const importFromFile = useCallback(async (file: File): Promise<{ imported: string[]; skipped: string[] }> => {
    const text = await file.text();
    const snap: LocalSessionSnapshot = JSON.parse(text);

    if (!snap.version || !snap.createdAt) {
      throw new Error('Invalid session snapshot file');
    }

    return importSession(snap);
  }, [importSession]);

  const clearAll = useCallback(() => {
    localSessionStorage.clearAll();
    refresh();
  }, [refresh]);

  return {
    snapshot,
    summary,
    exportSession,
    downloadSession,
    importSession,
    importFromFile,
    clearAll,
    refresh,
  };
}

export default useLocalSession;
