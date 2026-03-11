/**
 * PROJECT PIPELINE GENERATOR
 *
 * Generates a complete Cast production pipeline from high-level project config.
 * Replaces EP04-hardcoded scene pipelines, transitions, bookends, and music
 * with dynamically generated configurations based on:
 *   - industry (healthcare, tech, finance, education, ...)
 *   - format (documentary, explainer, podcast, social-clip, product-demo, ...)
 *   - tone (professional, casual, cinematic, educational, dramatic, ...)
 *   - target audience, duration, quality, language/region
 *
 * Uses scene-type-registry.ts to map format → scene types → pipeline steps.
 *
 * @see src/config/scene-type-registry.ts — scene types + step definitions
 * @see src/config/universal-script-schema.ts — script contract
 * @see src/config/scriptTemplates.ts — industry × format templates
 * @see src/config/musicAutoComposer.ts — industry → music config
 */

import type {
  UniversalSceneDefinition,
  UniversalCharacter,
  VoiceConfig,
  EmotionalTone,
  ScriptPurpose,
  GenieProduct,
} from '@/config/universal-script-schema';
import type { SceneTypeDefinition } from '@/config/scene-type-registry';
import { CORE_SCENE_TYPES, getSceneType } from '@/config/scene-type-registry';
import { composeMusicPrompt, composeSfxPrompts, type MusicComposition } from '@/config/musicAutoComposer';

// ─── PROJECT CONFIGURATION ──────────────────────────────────────────────────

export type CastIndustry =
  | 'healthcare' | 'pharma' | 'tech' | 'finance' | 'education'
  | 'entertainment' | 'food' | 'fashion' | 'real-estate' | 'automotive'
  | 'travel' | 'fitness' | 'legal' | 'nonprofit' | 'government' | 'general';

export type CastFormat =
  | 'documentary' | 'explainer' | 'podcast' | 'social-clip' | 'product-demo'
  | 'training' | 'testimonial' | 'interview' | 'presentation' | 'promo'
  | 'webcast' | 'tutorial';

export type CastTone =
  | 'professional' | 'casual' | 'cinematic' | 'educational' | 'dramatic'
  | 'playful' | 'inspiring' | 'authoritative' | 'empathetic' | 'conversational';

export type CastQuality = 'draft' | 'production' | 'cinematic';

export type CastAudience =
  | 'hcp' | 'consumer' | 'enterprise' | 'student' | 'developer'
  | 'investor' | 'patient' | 'general';

/** Full project configuration — the input to the pipeline generator */
export interface CastProjectConfig {
  /** Project ID (from DB or generated) */
  projectId: string;
  /** Project title */
  title: string;
  /** Industry vertical */
  industry: CastIndustry;
  /** Content format */
  format: CastFormat;
  /** Narrative tone */
  tone: CastTone;
  /** Target audience persona */
  targetAudience: CastAudience;
  /** Base language (BCP47) */
  baseLanguage: string;
  /** Target languages for localization */
  targetLanguages: string[];
  /** Output quality tier */
  quality: CastQuality;
  /** Target duration in seconds */
  durationTarget: number;
  /** Number of scenes (auto-calculated if not provided) */
  sceneCount?: number;
  /** Number of characters/speakers */
  speakerCount: number;
  /** Visual style family */
  styleFamily?: string;
  /** Region code for cultural adaptation */
  regionCode?: string;
  /** Brand profile for enrichment */
  brandProfile?: Record<string, unknown>;
  /** User's raw prompt/description */
  userPrompt?: string;
}

// ─── GENERATED PIPELINE ─────────────────────────────────────────────────────

/** A transition between two scenes */
export interface PipelineTransition {
  from: string;
  to: string;
  style: 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'slide' | 'cut';
  duration: number;
  sfxPrompt?: string;
}

/** Bookend config (opening + closing sequences) */
export interface PipelineBookends {
  opening: {
    duration: number;
    title: string;
    subtitle?: string;
    brand?: string;
    musicPrompt: string;
    sfxPrompt?: string;
    transitionStyle: string;
  };
  closing: {
    duration: number;
    title: string;
    subtitle?: string;
    brand?: string;
    musicPrompt: string;
    sfxPrompt?: string;
    ctaText?: string;
  };
}

/** Complete generated pipeline — everything needed to produce a video */
export interface GeneratedPipeline {
  /** Project config that produced this pipeline */
  config: CastProjectConfig;
  /** Scene definitions with pipeline steps */
  scenes: UniversalSceneDefinition[];
  /** Transitions between scenes */
  transitions: PipelineTransition[];
  /** Opening and closing bookends */
  bookends: PipelineBookends;
  /** Music config per scene */
  musicConfig: Record<string, MusicComposition>;
  /** Default voice routing (can be overridden per character) */
  voiceDefaults: Record<string, Partial<VoiceConfig>>;
  /** Suggested characters based on format + speaker count */
  suggestedCharacters: Partial<UniversalCharacter>[];
  /** Script purpose mapped from format */
  scriptPurpose: ScriptPurpose;
  /** Emotional arc for the narrative */
  emotionalArc: EmotionalArc;
  /** Estimated total duration */
  estimatedDuration: number;
}

/** Emotional arc across the production */
export interface EmotionalArc {
  acts: Array<{
    name: string;
    scenes: string[];
    mood: EmotionalTone;
    tempo: string;
    intensity: number;
  }>;
}

// ─── FORMAT → SCENE TYPE MAPPING ────────────────────────────────────────────

/** Maps format to the scene types that should be used */
const FORMAT_SCENE_MAP: Record<CastFormat, string[]> = {
  'documentary':   ['title-card', 'b-roll-narration', 'talking-head', 'data-viz-narrative', 'testimonial', 'montage-reel', 'cta-outro'],
  'explainer':     ['title-card', 'talking-head', 'whiteboard-explainer', 'screen-capture-vo', 'data-viz-narrative', 'cta-outro'],
  'podcast':       ['title-card', 'talking-head', 'split-screen-debate', 'b-roll-narration', 'cta-outro'],
  'social-clip':   ['title-card', 'talking-head', 'cta-outro'],
  'product-demo':  ['title-card', 'talking-head', 'product-demo', 'screen-capture-vo', 'data-viz-narrative', 'cta-outro'],
  'training':      ['title-card', 'talking-head', 'whiteboard-explainer', 'screen-capture-vo', 'quiz-interactive', 'cta-outro'],
  'testimonial':   ['title-card', 'testimonial', 'b-roll-narration', 'cta-outro'],
  'interview':     ['title-card', 'interview-2shot', 'b-roll-narration', 'cta-outro'],
  'presentation':  ['title-card', 'talking-head', 'data-viz-narrative', 'screen-capture-vo', 'cta-outro'],
  'promo':         ['title-card', 'montage-reel', 'talking-head', 'cta-outro'],
  'webcast':       ['title-card', 'talking-head', 'screen-capture-vo', 'split-screen-debate', 'cta-outro'],
  'tutorial':      ['title-card', 'talking-head', 'screen-capture-vo', 'code-walkthrough', 'cta-outro'],
};

// ─── FORMAT → SCRIPT PURPOSE MAPPING ────────────────────────────────────────

const FORMAT_PURPOSE_MAP: Record<CastFormat, ScriptPurpose> = {
  'documentary':  'documentary',
  'explainer':    'explainer',
  'podcast':      'podcast',
  'social-clip':  'social-short',
  'product-demo': 'product-demo',
  'training':     'training',
  'testimonial':  'testimonial',
  'interview':    'interview',
  'presentation': 'presentation',
  'promo':        'promo',
  'webcast':      'webcast',
  'tutorial':     'tutorial',
};

// ─── TONE → EMOTIONAL TONE MAPPING ─────────────────────────────────────────

const TONE_EMOTION_MAP: Record<CastTone, EmotionalTone> = {
  'professional':    'authoritative',
  'casual':          'conversational',
  'cinematic':       'dramatic',
  'educational':     'educational',
  'dramatic':        'dramatic',
  'playful':         'playful',
  'inspiring':       'inspiring',
  'authoritative':   'authoritative',
  'empathetic':      'empathetic',
  'conversational':  'conversational',
};

// ─── FORMAT → TRANSITION STYLE MAPPING ──────────────────────────────────────

const FORMAT_TRANSITION_MAP: Record<CastFormat, Array<'fade' | 'dissolve' | 'wipe' | 'zoom' | 'slide' | 'cut'>> = {
  'documentary':   ['dissolve', 'fade', 'wipe'],
  'explainer':     ['fade', 'slide', 'dissolve'],
  'podcast':       ['cut', 'fade'],
  'social-clip':   ['cut', 'zoom', 'slide'],
  'product-demo':  ['slide', 'dissolve', 'fade'],
  'training':      ['fade', 'slide', 'wipe'],
  'testimonial':   ['dissolve', 'fade'],
  'interview':     ['cut', 'dissolve'],
  'presentation':  ['slide', 'fade', 'wipe'],
  'promo':         ['zoom', 'slide', 'cut'],
  'webcast':       ['cut', 'fade'],
  'tutorial':      ['slide', 'fade', 'dissolve'],
};

// ─── QUALITY → PROVIDER ROUTING ─────────────────────────────────────────────

export interface QualityProviderMap {
  imageProvider: string;
  videoProvider: string;
  ttsProvider: string;
  musicProvider: string;
}

const QUALITY_PROVIDER_MAP: Record<CastQuality, QualityProviderMap> = {
  draft: {
    imageProvider: 'flux-schnell',
    videoProvider: 'animatediff',
    ttsProvider: 'azure',
    musicProvider: 'modelslab',
  },
  production: {
    imageProvider: 'flux-pro',
    videoProvider: 'alibaba-wan2.6-t2v',
    ttsProvider: 'elevenlabs',
    musicProvider: 'modelslab',
  },
  cinematic: {
    imageProvider: 'flux-pro',
    videoProvider: 'alibaba-wan2.6-t2v',
    ttsProvider: 'elevenlabs',
    musicProvider: 'modelslab',
  },
};

// ─── AUDIENCE → VOICE STYLE MAPPING ─────────────────────────────────────────

const AUDIENCE_VOICE_MAP: Record<CastAudience, { style: string; speed: number; formality: 'formal' | 'semi-formal' | 'casual' }> = {
  hcp:        { style: 'professional',    speed: 0.95, formality: 'formal' },
  enterprise: { style: 'authoritative',   speed: 0.95, formality: 'formal' },
  investor:   { style: 'authoritative',   speed: 0.90, formality: 'formal' },
  consumer:   { style: 'conversational',  speed: 1.00, formality: 'semi-formal' },
  student:    { style: 'educational',     speed: 0.95, formality: 'semi-formal' },
  developer:  { style: 'conversational',  speed: 1.05, formality: 'casual' },
  patient:    { style: 'empathetic',      speed: 0.90, formality: 'semi-formal' },
  general:    { style: 'conversational',  speed: 1.00, formality: 'semi-formal' },
};

// ─── PIPELINE GENERATOR ─────────────────────────────────────────────────────

/**
 * Calculate optimal scene count based on format + duration.
 * Rule of thumb: ~15-20s per scene for fast formats, ~25-40s for slow.
 */
function calculateSceneCount(format: CastFormat, durationTarget: number): number {
  const secondsPerScene: Record<CastFormat, number> = {
    'social-clip':   8,
    'promo':        12,
    'explainer':    20,
    'product-demo': 20,
    'training':     25,
    'tutorial':     25,
    'testimonial':  25,
    'presentation': 20,
    'interview':    30,
    'podcast':      40,
    'documentary':  30,
    'webcast':      30,
  };

  const avgDuration = secondsPerScene[format] || 20;
  const raw = Math.round(durationTarget / avgDuration);
  // Minimum 3 scenes (intro + body + outro), max 20
  return Math.max(3, Math.min(20, raw));
}

/**
 * Build the emotional arc based on scene count and tone.
 */
function buildEmotionalArc(
  sceneCount: number,
  tone: CastTone,
  sceneIds: string[]
): EmotionalArc {
  const baseTone = TONE_EMOTION_MAP[tone] || 'conversational';

  // 3-act structure for most formats, 4-act for longer
  if (sceneCount <= 4) {
    return {
      acts: [
        { name: 'Setup', scenes: sceneIds.slice(0, 1), mood: baseTone, tempo: '90-100 BPM', intensity: 0.5 },
        { name: 'Core', scenes: sceneIds.slice(1, -1), mood: baseTone, tempo: '100-110 BPM', intensity: 0.7 },
        { name: 'Close', scenes: sceneIds.slice(-1), mood: baseTone, tempo: '85-95 BPM', intensity: 0.4 },
      ],
    };
  }

  const q1 = Math.floor(sceneCount * 0.2);
  const q2 = Math.floor(sceneCount * 0.5);
  const q3 = Math.floor(sceneCount * 0.8);

  const moodProgression: EmotionalTone[] = {
    'authoritative': ['educational', 'authoritative', 'inspiring', 'authoritative'],
    'conversational': ['conversational', 'educational', 'playful', 'conversational'],
    'dramatic': ['mysterious', 'dramatic', 'inspiring', 'empathetic'],
    'educational': ['educational', 'authoritative', 'inspiring', 'educational'],
    'playful': ['playful', 'conversational', 'celebratory', 'playful'],
    'inspiring': ['mysterious', 'educational', 'inspiring', 'celebratory'],
    'empathetic': ['empathetic', 'educational', 'inspiring', 'empathetic'],
    'mysterious': ['mysterious', 'dramatic', 'inspiring', 'mysterious'],
    'provocative': ['provocative', 'dramatic', 'inspiring', 'conversational'],
    'celebratory': ['inspiring', 'dramatic', 'celebratory', 'empathetic'],
    'nostalgic': ['nostalgic', 'empathetic', 'inspiring', 'nostalgic'],
  }[baseTone as string] as EmotionalTone[] || ['conversational', 'educational', 'inspiring', 'conversational'];

  return {
    acts: [
      { name: 'Wonder', scenes: sceneIds.slice(0, q1), mood: moodProgression[0], tempo: '90-100 BPM', intensity: 0.5 },
      { name: 'Build', scenes: sceneIds.slice(q1, q2), mood: moodProgression[1], tempo: '100-115 BPM', intensity: 0.7 },
      { name: 'Climax', scenes: sceneIds.slice(q2, q3), mood: moodProgression[2], tempo: '110-125 BPM', intensity: 0.9 },
      { name: 'Resolve', scenes: sceneIds.slice(q3), mood: moodProgression[3], tempo: '85-95 BPM', intensity: 0.4 },
    ],
  };
}

/**
 * Generate transitions between scenes based on format and mood.
 */
function generateTransitions(
  scenes: UniversalSceneDefinition[],
  format: CastFormat,
  arc: EmotionalArc
): PipelineTransition[] {
  const styles = FORMAT_TRANSITION_MAP[format] || ['fade', 'dissolve'];
  const transitions: PipelineTransition[] = [];

  for (let i = 0; i < scenes.length - 1; i++) {
    const fromScene = scenes[i];
    const toScene = scenes[i + 1];

    // Pick transition based on mood shift
    const fromAct = arc.acts.find(a => a.scenes.includes(fromScene.id));
    const toAct = arc.acts.find(a => a.scenes.includes(toScene.id));
    const isActChange = fromAct?.name !== toAct?.name;

    // Act changes get more dramatic transitions, same-act gets subtle
    const style = isActChange
      ? styles[Math.min(1, styles.length - 1)] // dissolve/wipe for act changes
      : styles[0]; // fade/cut for same-act

    const duration = isActChange ? 1.5 : 0.8;

    transitions.push({
      from: fromScene.id,
      to: toScene.id,
      style,
      duration,
      sfxPrompt: isActChange ? `Subtle transition whoosh, ${format} style` : undefined,
    });
  }

  return transitions;
}

/**
 * Generate bookend sequences (opening + closing).
 */
function generateBookends(config: CastProjectConfig): PipelineBookends {
  const { title, industry, format, tone, quality } = config;

  const openingDuration = format === 'social-clip' ? 2 : quality === 'cinematic' ? 5 : 3;
  const closingDuration = format === 'social-clip' ? 2 : quality === 'cinematic' ? 5 : 3;

  return {
    opening: {
      duration: openingDuration,
      title,
      subtitle: config.userPrompt?.slice(0, 80),
      brand: config.brandProfile?.name as string || undefined,
      musicPrompt: `${tone} ${industry} opening theme, building anticipation, ${format} style`,
      sfxPrompt: quality === 'cinematic' ? 'Cinematic reveal sound, deep resonance' : undefined,
      transitionStyle: quality === 'cinematic' ? 'dissolve' : 'fade',
    },
    closing: {
      duration: closingDuration,
      title: `Thank you`,
      subtitle: title,
      brand: config.brandProfile?.name as string || undefined,
      musicPrompt: `${tone} ${industry} closing theme, warm resolution, ${format} style`,
      sfxPrompt: quality === 'cinematic' ? 'Gentle closing chime, satisfying resolution' : undefined,
      ctaText: format === 'social-clip' ? 'Follow for more' : 'Learn more',
    },
  };
}

/**
 * Suggest default characters based on format and speaker count.
 */
function suggestCharacters(
  format: CastFormat,
  speakerCount: number,
  audience: CastAudience
): Partial<UniversalCharacter>[] {
  const voiceStyle = AUDIENCE_VOICE_MAP[audience];
  const characters: Partial<UniversalCharacter>[] = [];

  // Narrator/host is always first
  characters.push({
    key: 'narrator',
    name: 'Narrator',
    role: format === 'podcast' ? 'Host' : 'Narrator',
    motionStyle: 'measured',
    voice: {
      provider: 'elevenlabs',
      voiceId: '', // To be filled by user or auto-selected
      speed: voiceStyle.speed,
      locale: 'en-US',
    },
  });

  if (speakerCount >= 2) {
    characters.push({
      key: 'speaker-2',
      name: format === 'interview' ? 'Guest' : format === 'podcast' ? 'Co-host' : 'Expert',
      role: format === 'interview' ? 'Interview Guest' : format === 'podcast' ? 'Co-host' : 'Subject Matter Expert',
      motionStyle: 'expressive',
      voice: {
        provider: 'elevenlabs',
        voiceId: '',
        speed: voiceStyle.speed,
        locale: 'en-US',
      },
    });
  }

  for (let i = 3; i <= speakerCount && i <= 5; i++) {
    characters.push({
      key: `speaker-${i}`,
      name: `Speaker ${i}`,
      role: format === 'podcast' ? `Guest ${i - 1}` : `Contributor ${i - 1}`,
      motionStyle: 'direct',
      voice: {
        provider: 'azure',
        voiceId: '',
        speed: voiceStyle.speed,
        locale: 'en-US',
      },
    });
  }

  return characters;
}

/**
 * MAIN: Generate a complete production pipeline from project config.
 *
 * This is the core function that replaces EP04-hardcoded pipelines with
 * a dynamic, format-driven pipeline generator.
 */
export function generateProjectPipeline(config: CastProjectConfig): GeneratedPipeline {
  const {
    industry,
    format,
    tone,
    targetAudience,
    quality,
    durationTarget,
    speakerCount,
  } = config;

  // 1. Calculate scene count
  const sceneCount = config.sceneCount || calculateSceneCount(format, durationTarget);

  // 2. Get scene types for this format
  const sceneTypeIds = FORMAT_SCENE_MAP[format] || FORMAT_SCENE_MAP['explainer'];

  // 3. Build scene definitions
  const avgSceneDuration = Math.round(durationTarget / sceneCount);
  const scenes: UniversalSceneDefinition[] = [];

  for (let i = 0; i < sceneCount; i++) {
    // Cycle through available scene types for body scenes
    let sceneTypeId: string;
    if (i === 0) {
      sceneTypeId = 'title-card';
    } else if (i === sceneCount - 1) {
      sceneTypeId = 'cta-outro';
    } else {
      // Body scenes: cycle through middle scene types
      const bodyTypes = sceneTypeIds.filter(t => t !== 'title-card' && t !== 'cta-outro');
      sceneTypeId = bodyTypes[(i - 1) % bodyTypes.length];
    }

    const sceneType = getSceneType(sceneTypeId);
    const sceneDuration = i === 0 || i === sceneCount - 1
      ? Math.min(avgSceneDuration, 15) // bookend scenes are shorter
      : avgSceneDuration;

    const sceneId = `scene-${i}-${sceneTypeId}`;

    scenes.push({
      id: sceneId,
      title: `Scene ${i + 1}`,
      sceneType: sceneTypeId,
      scriptKeys: [`${sceneId}-line-1`], // Placeholder — filled by scriptAutoGenerator
      durationEst: sceneDuration,
      music: {
        prompt: '', // Filled below
        volume: 0.3,
        fadeIn: 0.5,
        fadeOut: 0.5,
        loop: true,
      },
      transitionIn: sceneType?.defaultTransitionIn || 'fade',
      transitionOut: sceneType?.defaultTransitionOut || 'fade',
      layout: sceneType?.defaultLayout || 'fullscreen',
    });
  }

  // 4. Build scene IDs list for arc calculation
  const sceneIds = scenes.map(s => s.id);

  // 5. Build emotional arc
  const emotionalArc = buildEmotionalArc(sceneCount, tone, sceneIds);

  // 6. Generate music config per scene (using musicAutoComposer)
  const musicConfig: Record<string, MusicComposition> = {};
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const act = emotionalArc.acts.find(a => a.scenes.includes(scene.id));
    const mood = act?.mood || TONE_EMOTION_MAP[tone] || 'conversational';

    const composition = composeMusicPrompt({
      industry,
      format,
      mood,
      sceneDuration: scene.durationEst,
      sceneIndex: i,
      totalScenes: scenes.length,
      quality,
    });

    musicConfig[scene.id] = composition;

    // Inject music prompt into scene definition
    if (scene.music) {
      scene.music.prompt = composition.musicPrompt;
    }

    // Inject SFX
    const sfxPrompts = composeSfxPrompts({
      industry,
      format,
      mood,
      sceneType: scene.sceneType,
    });
    if (sfxPrompts.length > 0) {
      scene.sfx = sfxPrompts.map(p => ({
        prompt: p.prompt,
        timing: p.timing as 'start' | 'end' | 'loop' | 'with-line',
        duration: p.duration,
      }));
    }
  }

  // 7. Generate transitions
  const transitions = generateTransitions(scenes, format, emotionalArc);

  // 8. Generate bookends
  const bookends = generateBookends(config);

  // 9. Suggest characters
  const suggestedCharacters = suggestCharacters(format, speakerCount, targetAudience);

  // 10. Build voice routing defaults
  const voiceDefaults: Record<string, Partial<VoiceConfig>> = {};
  const providers = QUALITY_PROVIDER_MAP[quality];
  for (const char of suggestedCharacters) {
    if (char.key) {
      voiceDefaults[char.key] = {
        provider: providers.ttsProvider as VoiceConfig['provider'],
        speed: AUDIENCE_VOICE_MAP[targetAudience].speed,
        locale: config.baseLanguage || 'en-US',
      };
    }
  }

  // 11. Calculate estimated duration
  const sceneDuration = scenes.reduce((sum, s) => sum + s.durationEst, 0);
  const transitionDuration = transitions.reduce((sum, t) => sum + t.duration, 0);
  const bookendDuration = bookends.opening.duration + bookends.closing.duration;
  const estimatedDuration = sceneDuration + transitionDuration + bookendDuration;

  return {
    config,
    scenes,
    transitions,
    bookends,
    musicConfig,
    voiceDefaults,
    suggestedCharacters,
    scriptPurpose: FORMAT_PURPOSE_MAP[format] || 'explainer',
    emotionalArc,
    estimatedDuration,
  };
}

/**
 * Get quality-aware provider routing for a project.
 */
export function getProviderRouting(quality: CastQuality): QualityProviderMap {
  return QUALITY_PROVIDER_MAP[quality];
}

/**
 * Get available scene types for a given format.
 */
export function getSceneTypesForFormat(format: CastFormat): SceneTypeDefinition[] {
  const ids = FORMAT_SCENE_MAP[format] || [];
  return ids.map(id => getSceneType(id)).filter((t): t is SceneTypeDefinition => !!t);
}

/**
 * Estimate duration from format + scene count.
 */
export function estimateDuration(format: CastFormat, sceneCount: number): number {
  const avgPerScene: Record<CastFormat, number> = {
    'social-clip': 8, 'promo': 12, 'explainer': 20, 'product-demo': 20,
    'training': 25, 'tutorial': 25, 'testimonial': 25, 'presentation': 20,
    'interview': 30, 'podcast': 40, 'documentary': 30, 'webcast': 30,
  };
  return sceneCount * (avgPerScene[format] || 20);
}
