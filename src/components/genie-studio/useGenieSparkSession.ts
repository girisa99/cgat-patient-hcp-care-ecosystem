/**
 * Hook for managing Genie Spark session persistence and drafts
 * Persists session state to localStorage and syncs drafts to Supabase
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GeneratedContent } from './PostGenerationActions';

export interface GenieSparkDraft {
  id: string;
  title: string;
  content: string;
  type: GeneratedContent['type'];
  sourceType: GeneratedContent['sourceType'];
  duration: number;
  metadata: GeneratedContent['metadata'];
  status: 'draft' | 'saved' | 'exported';
  createdAt: number;
  updatedAt: number;
}

export interface GenieSparkSessionState {
  contentType: string;
  urlInput: string;
  imagePrompt: string;
  generateImage: boolean;
  selectedProvider: string;
  selectedImageModel: string;
  enableKnowledgeSearch: boolean;
  outputFormat: string;
  tone: string;
  duration: number;
  targetAudience: string;
  uploadedFileNames: string[];
  lastUpdated: number;
}

const SESSION_KEY = 'genie-spark-session';
const DRAFTS_KEY = 'genie-spark-drafts';

interface UseGenieSparkSessionReturn {
  // Session state
  sessionState: GenieSparkSessionState | null;
  saveSession: (state: Partial<GenieSparkSessionState>) => void;
  clearSession: () => void;
  hasActiveSession: boolean;
  
  // Drafts
  drafts: GenieSparkDraft[];
  saveDraft: (content: GeneratedContent) => Promise<GenieSparkDraft | null>;
  updateDraft: (id: string, updates: Partial<GenieSparkDraft>) => void;
  deleteDraft: (id: string) => void;
  exportDraft: (id: string) => void;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
}

export function useGenieSparkSession(): UseGenieSparkSessionReturn {
  const [sessionState, setSessionState] = useState<GenieSparkSessionState | null>(null);
  const [drafts, setDrafts] = useState<GenieSparkDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load session and drafts on mount
  useEffect(() => {
    loadSession();
    loadDrafts();
    setIsLoading(false);
  }, []);

  const loadSession = () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GenieSparkSessionState;
        // Only restore if less than 24 hours old
        if (Date.now() - parsed.lastUpdated < 24 * 60 * 60 * 1000) {
          setSessionState(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load Genie Spark session:', error);
    }
  };

  const loadDrafts = async () => {
    try {
      // Load from localStorage first
      const stored = localStorage.getItem(DRAFTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GenieSparkDraft[];
        setDrafts(parsed.sort((a, b) => b.updatedAt - a.updatedAt));
      }

      // Then sync from Supabase for logged-in users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('genie_scripts')
          .select('*')
          .eq('user_id', user.id)
          .eq('draft_status', 'in_progress')
          .order('updated_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          const dbDrafts: GenieSparkDraft[] = data.map((row: any) => ({
            id: row.id,
            title: row.name,
            content: row.content,
            type: row.type === 'audio' ? 'podcast_script' : 'video_script',
            sourceType: 'document',
            duration: row.stats?.estimatedSpeakingMinutes ? row.stats.estimatedSpeakingMinutes * 60 : 0,
            metadata: row.stats || {},
            status: 'draft',
            createdAt: new Date(row.created_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
          }));

          // Merge with local drafts, preferring DB versions
          const localDrafts = drafts.filter(d => !dbDrafts.find(db => db.id === d.id));
          const merged = [...dbDrafts, ...localDrafts].sort((a, b) => b.updatedAt - a.updatedAt);
          setDrafts(merged);
        }
      }
    } catch (error) {
      console.error('Failed to load Genie Spark drafts:', error);
    }
  };

  const saveSession = useCallback((state: Partial<GenieSparkSessionState>) => {
    // Debounce saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const newState: GenieSparkSessionState = {
        ...sessionState,
        ...state,
        lastUpdated: Date.now(),
      } as GenieSparkSessionState;

      setSessionState(newState);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newState));
    }, 500);
  }, [sessionState]);

  const clearSession = useCallback(() => {
    setSessionState(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const saveDraft = useCallback(async (content: GeneratedContent): Promise<GenieSparkDraft | null> => {
    setIsSaving(true);
    
    try {
      const draft: GenieSparkDraft = {
        id: `draft-${Date.now()}`,
        title: content.title || 'Untitled Draft',
        content: content.script,
        type: content.type,
        sourceType: content.sourceType,
        duration: content.duration || 0,
        metadata: content.metadata || {},
        status: 'draft',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save to localStorage
      const newDrafts = [draft, ...drafts];
      setDrafts(newDrafts);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(newDrafts));

      // Try to save to Supabase for logged-in users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('genie_scripts')
          .insert([{
            user_id: user.id,
            name: draft.title,
            content: draft.content,
            type: content.type.includes('podcast') || content.type.includes('audio') ? 'audio' : 'video',
            draft_status: 'in_progress',
            draft_content: draft.content,
            stats: {
              wordCount: content.metadata?.wordCount || 0,
              estimatedSpeakingMinutes: Math.ceil((content.duration || 0) / 60),
            },
          }])
          .select()
          .single();

        if (!error && data) {
          // Update draft with DB id
          draft.id = data.id;
          const updatedDrafts = [draft, ...drafts.filter(d => d.id !== draft.id)];
          setDrafts(updatedDrafts);
          localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));
        }
      }

      toast.success('Draft saved!');
      return draft;
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [drafts]);

  const updateDraft = useCallback((id: string, updates: Partial<GenieSparkDraft>) => {
    const newDrafts = drafts.map(d => 
      d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d
    );
    setDrafts(newDrafts);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(newDrafts));
  }, [drafts]);

  const deleteDraft = useCallback(async (id: string) => {
    const newDrafts = drafts.filter(d => d.id !== id);
    setDrafts(newDrafts);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(newDrafts));

    // Also delete from Supabase if it's a DB draft
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !id.startsWith('draft-')) {
      await supabase
        .from('genie_scripts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    }

    toast.success('Draft deleted');
  }, [drafts]);

  const exportDraft = useCallback((id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (!draft) return;

    const blob = new Blob([draft.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    updateDraft(id, { status: 'exported' });
    toast.success('Draft exported!');
  }, [drafts, updateDraft]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    sessionState,
    saveSession,
    clearSession,
    hasActiveSession: sessionState !== null,
    drafts,
    saveDraft,
    updateDraft,
    deleteDraft,
    exportDraft,
    isLoading,
    isSaving,
  };
}
