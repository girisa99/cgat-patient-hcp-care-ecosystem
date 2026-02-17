/**
 * Offline Sync Hook
 * Manages offline data storage and synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, any>;
  timestamp: number;
  retries: number;
}

export interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  lastSyncTime: Date | null;
  syncErrors: string[];
}

export interface UseOfflineSyncReturn {
  state: OfflineSyncState;
  queueChange: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) => void;
  syncNow: () => Promise<void>;
  clearQueue: () => void;
  getQueuedItems: () => SyncQueueItem[];
}

const SYNC_QUEUE_KEY = 'cgat_offline_sync_queue';
const MAX_RETRIES = 3;

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingChanges: 0,
    lastSyncTime: null,
    syncErrors: [],
  });

  const syncQueueRef = useRef<SyncQueueItem[]>([]);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        syncQueueRef.current = JSON.parse(stored);
        setState(prev => ({ ...prev, pendingChanges: syncQueueRef.current.length }));
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }, []);

  // Save queue to localStorage whenever it changes
  const persistQueue = useCallback(() => {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueueRef.current));
      setState(prev => ({ ...prev, pendingChanges: syncQueueRef.current.length }));
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('📶 App is online');
      setState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      console.log('📴 App is offline');
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (state.isOnline && syncQueueRef.current.length > 0 && !state.isSyncing) {
      console.log('🔄 Auto-syncing queued changes...');
      syncNow();
    }
  }, [state.isOnline]);

  const queueChange = useCallback((item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) => {
    const newItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };

    syncQueueRef.current.push(newItem);
    persistQueue();
    console.log('📝 Queued change:', newItem);
  }, [persistQueue]);

  const syncNow = useCallback(async () => {
    if (syncQueueRef.current.length === 0) {
      console.log('✅ No changes to sync');
      return;
    }

    if (!state.isOnline) {
      console.log('📴 Cannot sync while offline');
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));
    const errors: string[] = [];
    const successIds: string[] = [];

    for (const item of syncQueueRef.current) {
      try {
        // In a real implementation, this would call Supabase
        console.log(`🔄 Syncing ${item.type} on ${item.table}:`, item.data);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Mark as successful
        successIds.push(item.id);
        console.log(`✅ Synced item ${item.id}`);
      } catch (error) {
        item.retries++;
        const errorMsg = `Failed to sync ${item.table}: ${error}`;
        console.error(errorMsg);
        
        if (item.retries >= MAX_RETRIES) {
          errors.push(errorMsg);
          successIds.push(item.id); // Remove from queue after max retries
        }
      }
    }

    // Remove successfully synced items
    syncQueueRef.current = syncQueueRef.current.filter(
      item => !successIds.includes(item.id)
    );
    persistQueue();

    setState(prev => ({
      ...prev,
      isSyncing: false,
      lastSyncTime: new Date(),
      syncErrors: errors,
    }));

    console.log(`🔄 Sync complete. Remaining: ${syncQueueRef.current.length}`);
  }, [state.isOnline, persistQueue]);

  const clearQueue = useCallback(() => {
    syncQueueRef.current = [];
    persistQueue();
    console.log('🗑️ Sync queue cleared');
  }, [persistQueue]);

  const getQueuedItems = useCallback((): SyncQueueItem[] => {
    return [...syncQueueRef.current];
  }, []);

  return {
    state,
    queueChange,
    syncNow,
    clearQueue,
    getQueuedItems,
  };
};
