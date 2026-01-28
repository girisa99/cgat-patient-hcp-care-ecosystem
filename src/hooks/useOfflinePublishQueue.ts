/**
 * useOfflinePublishQueue - IndexedDB-backed offline publishing queue
 * 
 * Enables mobile users to queue content for publishing when offline,
 * with automatic sync when connection is restored.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QueuedPublish {
  id: string;
  contentData: any;
  targetPlatforms: string[];
  status: 'queued' | 'syncing' | 'completed' | 'failed';
  queuedAt: Date;
  retryCount: number;
  errorMessage?: string;
}

interface UseOfflinePublishQueueReturn {
  queue: QueuedPublish[];
  isOnline: boolean;
  isSyncing: boolean;
  queuedCount: number;
  addToQueue: (contentData: any, targetPlatforms: string[]) => Promise<string>;
  removeFromQueue: (id: string) => Promise<void>;
  retryFailed: () => Promise<void>;
  syncQueue: () => Promise<void>;
  clearCompleted: () => Promise<void>;
}

const DB_NAME = 'genie_publish_queue';
const STORE_NAME = 'offline_publishes';
const DB_VERSION = 1;

// IndexedDB helpers
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('queuedAt', 'queuedAt', { unique: false });
      }
    };
  });
};

const getAllFromStore = async (): Promise<QueuedPublish[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

const addToStore = async (item: QueuedPublish): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(item);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const updateInStore = async (item: QueuedPublish): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const deleteFromStore = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const useOfflinePublishQueue = (): UseOfflinePublishQueueReturn => {
  const [queue, setQueue] = useState<QueuedPublish[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load queue from IndexedDB on mount
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const items = await getAllFromStore();
        setQueue(items.sort((a, b) => 
          new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime()
        ));
      } catch (error) {
        console.error('[OfflineQueue] Failed to load queue:', error);
      }
    };
    loadQueue();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing queued posts...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Offline - posts will be queued');
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
    if (isOnline && queue.some(q => q.status === 'queued')) {
      syncQueue();
    }
  }, [isOnline]);

  const addToQueue = useCallback(async (contentData: any, targetPlatforms: string[]): Promise<string> => {
    const id = crypto.randomUUID();
    const item: QueuedPublish = {
      id,
      contentData,
      targetPlatforms,
      status: 'queued',
      queuedAt: new Date(),
      retryCount: 0,
    };

    try {
      await addToStore(item);
      setQueue(prev => [item, ...prev]);
      
      // Also save to Supabase for cross-device sync
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('offline_publish_queue').insert({
          user_id: session.user.id,
          content_data: contentData,
          target_platforms: targetPlatforms,
          status: 'queued',
        });
      }

      toast.success('Added to publish queue');
      return id;
    } catch (error) {
      console.error('[OfflineQueue] Failed to add to queue:', error);
      throw error;
    }
  }, []);

  const removeFromQueue = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteFromStore(id);
      setQueue(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('[OfflineQueue] Failed to remove from queue:', error);
    }
  }, []);

  const syncQueue = useCallback(async (): Promise<void> => {
    if (!isOnline || isSyncing) return;

    const queuedItems = queue.filter(q => q.status === 'queued' || q.status === 'failed');
    if (queuedItems.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of queuedItems) {
      try {
        // Update status to syncing
        const syncingItem = { ...item, status: 'syncing' as const };
        await updateInStore(syncingItem);
        setQueue(prev => prev.map(q => q.id === item.id ? syncingItem : q));

        // TODO: Call actual publishing service here
        // For now, simulate publishing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mark as completed
        const completedItem = { ...item, status: 'completed' as const };
        await updateInStore(completedItem);
        setQueue(prev => prev.map(q => q.id === item.id ? completedItem : q));
        successCount++;

        // Update Supabase record
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from('offline_publish_queue')
            .update({ status: 'completed', synced_at: new Date().toISOString() })
            .eq('user_id', session.user.id)
            .eq('status', 'queued');
        }
      } catch (error) {
        console.error('[OfflineQueue] Failed to sync item:', error);
        const failedItem = { 
          ...item, 
          status: 'failed' as const,
          retryCount: item.retryCount + 1,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
        await updateInStore(failedItem);
        setQueue(prev => prev.map(q => q.id === item.id ? failedItem : q));
        failCount++;
      }
    }

    setIsSyncing(false);

    if (successCount > 0) {
      toast.success(`Published ${successCount} queued post${successCount > 1 ? 's' : ''}`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} post${failCount > 1 ? 's' : ''} failed to publish`);
    }
  }, [queue, isOnline, isSyncing]);

  const retryFailed = useCallback(async (): Promise<void> => {
    const failedItems = queue.filter(q => q.status === 'failed');
    for (const item of failedItems) {
      const retryItem = { ...item, status: 'queued' as const };
      await updateInStore(retryItem);
      setQueue(prev => prev.map(q => q.id === item.id ? retryItem : q));
    }
    
    if (isOnline) {
      await syncQueue();
    }
  }, [queue, isOnline, syncQueue]);

  const clearCompleted = useCallback(async (): Promise<void> => {
    const completedItems = queue.filter(q => q.status === 'completed');
    for (const item of completedItems) {
      await deleteFromStore(item.id);
    }
    setQueue(prev => prev.filter(q => q.status !== 'completed'));
  }, [queue]);

  return {
    queue,
    isOnline,
    isSyncing,
    queuedCount: queue.filter(q => q.status === 'queued').length,
    addToQueue,
    removeFromQueue,
    retryFailed,
    syncQueue,
    clearCompleted,
  };
};

export default useOfflinePublishQueue;
