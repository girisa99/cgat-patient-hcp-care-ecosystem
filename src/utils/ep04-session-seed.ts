/**
 * EP04 SESSION SEED — Pre-populates GenieCastSessionState with all 12 EP04 scenes
 *
 * Maps EP04_SCRIPT_CONTENT + EP04_SCENE_PIPELINES + EP04_VOICES into the
 * unified GenieCast CREATE → PRODUCE pipeline so EP04 can be tested
 * end-to-end through Genie Cast's shared infrastructure.
 *
 * NO DUPLICATES: Reads directly from existing ep04-production-config and ep04-script-content.
 */

import type { GenieCastSessionState, SelectedTemplate } from '@/hooks/useGenieCastSession';
import type { MessagingContent, TemplateMapping, SceneScript } from '@/hooks/useUnifiedAuthoring';
import { EP04_SCRIPT_CONTENT, type ScriptLine } from '@/config/ep04-script-content';
import { EP04_SCENE_PIPELINES, EP04_VOICES, EP04_AVATAR_CONFIG, EP04_MUSIC_SCORE } from '@/config/ep04-production-config';

// ─── SCENE METADATA ────────────────────────────────────────────────────────────
// Derive scene list from EP04_SCENE_PIPELINES keys (source of truth)
const SCENE_IDS = Object.keys(EP04_SCENE_PIPELINES);

const SCENE_LABELS: Record<string, string> = {
  'scene-1-cold-open': 'Cold Open — The Hook',
  'scene-2-meet-team': 'Meet the Team — Atlas, Nova & Host',
  'scene-3-governance': 'Governance — Territory Rules',
  'scene-4-day1': 'Day 1 — The Sprint Begins',
  'scene-5-day2': 'Day 2 — The Blocker',
  'scene-6-day3': 'Day 3 — Velocity Mismatch',
  'scene-7-mission-control': 'Mission Control — Async Standups',
  'scene-8-dashboard-tour': 'Dashboard Tour — 18 Screens',
  'scene-9-numbers': 'The Numbers — 5x Results',
  'scene-10-whats-next': 'What\'s Next — Vision',
  'scene-11-close': 'Close — Takeaway & CTA',
};

// ─── HELPERS ────────────────────────────────────────────────────────────────────

/** Get all script lines for a given scene */
function getScriptLinesForScene(sceneId: string): { key: string; line: ScriptLine }[] {
  return Object.entries(EP04_SCRIPT_CONTENT)
    .filter(([, line]) => line.scene === sceneId)
    .map(([key, line]) => ({ key, line }));
}

/** Calculate total estimated duration for a scene from its script lines */
function getSceneDuration(sceneId: string): number {
  return getScriptLinesForScene(sceneId)
    .reduce((sum, { line }) => sum + line.duration_est, 0);
}

/** Get total EP04 estimated duration */
export function getEP04TotalDuration(): number {
  return SCENE_IDS.reduce((sum, id) => sum + getSceneDuration(id), 0);
}

/** Count total script lines */
export function getEP04ScriptLineCount(): number {
  return Object.keys(EP04_SCRIPT_CONTENT).length;
}

/** Count total pipeline steps across all scenes */
export function getEP04PipelineStepCount(): number {
  return SCENE_IDS.reduce((sum, id) => sum + EP04_SCENE_PIPELINES[id].length, 0);
}

// ─── BUILD SELECTED TEMPLATE ───────────────────────────────────────────────────

function buildEP04Template(): SelectedTemplate {
  const totalDuration = getEP04TotalDuration();
  return {
    id: 'ep04-beyond-ai-hype',
    name: 'Beyond AI Hype — Episode 4',
    category: 'brand-documentary',
    sceneCount: SCENE_IDS.length,
    estimatedDuration: totalDuration,
    styleIntent: 'product-hero',
    targetPlatforms: ['youtube', 'linkedin'],
    capabilities: {
      avatar: true,
      '3d': true,
      animation: true,
      lipsync: true,
    },
    industryTags: ['technology', 'ai', 'software-development'],
    targetRegions: ['global'],
  };
}

// ─── BUILD MESSAGING CONTENT ────────────────────────────────────────────────────

function buildEP04Messaging(): MessagingContent {
  // Extract the hook from first host line
  const hookLine = EP04_SCRIPT_CONTENT['title-welcome'];
  const ctaLine = Object.values(EP04_SCRIPT_CONTENT).find(l => l.scene === 'scene-11-close' && l.voice === 'host');

  return {
    id: 'ep04-messaging',
    productId: 'genie-cast',
    hook: '41 tasks. 5 days. 2 AI developers. Zero standup meetings. This is what happened.',
    valueProposition: 'One developer managing two AIs does the work of five — not in theory, in production, with governance and receipts.',
    painPoints: [
      'Traditional sprints are slow and bottlenecked by human meetings',
      'Context switching kills developer velocity',
      'AI tools are overhyped but underdelivered in practice',
    ],
    benefits: [
      '5x traditional sprint velocity',
      'Zero standup meetings — fully async',
      'Real governance with territory rules',
      'Measurable results via live dashboard',
    ],
    differentiators: [
      'Two AIs with distinct roles — backend (Atlas/Claude) and frontend (Nova/Lovable)',
      'Human PO acts as orchestra conductor, not coder',
      'Sprint tracker dashboard proves claims with real data',
    ],
    cta: ctaLine?.text?.substring(0, 120) || 'Explore the sprint tracker dashboard yourself — all metrics are live and queryable.',
    shortScript: hookLine?.text?.substring(0, 200) || '',
    mediumScript: hookLine?.text?.substring(0, 500) || '',
    longScript: hookLine?.text || '',
    approvalStatus: 'approved',
    language: 'en-US',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ─── BUILD TEMPLATE MAPPING (SCENE SCRIPTS) ─────────────────────────────────────

function buildEP04TemplateMapping(): TemplateMapping {
  const scenes: SceneScript[] = SCENE_IDS.map((sceneId, index) => {
    const sceneLines = getScriptLinesForScene(sceneId);
    const combinedText = sceneLines.map(({ line }) => `[${line.voice.toUpperCase()}] ${line.text}`).join('\n\n');
    const duration = getSceneDuration(sceneId);
    
    // Determine primary TTS provider from first speaking line
    const firstVoice = sceneLines[0]?.line.voice || 'host';
    const voiceConfig = EP04_VOICES[firstVoice === 'squirrel' ? 'nova' : firstVoice === 'allaudin' ? 'host' : firstVoice];

    return {
      sceneId,
      sceneKey: sceneId,
      title: SCENE_LABELS[sceneId] || sceneId,
      orderIndex: index,
      scriptText: combinedText,
      sourceType: 'custom' as const,
      durationSeconds: duration,
      minDuration: Math.max(10, duration - 15),
      maxDuration: duration + 30,
      ttsConfig: {
        provider: voiceConfig?.provider || 'elevenlabs',
        voiceId: 'voiceId' in voiceConfig ? voiceConfig.voiceId : undefined,
        speed: 1.0,
        pitch: 0,
      },
      approvalStatus: 'approved' as const,
    };
  });

  return {
    templateId: 'ep04-beyond-ai-hype',
    templateName: 'Beyond AI Hype — Episode 4',
    scenes,
    totalDuration: getEP04TotalDuration(),
    styleIntent: 'product-hero',
    resolvedProviders: {
      image: 'alibaba-wanx',
      video: 'alibaba-wan2.6',
      tts: 'elevenlabs+azure',
      llm: 'anthropic',
    },
  };
}

// ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────────

/**
 * Creates a fully-populated GenieCastSessionState for EP04.
 * Call this from useGenieCastSession.updateSession() to pre-load EP04.
 */
export function createEP04SessionSeed(): Partial<GenieCastSessionState> {
  return {
    // Product & intent
    selectedProductId: null, // Will be resolved by GenieCast's auto-select
    selectedIntent: 'brand-documentary',
    detectedRegion: 'en',
    selectedRegion: 'en',

    // CREATE stage — all pre-populated
    selectedStyles: ['cinematic', 'pixar-3d', 'disney-2d'],
    selectedTemplate: buildEP04Template(),
    approvedMessaging: buildEP04Messaging(),

    // PRODUCE stage — template mapping ready
    templateMapping: buildEP04TemplateMapping(),
    ttsGenerated: false,  // Not yet — this is what we'll test
    avSyncVerified: false,

    // Regional
    targetRegions: ['global'],
    selectedDialects: ['en-US'],

    // Approval items — template + messaging pre-approved
    approvalItems: [
      {
        id: 'ep04-beyond-ai-hype',
        stage: 'template_selection',
        title: 'Beyond AI Hype — Episode 4',
        description: `${SCENE_IDS.length} scenes • ${Math.floor(getEP04TotalDuration() / 60)}:${String(getEP04TotalDuration() % 60).padStart(2, '0')}`,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ep04-messaging',
        stage: 'messaging_generation',
        title: 'EP04 Marketing Messaging',
        description: '41 tasks, 5 days, 2 AI devs — approved',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ep04-script-mapping',
        stage: 'template_mapping',
        title: 'EP04 Script Mapping',
        description: `${getEP04ScriptLineCount()} lines across ${SCENE_IDS.length} scenes`,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],

    // Stage tracking — CREATE complete, PRODUCE ready
    currentStage: 'tts_generation',
    completedStages: ['template_selection', 'messaging_generation', 'script_composition', 'template_mapping'],
  };
}

// ─── STATS FOR UI ────────────────────────────────────────────────────────────────

export function getEP04Stats() {
  const totalDuration = getEP04TotalDuration();
  const voiceCounts = { host: 0, atlas: 0, nova: 0, allaudin: 0, squirrel: 0 };
  Object.values(EP04_SCRIPT_CONTENT).forEach(line => {
    if (line.voice in voiceCounts) voiceCounts[line.voice as keyof typeof voiceCounts]++;
  });

  const pipelineTypes = new Set<string>();
  Object.values(EP04_SCENE_PIPELINES).flat().forEach(step => pipelineTypes.add(step.type));

  return {
    scenes: SCENE_IDS.length,
    scriptLines: getEP04ScriptLineCount(),
    totalDuration,
    formattedDuration: `${Math.floor(totalDuration / 60)}:${String(totalDuration % 60).padStart(2, '0')}`,
    voiceCounts,
    characters: Object.keys(EP04_AVATAR_CONFIG.characters).length,
    pipelineSteps: getEP04PipelineStepCount(),
    pipelineTypes: Array.from(pipelineTypes),
    musicScenes: Object.keys(EP04_MUSIC_SCORE).length,
  };
}
