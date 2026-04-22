/**
 * EP04 Part 2 — "The Production" Documentary Template
 *
 * Converts EP04 Part 2 config files into a generic ProjectTemplate.
 * Thin adapter — reads from existing:
 *   - ep04-part2-production-config.ts (voices, pipelines, transitions, bookends, music)
 *   - ep04-part2-script-content.ts (132 script lines + narrator bridges)
 *
 * Used by seedProjectFromTemplate() to populate DB for the generic CastProductionPage.
 */

import type { ProjectTemplate } from '@/utils/seedProjectFromTemplate';
import {
  EP04_PART2_VOICES,
  EP04_PART2_SCENE_PIPELINES,
  EP04_PART2_MUSIC_SCORE,
  EP04_PART2_TRANSITIONS,
  EP04_PART2_STORYBOOK_BOOKENDS,
} from '@/config/ep04-part2-production-config';
import {
  EP04_PART2_SCRIPT_CONTENT,
  EP04_PART2_NARRATOR_BRIDGES,
  P2_SCENES,
  type Part2ScriptLine,
} from '@/config/ep04-part2-script-content';

// ─── Scene metadata ─────────────────────────────────────────────────────────

const P2_SCENE_TITLES: Record<string, string> = {
  [P2_SCENES.COLD_OPEN]: 'Cold Open — What You\'re About to See',
  [P2_SCENES.RECAP]: 'Recap — The Story So Far',
  [P2_SCENES.NOVA_FAREWELL]: 'Nova\'s Farewell',
  [P2_SCENES.ATLAS_SOLO]: 'Atlas Flies Solo',
  [P2_SCENES.JSON2VIDEO_DEATH]: 'json2video Dies',
  [P2_SCENES.PRODUCTION_HELL]: 'Production Hell',
  [P2_SCENES.MODEL_CRISIS]: 'The Model Crisis',
  [P2_SCENES.PROVIDER_STACK]: 'The 19-Provider Stack',
  [P2_SCENES.CHARACTERS_SPEAK]: 'Characters Come Alive',
  [P2_SCENES.PIPELINE_LIVE]: 'Pipeline Goes Live',
  [P2_SCENES.THIRTY_MINUTES]: '30 Minutes of AI',
  [P2_SCENES.META_MOMENT]: 'The Meta Moment',
  [P2_SCENES.DIFFERENT_PODCAST]: 'A Different Kind of Podcast',
  [P2_SCENES.IMAGINATION]: 'What If We Could Imagine?',
  [P2_SCENES.RETRO_CTA]: 'Retro & CTA',
  [P2_SCENES.FINALE]: 'Finale — The End... For Now',
};

// ─── SyncMarkers packing helpers ─────────────────────────────────────────────
// ProjectTemplate.scriptLines doesn't have a syncMarkers field.
// Pack into existing JSONB-destined fields so production pipeline can parse them.

function packSyncMarkersIntoDirection(
  direction: string | undefined,
  markers: Part2ScriptLine['syncMarkers'],
): string | undefined {
  if (!markers) return direction;
  const parts: string[] = [];
  if (direction) parts.push(direction);
  if (markers.visualCue) parts.push(`[visualCue: ${markers.visualCue}]`);
  return parts.length ? parts.join(' ') : undefined;
}

function packSyncMarkersIntoMotion(
  motion: string | undefined,
  markers: Part2ScriptLine['syncMarkers'],
): string | undefined {
  if (!markers) return motion;
  const extras: Record<string, unknown> = {};
  if (markers.holdAfter != null) extras.holdAfter = markers.holdAfter;
  if (markers.overlapPrev != null) extras.overlapPrev = markers.overlapPrev;
  if (markers.transitionIn) extras.transitionIn = markers.transitionIn;
  if (Object.keys(extras).length === 0) return motion;
  const suffix = `[sync:${JSON.stringify(extras)}]`;
  return motion ? `${motion} ${suffix}` : suffix;
}

function packMusicSyncIntoSfx(
  sfx: string[] | undefined,
  markers: Part2ScriptLine['syncMarkers'],
): string[] | undefined {
  if (!markers?.musicSync) return sfx;
  const arr = sfx ? [...sfx] : [];
  arr.push(`music:${markers.musicSync}`);
  return arr;
}

// ─── Build template from EP04 Part 2 config ──────────────────────────────────

export function buildEP04Part2Template(): ProjectTemplate {
  // Characters from EP04_PART2_VOICES (9 entries)
  const characters: ProjectTemplate['characters'] = Object.entries(EP04_PART2_VOICES).map(([key, voice]) => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    role: voice.description,
    voiceProvider: voice.provider,
    voiceId: voice.voiceId,
    fallbackProvider: 'fallbackProvider' in voice ? (voice as any).fallbackProvider : undefined,
    fallbackVoice: 'fallbackVoice' in voice ? (voice as any).fallbackVoice as Record<string, unknown> : undefined,
    style: voice.style,
    stability: 'stability' in voice ? (voice as any).stability : undefined,
    similarityBoost: 'similarityBoost' in voice ? (voice as any).similarityBoost : undefined,
    rate: 'rate' in voice ? (voice as any).rate : undefined,
    pitch: 'pitch' in voice ? (voice as any).pitch : undefined,
    speed: 'speed' in voice ? (voice as any).speed : undefined,
    eqProfile: voice.eqProfile,
  }));

  // Scenes from P2_SCENE_TITLES + pipelines + music
  const sceneKeys = Object.values(P2_SCENES);
  const scenes: ProjectTemplate['scenes'] = sceneKeys.map((key, idx) => {
    const pipeline = EP04_PART2_SCENE_PIPELINES[key];
    const musicEntry = EP04_PART2_MUSIC_SCORE[key];

    return {
      key,
      title: P2_SCENE_TITLES[key] || key,
      sceneIndex: idx,
      pipeline: Array.isArray(pipeline) ? pipeline.map(p => ({ ...p } as Record<string, unknown>)) : [],
      musicConfig: musicEntry?.music ? {
        prompt: musicEntry.music.prompt,
        duration: musicEntry.music.duration,
        style: musicEntry.music.style,
      } : undefined,
      sfxConfig: musicEntry?.sfx?.map(s => ({
        prompt: s.prompt,
        duration: s.duration,
      })),
    };
  });

  // Script lines from EP04_PART2_SCRIPT_CONTENT + narrator bridges
  const scriptLines: ProjectTemplate['scriptLines'] = [];
  let globalIdx = 0;

  // Main dialogue lines
  const contentEntries = Object.entries(EP04_PART2_SCRIPT_CONTENT) as [string, Part2ScriptLine][];
  for (const [key, line] of contentEntries) {
    scriptLines.push({
      key,
      text: line.text,
      characterKey: line.voice,
      sceneKey: line.scene,
      lineIndex: globalIdx++,
      durationEst: line.duration_est,
      direction: packSyncMarkersIntoDirection(line.direction, line.syncMarkers),
      motion: packSyncMarkersIntoMotion(line.motion, line.syncMarkers),
      lipsync: line.lipsync,
      sfx: packMusicSyncIntoSfx(line.sfx, line.syncMarkers),
      visualRef: line.visual_ref,
      isInterruption: line.isInterruption,
      links: line.links,
    });
  }

  // Narrator bridges
  if (EP04_PART2_NARRATOR_BRIDGES) {
    for (const [key, bridge] of Object.entries(EP04_PART2_NARRATOR_BRIDGES)) {
      scriptLines.push({
        key,
        text: bridge.text || '',
        characterKey: bridge.voice || 'host',
        sceneKey: bridge.scene || 'transition',
        lineIndex: globalIdx++,
        durationEst: bridge.duration_est || 7,
        direction: packSyncMarkersIntoDirection(bridge.direction || 'narrator bridge', bridge.syncMarkers),
        motion: packSyncMarkersIntoMotion(bridge.motion, bridge.syncMarkers),
        lipsync: bridge.lipsync,
        sfx: packMusicSyncIntoSfx(bridge.sfx, bridge.syncMarkers),
      });
    }
  }

  // Transitions
  const transitions: ProjectTemplate['transitions'] = EP04_PART2_TRANSITIONS?.map(t => ({
    from: t.from,
    to: t.to,
    style: t.style || 'dissolve',
    duration: t.steps?.reduce((sum: number, s: any) => sum + (s.duration || 3), 0) || 5,
  })) || [];

  // Bookends
  const bookends: ProjectTemplate['bookends'] = EP04_PART2_STORYBOOK_BOOKENDS ? {
    opening: {
      duration: EP04_PART2_STORYBOOK_BOOKENDS.opening.reduce((sum, s) => sum + (s.duration || 5), 0),
      title: 'EP04 Part 2 — The Production',
    },
    closing: {
      duration: EP04_PART2_STORYBOOK_BOOKENDS.closing.reduce((sum, s) => sum + (s.duration || 5), 0),
      title: 'The End... For Now',
    },
  } : undefined;

  return {
    metadata: {
      title: 'EP04 Part 2 — The Production',
      description: 'Beyond AI Hype Episode 2, Part 2 — 16 scenes, 9 voices, ~30 min',
      contentType: 'documentary',
      language: 'en',
      quality: 'production',
      styleIntent: 'ep04-part2-the-production',
      targetRegions: ['global'],
      selectedDialects: ['en-US'],
    },
    characters,
    scenes,
    scriptLines,
    transitions,
    bookends,
  };
}

/** Pre-built EP04 Part 2 template — lazy evaluated */
let _cachedTemplate: ProjectTemplate | null = null;
export function getEP04Part2Template(): ProjectTemplate {
  if (!_cachedTemplate) _cachedTemplate = buildEP04Part2Template();
  return _cachedTemplate;
}
