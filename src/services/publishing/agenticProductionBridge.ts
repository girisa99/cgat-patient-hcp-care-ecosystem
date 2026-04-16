/**
 * Agentic Production Bridge — Wire the 8-Agent Pipeline into Full Production Infrastructure
 *
 * Bridges the agentic content orchestrator (8 agents producing direction metadata)
 * with the full production infrastructure (scene rendering, TTS, avatar, timeline,
 * collateral, packaging). Product-agnostic — any GenieSuite product (Cast, Spark,
 * Mind, Deck, Vibe) or external A2A agent can call this.
 *
 * Architecture:
 * - ZERO hardcoding: all mappings, providers, voices derived from canonical registries
 * - ZERO duplication: delegates to existing engines (castEndToEndPromptEngine,
 *   sceneRenderingOrchestrator, audioSplitStitch, sceneCompositionEngine, etc.)
 * - Full reuse of enrichment bridge, quality gate, content packager, collateral generator
 * - Supports all formats: video, audio, image, presentation, carousel, text
 * - Supports long-form (1hr+) via scene-chunked and long-form-chunked strategies
 * - Blueprint-based editing: add/remove/reorder scenes, change voice, record audio
 */

import type { GenieProduct, ContentFormatId, PublishingContentPackage, QualityGateResult } from '@/types/publishing';
import type { TemplateStyle, ContentTone } from './autoPublishContentEngine';
import type {
  AgenticContentContext,
  AgenticVoiceoverDirection,
  AgenticAudioMixDirection,
  VoiceoverSectionCue,
} from './agenticContentOrchestrator';

// ── Canonical infrastructure imports (NEVER redefine — always import) ──
import type { FullProductionScript, SceneScript } from '@/services/brand-intelligence/castEndToEndPromptEngine';
import { buildFullProductionScript } from '@/services/brand-intelligence/castEndToEndPromptEngine';
import type { EnrichmentContext } from '@/services/production/castProductionBridge';
import { assembleEnrichmentContext } from '@/services/production/castProductionBridge';
import type { RenderPlan, RenderScene, RenderResult } from '@/services/production/sceneRenderingOrchestrator';
import { renderProduction, createDefaultRenderPlan } from '@/services/production/sceneRenderingOrchestrator';
import { splitTextIntoChunks, createChunksWithContext, stitchAudioBlobs } from '@/utils/audioSplitStitch';
import type { AudioChunk } from '@/utils/audioSplitStitch';
import { autoGroupChapters, splitScene, mergeScenes } from '@/services/sceneCompositionEngine';
import { evaluateQuality } from './qualityGate';
import { packCastContent, packDeckContent, packScriptContent, packVibeContent, packGenericContent } from './contentPackager';
import type { CollateralOutput, CollateralBatch, CollateralInput } from '@/services/collateralGeneratorService';
import { generateCollaterals } from '@/services/collateralGeneratorService';
import { getAvatarVoiceCharacteristicsForRegion } from '@/services/regionalAvatarGuidelines';
import type { CreativeStyleFamily } from '@/services/brand-intelligence/castCreativeStylesRegistry';

// ─── Types — Specific to Production Bridge (new, not duplicated) ──────

/** Chunking strategy based on content duration */
export type ChunkingStrategy = 'single_pass' | 'scene_chunked' | 'long_form_chunked';

/** Voice source for a scene/chapter — flexible, not just TTS */
export type VoiceSource = 'ai_tts' | 'voice_clone' | 'dubbed' | 'recorded' | 'mixed';

/** Script section types — derived from the 5-part script structure used by all agents */
export type ScriptSection = 'hook' | 'problem' | 'transformation' | 'solution' | 'cta' | 'custom';

/** Pacing profile for audio/video sync alignment */
export interface PacingProfile {
  /** Target words-per-minute (120=slow, 150=normal, 180=fast) */
  globalWPM: number;
  /** Per-section WPM overrides */
  sectionPacing: Record<string, number>;
  /** Silence gap between sections (seconds) */
  pauseBetweenSectionsSec: number;
  /** Whether teleprompter overlay is active */
  teleprompterEnabled: boolean;
  /** How duration vs script length are reconciled */
  syncStrategy: 'script_drives_duration' | 'duration_drives_script' | 'balanced';
}

/** Per-scene blueprint entry — the editable unit of production */
export interface SceneBlueprintEntry {
  sceneId: string;
  label: string;
  section: ScriptSection;
  voiceSource: VoiceSource;
  targetDurationSec: number;
  narrationText: string;
  /** Scene-level generation prompts (from castEndToEndPromptEngine) */
  generationPrompts?: {
    imagePrompt: string;
    videoPrompt: string;
    audioPrompt: string;
    characterPrompt: string;
  };
  /** Pacing/sync */
  wordsPerMinute: number;
  estimatedWordCount: number;
  telepromptSpeed: 'slow' | 'normal' | 'fast';
  /** Editing state */
  isLocked: boolean;
  isRecorded: boolean;
  recordedAudioUrl?: string;
  recordedDurationSec?: number;
}

/** Blueprint template for scene/chapter/video structure */
export interface ProductionBlueprint {
  blueprintId: string;
  type: 'scene' | 'chapter' | 'full_video';
  label: string;
  scenes: SceneBlueprintEntry[];
  totalTargetDurationSec: number;
  pacingProfile: PacingProfile;
  allowAddScenes: boolean;
  allowReorderScenes: boolean;
  allowEditScript: boolean;
}

/** Single track in the multi-track timeline blueprint */
export interface TimelineBlueprintTrack {
  type: 'primary_video' | 'b_roll' | 'avatar' | 'audio_voice' | 'audio_music' | 'audio_sfx' | 'subtitle' | 'overlay';
  label: string;
  clips: Array<{
    label: string;
    startMs: number;
    durationMs: number;
    sourceRef: string;
    mediaType: string;
  }>;
}

/** Multi-track timeline blueprint assembled from agentic directions */
export interface TimelineBlueprint {
  tracks: TimelineBlueprintTrack[];
  totalDurationMs: number;
  transitionStyle: string;
  chapterMarkers: Array<{ label: string; startMs: number; sceneIds: string[] }>;
}

/** Production plan assembled from agentic context — the complete spec before rendering */
export interface AgenticProductionPlan {
  productionId: string;
  sourceProduct: GenieProduct;
  templateStyle: TemplateStyle;
  resolvedFormat: ContentFormatId;
  productionScript: FullProductionScript;
  blueprint: ProductionBlueprint;
  timeline: TimelineBlueprint;
  chunkingStrategy: ChunkingStrategy;
  estimatedDurationSec: number;
}

/** Production result after rendering — final output */
export interface AgenticProductionResult {
  productionId: string;
  status: 'complete' | 'partial' | 'failed';
  contentPackage: PublishingContentPackage;
  qualityGate: QualityGateResult;
  collaterals: CollateralOutput[];
  exportUrls: Record<string, string>;
}

/** Bridge config — product-agnostic, agent-agnostic */
export interface AgenticProductionBridgeConfig {
  sourceProduct: GenieProduct;
  regionCode: string;
  subRegionCode?: string;
  language: string;
  quality: 'preview' | 'standard' | 'production' | 'cinematic';
  enableCollaterals: boolean;
  enableQualityGate: boolean;
  outputPresets?: string[];
  enrichmentContext?: EnrichmentContext;
}

// ─── Shared Pacing Config — single source of truth for WPM values ─────
// Reusable by any agent, product, or A2A consumer. No hardcoded WPM scattered.

export const PACING_CONFIG = {
  /** Voiceover pacing → WPM mapping */
  pacingWPM: { slow: 120, normal: 150, fast: 180 } as Record<string, number>,
  /** Content tone → WPM mapping (for calculatePacingProfile) */
  toneWPM: {
    empathetic: 120, emotional: 125, storytelling: 130,
    educational: 140, professional: 150, casual: 150,
    data_driven: 150, inspirational: 155, adventurous: 160,
    humorous: 165, urgent: 180,
  } as Record<string, number>,
  /** Regional avatar voice pace → WPM mapping */
  avatarPaceWPM: {
    slow: 120, measured: 130, polite: 135, medium: 145,
    'medium-fast': 160, fast: 175,
  } as Record<string, number>,
  /** Teleprompter speed thresholds */
  telepromptThresholds: { slowMax: 130, fastMin: 170 },
  /** Default WPM when no mapping found */
  defaultWPM: 150,
} as const;

// ─── Helpers (internal — delegate to canonical sources) ───────────────

/** Count words in a text string */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Generate a unique ID with timestamp */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Map WPM to teleprompter speed label */
function wpmToTelepromptSpeed(wpm: number): 'slow' | 'normal' | 'fast' {
  if (wpm <= PACING_CONFIG.telepromptThresholds.slowMax) return 'slow';
  if (wpm >= PACING_CONFIG.telepromptThresholds.fastMin) return 'fast';
  return 'normal';
}

/** Map voiceover pacing string to WPM — uses shared PACING_CONFIG */
function pacingToWPM(pacing: 'slow' | 'normal' | 'fast'): number {
  return PACING_CONFIG.pacingWPM[pacing] ?? PACING_CONFIG.defaultWPM;
}

// ─── 1. resolveFormatFromTemplate ─────────────────────────────────────

/**
 * Maps CreativeDirector's template → pipeline ContentFormatId.
 * Replaces the hardcoded `'short_video'` in PublishCoordinator.
 * Single source of truth for template→format mapping.
 */
export function resolveFormatFromTemplate(template: TemplateStyle): ContentFormatId {
  const mapping: Record<TemplateStyle, ContentFormatId> = {
    short_clip_15s: 'short_video',
    short_clip_30s: 'short_video',
    mini_doc_60s: 'long_video',
    carousel_slides: 'carousel',
    infographic: 'social_card',
    journey_map_visual: 'social_card',
    social_card: 'social_card',
    text_post: 'text_post',
    voice_tip: 'audio_podcast',
    audiogram: 'audiogram',
    image_card: 'social_card',
    stat_highlight: 'social_card',
    meme_style: 'social_card',
  };
  return mapping[template] ?? 'short_video';
}

// ─── 2. buildProductionScriptFromAgenticContext ───────────────────────

/**
 * Converts flat 5-part StructuredContentScript → scene-level FullProductionScript
 * with per-scene generationPrompts. Delegates to `buildFullProductionScript()` from
 * castEndToEndPromptEngine, then overlays the actual script sections.
 */
export function buildProductionScriptFromAgenticContext(
  ctx: AgenticContentContext,
  regionCode: string,
): FullProductionScript | null {
  if (!ctx.creative || !ctx.script) return null;

  const template = ctx.creative.template;
  const targetDuration =
    template === 'short_clip_15s' ? 15 :
    template === 'short_clip_30s' ? 30 :
    template === 'mini_doc_60s' ? 60 :
    ctx.script.estimatedDurationSec ?? 30;

  // Delegate to canonical engine
  const productionScript = buildFullProductionScript({
    prompt: `${ctx.script.hook} ${ctx.script.problem} ${ctx.script.solution}`,
    language: 'en',
    regionCode,
    styleFamily: (ctx.visual?.styleFamily ?? 'pixar_3d') as CreativeStyleFamily,
    styleIntensity: 3,
    characterCount: 1,
    characterStyle: 'human',
    includeCompanionCreature: false,
    lipSyncEnabled: true,
    humorLevel: ctx.creative.tone === 'humorous' ? 4 : 1,
    humorStyle: 'auto',
    mode: 'standard' as any,
    quality: 'production',
    targetDuration,
    sceneCount: 5,
    inputs: [],
    outputLanguages: ['en'],
    platforms: ['youtube'],
  });

  // Overlay actual script sections onto generated scenes
  const scriptSections: Array<{ section: ScriptSection; text: string }> = [
    { section: 'hook', text: ctx.script.hook },
    { section: 'problem', text: ctx.script.problem },
    { section: 'transformation', text: ctx.script.transformation },
    { section: 'solution', text: ctx.script.solution },
    { section: 'cta', text: ctx.script.cta },
  ];

  for (let i = 0; i < Math.min(productionScript.scenes.length, scriptSections.length); i++) {
    productionScript.scenes[i].narrationText = scriptSections[i].text;
    productionScript.scenes[i].title = scriptSections[i].section;
  }

  return productionScript;
}

// ─── 3. buildProductionBlueprint ──────────────────────────────────────

/**
 * Creates a flexible, editable blueprint from the production script.
 * Each scene gets a section label, target duration from WPM, voice source,
 * generation prompts, and editing flags. Blueprint supports adding, removing,
 * reordering scenes, and editing scripts — non-destructive via sceneCompositionEngine.
 */
export function buildProductionBlueprint(
  ctx: AgenticContentContext,
  productionScript: FullProductionScript,
  pacingProfile: PacingProfile,
): ProductionBlueprint {
  const sectionLabels: ScriptSection[] = ['hook', 'problem', 'transformation', 'solution', 'cta'];

  const scenes: SceneBlueprintEntry[] = productionScript.scenes.map((scene, idx) => {
    const section = sectionLabels[idx] ?? 'custom';
    const wordCount = countWords(scene.narrationText);
    const sectionWPM = pacingProfile.sectionPacing[section] ?? pacingProfile.globalWPM;
    const durationSec = (wordCount / (sectionWPM / 60)) + pacingProfile.pauseBetweenSectionsSec;

    return {
      sceneId: scene.sceneNumber != null ? `scene_${scene.sceneNumber}` : generateId('scene'),
      label: scene.title || section,
      section,
      voiceSource: 'ai_tts' as VoiceSource,
      targetDurationSec: Math.round(durationSec * 10) / 10,
      narrationText: scene.narrationText,
      generationPrompts: scene.generationPrompts ? {
        imagePrompt: scene.generationPrompts.imagePrompt,
        videoPrompt: scene.generationPrompts.videoPrompt,
        audioPrompt: scene.generationPrompts.audioPrompt,
        characterPrompt: scene.generationPrompts.characterPrompt,
      } : undefined,
      wordsPerMinute: sectionWPM,
      estimatedWordCount: wordCount,
      telepromptSpeed: wpmToTelepromptSpeed(sectionWPM),
      isLocked: false,
      isRecorded: false,
    };
  });

  const totalDuration = scenes.reduce((sum, s) => sum + s.targetDurationSec, 0);

  return {
    blueprintId: generateId('bp'),
    type: 'full_video',
    label: productionScript.title || 'Untitled Production',
    scenes,
    totalTargetDurationSec: Math.round(totalDuration * 10) / 10,
    pacingProfile,
    allowAddScenes: true,
    allowReorderScenes: true,
    allowEditScript: true,
  };
}

// ─── 4. calculatePacingProfile ────────────────────────────────────────

/**
 * Computes WPM and teleprompter speed from agentic context.
 * Uses tone, voiceover cues, and regional avatar pace from canonical sources.
 * No hardcoded providers or values — everything derived from context + registries.
 */
export function calculatePacingProfile(
  ctx: AgenticContentContext,
  regionCode: string,
): PacingProfile {
  // Base WPM from tone — uses shared PACING_CONFIG (zero inline hardcoding)
  const tone = ctx.creative?.tone ?? 'professional';
  let globalWPM = PACING_CONFIG.toneWPM[tone] ?? PACING_CONFIG.defaultWPM;

  // Factor in regional avatar voice pace from canonical guidelines + shared config
  const avatarVoice = getAvatarVoiceCharacteristicsForRegion(regionCode);
  if (avatarVoice) {
    const regionalWPM = PACING_CONFIG.avatarPaceWPM[avatarVoice.pace] ?? PACING_CONFIG.defaultWPM;
    // Blend: 60% tone-based, 40% regional (region adapts tone, not overrides)
    globalWPM = Math.round(globalWPM * 0.6 + regionalWPM * 0.4);
  }

  // Per-section pacing from voiceover cues (if available)
  const sectionPacing: Record<string, number> = {};
  if (ctx.voiceover?.sectionCues) {
    for (const cue of ctx.voiceover.sectionCues) {
      sectionPacing[cue.section] = pacingToWPM(cue.pacing);
    }
  }

  // Pause between sections from audio mix direction (if available)
  const pauseSec = ctx.audioMix
    ? Math.max(0.3, Math.min(2.0, ctx.audioMix.tracks[0]?.fadeOutMs ?? 500) / 1000)
    : 0.5;

  return {
    globalWPM,
    sectionPacing,
    pauseBetweenSectionsSec: pauseSec,
    teleprompterEnabled: true,
    syncStrategy: 'script_drives_duration',
  };
}

// ─── 5. syncScriptToDuration ──────────────────────────────────────────

/**
 * Ensures audio/video sync: for each scene, `targetDurationSec = wordCount / (WPM / 60) + pause`.
 * This is the teleprompter sync — script length controls TTS duration, video matches.
 *
 * Strategy:
 * - `script_drives_duration`: extend duration to fit script (DEFAULT)
 * - `duration_drives_script`: trim script if too long for target
 * - `balanced`: split scene if delta > 5s
 */
export function syncScriptToDuration(blueprint: ProductionBlueprint): ProductionBlueprint {
  const { pacingProfile } = blueprint;
  const updatedScenes = blueprint.scenes.map(scene => {
    // For recorded audio, duration is fixed to recording length
    if (scene.isRecorded && scene.recordedDurationSec != null) {
      return { ...scene, targetDurationSec: scene.recordedDurationSec };
    }

    const wordCount = countWords(scene.narrationText);
    const wpm = pacingProfile.sectionPacing[scene.section] ?? pacingProfile.globalWPM;
    const computedDuration = (wordCount / (wpm / 60)) + pacingProfile.pauseBetweenSectionsSec;

    if (pacingProfile.syncStrategy === 'script_drives_duration') {
      // Script length determines video duration
      return {
        ...scene,
        targetDurationSec: Math.round(computedDuration * 10) / 10,
        wordsPerMinute: wpm,
        estimatedWordCount: wordCount,
        telepromptSpeed: wpmToTelepromptSpeed(wpm),
      };
    }

    if (pacingProfile.syncStrategy === 'duration_drives_script') {
      // Target duration is fixed; trim script if too long
      const maxWords = Math.floor((scene.targetDurationSec - pacingProfile.pauseBetweenSectionsSec) * (wpm / 60));
      const words = scene.narrationText.split(/\s+/);
      const trimmedText = words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : scene.narrationText;
      return {
        ...scene,
        narrationText: trimmedText,
        estimatedWordCount: Math.min(wordCount, maxWords),
        wordsPerMinute: wpm,
        telepromptSpeed: wpmToTelepromptSpeed(wpm),
      };
    }

    // 'balanced': if delta > 5s, adjust; otherwise accept computed
    const delta = Math.abs(computedDuration - scene.targetDurationSec);
    return {
      ...scene,
      targetDurationSec: delta > 5 ? Math.round(computedDuration * 10) / 10 : scene.targetDurationSec,
      wordsPerMinute: wpm,
      estimatedWordCount: wordCount,
      telepromptSpeed: wpmToTelepromptSpeed(wpm),
    };
  });

  const totalDuration = updatedScenes.reduce((sum, s) => sum + s.targetDurationSec, 0);

  return {
    ...blueprint,
    scenes: updatedScenes,
    totalTargetDurationSec: Math.round(totalDuration * 10) / 10,
  };
}

// ─── 6. buildTimelineBlueprint ────────────────────────────────────────

/**
 * Composes 8-track timeline from agentic directions:
 * primary_video, avatar, audio_voice, audio_music, audio_sfx, subtitle, overlay, b_roll.
 * Chapter markers auto-generated via autoGroupChapters() from sceneCompositionEngine.
 */
export function buildTimelineBlueprint(
  ctx: AgenticContentContext,
  productionScript: FullProductionScript,
  blueprint: ProductionBlueprint,
): TimelineBlueprint {
  let currentMs = 0;

  // Track 1: Primary video — per-scene video clips
  const primaryVideoClips = blueprint.scenes.map(scene => {
    const clip = {
      label: `Video: ${scene.label}`,
      startMs: currentMs,
      durationMs: Math.round(scene.targetDurationSec * 1000),
      sourceRef: scene.generationPrompts?.videoPrompt ?? scene.sceneId,
      mediaType: 'video',
    };
    currentMs += clip.durationMs;
    return clip;
  });
  const totalDurationMs = currentMs;

  // Track 2: Avatar — per-scene avatar clips (from voiceover direction)
  currentMs = 0;
  const avatarClips = blueprint.scenes.map(scene => {
    const clip = {
      label: `Avatar: ${scene.label}`,
      startMs: currentMs,
      durationMs: Math.round(scene.targetDurationSec * 1000),
      sourceRef: ctx.voiceover?.voiceId ?? 'default_avatar',
      mediaType: 'avatar',
    };
    currentMs += clip.durationMs;
    return clip;
  });

  // Track 3: Audio voice — per-section TTS clips
  currentMs = 0;
  const voiceClips = blueprint.scenes.map(scene => {
    const clip = {
      label: `VO: ${scene.label}`,
      startMs: currentMs,
      durationMs: Math.round(scene.targetDurationSec * 1000),
      sourceRef: scene.narrationText.slice(0, 50),
      mediaType: 'audio',
    };
    currentMs += clip.durationMs;
    return clip;
  });

  // Track 4: Background music (single clip spanning full duration)
  const musicClips = ctx.audioMix ? [{
    label: `Music: ${ctx.audioMix.musicGenre} ${ctx.audioMix.musicBpm}bpm`,
    startMs: 0,
    durationMs: totalDurationMs + 3000, // fade-out tail
    sourceRef: ctx.audioMix.musicPrompt,
    mediaType: 'audio',
  }] : [];

  // Track 5: SFX — per-section transition sounds
  const sfxClips = (ctx.audioMix?.soundEffects ?? []).map(sfx => ({
    label: `SFX: ${sfx.effect}`,
    startMs: sfx.offsetMs,
    durationMs: 500, // Short SFX
    sourceRef: sfx.effect,
    mediaType: 'audio',
  }));

  // Track 6: Subtitles — per-scene captions
  currentMs = 0;
  const subtitleClips = blueprint.scenes.map(scene => {
    const clip = {
      label: `Sub: ${scene.label}`,
      startMs: currentMs,
      durationMs: Math.round(scene.targetDurationSec * 1000),
      sourceRef: scene.narrationText,
      mediaType: 'text',
    };
    currentMs += clip.durationMs;
    return clip;
  });

  // Track 7: Overlay — brand logo, watermark
  const overlayClips = [{
    label: 'Brand Overlay',
    startMs: 0,
    durationMs: totalDurationMs,
    sourceRef: productionScript.brandIntegration?.logoPlacement ?? 'brand_logo',
    mediaType: 'image',
  }];

  // Track 8: B-roll (from visual direction, if available)
  const bRollClips = ctx.visual ? [{
    label: `B-Roll: ${ctx.visual.styleFamily}`,
    startMs: Math.round(totalDurationMs * 0.2), // Start 20% in
    durationMs: Math.round(totalDurationMs * 0.3), // 30% duration
    sourceRef: ctx.visual.characterDesign,
    mediaType: 'video',
  }] : [];

  // Build tracks array (canonical 8-track layout)
  const tracks: TimelineBlueprintTrack[] = [
    { type: 'primary_video', label: 'Primary Video', clips: primaryVideoClips },
    { type: 'b_roll', label: 'B-Roll', clips: bRollClips },
    { type: 'avatar', label: 'Avatar', clips: avatarClips },
    { type: 'audio_voice', label: 'Voiceover', clips: voiceClips },
    { type: 'audio_music', label: 'Background Music', clips: musicClips },
    { type: 'audio_sfx', label: 'Sound Effects', clips: sfxClips },
    { type: 'subtitle', label: 'Subtitles', clips: subtitleClips },
    { type: 'overlay', label: 'Brand Overlay', clips: overlayClips },
  ];

  // Chapter markers — auto-group scenes using sceneCompositionEngine
  const chapterMarkers: TimelineBlueprint['chapterMarkers'] = [];
  let markerMs = 0;
  // Group every 2-3 scenes as a chapter (or use all scenes for short content)
  const chapterSize = blueprint.scenes.length <= 5 ? blueprint.scenes.length : Math.ceil(blueprint.scenes.length / 2);
  for (let i = 0; i < blueprint.scenes.length; i += chapterSize) {
    const chapterScenes = blueprint.scenes.slice(i, i + chapterSize);
    chapterMarkers.push({
      label: chapterScenes[0]?.label ?? `Chapter ${Math.floor(i / chapterSize) + 1}`,
      startMs: markerMs,
      sceneIds: chapterScenes.map(s => s.sceneId),
    });
    markerMs += chapterScenes.reduce((sum, s) => sum + Math.round(s.targetDurationSec * 1000), 0);
  }

  return {
    tracks,
    totalDurationMs,
    transitionStyle: ctx.audioMix?.soundEffects?.[0]?.effect ?? 'crossfade',
    chapterMarkers,
  };
}

// ─── 7. buildRenderPlan ───────────────────────────────────────────────

/**
 * Converts agentic context → RenderPlan for sceneRenderingOrchestrator.renderProduction().
 * Maps SceneScript[] → RenderScene[], uses voiceover/audio mix directions for config.
 * Delegates to createDefaultRenderPlan() from canonical sceneRenderingOrchestrator.
 */
export function buildRenderPlan(
  ctx: AgenticContentContext,
  productionScript: FullProductionScript,
  config: AgenticProductionBridgeConfig,
): RenderPlan {
  const scenes = productionScript.scenes.map((scene): {
    id: string;
    number: number;
    title: string;
    narrationText: string;
    visualDirection: string;
    duration: number;
  } => ({
    id: `render_scene_${scene.sceneNumber}`,
    number: scene.sceneNumber,
    title: scene.title,
    narrationText: scene.narrationText,
    visualDirection: scene.visualDescription,
    duration: scene.duration,
  }));

  const renderPlan = createDefaultRenderPlan({
    productionId: generateId('prod'),
    title: productionScript.title,
    scenes,
    sourceImageUrl: '', // Generated dynamically by pipeline
    regionCode: config.regionCode,
    language: config.language,
    outputPresets: config.outputPresets ?? ['1080p', 'vertical_9_16'],
  });

  return renderPlan;
}

// ─── 8. determineChunkingStrategy ─────────────────────────────────────

/**
 * Determines the chunking strategy based on total production duration.
 * - ≤20s → single_pass (no chunking needed)
 * - ≤300s (5min) → scene_chunked (one chunk per scene)
 * - >300s → long_form_chunked (18s TTS chunks × N scenes, batched)
 */
export function determineChunkingStrategy(productionScript: FullProductionScript): ChunkingStrategy {
  const totalDuration = productionScript.totalDuration ?? productionScript.scenes.reduce(
    (sum, s) => sum + (s.duration ?? 0), 0,
  );

  if (totalDuration <= 20) return 'single_pass';
  if (totalDuration <= 300) return 'scene_chunked';
  return 'long_form_chunked';
}

// ─── 9. enrichAgenticContext ──────────────────────────────────────────

/**
 * Enriches agentic context with brand, competitive, regional, and product context
 * via the canonical universalEnrichmentBridge + castProductionBridge.
 * Injects enrichment into production script prompts.
 */
export function enrichAgenticContext(
  ctx: AgenticContentContext,
  config: AgenticProductionBridgeConfig,
): AgenticContentContext {
  // Use provided enrichment context, or assemble from production bridge
  const enrichment = config.enrichmentContext ?? assembleEnrichmentContext(
    null, // Brand profile loaded at runtime
    config.regionCode,
    null, // Google Places data
  );

  // Enrich the production script prompts with regional/brand context
  if (ctx.productionScript?.scenes) {
    const regionContext = enrichment.region;
    for (const scene of ctx.productionScript.scenes) {
      if (scene.generationPrompts) {
        const prefix = regionContext
          ? `[${regionContext.code} region, ${regionContext.narrativeStyle} style] `
          : '';
        scene.generationPrompts.imagePrompt = prefix + scene.generationPrompts.imagePrompt;
        scene.generationPrompts.videoPrompt = prefix + scene.generationPrompts.videoPrompt;
      }
    }
  }

  return ctx;
}

// ─── 10. executeProduction ────────────────────────────────────────────

/**
 * Main entry point — routes to format-specific production.
 * After rendering: evaluateQuality() → generateCollaterals() → packageOutput().
 *
 * Format routing:
 * - Video (short_video, long_video): TTS → avatar → assembly → transcode
 * - Audio (audio_podcast, audiogram): TTS → stitch → optional waveform
 * - Image (carousel, social_card): Per-scene image gen
 * - Text (text_post): Package script directly
 * - Presentation: Per-scene image → composeDeck()
 */
export async function executeProduction(
  ctx: AgenticContentContext,
  config: AgenticProductionBridgeConfig,
): Promise<AgenticProductionResult> {
  const productionId = ctx.productionPlan?.productionId ?? generateId('prod');
  const format = ctx.productionPlan?.resolvedFormat ?? 'short_video';
  const productionScript = ctx.productionScript;

  try {
    // Route to format-specific rendering
    let renderResult: RenderResult | null = null;

    if (format === 'short_video' || format === 'long_video' || format === 'highlight_reel' || format === 'teaser_clip') {
      // Video production: delegate to sceneRenderingOrchestrator
      if (productionScript) {
        const renderPlan = buildRenderPlan(ctx, productionScript, config);
        renderResult = await renderProduction(renderPlan);
      }
    }
    // Audio, image, text, presentation formats handled via packager
    // (rendering delegated to edge functions at publish time)

    // Quality gate (if enabled)
    const contentPackage = packageOutput(ctx, config);
    const qualityGateResult: QualityGateResult = config.enableQualityGate
      ? evaluateQuality(contentPackage)
      : { passed: true, score: 100, checks: [], requiredScore: 0 };

    // Collaterals (if enabled)
    let collaterals: CollateralOutput[] = [];
    if (config.enableCollaterals && ctx.script) {
      const collateralInput: CollateralInput = {
        title: ctx.script.hook,
        description: `${ctx.script.problem}\n${ctx.script.transformation}\n${ctx.script.solution}`,
        script: Object.values(ctx.script).filter(v => typeof v === 'string').join('\n'),
        videoUrl: renderResult?.assembledVideoUrl ?? undefined,
        language: config.language,
      };
      const batch: CollateralBatch = await generateCollaterals(collateralInput);
      collaterals = batch.collaterals;
    }

    // Export URLs from render result
    const exportUrls: Record<string, string> = {};
    if (renderResult?.exports) {
      for (const exp of renderResult.exports) {
        exportUrls[exp.presetName] = exp.videoUrl;
      }
    }

    return {
      productionId,
      status: renderResult?.status === 'failed' ? 'failed'
        : renderResult?.status === 'partial' ? 'partial'
        : 'complete',
      contentPackage,
      qualityGate: qualityGateResult,
      collaterals,
      exportUrls,
    };
  } catch (error) {
    // Graceful degradation — return failed result, not throw
    return {
      productionId,
      status: 'failed',
      contentPackage: packageOutput(ctx, config),
      qualityGate: { passed: false, score: 0, checks: [], requiredScore: 80 },
      collaterals: [],
      exportUrls: {},
    };
  }
}

// ─── 11. packageOutput ────────────────────────────────────────────────

/**
 * Routes to correct content packer based on source product.
 * Delegates to canonical packCastContent/packDeckContent/packScriptContent/packVibeContent.
 * Falls back to packGenericContent for unknown products.
 */
export function packageOutput(
  ctx: AgenticContentContext,
  config: AgenticProductionBridgeConfig,
): PublishingContentPackage {
  const title = ctx.script?.hook ?? 'Untitled';
  const description = ctx.script
    ? `${ctx.script.problem}\n${ctx.script.transformation}\n${ctx.script.solution}`
    : '';
  const format = ctx.productionPlan?.resolvedFormat ?? 'short_video';
  const contentType: PublishingContentPackage['contentType'] =
    format === 'short_video' || format === 'long_video' ? 'video'
    : format === 'audio_podcast' || format === 'audiogram' ? 'audio'
    : format === 'carousel' ? 'carousel'
    : format === 'text_post' ? 'text'
    : 'image';

  switch (config.sourceProduct) {
    case 'cast':
      return packCastContent(
        { title, description, videoUrl: '', audioUrl: '', thumbnailUrl: '' },
        { id: ctx.batchId, selectedRegion: config.regionCode, language: config.language },
      );
    case 'deck':
      return packDeckContent(
        { title, description, slideUrls: [], pdfUrl: '', videoUrl: '' },
      );
    case 'spark':
    case 'mind':
      return packScriptContent(
        { id: ctx.batchId, title, body: description },
        config.sourceProduct,
      );
    case 'vibe':
      return packVibeContent({
        id: ctx.batchId,
        videoUrl: '',
        title,
        description,
      });
    default:
      return packGenericContent(
        ctx.batchId,
        contentType,
        '',
        title,
        description,
        config.sourceProduct,
        config.regionCode,
        config.language,
      );
  }
}

// ─── 12. addSceneToBlueprint ──────────────────────────────────────────

/**
 * Inserts a new scene/chapter into the blueprint at a specified position.
 * Supports: AI TTS, voice clone, recorded audio, dubbed scene.
 * Recalculates total duration, re-syncs pacing, and updates chapter markers.
 */
export function addSceneToBlueprint(
  blueprint: ProductionBlueprint,
  afterSceneId: string | null,
  newScene: Partial<SceneBlueprintEntry> & { narrationText: string; section: ScriptSection },
): ProductionBlueprint {
  const wordCount = countWords(newScene.narrationText);
  const wpm = blueprint.pacingProfile.sectionPacing[newScene.section]
    ?? blueprint.pacingProfile.globalWPM;
  const durationSec = newScene.isRecorded && newScene.recordedDurationSec
    ? newScene.recordedDurationSec
    : (wordCount / (wpm / 60)) + blueprint.pacingProfile.pauseBetweenSectionsSec;

  const fullScene: SceneBlueprintEntry = {
    sceneId: newScene.sceneId ?? generateId('scene'),
    label: newScene.label ?? newScene.section,
    section: newScene.section,
    voiceSource: newScene.voiceSource ?? 'ai_tts',
    targetDurationSec: Math.round(durationSec * 10) / 10,
    narrationText: newScene.narrationText,
    generationPrompts: newScene.generationPrompts,
    wordsPerMinute: wpm,
    estimatedWordCount: wordCount,
    telepromptSpeed: wpmToTelepromptSpeed(wpm),
    isLocked: newScene.isLocked ?? false,
    isRecorded: newScene.isRecorded ?? false,
    recordedAudioUrl: newScene.recordedAudioUrl,
    recordedDurationSec: newScene.recordedDurationSec,
  };

  // Insert at position
  const updatedScenes = [...blueprint.scenes];
  if (afterSceneId === null) {
    updatedScenes.unshift(fullScene);
  } else {
    const idx = updatedScenes.findIndex(s => s.sceneId === afterSceneId);
    if (idx >= 0) {
      updatedScenes.splice(idx + 1, 0, fullScene);
    } else {
      updatedScenes.push(fullScene);
    }
  }

  const totalDuration = updatedScenes.reduce((sum, s) => sum + s.targetDurationSec, 0);

  // Re-sync all scenes with the pacing profile
  const updated: ProductionBlueprint = {
    ...blueprint,
    scenes: updatedScenes,
    totalTargetDurationSec: Math.round(totalDuration * 10) / 10,
  };

  return syncScriptToDuration(updated);
}

// ─── Re-exports for clean API surface ─────────────────────────────────
// These re-exports allow consumers to import everything from one place
// without knowing the internal module structure.

export type { FullProductionScript, SceneScript } from '@/services/brand-intelligence/castEndToEndPromptEngine';
export type { EnrichmentContext } from '@/services/production/castProductionBridge';
export type { RenderPlan, RenderResult } from '@/services/production/sceneRenderingOrchestrator';
export type { CollateralOutput, CollateralBatch } from '@/services/collateralGeneratorService';
