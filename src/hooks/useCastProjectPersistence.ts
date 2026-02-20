/**
 * useCastProjectPersistence — Save/load full production content to DB
 *
 * Persists scenes, script lines, and characters to:
 * - cast_project_scenes
 * - cast_project_script_lines
 * - cast_project_characters
 *
 * Used by EP04Production and any future production page to save/restore
 * complete project state including TTS results.
 */

import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types matching DB schema ────────────────────────────────────────────────

export interface PersistedScene {
  id?: string;
  project_id: string;
  scene_key: string;
  title: string;
  scene_index: number;
  art_style?: string | null;
  visual_style?: string | null;
  background_url?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  is_optional?: boolean;
  scene_config?: Record<string, unknown>;
}

export interface PersistedScriptLine {
  id?: string;
  project_id: string;
  scene_id: string;
  line_key: string;
  line_index: number;
  character_id: string;
  dialogue: string;
  direction?: string | null;
  motion?: string | null;
  duration_hint?: string | null;
  visual_tags?: string[] | null;
  sfx_tags?: string[] | null;
  tts_audio_url?: string | null;
  tts_status?: string | null;
  tts_provider?: string | null;
  tts_voice_id?: string | null;
  tts_generated_at?: string | null;
  line_config?: Record<string, unknown>;
}

export interface PersistedCharacter {
  id?: string;
  project_id: string;
  character_key: string;
  display_name: string;
  avatar_url?: string | null;
  color_class?: string | null;
  role_description?: string | null;
  voice_provider?: string | null;
  voice_id?: string | null;
  voice_config?: Record<string, unknown>;
}

export interface ProjectContentSnapshot {
  scenes: PersistedScene[];
  scriptLines: PersistedScriptLine[];
  characters: PersistedCharacter[];
}

// Untyped client for tables not yet in generated types
const db = supabase as any;

export function useCastProjectPersistence() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ──────────────────────────────────────────────────────────────────────
  // SAVE — upsert full project content (scenes → lines → characters)
  // ──────────────────────────────────────────────────────────────────────

  const saveProjectContent = useCallback(async (
    projectId: string,
    content: ProjectContentSnapshot,
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Upsert characters
      if (content.characters.length > 0) {
        const { error: charErr } = await db
          .from('cast_project_characters')
          .upsert(
            content.characters.map(c => ({
              ...c,
              project_id: projectId,
            })),
            { onConflict: 'project_id,character_key' }
          );
        if (charErr) throw charErr;
      }

      // 2. Upsert scenes
      if (content.scenes.length > 0) {
        const { data: scenesData, error: sceneErr } = await db
          .from('cast_project_scenes')
          .upsert(
            content.scenes.map(s => ({
              ...s,
              project_id: projectId,
            })),
            { onConflict: 'project_id,scene_key' }
          )
          .select('id, scene_key');
        if (sceneErr) throw sceneErr;

        // Build scene_key → id map for script lines
        const sceneIdMap: Record<string, string> = {};
        for (const s of (scenesData || [])) {
          sceneIdMap[s.scene_key] = s.id;
        }

        // 3. Upsert script lines (need scene_id from above)
        if (content.scriptLines.length > 0) {
          // Resolve scene_id for each line using the line's scene reference
          const linesWithSceneIds = content.scriptLines.map(line => {
            // scene_id in the input might be a scene_key — resolve to actual UUID
            const resolvedSceneId = sceneIdMap[line.scene_id] || line.scene_id;
            return {
              ...line,
              project_id: projectId,
              scene_id: resolvedSceneId,
            };
          });

          const { error: lineErr } = await db
            .from('cast_project_script_lines')
            .upsert(linesWithSceneIds, { onConflict: 'project_id,line_key' });
          if (lineErr) throw lineErr;
        }
      }

      toast.success('Project content saved');
      return true;
    } catch (err: any) {
      console.error('[useCastProjectPersistence] Save error:', err);
      toast.error(`Failed to save: ${err.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // LOAD — fetch full project content from DB
  // ──────────────────────────────────────────────────────────────────────

  const loadProjectContent = useCallback(async (
    projectId: string,
  ): Promise<ProjectContentSnapshot | null> => {
    setIsLoading(true);
    try {
      // Parallel fetch all three tables
      const [scenesRes, charsRes] = await Promise.all([
        db.from('cast_project_scenes')
          .select('*')
          .eq('project_id', projectId)
          .order('scene_index', { ascending: true }),
        db.from('cast_project_characters')
          .select('*')
          .eq('project_id', projectId)
          .order('character_key', { ascending: true }),
      ]);

      if (scenesRes.error) throw scenesRes.error;
      if (charsRes.error) throw charsRes.error;

      const scenes: PersistedScene[] = scenesRes.data || [];
      const characters: PersistedCharacter[] = charsRes.data || [];

      // Fetch script lines (needs scene IDs)
      let scriptLines: PersistedScriptLine[] = [];
      if (scenes.length > 0) {
        const sceneIds = scenes.map((s: any) => s.id);
        const { data: linesData, error: linesErr } = await db
          .from('cast_project_script_lines')
          .select('*')
          .in('scene_id', sceneIds)
          .order('line_index', { ascending: true });

        if (linesErr) throw linesErr;
        scriptLines = linesData || [];
      }

      return { scenes, scriptLines, characters };
    } catch (err: any) {
      console.error('[useCastProjectPersistence] Load error:', err);
      toast.error(`Failed to load project content: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // UPDATE single line's TTS result (after generation)
  // ──────────────────────────────────────────────────────────────────────

  const updateLineTTS = useCallback(async (
    projectId: string,
    lineKey: string,
    ttsData: {
      tts_audio_url: string;
      tts_provider: string;
      tts_voice_id: string;
      tts_status: 'generated' | 'failed';
    },
  ): Promise<boolean> => {
    try {
      const { error } = await db
        .from('cast_project_script_lines')
        .update({
          ...ttsData,
          tts_generated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)
        .eq('line_key', lineKey);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('[useCastProjectPersistence] TTS update error:', err);
      return false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // CHECK if project has persisted content
  // ──────────────────────────────────────────────────────────────────────

  const hasPersistedContent = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const { count, error } = await db
        .from('cast_project_scenes')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (error) throw error;
      return (count ?? 0) > 0;
    } catch {
      return false;
    }
  }, []);

  return {
    isSaving,
    isLoading,
    saveProjectContent,
    loadProjectContent,
    updateLineTTS,
    hasPersistedContent,
  };
}
