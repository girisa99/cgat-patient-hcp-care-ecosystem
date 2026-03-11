/**
 * MUSIC AUTO-COMPOSER
 *
 * Zero-effort music configuration from industry + format + mood.
 * Generates structured music prompts for AI music generation providers
 * (ModelsLab MusicGen, Beatoven via fal.ai, Suno).
 *
 * Maps:
 *   - Industry → style, BPM range, instruments
 *   - Format → music structure, loop behavior, fade type
 *   - Mood → energy level, key signature, dynamics
 *   - Scene position → intro/body/climax/outro pacing
 *
 * @see src/services/cast/projectPipelineGenerator.ts — consumes this
 * @see supabase/functions/multi-provider-music/ — executes music gen
 */

import type { EmotionalTone } from './universal-script-schema';
import type { CastIndustry, CastFormat, CastQuality } from '@/services/cast/projectPipelineGenerator';

// ─── INDUSTRY → MUSIC STYLE MAPPING ────────────────────────────────────────

export interface IndustryMusicProfile {
  style: string;
  bpmRange: [number, number];
  instruments: string[];
  keySignature: 'major' | 'minor' | 'modal';
  energyLevel: 'low' | 'medium' | 'high';
  negativePrompt: string;
}

export const INDUSTRY_MUSIC_MAP: Record<string, IndustryMusicProfile> = {
  healthcare: {
    style: 'corporate-ambient',
    bpmRange: [80, 100],
    instruments: ['piano', 'strings', 'soft-synth', 'gentle-pads'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no harsh beats, no heavy bass, no distortion, no aggressive',
  },
  pharma: {
    style: 'clinical-ambient',
    bpmRange: [75, 95],
    instruments: ['piano', 'soft-strings', 'gentle-bells', 'ambient-pads'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no heavy drums, no distortion, no rock, no aggressive',
  },
  tech: {
    style: 'electronic-upbeat',
    bpmRange: [110, 130],
    instruments: ['synth', 'bass', 'percussion', 'arpeggiated-pads', 'glitch-effects'],
    keySignature: 'minor',
    energyLevel: 'high',
    negativePrompt: 'no acoustic guitar, no country, no classical',
  },
  finance: {
    style: 'classical-corporate',
    bpmRange: [85, 95],
    instruments: ['piano', 'cello', 'light-percussion', 'warm-strings'],
    keySignature: 'major',
    energyLevel: 'medium',
    negativePrompt: 'no electronic, no heavy bass, no distortion',
  },
  education: {
    style: 'acoustic-warm',
    bpmRange: [75, 90],
    instruments: ['acoustic-guitar', 'piano', 'light-drums', 'gentle-strings'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no heavy metal, no aggressive, no distortion',
  },
  entertainment: {
    style: 'cinematic-epic',
    bpmRange: [90, 120],
    instruments: ['orchestra', 'choir', 'epic-drums', 'french-horn', 'strings'],
    keySignature: 'minor',
    energyLevel: 'high',
    negativePrompt: 'no minimalist, no lo-fi',
  },
  food: {
    style: 'jazz-acoustic',
    bpmRange: [95, 110],
    instruments: ['guitar', 'saxophone', 'upright-bass', 'light-drums', 'piano'],
    keySignature: 'major',
    energyLevel: 'medium',
    negativePrompt: 'no electronic, no heavy bass, no harsh',
  },
  fashion: {
    style: 'electronic-minimal',
    bpmRange: [100, 115],
    instruments: ['synth-pads', 'minimal-beats', 'deep-bass', 'atmospheric-textures'],
    keySignature: 'minor',
    energyLevel: 'medium',
    negativePrompt: 'no acoustic, no classical, no country',
  },
  'real-estate': {
    style: 'aspirational-ambient',
    bpmRange: [85, 100],
    instruments: ['piano', 'light-strings', 'soft-pads', 'gentle-percussion'],
    keySignature: 'major',
    energyLevel: 'medium',
    negativePrompt: 'no heavy beats, no aggressive, no distortion',
  },
  automotive: {
    style: 'driving-electronic',
    bpmRange: [105, 125],
    instruments: ['synth-bass', 'driving-drums', 'electric-guitar', 'power-synth'],
    keySignature: 'minor',
    energyLevel: 'high',
    negativePrompt: 'no soft, no acoustic, no lo-fi',
  },
  travel: {
    style: 'world-acoustic',
    bpmRange: [90, 110],
    instruments: ['world-percussion', 'acoustic-guitar', 'flute', 'gentle-strings'],
    keySignature: 'major',
    energyLevel: 'medium',
    negativePrompt: 'no heavy electronic, no distortion',
  },
  fitness: {
    style: 'high-energy-electronic',
    bpmRange: [120, 140],
    instruments: ['heavy-synth', 'driving-bass', 'power-drums', 'vocal-chops'],
    keySignature: 'minor',
    energyLevel: 'high',
    negativePrompt: 'no slow, no acoustic, no ambient',
  },
  legal: {
    style: 'formal-classical',
    bpmRange: [70, 85],
    instruments: ['piano', 'cello', 'gentle-strings'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no electronic, no beats, no pop',
  },
  nonprofit: {
    style: 'inspirational-acoustic',
    bpmRange: [80, 100],
    instruments: ['piano', 'acoustic-guitar', 'warm-strings', 'gentle-choir'],
    keySignature: 'major',
    energyLevel: 'medium',
    negativePrompt: 'no heavy beats, no aggressive, no dark',
  },
  government: {
    style: 'formal-ambient',
    bpmRange: [75, 90],
    instruments: ['piano', 'strings', 'light-brass'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no electronic, no pop, no casual',
  },
  energy: {
    style: 'industrial-ambient',
    bpmRange: [85, 105],
    instruments: ['deep-synth', 'industrial-percussion', 'drone-bass', 'atmospheric-textures'],
    keySignature: 'minor',
    energyLevel: 'medium',
    negativePrompt: 'no pop, no cheerful, no acoustic guitar',
  },
  wedding: {
    style: 'romantic-elegant',
    bpmRange: [70, 90],
    instruments: ['harp', 'strings', 'piano', 'gentle-bells', 'choir'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no heavy drums, no electronic, no aggressive',
  },
  events: {
    style: 'celebration-upbeat',
    bpmRange: [105, 125],
    instruments: ['brass', 'percussion', 'piano', 'strings', 'synth-pads'],
    keySignature: 'major',
    energyLevel: 'high',
    negativePrompt: 'no somber, no slow, no dark',
  },
  hospitality: {
    style: 'luxury-ambient',
    bpmRange: [80, 100],
    instruments: ['piano', 'jazz-guitar', 'soft-strings', 'gentle-percussion'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no heavy beats, no aggressive, no distortion',
  },
  retail: {
    style: 'pop-modern',
    bpmRange: [100, 120],
    instruments: ['synth', 'bass', 'drums', 'guitar', 'vocal-chops'],
    keySignature: 'major',
    energyLevel: 'high',
    negativePrompt: 'no classical, no slow, no ambient',
  },
  manufacturing: {
    style: 'industrial-corporate',
    bpmRange: [90, 110],
    instruments: ['synth-bass', 'industrial-perc', 'power-synth', 'strings'],
    keySignature: 'minor',
    energyLevel: 'medium',
    negativePrompt: 'no soft, no acoustic, no gentle',
  },
  construction: {
    style: 'power-rock',
    bpmRange: [100, 120],
    instruments: ['electric-guitar', 'power-drums', 'bass', 'synth'],
    keySignature: 'minor',
    energyLevel: 'high',
    negativePrompt: 'no soft, no classical, no ambient',
  },
  agriculture: {
    style: 'folk-acoustic',
    bpmRange: [80, 100],
    instruments: ['acoustic-guitar', 'fiddle', 'harmonica', 'light-drums', 'banjo'],
    keySignature: 'major',
    energyLevel: 'medium',
    negativePrompt: 'no electronic, no heavy bass, no industrial',
  },
  media: {
    style: 'broadcast-professional',
    bpmRange: [95, 115],
    instruments: ['synth', 'drums', 'bass', 'piano', 'strings'],
    keySignature: 'major',
    energyLevel: 'medium',
    negativePrompt: 'no lo-fi, no ambient, no slow',
  },
  sports: {
    style: 'high-energy-anthem',
    bpmRange: [120, 145],
    instruments: ['power-drums', 'electric-guitar', 'brass', 'synth', 'choir'],
    keySignature: 'minor',
    energyLevel: 'high',
    negativePrompt: 'no soft, no ambient, no gentle',
  },
  beauty: {
    style: 'elegant-minimal',
    bpmRange: [85, 105],
    instruments: ['piano', 'soft-synth', 'gentle-strings', 'chimes'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no heavy beats, no rock, no aggressive',
  },
  insurance: {
    style: 'reassuring-corporate',
    bpmRange: [80, 95],
    instruments: ['piano', 'warm-strings', 'soft-pads', 'gentle-percussion'],
    keySignature: 'major',
    energyLevel: 'low',
    negativePrompt: 'no electronic, no edgy, no aggressive',
  },
  logistics: {
    style: 'efficient-modern',
    bpmRange: [100, 115],
    instruments: ['synth', 'light-drums', 'bass', 'digital-textures'],
    keySignature: 'minor',
    energyLevel: 'medium',
    negativePrompt: 'no slow, no classical, no romantic',
  },
  general: {
    style: 'modern-corporate',
    bpmRange: [90, 110],
    instruments: ['piano', 'light-synth', 'gentle-drums', 'strings'],
    keySignature: 'major',
    energyLevel: 'medium',
    negativePrompt: 'no aggressive, no harsh, no distortion',
  },
};

// ─── FORMAT → MUSIC STRUCTURE MAPPING ───────────────────────────────────────

export interface FormatMusicProfile {
  structure: string;
  loop: boolean;
  fadeType: 'quick' | 'gradual' | 'cinematic' | 'none';
  duckingLevel: number;
  maxDuration: number;
}

export const FORMAT_MUSIC_MAP: Record<string, FormatMusicProfile> = {
  'social-clip': {
    structure: 'hook-heavy',
    loop: false,
    fadeType: 'quick',
    duckingLevel: 0.15,
    maxDuration: 60,
  },
  'explainer': {
    structure: 'intro-body-outro',
    loop: true,
    fadeType: 'gradual',
    duckingLevel: 0.20,
    maxDuration: 600,
  },
  'documentary': {
    structure: 'emotional-arc',
    loop: false,
    fadeType: 'cinematic',
    duckingLevel: 0.20,
    maxDuration: 1800,
  },
  'podcast': {
    structure: 'intro-jingle-bed-outro',
    loop: true,
    fadeType: 'gradual',
    duckingLevel: 0.15,
    maxDuration: 3600,
  },
  'product-demo': {
    structure: 'upbeat-build',
    loop: false,
    fadeType: 'quick',
    duckingLevel: 0.20,
    maxDuration: 300,
  },
  'training': {
    structure: 'intro-body-outro',
    loop: true,
    fadeType: 'gradual',
    duckingLevel: 0.20,
    maxDuration: 1200,
  },
  'testimonial': {
    structure: 'emotional-arc',
    loop: false,
    fadeType: 'gradual',
    duckingLevel: 0.20,
    maxDuration: 180,
  },
  'interview': {
    structure: 'intro-bed-outro',
    loop: true,
    fadeType: 'gradual',
    duckingLevel: 0.15,
    maxDuration: 1800,
  },
  'presentation': {
    structure: 'intro-body-outro',
    loop: true,
    fadeType: 'gradual',
    duckingLevel: 0.20,
    maxDuration: 600,
  },
  'promo': {
    structure: 'hook-heavy',
    loop: false,
    fadeType: 'quick',
    duckingLevel: 0.15,
    maxDuration: 120,
  },
  'webcast': {
    structure: 'intro-bed-outro',
    loop: true,
    fadeType: 'gradual',
    duckingLevel: 0.15,
    maxDuration: 3600,
  },
  'tutorial': {
    structure: 'intro-body-outro',
    loop: true,
    fadeType: 'gradual',
    duckingLevel: 0.20,
    maxDuration: 1200,
  },
  'celebration': {
    structure: 'emotional-arc',
    loop: false,
    fadeType: 'cinematic',
    duckingLevel: 0.15,
    maxDuration: 600,
  },
  'event-recap': {
    structure: 'hook-heavy',
    loop: false,
    fadeType: 'quick',
    duckingLevel: 0.20,
    maxDuration: 600,
  },
  'virtual-tour': {
    structure: 'intro-body-outro',
    loop: true,
    fadeType: 'gradual',
    duckingLevel: 0.20,
    maxDuration: 600,
  },
};

// ─── MOOD → MUSIC ENERGY MAPPING ────────────────────────────────────────────

interface MoodMusicProfile {
  energyMultiplier: number;
  bpmOffset: number;
  dynamicsHint: string;
  keyPreference: 'major' | 'minor' | 'modal' | 'any';
}

const MOOD_MUSIC_MAP: Record<string, MoodMusicProfile> = {
  inspiring:       { energyMultiplier: 1.2, bpmOffset: 5,   dynamicsHint: 'building crescendo',        keyPreference: 'major' },
  educational:     { energyMultiplier: 0.8, bpmOffset: -5,  dynamicsHint: 'steady and clear',           keyPreference: 'major' },
  dramatic:        { energyMultiplier: 1.3, bpmOffset: 10,  dynamicsHint: 'dynamic with tension',       keyPreference: 'minor' },
  playful:         { energyMultiplier: 1.1, bpmOffset: 5,   dynamicsHint: 'bouncy and light',           keyPreference: 'major' },
  urgent:          { energyMultiplier: 1.4, bpmOffset: 15,  dynamicsHint: 'driving and intense',        keyPreference: 'minor' },
  conversational:  { energyMultiplier: 0.7, bpmOffset: -10, dynamicsHint: 'relaxed background',         keyPreference: 'major' },
  authoritative:   { energyMultiplier: 0.9, bpmOffset: 0,   dynamicsHint: 'steady and confident',       keyPreference: 'major' },
  empathetic:      { energyMultiplier: 0.6, bpmOffset: -15, dynamicsHint: 'gentle and warm',            keyPreference: 'major' },
  celebratory:     { energyMultiplier: 1.3, bpmOffset: 10,  dynamicsHint: 'joyful and triumphant',      keyPreference: 'major' },
  mysterious:      { energyMultiplier: 0.8, bpmOffset: -5,  dynamicsHint: 'atmospheric and suspenseful', keyPreference: 'minor' },
  nostalgic:       { energyMultiplier: 0.7, bpmOffset: -10, dynamicsHint: 'warm and wistful',           keyPreference: 'major' },
  provocative:     { energyMultiplier: 1.2, bpmOffset: 5,   dynamicsHint: 'edgy and bold',              keyPreference: 'minor' },
};

// ─── COMPOSER OUTPUT ────────────────────────────────────────────────────────

export interface MusicComposition {
  musicPrompt: string;
  bpm: number;
  durationSeconds: number;
  style: string;
  instruments: string[];
  loop: boolean;
  fadeType: string;
  duckingLevel: number;
  negativePrompt: string;
}

export interface SfxComposition {
  prompt: string;
  timing: string;
  duration: number;
}

// ─── COMPOSER FUNCTIONS ─────────────────────────────────────────────────────

interface ComposeMusicInput {
  industry: string;
  format: string;
  mood: EmotionalTone | string;
  sceneDuration: number;
  sceneIndex: number;
  totalScenes: number;
  quality: CastQuality;
}

/**
 * Generate a structured music prompt from project parameters.
 * Returns everything needed to call ModelsLab/Beatoven/Suno.
 */
export function composeMusicPrompt(input: ComposeMusicInput): MusicComposition {
  const { industry, format, mood, sceneDuration, sceneIndex, totalScenes, quality } = input;

  const industryProfile = INDUSTRY_MUSIC_MAP[industry] || INDUSTRY_MUSIC_MAP.general;
  const formatProfile = FORMAT_MUSIC_MAP[format] || FORMAT_MUSIC_MAP.explainer;
  const moodProfile = MOOD_MUSIC_MAP[mood] || MOOD_MUSIC_MAP.conversational;

  // Calculate BPM based on industry base + mood offset + scene position
  const baseBpm = Math.round(
    (industryProfile.bpmRange[0] + industryProfile.bpmRange[1]) / 2
  );
  const bpm = Math.max(60, Math.min(160, baseBpm + moodProfile.bpmOffset));

  // Calculate duration — music should match scene duration
  const durationSeconds = Math.min(sceneDuration, formatProfile.maxDuration);

  // Determine position in narrative for pacing cues
  const position = sceneIndex / Math.max(1, totalScenes - 1);
  let pacingHint: string;
  if (position < 0.15) {
    pacingHint = 'opening introduction';
  } else if (position < 0.5) {
    pacingHint = 'building momentum';
  } else if (position < 0.85) {
    pacingHint = 'peak energy';
  } else {
    pacingHint = 'gentle resolution';
  }

  // Select key instruments (max 4 for prompt clarity)
  const instruments = industryProfile.instruments.slice(0, 4);

  // Build the prompt
  const musicPrompt = [
    `${industryProfile.style} instrumental music`,
    `${bpm} BPM`,
    `${instruments.join(', ')}`,
    `${moodProfile.dynamicsHint}`,
    `${pacingHint}`,
    quality === 'cinematic' ? 'high production value, cinematic quality' : '',
    `${durationSeconds} seconds`,
  ].filter(Boolean).join(', ');

  return {
    musicPrompt,
    bpm,
    durationSeconds,
    style: industryProfile.style,
    instruments,
    loop: formatProfile.loop,
    fadeType: formatProfile.fadeType,
    duckingLevel: formatProfile.duckingLevel,
    negativePrompt: industryProfile.negativePrompt,
  };
}

// ─── SFX COMPOSER ───────────────────────────────────────────────────────────

interface ComposeSfxInput {
  industry: string;
  format: string;
  mood: EmotionalTone | string;
  sceneType: string;
}

/** Industry-specific ambient SFX */
const INDUSTRY_SFX_MAP: Record<string, string[]> = {
  healthcare:    ['soft medical monitor beep', 'gentle hospital ambience', 'calming nature sounds'],
  pharma:        ['laboratory ambience', 'soft bubbling', 'clinical environment'],
  tech:          ['keyboard typing', 'notification chime', 'server room hum', 'digital interface'],
  finance:       ['stock ticker', 'office ambience', 'paper shuffling'],
  education:     ['classroom ambience', 'pencil writing', 'page turning'],
  entertainment: ['crowd ambience', 'dramatic whoosh', 'cinematic impact'],
  food:          ['sizzling pan', 'knife chopping', 'pouring liquid', 'restaurant ambience'],
  fashion:       ['camera shutter', 'fabric rustle', 'heels on runway'],
  automotive:    ['engine rev', 'car door close', 'road ambience'],
  travel:        ['airplane cabin', 'ocean waves', 'city sounds', 'nature ambience'],
  fitness:       ['gym ambience', 'heartbeat', 'timer beep'],
  energy:        ['oil rig ambience', 'industrial machinery hum', 'wind turbine whoosh'],
  wedding:       ['champagne glass clink', 'gentle crowd murmur', 'church bells', 'soft applause'],
  events:        ['crowd applause', 'confetti pop', 'stage lights hum', 'microphone feedback tap'],
  hospitality:   ['lobby ambience', 'soft fountain water', 'hotel concierge bell'],
  retail:        ['cash register ding', 'shopping bag rustle', 'store ambience'],
  manufacturing: ['factory floor ambience', 'machinery whir', 'conveyor belt hum'],
  construction:  ['construction site ambience', 'hammer strike', 'concrete mixer'],
  agriculture:   ['farm ambience', 'tractor engine', 'birds chirping', 'wind through crops'],
  media:         ['broadcast countdown beep', 'camera shutter', 'newsroom ambience'],
  sports:        ['stadium crowd roar', 'referee whistle', 'scoreboard buzzer'],
  beauty:        ['spa ambience', 'water droplet', 'gentle wind chimes'],
  insurance:     ['pen on paper', 'office ambience', 'phone ring'],
  logistics:     ['warehouse ambience', 'truck engine', 'barcode scanner beep'],
  general:       ['soft transition whoosh', 'gentle chime', 'ambient pad swell'],
};

/** Scene-type specific SFX */
const SCENE_TYPE_SFX_MAP: Record<string, SfxComposition[]> = {
  'title-card': [
    { prompt: 'Cinematic title reveal sound, subtle impact', timing: 'start', duration: 2 },
  ],
  'talking-head': [
    { prompt: 'Subtle room tone, warm ambience', timing: 'loop', duration: 5 },
  ],
  'product-demo': [
    { prompt: 'Interface click sound, digital', timing: 'with-line', duration: 1 },
    { prompt: 'Feature highlight whoosh', timing: 'with-line', duration: 1 },
  ],
  'screen-capture-vo': [
    { prompt: 'Mouse click, digital interface sound', timing: 'with-line', duration: 0.5 },
  ],
  'data-viz-narrative': [
    { prompt: 'Data visualization reveal, upward sweep', timing: 'start', duration: 2 },
  ],
  'whiteboard-explainer': [
    { prompt: 'Marker on whiteboard, writing sound', timing: 'loop', duration: 3 },
  ],
  'cta-outro': [
    { prompt: 'Satisfying completion chime, positive resolution', timing: 'end', duration: 2 },
  ],
  'montage-reel': [
    { prompt: 'Fast montage transition swoosh', timing: 'with-line', duration: 1 },
  ],
  'quiz-interactive': [
    { prompt: 'Quiz question reveal sound, thinking music', timing: 'start', duration: 2 },
    { prompt: 'Correct answer chime', timing: 'end', duration: 1 },
  ],
};

/**
 * Generate SFX prompts for a scene based on context.
 */
export function composeSfxPrompts(input: ComposeSfxInput): SfxComposition[] {
  const { industry, sceneType } = input;

  const sfx: SfxComposition[] = [];

  // Scene-type specific SFX
  const sceneTypeSfx = SCENE_TYPE_SFX_MAP[sceneType];
  if (sceneTypeSfx) {
    sfx.push(...sceneTypeSfx);
  }

  // Industry ambient SFX (add one ambient sound if scene type doesn't have loop)
  const hasLoop = sfx.some(s => s.timing === 'loop');
  if (!hasLoop) {
    const industrySfx = INDUSTRY_SFX_MAP[industry] || INDUSTRY_SFX_MAP.general;
    if (industrySfx.length > 0) {
      // Pick first industry SFX as ambient
      sfx.push({
        prompt: industrySfx[0],
        timing: 'start',
        duration: 3,
      });
    }
  }

  return sfx;
}

/**
 * Get music composition for a full project (all scenes at once).
 * Useful for generating consistent music across the production.
 */
export function composeProjectMusic(
  industry: string,
  format: string,
  sceneCount: number,
  totalDuration: number,
  quality: CastQuality
): MusicComposition[] {
  const moods: (EmotionalTone | string)[] = [];
  for (let i = 0; i < sceneCount; i++) {
    const position = i / Math.max(1, sceneCount - 1);
    if (position < 0.15) moods.push('conversational');
    else if (position < 0.5) moods.push('educational');
    else if (position < 0.85) moods.push('inspiring');
    else moods.push('empathetic');
  }

  const avgDuration = Math.round(totalDuration / sceneCount);

  return moods.map((mood, i) =>
    composeMusicPrompt({
      industry,
      format,
      mood,
      sceneDuration: avgDuration,
      sceneIndex: i,
      totalScenes: sceneCount,
      quality,
    })
  );
}
