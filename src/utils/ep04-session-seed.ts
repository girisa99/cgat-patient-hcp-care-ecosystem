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
import { EP04_SCRIPT_CONTENT, EP04_NARRATOR_BRIDGES, type ScriptLine } from '@/config/ep04-script-content';
import { EP04_SCENE_PIPELINES, EP04_VOICES, EP04_AVATAR_CONFIG, EP04_MUSIC_SCORE, SCRIPT_TO_PIPELINE_MAP, EP04_STORYBOOK_BOOKENDS, EP04_STORYBOOK_TRANSITIONS, EP04_CHARACTER_INTERACTIONS, EP04_NARRATOR_SCROLLS, EP04_STORYBOOK_SCORE } from '@/config/ep04-production-config';
import { batchResolveScreenAssets, type ResolvedScreenAsset } from '@/services/screenAssetResolver';
import type { PersistedScene, PersistedScriptLine, PersistedCharacter } from '@/hooks/useCastProjectPersistence';
import type { VoiceConfig } from '@/hooks/useCastProjectData';

// ─── SCENE METADATA ────────────────────────────────────────────────────────────
// Derive scene list from script content (unique scene IDs, preserving order)
const SCENE_IDS = [...new Set(Object.values(EP04_SCRIPT_CONTENT).map(line => line.scene))];
// Pipeline scene IDs (for assembler lookups)
const PIPELINE_SCENE_IDS = Object.keys(EP04_SCENE_PIPELINES);

// Labels keyed by SCRIPT scene IDs (source of truth from ep04-script-content.ts)
const SCENE_LABELS: Record<string, string> = {
  'scene-0-title': 'Title + Allaudin Emerge',
  'scene-1-problem': 'The Problem — Human Sprint Pain',
  'scene-2-introductions': 'Meet the Team — Atlas, Nova & Host',
  'scene-3-origin': 'Frustration + Origin Story',
  'scene-4-solution': 'Sprint Tracker + Beta Launch',
  'scene-5-governance': 'Governance & Guardrails',
  'scene-6-po-actions': 'PO Actions — Born from Frustration',
  'scene-7-velocity': 'Velocity & Scope Creep',
  'scene-8-numbers': 'Dashboard Tour & Numbers',
  'scene-9-challenges': 'Honest Challenges — What Broke',
  'scene-10-whats-next': 'MCP Vision & What\'s Next',
  'scene-11-close': 'CTA + Goodbye',
};

// Storybook scene labels — opening, transitions, closing
const STORYBOOK_SCENE_LABELS: Record<string, string> = {
  'storybook-opening': 'Storybook Opening — Book Opens',
  'transition-0-to-1': 'Page Turn — Title to Cold Open',
  'transition-1-to-2': 'Iris Wipe — to Meet the Team',
  'transition-2-to-3': 'Scroll Unroll — to Origin Story',
  'transition-3-to-4': 'Storybook Flip — to Sprint Begins',
  'transition-4-to-5': 'Page Turn — to Governance',
  'transition-5-to-6': 'Chapter Card — The Bottleneck',
  'transition-6-to-7': 'Scroll Unroll — to Velocity',
  'transition-7-to-8': 'Storybook Flip — to Dashboard Tour',
  'transition-8-to-9': 'Page Turn — to Challenges',
  'transition-9-to-10': 'Dissolve Morph — Storm to Stars',
  'transition-10-to-11': 'Page Turn — to Closing',
  'storybook-closing': 'Storybook Closing — Book Closes',
};

// Pipeline labels (keyed by pipeline scene IDs for backward compat)
const PIPELINE_SCENE_LABELS: Record<string, string> = {
  'scene-0-title': 'Title + Allaudin Emerge',
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
    id: 'cafcd78a-7957-4021-ba8f-c20daba331b2', // Real DB blueprint ID
    name: 'EP04 — Beyond AI Hype',
    category: 'technology',
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
    hook: '41 tasks. 5 days. Claude + Lovable. Zero standup meetings. This is what actually happened.',
    valueProposition: 'One developer managing two AI developers — Claude Code for backend architecture, Lovable for frontend UI — does the work of five. Not in theory. In production. With governance, receipts, and a dashboard you can query.',
    painPoints: [
      // Theme 1: Human-AI Collaboration
      'Managing AI developers is harder than managing humans — they never stop, never context-switch, and wait on YOU',
      'The human becomes the bottleneck: 36 hours in pending review because the PO was in meetings',
      // Theme 2: Beyond AI Hype → Practical Results
      'AI productivity claims lack receipts — "5x faster" means nothing without a queryable dashboard',
      'Traditional sprints are slow and bottlenecked by meetings that AI developers don\'t need',
      // Theme 3: AI Democratization
      'Solo creators can\'t afford production teams — 19 AI providers replace an entire studio',
      'AI tools are overhyped individually but transformative when orchestrated together',
    ],
    benefits: [
      '5x traditional sprint velocity — measured, not claimed',
      'Zero standup meetings — fully async structured standups from Claude + Lovable',
      'Real governance with CLAUDE.md territory rules — no merge conflicts in 41 tasks',
      'Measurable results via live dashboard — every metric queryable',
      '19 AI providers orchestrated through one platform (Genie Cast)',
      'One human + two AIs = production-grade output across code, UI, and content',
    ],
    differentiators: [
      'Named AI developers: Claude Code (backend/architecture) + Lovable (frontend/UI) — not generic "AI tools"',
      'Human PO acts as orchestra conductor — async approvals, not meetings',
      'Sprint tracker dashboard proves every claim with real data and receipts',
      'The podcast IS the product demo — 5 voices, 12 scenes, Pixar avatars, all produced by the same AI pipeline',
      'AI democratization in practice — solo creator produces broadcast-quality content via 19 providers',
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

/** Resolve voice config for a character, handling aliases */
function resolveVoiceConfig(voice: string) {
  const voiceKey = voice === 'squirrel' ? 'squirrel' : voice === 'allaudin' ? 'allaudin' : voice;
  const config = EP04_VOICES[voiceKey as keyof typeof EP04_VOICES];
  if (!config) return EP04_VOICES.host; // safe fallback
  return config;
}

function buildEP04TemplateMapping(): TemplateMapping {
  // Create one SceneScript PER script line so each voice gets its own ttsConfig.
  // This lets multi-provider-tts route Host→ElevenLabs, Atlas→Azure, Nova→ElevenLabs correctly.
  const allEntries = Object.entries(EP04_SCRIPT_CONTENT);
  const scenes: SceneScript[] = allEntries.map(([key, line], index) => {
    const voiceConfig = resolveVoiceConfig(line.voice);
    const sceneLabel = SCENE_LABELS[line.scene] || PIPELINE_SCENE_LABELS[line.scene] || line.scene;
    const characterLabel = line.voice.charAt(0).toUpperCase() + line.voice.slice(1);

    // Resolve script scene ID → pipeline scene ID via mapping
    const pipelineSceneId = SCRIPT_TO_PIPELINE_MAP[line.scene] || line.scene;

    // Attach visual pipeline steps from the parent scene (only on first line of each scene)
    const isFirstLineOfScene = !allEntries.slice(0, index).some(([, l]) => l.scene === line.scene);
    const scenePipeline = EP04_SCENE_PIPELINES[pipelineSceneId];
    // Filter out TTS steps (handled separately) — keep only visual/audio production steps
    const visualSteps = scenePipeline
      ? scenePipeline.filter(step => step.type !== 'tts').map(step => step as Record<string, unknown>)
      : undefined;

    return {
      sceneId: key, // unique per line (e.g. 'title-welcome', 'atlas-intro-1')
      sceneKey: pipelineSceneId, // groups lines by pipeline scene ID for assembler lookup
      title: `${sceneLabel} — ${characterLabel}`,
      orderIndex: index,
      scriptText: line.text,
      sourceType: 'custom' as const,
      durationSeconds: line.duration_est,
      minDuration: Math.max(3, line.duration_est - 5),
      maxDuration: line.duration_est + 10,
      ttsConfig: {
        provider: voiceConfig.provider,
        voiceId: 'voiceId' in voiceConfig ? voiceConfig.voiceId : undefined,
        speed: 'speed' in voiceConfig ? (voiceConfig.speed as number) : 1.0,
        pitch: 0,
      },
      characterVoice: line.voice,
      // Attach visual pipeline only on the first line of each scene to avoid duplication
      ...(isFirstLineOfScene && visualSteps?.length ? { visualPipeline: visualSteps } : {}),
      approvalStatus: 'approved' as const,
    };
  });

  return {
    templateId: 'cafcd78a-7957-4021-ba8f-c20daba331b2',
    templateName: 'EP04 — Beyond AI Hype',
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
    selectedIntent: 'video', // Maps to cast_content_formats.name = 'video'
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

// ─── SCREEN ASSET ENRICHMENT ─────────────────────────────────────────────────────

/**
 * Enriches a template mapping's scenes with resolved screen asset URLs.
 * Call AFTER createEP04SessionSeed() to attach real storage URLs to visual pipeline steps.
 *
 * This is product-agnostic — pass any productId to resolve from that product's screenshots.
 */
export async function enrichWithScreenAssets(
  templateMapping: TemplateMapping,
  productId: string = 'sprint-tracker'
): Promise<{ mapping: TemplateMapping; resolved: Map<string, ResolvedScreenAsset[]>; stats: { total: number; found: number; missing: string[] } }> {
  // Collect scenes that have visualPipeline metadata
  const scenesWithPipelines = templateMapping.scenes
    .filter(s => s.visualPipeline && s.visualPipeline.length > 0)
    .map(s => ({ sceneKey: s.sceneKey || s.sceneId, visualPipeline: s.visualPipeline! }));

  const resolved = await batchResolveScreenAssets(productId, scenesWithPipelines);

  // Attach resolved URLs back into visual pipeline steps
  const enrichedScenes = templateMapping.scenes.map(scene => {
    const sceneKey = scene.sceneKey || scene.sceneId;
    const assets = resolved.get(sceneKey);
    if (!assets || !scene.visualPipeline) return scene;

    const assetMap = new Map(assets.map(a => [a.screenId, a]));

    const enrichedPipeline = scene.visualPipeline.map(step => {
      if ((step.type === 'screen-capture' || step.type === 'ai-screen-enhance') && Array.isArray(step.screenIds)) {
        const resolvedUrls: Record<string, string> = {};
        for (const sid of step.screenIds as string[]) {
          const asset = assetMap.get(sid);
          if (asset?.exists) resolvedUrls[sid] = asset.publicUrl;
        }
        return { ...step, resolvedUrls };
      }
      return step;
    });

    return { ...scene, visualPipeline: enrichedPipeline };
  });

  // Stats
  const allAssets = [...resolved.values()].flat();
  const missing = allAssets.filter(a => !a.exists).map(a => a.screenId);

  return {
    mapping: { ...templateMapping, scenes: enrichedScenes },
    resolved,
    stats: {
      total: allAssets.length,
      found: allAssets.filter(a => a.exists).length,
      missing,
    },
  };
}

// ─── STATS FOR UI ────────────────────────────────────────────────────────────────

export function getEP04Stats() {
  const totalDuration = getEP04TotalDuration();
  const voiceCounts = { host: 0, atlas: 0, nova: 0, allaudin: 0, squirrel: 0 };
  Object.values(EP04_SCRIPT_CONTENT).forEach(line => {
    if (line.voice in voiceCounts) voiceCounts[line.voice as keyof typeof voiceCounts]++;
  });
  // Count narrator bridge lines
  Object.values(EP04_NARRATOR_BRIDGES).forEach(line => {
    if (line.voice in voiceCounts) voiceCounts[line.voice as keyof typeof voiceCounts]++;
  });

  const pipelineTypes = new Set<string>();
  Object.values(EP04_SCENE_PIPELINES).flat().forEach(step => pipelineTypes.add(step.type));

  // Count storybook elements
  const narratorBridgeCount = Object.keys(EP04_NARRATOR_BRIDGES).length;
  const transitionCount = EP04_STORYBOOK_TRANSITIONS.length;
  const characterInteractionCount = EP04_CHARACTER_INTERACTIONS.length;
  const narratorScrollCount = EP04_NARRATOR_SCROLLS.length;
  const narratorBridgeDuration = Object.values(EP04_NARRATOR_BRIDGES).reduce((sum, l) => sum + l.duration_est, 0);

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
    // Storybook stats
    storybook: {
      narratorBridges: narratorBridgeCount,
      transitions: transitionCount,
      characterInteractions: characterInteractionCount,
      narratorScrolls: narratorScrollCount,
      bookends: 2, // opening + closing
      narratorBridgeDuration,
      leitmotifs: Object.keys(EP04_STORYBOOK_SCORE.leitmotifs).length,
      transitionStingers: Object.keys(EP04_STORYBOOK_SCORE.stingers).length,
      woodlandChorusCreatures: EP04_AVATAR_CONFIG.woodlandChorus.length,
    },
  };
}

// ─── DB-DRIVEN SESSION SEED ──────────────────────────────────────────────────
// Builds a session seed from DB-loaded project data instead of config imports.
// Falls back to the config-based path if DB data is incomplete.

export interface DBProjectData {
  scenes: PersistedScene[];
  scriptLines: PersistedScriptLine[];
  characters: PersistedCharacter[];
  voiceConfigFor: (key: string) => VoiceConfig | null;
}

/**
 * Creates a GenieCastSessionState from DB-loaded project data.
 * Falls back to config-based seed if DB data is insufficient.
 */
export function createEP04SessionSeedFromDB(
  projectData: DBProjectData,
): Partial<GenieCastSessionState> {
  if (!projectData.scenes.length || !projectData.scriptLines.length) {
    // Fallback to config-based seed
    return createEP04SessionSeed();
  }

  // Build template mapping from DB data
  const dbScenes: SceneScript[] = projectData.scriptLines.map((line, index) => {
    const scene = projectData.scenes.find(s => s.id === line.scene_id);
    const sceneKey = scene?.scene_key || line.scene_id;
    const sceneConfig = scene?.scene_config as Record<string, unknown> | null;
    const pipelineSceneId = (sceneConfig?.sceneIdMapping as Record<string, string>)?.pipelineSceneId || sceneKey;
    const characterLabel = line.character_id.charAt(0).toUpperCase() + line.character_id.slice(1);
    const sceneLabel = scene?.title || sceneKey;

    // Get voice config from DB
    const voiceConfig = projectData.voiceConfigFor(line.character_id);
    const provider = voiceConfig?.provider || 'elevenlabs';
    const voiceId = voiceConfig?.voiceId || '';
    const speed = voiceConfig?.speed || 1.0;

    // Pipeline steps from scene_config.pipeline (only on first line of scene)
    const isFirstLine = !projectData.scriptLines.slice(0, index).some(l => l.scene_id === line.scene_id);
    const pipelineSteps = (sceneConfig?.pipeline as { steps?: unknown[] })?.steps;
    const visualSteps = isFirstLine && pipelineSteps?.length
      ? (pipelineSteps as Record<string, unknown>[]).filter(s => (s as { type?: string }).type !== 'tts')
      : undefined;

    return {
      sceneId: line.line_key,
      sceneKey: pipelineSceneId,
      title: `${sceneLabel} — ${characterLabel}`,
      orderIndex: index,
      scriptText: line.dialogue,
      sourceType: 'custom' as const,
      durationSeconds: line.duration_hint ? parseInt(line.duration_hint) || 10 : 10,
      minDuration: Math.max(3, (line.duration_hint ? parseInt(line.duration_hint) || 10 : 10) - 5),
      maxDuration: (line.duration_hint ? parseInt(line.duration_hint) || 10 : 10) + 10,
      ttsConfig: {
        provider,
        voiceId,
        speed,
        pitch: 0,
      },
      characterVoice: line.character_id,
      ...(visualSteps?.length ? { visualPipeline: visualSteps } : {}),
      approvalStatus: 'approved' as const,
    };
  });

  const totalDuration = dbScenes.reduce((sum, s) => sum + s.durationSeconds, 0);

  const dbTemplateMapping: TemplateMapping = {
    templateId: 'cafcd78a-7957-4021-ba8f-c20daba331b2',
    templateName: 'EP04 — Beyond AI Hype',
    scenes: dbScenes,
    totalDuration,
    styleIntent: 'product-hero',
    resolvedProviders: {
      image: 'alibaba-wanx',
      video: 'alibaba-wan2.6',
      tts: 'elevenlabs+azure',
      llm: 'anthropic',
    },
  };

  return {
    selectedProductId: null,
    selectedIntent: 'video',
    detectedRegion: 'en',
    selectedRegion: 'en',
    selectedStyles: ['cinematic', 'pixar-3d', 'disney-2d'],
    selectedTemplate: buildEP04Template(),
    approvedMessaging: buildEP04Messaging(),
    templateMapping: dbTemplateMapping,
    ttsGenerated: false,
    avSyncVerified: false,
    targetRegions: ['global'],
    selectedDialects: ['en-US'],
    approvalItems: [
      {
        id: 'ep04-beyond-ai-hype',
        stage: 'template_selection',
        title: 'Beyond AI Hype — Episode 4',
        description: `${projectData.scenes.length} scenes • ${Math.floor(totalDuration / 60)}:${String(totalDuration % 60).padStart(2, '0')}`,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ep04-messaging',
        stage: 'messaging_generation',
        title: 'EP04 Marketing Messaging',
        description: `${projectData.scriptLines.length} lines — approved`,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ep04-script-mapping',
        stage: 'template_mapping',
        title: 'EP04 Script Mapping (DB)',
        description: `${projectData.scriptLines.length} lines across ${projectData.scenes.length} scenes — from DB`,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    currentStage: 'tts_generation',
    completedStages: ['template_selection', 'messaging_generation', 'script_composition', 'template_mapping'],
  };
}
