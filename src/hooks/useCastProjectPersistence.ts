/**
 * useCastProjectPersistence — Universal save/load for Cast production projects
 *
 * Dynamic persistence layer that works for ANY project (EP04, future episodes, etc.)
 * with zero hardcoding. Reads/writes:
 * - cast_project_scenes
 * - cast_project_script_lines
 * - cast_project_characters
 *
 * Features:
 * - Save-as-you-go: auto-persists when content changes
 * - Per-step token breakdown: TTS, video, avatar, 3D, animation
 * - Full restore from DB: scenes, lines, characters, TTS results
 * - Integrates with productionCostAccumulator for cost tracking
 */

import { useCallback, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { productionCostAccumulator, type ProjectCostSummary } from '@/services/productionCostAccumulator';
import type { CastJobType } from '@/types/castProjects';
import type { SceneEnrichmentOutput } from '@/services/production/sceneEnrichmentEngine';
import type { OrchestrationCheckpoint } from './useCastProductionOrchestrator';

// ── Types matching DB schema — no hardcoding ────────────────────────────────

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
  scene_id: string; // Can be scene_key on input — resolved to UUID internally
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

/** Per-step token breakdown */
export interface StepTokenBreakdown {
  tts: { estimated: number; actual: number; costUsd: number; jobCount: number };
  video: { estimated: number; actual: number; costUsd: number; jobCount: number };
  avatar: { estimated: number; actual: number; costUsd: number; jobCount: number };
  animation: { estimated: number; actual: number; costUsd: number; jobCount: number };
  '3d': { estimated: number; actual: number; costUsd: number; jobCount: number };
  image: { estimated: number; actual: number; costUsd: number; jobCount: number };
  thumbnail: { estimated: number; actual: number; costUsd: number; jobCount: number };
  total: { estimated: number; actual: number; costUsd: number; jobCount: number };
}

const EMPTY_STEP = { estimated: 0, actual: 0, costUsd: 0, jobCount: 0 };

// Untyped client for tables not yet in generated types
const db = supabase as any;

export function useCastProjectPersistence() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenBreakdown, setTokenBreakdown] = useState<StepTokenBreakdown | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Per-scene write lock — serializes concurrent writes to the same scene ──
  // Prevents race condition where updateSceneArtifacts + updateSceneMusic both
  // SELECT→merge→UPSERT the same scene_config row and the last write wins.
  const writeLocks = useRef(new Map<string, Promise<any>>());

  function withSceneLock(key: string, fn: () => Promise<any>): Promise<any> {
    const prev = writeLocks.current.get(key) || Promise.resolve();
    const next = prev.then(fn, fn); // chain regardless of success/failure
    writeLocks.current.set(key, next);
    return next;
  }

  // ── Atomic merge helper — SELECT existing config, merge ONE field, UPSERT ──
  // Replaces duplicated SELECT→merge→UPSERT patterns in updateSceneArtifacts
  // and updateSceneMusic. Always call inside withSceneLock().
  async function updateSceneConfigField(
    projectId: string,
    sceneKey: string,
    fieldName: string,
    fieldValue: unknown,
  ): Promise<boolean> {
    // maybeSingle() returns null if row doesn't exist (no error thrown)
    const { data: scene } = await db.from('cast_project_scenes')
      .select('scene_config').eq('project_id', projectId)
      .eq('scene_key', sceneKey).maybeSingle();
    // Merge ONLY the specified field into existing config
    const existing = (scene?.scene_config || {}) as Record<string, unknown>;
    const merged = { ...existing, [fieldName]: fieldValue };
    // Upsert — creates row if missing, updates if exists
    const { error } = await db.from('cast_project_scenes')
      .upsert({
        project_id: projectId,
        scene_key: sceneKey,
        title: sceneKey,
        scene_index: 0,
        scene_config: merged,
      }, { onConflict: 'project_id,scene_key' });
    if (error) {
      console.error(`[PERSIST] updateSceneConfigField(${sceneKey}, ${fieldName}) failed:`, error);
    }
    return !error;
  }

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

      // 2. Upsert scenes — PRESERVE all existing production fields in scene_config
      if (content.scenes.length > 0) {
        // Read existing scene_configs so production data (artifacts, music, assembly)
        // isn't wiped when the content snapshot re-upserts scene rows
        let existingConfigs: Record<string, Record<string, unknown>> = {};
        try {
          const { data: existing } = await db
            .from('cast_project_scenes')
            .select('scene_key, scene_config')
            .eq('project_id', projectId);
          if (existing) {
            for (const row of existing) {
              existingConfigs[row.scene_key] = (row.scene_config || {}) as Record<string, unknown>;
            }
          }
        } catch (_) { /* ignore — first seed won't have existing rows */ }

        const PRESERVE_KEYS = ['artifacts', 'generatedMusic', 'assembledClipUrl'];

        const { data: scenesData, error: sceneErr } = await db
          .from('cast_project_scenes')
          .upsert(
            content.scenes.map(s => {
              const newConfig = (s as any).scene_config || {};
              const existCfg = existingConfigs[s.scene_key] || {};
              // Merge: new config fields + preserve existing production fields
              // that the content snapshot doesn't set
              const mergedConfig = { ...newConfig };
              for (const key of PRESERVE_KEYS) {
                if (existCfg[key] && !newConfig[key]) {
                  mergedConfig[key] = existCfg[key];
                }
              }
              return {
                ...s,
                project_id: projectId,
                scene_config: mergedConfig,
              };
            }),
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
          const linesWithSceneIds = content.scriptLines.map(line => {
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

      return true;
    } catch (err: any) {
      console.error('[Persistence] Save error:', err);
      toast.error(`Failed to save: ${err.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // SAVE-AS-YOU-GO — debounced auto-save (call after each step)
  // ──────────────────────────────────────────────────────────────────────

  const autoSave = useCallback((
    projectId: string,
    content: ProjectContentSnapshot,
    delayMs = 2000,
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const ok = await saveProjectContent(projectId, content);
      if (ok) console.log('[Persistence] Auto-saved project content');
    }, delayMs);
  }, [saveProjectContent]);

  // ──────────────────────────────────────────────────────────────────────
  // LOAD — fetch full project content from DB
  // ──────────────────────────────────────────────────────────────────────

  const loadProjectContent = useCallback(async (
    projectId: string,
  ): Promise<ProjectContentSnapshot | null> => {
    setIsLoading(true);
    try {
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
      console.error('[Persistence] Load error:', err);
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
      console.error('[Persistence] TTS update error:', err);
      return false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // PER-STEP TOKEN BREAKDOWN — fetches from cast_generation_jobs
  // ──────────────────────────────────────────────────────────────────────

  const fetchTokenBreakdown = useCallback(async (projectId: string): Promise<StepTokenBreakdown> => {
    const summary = await productionCostAccumulator.getProjectCostSummary(projectId);
    
    if (!summary) {
      const empty: StepTokenBreakdown = {
        tts: { ...EMPTY_STEP },
        video: { ...EMPTY_STEP },
        avatar: { ...EMPTY_STEP },
        animation: { ...EMPTY_STEP },
        '3d': { ...EMPTY_STEP },
        image: { ...EMPTY_STEP },
        thumbnail: { ...EMPTY_STEP },
        total: { ...EMPTY_STEP },
      };
      setTokenBreakdown(empty);
      return empty;
    }

    const mapStep = (jobType: CastJobType) => {
      const data = summary.byJobType[jobType];
      if (!data) return { ...EMPTY_STEP };
      return {
        estimated: 0, // Will be filled from project-level estimate
        actual: data.tokens,
        costUsd: data.costUsd,
        jobCount: data.count,
      };
    };

    // Fetch project-level estimated_tokens for the total
    const { data: project } = await db
      .from('cast_projects')
      .select('estimated_tokens')
      .eq('id', projectId)
      .single();

    const breakdown: StepTokenBreakdown = {
      tts: mapStep('tts'),
      video: mapStep('video'),
      avatar: mapStep('avatar'),
      animation: mapStep('animation'),
      '3d': mapStep('3d'),
      image: mapStep('image'),
      thumbnail: mapStep('thumbnail'),
      total: {
        estimated: project?.estimated_tokens || summary.totalEstimatedTokens,
        actual: summary.totalActualTokens,
        costUsd: summary.totalActualCostUsd,
        jobCount: summary.totalJobs,
      },
    };

    setTokenBreakdown(breakdown);
    return breakdown;
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // TRACK GENERATION JOB — creates a job entry for cost tracking
  // ──────────────────────────────────────────────────────────────────────

  const trackGenerationJob = useCallback(async (input: {
    projectId: string;
    jobType: CastJobType;
    sceneKey?: string;
    lineKey?: string;
    provider?: string;
    estimatedTokens?: number;
  }): Promise<string | null> => {
    return productionCostAccumulator.createJob({
      projectId: input.projectId,
      jobType: input.jobType,
      sceneKey: input.sceneKey,
      lineKey: input.lineKey,
      provider: input.provider,
      estimatedTokens: input.estimatedTokens,
    });
  }, []);

  const completeGenerationJob = useCallback(async (
    jobId: string,
    actualTokens: number,
    outputUrl?: string,
    actualProvider?: string,
  ) => {
    await productionCostAccumulator.completeJob({
      jobId,
      actualTokens,
      outputUrl,
      actualProvider,
    });
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

  // ──────────────────────────────────────────────────────────────────────
  // SEED ENRICHMENT TO DB — persist enrichScenes() output to project tables
  // Called after enrichment runs in CREATE flow, seeds the SAME DB shape
  // that EP04 uses (via seedFromConfig), so the PRODUCE pipeline works
  // identically for both static-seeded and enrichment-seeded projects.
  // ──────────────────────────────────────────────────────────────────────

  const seedEnrichmentToDB = useCallback(async (
    projectId: string,
    output: SceneEnrichmentOutput,
  ): Promise<boolean> => {
    try {
      // 1. Upsert scene configs from scenePipelines + musicScore
      // PRESERVE existing artifacts during upsert (same pattern as saveProjectContent)
      const sceneEntries = Object.entries(output.scenePipelines);
      if (sceneEntries.length > 0) {
        let existingConfigs: Record<string, Record<string, unknown>> = {};
        try {
          const { data: existing } = await db
            .from('cast_project_scenes')
            .select('scene_key, scene_config')
            .eq('project_id', projectId);
          if (existing) {
            for (const row of existing) {
              existingConfigs[row.scene_key] = (row.scene_config || {}) as Record<string, unknown>;
            }
          }
        } catch (_) { /* first seed won't have existing rows */ }

        const PRESERVE_KEYS = ['artifacts', 'generatedMusic', 'assembledClipUrl'];

        const sceneRows = sceneEntries.map(([sceneKey, pipeline], idx) => {
          const music = output.musicScore[sceneKey];
          const transition = output.transitions?.find(t => t.from === sceneKey);
          const existCfg = existingConfigs[sceneKey] || {};
          const sceneConfig: Record<string, unknown> = {
            pipeline,
            music: music?.music || null,
            sfx: music?.sfx || [],
            transition: transition || null,
          };
          // Preserve existing production fields that enrichment doesn't set
          for (const key of PRESERVE_KEYS) {
            if (existCfg[key]) {
              sceneConfig[key] = existCfg[key];
            }
          }
          return {
            project_id: projectId,
            scene_key: sceneKey,
            title: sceneKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            scene_index: idx,
            scene_config: sceneConfig,
          };
        });

        const { error: sceneErr } = await db
          .from('cast_project_scenes')
          .upsert(sceneRows, { onConflict: 'project_id,scene_key' });
        if (sceneErr) throw sceneErr;
      }

      // 2. Upsert character voice + avatar configs from enrichment output
      const voiceEntries = Object.entries(output.voiceConfig || {});
      if (voiceEntries.length > 0) {
        const charRows = voiceEntries.map(([charKey, voice]) => ({
          project_id: projectId,
          character_key: charKey,
          display_name: charKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          voice_provider: voice.provider,
          voice_id: voice.voiceId,
          voice_config: voice,
          avatar_config: output.avatarConfig?.[charKey] || null,
        }));

        const { error: charErr } = await db
          .from('cast_project_characters')
          .upsert(charRows, { onConflict: 'project_id,character_key' });
        if (charErr) throw charErr;
      }

      // 3. Update project metadata with enrichment summary
      const { error: projErr } = await db
        .from('cast_projects')
        .update({
          production_stage: 'enriched',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
      if (projErr) console.warn('[Persistence] Project update warning:', projErr);

      console.log(`[Persistence] Seeded enrichment → ${sceneEntries.length} scenes, ${voiceEntries.length} characters`);
      return true;
    } catch (err: any) {
      console.error('[Persistence] Seed enrichment error:', err);
      toast.error(`Failed to seed enrichment: ${err.message}`);
      return false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // UPDATE SCENE ARTIFACTS — store per-scene video/image/avatar/lipsync URLs
  // Called during Phase 3 (Visual Production) as each asset completes
  // ──────────────────────────────────────────────────────────────────────

  const updateSceneArtifacts = useCallback(async (
    projectId: string,
    sceneKey: string,
    artifacts: {
      videoUrls?: Record<string, string>;
      imageUrls?: Record<string, string>;
      avatarUrls?: Record<string, string>;
      lipsyncUrls?: Record<string, string>;
    },
  ): Promise<boolean> => {
    const artifactCount = Object.keys(artifacts.videoUrls || {}).length
      + Object.keys(artifacts.imageUrls || {}).length
      + Object.keys(artifacts.avatarUrls || {}).length
      + Object.keys(artifacts.lipsyncUrls || {}).length;
    console.log(`[PERSIST SAVE] ${sceneKey}: saving ${artifactCount} artifacts to DB...`, {
      videos: Object.keys(artifacts.videoUrls || {}),
      images: Object.keys(artifacts.imageUrls || {}),
      avatars: Object.keys(artifacts.avatarUrls || {}),
      lipsync: Object.keys(artifacts.lipsyncUrls || {}),
    });
    try {
      const ok = await withSceneLock(`${projectId}:${sceneKey}`, () =>
        updateSceneConfigField(projectId, sceneKey, 'artifacts', {
          videoUrls: artifacts.videoUrls || {},
          imageUrls: artifacts.imageUrls || {},
          avatarUrls: artifacts.avatarUrls || {},
          lipsyncUrls: artifacts.lipsyncUrls || {},
        })
      );
      if (ok) {
        console.log(`[PERSIST SAVE] ${sceneKey}: ✅ saved ${artifactCount} artifacts successfully`);
      } else {
        console.error(`[PERSIST SAVE] ${sceneKey}: ❌ UPSERT failed`);
      }
      return ok;
    } catch (err: any) {
      console.error(`[PERSIST SAVE] ${sceneKey}: ❌ FAILED:`, err);
      return false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // UPDATE SCENE MUSIC — store per-scene music + SFX URLs
  // Called during Phase 4 (Music & SFX) as each track completes
  // ──────────────────────────────────────────────────────────────────────

  const updateSceneMusic = useCallback(async (
    projectId: string,
    sceneKey: string,
    musicUrl: string | null,
    sfxUrls: string[],
  ): Promise<boolean> => {
    console.log(`[PERSIST SAVE] ${sceneKey}: saving music to DB (url=${musicUrl ? 'yes' : 'null'}, sfx=${sfxUrls.length})`);
    try {
      const ok = await withSceneLock(`${projectId}:${sceneKey}`, () =>
        updateSceneConfigField(projectId, sceneKey, 'generatedMusic', {
          url: musicUrl, sfxUrls, generatedAt: new Date().toISOString(),
        })
      );
      return ok;
    } catch (err: any) {
      console.error('[Persistence] Scene music update error:', err);
      return false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // UPDATE FINAL ASSEMBLY — store the final cinematic MP4 URL on the project
  // Called during Phase 5 when assembly completes
  // ──────────────────────────────────────────────────────────────────────

  const updateFinalAssembly = useCallback(async (
    projectId: string,
    finalVideoUrl: string,
    metadata?: {
      totalDuration?: number;
      sceneCount?: number;
      resolution?: string;
      fileSize?: number;
    },
  ): Promise<boolean> => {
    try {
      const { error } = await db
        .from('cast_projects')
        .update({
          final_video_url: finalVideoUrl,
          production_stage: 'complete',
          production_metadata: metadata || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
      if (error) throw error;
      toast.success('Final assembly saved to project');
      return true;
    } catch (err: any) {
      console.error('[Persistence] Final assembly update error:', err);
      toast.error(`Failed to save final assembly: ${err.message}`);
      return false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // ORCHESTRATION CHECKPOINT — save/load full pipeline state
  // ──────────────────────────────────────────────────────────────────────

  const saveOrchestrationCheckpoint = useCallback(async (
    projectId: string,
    checkpoint: OrchestrationCheckpoint,
  ): Promise<boolean> => {
    try {
      const { error } = await db
        .from('cast_projects')
        .update({
          production_metadata: { orchestrationCheckpoint: checkpoint },
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
      if (error) throw error;
      console.log('[Persistence] Orchestration checkpoint saved');
      return true;
    } catch (err: any) {
      console.error('[Persistence] Checkpoint save error:', err);
      return false;
    }
  }, []);

  const loadOrchestrationCheckpoint = useCallback(async (
    projectId: string,
  ): Promise<OrchestrationCheckpoint | null> => {
    try {
      const { data, error } = await db
        .from('cast_projects')
        .select('production_metadata')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      const checkpoint = data?.production_metadata?.orchestrationCheckpoint as OrchestrationCheckpoint | undefined;
      if (!checkpoint || checkpoint.version !== 1) return null;
      return checkpoint;
    } catch (err: any) {
      console.error('[Persistence] Checkpoint load error:', err);
      return null;
    }
  }, []);

  return {
    // State
    isSaving,
    isLoading,
    tokenBreakdown,

    // Core CRUD
    saveProjectContent,
    loadProjectContent,
    autoSave,
    updateLineTTS,
    hasPersistedContent,

    // Enrichment → DB seeding (Part A)
    seedEnrichmentToDB,

    // Production artifact persistence (Part B)
    updateSceneArtifacts,
    updateSceneMusic,
    updateFinalAssembly,

    // Orchestration checkpoint persistence (Part C)
    saveOrchestrationCheckpoint,
    loadOrchestrationCheckpoint,

    // Token / cost tracking
    fetchTokenBreakdown,
    trackGenerationJob,
    completeGenerationJob,
  };
}
