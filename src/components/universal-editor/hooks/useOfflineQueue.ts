/**
 * Offline Queue Hook for Universal Editor
 * MEDIUM FIX: IndexedDB-based queue for failed API calls with auto-retry
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const DB_NAME = 'editor_offline_queue';
const DB_VERSION = 1;
const STORE_NAME = 'pending_operations';
const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 5000, 15000, 30000, 60000]; // Exponential backoff
const SYNC_CHECK_INTERVAL = 30000; // 30 seconds

// ============================================================================
// TYPES
// ============================================================================

export interface QueuedOperation {
  id: string;
  type: 'api_call' | 'edge_function' | 'storage_upload' | 'database_write';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload: unknown;
  headers?: Record<string, string>;
  retries: number;
  maxRetries: number;
  createdAt: number;
  lastAttemptAt: number | null;
  errorMessage: string | null;
  priority: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface OfflineQueueState {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  failedCount: number;
  lastSyncAt: string | null;
  isSupported: boolean;
}

export interface OfflineQueueActions {
  enqueue: (operation: Omit<QueuedOperation, 'id' | 'retries' | 'createdAt' | 'lastAttemptAt' | 'errorMessage'>) => Promise<string>;
  dequeue: (id: string) => Promise<void>;
  processQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
  getQueuedOperations: () => Promise<QueuedOperation[]>;
}

// ============================================================================
// INDEXEDDB HELPERS
// ============================================================================

let dbInstance: IDBDatabase | null = null;

async function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

async function addToStore(operation: QueuedOperation): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(operation);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function removeFromStore(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function updateInStore(operation: QueuedOperation): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(operation);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getAllFromStore(): Promise<QueuedOperation[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('priority');
    const request = index.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Sort by priority (critical first) then by createdAt
      const sorted = (request.result as QueuedOperation[]).sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt - b.createdAt;
      });
      resolve(sorted);
    };
  });
}

async function clearStore(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================================================
// HOOK
// ============================================================================

export function useOfflineQueue(): [OfflineQueueState, OfflineQueueActions] {
  const [state, setState] = useState<OfflineQueueState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    queueSize: 0,
    failedCount: 0,
    lastSyncAt: null,
    isSupported: typeof indexedDB !== 'undefined',
  });

  const isSyncingRef = useRef(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // QUEUE OPERATIONS
  // ============================================================================

  const refreshQueueSize = useCallback(async () => {
    if (!state.isSupported) return;
    try {
      const operations = await getAllFromStore();
      setState(prev => ({
        ...prev,
        queueSize: operations.length,
        failedCount: operations.filter(op => op.retries >= op.maxRetries).length,
      }));
    } catch (e) {
      console.warn('Failed to refresh queue size:', e);
    }
  }, [state.isSupported]);

  const enqueue = useCallback(async (
    operation: Omit<QueuedOperation, 'id' | 'retries' | 'createdAt' | 'lastAttemptAt' | 'errorMessage'>
  ): Promise<string> => {
    if (!state.isSupported) {
      console.warn('IndexedDB not supported, operation will not be queued');
      throw new Error('Offline queue not supported');
    }

    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullOperation: QueuedOperation = {
      ...operation,
      id,
      retries: 0,
      maxRetries: operation.maxRetries || MAX_RETRIES,
      createdAt: Date.now(),
      lastAttemptAt: null,
      errorMessage: null,
    };

    await addToStore(fullOperation);
    await refreshQueueSize();

    console.log(`[OfflineQueue] Operation ${id} queued (type: ${operation.type})`);
    return id;
  }, [state.isSupported, refreshQueueSize]);

  const dequeue = useCallback(async (id: string): Promise<void> => {
    if (!state.isSupported) return;
    await removeFromStore(id);
    await refreshQueueSize();
    console.log(`[OfflineQueue] Operation ${id} dequeued`);
  }, [state.isSupported, refreshQueueSize]);

  const executeOperation = useCallback(async (operation: QueuedOperation): Promise<boolean> => {
    try {
      const response = await fetch(operation.endpoint, {
        method: operation.method,
        headers: {
          'Content-Type': 'application/json',
          ...operation.headers,
        },
        body: operation.payload ? JSON.stringify(operation.payload) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`[OfflineQueue] Operation ${operation.id} failed:`, error);
      return false;
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (!state.isSupported || !state.isOnline || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const operations = await getAllFromStore();
      let successCount = 0;
      let failedCount = 0;

      for (const operation of operations) {
        // Skip operations that have exceeded max retries
        if (operation.retries >= operation.maxRetries) {
          failedCount++;
          continue;
        }

        // Calculate delay based on retries
        const delay = RETRY_DELAYS[Math.min(operation.retries, RETRY_DELAYS.length - 1)];
        const timeSinceLastAttempt = operation.lastAttemptAt 
          ? Date.now() - operation.lastAttemptAt 
          : delay;

        // Skip if not enough time has passed since last attempt
        if (timeSinceLastAttempt < delay) continue;

        const success = await executeOperation(operation);

        if (success) {
          await removeFromStore(operation.id);
          successCount++;
        } else {
          // Update retry count
          await updateInStore({
            ...operation,
            retries: operation.retries + 1,
            lastAttemptAt: Date.now(),
            errorMessage: 'Execution failed',
          });
        }
      }

      if (successCount > 0) {
        toast.success(`Synced ${successCount} pending operation(s)`, { duration: 3000 });
      }

      setState(prev => ({
        ...prev,
        lastSyncAt: new Date().toISOString(),
        failedCount,
      }));

      await refreshQueueSize();
    } catch (error) {
      console.error('[OfflineQueue] Processing failed:', error);
    } finally {
      isSyncingRef.current = false;
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [state.isSupported, state.isOnline, executeOperation, refreshQueueSize]);

  const clearQueue = useCallback(async () => {
    if (!state.isSupported) return;
    await clearStore();
    setState(prev => ({ ...prev, queueSize: 0, failedCount: 0 }));
    toast.success('Offline queue cleared');
  }, [state.isSupported]);

  const getQueuedOperations = useCallback(async (): Promise<QueuedOperation[]> => {
    if (!state.isSupported) return [];
    return getAllFromStore();
  }, [state.isSupported]);

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast.success('Back online - syncing pending changes...');
      processQueue();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast.warning('You are offline - changes will be synced when connection is restored');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize
    refreshQueueSize();

    // Periodic sync check
    syncIntervalRef.current = setInterval(() => {
      if (state.isOnline && state.queueSize > 0) {
        processQueue();
      }
    }, SYNC_CHECK_INTERVAL);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [processQueue, refreshQueueSize, state.isOnline, state.queueSize]);

  return [
    state,
    { enqueue, dequeue, processQueue, clearQueue, getQueuedOperations },
  ];
}

// ============================================================================
// UTILITY: Wrap fetch with offline queue support
// ============================================================================

export function createQueuedFetch(
  enqueue: OfflineQueueActions['enqueue'],
  isOnline: boolean
) {
  return async function queuedFetch(
    url: string,
    options: RequestInit & { 
      queueIfOffline?: boolean;
      priority?: QueuedOperation['priority'];
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<Response> {
    const { queueIfOffline = true, priority = 'normal', metadata, ...fetchOptions } = options;

    try {
      const response = await fetch(url, fetchOptions);
      return response;
    } catch (error) {
      if (!isOnline && queueIfOffline) {
        await enqueue({
          type: 'api_call',
          endpoint: url,
          method: (fetchOptions.method || 'GET') as QueuedOperation['method'],
          payload: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : null,
          headers: fetchOptions.headers as Record<string, string>,
          priority,
          maxRetries: MAX_RETRIES,
          metadata,
        });
        
        throw new Error('Operation queued for offline sync');
      }
      throw error;
    }
  };
}
