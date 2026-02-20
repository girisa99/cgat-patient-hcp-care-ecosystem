/**
 * UNIVERSAL SCRIPT SCHEMA
 * 
 * Product-agnostic script authoring contract for ALL Genie Suite products.
 * Replaces hardcoded EP04 ScriptLine with a dynamic, region-aware schema
 * that the universal-scene-orchestrator can consume.
 * 
 * Every product (Spark, Mind, Deck, Vibe, Arc, Hub, Cast) generates
 * UniversalScriptLine[] which feeds into the orchestrator with full
 * richness: direction, motion, sfx, lipsync, visual_ref, links,
 * emotional tone, and cultural traits from the regional registry.
 * 
 * @see src/config/scene-type-registry.ts — valid scene→step combos
 * @see supabase/functions/universal-scene-orchestrator/index.ts — executor
 */

// ─── CORE TYPES ────────────────────────────────────────────────────────────────

/** Genie Suite product identifiers */
export type GenieProduct = 'spark' | 'mind' | 'deck' | 'vibe' | 'arc' | 'hub' | 'cast';

/** Emotional tone applied to script direction and TTS tuning */
export type EmotionalTone =
  | 'inspiring' | 'educational' | 'dramatic' | 'playful'
  | 'urgent' | 'conversational' | 'authoritative' | 'empathetic'
  | 'celebratory' | 'mysterious' | 'nostalgic' | 'provocative';

/** Script purpose — determines pacing and structure constraints */
export type ScriptPurpose =
  | 'social-short'     // Spark: 15-60s
  | 'explainer'        // Mind: 2-10min educational
  | 'presentation'     // Deck: slide-per-scene
  | 'podcast'          // Cast: long-form conversational
  | 'webcast'          // Cast: live broadcast
  | 'interview'        // Cast: 2+ speakers
  | 'tutorial'         // Mind/Cast: step-by-step
  | 'product-demo'     // Spark/Deck: feature walkthrough
  | 'testimonial'      // Spark: customer story
  | 'promo'            // Spark: marketing
  | 'documentary'      // Cast: narrative
  | 'training';        // Mind: corporate L&D

// ─── CULTURAL & REGIONAL ENRICHMENT ────────────────────────────────────────────

/** Cultural traits injected from the regional registry (82+ regions) */
export interface CulturalTraits {
  /** Character wardrobe (e.g., "silk kurta", "thobe", "business casual") */
  wardrobe?: string;
  /** Animal/object companion (e.g., "peacock", "merlion", "owl") */
  companion?: string;
  /** Setting/backdrop (e.g., "Bangalore tech park", "Dubai skyline") */
  setting?: string;
  /** Art style preference (e.g., "Madhubani", "ukiyo-e", "minimalist") */
  artStyle?: string;
  /** Color palette hint (e.g., "saffron-green", "desert-gold") */
  colorPalette?: string;
  /** Music genre/instrument hint (e.g., "tabla", "oud", "shamisen") */
  musicHint?: string;
  /** Greeting/sign-off convention */
  greeting?: string;
  /** RTL text direction */
  isRTL?: boolean;
}

// ─── VOICE CONFIGURATION ──────────────────────────────────────────────────────

/** Dynamic voice routing — passed per character, not hardcoded */
export interface VoiceConfig {
  /** Primary TTS provider */
  provider: 'elevenlabs' | 'azure' | 'alibaba' | 'google' | 'openai';
  /** Voice ID on the primary provider */
  voiceId: string;
  /** Fallback provider if primary fails */
  fallbackProvider?: string;
  /** Fallback voice ID */
  fallbackVoice?: string;
  /** Stability (ElevenLabs) */
  stability?: number;
  /** Similarity boost (ElevenLabs) */
  similarityBoost?: number;
  /** Speaking speed multiplier */
  speed?: number;
  /** SSML rate (Azure) */
  rate?: string;
  /** SSML pitch (Azure) */
  pitch?: string;
  /** Language/locale code (BCP47) */
  locale?: string;
}

// ─── SCRIPT LINE (the core unit) ──────────────────────────────────────────────

/** A single line/segment of script — the atomic unit of production */
export interface UniversalScriptLine {
  /** Unique key (e.g., "scene-0-intro", "s3-atlas-explains") */
  key: string;
  /** The exact text for TTS rendering */
  text: string;
  /** Character/voice key — maps to voiceRouting in orchestrator payload */
  voice: string;
  /** Scene this line belongs to */
  scene: string;
  /** Estimated duration in seconds (at ~150 wpm) */
  durationEst: number;
  /** Performance/delivery direction for TTS tuning */
  direction: string;

  // ── Production Flags ──
  /** Enable lip-sync generation for this line */
  lipsync?: boolean;
  /** SFX cues to trigger during/after this line */
  sfx?: string[];
  /** Motion/animation cue for the character */
  motion?: string;
  /** Visual reference tag (e.g., "architecture-diagram", "upi-qr-scan") */
  visualRef?: string;
  /** Is this an interruption/interjection? */
  isInterruption?: boolean;

  // ── CTA & Interactive ──
  /** Clickable links for CTA scenes */
  links?: Array<{ label: string; url: string; type: 'cta' | 'reference' | 'social' | 'download' }>;
  /** Quiz/poll data for interactive scenes */
  interactive?: {
    type: 'quiz' | 'poll' | 'prompt';
    question?: string;
    options?: string[];
    correctIndex?: number;
    timerSeconds?: number;
  };

  // ── Regional & Cultural ──
  /** Emotional tone for this specific line */
  emotionalTone?: EmotionalTone;
  /** Cultural traits (from regional registry enrichment) */
  culturalTraits?: CulturalTraits;
  /** Region code (e.g., "INDIA_SOUTH", "MENA_UAE") */
  regionCode?: string;

  // ── Metadata ──
  /** Custom metadata for product-specific needs */
  metadata?: Record<string, unknown>;
}

// ─── SCENE DEFINITION ─────────────────────────────────────────────────────────

/** Scene-level definition — groups script lines with production config */
export interface UniversalSceneDefinition {
  /** Scene ID (e.g., "scene-0-title", "scene-3-demo") */
  id: string;
  /** Human-readable title */
  title: string;
  /** Scene type from the registry (e.g., "talking-head", "product-demo") */
  sceneType: string;
  /** Ordered script line keys belonging to this scene */
  scriptKeys: string[];
  /** Total estimated duration (sum of line durations + transitions) */
  durationEst: number;

  // ── A/V Configuration ──
  /** Background music config for this scene */
  music?: {
    prompt?: string;
    trackUrl?: string;
    volume?: number;       // 0-1
    fadeIn?: number;       // seconds
    fadeOut?: number;
    loop?: boolean;
  };
  /** Scene-level SFX (ambient, transitions) */
  sfx?: Array<{
    prompt: string;
    timing: 'start' | 'end' | 'loop' | 'with-line';
    lineKey?: string;      // if timing='with-line'
    duration?: number;
  }>;

  // ── Visual Configuration ──
  /** Transition type into this scene */
  transitionIn?: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'slide';
  /** Transition type out of this scene */
  transitionOut?: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'slide';
  /** Layout template for multi-speaker scenes */
  layout?: 'fullscreen' | 'split-screen' | 'pip' | 'side-by-side' | 'grid';
  /** Lower-third text overlay */
  lowerThird?: string;

  // ── Regional ──
  /** Scene-level cultural override (if different from episode) */
  culturalTraits?: CulturalTraits;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

// ─── CHARACTER DEFINITION ─────────────────────────────────────────────────────

/** Character/persona definition — reusable across episodes and products */
export interface UniversalCharacter {
  /** Character key (e.g., "host", "atlas", "nova") */
  key: string;
  /** Display name */
  name: string;
  /** Role description */
  role: string;
  /** Voice configuration */
  voice: VoiceConfig;

  // ── Visual Identity ──
  /** 3D avatar generation prompt (Pixar-style, etc.) */
  avatarPrompt?: string;
  /** Avatar style */
  avatarStyle?: 'pixar-3d' | 'anime' | 'realistic' | 'cartoon' | 'chibi' | 'flat-design';
  /** Character props */
  props?: string[];
  /** Motion style (how they move) */
  motionStyle?: 'measured' | 'expressive' | 'direct' | 'calm' | 'energetic' | 'reserved';
  /** Companion creature/object */
  companion?: { name: string; description: string };
  /** Brand color for character UI elements */
  brandColor?: string;

  // ── Regional Variants ──
  /** Regional wardrobe overrides */
  regionalWardrobe?: Record<string, string>;
  /** Regional name variants */
  regionalNames?: Record<string, string>;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

// ─── EPISODE MANIFEST ─────────────────────────────────────────────────────────

/** Complete episode/content manifest — the top-level production contract */
export interface UniversalEpisodeManifest {
  /** Unique episode/content ID */
  id: string;
  /** Title */
  title: string;
  /** Subtitle/tagline */
  subtitle?: string;
  /** Product this was created for */
  product: GenieProduct;
  /** Script purpose — determines constraints */
  purpose: ScriptPurpose;
  /** Target language (BCP47) */
  language: string;
  /** Region code from regional registry */
  regionCode?: string;

  // ── Content ──
  /** Ordered scene definitions */
  scenes: UniversalSceneDefinition[];
  /** All script lines (keyed by UniversalScriptLine.key) */
  scriptLines: Record<string, UniversalScriptLine>;
  /** Character definitions used in this episode */
  characters: UniversalCharacter[];

  // ── Production Config ──
  /** Voice routing map (character key → VoiceConfig) for orchestrator */
  voiceRouting: Record<string, VoiceConfig>;
  /** Storage paths for the orchestrator */
  storagePaths: {
    bucket: string;
    ttsPrefix: string;
    musicPrefix: string;
    sfxPrefix: string;
    screenshotBucket: string;
    screenshotPattern: string;
  };

  // ── Constraints ──
  /** Max total duration in seconds (product-specific) */
  maxDurationSeconds?: number;
  /** Max number of scenes (product-specific) */
  maxScenes?: number;
  /** Target speaking rate (words per minute) */
  targetWPM?: number;

  // ── Cultural ──
  /** Episode-level cultural traits (inherited by all scenes/lines unless overridden) */
  culturalTraits?: CulturalTraits;
  /** Emotional arc for the episode */
  emotionalArc?: EmotionalTone[];

  // ── Metadata ──
  /** Creation timestamp */
  createdAt?: string;
  /** Last modified */
  updatedAt?: string;
  /** Creator user ID */
  createdBy?: string;
  /** Version number */
  version?: number;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

// ─── PRODUCT CONSTRAINTS ──────────────────────────────────────────────────────

/** Product-specific constraints for the adapter layer */
export interface ProductConstraints {
  product: GenieProduct;
  maxDurationSeconds: number;
  maxScenes: number;
  targetWPM: number;
  allowedSceneTypes: string[];
  allowedPurposes: ScriptPurpose[];
  /** Whether the product supports multi-character scenes */
  multiCharacter: boolean;
  /** Whether the product supports interactive elements */
  interactive: boolean;
  /** Whether the product supports lip-sync */
  lipsync: boolean;
  /** Default emotional tone */
  defaultTone: EmotionalTone;
}

/** Default constraints per product */
export const PRODUCT_CONSTRAINTS: Record<GenieProduct, ProductConstraints> = {
  spark: {
    product: 'spark',
    maxDurationSeconds: 60,
    maxScenes: 5,
    targetWPM: 160,
    allowedSceneTypes: ['title-card', 'talking-head', 'product-demo', 'montage-reel', 'cta-outro', 'before-after', 'testimonial'],
    allowedPurposes: ['social-short', 'promo', 'product-demo', 'testimonial'],
    multiCharacter: false,
    interactive: false,
    lipsync: true,
    defaultTone: 'inspiring',
  },
  mind: {
    product: 'mind',
    maxDurationSeconds: 600,
    maxScenes: 15,
    targetWPM: 140,
    allowedSceneTypes: ['title-card', 'talking-head', 'whiteboard-explainer', 'data-viz-narrative', 'quiz-interactive', 'map-journey', 'cta-outro', 'code-walkthrough'],
    allowedPurposes: ['explainer', 'tutorial', 'training'],
    multiCharacter: true,
    interactive: true,
    lipsync: true,
    defaultTone: 'educational',
  },
  deck: {
    product: 'deck',
    maxDurationSeconds: 1200,
    maxScenes: 30,
    targetWPM: 130,
    allowedSceneTypes: ['title-card', 'talking-head', 'data-viz-narrative', 'before-after', '3d-showcase', 'screen-capture-vo', 'cta-outro', 'code-walkthrough', 'product-demo'],
    allowedPurposes: ['presentation', 'product-demo', 'training'],
    multiCharacter: true,
    interactive: false,
    lipsync: true,
    defaultTone: 'authoritative',
  },
  vibe: {
    product: 'vibe',
    maxDurationSeconds: 3600,
    maxScenes: 50,
    targetWPM: 150,
    allowedSceneTypes: ['title-card', 'talking-head', 'b-roll-narration', 'montage-reel', 'musical-interlude', 'screen-capture-vo', 'cta-outro'],
    allowedPurposes: ['podcast', 'webcast', 'interview', 'documentary'],
    multiCharacter: true,
    interactive: false,
    lipsync: true,
    defaultTone: 'conversational',
  },
  arc: {
    product: 'arc',
    maxDurationSeconds: 300,
    maxScenes: 10,
    targetWPM: 150,
    allowedSceneTypes: ['title-card', 'talking-head', 'montage-reel', 'b-roll-narration', 'cta-outro'],
    allowedPurposes: ['social-short', 'promo'],
    multiCharacter: false,
    interactive: false,
    lipsync: true,
    defaultTone: 'playful',
  },
  hub: {
    product: 'hub',
    maxDurationSeconds: 600,
    maxScenes: 20,
    targetWPM: 150,
    allowedSceneTypes: ['title-card', 'talking-head', 'screen-capture-vo', 'product-demo', 'data-viz-narrative', 'cta-outro'],
    allowedPurposes: ['product-demo', 'tutorial', 'explainer'],
    multiCharacter: true,
    interactive: false,
    lipsync: true,
    defaultTone: 'conversational',
  },
  cast: {
    product: 'cast',
    maxDurationSeconds: 5400,
    maxScenes: 100,
    targetWPM: 150,
    allowedSceneTypes: [
      'title-card', 'talking-head', 'split-screen-debate', 'interview-2shot',
      'screen-capture-vo', 'product-demo', 'whiteboard-explainer', 'data-viz-narrative',
      'montage-reel', 'b-roll-narration', 'quiz-interactive', 'before-after',
      'testimonial', 'code-walkthrough', '3d-showcase', 'map-journey',
      'musical-interlude', 'cta-outro',
    ],
    allowedPurposes: ['podcast', 'webcast', 'interview', 'tutorial', 'documentary', 'product-demo', 'training'],
    multiCharacter: true,
    interactive: true,
    lipsync: true,
    defaultTone: 'conversational',
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Get product constraints */
export function getProductConstraints(product: GenieProduct): ProductConstraints {
  return PRODUCT_CONSTRAINTS[product];
}

/** Check if a scene type is allowed for a product */
export function isSceneTypeAllowed(product: GenieProduct, sceneType: string): boolean {
  return PRODUCT_CONSTRAINTS[product].allowedSceneTypes.includes(sceneType);
}

/** Calculate total duration of a manifest */
export function calculateManifestDuration(manifest: UniversalEpisodeManifest): number {
  return Object.values(manifest.scriptLines).reduce((sum, line) => sum + line.durationEst, 0);
}

/** Validate manifest against product constraints */
export function validateManifest(manifest: UniversalEpisodeManifest): { valid: boolean; errors: string[] } {
  const constraints = PRODUCT_CONSTRAINTS[manifest.product];
  const errors: string[] = [];

  const totalDuration = calculateManifestDuration(manifest);
  if (totalDuration > constraints.maxDurationSeconds) {
    errors.push(`Duration ${totalDuration}s exceeds max ${constraints.maxDurationSeconds}s for ${manifest.product}`);
  }

  if (manifest.scenes.length > constraints.maxScenes) {
    errors.push(`${manifest.scenes.length} scenes exceeds max ${constraints.maxScenes} for ${manifest.product}`);
  }

  for (const scene of manifest.scenes) {
    if (!constraints.allowedSceneTypes.includes(scene.sceneType)) {
      errors.push(`Scene type "${scene.sceneType}" not allowed for ${manifest.product}`);
    }
  }

  if (!constraints.allowedPurposes.includes(manifest.purpose)) {
    errors.push(`Purpose "${manifest.purpose}" not allowed for ${manifest.product}`);
  }

  return { valid: errors.length === 0, errors };
}

/** Convert manifest to orchestrator payload format */
export function manifestToOrchestratorPayload(manifest: UniversalEpisodeManifest) {
  // Build scriptContent map — include ALL richness fields for orchestrator
  const scriptContent: Record<string, {
    text: string;
    direction?: string;
    lipsync?: boolean;
    sfx?: string[];
    motion?: string;
    visualRef?: string;
    emotionalTone?: string;
    culturalTraits?: CulturalTraits;
    regionCode?: string;
  }> = {};
  for (const [key, line] of Object.entries(manifest.scriptLines)) {
    scriptContent[key] = {
      text: line.text,
      direction: line.direction,
      lipsync: line.lipsync,
      sfx: line.sfx,
      motion: line.motion,
      visualRef: line.visualRef,
      emotionalTone: line.emotionalTone,
      culturalTraits: line.culturalTraits,
      regionCode: line.regionCode,
    };
  }

  // Build scenePipelines from scene definitions + registry
  const scenePipelines: Record<string, Array<Record<string, unknown>>> = {};
  for (const scene of manifest.scenes) {
    const steps: Array<Record<string, unknown>> = [];
    for (const lineKey of scene.scriptKeys) {
      const line = manifest.scriptLines[lineKey];
      if (!line) continue;
      steps.push({
        type: 'tts',
        voice: line.voice,
        scriptKey: lineKey,
      });
      if (line.lipsync) {
        steps.push({
          type: 'avatar-lipsync',
          character: line.voice,
          provider: 'alibaba',
        });
      }
    }
    scenePipelines[scene.id] = steps;
  }

  // Build voiceRouting from characters
  const voiceRouting: Record<string, unknown> = {};
  for (const char of manifest.characters) {
    voiceRouting[char.key] = {
      provider: char.voice.provider,
      voiceId: char.voice.voiceId,
      fallbackProvider: char.voice.fallbackProvider || 'alibaba',
      fallbackVoice: char.voice.fallbackVoice || 'longxiaochun',
      stability: char.voice.stability,
      similarityBoost: char.voice.similarityBoost,
      speed: char.voice.speed,
      rate: char.voice.rate,
      pitch: char.voice.pitch,
    };
  }

  // Build music score
  const musicScore: Record<string, unknown> = {};
  for (const scene of manifest.scenes) {
    if (scene.music || scene.sfx) {
      musicScore[scene.id] = {
        music: scene.music,
        sfx: scene.sfx,
      };
    }
  }

  return {
    productId: manifest.product,
    episodeId: manifest.id,
    scenes: manifest.scenes.map(s => s.id),
    scriptContent,
    scenePipelines,
    musicScore,
    voiceRouting,
    storagePaths: manifest.storagePaths,
  };
}

// ─── TRANSCREATION TYPES ────────────────────────────────────────────────────

/** Transcreated manifest — one source manifest → N regional versions */
export interface TranscreatedManifest {
  /** Source manifest (original language/region) */
  sourceManifest: UniversalEpisodeManifest;
  /** Transcreated versions keyed by region code */
  regionalVersions: Record<string, UniversalEpisodeManifest>;
  /** Transcreation audit log */
  transcreationLog: Array<{
    regionCode: string;
    provider: string;
    adaptationLevel: 'light' | 'moderate' | 'deep';
    timestamp: string;
    lineCount: number;
  }>;
}
