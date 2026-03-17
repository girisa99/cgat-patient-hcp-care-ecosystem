/**
 * CastProfile — Universal production profile for Genie Cast pipeline.
 *
 * Single source of truth for ALL rendering parameters. Replaces 100+ hardcoded
 * values scattered across castTimelineEngine.ts, ffmpeg_builder.py,
 * timeline_parser.py, and pillow_renderer.py.
 *
 * Used by: GenieCast, GenieDeck, GenieSpark — each product creates its own profile.
 * The profile flows through the entire pipeline:
 *   Frontend (castTimelineEngine) → Timeline JSON → RunPod FFmpeg worker
 */

// ── Ken Burns Pattern ────────────────────────────────────────────────────────

export interface KenBurnsPattern {
  zoom: number;        // percentage (1-25). JSON2Video: 1=1%, 10=10%
  pan: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  panDistance: number;  // 0.01-0.5 (API default 0.1)
}

// ── CastProfile Interface ────────────────────────────────────────────────────

export interface CastProfile {
  /** Profile identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of when to use this profile */
  description: string;

  // ── Visual Theme ──────────────────────────────────────────────────────────
  colors: {
    background: string;        // Scene background
    primary: string;           // Titles, kinetic text, highlights
    secondary: string;         // Subtitles, accents
    tertiary: string;          // Descriptions, body text
    muted: string;             // Metadata, brand text
    lowerThirdBg: string;      // Lower-third banner background
    lowerThirdAccent: string;  // Lower-third accent bar
    glowColor: string;         // Text glow effect
    captionBg: string;         // Caption background overlay
  };

  fonts: {
    family: string;            // Primary font family
    titleSize: number;         // Opening title (px)
    closingTitleSize: number;  // Closing title (px)
    subtitleSize: number;      // Subtitle/description text (px)
    tagSize: number;           // Episode tag / label (px)
    brandSize: number;         // Brand / footer text (px)
    captionSize: number;       // Burned-in captions (px)
    kineticLargeSize: number;  // Kinetic text (short, <50 chars)
    kineticMediumSize: number; // Kinetic text (medium, 50-100 chars)
    kineticSmallSize: number;  // Kinetic text (long, >100 chars)
    lowerThirdHeadline: number;// Lower-third headline
    lowerThirdLead: number;    // Lower-third lead/subtitle
  };

  // ── Timing & Pacing ───────────────────────────────────────────────────────
  timing: {
    visualBeat: number;        // Seconds per visual beat (image cycling interval)
    openingFade: number;       // Opening bookend fade-in (seconds)
    closingFade: number;       // Closing bookend fade-out (seconds)
    crossfadeOverlap: number;  // Image crossfade overlap (seconds)
    sceneFadeIn: number;       // Default element fade-in (seconds)
    sceneFadeOut: number;      // Default element fade-out (seconds)
    lipsyncTolerance: number;  // Max seconds offset for lipsync matching
    minSceneDuration: number;  // Minimum scene duration (seconds)
    maxSceneDuration: number;  // Maximum before splitting (seconds)
    ttsPadding: number;        // Extra seconds added to TTS duration estimate
    lowerThirdDuration: number;// Max lower-third display time (seconds)
    lowerThirdDelay: number;   // Lower-third entry delay (seconds)
    videoLeadInMax: number;    // Max establishing shot duration (seconds)
    videoLeadInRatio: number;  // Establishing shot as ratio of scene (0-1)
  };

  // ── Audio Levels ──────────────────────────────────────────────────────────
  audio: {
    ttsVolume: number;         // Primary narration volume (0-1)
    musicDucked: number;       // Music volume under narration (0-1)
    musicForward: number;      // Music volume in instrumental scenes (0-1)
    musicFadeIn: number;       // Music fade-in duration (seconds)
    musicFadeOut: number;      // Music fade-out duration (seconds)
    sfxVolume: number;         // Sound effect volume (0-1)
    sfxFadeIn: number;         // SFX attack time (seconds)
    sfxFadeOut: number;        // SFX decay time (seconds)
    sfxMaxDuration: number;    // Max SFX clip length (seconds)
  };

  // ── Ken Burns ─────────────────────────────────────────────────────────────
  kenBurns: {
    /** Standard B-roll patterns (cycled or randomized) */
    standard: KenBurnsPattern[];
    /** Screenshot/data patterns (gentle zoom to preserve text readability) */
    screenshot: KenBurnsPattern[];
    /** Bookend Ken Burns (opening/closing) */
    bookend: { zoom: number; pan: 'left' | 'right'; panDistance: number };
    /** Shuffle patterns instead of cycling sequentially */
    randomize: boolean;
    /** Mood-based intensity multiplier (applied to zoom + panDistance) */
    moodIntensity: Record<string, number>;
  };

  // ── Image Handling ────────────────────────────────────────────────────────
  images: {
    /** How to fit images into the target frame */
    resizeStrategy: 'cover' | 'contain-blur' | 'adaptive';
    /** For portrait images in landscape frame */
    portraitStrategy: 'crop-center' | 'blur-sides' | 'ken-burns-vertical';
    /** Warn if source image is smaller than this (px) */
    minSourceWidth: number;
    minSourceHeight: number;
    /** Warn if upscaling by more than this factor */
    upscaleThreshold: number;
    /** Target output dimensions */
    outputWidth: number;
    outputHeight: number;
  };

  // ── Encoding ──────────────────────────────────────────────────────────────
  encoding: {
    /** Video codec (NVENC for GPU, libx264 for CPU fallback) */
    codec: 'h264_nvenc' | 'libx264' | 'libsvtav1' | 'hevc_nvenc';
    /** Constant Rate Factor (quality: 0=lossless, 23=default, 51=worst) */
    crf: number;
    /** Maximum bitrate */
    maxBitrate: string;
    /** Encoder buffer size */
    bufferSize: string;
    /** Encoder preset (speed vs quality tradeoff) */
    preset: string;
    /** Output resolution */
    resolution: 'full-hd' | 'hd' | '4k';
    /** Max file size before adaptive re-encode (MB) */
    maxFileSizeMB: number;
  };

  // ── Text Rendering (Pillow) ───────────────────────────────────────────────
  text: {
    /** Stroke width as ratio of font size (e.g., 1/18 = font_size // 18) */
    strokeRatio: number;
    /** Text shadow offset [dx, dy] in pixels */
    shadowOffset: [number, number];
    /** Shadow blur radius (px) */
    shadowBlur: number;
    /** Glow alpha (0-255) */
    glowAlpha: number;
    /** Glow color [r, g, b] */
    glowColor: [number, number, number];
    /** Max text width as ratio of canvas width (0-1) */
    maxWidth: number;
    /** Canvas margin (px) */
    margin: number;
    /** Line spacing as ratio of font size */
    lineSpacing: number;
  };

  // ── Transitions ───────────────────────────────────────────────────────────
  transitions: {
    /** Default transition cycle (fallback when no mood) */
    default: string[];
    /** Mood-based transition preferences */
    byMood: Record<string, string[]>;
    /** Chapter transition duration (seconds) */
    chapterTransitionDuration: number;
    /** TTS scene transition duration (seconds) */
    sceneTransitionDuration: number;
    /** Split-scene transition style */
    splitTransition: string;
    /** Split-scene transition duration (seconds) */
    splitTransitionDuration: number;
  };

  // ── Lower-Third ───────────────────────────────────────────────────────────
  lowerThird: {
    /** Component template (e.g., 'basic/050' for CNN-style) */
    component: string;
    /** Height with lead text (px) */
    heightWithLead: number;
    /** Height without lead text (px) */
    heightNoLead: number;
    /** Vertical position as ratio of frame height (0-1) */
    verticalPosition: number;
    /** Horizontal margin (px) */
    horizontalMargin: number;
    /** Max width as ratio of frame width (0-1) or absolute px */
    maxWidth: number;
    /** Accent bar width (px) */
    accentBarWidth: number;
    /** Internal padding (px) */
    padding: number;
    /** Background alpha (0-255) */
    bgAlpha: number;
    /** Corner radius (px) */
    cornerRadius: number;
    /** Lead text color */
    leadColor: string;
  };

  // ── Storybook Frame ───────────────────────────────────────────────────────
  storybook: {
    /** Border color */
    borderColor: string;
    /** Outer margin (px) */
    outerMargin: number;
    /** Inner margin (px) */
    innerMargin: number;
    /** Outer border radius (px) */
    outerRadius: number;
    /** Inner border radius (px) */
    innerRadius: number;
    /** Corner ornament size (px) */
    ornamentSize: number;
  };

  // ── PiP (Picture-in-Picture) ──────────────────────────────────────────────
  pip: {
    /** Glow border color */
    glowColor: string;
    /** Glow size (px) */
    glowSize: number;
    /** Border radius (px) */
    borderRadius: number;
  };

  // ── Color Grading ─────────────────────────────────────────────────────────
  colorGrading: {
    opening: { rs: number; gs: number; bs: number };
    interlude: { rs: number; gs: number; bs: number };
    tts: { rs: number; gs: number; bs: number };
    transition: { rs: number; gs: number; bs: number };
    closing: { rs: number; gs: number; bs: number };
  };

  // ── Post-Production Defaults ──────────────────────────────────────────────
  postProduction: {
    /** Caption burn-in style */
    captionStyle: 'modern' | 'classic' | 'minimal' | 'kinetic';
    /** Watermark position */
    watermarkPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
    /** Watermark opacity (0-1) */
    watermarkOpacity: number;
    /** GIF preview settings */
    gifWidth: number;
    gifFps: number;
    gifMaxColors: number;
    /** Thumbnail sizes to generate per scene */
    thumbnailSizes: Array<{ label: string; w: number; h: number }>;
  };
}

// ── Seeded Random for Deterministic Ken Burns Shuffling ──────────────────────

/** Simple seeded PRNG (mulberry32) — deterministic across renders for same scene */
function seededRandom(seed: number): number {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Get a Ken Burns pattern from the profile, with optional randomization
 * and mood-based intensity scaling.
 */
export function getProfileKenBurns(
  profile: CastProfile,
  idx: number,
  isScreenshot: boolean,
  mood?: string,
): KenBurnsPattern {
  const patterns = isScreenshot ? profile.kenBurns.screenshot : profile.kenBurns.standard;
  const selectedIdx = profile.kenBurns.randomize
    ? Math.floor(seededRandom(idx * 7 + 13) * patterns.length)
    : idx % patterns.length;

  const base = patterns[selectedIdx];
  const intensity = mood ? (profile.kenBurns.moodIntensity[mood] ?? 1.0) : 1.0;

  return {
    zoom: Math.round(base.zoom * intensity),
    pan: base.pan,
    panDistance: +(base.panDistance * intensity).toFixed(3),
  };
}

// ── Default Profile: Cinematic Dark ─────────────────────────────────────────

export const PROFILE_CINEMATIC_DARK: CastProfile = {
  id: 'cinematic-dark',
  name: 'Cinematic Dark',
  description: 'Dark, moody cinematic style — podcasts, documentaries, storytelling. Gold accents on deep purple-black.',

  colors: {
    background: '#0f0a1a',
    primary: '#f5d77a',
    secondary: '#c4b5fd',
    tertiary: '#e2e8f0',
    muted: '#94a3b8',
    lowerThirdBg: '#0f0a1a',
    lowerThirdAccent: '#f5d77a',
    glowColor: '#f5d77a',
    captionBg: 'rgba(0,0,0,0.65)',
  },

  fonts: {
    family: 'Inter',
    titleSize: 72,
    closingTitleSize: 56,
    subtitleSize: 28,
    tagSize: 24,
    brandSize: 20,
    captionSize: 22,
    kineticLargeSize: 48,
    kineticMediumSize: 36,
    kineticSmallSize: 28,
    lowerThirdHeadline: 44,
    lowerThirdLead: 28,
  },

  timing: {
    visualBeat: 12,
    openingFade: 1.5,
    closingFade: 2.0,
    crossfadeOverlap: 0.5,
    sceneFadeIn: 0.5,
    sceneFadeOut: 0.5,
    lipsyncTolerance: 0.5,
    minSceneDuration: 2,
    maxSceneDuration: 120,
    ttsPadding: 2,
    lowerThirdDuration: 5,
    lowerThirdDelay: 0.5,
    videoLeadInMax: 8,
    videoLeadInRatio: 0.4,
  },

  audio: {
    ttsVolume: 1.0,
    musicDucked: 0.20,
    musicForward: 0.50,
    musicFadeIn: 0.8,
    musicFadeOut: 0.8,
    sfxVolume: 0.6,
    sfxFadeIn: 0.05,
    sfxFadeOut: 0.8,
    sfxMaxDuration: 3,
  },

  kenBurns: {
    standard: [
      { zoom: 18, pan: 'left',         panDistance: 0.20 },
      { zoom: 22, pan: 'right',        panDistance: 0.18 },
      { zoom: 18, pan: 'top-left',     panDistance: 0.22 },
      { zoom: 22, pan: 'bottom-right', panDistance: 0.18 },
      { zoom: 25, pan: 'top',          panDistance: 0.15 },
      { zoom: 18, pan: 'bottom',       panDistance: 0.15 },
      { zoom: 22, pan: 'bottom-left',  panDistance: 0.20 },
      { zoom: 25, pan: 'top-right',    panDistance: 0.22 },
    ],
    screenshot: [
      { zoom: 5, pan: 'left',          panDistance: 0.08 },
      { zoom: 6, pan: 'right',         panDistance: 0.06 },
      { zoom: 5, pan: 'top',           panDistance: 0.08 },
      { zoom: 8, pan: 'bottom',        panDistance: 0.06 },
      { zoom: 6, pan: 'top-left',      panDistance: 0.08 },
      { zoom: 5, pan: 'bottom-right',  panDistance: 0.06 },
    ],
    bookend: { zoom: 4, pan: 'right', panDistance: 0.10 },
    randomize: true,
    moodIntensity: {
      wonder: 1.2,
      tension: 0.8,
      triumph: 1.3,
      warmth: 1.0,
      inspiring: 1.1,
      dramatic: 1.4,
      playful: 1.1,
      conversational: 0.9,
      authoritative: 0.85,
      empathetic: 0.95,
      mysterious: 1.15,
      celebratory: 1.25,
      urgent: 0.75,
      nostalgic: 0.9,
      provocative: 1.2,
      educational: 0.85,
    },
  },

  images: {
    resizeStrategy: 'adaptive',
    portraitStrategy: 'blur-sides',
    minSourceWidth: 640,
    minSourceHeight: 360,
    upscaleThreshold: 2.0,
    outputWidth: 1920,
    outputHeight: 1080,
  },

  encoding: {
    codec: 'h264_nvenc',
    crf: 23,
    maxBitrate: '6M',
    bufferSize: '10M',
    preset: 'medium',
    resolution: 'full-hd',
    maxFileSizeMB: 80,
  },

  text: {
    strokeRatio: 1 / 18,
    shadowOffset: [3, 3],
    shadowBlur: 8,
    glowAlpha: 90,
    glowColor: [255, 220, 120],
    maxWidth: 0.85,
    margin: 60,
    lineSpacing: 0.3,
  },

  transitions: {
    default: ['fade', 'dissolve', 'wipeleft', 'wiperight', 'circleopen'],
    byMood: {
      wonder: ['dissolve', 'fade', 'circleopen'],
      tension: ['wipeleft', 'wiperight', 'fade'],
      triumph: ['circleopen', 'dissolve', 'wipeleft'],
      warmth: ['fade', 'dissolve'],
      inspiring: ['dissolve', 'circleopen', 'fade'],
      educational: ['fade', 'wipeleft', 'dissolve'],
      dramatic: ['wiperight', 'circleopen', 'dissolve'],
      playful: ['circleopen', 'wipeleft', 'wiperight'],
      conversational: ['fade', 'dissolve'],
      authoritative: ['fade', 'wipeleft'],
      empathetic: ['dissolve', 'fade'],
      mysterious: ['dissolve', 'fade', 'circleopen'],
      celebratory: ['circleopen', 'dissolve', 'wiperight'],
      urgent: ['wipeleft', 'wiperight', 'fade'],
      nostalgic: ['dissolve', 'fade'],
      provocative: ['wiperight', 'circleopen'],
    },
    chapterTransitionDuration: 1.5,
    sceneTransitionDuration: 0.5,
    splitTransition: 'dissolve',
    splitTransitionDuration: 0.3,
  },

  lowerThird: {
    component: 'basic/050',
    heightWithLead: 150,
    heightNoLead: 100,
    verticalPosition: 0.78,
    horizontalMargin: 60,
    maxWidth: 0.65,
    accentBarWidth: 10,
    padding: 24,
    bgAlpha: 200,
    cornerRadius: 6,
    leadColor: '#94a3b8',
  },

  storybook: {
    borderColor: '#f5d77a',
    outerMargin: 40,
    innerMargin: 56,
    outerRadius: 4,
    innerRadius: 2,
    ornamentSize: 12,
  },

  pip: {
    glowColor: '#c4b5fd',
    glowSize: 8,
    borderRadius: 8,
  },

  colorGrading: {
    opening:    { rs: -0.02, gs: -0.02, bs: 0.04 },
    interlude:  { rs: 0.03,  gs: 0.01,  bs: -0.02 },
    tts:        { rs: -0.01, gs: 0.02,  bs: 0.03 },
    transition: { rs: 0.02,  gs: 0.01,  bs: 0.01 },
    closing:    { rs: 0.04,  gs: 0.02,  bs: -0.03 },
  },

  postProduction: {
    captionStyle: 'modern',
    watermarkPosition: 'bottom-right',
    watermarkOpacity: 0.7,
    gifWidth: 480,
    gifFps: 12,
    gifMaxColors: 128,
    thumbnailSizes: [
      { label: 'youtube', w: 1280, h: 720 },
      { label: 'linkedin', w: 1200, h: 627 },
      { label: 'tiktok', w: 1080, h: 1920 },
    ],
  },
};

// ── Corporate Clean Profile ─────────────────────────────────────────────────

export const PROFILE_CORPORATE_CLEAN: CastProfile = {
  ...PROFILE_CINEMATIC_DARK,
  id: 'corporate-clean',
  name: 'Corporate Clean',
  description: 'Professional, clean style — presentations, training, corporate communications. White background with blue accents.',

  colors: {
    background: '#ffffff',
    primary: '#1e40af',
    secondary: '#3b82f6',
    tertiary: '#374151',
    muted: '#6b7280',
    lowerThirdBg: '#f8fafc',
    lowerThirdAccent: '#1e40af',
    glowColor: '#3b82f6',
    captionBg: 'rgba(255,255,255,0.85)',
  },

  fonts: {
    ...PROFILE_CINEMATIC_DARK.fonts,
    family: 'Inter',
    titleSize: 64,
    closingTitleSize: 48,
  },

  timing: {
    ...PROFILE_CINEMATIC_DARK.timing,
    visualBeat: 10,
    lipsyncTolerance: 0.5,
  },

  audio: {
    ...PROFILE_CINEMATIC_DARK.audio,
    musicDucked: 0.10,
    musicForward: 0.30,
    sfxVolume: 0.4,
  },

  kenBurns: {
    ...PROFILE_CINEMATIC_DARK.kenBurns,
    standard: [
      { zoom: 8,  pan: 'left',         panDistance: 0.10 },
      { zoom: 10, pan: 'right',        panDistance: 0.08 },
      { zoom: 8,  pan: 'top-left',     panDistance: 0.10 },
      { zoom: 10, pan: 'bottom-right', panDistance: 0.08 },
    ],
    randomize: false,
  },

  images: {
    ...PROFILE_CINEMATIC_DARK.images,
    resizeStrategy: 'contain-blur',
    portraitStrategy: 'blur-sides',
  },

  colorGrading: {
    opening:    { rs: 0.0, gs: 0.0, bs: 0.01 },
    interlude:  { rs: 0.0, gs: 0.0, bs: 0.0 },
    tts:        { rs: 0.0, gs: 0.0, bs: 0.0 },
    transition: { rs: 0.0, gs: 0.0, bs: 0.0 },
    closing:    { rs: 0.0, gs: 0.0, bs: 0.01 },
  },
};

// ── Social Vibrant Profile ──────────────────────────────────────────────────

export const PROFILE_SOCIAL_VIBRANT: CastProfile = {
  ...PROFILE_CINEMATIC_DARK,
  id: 'social-vibrant',
  name: 'Social Vibrant',
  description: 'High-energy, attention-grabbing style — TikTok, Reels, Shorts. Bright colors, fast pacing, bold text.',

  colors: {
    background: '#0a0a0a',
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    tertiary: '#f7f7f7',
    muted: '#a0a0a0',
    lowerThirdBg: '#1a1a2e',
    lowerThirdAccent: '#ff6b6b',
    glowColor: '#ff6b6b',
    captionBg: 'rgba(0,0,0,0.75)',
  },

  fonts: {
    ...PROFILE_CINEMATIC_DARK.fonts,
    titleSize: 84,
    closingTitleSize: 64,
    captionSize: 28,
    kineticLargeSize: 56,
    kineticMediumSize: 42,
    kineticSmallSize: 32,
  },

  timing: {
    ...PROFILE_CINEMATIC_DARK.timing,
    visualBeat: 8,
    crossfadeOverlap: 0.3,
    sceneFadeIn: 0.3,
    sceneFadeOut: 0.3,
    lipsyncTolerance: 0.5,
  },

  audio: {
    ...PROFILE_CINEMATIC_DARK.audio,
    musicDucked: 0.30,
    musicForward: 0.60,
    sfxVolume: 0.8,
    sfxFadeIn: 0.02,
    sfxFadeOut: 0.5,
  },

  kenBurns: {
    ...PROFILE_CINEMATIC_DARK.kenBurns,
    standard: [
      { zoom: 25, pan: 'left',         panDistance: 0.25 },
      { zoom: 30, pan: 'right',        panDistance: 0.22 },
      { zoom: 25, pan: 'top-left',     panDistance: 0.28 },
      { zoom: 30, pan: 'bottom-right', panDistance: 0.22 },
      { zoom: 35, pan: 'top',          panDistance: 0.18 },
      { zoom: 25, pan: 'bottom',       panDistance: 0.18 },
    ],
    randomize: true,
    moodIntensity: {
      ...PROFILE_CINEMATIC_DARK.kenBurns.moodIntensity,
      wonder: 1.4,
      dramatic: 1.6,
      playful: 1.3,
    },
  },

  transitions: {
    ...PROFILE_CINEMATIC_DARK.transitions,
    default: ['wipeleft', 'wiperight', 'circleopen', 'fade'],
    sceneTransitionDuration: 0.3,
  },
};

// ── Profile Registry ────────────────────────────────────────────────────────

const PROFILE_REGISTRY: Record<string, CastProfile> = {
  'cinematic-dark': PROFILE_CINEMATIC_DARK,
  'corporate-clean': PROFILE_CORPORATE_CLEAN,
  'social-vibrant': PROFILE_SOCIAL_VIBRANT,
};

/**
 * Get a CastProfile by ID. Falls back to cinematic-dark if not found.
 */
export function getCastProfile(id: string): CastProfile {
  return PROFILE_REGISTRY[id] || PROFILE_CINEMATIC_DARK;
}

/**
 * List all available profile IDs.
 */
export function listCastProfiles(): Array<{ id: string; name: string; description: string }> {
  return Object.values(PROFILE_REGISTRY).map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
  }));
}

/**
 * Create a custom profile by merging overrides onto a base profile.
 */
export function createCastProfile(
  baseId: string,
  overrides: Partial<CastProfile> & { id: string; name: string },
): CastProfile {
  const base = getCastProfile(baseId);
  return {
    ...base,
    ...overrides,
    colors: { ...base.colors, ...overrides.colors },
    fonts: { ...base.fonts, ...overrides.fonts },
    timing: { ...base.timing, ...overrides.timing },
    audio: { ...base.audio, ...overrides.audio },
    kenBurns: { ...base.kenBurns, ...overrides.kenBurns },
    images: { ...base.images, ...overrides.images },
    encoding: { ...base.encoding, ...overrides.encoding },
    text: { ...base.text, ...overrides.text },
    transitions: { ...base.transitions, ...overrides.transitions },
    lowerThird: { ...base.lowerThird, ...overrides.lowerThird },
    storybook: { ...base.storybook, ...overrides.storybook },
    pip: { ...base.pip, ...overrides.pip },
    colorGrading: { ...base.colorGrading, ...overrides.colorGrading },
    postProduction: { ...base.postProduction, ...overrides.postProduction },
  };
}

/**
 * Serialize a CastProfile to a flat dict suitable for embedding in timeline JSON.
 * The RunPod FFmpeg worker reads this from the timeline payload.
 */
export function serializeProfileForTimeline(profile: CastProfile): Record<string, any> {
  return {
    _profileId: profile.id,
    _profile: {
      colors: profile.colors,
      fonts: profile.fonts,
      timing: profile.timing,
      audio: profile.audio,
      images: profile.images,
      encoding: profile.encoding,
      text: profile.text,
      lowerThird: profile.lowerThird,
      storybook: profile.storybook,
      pip: profile.pip,
      colorGrading: profile.colorGrading,
      postProduction: profile.postProduction,
    },
  };
}
