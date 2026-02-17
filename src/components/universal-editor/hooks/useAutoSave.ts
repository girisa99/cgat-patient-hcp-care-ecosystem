/**
 * Auto-Save Hook for Universal Editor
 * Now wired to Supabase persistence for cloud-based drafts
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useSupabasePersistence } from './useSupabasePersistence';
import type { ActiveProject } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface AutoSaveConfig {
  enabled: boolean;
  intervalSeconds: number;
  debounceMs: number;
  showNotifications: boolean;
}

export interface AutoSaveStatus {
  lastSavedAt: string | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
  isOnline: boolean;
  pendingChanges: number;
}

const DEFAULT_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalSeconds: 30,
  debounceMs: 2000,
  showNotifications: false,
};

// ============================================================================
// HOOK
// ============================================================================

export function useAutoSave(
  project: ActiveProject,
  isDirty: boolean,
  userId: string | null,
  config: Partial<AutoSaveConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Use Supabase persistence for cloud sync
  const persistence = useSupabasePersistence(userId);
  
  const [status, setStatus] = useState<AutoSaveStatus>({
    lastSavedAt: null,
    isSaving: false,
    hasUnsavedChanges: false,
    error: null,
    isOnline: persistence.status.isOnline,
    pendingChanges: persistence.status.pendingChanges,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  // Sync status from persistence
  useEffect(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: persistence.status.isOnline,
      pendingChanges: persistence.status.pendingChanges,
      lastSavedAt: persistence.status.lastSyncedAt || prev.lastSavedAt,
    }));
  }, [persistence.status]);

  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (status.isSaving) return false;
    setStatus(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Use Supabase persistence (falls back to localStorage for unauthenticated)
      const success = await persistence.saveDraft(project.id, project, !mergedConfig.showNotifications);
      
      if (success) {
        setStatus(prev => ({
          ...prev,
          isSaving: false,
          lastSavedAt: new Date().toISOString(),
          hasUnsavedChanges: false,
        }));
      } else {
        throw new Error('Save failed');
      }
      
      return success;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Save failed',
      }));
      return false;
    }
  }, [project, status.isSaving, persistence, mergedConfig.showNotifications]);

  // Debounced save on changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!mergedConfig.enabled || !isDirty) return;

    setStatus(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Use debounced save from persistence
    persistence.debouncedSave(project.id, project);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [project, isDirty, mergedConfig.enabled, persistence]);

  // Interval-based save
  useEffect(() => {
    if (!mergedConfig.enabled) return;
    intervalRef.current = setInterval(() => {
      if (isDirty && !status.isSaving) saveDraft();
    }, mergedConfig.intervalSeconds * 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [mergedConfig.enabled, mergedConfig.intervalSeconds, isDirty, status.isSaving, saveDraft]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status.hasUnsavedChanges) {
        // Immediate save on unload - use localStorage as fallback
        localStorage.setItem(`editor_draft_${project.id}`, JSON.stringify({ 
          project, 
          savedAt: new Date().toISOString() 
        }));
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status.hasUnsavedChanges, project]);

  const loadDraft = useCallback(async (projectId: string): Promise<ActiveProject | null> => {
    return persistence.loadDraft(projectId);
  }, [persistence]);

  const discardDraft = useCallback(async (projectId: string) => {
    await persistence.deleteDraft(projectId);
    setStatus(prev => ({ ...prev, hasUnsavedChanges: false }));
    toast.success('Draft discarded');
  }, [persistence]);

  return { 
    status, 
    forceSave: saveDraft, 
    loadDraft, 
    discardDraft,
    // Expose persistence methods
    listDrafts: persistence.listDrafts,
    saveCheckpoint: persistence.saveCheckpoint,
  };
}
