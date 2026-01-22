/**
 * Auto-Save Hook for Universal Editor
 * Handles draft persistence with debouncing (localStorage-based for P3)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
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
  config: Partial<AutoSaveConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [status, setStatus] = useState<AutoSaveStatus>({
    lastSavedAt: null,
    isSaving: false,
    hasUnsavedChanges: false,
    error: null,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (status.isSaving) return false;
    setStatus(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      localStorage.setItem(`editor_draft_${project.id}`, JSON.stringify({
        project,
        savedAt: new Date().toISOString(),
      }));
      
      setStatus(prev => ({
        ...prev,
        isSaving: false,
        lastSavedAt: new Date().toISOString(),
        hasUnsavedChanges: false,
      }));
      return true;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Save failed',
      }));
      return false;
    }
  }, [project, status.isSaving]);

  // Debounced save on changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!mergedConfig.enabled || !isDirty) return;

    setStatus(prev => ({ ...prev, hasUnsavedChanges: true }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveDraft(), mergedConfig.debounceMs);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [project, isDirty, mergedConfig.enabled, mergedConfig.debounceMs, saveDraft]);

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
        localStorage.setItem(`editor_draft_${project.id}`, JSON.stringify({ project, savedAt: new Date().toISOString() }));
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status.hasUnsavedChanges, project]);

  const loadDraft = useCallback((projectId: string): ActiveProject | null => {
    const localDraft = localStorage.getItem(`editor_draft_${projectId}`);
    if (localDraft) return JSON.parse(localDraft).project;
    return null;
  }, []);

  const discardDraft = useCallback((projectId: string) => {
    localStorage.removeItem(`editor_draft_${projectId}`);
    setStatus(prev => ({ ...prev, hasUnsavedChanges: false }));
    toast.success('Draft discarded');
  }, []);

  return { status, forceSave: saveDraft, loadDraft, discardDraft };
}
