/**
 * Cast Timeline Engine — Professional assembly for Genie Cast
 *
 * Architecture: One scene per TTS line (5-20s each)
 * - Eliminates sub-scene splitting (scenes are naturally sized)
 * - Each scene carries its own TTS audio at start=0 (no duplication)
 * - Music loops in every scene (seamless ambient playback)
 * - Kinetic images get dedicated interlude scenes
 * - Rich transition scenes between chapters with AI visuals
 * - Reusable across any Cast project (not EP04-specific)
 */

// ── Exported Types ─────────────────────────────────────────────────────────

export interface CastTTSLine {
  url: string;
  start: number;   // absolute time within chapter
  duration: number;
  voice: string;
  key?: string;
}

export interface CastLipsyncClip {
  url: string;
  start: number;   // absolute time within chapter
  duration: number;
  character: string;
}

export interface CastKineticText {
  text: string;
  start: number;   // absolute time within chapter
  duration: number;
  style: string;    // '003' word-by-word, '005' jumping
  imageUrl?: string; // FLUX-generated kinetic text image (if available)
}

export interface CastChapter {
  id: string;
  title: string;
  duration: number;
  ttsLines: CastTTSLine[];
  lipsyncClips: CastLipsyncClip[];
  videos: string[];            // B-roll video URLs (non-lipsync)
  images: string[];            // B-roll image URLs (non-kinetic, including avatars)
  musicUrl?: string;
  musicLoop?: boolean;
  sfxTimings?: Array<{ url: string; start: number; duration: number }>;
  kineticTexts?: CastKineticText[];
}

export interface CastTransition {
  from: string;
  to: string;
  style: string;
  duration: number;
  bridgeAudioUrl?: string;
  bridgeDuration?: number;
  transitionImageUrl?: string;    // AI-generated transition visual
  chapterHeaderImageUrl?: string; // AI-generated storybook frame
  sfxUrl?: string;
  chapterTitle?: string;
  j2vTransition: string;          // JSON2Video transition preset
}

export interface CastBookends {
  opening: {
    duration: number;
    backgroundUrl?: string;
    title?: string;
    subtitle?: string;
    episodeTag?: string;
    brand?: string;
  };
  closing: {
    duration: number;
    backgroundUrl?: string;
    closingTitle?: string;
    closingSubtitle?: string;
    closingBrand?: string;
  };
}

export interface CastSpeakerInfo {
  [character: string]: {
    headline: string;
    lead: string;
    barColor: string;
    avatarUrl?: string;
  };
}

export interface CastTimelineResult {
  resolution: string;
  quality: string;
  scenes: Array<Record<string, any>>;
  _totalDuration: number;
}

// ── Internal Types ─────────────────────────────────────────────────────────

type J2VElement = Record<string, any>;
type J2VScene = Record<string, any>;

// ── Theme Configuration ──────────────────────────────────────────────────
// Extracted from EP04-hardcoded values into a configurable theme.
// Pass a CastTheme to buildCastTimeline to customize colors, fonts, timing.

export interface CastTheme {
  /** Dark background color */
  backgroundColor: string;
  /** Primary accent color (titles) */
  primaryColor: string;
  /** Secondary accent color (subtitles) */
  secondaryColor: string;
  /** Tertiary text color (descriptions) */
  tertiaryColor: string;
  /** Metadata/muted text color */
  mutedColor: string;
  /** Font family */
  fontFamily: string;
  /** Music volume when TTS narration present (0-10 range for JSON2Video) */
  musicVolumeDucked: number;
  /** Music volume for instrumental-only scenes (0-10 range) */
  musicVolumeForward: number;
  /** SFX volume (0-10 range) */
  sfxVolume: number;
  /** Seconds per visual beat (how often to cycle B-roll images) */
  visualBeat: number;
  /** Opening bookend transition duration (seconds) */
  openingFadeDuration: number;
  /** Closing bookend fade-out duration (seconds) */
  closingFadeDuration: number;
  /** Whether to generate subtitle track */
  subtitlesEnabled: boolean;
  /** Subtitle position */
  subtitlePosition: 'bottom-left' | 'bottom-right' | 'center-center';
  /** RTL text direction for subtitles */
  subtitleRTL: boolean;
}

/** Default theme — matches EP04 cinematic style */
export const DEFAULT_CAST_THEME: CastTheme = {
  backgroundColor: '#0f0a1a',
  primaryColor: '#f5d77a',
  secondaryColor: '#c4b5fd',
  tertiaryColor: '#e2e8f0',
  mutedColor: '#94a3b8',
  fontFamily: 'Inter',
  musicVolumeDucked: 0.20,
  musicVolumeForward: 0.50,
  sfxVolume: 0.6,
  visualBeat: 12,
  openingFadeDuration: 1.5,
  closingFadeDuration: 2.0,
  subtitlesEnabled: true,
  subtitlePosition: 'bottom-left',
  subtitleRTL: false,
};

// ── Constants ──────────────────────────────────────────────────────────────

// 8 Ken Burns patterns — cinematic zoom + pan drift (Pixar/documentary style).
// JSON2Video zoom is PERCENTAGE: 1=1%, 5=5%, 10=10% (range: -10 to 10).
// pan-distance range: 0.01-0.5 (API default: 0.1). We use 0.08-0.12 for visible drift.
// Combined: subtle 3-5% zoom-in with gentle directional glide across the frame.
const KEN_BURNS_PATTERNS = [
  { zoom: 3, pan: 'left'         as const, 'pan-distance': 0.12 },
  { zoom: 4, pan: 'right'        as const, 'pan-distance': 0.10 },
  { zoom: 3, pan: 'top-left'     as const, 'pan-distance': 0.12 },
  { zoom: 4, pan: 'bottom-right' as const, 'pan-distance': 0.10 },
  { zoom: 5, pan: 'top'          as const, 'pan-distance': 0.10 },
  { zoom: 3, pan: 'bottom'       as const, 'pan-distance': 0.08 },
  { zoom: 4, pan: 'bottom-left'  as const, 'pan-distance': 0.10 },
  { zoom: 5, pan: 'top-right'    as const, 'pan-distance': 0.12 },
];

// Scene transition styles cycled between TTS-line scenes (FALLBACK — mood-based preferred)
const SCENE_TRANSITIONS = ['fade', 'dissolve', 'wipeleft', 'wiperight', 'circleopen'];

// ── Mood-Based Transition Mapping ────────────────────────────────────────
// Maps emotional mood → preferred transition style (replaces random cycling)
const MOOD_TRANSITION_MAP: Record<string, string[]> = {
  'wonder':        ['dissolve', 'fade', 'circleopen'],
  'tension':       ['wipeleft', 'wiperight', 'fade'],
  'triumph':       ['circleopen', 'dissolve', 'wipeleft'],
  'warmth':        ['fade', 'dissolve'],
  'inspiring':     ['dissolve', 'circleopen', 'fade'],
  'educational':   ['fade', 'wipeleft', 'dissolve'],
  'dramatic':      ['wiperight', 'circleopen', 'dissolve'],
  'playful':       ['circleopen', 'wipeleft', 'wiperight'],
  'conversational':['fade', 'dissolve'],
  'authoritative': ['fade', 'wipeleft'],
  'empathetic':    ['dissolve', 'fade'],
  'mysterious':    ['dissolve', 'fade', 'circleopen'],
  'celebratory':   ['circleopen', 'dissolve', 'wiperight'],
  'urgent':        ['wipeleft', 'wiperight', 'fade'],
  'nostalgic':     ['dissolve', 'fade'],
  'provocative':   ['wiperight', 'circleopen'],
};

/**
 * Get transition style based on mood.
 * Falls back to cycling SCENE_TRANSITIONS if mood not recognized.
 */
function getMoodTransition(mood: string | undefined, index: number): string {
  if (mood && MOOD_TRANSITION_MAP[mood]) {
    const styles = MOOD_TRANSITION_MAP[mood];
    return styles[index % styles.length];
  }
  return SCENE_TRANSITIONS[index % SCENE_TRANSITIONS.length];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function detectMediaType(url: string): 'video' | 'image' {
  if (url.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i)) return 'video';
  if (url.match(/\.(png|jpg|jpeg|webp|gif|svg|bmp)(\?|$)/i)) return 'image';
  if (url.includes('/video/') || url.includes('/videos/')) return 'video';
  if (url.includes('/image/') || url.includes('/images/') || url.includes('/avatar/')) return 'image';
  return 'image'; // safe default
}

function isHttpUrl(url: string | undefined | null): url is string {
  return !!url && url.startsWith('http');
}

function getKenBurns(idx: number) {
  return KEN_BURNS_PATTERNS[idx % KEN_BURNS_PATTERNS.length];
}

/** Filter out elements with invalid duration or missing src */
function filterSafeElements(elements: J2VElement[]): J2VElement[] {
  return elements.filter(el => {
    if (el.duration != null && el.duration <= 0) return false;
    if ((el.type === 'video' || el.type === 'image' || el.type === 'audio') && !el.src) return false;
    return true;
  });
}

// ── Scene Builders ─────────────────────────────────────────────────────────

function makeOpeningBookend(opening: CastBookends['opening']): J2VScene {
  const dur = opening.duration;
  const elements: J2VElement[] = [];

  // Background image with Ken Burns
  if (isHttpUrl(opening.backgroundUrl)) {
    elements.push({
      type: 'image', src: opening.backgroundUrl,
      start: 0, duration: dur,
      zoom: 4, pan: 'right', 'pan-distance': 0.10,
      resize: 'cover',
      'fade-in': 1.5, 'fade-out': 0.8,
      'z-index': 0,
      width: 1920, height: 1080,
    });
  }

  // Staggered kinetic text
  if (opening.episodeTag) {
    elements.push({
      type: 'text', text: opening.episodeTag,
      style: '002', start: 1, duration: dur - 1,
      settings: {
        'font-family': 'Inter', 'font-size': '24px', 'font-color': '#c4b5fd',
        'font-weight': '600', 'letter-spacing': '6px',
        'text-shadow': '2px 2px 8px rgba(0,0,0,0.9)',
      },
      position: 'center-center',
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 20,
    });
  }
  if (opening.title) {
    elements.push({
      type: 'text', text: opening.title,
      style: '003', start: 2.5, duration: dur - 2.5,
      settings: {
        'font-family': 'Inter', 'font-size': '72px', 'font-color': '#f5d77a',
        'font-weight': '700',
        'text-shadow': '4px 4px 16px rgba(0,0,0,0.95)',
      },
      position: 'center-center',
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 20,
    });
  }
  if (opening.subtitle) {
    elements.push({
      type: 'text', text: opening.subtitle,
      style: '002', start: 4.5, duration: dur - 4.5,
      settings: {
        'font-family': 'Inter', 'font-size': '28px', 'font-color': '#e2e8f0',
        'text-shadow': '2px 2px 8px rgba(0,0,0,0.8)',
      },
      position: 'center-center',
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 20,
    });
  }
  if (opening.brand) {
    elements.push({
      type: 'text', text: opening.brand,
      style: '002', start: 7, duration: dur - 7,
      settings: {
        'font-family': 'Inter', 'font-size': '20px', 'font-color': '#94a3b8',
        'font-weight': '500', 'letter-spacing': '3px',
        'text-shadow': '2px 2px 6px rgba(0,0,0,0.7)',
      },
      position: 'bottom-left',
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 20,
    });
  }

  return {
    comment: 'Opening Bookend — Cinematic Reveal',
    duration: dur,
    'background-color': '#0f0a1a',
    elements: filterSafeElements(elements),
    transition: { style: 'fade', duration: 1.5 },
  };
}

function makeClosingBookend(closing: CastBookends['closing']): J2VScene {
  const dur = closing.duration;
  const elements: J2VElement[] = [];

  if (isHttpUrl(closing.backgroundUrl)) {
    elements.push({
      type: 'image', src: closing.backgroundUrl,
      start: 0, duration: dur,
      zoom: 3, pan: 'left', 'pan-distance': 0.10,
      resize: 'cover',
      'fade-in': 0.8, 'fade-out': 2.0,
      'z-index': 0,
      width: 1920, height: 1080,
    });
  }

  elements.push({
    type: 'text', text: closing.closingTitle || 'Thank You for Watching',
    style: '003', start: 1, duration: dur - 1,
    settings: {
      'font-family': 'Inter', 'font-size': '56px', 'font-color': '#f5d77a',
      'font-weight': '700',
      'text-shadow': '4px 4px 16px rgba(0,0,0,0.95)',
    },
    position: 'center-center',
    'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 20,
  });
  elements.push({
    type: 'text', text: closing.closingSubtitle || 'The sprint continues...',
    style: '002', start: 3.5, duration: dur - 3.5,
    settings: {
      'font-family': 'Inter', 'font-size': '28px', 'font-color': '#e2e8f0',
      'text-shadow': '2px 2px 8px rgba(0,0,0,0.8)',
    },
    position: 'center-center',
    'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 20,
  });
  elements.push({
    type: 'text', text: closing.closingBrand || 'Built with GenieSuite Cast  |  Follow @GenieSuite',
    style: '002', start: 6, duration: dur - 6,
    settings: {
      'font-family': 'Inter', 'font-size': '22px', 'font-color': '#c4b5fd',
      'font-weight': '500', 'letter-spacing': '2px',
      'text-shadow': '2px 2px 6px rgba(0,0,0,0.7)',
    },
    position: 'bottom-left',
    'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 20,
  });

  return {
    comment: 'Closing Bookend — CTA',
    duration: dur,
    'background-color': '#0f0a1a',
    elements: filterSafeElements(elements),
  };
}

/**
 * Dedicated kinetic text image scene — full-frame FLUX image with animated text overlay.
 * These are cinematic title cards at narrative key moments.
 */
function makeKineticImageScene(kt: CastKineticText, kbIdx: number): J2VScene {
  const dur = Math.max(5, kt.duration);
  const kb = getKenBurns(kbIdx);
  const elements: J2VElement[] = [];

  if (isHttpUrl(kt.imageUrl)) {
    // Full-frame kinetic image background with cinematic Ken Burns
    elements.push({
      type: 'image', src: kt.imageUrl,
      start: 0, duration: dur,
      ...kb, resize: 'cover', width: 1920, height: 1080,
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 0,
    });
  }

  // Animated text overlay echoing the kinetic text
  const fontSize = kt.text.length > 100 ? '28px' : kt.text.length > 50 ? '36px' : '48px';
  elements.push({
    type: 'text', text: kt.text,
    style: '003', // word-by-word
    start: 0.5, duration: dur - 0.5,
    settings: {
      'font-family': 'Inter', 'font-size': fontSize, 'font-color': '#f5d77a',
      'font-weight': '700',
      'text-shadow': '4px 4px 16px rgba(0,0,0,0.95)',
      'background-color': 'rgba(15,10,26,0.5)', padding: '16px 32px',
    },
    position: 'center-center',
    'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 20,
  });

  return {
    comment: `Kinetic Title: ${kt.text.substring(0, 50)}`,
    duration: dur,
    'background-color': '#0f0a1a',
    elements: filterSafeElements(elements),
    transition: { style: 'fade', duration: 0.8 },
  };
}

/**
 * Rich transition scene between chapters — AI-generated visuals + chapter title.
 */
function makeTransitionScene(t: CastTransition): J2VScene {
  const dur = t.duration;
  const elements: J2VElement[] = [];

  // Background: AI transition visual or next chapter's first image
  const bgUrl = t.transitionImageUrl || t.chapterHeaderImageUrl;
  if (isHttpUrl(bgUrl)) {
    const mediaType = detectMediaType(bgUrl);
    elements.push({
      type: mediaType, src: bgUrl,
      start: 0, duration: dur,
      ...(mediaType === 'video'
        ? { volume: 0 }
        : { zoom: 4, pan: 'right', 'pan-distance': 0.10 }),
      resize: 'cover', width: 1920, height: 1080,
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 0,
    });
  }

  // Chapter header image overlay (if separate from transition visual)
  if (t.transitionImageUrl && isHttpUrl(t.chapterHeaderImageUrl)) {
    elements.push({
      type: 'image', src: t.chapterHeaderImageUrl,
      start: dur * 0.4, duration: dur * 0.6,
      zoom: 3, pan: 'left', 'pan-distance': 0.08,
      resize: 'cover', width: 1920, height: 1080,
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 5,
    });
  }

  // Chapter title text with dark pill background for readability
  const titleText = t.chapterTitle
    || t.style.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  elements.push({
    type: 'text', text: titleText,
    style: '003', // word-by-word
    start: 0.3, duration: dur - 0.5,
    settings: {
      'font-family': 'Inter',
      'font-size': t.chapterTitle ? '42px' : '36px',
      'font-color': '#f5d77a',
      'font-weight': '700',
      'text-shadow': '4px 4px 16px rgba(0,0,0,0.95)',
      'background-color': 'rgba(15,10,26,0.6)',
      padding: '20px 40px',
    },
    position: 'center-center',
    'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 25,
  });

  // Bridge narrator audio
  if (isHttpUrl(t.bridgeAudioUrl)) {
    elements.push({
      type: 'audio', src: t.bridgeAudioUrl,
      start: 0.5, duration: t.bridgeDuration || dur,
      volume: 1.0,
    });
  }

  // Transition SFX (cinematic punch)
  if (isHttpUrl(t.sfxUrl)) {
    elements.push({
      type: 'audio', src: t.sfxUrl,
      start: 0, duration: Math.min(3, dur),
      volume: 0.6, 'fade-in': 0.05, 'fade-out': 0.8,
    });
  }

  return {
    comment: `Transition: ${t.from} → ${t.to} (${t.style})`,
    duration: dur,
    'background-color': '#0f0a1a',
    elements: filterSafeElements(elements),
    transition: { style: t.j2vTransition || 'fade', duration: 1.5 },
  };
}

/**
 * Per-TTS-line scene — the core building block.
 * Visual pacing: B-roll lead-in → lipsync talking head → B-roll tail.
 */
function makeTtsLineScene(
  tts: CastTTSLine,  // start already rebased to 0
  sceneDur: number,
  chapterId: string,
  lipsync: CastLipsyncClip | undefined,
  videoVisual: string | undefined,
  imageVisual: string | undefined,
  tailImageVisual: string | undefined,
  music: { url: string; loop: boolean } | undefined,
  sfx: Array<{ url: string; start: number; duration: number }>,
  speakerChanged: boolean,
  speakerInfo: { headline: string; lead: string; barColor: string; avatarUrl?: string } | undefined,
  kineticOverlay: CastKineticText | undefined,
  kbIdx: number,
  transitionStyle: string,
  allImages?: string[],  // full image pool for cycling in long scenes
): J2VScene {
  const elements: J2VElement[] = [];

  // ── Visual layer (z-index 0-1) ──────────────────────────────────────────
  if (lipsync && isHttpUrl(lipsync.url)) {
    // Visual pacing with lipsync
    const lipsyncStart = sceneDur <= 10 ? 0 : Math.min(4, sceneDur - lipsync.duration);
    const lipsyncDur = Math.min(lipsync.duration, sceneDur - lipsyncStart);

    // Lead-in B-roll (for scenes > 10s with available visual)
    if (lipsyncStart > 0) {
      const leadUrl = videoVisual || imageVisual;
      if (isHttpUrl(leadUrl)) {
        const leadType = videoVisual ? 'video' : 'image';
        const kb = getKenBurns(kbIdx);
        elements.push({
          type: leadType, src: leadUrl,
          start: 0, duration: lipsyncStart + 0.5, // 0.5s overlap for crossfade
          ...(leadType === 'video' ? { volume: 0 } : kb),
          resize: 'cover', width: 1920, height: 1080,
          'fade-in': 0.3, 'fade-out': 0.5, 'z-index': 0,
        });
      }
    }

    // Lipsync talking head — FULL SCREEN, MUTED (TTS audio is separate element)
    // Use 'cover' for full-screen display. The lipsync video IS the visual for
    // this time window — it must fill the entire frame, not be letterboxed.
    // z-index 2 ensures it renders ABOVE any B-roll lead-in/tail images.
    elements.push({
      type: 'video', src: lipsync.url,
      start: lipsyncStart, duration: lipsyncDur,
      volume: 0, // CRITICAL: lipsync has TTS baked in, TTS is separate audio element
      'fade-in': 0.3, 'fade-out': 1.0, // 1s fade hides WAN2.2 loop artifacts
      'z-index': 2, // above B-roll (0) and lead-in images (1)
      resize: 'cover', width: 1920, height: 1080,
    });

    // Tail B-roll (if lipsync ends before scene)
    const lipsyncEnd = lipsyncStart + lipsyncDur;
    if (lipsyncEnd < sceneDur - 1) {
      const tailUrl = tailImageVisual || imageVisual;
      if (isHttpUrl(tailUrl)) {
        const kb2 = getKenBurns(kbIdx + 1);
        elements.push({
          type: 'image', src: tailUrl,
          start: lipsyncEnd - 0.5, duration: sceneDur - lipsyncEnd + 0.5,
          ...kb2, resize: 'cover', width: 1920, height: 1080,
          'fade-in': 0.5, 'fade-out': 0.3, 'z-index': 0,
        });
      }
    }
  } else {
    // No lipsync — full B-roll with visual cycling for long scenes
    const VISUAL_BEAT = 12; // seconds per visual beat — cinematic pacing (was 15)
    if (isHttpUrl(videoVisual)) {
      const videoDur = Math.min(10, sceneDur);
      elements.push({
        type: 'video', src: videoVisual,
        start: 0, duration: videoDur,
        volume: 0, resize: 'cover', width: 1920, height: 1080,
        'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 0,
      });
      // Fill remaining time with cycling images (not one static image)
      const remainStart = videoDur - 0.5;
      const remainDur = sceneDur - videoDur + 0.5;
      const cycleImages = (allImages && allImages.length > 1) ? allImages.filter(u => isHttpUrl(u)) : (isHttpUrl(imageVisual) ? [imageVisual] : []);
      if (cycleImages.length > 0 && remainDur > 0) {
        const beatCount = Math.max(1, Math.ceil(remainDur / VISUAL_BEAT));
        const beatDur = remainDur / beatCount;
        for (let bi = 0; bi < beatCount; bi++) {
          const img = cycleImages[(kbIdx + bi) % cycleImages.length];
          const kb = getKenBurns(kbIdx + bi);
          elements.push({
            type: 'image', src: img,
            start: remainStart + bi * beatDur, duration: beatDur + 0.5, // 0.5s overlap for crossfade
            ...kb, resize: 'cover', width: 1920, height: 1080,
            'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 0,
          });
        }
      }
    } else {
      // Image-only — cycle through multiple images for long scenes
      const cycleImages = (allImages && allImages.length > 1 && sceneDur > VISUAL_BEAT)
        ? allImages.filter(u => isHttpUrl(u))
        : (isHttpUrl(imageVisual) ? [imageVisual] : []);
      if (cycleImages.length > 0) {
        const beatCount = Math.max(1, Math.ceil(sceneDur / VISUAL_BEAT));
        const beatDur = sceneDur / beatCount;
        for (let bi = 0; bi < beatCount; bi++) {
          const img = cycleImages[(kbIdx + bi) % cycleImages.length];
          const kb = getKenBurns(kbIdx + bi);
          elements.push({
            type: 'image', src: img,
            start: bi * beatDur, duration: beatDur + (bi < beatCount - 1 ? 0.5 : 0), // overlap for crossfade
            ...kb, resize: 'cover', width: 1920, height: 1080,
            'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 0,
          });
        }
      }
    }
    // else: no visuals → dark background only (handled by scene background-color)
  }

  // ── TTS audio ───────────────────────────────────────────────────────────
  if (isHttpUrl(tts.url)) {
    elements.push({
      type: 'audio', src: tts.url,
      start: 0, duration: tts.duration,
      volume: 1.0,
    });
  }

  // ── Music (looped, adaptive ducking under narration) ────────────────────
  if (music && isHttpUrl(music.url)) {
    const hasTts = isHttpUrl(tts.url);
    const musicVolume = hasTts ? 0.20 : 0.50; // duck under narration, forward in instrumental
    elements.push({
      type: 'audio', src: music.url,
      start: 0, duration: sceneDur,
      volume: musicVolume, loop: music.loop ? -1 : 0,
      'fade-in': 0.8, 'fade-out': 0.8,
    });
  }

  // ── SFX (cinematic punch — fast attack, slow decay) ───────────────────
  sfx.forEach(s => {
    if (isHttpUrl(s.url)) {
      elements.push({
        type: 'audio', src: s.url,
        start: s.start, duration: s.duration,
        volume: 0.6, 'fade-in': 0.05, 'fade-out': 0.8,
      });
    }
  });

  // ── Lower-third speaker ID (z-index 30) ─────────────────────────────────
  if (speakerChanged && speakerInfo) {
    const ltDur = Math.min(5, sceneDur - 0.5);
    if (ltDur > 0.5) {
      // Use proven basic/050 (CNN lower-third) for all speakers.
      // basic/051 (avatar portrait) is not yet verified on JSON2Video —
      // use basic/050 to guarantee rendering.
      elements.push({
        type: 'component', component: 'basic/050',
        start: 0.5, duration: ltDur,
        settings: {
          headline: { text: speakerInfo.headline, color: speakerInfo.barColor },
          lead: { text: speakerInfo.lead, color: '#94a3b8' },
          bar: { background: speakerInfo.barColor },
        },
        position: 'bottom-left',
        'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 30,
      });
    }
  }

  // ── Kinetic text overlay (z-index 25) ── text-only, no dedicated image
  if (kineticOverlay) {
    const fontSize = kineticOverlay.text.length > 100 ? '24px'
      : kineticOverlay.text.length > 50 ? '32px' : '42px';
    elements.push({
      type: 'text', text: kineticOverlay.text,
      style: kineticOverlay.style,
      start: kineticOverlay.start, duration: kineticOverlay.duration,
      settings: {
        'font-family': 'Inter', 'font-size': fontSize, 'font-color': '#f5d77a',
        'font-weight': '700',
        'text-shadow': '3px 3px 12px rgba(0,0,0,0.95)',
        'background-color': 'rgba(15,10,26,0.5)', padding: '12px 24px',
      },
      position: 'center-center',
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 25,
    });
  }

  return {
    comment: `${chapterId} — ${tts.voice} (${tts.key || ''})`,
    duration: sceneDur,
    'background-color': '#0f0a1a',
    elements: filterSafeElements(elements),
    transition: { style: transitionStyle, duration: 0.5 },
  };
}

// ── Subtitle Track Builder ───────────────────────────────────────────────

/**
 * Generate subtitle elements for a scene from the TTS text.
 * Subtitle appears as a semi-transparent bar at the bottom of the frame.
 * Supports RTL text direction for Arabic/Hebrew/Urdu.
 */
function makeSubtitleElement(
  text: string,
  start: number,
  duration: number,
  theme: CastTheme
): J2VElement {
  const maxChars = 60;
  // Split long text into shorter subtitle-friendly chunks
  const displayText = text.length > maxChars
    ? text.substring(0, maxChars - 3) + '...'
    : text;

  return {
    type: 'text',
    text: displayText,
    style: '002', // simple appear
    start,
    duration: Math.max(1, duration),
    settings: {
      'font-family': theme.fontFamily,
      'font-size': '22px',
      'font-color': '#ffffff',
      'font-weight': '500',
      'text-shadow': '2px 2px 6px rgba(0,0,0,0.9)',
      'background-color': 'rgba(0,0,0,0.65)',
      padding: '8px 16px',
      ...(theme.subtitleRTL ? { direction: 'rtl' } : {}),
    },
    position: theme.subtitlePosition || 'bottom-left',
    'fade-in': 0.2,
    'fade-out': 0.2,
    'z-index': 35, // above lower-thirds (30)
  };
}

/**
 * Inject subtitle elements into scenes that have TTS text.
 * Call this after all scenes are built, before safety pass.
 */
function injectSubtitles(
  scenes: J2VScene[],
  chapters: CastChapter[],
  theme: CastTheme
): void {
  if (!theme.subtitlesEnabled) return;

  // Build a flat list of all TTS lines across all chapters
  const allTtsLines: Array<{ text: string; voice: string; key?: string; sceneComment?: string }> = [];
  for (const chapter of chapters) {
    for (const tts of chapter.ttsLines) {
      allTtsLines.push({
        text: tts.key || '', // key may contain readable text
        voice: tts.voice,
        key: tts.key,
      });
    }
  }

  // Match TTS lines to scenes by comment (which includes the key)
  for (const scene of scenes) {
    const comment: string = scene.comment || '';
    // Find TTS line for this scene from the chapter data
    const matchingLine = allTtsLines.find(l => l.key && comment.includes(l.key));
    if (matchingLine && matchingLine.text) {
      // Find the TTS audio element to sync timing
      const ttsAudio = (scene.elements || []).find(
        (el: J2VElement) => el.type === 'audio' && el.volume === 1.0
      );
      if (ttsAudio) {
        scene.elements.push(
          makeSubtitleElement(
            matchingLine.text,
            ttsAudio.start || 0,
            ttsAudio.duration || scene.duration || 5,
            theme
          )
        );
      }
    }
  }
}

// ── Chapter Builder ────────────────────────────────────────────────────────

/**
 * Builds per-TTS-line scenes for a chapter.
 * Each TTS line → one scene (5-20s). Kinetic images with FLUX images get
 * dedicated interlude scenes inserted at the right timestamp.
 */
function buildChapterScenes(chapter: CastChapter, speakers: CastSpeakerInfo, mood?: string): J2VScene[] {
  const scenes: J2VScene[] = [];
  const { ttsLines, lipsyncClips, videos, images, kineticTexts, musicUrl, musicLoop, sfxTimings } = chapter;

  // No TTS → single visual scene
  if (ttsLines.length === 0) {
    const dur = chapter.duration || 30;
    const elements: J2VElement[] = [];
    if (videos.length > 0 && isHttpUrl(videos[0])) {
      elements.push({
        type: 'video', src: videos[0],
        start: 0, duration: Math.min(10, dur),
        volume: 0, resize: 'cover', width: 1920, height: 1080,
        'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 0,
      });
    } else if (images.length > 0 && isHttpUrl(images[0])) {
      const kb = getKenBurns(0);
      elements.push({
        type: 'image', src: images[0],
        start: 0, duration: dur,
        ...kb, resize: 'cover', width: 1920, height: 1080,
        'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 0,
      });
    }
    elements.push({
      type: 'text', text: chapter.title || chapter.id,
      style: '002', start: 0.5, duration: Math.min(6, dur - 0.5),
      settings: {
        'font-family': 'Inter', 'font-size': '36px', 'font-color': '#ffffff',
        'font-weight': '600',
        'text-shadow': '2px 2px 8px rgba(0,0,0,0.7)',
        'background-color': 'rgba(15,10,26,0.6)', padding: '8px 16px',
      },
      position: 'bottom-left',
      'fade-in': 0.5, 'fade-out': 0.5, 'z-index': 25,
    });
    if (isHttpUrl(musicUrl)) {
      elements.push({
        type: 'audio', src: musicUrl,
        start: 0, duration: dur,
        volume: 0.50, loop: musicLoop ? -1 : 0,
        'fade-in': 0.8, 'fade-out': 0.8,
      });
    }
    scenes.push({
      comment: `${chapter.id} (visual only)`,
      duration: dur,
      'background-color': '#0f0a1a',
      elements: filterSafeElements(elements),
      transition: { style: 'fade', duration: 0.5 },
    });
    return scenes;
  }

  // ── Build per-TTS-line scenes ──
  let videoPoolIdx = 0;
  let imagePoolIdx = 0;
  let kbIdx = 0;
  let lastSpeaker = '';

  // Separate kinetic texts: those with images → dedicated scenes, text-only → overlays
  const kineticWithImages = (kineticTexts || [])
    .filter(kt => isHttpUrl(kt.imageUrl))
    .sort((a, b) => a.start - b.start);
  const kineticOverlaysOnly = (kineticTexts || [])
    .filter(kt => !isHttpUrl(kt.imageUrl));
  let kiIdx = 0;

  const music = isHttpUrl(musicUrl) ? { url: musicUrl, loop: !!musicLoop } : undefined;

  // Track used lipsync clips to prevent double-matching
  const usedLipsyncIndices = new Set<number>();

  for (let i = 0; i < ttsLines.length; i++) {
    const tts = ttsLines[i];
    const nextTts = ttsLines[i + 1];
    const sceneStart = tts.start;
    const sceneEnd = nextTts ? nextTts.start : chapter.duration;
    const sceneDur = Math.max(2, sceneEnd - sceneStart);

    // Insert kinetic image interlude scenes that fall before this TTS line
    while (kiIdx < kineticWithImages.length && kineticWithImages[kiIdx].start <= sceneStart + 1) {
      scenes.push(makeKineticImageScene(kineticWithImages[kiIdx], kbIdx++));
      kiIdx++;
    }

    // Find lipsync for this TTS line (match by character + timing within 2s)
    // Track used clips to prevent same clip matching two adjacent TTS lines
    const lipsyncIdx = lipsyncClips.findIndex((c, idx) =>
      !usedLipsyncIndices.has(idx) &&
      c.character === tts.voice &&
      Math.abs(c.start - tts.start) < 2
    );
    const lipsync = lipsyncIdx >= 0 ? lipsyncClips[lipsyncIdx] : undefined;
    if (lipsyncIdx >= 0) usedLipsyncIndices.add(lipsyncIdx);

    // Pick visuals from pool
    let videoVisual: string | undefined;
    let imageVisual: string | undefined;
    let tailImageVisual: string | undefined;

    if (!lipsync) {
      // No lipsync → use B-roll for entire scene
      if (videoPoolIdx < videos.length && isHttpUrl(videos[videoPoolIdx])) {
        videoVisual = videos[videoPoolIdx++];
      }
      if (images.length > 0 && isHttpUrl(images[imagePoolIdx % images.length])) {
        imageVisual = images[imagePoolIdx % images.length];
        imagePoolIdx++;
      }
    } else {
      // Has lipsync → B-roll video/images for lead-in (long scenes) and tail (any scene where lipsync ends early)
      if (sceneDur > 10) {
        // Also pick a video for lead-in (e.g., lamp/genie establishing shot before lipsync)
        if (videoPoolIdx < videos.length && isHttpUrl(videos[videoPoolIdx])) {
          videoVisual = videos[videoPoolIdx++];
        }
        // Only consume imageVisual when there's NO video lead-in.
        // When video IS the lead-in, imageVisual is just a fallback that never renders,
        // so consuming it wastes a pool slot and causes the next scene to cycle back
        // to an earlier image (e.g., host scene gets podcast-banner instead of cast-portrait).
        if (!videoVisual && images.length > 0 && isHttpUrl(images[imagePoolIdx % images.length])) {
          imageVisual = images[imagePoolIdx % images.length];
          imagePoolIdx++;
        }
        // Tail image: always pick one for the gap after lipsync ends
        if (images.length > 0 && isHttpUrl(images[imagePoolIdx % images.length])) {
          tailImageVisual = images[imagePoolIdx % images.length];
          imagePoolIdx++;
        }
      }
    }

    // Speaker change detection
    const speakerChanged = tts.voice !== lastSpeaker;
    const speakerInfo = speakers[tts.voice];
    lastSpeaker = tts.voice;

    // SFX within this time window (rebased to scene-relative)
    const sfx = (sfxTimings || [])
      .filter(s => s.start >= sceneStart && s.start < sceneEnd && isHttpUrl(s.url))
      .map(s => ({ ...s, start: s.start - sceneStart }));

    // Kinetic text overlay (text-only, no image) that falls within this scene
    const ktOverlay = kineticOverlaysOnly.find(kt =>
      kt.start >= sceneStart && kt.start < sceneEnd
    );
    const kineticOverlay = ktOverlay ? {
      ...ktOverlay,
      start: Math.max(0, ktOverlay.start - sceneStart), // rebase to scene-relative
    } : undefined;

    // Scene transition style — mood-aware when mood provided, else cycles for variety
    const transStyle = i === 0 ? 'fade' : getMoodTransition(mood, i);

    scenes.push(makeTtsLineScene(
      { ...tts, start: 0 }, // rebase TTS to start=0 within scene
      sceneDur,
      chapter.id,
      lipsync ? { ...lipsync, start: 0 } : undefined,
      videoVisual,
      imageVisual,
      tailImageVisual,
      music,
      sfx,
      speakerChanged,
      speakerInfo,
      kineticOverlay,
      kbIdx++,
      transStyle,
      images, // pass full image pool for cycling in long scenes
    ));
  }

  // Trailing kinetic images after last TTS line
  while (kiIdx < kineticWithImages.length) {
    scenes.push(makeKineticImageScene(kineticWithImages[kiIdx], kbIdx++));
    kiIdx++;
  }

  return scenes;
}

// ── Scene Splitting for JSON2Video Timeout Prevention ─────────────────────

/**
 * MAX_SCENE_DURATION — JSON2Video rendering timeout guard.
 *
 * JSON2Video times out rendering individual scenes that are too long.
 * Empirically: scenes >45s are risky, >60s almost always timeout.
 *
 * When a scene exceeds this limit, splitLongScenes() breaks it into
 * multiple sub-scenes of ~MAX_SCENE_DURATION each. Audio elements
 * get trimmed/offset so playback is seamless across the split.
 */
const MAX_SCENE_DURATION = 35; // seconds — safe ceiling for JSON2Video rendering

/**
 * Split any scene exceeding MAX_SCENE_DURATION into multiple sub-scenes.
 *
 * Strategy:
 * - Each sub-scene gets ~MAX_SCENE_DURATION seconds
 * - Visual elements (images) get Ken Burns cycling per sub-scene
 * - TTS audio uses JSON2Video's `seek` parameter to fast-forward to the
 *   correct offset in each sub-scene — narration plays seamlessly across splits
 * - Lipsync/B-roll videos also use `seek` for correct offset
 * - Music loops in every sub-scene (seamless)
 * - Transitions between sub-scenes use 'dissolve' for seamless feel
 *
 * The `seek` property (confirmed in JSON2Video API) specifies the time in
 * seconds at which the audio/video file should fast-forward to. This allows
 * splitting ANY scene (including TTS narration) without replay or quality loss.
 */
function splitLongScenes(scenes: J2VScene[]): J2VScene[] {
  const result: J2VScene[] = [];

  for (const scene of scenes) {
    const sceneDur = scene.duration || 0;

    // Short enough — keep as-is
    if (sceneDur <= MAX_SCENE_DURATION) {
      result.push(scene);
      continue;
    }

    const elements: J2VElement[] = scene.elements || [];

    const splitCount = Math.ceil(sceneDur / MAX_SCENE_DURATION);
    const subDur = sceneDur / splitCount;

    // Classify elements by type for smart redistribution
    const ttsAudios = elements.filter(el => el.type === 'audio' && el.volume === 1.0 && el.loop == null);
    const musicAudios = elements.filter(el => el.type === 'audio' && el.loop != null);
    const sfxAudios = elements.filter(el => el.type === 'audio' && el.loop == null && el.volume !== 1.0);
    const videos = elements.filter(el => el.type === 'video');
    const images = elements.filter(el => el.type === 'image');
    const texts = elements.filter(el => el.type === 'text');
    const components = elements.filter(el => el.type === 'component');

    const hasTts = ttsAudios.length > 0;
    console.log(`[CastEngine] Splitting ${sceneDur}s scene into ${splitCount} × ${subDur.toFixed(1)}s sub-scenes (TTS: ${hasTts ? 'yes, using seek offsets' : 'no'}): "${scene.comment}"`);

    // Collect all image URLs for cycling across sub-scenes
    const imageUrls = images.map(el => el.src).filter((s: string) => isHttpUrl(s));

    for (let si = 0; si < splitCount; si++) {
      const subStart = si * subDur;
      const subEnd = Math.min((si + 1) * subDur, sceneDur);
      const thisDur = subEnd - subStart;
      const subElements: J2VElement[] = [];

      // ── Visual: cycling Ken Burns images ──
      if (imageUrls.length > 0) {
        const imgUrl = imageUrls[si % imageUrls.length];
        const kb = getKenBurns(si);
        subElements.push({
          type: 'image', src: imgUrl,
          start: 0, duration: thisDur,
          ...kb, resize: 'cover', width: 1920, height: 1080,
          'fade-in': 0.3, 'fade-out': 0.3, 'z-index': 0,
        });
      }

      // ── Videos: only in the sub-scene where they overlap ──
      // For lipsync videos, use seek to jump to the correct offset
      for (const v of videos) {
        const vStart = v.start ?? 0;
        const vDur = v.duration ?? 0;
        const vEnd = vStart + vDur;
        if (vEnd > subStart && vStart < subEnd) {
          const clippedStart = Math.max(0, vStart - subStart);
          const clippedDur = Math.min(vEnd, subEnd) - Math.max(vStart, subStart);
          if (clippedDur > 1) {
            // Calculate seek offset: how far into the video source to jump
            const videoSeekOffset = Math.max(0, subStart - vStart);
            subElements.push({
              ...v,
              start: clippedStart,
              duration: clippedDur,
              ...(videoSeekOffset > 0 ? { seek: videoSeekOffset } : {}),
            });
          }
        }
      }

      // ── TTS audio: use seek to play correct portion in each sub-scene ──
      for (const tts of ttsAudios) {
        const ttsStart = tts.start ?? 0;
        const ttsDur = tts.duration ?? sceneDur;
        const ttsEnd = ttsStart + ttsDur;
        if (ttsEnd > subStart && ttsStart < subEnd) {
          // Calculate seek offset into the audio file
          const seekOffset = Math.max(0, subStart - ttsStart);
          const clippedStart = Math.max(0, ttsStart - subStart);
          const clippedDur = Math.min(ttsEnd, subEnd) - Math.max(ttsStart, subStart);
          subElements.push({
            ...tts,
            start: clippedStart,
            duration: clippedDur,
            seek: seekOffset,
            // No fade on internal splits — seamless narration continuity
            'fade-in': si === 0 ? (tts['fade-in'] || 0) : 0,
            'fade-out': si === splitCount - 1 ? (tts['fade-out'] || 0) : 0,
          });
        }
      }

      // ── Music: loop in every sub-scene (seamless) ──
      for (const m of musicAudios) {
        subElements.push({
          ...m,
          start: 0,
          duration: thisDur,
          'fade-in': si === 0 ? (m['fade-in'] || 0.8) : 0.1,
          'fade-out': si === splitCount - 1 ? (m['fade-out'] || 0.8) : 0.1,
        });
      }

      // ── SFX: only in the sub-scene where they fall ──
      for (const sfx of sfxAudios) {
        const sfxStart = sfx.start ?? 0;
        const sfxEnd = sfxStart + (sfx.duration ?? 0);
        if (sfxEnd > subStart && sfxStart < subEnd) {
          subElements.push({
            ...sfx,
            start: Math.max(0, sfxStart - subStart),
            duration: Math.min(sfxEnd, subEnd) - Math.max(sfxStart, subStart),
          });
        }
      }

      // ── Text: only in the first sub-scene ──
      if (si === 0) {
        for (const t of texts) {
          const tStart = t.start ?? 0;
          if (tStart < thisDur) {
            subElements.push({ ...t, duration: Math.min(t.duration ?? 5, thisDur - tStart) });
          }
        }
      }

      // ── Components: only in first sub-scene ──
      if (si === 0) {
        for (const c of components) {
          const cStart = c.start ?? 0;
          if (cStart < thisDur) {
            subElements.push({ ...c, duration: Math.min(c.duration ?? 5, thisDur - cStart) });
          }
        }
      }

      result.push({
        comment: `${scene.comment} [part ${si + 1}/${splitCount}]`,
        duration: thisDur,
        'background-color': scene['background-color'] || '#0f0a1a',
        elements: filterSafeElements(subElements),
        transition: si === 0
          ? scene.transition
          : { style: 'dissolve', duration: 0.3 },
      });
    }
  }

  return result;
}

// ── Safety Pass ────────────────────────────────────────────────────────────

/**
 * Clamp element durations, fix invalid zoom, ensure full-frame sizing.
 * Preserves all hard-won safety fixes.
 */
function applySafetyPass(scenes: J2VScene[]): void {
  for (const scene of scenes) {
    const sd = scene.duration || 0;
    // Filter out elements that start after scene ends
    scene.elements = (scene.elements || []).filter((el: J2VElement) => {
      const elStart = el.start ?? 0;
      if (elStart >= sd) return false; // element starts after scene ends — remove
      if (el.duration != null && el.duration <= 0) return false; // zero/negative duration
      return true;
    });
    for (const el of scene.elements) {
      const elStart = el.start ?? 0;
      // Clamp: element must not exceed scene duration
      if (elStart + (el.duration ?? 0) > sd) {
        el.duration = Math.max(0.5, sd - elStart);
      }
      // JSON2Video zoom is percentage (-10 to 10). Positive = zoom in, negative = zoom out.
      if (el.zoom != null) {
        el.zoom = Math.max(-10, Math.min(10, Math.round(el.zoom)));
      }
      // Full-frame: ensure all images/videos have explicit sizing
      if ((el.type === 'image' || el.type === 'video') && !el.width) {
        el.width = 1920;
        el.height = 1080;
      }
    }
  }
}

// ── Main Entry Point ───────────────────────────────────────────────────────

/**
 * Build a professional Cast timeline from chapters, transitions, and bookends.
 *
 * Architecture: one scene per TTS line (5-20s each).
 * Returns { resolution, quality, scenes, _totalDuration } ready for JSON2Video.
 *
 * @param chapters — ordered chapter data (TTS lines, visuals, music, SFX)
 * @param transitions — transitions between chapters
 * @param bookends — opening and closing sequences (null to skip)
 * @param speakers — speaker info for lower-third overlays
 * @param quality — 'draft' | 'production' | 'cinematic'
 * @param theme — visual theme (colors, fonts, timing). Defaults to DEFAULT_CAST_THEME.
 * @param mood — narrative mood for transition style selection (e.g., 'wonder', 'tension')
 */
export function buildCastTimeline(
  chapters: CastChapter[],
  transitions: CastTransition[],
  bookends: CastBookends | null,
  speakers: CastSpeakerInfo,
  quality: string,
  theme?: Partial<CastTheme>,
  mood?: string,
): CastTimelineResult {
  const resolvedTheme: CastTheme = { ...DEFAULT_CAST_THEME, ...theme };
  const resolution = quality === 'cinematic' ? '4k' : quality === 'production' ? 'full-hd' : 'hd';
  const scenes: J2VScene[] = [];

  // 1. Opening bookend (Part 1 only)
  if (bookends?.opening && bookends.opening.duration > 0) {
    scenes.push(makeOpeningBookend(bookends.opening));
  }

  // 2. Per-chapter scenes + chapter transitions (mood drives transition style selection)
  chapters.forEach((chapter, chapterIndex) => {
    const chapterScenes = buildChapterScenes(chapter, speakers, mood);
    scenes.push(...chapterScenes);

    // Transition after chapter (if exists)
    const transition = transitions[chapterIndex];
    if (transition) {
      scenes.push(makeTransitionScene(transition));
    }
  });

  // 3. Closing bookend (last Part only)
  if (bookends?.closing && bookends.closing.duration > 0) {
    scenes.push(makeClosingBookend(bookends.closing));
  }

  // 4. Inject subtitles if enabled
  injectSubtitles(scenes, chapters, resolvedTheme);

  // 5. Split long scenes to prevent JSON2Video rendering timeouts
  // Any scene > MAX_SCENE_DURATION (35s) gets split into sub-scenes.
  // This MUST happen before safety pass (safety pass clamps elements to scene duration).
  const splitScenes = splitLongScenes(scenes);

  // 6. Safety pass — clamp durations, fix zoom, ensure full-frame sizing
  applySafetyPass(splitScenes);

  const totalDuration = splitScenes.reduce((sum, s) => sum + (s.duration || 0), 0);
  const splitCount = splitScenes.length - scenes.length;
  console.log(`[CastEngine] Built timeline: ${splitScenes.length} scenes (${splitCount > 0 ? `${splitCount} from splitting` : 'no splits'}), ~${Math.round(totalDuration)}s (${Math.round(totalDuration / 60)}min), subtitles: ${resolvedTheme.subtitlesEnabled ? 'ON' : 'OFF'}`);

  return {
    resolution,
    quality: quality === 'cinematic' ? 'high' : 'medium',
    scenes: splitScenes,
    _totalDuration: totalDuration,
  };
}
