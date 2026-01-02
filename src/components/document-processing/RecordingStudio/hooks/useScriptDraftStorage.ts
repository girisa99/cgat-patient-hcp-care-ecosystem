/**
 * Hook for managing script draft storage
 * Saves enhanced scripts as drafts if user leaves mid-enhancement
 * Moves to saved state when user accepts all changes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScriptDraft {
  scriptId: string;
  originalContent: string;
  enhancedContent: string;
  status: 'draft' | 'saved';
  changes: any[];
  lastModified: string;
}

interface UseScriptDraftStorageOptions {
  scriptId: string;
  autoSaveInterval?: number; // in milliseconds, default 30 seconds
}

export function useScriptDraftStorage({ 
  scriptId, 
  autoSaveInterval = 30000 
}: UseScriptDraftStorageOptions) {
  const [draft, setDraft] = useState<ScriptDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDraftRef = useRef<Partial<ScriptDraft> | null>(null);

  // Storage key for localStorage fallback
  const storageKey = `script_draft_${scriptId}`;

  // Load existing draft on mount
  useEffect(() => {
    if (!scriptId) return;
    loadDraft();
  }, [scriptId]);

  // Auto-save pending changes
  useEffect(() => {
    if (pendingDraftRef.current && autoSaveInterval > 0) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (pendingDraftRef.current) {
          saveDraft(pendingDraftRef.current, true);
        }
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [draft, autoSaveInterval]);

  const loadDraft = useCallback(async () => {
    if (!scriptId) return;
    
    setIsLoading(true);
    try {
      // First try localStorage for offline/quick access
      const localDraft = localStorage.getItem(storageKey);
      if (localDraft) {
        const parsed = JSON.parse(localDraft) as ScriptDraft;
        setDraft(parsed);
        console.log('[ScriptDraft] Loaded draft from localStorage:', parsed.status);
      }

      // Then try to sync with database if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('generated_media')
          .select('*')
          .eq('metadata->>scriptId', scriptId)
          .eq('metadata->>type', 'script_draft')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const dbDraft: ScriptDraft = {
            scriptId: scriptId,
            originalContent: (data.metadata as any)?.originalContent || '',
            enhancedContent: (data.metadata as any)?.enhancedContent || '',
            status: (data.metadata as any)?.status || 'draft',
            changes: (data.metadata as any)?.changes || [],
            lastModified: data.updated_at,
          };
          
          // Use DB draft if newer than local
          if (!localDraft || new Date(dbDraft.lastModified) > new Date(JSON.parse(localDraft).lastModified)) {
            setDraft(dbDraft);
            localStorage.setItem(storageKey, JSON.stringify(dbDraft));
            console.log('[ScriptDraft] Loaded draft from database:', dbDraft.status);
          }
        }
      }
    } catch (error) {
      console.error('[ScriptDraft] Error loading draft:', error);
    } finally {
      setIsLoading(false);
    }
  }, [scriptId, storageKey]);

  const saveDraft = useCallback(async (
    draftData: Partial<ScriptDraft>,
    silent: boolean = false
  ) => {
    if (!scriptId) return;

    const updatedDraft: ScriptDraft = {
      scriptId,
      originalContent: draftData.originalContent || draft?.originalContent || '',
      enhancedContent: draftData.enhancedContent || draft?.enhancedContent || '',
      status: draftData.status || 'draft',
      changes: draftData.changes || draft?.changes || [],
      lastModified: new Date().toISOString(),
    };

    setIsSaving(true);
    pendingDraftRef.current = null;

    try {
      // Save to localStorage first (immediate)
      localStorage.setItem(storageKey, JSON.stringify(updatedDraft));
      setDraft(updatedDraft);

      // Then sync to database if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('generated_media')
          .upsert({
            user_id: user.id,
            name: `Script Draft - ${scriptId}`,
            file_type: 'application/json',
            storage_bucket: 'drafts',
            storage_path: `script_drafts/${scriptId}`,
            file_url: '',
            source: 'recording_studio',
            metadata: {
              type: 'script_draft',
              scriptId,
              originalContent: updatedDraft.originalContent,
              enhancedContent: updatedDraft.enhancedContent,
              status: updatedDraft.status,
              changes: updatedDraft.changes,
            },
          }, {
            onConflict: 'user_id,storage_path',
          });

        if (error) {
          console.error('[ScriptDraft] DB save error:', error);
        }
      }

      if (!silent) {
        toast.success(updatedDraft.status === 'saved' 
          ? 'Script saved successfully!' 
          : 'Draft saved');
      }
      
      console.log('[ScriptDraft] Draft saved:', updatedDraft.status);
    } catch (error) {
      console.error('[ScriptDraft] Error saving draft:', error);
      if (!silent) {
        toast.error('Failed to save draft');
      }
    } finally {
      setIsSaving(false);
    }
  }, [scriptId, draft, storageKey]);

  const updateDraft = useCallback((updates: Partial<ScriptDraft>) => {
    // Queue for auto-save
    pendingDraftRef.current = {
      ...pendingDraftRef.current,
      ...updates,
    };

    // Update local state immediately
    setDraft(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const markAsComplete = useCallback(async () => {
    await saveDraft({ status: 'saved' }, false);
  }, [saveDraft]);

  const clearDraft = useCallback(async () => {
    localStorage.removeItem(storageKey);
    setDraft(null);
    pendingDraftRef.current = null;

    // Also remove from database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('generated_media')
          .delete()
          .eq('metadata->>scriptId', scriptId)
          .eq('metadata->>type', 'script_draft');
      }
    } catch (error) {
      console.error('[ScriptDraft] Error clearing draft:', error);
    }
  }, [scriptId, storageKey]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingDraftRef.current) {
        const draftToSave: ScriptDraft = {
          scriptId,
          originalContent: pendingDraftRef.current.originalContent || draft?.originalContent || '',
          enhancedContent: pendingDraftRef.current.enhancedContent || draft?.enhancedContent || '',
          status: 'draft',
          changes: pendingDraftRef.current.changes || draft?.changes || [],
          lastModified: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draftToSave));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [scriptId, draft, storageKey]);

  return {
    draft,
    isLoading,
    isSaving,
    saveDraft,
    updateDraft,
    markAsComplete,
    clearDraft,
    hasDraft: !!draft,
    isDraft: draft?.status === 'draft',
    isSaved: draft?.status === 'saved',
  };
}
