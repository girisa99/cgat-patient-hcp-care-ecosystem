/**
 * useBlueprintDraft
 * 
 * Database-First persistence for blueprint scene customizations.
 * Pattern: Local state (instant UI) → Debounced auto-save to DB (3s) → localStorage backup
 * 
 * Follows the same architecture as useSupabasePersistence / editor_drafts.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';

const AUTOSAVE_DELAY_MS = 3000;
const LOCAL_STORAGE_PREFIX = 'blueprint_draft_';

export interface BlueprintDraft {
  id: string;
  user_id: string;
  blueprint_id: string;
  customized_scenes: BlueprintScene[];
  script_overrides: Record<string, string>;
  visual_config_overrides: Record<string, Record<string, any>>;
  duration_overrides: Record<string, number>;
  status: 'draft' | 'committed' | 'archived';
  draft_name: string | null;
  change_log: string[];
  version: number;
  created_at: string;
  updated_at: string;
  committed_at: string | null;
}

interface UseBlueprintDraftReturn {
  /** Current scenes (from draft or original) */
  scenes: BlueprintScene[];
  /** Whether a draft exists for this blueprint */
  hasDraft: boolean;
  /** Whether draft is loading from DB */
  isLoading: boolean;
  /** Whether auto-save is in progress */
  isSaving: boolean;
  /** Last saved timestamp */
  lastSavedAt: string | null;
  /** Draft status */
  draftStatus: 'draft' | 'committed' | 'archived' | null;
  /** Update scenes (triggers auto-save) */
  updateScenes: (scenes: BlueprintScene[], description: string) => void;
  /** Explicitly save now (skip debounce) */
  saveNow: () => Promise<void>;
  /** Commit draft (marks as ready for production) */
  commitDraft: () => Promise<void>;
  /** Discard draft and revert to original */
  discardDraft: () => Promise<void>;
  /** Change log entries */
  changeLog: string[];
}

export function useBlueprintDraft(
  blueprintId: string | null,
  originalScenes: BlueprintScene[],
): UseBlueprintDraftReturn {
  const [scenes, setScenes] = useState<BlueprintScene[]>(originalScenes);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<'draft' | 'committed' | 'archived' | null>(null);
  const [changeLog, setChangeLog] = useState<string[]>([]);
  const [version, setVersion] = useState(1);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingScenesRef = useRef<BlueprintScene[] | null>(null);
  const pendingLogRef = useRef<string[]>([]);
  const isMountedRef = useRef(true);

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Reset when blueprint changes
  useEffect(() => {
    setScenes(originalScenes);
    setDraftId(null);
    setHasDraft(false);
    setDraftStatus(null);
    setChangeLog([]);
    setLastSavedAt(null);
    setVersion(1);
    pendingScenesRef.current = null;
    pendingLogRef.current = [];
  }, [blueprintId]);

  // Load existing draft from DB on mount
  useEffect(() => {
    if (!blueprintId) return;

    const loadDraft = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Try localStorage fallback
          const localKey = `${LOCAL_STORAGE_PREFIX}${blueprintId}`;
          const cached = localStorage.getItem(localKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.scenes?.length > 0) {
                setScenes(parsed.scenes);
                setChangeLog(parsed.changeLog || []);
                setHasDraft(true);
                setDraftStatus('draft');
                console.log('[useBlueprintDraft] Loaded from localStorage fallback');
              }
            } catch { /* ignore parse errors */ }
          }
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('blueprint_customization_drafts')
          .select('*')
          .eq('blueprint_id', blueprintId)
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const draftScenes = (data.customized_scenes as any[]) || [];
          if (draftScenes.length > 0) {
            setScenes(draftScenes as BlueprintScene[]);
            setDraftId(data.id);
            setHasDraft(true);
            setDraftStatus(data.status as any);
            setChangeLog((data.change_log as string[]) || []);
            setVersion(data.version || 1);
            setLastSavedAt(data.updated_at);
            console.log('[useBlueprintDraft] Loaded draft from DB, version:', data.version);
          }
        } else {
          // No DB draft — check localStorage fallback
          const localKey = `${LOCAL_STORAGE_PREFIX}${blueprintId}`;
          const cached = localStorage.getItem(localKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.scenes?.length > 0) {
                setScenes(parsed.scenes);
                setChangeLog(parsed.changeLog || []);
                setHasDraft(true);
                console.log('[useBlueprintDraft] Loaded from localStorage (no DB draft)');
              }
            } catch { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('[useBlueprintDraft] Failed to load draft:', err);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    loadDraft();
  }, [blueprintId, originalScenes]);

  // Persist to DB (debounced)
  const persistToDB = useCallback(async () => {
    if (!blueprintId || !pendingScenesRef.current) return;

    const scenesToSave = pendingScenesRef.current;
    const logToSave = [...pendingLogRef.current];
    pendingScenesRef.current = null;
    pendingLogRef.current = [];

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Offline fallback: save to localStorage
        const localKey = `${LOCAL_STORAGE_PREFIX}${blueprintId}`;
        localStorage.setItem(localKey, JSON.stringify({
          scenes: scenesToSave,
          changeLog: logToSave,
          updatedAt: new Date().toISOString(),
        }));
        console.log('[useBlueprintDraft] Saved to localStorage (no auth)');
        setIsSaving(false);
        return;
      }

      const draftPayload = {
        user_id: user.id,
        blueprint_id: blueprintId,
        customized_scenes: scenesToSave as any,
        change_log: logToSave as any,
        status: 'draft' as const,
        version: version + 1,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (draftId) {
        // Update existing draft
        result = await supabase
          .from('blueprint_customization_drafts')
          .update(draftPayload)
          .eq('id', draftId)
          .select()
          .single();
      } else {
        // Create new draft
        result = await supabase
          .from('blueprint_customization_drafts')
          .upsert(draftPayload, {
            onConflict: 'user_id,blueprint_id,status',
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (isMountedRef.current) {
        setDraftId(result.data.id);
        setHasDraft(true);
        setDraftStatus('draft');
        setVersion(result.data.version || version + 1);
        setLastSavedAt(result.data.updated_at);
      }

      // Also save to localStorage as backup
      const localKey = `${LOCAL_STORAGE_PREFIX}${blueprintId}`;
      localStorage.setItem(localKey, JSON.stringify({
        scenes: scenesToSave,
        changeLog: logToSave,
        updatedAt: new Date().toISOString(),
      }));

      console.log('[useBlueprintDraft] Auto-saved to DB, version:', result.data.version);
    } catch (err) {
      console.error('[useBlueprintDraft] Auto-save failed:', err);
      // Fallback to localStorage
      const localKey = `${LOCAL_STORAGE_PREFIX}${blueprintId}`;
      localStorage.setItem(localKey, JSON.stringify({
        scenes: scenesToSave,
        changeLog: logToSave,
        updatedAt: new Date().toISOString(),
      }));
    } finally {
      if (isMountedRef.current) setIsSaving(false);
    }
  }, [blueprintId, draftId, version]);

  // Update scenes with debounced auto-save
  const updateScenes = useCallback((newScenes: BlueprintScene[], description: string) => {
    setScenes(newScenes);
    setHasDraft(true);

    const logEntry = `${new Date().toISOString().slice(11, 19)} — ${description}`;
    setChangeLog(prev => [...prev, logEntry]);

    // Queue for auto-save
    pendingScenesRef.current = newScenes;
    pendingLogRef.current = [...changeLog, logEntry];

    // Debounced save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(persistToDB, AUTOSAVE_DELAY_MS);
  }, [changeLog, persistToDB]);

  // Force immediate save
  const saveNow = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    pendingScenesRef.current = scenes;
    pendingLogRef.current = changeLog;
    await persistToDB();
    toast.success('Draft saved');
  }, [scenes, changeLog, persistToDB]);

  // Commit draft
  const commitDraft = useCallback(async () => {
    if (!draftId) {
      // Save first, then commit
      await saveNow();
    }

    try {
      const { error } = await supabase
        .from('blueprint_customization_drafts')
        .update({
          status: 'committed',
          committed_at: new Date().toISOString(),
        })
        .eq('id', draftId!);

      if (error) throw error;

      setDraftStatus('committed');
      toast.success('Draft committed — ready for production');
    } catch (err) {
      console.error('[useBlueprintDraft] Commit failed:', err);
      toast.error('Failed to commit draft');
    }
  }, [draftId, saveNow]);

  // Discard draft
  const discardDraft = useCallback(async () => {
    try {
      if (draftId) {
        await supabase
          .from('blueprint_customization_drafts')
          .delete()
          .eq('id', draftId);
      }

      // Clear localStorage
      if (blueprintId) {
        localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${blueprintId}`);
      }

      setScenes(originalScenes);
      setDraftId(null);
      setHasDraft(false);
      setDraftStatus(null);
      setChangeLog([]);
      setLastSavedAt(null);
      setVersion(1);

      toast.success('Draft discarded — reverted to original');
    } catch (err) {
      console.error('[useBlueprintDraft] Discard failed:', err);
      toast.error('Failed to discard draft');
    }
  }, [draftId, blueprintId, originalScenes]);

  return {
    scenes,
    hasDraft,
    isLoading,
    isSaving,
    lastSavedAt,
    draftStatus,
    updateScenes,
    saveNow,
    commitDraft,
    discardDraft,
    changeLog,
  };
}
