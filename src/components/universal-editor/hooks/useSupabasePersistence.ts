/**
 * Supabase Persistence Hook for Universal Editor
 * CRITICAL FIX: Replaces localStorage with Supabase for data durability
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ActiveProject } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface PersistenceStatus {
  lastSyncedAt: string | null;
  isSyncing: boolean;
  isOnline: boolean;
  pendingChanges: number;
  error: string | null;
  version: number;
}

export interface EditorDraft {
  id: string;
  user_id: string;
  project_id: string;
  project_data: ActiveProject;
  checkpoints: Record<string, unknown>[];
  partial_results: Record<string, unknown>;
  version: number;
  last_saved_at: string;
  created_at: string;
  updated_at: string;
}

interface OfflineChange {
  id: string;
  type: 'save' | 'checkpoint' | 'partial';
  data: unknown;
  timestamp: number;
  retries: number;
}

const MAX_RETRIES = 5;
const SYNC_DEBOUNCE_MS = 2000;
const OFFLINE_STORAGE_KEY = 'editor_offline_queue';

// ============================================================================
// HOOK
// ============================================================================

export function useSupabasePersistence(userId: string | null) {
  const [status, setStatus] = useState<PersistenceStatus>({
    lastSyncedAt: null,
    isSyncing: false,
    isOnline: navigator.onLine,
    pendingChanges: 0,
    error: null,
    version: 0,
  });

  const offlineQueueRef = useRef<OfflineChange[]>([]);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // ============================================================================
  // ONLINE/OFFLINE DETECTION
  // ============================================================================

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      processOfflineQueue();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load existing offline queue
    loadOfflineQueue();

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // ============================================================================
  // OFFLINE QUEUE MANAGEMENT
  // ============================================================================

  const loadOfflineQueue = useCallback(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        offlineQueueRef.current = JSON.parse(stored);
        setStatus(prev => ({ ...prev, pendingChanges: offlineQueueRef.current.length }));
      }
    } catch (e) {
      console.warn('Failed to load offline queue:', e);
    }
  }, []);

  const persistOfflineQueue = useCallback(() => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineQueueRef.current));
      setStatus(prev => ({ ...prev, pendingChanges: offlineQueueRef.current.length }));
    } catch (e) {
      console.warn('Failed to persist offline queue:', e);
    }
  }, []);

  const addToOfflineQueue = useCallback((change: Omit<OfflineChange, 'id' | 'timestamp' | 'retries'>) => {
    const queueItem: OfflineChange = {
      ...change,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    offlineQueueRef.current.push(queueItem);
    persistOfflineQueue();
    return queueItem.id;
  }, [persistOfflineQueue]);

  const processOfflineQueue = useCallback(async () => {
    if (!status.isOnline || offlineQueueRef.current.length === 0) return;

    const queue = [...offlineQueueRef.current];
    const processed: string[] = [];
    const failed: OfflineChange[] = [];

    for (const item of queue) {
      try {
        if (item.type === 'save') {
          const { projectId, project } = item.data as { projectId: string; project: ActiveProject };
          await saveDraftToSupabase(projectId, project, false);
          processed.push(item.id);
        }
      } catch (error) {
        if (item.retries < MAX_RETRIES) {
          failed.push({ ...item, retries: item.retries + 1 });
        } else {
          console.error(`Offline change ${item.id} failed permanently after ${MAX_RETRIES} retries`);
          processed.push(item.id); // Remove from queue
        }
      }
    }

    // Update queue with failed items only
    offlineQueueRef.current = failed;
    persistOfflineQueue();

    if (processed.length > 0) {
      toast.success(`Synced ${processed.length} offline change(s)`);
    }
  }, [status.isOnline]);

  // ============================================================================
  // SAVE TO SUPABASE
  // ============================================================================

  const saveDraftToSupabase = useCallback(async (
    projectId: string,
    project: ActiveProject,
    showToast = true
  ): Promise<boolean> => {
    if (!userId) {
      // Fall back to localStorage for unauthenticated users
      localStorage.setItem(`editor_draft_${projectId}`, JSON.stringify({
        project,
        savedAt: new Date().toISOString(),
      }));
      return true;
    }

    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // First check if draft exists
      const { data: existing } = await supabase
        .from('editor_drafts')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing draft
        result = await supabase
          .from('editor_drafts')
          .update({
            project_data: JSON.parse(JSON.stringify(project)),
            version: project.version,
            last_saved_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('project_id', projectId)
          .select()
          .single();
      } else {
        // Insert new draft - use raw insert to avoid type issues
        const { data: insertData, error: insertError } = await supabase
          .from('editor_drafts')
          .insert([{
            user_id: userId,
            project_id: projectId,
            project_data: JSON.parse(JSON.stringify(project)),
            version: project.version,
            last_saved_at: new Date().toISOString(),
          }])
          .select()
          .single();
        result = { data: insertData, error: insertError };
      }

      if (result.error) throw result.error;

      if (isMountedRef.current) {
        setStatus(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          version: result.data?.version || prev.version + 1,
        }));
      }

      if (showToast) {
        toast.success('Draft saved to cloud', { duration: 2000 });
      }

      // Also save to localStorage as backup
      localStorage.setItem(`editor_draft_${projectId}`, JSON.stringify({
        project,
        savedAt: new Date().toISOString(),
      }));

      return true;
    } catch (error) {
      console.error('Supabase save failed:', error);

      if (isMountedRef.current) {
        setStatus(prev => ({
          ...prev,
          isSyncing: false,
          error: error instanceof Error ? error.message : 'Save failed',
        }));
      }

      // Queue for offline sync if network error
      if (!status.isOnline || (error instanceof Error && error.message.includes('network'))) {
        addToOfflineQueue({ type: 'save', data: { projectId, project } });
        toast.info('Saved offline - will sync when online');
        return true;
      }

      return false;
    }
  }, [userId, status.isOnline, addToOfflineQueue]);

  // ============================================================================
  // LOAD FROM SUPABASE
  // ============================================================================

  const loadDraftFromSupabase = useCallback(async (
    projectId: string
  ): Promise<ActiveProject | null> => {
    if (!userId) {
      // Fall back to localStorage
      const localDraft = localStorage.getItem(`editor_draft_${projectId}`);
      if (localDraft) return JSON.parse(localDraft).project;
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('editor_drafts')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;

      if (data?.project_data) {
        setStatus(prev => ({
          ...prev,
          lastSyncedAt: data.last_saved_at,
          version: data.version,
        }));
        return data.project_data as unknown as ActiveProject;
      }

      // Fall back to localStorage
      const localDraft = localStorage.getItem(`editor_draft_${projectId}`);
      if (localDraft) return JSON.parse(localDraft).project;

      return null;
    } catch (error) {
      console.error('Failed to load draft from Supabase:', error);
      
      // Fall back to localStorage
      const localDraft = localStorage.getItem(`editor_draft_${projectId}`);
      if (localDraft) return JSON.parse(localDraft).project;
      
      return null;
    }
  }, [userId]);

  // ============================================================================
  // LIST USER DRAFTS
  // ============================================================================

  const listUserDrafts = useCallback(async (): Promise<EditorDraft[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('editor_drafts')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      // Map database response to EditorDraft type
      return (data || []).map(d => ({
        ...d,
        project_data: d.project_data as unknown as ActiveProject,
        checkpoints: (d.checkpoints || []) as Record<string, unknown>[],
        partial_results: (d.partial_results || {}) as Record<string, unknown>,
      })) as EditorDraft[];
    } catch (error) {
      console.error('Failed to list drafts:', error);
      return [];
    }
  }, [userId]);

  // ============================================================================
  // DELETE DRAFT
  // ============================================================================

  const deleteDraft = useCallback(async (projectId: string): Promise<boolean> => {
    if (!userId) {
      localStorage.removeItem(`editor_draft_${projectId}`);
      return true;
    }

    try {
      const { error } = await supabase
        .from('editor_drafts')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) throw error;

      localStorage.removeItem(`editor_draft_${projectId}`);
      toast.success('Draft deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete draft:', error);
      return false;
    }
  }, [userId]);

  // ============================================================================
  // DEBOUNCED SAVE
  // ============================================================================

  const debouncedSave = useCallback((projectId: string, project: ActiveProject) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      saveDraftToSupabase(projectId, project, false);
    }, SYNC_DEBOUNCE_MS);
  }, [saveDraftToSupabase]);

  // ============================================================================
  // SAVE CHECKPOINTS
  // ============================================================================

  const saveCheckpoint = useCallback(async (
    projectId: string,
    checkpoint: Record<string, unknown>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Get current draft
      const { data: current } = await supabase
        .from('editor_drafts')
        .select('checkpoints')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      const currentCheckpoints = (current?.checkpoints as unknown[] || []) as Record<string, unknown>[];
      const updatedCheckpoints = [...currentCheckpoints, checkpoint].slice(-50); // Keep last 50 checkpoints

      const { error } = await supabase
        .from('editor_drafts')
        .update({ checkpoints: JSON.parse(JSON.stringify(updatedCheckpoints)) })
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to save checkpoint:', error);
      return false;
    }
  }, [userId]);

  return {
    status,
    saveDraft: saveDraftToSupabase,
    loadDraft: loadDraftFromSupabase,
    listDrafts: listUserDrafts,
    deleteDraft,
    debouncedSave,
    saveCheckpoint,
    processOfflineQueue,
  };
}
