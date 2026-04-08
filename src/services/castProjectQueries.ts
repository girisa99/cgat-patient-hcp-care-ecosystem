/**
 * castProjectQueries — Pure async Supabase fetch functions for Cast projects.
 *
 * Extracted from EP04Production.tsx useEffect (lines 953-1370) so they can
 * be wrapped by React Query hooks with caching & stale-time control.
 *
 * Every function is stateless — receives projectId, returns data or null.
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types (shared with EP04Production) ──────────────────────────────────────

export interface TtsLineRow {
  line_key: string;
  tts_audio_url: string;
  tts_provider: string | null;
  tts_voice_id: string | null;
  tts_status: string;
}

export interface TtsJobRow {
  line_key: string;
  output_url: string;
  provider: string | null;
}

export interface SceneRow {
  scene_key: string;
  scene_config: Record<string, any>;
}

export interface VisualJobRow {
  scene_key: string;
  job_type: string;
  output_url: string;
}

export interface ProjectStatusRow {
  status: string;
  final_video_url?: string | null;
  thumbnail_url?: string | null;
}

// ── Fetch functions ─────────────────────────────────────────────────────────

const db = supabase as any;

/**
 * Primary TTS source — script_lines with generated audio.
 */
export async function fetchTtsLines(projectId: string): Promise<TtsLineRow[]> {
  const { data, error } = await db
    .from('cast_project_script_lines')
    .select('line_key, tts_audio_url, tts_provider, tts_voice_id, tts_status')
    .eq('project_id', projectId)
    .eq('tts_status', 'generated')
    .not('tts_audio_url', 'is', null);

  if (error) {
    console.warn('[castProjectQueries] fetchTtsLines error:', error);
    return [];
  }
  return data || [];
}

/**
 * Fallback TTS source — generation_jobs that completed but may have
 * been wiped from script_lines by auto-seed.
 */
export async function fetchTtsJobsFallback(projectId: string): Promise<TtsJobRow[]> {
  const { data, error } = await db
    .from('cast_generation_jobs')
    .select('line_key, output_url, provider')
    .eq('project_id', projectId)
    .eq('job_type', 'tts')
    .eq('status', 'completed')
    .not('output_url', 'is', null)
    .not('line_key', 'is', null);

  if (error) {
    console.warn('[castProjectQueries] fetchTtsJobsFallback error:', error);
    return [];
  }
  return data || [];
}

/**
 * Scene artifacts — scene_config JSONB containing video/image/avatar/lipsync URLs,
 * music, SFX, and assembled clip data.
 */
export async function fetchSceneArtifactsAll(projectId: string): Promise<SceneRow[]> {
  const { data, error } = await db
    .from('cast_project_scenes')
    .select('scene_key, scene_config')
    .eq('project_id', projectId)
    .limit(30);

  if (error) {
    console.warn('[castProjectQueries] fetchSceneArtifactsAll error:', error);
    return [];
  }
  return data || [];
}

/**
 * Fallback visual source — completed generation_jobs (non-TTS) ordered
 * by newest first for deduplication.
 */
export async function fetchVisualJobsFallback(projectId: string): Promise<VisualJobRow[]> {
  const { data, error } = await db
    .from('cast_generation_jobs')
    .select('scene_key, job_type, output_url')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .not('output_url', 'is', null)
    .not('scene_key', 'is', null)
    .neq('job_type', 'tts')
    .order('created_at', { ascending: false })
    .limit(200); // Cap results to avoid statement timeout on large tables

  if (error) {
    console.warn('[castProjectQueries] fetchVisualJobsFallback error:', error);
    return [];
  }
  return data || [];
}

/**
 * Project status — used to restore productionPhase from project-level status
 * when no visual artifacts exist yet (e.g. TTS approved but visuals not started).
 */
export async function fetchProjectStatus(projectId: string): Promise<ProjectStatusRow | null> {
  const { data, error } = await db
    .from('cast_projects')
    .select('status, final_video_url, thumbnail_url')
    .eq('id', projectId)
    .maybeSingle();

  if (error) {
    console.warn('[castProjectQueries] fetchProjectStatus error:', error);
    return null;
  }
  return data || null;
}

/**
 * Project lookup by user + style_intent (exact match) — returns project ID.
 * Includes legacy title fallback and auto-create if none exists.
 */
export async function lookupOrCreateProject(
  userId: string,
  styleIntent: string,
): Promise<{ projectId: string | null; error: string | null }> {
  // Step 1: Exact style_intent match
  const { data: existing, error: lookupErr } = await db
    .from('cast_projects')
    .select('id')
    .eq('user_id', userId)
    .eq('style_intent', styleIntent)
    .limit(1)
    .maybeSingle();

  if (lookupErr) {
    return { projectId: null, error: `Database query failed: ${lookupErr.message}` };
  }
  if (existing?.id) {
    return { projectId: existing.id, error: null };
  }

  // Step 2: Legacy title fallback
  const { data: legacyExisting } = await db
    .from('cast_projects')
    .select('id')
    .eq('user_id', userId)
    .ilike('title', '%EP04%')
    .limit(1)
    .maybeSingle();

  if (legacyExisting?.id) {
    await db.from('cast_projects')
      .update({ style_intent: styleIntent })
      .eq('id', legacyExisting.id);
    return { projectId: legacyExisting.id, error: null };
  }

  // Step 3: Create new project
  const { data: created, error: createErr } = await db
    .from('cast_projects')
    .insert({
      user_id: userId,
      title: 'EP04 — Sprint Documentary',
      description: 'GenieSuite Sprint Documentary — 12 scenes, 5 voices, ~27 min',
      status: 'scripted',
      style_intent: styleIntent,
      quality: 'production',
      target_regions: ['global'],
      selected_dialects: ['en-US'],
    })
    .select('id')
    .single();

  if (createErr || !created) {
    return { projectId: null, error: createErr?.message || 'Failed to create project' };
  }
  return { projectId: created.id, error: null };
}
