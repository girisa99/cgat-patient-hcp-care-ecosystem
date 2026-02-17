/**
 * Hook for managing scripts in the database for GenieStudio
 * Replaces localStorage-based script storage with Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScriptStats {
  wordCount: number;
  sentenceCount: number;
  characterCount: number;
  estimatedReadingMinutes: number;
  estimatedSpeakingMinutes: number;
  readabilityScore: 'easy' | 'moderate' | 'difficult';
}

export type ScriptPurpose = 'video' | 'audio' | 'podcast' | 'webcast' | 'interview' | 'panel' | 'tutorial';
export type ScriptSource = 'spark' | 'mind' | 'manual' | 'upload' | 'import';

export interface GenieScript {
  id: string;
  name: string;
  content: string;
  type: 'video' | 'audio';
  purpose?: ScriptPurpose;
  source?: ScriptSource; // Origin: spark, mind, manual, upload, import
  showId?: string | null;
  enhancedContent?: string | null;
  cleanContent?: string | null;
  draftContent?: string | null;
  draftStatus?: 'in_progress' | 'completed' | null;
  draftChanges?: any[] | null;
  stats?: ScriptStats | null;
  hasVoiceover?: boolean;
  voiceoverId?: string | null;
  createdAt: number;
  updatedAt: number;
}

interface UseGenieScriptsReturn {
  scripts: GenieScript[];
  videoScripts: GenieScript[];
  audioScripts: GenieScript[];
  isLoading: boolean;
  error: string | null;
  
  // CRUD operations
  saveScript: (script: Omit<GenieScript, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<GenieScript | null>;
  updateScript: (id: string, updates: Partial<GenieScript>) => Promise<boolean>;
  deleteScript: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useGenieScripts(): UseGenieScriptsReturn {
  const [scripts, setScripts] = useState<GenieScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load scripts from database
  const loadScripts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, skipping scripts load');
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('genie_scripts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const loadedScripts: GenieScript[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        content: row.content,
        type: row.type as 'video' | 'audio',
        purpose: row.purpose as ScriptPurpose | undefined,
        source: (row.source as ScriptSource) || 'manual',
        showId: row.show_id,
        enhancedContent: row.enhanced_content,
        cleanContent: row.clean_content,
        draftContent: row.draft_content,
        draftStatus: row.draft_status,
        draftChanges: row.draft_changes,
        stats: row.stats as ScriptStats | null,
        hasVoiceover: row.has_voiceover || false,
        voiceoverId: row.voiceover_id,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      }));

      console.log(`📝 GenieStudio: Loaded ${loadedScripts.length} scripts from database`);
      setScripts(loadedScripts);
      
    } catch (err) {
      console.error('Failed to load scripts from database:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scripts');
      toast.error('Failed to load scripts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  // Save or create script
  const saveScript = useCallback(async (
    script: Omit<GenieScript, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<GenieScript | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save scripts');
        return null;
      }

      const isUpdate = script.id && scripts.some(s => s.id === script.id);
      
      if (isUpdate) {
        // Update existing
        const { data, error: updateError } = await supabase
          .from('genie_scripts')
          .update({
            name: script.name,
            content: script.content,
            type: script.type,
            purpose: (script as any).purpose ?? null,
            show_id: (script as any).showId ?? null,
            enhanced_content: script.enhancedContent ?? null,
            clean_content: script.cleanContent ?? null,
            draft_content: script.draftContent ?? null,
            draft_status: script.draftStatus ?? null,
            draft_changes: script.draftChanges ?? null,
            stats: script.stats ? JSON.parse(JSON.stringify(script.stats)) : null,
            has_voiceover: script.hasVoiceover ?? false,
            voiceover_id: script.voiceoverId ?? null,
          })
          .eq('id', script.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        
        const updated: GenieScript = {
          id: data.id,
          name: data.name,
          content: data.content,
          type: data.type as 'video' | 'audio',
          purpose: data.purpose as ScriptPurpose | undefined,
          source: (data.source as ScriptSource) || 'manual',
          showId: data.show_id,
          enhancedContent: data.enhanced_content,
          cleanContent: data.clean_content,
          draftContent: data.draft_content,
          draftStatus: data.draft_status as 'in_progress' | 'completed' | null,
          draftChanges: data.draft_changes as any[] | null,
          stats: data.stats as unknown as ScriptStats | null,
          hasVoiceover: data.has_voiceover,
          voiceoverId: data.voiceover_id,
          createdAt: new Date(data.created_at).getTime(),
          updatedAt: new Date(data.updated_at).getTime(),
        };
        
        setScripts(prev => prev.map(s => s.id === updated.id ? updated : s));
        toast.success('Script updated');
        return updated;
        
      } else {
        // Create new
        const { data, error: insertError } = await supabase
          .from('genie_scripts')
          .insert([{
            user_id: user.id,
            name: script.name,
            content: script.content,
            type: script.type,
            source: script.source ?? 'manual',
            purpose: (script as any).purpose ?? null,
            show_id: (script as any).showId ?? null,
            enhanced_content: script.enhancedContent ?? null,
            clean_content: script.cleanContent ?? null,
            draft_content: script.draftContent ?? null,
            draft_status: script.draftStatus ?? null,
            draft_changes: script.draftChanges ?? null,
            stats: script.stats ? JSON.parse(JSON.stringify(script.stats)) : null,
            has_voiceover: script.hasVoiceover ?? false,
            voiceover_id: script.voiceoverId ?? null,
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        
        const newScript: GenieScript = {
          id: data.id,
          name: data.name,
          content: data.content,
          type: data.type as 'video' | 'audio',
          purpose: data.purpose as ScriptPurpose | undefined,
          source: (data.source as ScriptSource) || 'manual',
          showId: data.show_id,
          enhancedContent: data.enhanced_content,
          cleanContent: data.clean_content,
          draftContent: data.draft_content,
          draftStatus: data.draft_status as 'in_progress' | 'completed' | null,
          draftChanges: data.draft_changes as any[] | null,
          stats: data.stats as unknown as ScriptStats | null,
          hasVoiceover: data.has_voiceover,
          voiceoverId: data.voiceover_id,
          createdAt: new Date(data.created_at).getTime(),
          updatedAt: new Date(data.updated_at).getTime(),
        };
        
        setScripts(prev => [newScript, ...prev]);
        toast.success('Script saved');
        return newScript;
      }
    } catch (err) {
      console.error('Failed to save script:', err);
      toast.error('Failed to save script');
      return null;
    }
  }, [scripts]);

  // Update script
  const updateScript = useCallback(async (id: string, updates: Partial<GenieScript>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if ((updates as any).purpose !== undefined) dbUpdates.purpose = (updates as any).purpose;
      if ((updates as any).showId !== undefined) dbUpdates.show_id = (updates as any).showId;
      if (updates.enhancedContent !== undefined) dbUpdates.enhanced_content = updates.enhancedContent;
      if (updates.cleanContent !== undefined) dbUpdates.clean_content = updates.cleanContent;
      if (updates.draftContent !== undefined) dbUpdates.draft_content = updates.draftContent;
      if (updates.draftStatus !== undefined) dbUpdates.draft_status = updates.draftStatus;
      if (updates.draftChanges !== undefined) dbUpdates.draft_changes = updates.draftChanges;
      if (updates.stats !== undefined) dbUpdates.stats = updates.stats;
      if (updates.hasVoiceover !== undefined) dbUpdates.has_voiceover = updates.hasVoiceover;
      if (updates.voiceoverId !== undefined) dbUpdates.voiceover_id = updates.voiceoverId;

      const { error: updateError } = await supabase
        .from('genie_scripts')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      setScripts(prev => prev.map(s => 
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      ));
      
      return true;
    } catch (err) {
      console.error('Failed to update script:', err);
      toast.error('Failed to update script');
      return false;
    }
  }, []);

  // Delete script
  const deleteScript = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error: deleteError } = await supabase
        .from('genie_scripts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setScripts(prev => prev.filter(s => s.id !== id));
      toast.success('Script deleted');
      return true;
    } catch (err) {
      console.error('Failed to delete script:', err);
      toast.error('Failed to delete script');
      return false;
    }
  }, []);

  // Filter by type
  const videoScripts = scripts.filter(s => s.type === 'video');
  const audioScripts = scripts.filter(s => s.type === 'audio');

  return {
    scripts,
    videoScripts,
    audioScripts,
    isLoading,
    error,
    saveScript,
    updateScript,
    deleteScript,
    refresh: loadScripts,
  };
}
