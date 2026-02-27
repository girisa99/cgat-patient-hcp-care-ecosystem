/**
 * seedProjectFromConfig — One-time seeder that converts EP04 hardcoded config
 * into DB-persisted ProjectContentSnapshot via JSONB packing.
 *
 * After seed, the DB becomes the source of truth — config files are only
 * used as fallback / seed source.
 *
 * Usage:
 *   const snapshot = await seedProjectFromConfig(projectId, {
 *     scriptContent: EP04_SCRIPT_CONTENT,
 *     voices: EP04_VOICES,
 *     scenePipelines: EP04_SCENE_PIPELINES,
 *     musicScore: EP04_MUSIC_SCORE,
 *     socialClips: EP04_SOCIAL_CLIPS,
 *     sceneIdMap: SCRIPT_TO_PIPELINE_MAP,
 *   });
 */

import type {
  PersistedScene,
  PersistedScriptLine,
  PersistedCharacter,
  ProjectContentSnapshot,
} from '@/hooks/useCastProjectPersistence';
import type { ScriptLine } from '@/config/ep04-script-content';
import type { SocialClip } from '@/config/ep04-production-config';

// ─── Input types (mirrors config exports without tight coupling) ──────────

export interface VoiceConfigInput {
  provider: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
  rate?: string;
  pitch?: string;
  eqProfile?: string;
  style?: string;
  description?: string;
  fallbackProvider?: string;
  fallbackVoice?: { model: string; voice: string; lang: string };
}

export interface SeedConfig {
  scriptContent: Record<string, ScriptLine>;
  voices: Record<string, VoiceConfigInput>;
  scenePipelines: Record<string, unknown[]>;
  musicScore: Record<string, { music: unknown; sfx?: unknown[] }>;
  socialClips: SocialClip[];
  sceneIdMap: Record<string, string>;
}

// ─── Scene titles (derived from script content patterns) ──────────────────

const SCENE_TITLES: Record<string, string> = {
  'scene-0-title': 'Scene 0 — Title & Welcome',
  'scene-1-problem': 'Scene 1 — The Problem',
  'scene-2-introductions': 'Scene 2 — Meet the Team',
  'scene-3-origin': 'Scene 3 — The Origin Story',
  'scene-4-solution': 'Scene 4 — The Solution',
  'scene-5-governance': 'Scene 5 — Governance',
  'scene-6-po-actions': 'Scene 6 — PO Actions',
  'scene-7-velocity': 'Scene 7 — Velocity & Scope Creep',
  'scene-8-numbers': 'Scene 8 — The Numbers',
  'scene-9-challenges': 'Scene 9 — Honest Challenges',
  'scene-10-whats-next': 'Scene 10 — What\'s Next',
  'scene-11-close': 'Scene 11 — Close & CTA',
};

const SCENE_STYLES: Record<string, string> = {
  'scene-0-title': 'Pixar 3D',
  'scene-1-problem': 'Anime',
  'scene-2-introductions': 'Watercolor',
  'scene-3-origin': 'Flat Illustration',
  'scene-4-solution': 'Pixar 3D',
  'scene-5-governance': 'Anime',
  'scene-6-po-actions': 'Watercolor',
  'scene-7-velocity': 'Pixar 3D',
  'scene-8-numbers': 'Flat Illustration',
  'scene-9-challenges': 'Anime',
  'scene-10-whats-next': 'Watercolor',
  'scene-11-close': 'Pixar 3D',
};

const VOICE_LABELS: Record<string, string> = {
  host: 'Host (Brian) — Sai Dasika, Product Owner',
  atlas: 'Atlas (Azure Guy) — Claude Code',
  nova: 'Nova (Lily) — Lovable',
  squirrel: '🐿️ Squirrel (Gigi) — The Distractor',
  allaudin: '🧞 Allaudin (Clyde) — The Genie',
};

const VOICE_COLORS: Record<string, string> = {
  host: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  atlas: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  nova: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  squirrel: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  allaudin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

// ─── Build functions ──────────────────────────────────────────────────────

function buildCharacters(
  projectId: string,
  voices: Record<string, VoiceConfigInput>,
): PersistedCharacter[] {
  return Object.entries(voices).map(([key, v]) => ({
    project_id: projectId,
    character_key: key,
    display_name: VOICE_LABELS[key] || key,
    color_class: VOICE_COLORS[key] || null,
    voice_provider: v.provider,
    voice_id: v.voiceId,
    voice_config: {
      provider: v.provider,
      voiceId: v.voiceId,
      stability: v.stability,
      similarityBoost: v.similarityBoost,
      speed: v.speed,
      rate: v.rate,
      pitch: v.pitch,
      eqProfile: v.eqProfile,
      style: v.style,
      fallback: v.fallbackProvider && v.fallbackVoice
        ? { provider: v.fallbackProvider, voiceId: v.fallbackVoice.voice, model: v.fallbackVoice.model }
        : undefined,
    } as Record<string, unknown>,
  }));
}

function buildScenes(
  projectId: string,
  scriptContent: Record<string, ScriptLine>,
  scenePipelines: Record<string, unknown[]>,
  musicScore: Record<string, { music: unknown; sfx?: unknown[] }>,
  socialClips: SocialClip[],
  sceneIdMap: Record<string, string>,
): PersistedScene[] {
  // Derive unique scene IDs from script content (preserving order)
  const sceneIds = [...new Set(Object.values(scriptContent).map(l => l.scene))];

  return sceneIds.map((sceneId, idx) => {
    const pipelineSceneId = sceneIdMap[sceneId] || sceneId;
    const pipelineSteps = scenePipelines[pipelineSceneId] || [];
    const music = musicScore[pipelineSceneId] || musicScore[sceneId] || null;
    const clipsForScene = socialClips.filter(c =>
      c.sourceScenes.includes(sceneId) || c.sourceScenes.includes(pipelineSceneId),
    );

    // Calculate duration from script lines in this scene
    const sceneDuration = Object.values(scriptContent)
      .filter(l => l.scene === sceneId)
      .reduce((sum, l) => sum + l.duration_est, 0);

    return {
      project_id: projectId,
      scene_key: sceneId,
      title: SCENE_TITLES[sceneId] || sceneId,
      scene_index: idx,
      art_style: SCENE_STYLES[sceneId] || null,
      visual_style: SCENE_STYLES[sceneId] || null,
      duration_seconds: sceneDuration,
      scene_config: {
        pipeline: {
          steps: pipelineSteps,
        },
        music: music?.music || null,
        sfx: music?.sfx || null,
        socialClips: clipsForScene.map(c => ({
          clipId: c.id,
          category: c.category,
          theme: c.theme,
          timestamp: c.timestamp,
          duration: c.duration,
          hook: c.hook,
          cta: c.cta,
          hashtags: c.hashtags,
          platforms: c.platforms,
          captionStyle: c.captionStyle,
          messaging: c.messaging,
        })),
        sceneIdMapping: {
          scriptSceneId: sceneId,
          pipelineSceneId,
        },
      } as Record<string, unknown>,
    };
  });
}

function buildScriptLines(
  projectId: string,
  scriptContent: Record<string, ScriptLine>,
): PersistedScriptLine[] {
  return Object.entries(scriptContent).map(([key, line], idx) => ({
    project_id: projectId,
    scene_id: line.scene, // scene_key — resolved to UUID by useCastProjectPersistence
    line_key: key,
    line_index: idx,
    character_id: line.voice,
    dialogue: line.text,
    direction: line.direction || null,
    motion: line.motion || null,
    duration_hint: `${line.duration_est}s`,
    sfx_tags: line.sfx || null,
    visual_tags: line.visual_ref ? [line.visual_ref] : null,
    tts_audio_url: null,
    tts_status: null,
    tts_provider: null,
    tts_voice_id: null,
    line_config: {
      motion: line.motion || null,
      sfx: line.sfx ? line.sfx.join(', ') : null,
      direction: line.direction || null,
      durationHint: `${line.duration_est}s`,
      lipsync: line.lipsync || false,
      isInterruption: line.isInterruption || false,
      links: line.links || null,
      visualRef: line.visual_ref || null,
    } as Record<string, unknown>,
  }));
}

// ─── Main seed function ───────────────────────────────────────────────────

/**
 * Builds a ProjectContentSnapshot from EP04 config files.
 * The snapshot can be passed to useCastProjectPersistence.saveProjectContent()
 * to persist everything into the DB.
 */
export function buildSnapshotFromConfig(
  projectId: string,
  config: SeedConfig,
): ProjectContentSnapshot {
  const characters = buildCharacters(projectId, config.voices as Record<string, VoiceConfigInput>);
  const scenes = buildScenes(
    projectId,
    config.scriptContent,
    config.scenePipelines,
    config.musicScore,
    config.socialClips,
    config.sceneIdMap,
  );
  const scriptLines = buildScriptLines(projectId, config.scriptContent);

  return { scenes, scriptLines, characters };
}
