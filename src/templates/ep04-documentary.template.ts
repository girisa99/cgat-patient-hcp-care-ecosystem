/**
 * EP04 Documentary Template
 *
 * Converts EP04 config files into a generic ProjectTemplate.
 * This is a THIN ADAPTER — it reads from existing:
 *   - ep04-production-config.ts (voices, pipelines, transitions, bookends)
 *   - ep04-script-content.ts (109 script lines + narrator bridges)
 *
 * Used by seedProjectFromTemplate() to populate DB for the generic CastProductionPage.
 */

import type { ProjectTemplate } from '@/utils/seedProjectFromTemplate';
import { EP04_VOICES, EP04_STORYBOOK_TRANSITIONS, EP04_STORYBOOK_BOOKENDS, EP04_SCENE_PIPELINES, SCRIPT_TO_PIPELINE_MAP } from '@/config/ep04-production-config';
import { EP04_SCRIPT_CONTENT, EP04_NARRATOR_BRIDGES, type ScriptLine } from '@/config/ep04-script-content';

// ─── Scene metadata ─────────────────────────────────────────────────────────

const SCENE_TITLES: Record<string, string> = {
  'scene-0-title': 'Opening — The Genie Appears',
  'scene-1-problem': 'The Problem — Sprint Chaos',
  'scene-2-introductions': 'Meet the Team',
  'scene-3-origin': 'Origin Story',
  'scene-4-solution': 'The Solution — Sprint Tracker',
  'scene-5-governance': 'Governance & Guardrails',
  'scene-6-po-actions': 'PO Actions',
  'scene-7-velocity': 'Velocity & Momentum',
  'scene-8-numbers': 'The Numbers',
  'scene-9-challenges': 'Honest Challenges',
  'scene-10-whats-next': 'What\'s Next — MCP Vision',
  'scene-11-close': 'Goodbye & CTA',
};

// ─── Build template from EP04 config ────────────────────────────────────────

export function buildEP04Template(): ProjectTemplate {
  // Characters from EP04_VOICES
  const characters: ProjectTemplate['characters'] = Object.entries(EP04_VOICES).map(([key, voice]) => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    role: voice.description,
    voiceProvider: voice.provider,
    voiceId: voice.voiceId,
    fallbackProvider: voice.fallbackProvider,
    fallbackVoice: voice.fallbackVoice as unknown as Record<string, unknown>,
    style: voice.style,
    stability: 'stability' in voice ? voice.stability : undefined,
    similarityBoost: 'similarityBoost' in voice ? voice.similarityBoost : undefined,
    rate: 'rate' in voice ? (voice as any).rate : undefined,
    pitch: 'pitch' in voice ? (voice as any).pitch : undefined,
    eqProfile: voice.eqProfile,
  }));

  // Scenes from SCENE_TITLES + pipelines
  const sceneKeys = Object.keys(SCENE_TITLES);
  const scenes: ProjectTemplate['scenes'] = sceneKeys.map((key, idx) => {
    const pipelineKey = SCRIPT_TO_PIPELINE_MAP[key] || key;
    const pipeline = EP04_SCENE_PIPELINES[pipelineKey as keyof typeof EP04_SCENE_PIPELINES];

    return {
      key,
      title: SCENE_TITLES[key],
      sceneIndex: idx,
      pipeline: Array.isArray(pipeline) ? pipeline.map(p => ({ ...p } as Record<string, unknown>)) : [],
    };
  });

  // Script lines from EP04_SCRIPT_CONTENT + narrator bridges
  const scriptLines: ProjectTemplate['scriptLines'] = [];
  let globalIdx = 0;

  // Main dialogue lines
  const contentEntries = Object.entries(EP04_SCRIPT_CONTENT) as [string, ScriptLine][];
  for (const [key, line] of contentEntries) {
    scriptLines.push({
      key,
      text: line.text,
      characterKey: line.voice,
      sceneKey: line.scene,
      lineIndex: globalIdx++,
      durationEst: line.duration_est,
      direction: line.direction,
      motion: line.motion,
      lipsync: line.lipsync,
      sfx: line.sfx,
      visualRef: line.visual_ref,
      isInterruption: line.isInterruption,
      links: line.links,
    });
  }

  // Narrator bridges (transitions between scenes)
  if (EP04_NARRATOR_BRIDGES) {
    for (const [key, bridge] of Object.entries(EP04_NARRATOR_BRIDGES)) {
      scriptLines.push({
        key,
        text: (bridge as any).text || '',
        characterKey: (bridge as any).voice || 'host',
        sceneKey: (bridge as any).scene || 'transition',
        lineIndex: globalIdx++,
        durationEst: (bridge as any).duration_est || 7,
        direction: (bridge as any).direction || 'narrator bridge',
      });
    }
  }

  // Transitions
  const transitions: ProjectTemplate['transitions'] = EP04_STORYBOOK_TRANSITIONS?.map(t => ({
    from: t.from,
    to: t.to,
    style: t.style || 'dissolve',
    duration: t.steps?.reduce((sum: number, s: any) => sum + (s.duration || 3), 0) || 5,
  })) || [];

  // Bookends
  const bookends: ProjectTemplate['bookends'] = EP04_STORYBOOK_BOOKENDS ? {
    opening: {
      duration: EP04_STORYBOOK_BOOKENDS.opening?.duration || 21,
      title: 'Beyond AI Hype — Episode 2',
    },
    closing: {
      duration: EP04_STORYBOOK_BOOKENDS.closing?.duration || 16,
      title: 'The End... For Now',
    },
  } : undefined;

  return {
    metadata: {
      title: 'EP04 — Sprint Documentary',
      description: 'GenieSuite Sprint Documentary — 12 scenes, 5 voices, ~27 min',
      contentType: 'documentary',
      language: 'en',
      quality: 'production',
      styleIntent: 'ep04-sprint-documentary',
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

/** Pre-built EP04 template — lazy evaluated */
let _cachedTemplate: ProjectTemplate | null = null;
export function getEP04Template(): ProjectTemplate {
  if (!_cachedTemplate) _cachedTemplate = buildEP04Template();
  return _cachedTemplate;
}
