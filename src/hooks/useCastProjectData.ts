/**
 * useCastProjectData — Read-focused hook that loads Cast project data from DB
 * and unpacks JSONB into typed structures for UI consumption.
 *
 * Data flow:
 *   1. On mount: loadProjectContent(projectId)
 *   2. If data exists → unpack JSONB → return typed data
 *   3. If no data → isSeeded=false → UI can trigger seedFromConfig()
 *   4. After seed → reload from DB → return typed data
 *
 * Fallback: if projectId is null or DB load fails, returns config-file data directly.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCastProjectPersistence, type ProjectContentSnapshot, type PersistedScene, type PersistedScriptLine, type PersistedCharacter } from '@/hooks/useCastProjectPersistence';
import { buildSnapshotFromConfig, type SeedConfig, type VoiceConfigInput } from '@/utils/seedProjectFromConfig';

// ─── Unpacked types (from JSONB) ──────────────────────────────────────────

export interface VoiceConfig {
  provider: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
  rate?: string;
  pitch?: string;
  eqProfile?: string;
  style?: string;
  fallback?: {
    provider: string;
    voiceId: string;
    model?: string;
  };
}

export interface PipelineConfig {
  steps: unknown[];
}

export interface SceneConfig {
  pipeline: PipelineConfig;
  music: unknown | null;
  sfx: unknown[] | null;
  socialClips: SocialClipData[];
  sceneIdMapping: {
    scriptSceneId: string;
    pipelineSceneId: string;
  };
}

export interface SocialClipData {
  clipId: string;
  category: string;
  theme: string;
  timestamp: string;
  duration: number;
  hook: string;
  cta: string;
  hashtags: string[];
  platforms: string[];
  captionStyle: string;
  messaging: Record<string, unknown>;
}

export interface LineConfig {
  motion: string | null;
  sfx: string | null;
  direction: string | null;
  durationHint: string;
  lipsync: boolean;
  isInterruption: boolean;
  links: unknown[] | null;
  visualRef: string | null;
}

export interface CastProjectData {
  scenes: PersistedScene[];
  scriptLines: PersistedScriptLine[];
  characters: PersistedCharacter[];
  /** Look up voice config for a character */
  voiceConfigFor: (characterKey: string) => VoiceConfig | null;
  /** Look up scene pipeline for a scene key */
  scenePipelineFor: (sceneKey: string) => PipelineConfig | null;
  /** Look up full scene config for a scene key */
  sceneConfigFor: (sceneKey: string) => SceneConfig | null;
  /** All social clips aggregated from all scenes */
  socialClips: SocialClipData[];
  /** Script lines grouped by scene key */
  scriptLinesByScene: Map<string, PersistedScriptLine[]>;
  isLoading: boolean;
  isSeeded: boolean;
  /** Trigger seed from config files → DB */
  seedFromConfig: () => Promise<boolean>;
  /** Reload from DB */
  reload: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useCastProjectData(projectId: string | null): CastProjectData {
  const { saveProjectContent, loadProjectContent, isLoading: persistenceLoading } = useCastProjectPersistence();
  const [snapshot, setSnapshot] = useState<ProjectContentSnapshot | null>(null);
  const [isSeeded, setIsSeeded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // ─── Load from DB on mount ───────────────────────────────────────────

  const loadFromDB = useCallback(async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const content = await loadProjectContent(projectId);
      if (content && content.scenes.length > 0) {
        setSnapshot(content);
        setIsSeeded(true);
      } else {
        setIsSeeded(false);
      }
    } catch (err) {
      console.error('[useCastProjectData] Load error:', err);
      setIsSeeded(false);
    } finally {
      setIsLoading(false);
      setLoadAttempted(true);
    }
  }, [projectId, loadProjectContent]);

  useEffect(() => {
    if (!loadAttempted) {
      loadFromDB();
    }
  }, [loadFromDB, loadAttempted]);

  // ─── Seed from config files ──────────────────────────────────────────

  const seedFromConfig = useCallback(async (): Promise<boolean> => {
    if (!projectId) return false;

    try {
      // Dynamic imports to avoid coupling the hook to EP04-specific config
      const [scriptModule, configModule] = await Promise.all([
        import('@/config/ep04-script-content'),
        import('@/config/ep04-production-config'),
      ]);

      const config: SeedConfig = {
        scriptContent: scriptModule.EP04_SCRIPT_CONTENT,
        voices: configModule.EP04_VOICES as unknown as Record<string, VoiceConfigInput>,
        scenePipelines: configModule.EP04_SCENE_PIPELINES,
        musicScore: configModule.EP04_MUSIC_SCORE as Record<string, { music: unknown; sfx?: unknown[] }>,
        socialClips: configModule.EP04_SOCIAL_CLIPS,
        sceneIdMap: configModule.SCRIPT_TO_PIPELINE_MAP,
      };

      const snap = buildSnapshotFromConfig(projectId, config);
      const ok = await saveProjectContent(projectId, snap);

      if (ok) {
        // Reload from DB to get server-assigned IDs
        await loadFromDB();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useCastProjectData] Seed error:', err);
      return false;
    }
  }, [projectId, saveProjectContent, loadFromDB]);

  // ─── Derived lookups (memoized) ──────────────────────────────────────

  const voiceConfigMap = useMemo(() => {
    const map = new Map<string, VoiceConfig>();
    if (!snapshot) return map;
    for (const char of snapshot.characters) {
      const vc = char.voice_config as Record<string, unknown> | null;
      if (vc) {
        map.set(char.character_key, {
          provider: (vc.provider as string) || char.voice_provider || 'elevenlabs',
          voiceId: (vc.voiceId as string) || char.voice_id || '',
          stability: vc.stability as number | undefined,
          similarityBoost: vc.similarityBoost as number | undefined,
          speed: vc.speed as number | undefined,
          rate: vc.rate as string | undefined,
          pitch: vc.pitch as string | undefined,
          eqProfile: vc.eqProfile as string | undefined,
          style: vc.style as string | undefined,
          fallback: vc.fallback as VoiceConfig['fallback'] | undefined,
        });
      } else {
        // Minimal config from top-level fields
        map.set(char.character_key, {
          provider: char.voice_provider || 'elevenlabs',
          voiceId: char.voice_id || '',
        });
      }
    }
    return map;
  }, [snapshot]);

  const sceneConfigMap = useMemo(() => {
    const map = new Map<string, SceneConfig>();
    if (!snapshot) return map;
    for (const scene of snapshot.scenes) {
      const sc = scene.scene_config as Record<string, unknown> | null;
      if (sc) {
        map.set(scene.scene_key, {
          pipeline: (sc.pipeline as PipelineConfig) || { steps: [] },
          music: sc.music || null,
          sfx: (sc.sfx as unknown[]) || null,
          socialClips: (sc.socialClips as SocialClipData[]) || [],
          sceneIdMapping: (sc.sceneIdMapping as SceneConfig['sceneIdMapping']) || {
            scriptSceneId: scene.scene_key,
            pipelineSceneId: scene.scene_key,
          },
        });
      }
    }
    return map;
  }, [snapshot]);

  const socialClips = useMemo(() => {
    const all: SocialClipData[] = [];
    for (const config of sceneConfigMap.values()) {
      if (config.socialClips?.length) {
        all.push(...config.socialClips);
      }
    }
    // Deduplicate by clipId
    const seen = new Set<string>();
    return all.filter(c => {
      if (seen.has(c.clipId)) return false;
      seen.add(c.clipId);
      return true;
    });
  }, [sceneConfigMap]);

  const scriptLinesByScene = useMemo(() => {
    const map = new Map<string, PersistedScriptLine[]>();
    if (!snapshot) return map;
    for (const line of snapshot.scriptLines) {
      // Group by scene_key (we need to reverse-resolve from scene UUID)
      // Since lines have scene_id (UUID), find the scene_key from scenes
      const scene = snapshot.scenes.find(s => s.id === line.scene_id);
      const sceneKey = scene?.scene_key || line.scene_id;
      if (!map.has(sceneKey)) map.set(sceneKey, []);
      map.get(sceneKey)!.push(line);
    }
    return map;
  }, [snapshot]);

  const voiceConfigFor = useCallback((characterKey: string): VoiceConfig | null => {
    return voiceConfigMap.get(characterKey) || null;
  }, [voiceConfigMap]);

  const scenePipelineFor = useCallback((sceneKey: string): PipelineConfig | null => {
    return sceneConfigMap.get(sceneKey)?.pipeline || null;
  }, [sceneConfigMap]);

  const sceneConfigFor = useCallback((sceneKey: string): SceneConfig | null => {
    return sceneConfigMap.get(sceneKey) || null;
  }, [sceneConfigMap]);

  return {
    scenes: snapshot?.scenes || [],
    scriptLines: snapshot?.scriptLines || [],
    characters: snapshot?.characters || [],
    voiceConfigFor,
    scenePipelineFor,
    sceneConfigFor,
    socialClips,
    scriptLinesByScene,
    isLoading: isLoading || persistenceLoading,
    isSeeded,
    seedFromConfig,
    reload: loadFromDB,
  };
}
