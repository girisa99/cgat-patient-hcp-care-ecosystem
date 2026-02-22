/**
 * Scene Composition Engine — Unlimited Creative Freedom
 *
 * Core design principle: USER'S CHOICE. We RECOMMEND, never RESTRICT.
 * Every scene can have its own style, layers, B-roll, output format, and pipeline chain.
 * Users can mix cinematic + 3D + avatar + slides in a single project.
 *
 * Key capabilities:
 * - Scene-level operations: add, remove, reorder, duplicate, split, merge
 * - Multi-layer composition: stack video + avatar + B-roll + text overlays
 * - Per-scene style variants: generate multiple looks, user picks
 * - B-roll integration: stock footage, AI-generated, user uploaded
 * - Multi-output: one project → video + podcast + slides + shorts + audiogram
 * - Scene versioning: undo/redo at scene level, never lose work
 * - Selective regeneration: change voice without touching video (and vice versa)
 * - Timeline operations: trim, extend, split at timestamp
 * - Clip extraction: mark scenes as standalone clips for social
 * - Thumbnail generation: per-scene or per-project
 * - AI recommendations: contextual suggestions that user can accept or dismiss
 *
 * Integrates with:
 * - Pipeline Orchestrator (combination chains C1-C20)
 * - Audio Mixer (6 audio operations)
 * - Video Assembly Service (chapter stitching)
 * - Regional Transcreation Service (cultural adaptation)
 * - Google Places Enrichment (real business data)
 *
 * @see src/components/genie-admin/composition-studio/types.ts — type definitions
 * @see src/services/pipelineOrchestrator.ts — combination chains
 * @see src/hooks/useAudioMixer.ts — audio processing
 * @see src/services/video-assembly/VideoAssemblyService.ts — video assembly
 */

import type {
  CompositionScene,
  CompositionProject,
  CompositionChapter,
  SceneStyle,
  SceneBRoll,
  SceneVisualLayer,
  SceneOutputFormat,
  SceneStyleVariant,
  SceneRecommendation,
  MultiOutputConfig,
  CompositionElementType,
  ChapterVisual,
  ChapterVoiceover,
  ChapterBackgroundMusic,
  DataSource,
  ContentVerification,
  CrossFormatConversion,
  CrossFormatConversionType,
  SceneDataVisualization,
  ChartType,
  LanguageQualityCheck,
  CitationConfig,
  SceneEditState,
} from '@/components/genie-admin/composition-studio/types';

// ─── Scene Operations ────────────────────────────────────────────────────────

/** Create a new empty scene with sensible defaults */
export function createScene(overrides?: Partial<CompositionScene>): CompositionScene {
  return {
    id: crypto.randomUUID(),
    order: 0,
    title: 'New Scene',
    duration: 15,
    visual: { type: 'video' },
    voiceover: { type: 'none', text: '', language: 'en' },
    status: 'draft',
    previewUrls: {},
    visualLayers: [],
    bRoll: [],
    sceneStyle: 'corporate',
    outputFormats: ['video_16_9'],
    styleVariants: [],
    isClipCandidate: false,
    versionHistory: [],
    ...overrides,
  };
}

/** Insert a scene at a specific position and reindex all scenes */
export function insertScene(
  scenes: CompositionScene[],
  newScene: CompositionScene,
  position: number | 'start' | 'end' | 'before_cta',
): CompositionScene[] {
  const copy = [...scenes];
  let insertIdx: number;

  if (position === 'start') {
    insertIdx = 0;
  } else if (position === 'end') {
    insertIdx = copy.length;
  } else if (position === 'before_cta') {
    // Insert before CTA/outro scenes
    const ctaIdx = copy.findIndex(s =>
      s.title.toLowerCase().includes('cta') ||
      s.title.toLowerCase().includes('outro') ||
      s.title.toLowerCase().includes('closing')
    );
    insertIdx = ctaIdx >= 0 ? ctaIdx : copy.length;
  } else {
    insertIdx = Math.max(0, Math.min(position, copy.length));
  }

  copy.splice(insertIdx, 0, newScene);
  return reindexScenes(copy);
}

/** Remove a scene by ID */
export function removeScene(scenes: CompositionScene[], sceneId: string): CompositionScene[] {
  return reindexScenes(scenes.filter(s => s.id !== sceneId));
}

/** Duplicate a scene (with new ID) and insert after the original */
export function duplicateScene(scenes: CompositionScene[], sceneId: string): CompositionScene[] {
  const idx = scenes.findIndex(s => s.id === sceneId);
  if (idx === -1) return scenes;

  const original = scenes[idx];
  const clone: CompositionScene = {
    ...structuredClone(original),
    id: crypto.randomUUID(),
    title: `${original.title} (Copy)`,
    status: 'draft',
    previewUrls: {},
    versionHistory: [],
    styleVariants: original.styleVariants?.map(v => ({ ...v, id: crypto.randomUUID(), previewUrl: undefined })),
  };

  const copy = [...scenes];
  copy.splice(idx + 1, 0, clone);
  return reindexScenes(copy);
}

/** Move a scene from one position to another */
export function moveScene(scenes: CompositionScene[], fromIndex: number, toIndex: number): CompositionScene[] {
  const copy = [...scenes];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return reindexScenes(copy);
}

/** Split a scene at a timestamp into two scenes */
export function splitScene(
  scenes: CompositionScene[],
  sceneId: string,
  splitAtSeconds: number,
): CompositionScene[] {
  const idx = scenes.findIndex(s => s.id === sceneId);
  if (idx === -1) return scenes;

  const original = scenes[idx];
  if (splitAtSeconds <= 0 || splitAtSeconds >= original.duration) return scenes;

  const firstHalf: CompositionScene = {
    ...structuredClone(original),
    id: crypto.randomUUID(),
    title: `${original.title} (Part 1)`,
    duration: splitAtSeconds,
    status: 'draft',
    previewUrls: {},
  };

  const secondHalf: CompositionScene = {
    ...structuredClone(original),
    id: crypto.randomUUID(),
    title: `${original.title} (Part 2)`,
    duration: original.duration - splitAtSeconds,
    status: 'draft',
    previewUrls: {},
  };

  const copy = [...scenes];
  copy.splice(idx, 1, firstHalf, secondHalf);
  return reindexScenes(copy);
}

/** Merge two adjacent scenes into one */
export function mergeScenes(
  scenes: CompositionScene[],
  sceneIdA: string,
  sceneIdB: string,
): CompositionScene[] {
  const idxA = scenes.findIndex(s => s.id === sceneIdA);
  const idxB = scenes.findIndex(s => s.id === sceneIdB);
  if (idxA === -1 || idxB === -1) return scenes;

  const [first, second] = idxA < idxB ? [scenes[idxA], scenes[idxB]] : [scenes[idxB], scenes[idxA]];
  const minIdx = Math.min(idxA, idxB);

  const merged: CompositionScene = {
    ...structuredClone(first),
    id: crypto.randomUUID(),
    title: `${first.title} + ${second.title}`,
    duration: first.duration + second.duration,
    status: 'draft',
    previewUrls: {},
    // Combine scripts
    voiceover: {
      ...first.voiceover,
      text: `${first.voiceover.text}\n\n${second.voiceover.text}`,
    },
    // Combine B-roll from both
    bRoll: [...(first.bRoll || []), ...(second.bRoll || [])],
    // Combine visual layers from both
    visualLayers: [
      ...(first.visualLayers || []),
      ...(second.visualLayers || []).map(l => ({
        ...l,
        id: crypto.randomUUID(),
        startTime: (l.startTime || 0) + first.duration,
        endTime: l.endTime ? l.endTime + first.duration : undefined,
      })),
    ],
  };

  const copy = scenes.filter(s => s.id !== sceneIdA && s.id !== sceneIdB);
  copy.splice(minIdx, 0, merged);
  return reindexScenes(copy);
}

/** Reindex all scenes to have sequential order numbers */
function reindexScenes(scenes: CompositionScene[]): CompositionScene[] {
  return scenes.map((s, i) => ({ ...s, order: i + 1 }));
}

// ─── Visual Layer Operations ─────────────────────────────────────────────────

/** Add a visual layer to a scene */
export function addVisualLayer(
  scene: CompositionScene,
  layerType: CompositionElementType,
  config?: Partial<ChapterVisual>,
): CompositionScene {
  const layers = scene.visualLayers || [];
  const newLayer: SceneVisualLayer = {
    id: crypto.randomUUID(),
    order: layers.length,
    type: layerType,
    config: { type: layerType, ...config },
    opacity: 1,
    blendMode: 'normal',
    position: layers.length === 0 ? 'full' : 'pip',
  };

  return {
    ...scene,
    visualLayers: [...layers, newLayer],
  };
}

/** Remove a visual layer from a scene */
export function removeVisualLayer(scene: CompositionScene, layerId: string): CompositionScene {
  return {
    ...scene,
    visualLayers: (scene.visualLayers || [])
      .filter(l => l.id !== layerId)
      .map((l, i) => ({ ...l, order: i })),
  };
}

/** Reorder visual layers within a scene */
export function reorderVisualLayers(
  scene: CompositionScene,
  fromIndex: number,
  toIndex: number,
): CompositionScene {
  const layers = [...(scene.visualLayers || [])];
  const [moved] = layers.splice(fromIndex, 1);
  layers.splice(toIndex, 0, moved);
  return {
    ...scene,
    visualLayers: layers.map((l, i) => ({ ...l, order: i })),
  };
}

// ─── B-Roll Operations ───────────────────────────────────────────────────────

/** Add B-roll to a scene */
export function addBRoll(
  scene: CompositionScene,
  bRoll: Omit<SceneBRoll, 'id'>,
): CompositionScene {
  return {
    ...scene,
    bRoll: [...(scene.bRoll || []), { ...bRoll, id: crypto.randomUUID() }],
  };
}

/** Remove B-roll from a scene */
export function removeBRoll(scene: CompositionScene, bRollId: string): CompositionScene {
  return {
    ...scene,
    bRoll: (scene.bRoll || []).filter(b => b.id !== bRollId),
  };
}

/** Update B-roll configuration */
export function updateBRoll(
  scene: CompositionScene,
  bRollId: string,
  updates: Partial<SceneBRoll>,
): CompositionScene {
  return {
    ...scene,
    bRoll: (scene.bRoll || []).map(b =>
      b.id === bRollId ? { ...b, ...updates } : b
    ),
  };
}

// ─── Style Operations ────────────────────────────────────────────────────────

/** Set the style for a scene */
export function setSceneStyle(
  scene: CompositionScene,
  style: SceneStyle,
  stylePrompt?: string,
): CompositionScene {
  return {
    ...scene,
    sceneStyle: style,
    stylePrompt,
    status: 'draft', // Mark as needing regeneration
  };
}

/** Add a style variant to a scene for A/B comparison */
export function addStyleVariant(
  scene: CompositionScene,
  variant: Omit<SceneStyleVariant, 'id'>,
): CompositionScene {
  return {
    ...scene,
    styleVariants: [
      ...(scene.styleVariants || []),
      { ...variant, id: crypto.randomUUID() },
    ],
  };
}

/** Select a style variant as the active one */
export function selectStyleVariant(
  scene: CompositionScene,
  variantId: string,
): CompositionScene {
  return {
    ...scene,
    styleVariants: (scene.styleVariants || []).map(v => ({
      ...v,
      isSelected: v.id === variantId,
    })),
    // Apply the selected variant's style to the scene
    sceneStyle: (scene.styleVariants || []).find(v => v.id === variantId)?.style || scene.sceneStyle,
    stylePrompt: (scene.styleVariants || []).find(v => v.id === variantId)?.stylePrompt || scene.stylePrompt,
  };
}

// ─── Multi-Output Operations ─────────────────────────────────────────────────

/** Configure multi-output for a project */
export function configureMultiOutput(
  project: CompositionProject,
  outputs: SceneOutputFormat[],
): CompositionProject {
  const formatSettings: MultiOutputConfig['formatSettings'] = {};

  for (const format of outputs) {
    formatSettings[format] = getDefaultFormatSettings(format);
  }

  return {
    ...project,
    multiOutput: {
      enabledOutputs: outputs,
      formatSettings,
      parallelGeneration: true,
    },
  };
}

/** Get default settings for an output format */
function getDefaultFormatSettings(format: SceneOutputFormat): MultiOutputConfig['formatSettings'][string] {
  switch (format) {
    case 'video_16_9':
      return { resolution: '1080p', aspectRatio: '16:9' };
    case 'video_9_16':
      return { resolution: '1080p', aspectRatio: '9:16', maxDuration: 60 };
    case 'video_1_1':
      return { resolution: '1080p', aspectRatio: '1:1' };
    case 'video_4_5':
      return { resolution: '1080p', aspectRatio: '4:5' };
    case 'audio_only':
      return {};
    case 'slide_image':
      return { resolution: '1080p', aspectRatio: '16:9' };
    case 'thumbnail':
      return { resolution: '1080p', aspectRatio: '16:9' };
    case 'audiogram':
      return { resolution: '1080p', aspectRatio: '1:1', maxDuration: 60 };
    case 'gif':
      return { resolution: '720p', maxDuration: 10 };
    default:
      return {};
  }
}

// ─── Scene Version History ───────────────────────────────────────────────────

/** Save a snapshot of a scene before modifying it */
export function saveSceneVersion(
  scene: CompositionScene,
  changeType: 'script' | 'visual' | 'audio' | 'style' | 'broll' | 'full',
  description: string,
): CompositionScene {
  const history = scene.versionHistory || [];

  // Keep last 20 versions per scene
  const trimmedHistory = history.length >= 20 ? history.slice(1) : history;

  return {
    ...scene,
    versionHistory: [
      ...trimmedHistory,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        changeType,
        previousState: {
          visual: structuredClone(scene.visual),
          voiceover: structuredClone(scene.voiceover),
          sceneStyle: scene.sceneStyle,
          stylePrompt: scene.stylePrompt,
          bRoll: scene.bRoll ? structuredClone(scene.bRoll) : undefined,
          visualLayers: scene.visualLayers ? structuredClone(scene.visualLayers) : undefined,
          duration: scene.duration,
        },
        description,
      },
    ],
  };
}

/** Restore a scene to a previous version */
export function restoreSceneVersion(
  scene: CompositionScene,
  versionId: string,
): CompositionScene | null {
  const version = (scene.versionHistory || []).find(v => v.id === versionId);
  if (!version) return null;

  return {
    ...scene,
    ...version.previousState,
    status: 'draft',
    previewUrls: {},
  };
}

// ─── Clip Extraction ─────────────────────────────────────────────────────────

/** Mark a scene as a clip candidate for social platforms */
export function markAsClip(
  scene: CompositionScene,
  platforms: string[],
): CompositionScene {
  return {
    ...scene,
    isClipCandidate: true,
    clipMetadata: {
      suggestedPlatforms: platforms,
      viralScore: undefined,
      hookStrength: undefined,
    },
  };
}

/** Extract clip-ready scenes from a project */
export function getClipCandidates(scenes: CompositionScene[]): CompositionScene[] {
  return scenes.filter(s => s.isClipCandidate);
}

// ─── Conversion Utilities ────────────────────────────────────────────────────

/** Upgrade a CompositionChapter to a CompositionScene (backward-compatible) */
export function chapterToScene(chapter: CompositionChapter): CompositionScene {
  return {
    ...chapter,
    visualLayers: [{
      id: crypto.randomUUID(),
      order: 0,
      type: chapter.visual.type,
      config: chapter.visual,
      opacity: 1,
      blendMode: 'normal',
      position: 'full',
    }],
    bRoll: [],
    sceneStyle: inferStyleFromVisual(chapter.visual),
    outputFormats: ['video_16_9'],
    styleVariants: [],
    isClipCandidate: false,
    versionHistory: [],
  };
}

/** Downgrade a CompositionScene to a CompositionChapter (for legacy compatibility) */
export function sceneToChapter(scene: CompositionScene): CompositionChapter {
  return {
    id: scene.id,
    order: scene.order,
    title: scene.title,
    duration: scene.duration,
    visual: scene.visual,
    voiceover: scene.voiceover,
    backgroundMusic: scene.backgroundMusic,
    sfx: scene.sfx,
    status: scene.status,
    progress: scene.progress,
    error: scene.error,
    previewUrls: scene.previewUrls,
  };
}

/** Infer a visual style from a chapter visual config */
function inferStyleFromVisual(visual: ChapterVisual): SceneStyle {
  switch (visual.type) {
    case 'avatar': return 'corporate';
    case '3d': return 'futuristic';
    case 'animation': return 'playful';
    case 'cinematic': return 'cinematic';
    case 'static': return 'minimalist';
    default: return 'corporate';
  }
}

// ─── Project Utilities ───────────────────────────────────────────────────────

/** Calculate total project duration */
export function getProjectDuration(scenes: CompositionScene[]): number {
  return scenes.reduce((sum, s) => sum + s.duration, 0);
}

/** Get scenes that need regeneration */
export function getDirtyScenes(scenes: CompositionScene[]): CompositionScene[] {
  return scenes.filter(s => s.status === 'draft' || s.status === 'error');
}

/** Get a summary of all element types used across scenes */
export function getElementTypeSummary(scenes: CompositionScene[]): Record<CompositionElementType, number> {
  const summary: Partial<Record<CompositionElementType, number>> = {};

  for (const scene of scenes) {
    // Primary visual
    summary[scene.visual.type] = (summary[scene.visual.type] || 0) + 1;

    // Visual layers
    for (const layer of scene.visualLayers || []) {
      summary[layer.type] = (summary[layer.type] || 0) + 1;
    }

    // B-roll
    if (scene.bRoll?.length) {
      summary['broll'] = (summary['broll'] || 0) + scene.bRoll.length;
    }
  }

  return summary as Record<CompositionElementType, number>;
}

/** Estimate credits for a scene based on its configuration */
export function estimateSceneCredits(scene: CompositionScene): {
  total: number;
  breakdown: Record<string, number>;
} {
  const breakdown: Record<string, number> = {};

  // Base cost per scene
  breakdown['scene_base'] = 2;

  // Visual generation cost
  const visualCosts: Record<string, number> = {
    video: 5, cinematic: 8, avatar: 10, '3d': 15, vr_360: 20,
    ar_overlay: 12, animation: 4, static: 1, broll: 0.5,
    slide: 1, screen_recording: 0, custom: 0,
  };
  breakdown['primary_visual'] = visualCosts[scene.visual.type] || 3;

  // Additional visual layers
  for (const layer of scene.visualLayers || []) {
    const cost = visualCosts[layer.type] || 3;
    breakdown[`layer_${layer.type}`] = (breakdown[`layer_${layer.type}`] || 0) + cost;
  }

  // B-roll cost
  if (scene.bRoll?.length) {
    breakdown['broll'] = scene.bRoll.reduce((sum, b) => {
      if (b.source === 'ai_generated') return sum + 3;
      if (b.source === 'stock') return sum + 0.5;
      return sum;
    }, 0);
  }

  // Voiceover cost
  if (scene.voiceover.type !== 'none') {
    const textLength = scene.voiceover.text.length;
    const ttsCost = (textLength / 1000) * 0.5;
    breakdown['voiceover'] = scene.voiceover.type === 'voice_clone' ? ttsCost * 2 : ttsCost;
  }

  // Style variants cost
  if (scene.styleVariants?.length) {
    breakdown['style_variants'] = scene.styleVariants.length * (visualCosts[scene.visual.type] || 3) * 0.8;
  }

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  return { total: Math.round(total * 10) / 10, breakdown };
}

/** Estimate total project credits */
export function estimateProjectCredits(
  scenes: CompositionScene[],
  multiOutput?: MultiOutputConfig,
): { total: number; perScene: Record<string, number>; perFormat: Record<string, number> } {
  const perScene: Record<string, number> = {};
  let baseTotal = 0;

  for (const scene of scenes) {
    const estimate = estimateSceneCredits(scene);
    perScene[scene.id] = estimate.total;
    baseTotal += estimate.total;
  }

  // Multi-output multiplier
  const perFormat: Record<string, number> = {};
  if (multiOutput?.enabledOutputs.length) {
    for (const format of multiOutput.enabledOutputs) {
      // Each additional format costs ~30% of base (reuses generated assets)
      const formatCost = format === 'audio_only' ? baseTotal * 0.1 : baseTotal * 0.3;
      perFormat[format] = Math.round(formatCost * 10) / 10;
    }
  }

  const formatTotal = Object.values(perFormat).reduce((sum, v) => sum + v, 0);
  return {
    total: Math.round((baseTotal + formatTotal) * 10) / 10,
    perScene,
    perFormat,
  };
}

// ─── Scene Templates ─────────────────────────────────────────────────────────

/** Pre-built scene templates for quick creation */
export const SCENE_TEMPLATES: Record<string, Partial<CompositionScene>> = {
  talking_head: {
    title: 'Talking Head',
    duration: 30,
    visual: { type: 'avatar', avatarStyle: 'professional_western', enableLipSync: true },
    voiceover: { type: 'lipsync', text: '', language: 'en' },
    sceneStyle: 'corporate',
  },
  cinematic_intro: {
    title: 'Cinematic Intro',
    duration: 10,
    visual: { type: 'cinematic', prompt: 'Dramatic opening shot with brand reveal' },
    voiceover: { type: 'tts', text: '', language: 'en' },
    sceneStyle: 'cinematic',
  },
  product_demo: {
    title: 'Product Demo',
    duration: 45,
    visual: { type: 'screen_recording' },
    voiceover: { type: 'tts', text: '', language: 'en' },
    sceneStyle: 'minimalist',
  },
  '3d_showcase': {
    title: '3D Product Showcase',
    duration: 20,
    visual: { type: '3d', meshPrompt: '' },
    voiceover: { type: 'tts', text: '', language: 'en' },
    sceneStyle: 'futuristic',
  },
  broll_montage: {
    title: 'B-Roll Montage',
    duration: 15,
    visual: { type: 'broll' },
    voiceover: { type: 'none', text: '', language: 'en' },
    sceneStyle: 'documentary',
    bRoll: [
      { id: crypto.randomUUID(), source: 'stock', position: 'fullscreen', opacity: 1 },
    ],
  },
  slide_presentation: {
    title: 'Slide',
    duration: 20,
    visual: { type: 'slide' },
    voiceover: { type: 'tts', text: '', language: 'en' },
    sceneStyle: 'corporate',
  },
  testimonial: {
    title: 'Customer Testimonial',
    duration: 30,
    visual: { type: 'avatar', avatarStyle: 'casual', enableLipSync: true },
    voiceover: { type: 'lipsync', text: '', language: 'en' },
    sceneStyle: 'documentary',
  },
  data_visualization: {
    title: 'Data & Stats',
    duration: 15,
    visual: { type: 'animation', prompt: 'Animated data visualization with key metrics' },
    voiceover: { type: 'tts', text: '', language: 'en' },
    sceneStyle: 'minimalist',
  },
  vr_immersive: {
    title: 'VR Immersive',
    duration: 30,
    visual: { type: 'vr_360' },
    voiceover: { type: 'tts', text: '', language: 'en' },
    sceneStyle: 'futuristic',
  },
  ar_product_view: {
    title: 'AR Product View',
    duration: 20,
    visual: { type: 'ar_overlay' },
    voiceover: { type: 'tts', text: '', language: 'en' },
    sceneStyle: 'futuristic',
  },
  whiteboard_explainer: {
    title: 'Whiteboard Explainer',
    duration: 45,
    visual: { type: 'animation', prompt: 'Hand-drawn whiteboard explanation' },
    voiceover: { type: 'tts', text: '', language: 'en' },
    sceneStyle: 'hand_drawn',
  },
  multi_avatar_conversation: {
    title: 'Multi-Avatar Conversation',
    duration: 60,
    visual: { type: 'avatar', avatarStyle: 'professional_western', enableLipSync: true },
    voiceover: { type: 'lipsync', text: '', language: 'en' },
    sceneStyle: 'corporate',
    visualLayers: [
      {
        id: crypto.randomUUID(),
        order: 0,
        type: 'avatar',
        config: { type: 'avatar', avatarStyle: 'professional_western', enableLipSync: true },
        position: 'left',
        opacity: 1,
      },
      {
        id: crypto.randomUUID(),
        order: 1,
        type: 'avatar',
        config: { type: 'avatar', avatarStyle: 'professional_cjk', enableLipSync: true },
        position: 'right',
        opacity: 1,
      },
    ],
  },
};

/** Get a template-based scene */
export function createFromTemplate(templateKey: string): CompositionScene {
  const template = SCENE_TEMPLATES[templateKey];
  if (!template) return createScene();
  return createScene(template);
}

// ─── Stitch Plan Builder ─────────────────────────────────────────────────────

export interface StitchPlan {
  scenes: Array<{
    sceneId: string;
    title: string;
    duration: number;
    elementType: CompositionElementType;
    hasLayers: boolean;
    hasBRoll: boolean;
    transitionIn?: string;
    transitionOut?: string;
  }>;
  totalDuration: number;
  outputFormats: SceneOutputFormat[];
  estimatedCredits: number;
}

/** Build a stitch plan from scenes for the video assembly pipeline */
export function buildStitchPlan(
  scenes: CompositionScene[],
  multiOutput?: MultiOutputConfig,
): StitchPlan {
  const creditEstimate = estimateProjectCredits(scenes, multiOutput);

  return {
    scenes: scenes.map(s => ({
      sceneId: s.id,
      title: s.title,
      duration: s.duration,
      elementType: s.visual.type,
      hasLayers: (s.visualLayers?.length || 0) > 0,
      hasBRoll: (s.bRoll?.length || 0) > 0,
      transitionIn: s.visual.transitionIn,
      transitionOut: s.visual.transitionOut,
    })),
    totalDuration: getProjectDuration(scenes),
    outputFormats: multiOutput?.enabledOutputs || ['video_16_9'],
    estimatedCredits: creditEstimate.total,
  };
}

// ─── Cross-Format Conversion ─────────────────────────────────────────────────

/** Convert slide scenes to cinematic video scenes */
export function convertSlidesToCinematic(
  scenes: CompositionScene[],
  options: {
    cinematicStyle?: SceneStyle;
    renderAs3D?: boolean;
    keepOriginalSlides?: boolean;
  } = {},
): CompositionScene[] {
  const slideScenes = scenes.filter(s => s.visual.type === 'slide');
  if (slideScenes.length === 0) return scenes;

  const newScenes: CompositionScene[] = [];

  for (const scene of scenes) {
    // Keep non-slide scenes as-is
    if (scene.visual.type !== 'slide') {
      newScenes.push(scene);
      continue;
    }

    // Optionally keep original slide
    if (options.keepOriginalSlides) {
      newScenes.push(scene);
    }

    // Create cinematic version of the slide
    const cinematicScene: CompositionScene = {
      ...structuredClone(scene),
      id: crypto.randomUUID(),
      title: `${scene.title} (Cinematic)`,
      visual: {
        type: options.renderAs3D ? '3d' : 'cinematic',
        prompt: `Cinematic storytelling version of: ${scene.title}. ${scene.voiceover.text.slice(0, 200)}`,
      },
      sceneStyle: options.cinematicStyle || 'cinematic',
      motionPreset: 'tracking_shot',
      renderConfig: {
        renderingMode: options.renderAs3D ? 'stylized_3d' : 'photorealistic',
        lighting: 'dramatic',
        colorGrade: 'cinematic_teal_orange',
        depthOfField: 'shallow',
        filmGrain: 0.1,
      },
      status: 'draft',
      previewUrls: {},
      crossFormatConversions: [{
        id: crypto.randomUUID(),
        type: 'slides_to_cinematic',
        sourceSceneIds: [scene.id],
        targetFormat: 'video_16_9',
        settings: {
          cinematicStyle: options.cinematicStyle || 'cinematic',
          renderAs3D: options.renderAs3D || false,
          animationIntensity: 0.7,
          preserveSources: true,
        },
        status: 'pending',
      }],
    };

    newScenes.push(cinematicScene);
  }

  return reindexScenes(newScenes);
}

/** Convert data/infographic scenes to animated video scenes */
export function convertInfographicToVideo(
  scenes: CompositionScene[],
): CompositionScene[] {
  const newScenes: CompositionScene[] = [];

  for (const scene of scenes) {
    newScenes.push(scene);

    // If scene has data visualizations, create an animated video version
    if (scene.dataVisualizations && scene.dataVisualizations.length > 0) {
      const animatedScene: CompositionScene = {
        ...structuredClone(scene),
        id: crypto.randomUUID(),
        title: `${scene.title} (Animated)`,
        visual: {
          type: 'animation',
          prompt: `Animated data visualization: ${scene.dataVisualizations.map(d => d.title).join(', ')}`,
        },
        sceneStyle: 'minimalist',
        motionPreset: 'kinetic_text',
        status: 'draft',
        previewUrls: {},
      };
      newScenes.push(animatedScene);
    }
  }

  return reindexScenes(newScenes);
}

// ─── Data Source Management ──────────────────────────────────────────────────

/** Add a data source to a scene */
export function addDataSource(
  scenes: CompositionScene[],
  sceneId: string,
  source: DataSource,
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      dataSources: [...(s.dataSources || []), source],
    };
  });
}

/** Remove a data source from a scene */
export function removeDataSource(
  scenes: CompositionScene[],
  sceneId: string,
  sourceId: string,
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      dataSources: (s.dataSources || []).filter(d => d.id !== sourceId),
    };
  });
}

/** Mark a data source as verified */
export function verifyDataSource(
  scenes: CompositionScene[],
  sceneId: string,
  sourceId: string,
  notes?: string,
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      dataSources: (s.dataSources || []).map(d =>
        d.id === sourceId
          ? { ...d, verified: true, verificationNotes: notes, dataConfidence: 1.0 }
          : d
      ),
    };
  });
}

// ─── Content Verification ───────────────────────────────────────────────────

/** Add a verification result to a scene */
export function addVerification(
  scenes: CompositionScene[],
  sceneId: string,
  verification: ContentVerification,
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      verifications: [...(s.verifications || []), verification],
    };
  });
}

/** Flag a scene's content as needing human review */
export function flagForReview(
  scenes: CompositionScene[],
  sceneId: string,
  reason: string,
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      verifications: [
        ...(s.verifications || []),
        {
          id: crypto.randomUUID(),
          target: 'script' as const,
          content: s.voiceover.text,
          status: 'flagged' as const,
          confidence: 0,
          issues: [{
            type: 'unverifiable' as const,
            description: reason,
            severity: 'medium' as const,
          }],
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'ai_auto' as const,
        },
      ],
    };
  });
}

/** Get all unverified scenes */
export function getUnverifiedScenes(scenes: CompositionScene[]): CompositionScene[] {
  return scenes.filter(s => {
    // Has data but no verification
    const hasUnverifiedData = s.dataSources?.some(d => !d.verified);
    const hasUnverifiedClaims = s.verifications?.some(v => v.status === 'unverified' || v.status === 'flagged');
    const hasAIContent = s.dataSources?.some(d => d.type === 'ai_generated');
    return hasUnverifiedData || hasUnverifiedClaims || (hasAIContent && !s.verifications?.length);
  });
}

// ─── Data Visualization Management ──────────────────────────────────────────

/** Add a data visualization to a scene */
export function addDataVisualization(
  scenes: CompositionScene[],
  sceneId: string,
  visualization: SceneDataVisualization,
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      dataVisualizations: [...(s.dataVisualizations || []), visualization],
    };
  });
}

/** Remove a data visualization from a scene */
export function removeDataVisualization(
  scenes: CompositionScene[],
  sceneId: string,
  vizId: string,
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      dataVisualizations: (s.dataVisualizations || []).filter(v => v.id !== vizId),
    };
  });
}

// ─── Scene Edit State Management ─────────────────────────────────────────────

/** Start editing a scene field */
export function startEditing(
  scenes: CompositionScene[],
  sceneId: string,
  field: SceneEditState['editingField'],
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      editState: {
        isEditing: true,
        editingField: field,
        isDirty: false,
        undoStack: [s.voiceover.text],
        redoStack: [],
      },
    };
  });
}

/** Stop editing a scene */
export function stopEditing(
  scenes: CompositionScene[],
  sceneId: string,
): CompositionScene[] {
  return scenes.map(s => {
    if (s.id !== sceneId) return s;
    return {
      ...s,
      editState: {
        isEditing: false,
        isDirty: false,
        lastAutoSave: new Date().toISOString(),
      },
    };
  });
}

// ─── Additional Scene Templates (Data & Cross-Format) ────────────────────────

Object.assign(SCENE_TEMPLATES, {
  infographic: {
    title: 'Infographic',
    duration: 20,
    visual: { type: 'animation' as const, prompt: 'Animated infographic with data, icons, and statistics' },
    voiceover: { type: 'tts' as const, text: '', language: 'en' },
    sceneStyle: 'minimalist' as const,
    motionPreset: 'kinetic_text' as const,
    slideFramework: 'infographic' as const,
  },
  customer_journey: {
    title: 'Customer Journey',
    duration: 25,
    visual: { type: 'slide' as const },
    voiceover: { type: 'tts' as const, text: '', language: 'en' },
    sceneStyle: 'corporate' as const,
    motionPreset: 'slow_pan' as const,
    slideFramework: 'customer_journey' as const,
  },
  data_dashboard: {
    title: 'Data Dashboard',
    duration: 15,
    visual: { type: 'slide' as const },
    voiceover: { type: 'tts' as const, text: '', language: 'en' },
    sceneStyle: 'minimalist' as const,
    motionPreset: 'kinetic_text' as const,
    slideFramework: 'data_dashboard' as const,
  },
  stat_callout: {
    title: 'Big Statistic',
    duration: 8,
    visual: { type: 'animation' as const, prompt: 'Animated big number statistic with count-up effect' },
    voiceover: { type: 'tts' as const, text: '', language: 'en' },
    sceneStyle: 'minimalist' as const,
    motionPreset: 'kinetic_text' as const,
    slideFramework: 'stat_callout' as const,
  },
  comparison_chart: {
    title: 'Comparison Chart',
    duration: 15,
    visual: { type: 'animation' as const, prompt: 'Animated comparison chart with side-by-side data' },
    voiceover: { type: 'tts' as const, text: '', language: 'en' },
    sceneStyle: 'minimalist' as const,
    motionPreset: 'morph' as const,
    slideFramework: 'comparison_table' as const,
  },
  geographic_map: {
    title: 'Geographic Map',
    duration: 15,
    visual: { type: 'animation' as const, prompt: 'Animated map visualization with regional data' },
    voiceover: { type: 'tts' as const, text: '', language: 'en' },
    sceneStyle: 'minimalist' as const,
    motionPreset: 'slow_zoom_out' as const,
    slideFramework: 'geographic_map' as const,
  },
  before_after: {
    title: 'Before / After',
    duration: 15,
    visual: { type: 'animation' as const, prompt: 'Split-screen before and after comparison with metrics' },
    voiceover: { type: 'tts' as const, text: '', language: 'en' },
    sceneStyle: 'minimalist' as const,
    motionPreset: 'split_screen' as const,
    slideFramework: 'before_after' as const,
  },
  process_flow: {
    title: 'Process Flow',
    duration: 20,
    visual: { type: 'animation' as const, prompt: 'Step-by-step process flow diagram with sequential reveal' },
    voiceover: { type: 'tts' as const, text: '', language: 'en' },
    sceneStyle: 'minimalist' as const,
    motionPreset: 'morph' as const,
    slideFramework: 'process_flow' as const,
  },
});
