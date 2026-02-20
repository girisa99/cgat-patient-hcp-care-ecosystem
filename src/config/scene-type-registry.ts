/**
 * SCENE TYPE REGISTRY
 * 
 * Defines 18+ scene types with their valid pipeline step combinations.
 * Core types are in code (immutable, versioned in git).
 * Custom types can be stored in DB table `custom_scene_types` (hybrid approach).
 * 
 * Each scene type specifies:
 * - Required pipeline steps (what the orchestrator must execute)
 * - Optional steps (can be added for richness)
 * - Which products can use this scene type
 * - Default layout, transition, and duration hints
 * 
 * @see src/config/universal-script-schema.ts — the script contract
 * @see supabase/functions/universal-scene-orchestrator/index.ts — executor
 */

import type { GenieProduct, EmotionalTone } from './universal-script-schema';

// ─── PIPELINE STEP TYPES ──────────────────────────────────────────────────────

/** All possible pipeline step types the orchestrator can dispatch */
export type PipelineStepType =
  | 'tts'                  // Text-to-speech generation
  | 'avatar-3d'            // 3D character model generation
  | 'avatar-lipsync'       // Lip-sync video from audio + avatar
  | 'video'                // AI video generation (text-to-video / image-to-video)
  | 'image'                // AI image generation
  | 'screen-capture'       // Pre-captured screenshot retrieval
  | 'ai-screen-enhance'    // AI-enhanced screenshots with annotations
  | 'kinetic-text'         // Animated text overlays
  | 'motion-graphics'      // Motion graphics / animated elements
  | 'data-viz'             // Data visualization generation
  | 'music'                // AI music generation
  | 'sfx'                  // Sound effects generation
  | 'transition'           // Scene transition effect
  | 'lower-third'          // Name/title overlay
  | 'timer-overlay'        // Countdown/timer for interactive
  | 'highlight-overlay'    // Code/UI highlight annotations
  | 'links-overlay'        // Clickable CTA links overlay
  | 'split-layout'         // Multi-speaker layout composition
  | 'rotate-animation'     // 3D model rotation animation
  | 'animation-path'       // Animated path on map/diagram
  | 'whiteboard'           // Whiteboard drawing animation
  | 'subtitle-burn';       // Subtitle/caption burn-in

// ─── SCENE TYPE DEFINITION ────────────────────────────────────────────────────

/** A step in the scene pipeline */
export interface PipelineStep {
  /** Step type */
  type: PipelineStepType;
  /** Whether this step is required or optional */
  required: boolean;
  /** Execution order within the scene (lower = earlier) */
  order: number;
  /** Default config for this step (can be overridden per scene) */
  defaultConfig?: Record<string, unknown>;
  /** Description of what this step does in this scene type */
  description?: string;
}

/** Scene type definition */
export interface SceneTypeDefinition {
  /** Unique scene type ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;
  /** Category for grouping in UI */
  category: SceneCategory;
  /** Pipeline steps (ordered) */
  steps: PipelineStep[];
  /** Products that can use this scene type */
  allowedProducts: GenieProduct[];
  /** Default layout */
  defaultLayout: 'fullscreen' | 'split-screen' | 'pip' | 'side-by-side' | 'grid';
  /** Default transition in */
  defaultTransitionIn: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'slide';
  /** Default transition out */
  defaultTransitionOut: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'slide';
  /** Typical duration range in seconds */
  durationRange: { min: number; max: number };
  /** Minimum speakers required */
  minSpeakers: number;
  /** Maximum speakers supported */
  maxSpeakers: number;
  /** Default emotional tone */
  defaultTone: EmotionalTone;
  /** Whether this is a core (code) or custom (DB) type */
  source: 'core' | 'custom';
  /** Icon for UI display */
  icon: string;
  /** Tags for search/filter */
  tags: string[];
}

/** Scene categories */
export type SceneCategory =
  | 'narrative'       // Story-driven scenes
  | 'demonstration'   // Product/tech demos
  | 'data'            // Data-driven visualizations
  | 'interactive'     // Quizzes, polls, prompts
  | 'transition'      // Interludes, musical breaks
  | 'branding';       // Title cards, CTAs, outros

// ─── CORE SCENE TYPES (18) ────────────────────────────────────────────────────

export const CORE_SCENE_TYPES: Record<string, SceneTypeDefinition> = {

  // ── NARRATIVE ──────────────────────────────────────────────────────────────

  'talking-head': {
    id: 'talking-head',
    name: 'Talking Head',
    description: 'Single speaker with lip-synced avatar delivering narration or commentary.',
    category: 'narrative',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Generate speech audio' },
      { type: 'avatar-lipsync', required: true, order: 2, description: 'Lip-sync avatar to speech' },
      { type: 'lower-third', required: false, order: 3, description: 'Speaker name overlay' },
    ],
    allowedProducts: ['spark', 'mind', 'deck', 'vibe', 'arc', 'hub', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'fade',
    defaultTransitionOut: 'fade',
    durationRange: { min: 5, max: 120 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'conversational',
    source: 'core',
    icon: '🗣️',
    tags: ['narration', 'avatar', 'lipsync', 'single-speaker'],
  },

  'split-screen-debate': {
    id: 'split-screen-debate',
    name: 'Split-Screen Debate',
    description: 'Two speakers side-by-side, each with lip-synced avatar — debate or dialogue format.',
    category: 'narrative',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Speaker A audio' },
      { type: 'tts', required: true, order: 2, description: 'Speaker B audio' },
      { type: 'avatar-lipsync', required: true, order: 3, description: 'Speaker A lip-sync' },
      { type: 'avatar-lipsync', required: true, order: 4, description: 'Speaker B lip-sync' },
      { type: 'split-layout', required: true, order: 5, description: 'Compose side-by-side layout' },
      { type: 'lower-third', required: false, order: 6, description: 'Speaker name overlays' },
    ],
    allowedProducts: ['cast'],
    defaultLayout: 'split-screen',
    defaultTransitionIn: 'dissolve',
    defaultTransitionOut: 'dissolve',
    durationRange: { min: 15, max: 300 },
    minSpeakers: 2,
    maxSpeakers: 2,
    defaultTone: 'provocative',
    source: 'core',
    icon: '⚔️',
    tags: ['debate', 'dialogue', 'two-speaker', 'split-screen'],
  },

  'interview-2shot': {
    id: 'interview-2shot',
    name: 'Interview (2-Shot)',
    description: 'Interviewer and guest with alternating focus — conversational interview format.',
    category: 'narrative',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Interviewer audio' },
      { type: 'tts', required: true, order: 2, description: 'Guest audio' },
      { type: 'avatar-lipsync', required: true, order: 3, description: 'Interviewer lip-sync' },
      { type: 'avatar-lipsync', required: true, order: 4, description: 'Guest lip-sync' },
      { type: 'split-layout', required: true, order: 5, description: 'Interview layout' },
      { type: 'lower-third', required: false, order: 6, description: 'Name/title overlays' },
    ],
    allowedProducts: ['cast'],
    defaultLayout: 'side-by-side',
    defaultTransitionIn: 'dissolve',
    defaultTransitionOut: 'dissolve',
    durationRange: { min: 30, max: 600 },
    minSpeakers: 2,
    maxSpeakers: 4,
    defaultTone: 'conversational',
    source: 'core',
    icon: '🎤',
    tags: ['interview', 'two-shot', 'conversation', 'multi-speaker'],
  },

  'b-roll-narration': {
    id: 'b-roll-narration',
    name: 'B-Roll Narration',
    description: 'Voice-over narration with cinematic B-roll footage generated by AI.',
    category: 'narrative',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Narration audio' },
      { type: 'video', required: true, order: 2, description: 'AI-generated B-roll footage' },
      { type: 'subtitle-burn', required: false, order: 3, description: 'Subtitle overlay' },
    ],
    allowedProducts: ['cast', 'vibe'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'dissolve',
    defaultTransitionOut: 'dissolve',
    durationRange: { min: 5, max: 60 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'dramatic',
    source: 'core',
    icon: '🎬',
    tags: ['b-roll', 'cinematic', 'narration', 'atmospheric'],
  },

  'testimonial': {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Customer/user testimonial with avatar, name overlay, and optional quote card.',
    category: 'narrative',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Testimonial audio' },
      { type: 'avatar-lipsync', required: true, order: 2, description: 'Speaker lip-sync' },
      { type: 'lower-third', required: true, order: 3, description: 'Name/company overlay' },
      { type: 'kinetic-text', required: false, order: 4, description: 'Pull-quote card' },
    ],
    allowedProducts: ['spark', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'fade',
    defaultTransitionOut: 'fade',
    durationRange: { min: 10, max: 60 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'empathetic',
    source: 'core',
    icon: '💬',
    tags: ['testimonial', 'customer', 'quote', 'social-proof'],
  },

  // ── DEMONSTRATION ─────────────────────────────────────────────────────────

  'screen-capture-vo': {
    id: 'screen-capture-vo',
    name: 'Screen Capture + Voice-Over',
    description: 'Pre-captured screenshots with AI enhancement and narration overlay.',
    category: 'demonstration',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Narration audio' },
      { type: 'screen-capture', required: true, order: 2, description: 'Retrieve screenshots' },
      { type: 'ai-screen-enhance', required: false, order: 3, description: 'AI-enhanced annotations' },
      { type: 'highlight-overlay', required: false, order: 4, description: 'Focus area highlights' },
    ],
    allowedProducts: ['spark', 'deck', 'cast', 'hub'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'cut',
    defaultTransitionOut: 'cut',
    durationRange: { min: 10, max: 120 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'educational',
    source: 'core',
    icon: '📸',
    tags: ['screen-capture', 'demo', 'walkthrough', 'tutorial'],
  },

  'product-demo': {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Feature walkthrough with screen capture, narration, and kinetic text callouts.',
    category: 'demonstration',
    steps: [
      { type: 'screen-capture', required: true, order: 1, description: 'Product screenshots' },
      { type: 'tts', required: true, order: 2, description: 'Feature narration' },
      { type: 'kinetic-text', required: true, order: 3, description: 'Feature callout text' },
      { type: 'highlight-overlay', required: false, order: 4, description: 'UI element highlights' },
    ],
    allowedProducts: ['spark', 'deck', 'cast', 'hub'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'zoom',
    defaultTransitionOut: 'zoom',
    durationRange: { min: 15, max: 180 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'inspiring',
    source: 'core',
    icon: '🖥️',
    tags: ['product', 'demo', 'feature', 'walkthrough'],
  },

  'code-walkthrough': {
    id: 'code-walkthrough',
    name: 'Code Walkthrough',
    description: 'Code/terminal display with narration, syntax highlighting, and line-by-line focus.',
    category: 'demonstration',
    steps: [
      { type: 'screen-capture', required: true, order: 1, description: 'Code/terminal screenshots' },
      { type: 'tts', required: true, order: 2, description: 'Code explanation audio' },
      { type: 'highlight-overlay', required: true, order: 3, description: 'Line-by-line highlights' },
      { type: 'kinetic-text', required: false, order: 4, description: 'Annotation callouts' },
    ],
    allowedProducts: ['cast', 'deck', 'mind'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'cut',
    defaultTransitionOut: 'cut',
    durationRange: { min: 15, max: 300 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'educational',
    source: 'core',
    icon: '💻',
    tags: ['code', 'terminal', 'developer', 'technical'],
  },

  '3d-showcase': {
    id: '3d-showcase',
    name: '3D Showcase',
    description: '3D model generation with rotation animation and narration.',
    category: 'demonstration',
    steps: [
      { type: 'avatar-3d', required: true, order: 1, description: '3D model generation' },
      { type: 'rotate-animation', required: true, order: 2, description: '360° rotation' },
      { type: 'tts', required: true, order: 3, description: 'Narration audio' },
    ],
    allowedProducts: ['deck', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'zoom',
    defaultTransitionOut: 'zoom',
    durationRange: { min: 10, max: 60 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'inspiring',
    source: 'core',
    icon: '🧊',
    tags: ['3d', 'model', 'showcase', 'rotation'],
  },

  // ── DATA ──────────────────────────────────────────────────────────────────

  'whiteboard-explainer': {
    id: 'whiteboard-explainer',
    name: 'Whiteboard Explainer',
    description: 'Animated whiteboard drawing with narration — great for concepts and processes.',
    category: 'data',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Explanation audio' },
      { type: 'whiteboard', required: true, order: 2, description: 'Whiteboard drawing animation' },
      { type: 'kinetic-text', required: false, order: 3, description: 'Label annotations' },
    ],
    allowedProducts: ['mind', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'fade',
    defaultTransitionOut: 'fade',
    durationRange: { min: 15, max: 180 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'educational',
    source: 'core',
    icon: '🎨',
    tags: ['whiteboard', 'explainer', 'drawing', 'concept'],
  },

  'data-viz-narrative': {
    id: 'data-viz-narrative',
    name: 'Data Visualization Narrative',
    description: 'Animated charts/graphs with data-driven narration.',
    category: 'data',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Data narration' },
      { type: 'data-viz', required: true, order: 2, description: 'Chart/graph generation' },
      { type: 'motion-graphics', required: false, order: 3, description: 'Animated transitions' },
      { type: 'kinetic-text', required: false, order: 4, description: 'Data point callouts' },
    ],
    allowedProducts: ['mind', 'deck', 'cast', 'hub'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'dissolve',
    defaultTransitionOut: 'dissolve',
    durationRange: { min: 10, max: 120 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'authoritative',
    source: 'core',
    icon: '📊',
    tags: ['data', 'chart', 'graph', 'visualization', 'statistics'],
  },

  'map-journey': {
    id: 'map-journey',
    name: 'Map Journey',
    description: 'Animated path on a map or diagram showing geographic/process journey.',
    category: 'data',
    steps: [
      { type: 'image', required: true, order: 1, description: 'Map/diagram generation' },
      { type: 'animation-path', required: true, order: 2, description: 'Animated journey path' },
      { type: 'tts', required: true, order: 3, description: 'Journey narration' },
      { type: 'kinetic-text', required: false, order: 4, description: 'Location labels' },
    ],
    allowedProducts: ['mind', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'zoom',
    defaultTransitionOut: 'zoom',
    durationRange: { min: 15, max: 120 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'inspiring',
    source: 'core',
    icon: '🗺️',
    tags: ['map', 'journey', 'geographic', 'path', 'process'],
  },

  'before-after': {
    id: 'before-after',
    name: 'Before/After Reveal',
    description: 'Dramatic transformation reveal with side-by-side or wipe transition.',
    category: 'data',
    steps: [
      { type: 'image', required: true, order: 1, description: 'Before state image' },
      { type: 'image', required: true, order: 2, description: 'After state image' },
      { type: 'transition', required: true, order: 3, description: 'Reveal wipe transition' },
      { type: 'tts', required: true, order: 4, description: 'Transformation narration' },
    ],
    allowedProducts: ['spark', 'deck', 'cast'],
    defaultLayout: 'split-screen',
    defaultTransitionIn: 'wipe',
    defaultTransitionOut: 'wipe',
    durationRange: { min: 8, max: 30 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'dramatic',
    source: 'core',
    icon: '🔄',
    tags: ['before-after', 'transformation', 'comparison', 'reveal'],
  },

  // ── INTERACTIVE ──────────────────────────────────────────────────────────

  'quiz-interactive': {
    id: 'quiz-interactive',
    name: 'Quiz / Interactive',
    description: 'Interactive quiz or poll with timer, options, and reveal animation.',
    category: 'interactive',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'Question audio' },
      { type: 'kinetic-text', required: true, order: 2, description: 'Question + options display' },
      { type: 'timer-overlay', required: true, order: 3, description: 'Countdown timer' },
      { type: 'tts', required: true, order: 4, description: 'Answer reveal audio' },
      { type: 'sfx', required: false, order: 5, description: 'Correct/incorrect SFX' },
    ],
    allowedProducts: ['mind', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'slide',
    defaultTransitionOut: 'slide',
    durationRange: { min: 10, max: 45 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'playful',
    source: 'core',
    icon: '❓',
    tags: ['quiz', 'interactive', 'poll', 'engagement', 'gamification'],
  },

  // ── TRANSITION / BRANDING ─────────────────────────────────────────────────

  'title-card': {
    id: 'title-card',
    name: 'Title Card',
    description: 'Animated title/branding card with music — opens or introduces a segment.',
    category: 'branding',
    steps: [
      { type: 'music', required: true, order: 1, description: 'Intro music' },
      { type: 'kinetic-text', required: true, order: 2, description: 'Title animation' },
      { type: 'motion-graphics', required: false, order: 3, description: 'Brand motion elements' },
    ],
    allowedProducts: ['spark', 'mind', 'deck', 'vibe', 'arc', 'hub', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'fade',
    defaultTransitionOut: 'dissolve',
    durationRange: { min: 3, max: 15 },
    minSpeakers: 0,
    maxSpeakers: 0,
    defaultTone: 'inspiring',
    source: 'core',
    icon: '🎬',
    tags: ['title', 'branding', 'intro', 'opener'],
  },

  'montage-reel': {
    id: 'montage-reel',
    name: 'Montage Reel',
    description: 'Rapid sequence of images or clips with music — energetic compilation.',
    category: 'transition',
    steps: [
      { type: 'music', required: true, order: 1, description: 'Montage music' },
      { type: 'image', required: true, order: 2, description: 'Montage images (multiple)' },
      { type: 'transition', required: true, order: 3, description: 'Rapid transitions between clips' },
      { type: 'kinetic-text', required: false, order: 4, description: 'Overlay text/captions' },
    ],
    allowedProducts: ['spark', 'vibe', 'arc', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'cut',
    defaultTransitionOut: 'cut',
    durationRange: { min: 5, max: 30 },
    minSpeakers: 0,
    maxSpeakers: 0,
    defaultTone: 'celebratory',
    source: 'core',
    icon: '🎞️',
    tags: ['montage', 'reel', 'compilation', 'highlights'],
  },

  'musical-interlude': {
    id: 'musical-interlude',
    name: 'Musical Interlude',
    description: 'Music-only segment with optional motion graphics — used as a breathing pause or transition.',
    category: 'transition',
    steps: [
      { type: 'music', required: true, order: 1, description: 'Interlude music' },
      { type: 'motion-graphics', required: false, order: 2, description: 'Ambient visuals' },
    ],
    allowedProducts: ['spark', 'mind', 'deck', 'vibe', 'arc', 'hub', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'fade',
    defaultTransitionOut: 'fade',
    durationRange: { min: 3, max: 15 },
    minSpeakers: 0,
    maxSpeakers: 0,
    defaultTone: 'nostalgic',
    source: 'core',
    icon: '🎵',
    tags: ['music', 'interlude', 'pause', 'breathing'],
  },

  'cta-outro': {
    id: 'cta-outro',
    name: 'CTA / Outro',
    description: 'Call-to-action with clickable links, narration, and closing branding.',
    category: 'branding',
    steps: [
      { type: 'tts', required: true, order: 1, description: 'CTA narration' },
      { type: 'kinetic-text', required: true, order: 2, description: 'CTA text animation' },
      { type: 'links-overlay', required: true, order: 3, description: 'Clickable links' },
      { type: 'music', required: false, order: 4, description: 'Outro music' },
    ],
    allowedProducts: ['spark', 'mind', 'deck', 'vibe', 'arc', 'hub', 'cast'],
    defaultLayout: 'fullscreen',
    defaultTransitionIn: 'dissolve',
    defaultTransitionOut: 'fade',
    durationRange: { min: 5, max: 30 },
    minSpeakers: 1,
    maxSpeakers: 1,
    defaultTone: 'inspiring',
    source: 'core',
    icon: '📢',
    tags: ['cta', 'outro', 'closing', 'call-to-action', 'links'],
  },
};

// ─── REGISTRY API ─────────────────────────────────────────────────────────────

/** Get a scene type by ID (core or custom) */
export function getSceneType(id: string): SceneTypeDefinition | undefined {
  return CORE_SCENE_TYPES[id];
}

/** Get all scene types available for a product */
export function getSceneTypesForProduct(product: GenieProduct): SceneTypeDefinition[] {
  return Object.values(CORE_SCENE_TYPES).filter(st =>
    st.allowedProducts.includes(product)
  );
}

/** Get scene types by category */
export function getSceneTypesByCategory(category: SceneCategory): SceneTypeDefinition[] {
  return Object.values(CORE_SCENE_TYPES).filter(st => st.category === category);
}

/** Get required pipeline steps for a scene type */
export function getRequiredSteps(sceneTypeId: string): PipelineStep[] {
  const sceneType = CORE_SCENE_TYPES[sceneTypeId];
  if (!sceneType) return [];
  return sceneType.steps.filter(s => s.required).sort((a, b) => a.order - b.order);
}

/** Get all pipeline steps for a scene type (required + optional) */
export function getAllSteps(sceneTypeId: string): PipelineStep[] {
  const sceneType = CORE_SCENE_TYPES[sceneTypeId];
  if (!sceneType) return [];
  return [...sceneType.steps].sort((a, b) => a.order - b.order);
}

/** Convert scene type steps to orchestrator pipeline format */
export function sceneTypeToOrchestratorSteps(
  sceneTypeId: string,
  config: Record<string, unknown> = {},
): Array<Record<string, unknown>> {
  const steps = getAllSteps(sceneTypeId);
  return steps.map(step => ({
    type: step.type,
    ...step.defaultConfig,
    ...config,
  }));
}

/** Get all core scene type IDs */
export function getAllSceneTypeIds(): string[] {
  return Object.keys(CORE_SCENE_TYPES);
}

/** Get all categories with their scene types */
export function getSceneTypesByCategories(): Record<SceneCategory, SceneTypeDefinition[]> {
  const categories: SceneCategory[] = ['narrative', 'demonstration', 'data', 'interactive', 'transition', 'branding'];
  const result: Record<string, SceneTypeDefinition[]> = {};
  for (const cat of categories) {
    result[cat] = getSceneTypesByCategory(cat);
  }
  return result as Record<SceneCategory, SceneTypeDefinition[]>;
}

/** Validate if a scene type is compatible with a product */
export function validateSceneForProduct(sceneTypeId: string, product: GenieProduct): { valid: boolean; reason?: string } {
  const sceneType = CORE_SCENE_TYPES[sceneTypeId];
  if (!sceneType) return { valid: false, reason: `Unknown scene type: ${sceneTypeId}` };
  if (!sceneType.allowedProducts.includes(product)) {
    return { valid: false, reason: `Scene type "${sceneType.name}" is not available for ${product}. Allowed: ${sceneType.allowedProducts.join(', ')}` };
  }
  return { valid: true };
}

/** Search scene types by tag or name */
export function searchSceneTypes(query: string): SceneTypeDefinition[] {
  const lower = query.toLowerCase();
  return Object.values(CORE_SCENE_TYPES).filter(st =>
    st.name.toLowerCase().includes(lower) ||
    st.description.toLowerCase().includes(lower) ||
    st.tags.some(tag => tag.includes(lower))
  );
}
