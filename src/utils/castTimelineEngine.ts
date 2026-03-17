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
 *
 * ALL rendering parameters driven by CastProfile — no hardcoded values.
 * Profile flows through: Frontend → Timeline JSON → RunPod FFmpeg worker.
 */

import {
  type CastProfile,
  type KenBurnsPattern,
  getProfileKenBurns,
  getCastProfile,
  serializeProfileForTimeline,
  PROFILE_CINEMATIC_DARK,
} from '@/config/castProfiles';

// ── Exported Types ─────────────────────────────────────────────────────────

export interface CastTTSLine {
  url: string;
  start: number;   // absolute time within chapter
  duration: number;
  voice: string;
  key?: string;
  text?: string;   // actual dialogue text for subtitles
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
  perTtsImages?: string[][];   // per-TTS-line image groups from pipeline config (semantic mapping)
  perTtsVideos?: string[][];   // per-TTS-line video groups from pipeline config (semantic mapping)
  musicUrl?: string;
  musicLoop?: boolean;
  sfxTimings?: Array<{ url: string; start: number; duration: number }>;
  kineticTexts?: CastKineticText[];
  screenshotUrls?: string[];   // URLs that are enhanced screenshots (get gentle Ken Burns)
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

// ── Re-export CastTheme for backwards compatibility ──────────────────────
// Callers using the old CastTheme interface can still pass partial overrides.
// Internally we resolve to a full CastProfile.

export interface CastTheme {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  mutedColor: string;
  fontFamily: string;
  musicVolumeDucked: number;
  musicVolumeForward: number;
  sfxVolume: number;
  visualBeat: number;
  openingFadeDuration: number;
  closingFadeDuration: number;
  subtitlesEnabled: boolean;
  subtitlePosition: 'bottom-left' | 'bottom-right' | 'center-center';
  subtitleRTL: boolean;
}

export const DEFAULT_CAST_THEME: CastTheme = {
  backgroundColor: PROFILE_CINEMATIC_DARK.colors.background,
  primaryColor: PROFILE_CINEMATIC_DARK.colors.primary,
  secondaryColor: PROFILE_CINEMATIC_DARK.colors.secondary,
  tertiaryColor: PROFILE_CINEMATIC_DARK.colors.tertiary,
  mutedColor: PROFILE_CINEMATIC_DARK.colors.muted,
  fontFamily: PROFILE_CINEMATIC_DARK.fonts.family,
  musicVolumeDucked: PROFILE_CINEMATIC_DARK.audio.musicDucked,
  musicVolumeForward: PROFILE_CINEMATIC_DARK.audio.musicForward,
  sfxVolume: PROFILE_CINEMATIC_DARK.audio.sfxVolume,
  visualBeat: PROFILE_CINEMATIC_DARK.timing.visualBeat,
  openingFadeDuration: PROFILE_CINEMATIC_DARK.timing.openingFade,
  closingFadeDuration: PROFILE_CINEMATIC_DARK.timing.closingFade,
  subtitlesEnabled: true,
  subtitlePosition: 'bottom-left',
  subtitleRTL: false,
};

// ── Internal Types ─────────────────────────────────────────────────────────

type J2VElement = Record<string, any>;
type J2VScene = Record<string, any>;

// ── Profile Resolution ───────────────────────────────────────────────────

/** Resolve a CastProfile from optional profileId, CastTheme overrides, or defaults */
function resolveProfile(profileId?: string, theme?: Partial<CastTheme>): CastProfile {
  const base = profileId ? getCastProfile(profileId) : PROFILE_CINEMATIC_DARK;
  if (!theme) return base;

  // Map old CastTheme fields onto the CastProfile structure
  return {
    ...base,
    colors: {
      ...base.colors,
      ...(theme.backgroundColor ? { background: theme.backgroundColor } : {}),
      ...(theme.primaryColor ? { primary: theme.primaryColor } : {}),
      ...(theme.secondaryColor ? { secondary: theme.secondaryColor } : {}),
      ...(theme.tertiaryColor ? { tertiary: theme.tertiaryColor } : {}),
      ...(theme.mutedColor ? { muted: theme.mutedColor } : {}),
    },
    fonts: {
      ...base.fonts,
      ...(theme.fontFamily ? { family: theme.fontFamily } : {}),
    },
    timing: {
      ...base.timing,
      ...(theme.visualBeat != null ? { visualBeat: theme.visualBeat } : {}),
      ...(theme.openingFadeDuration != null ? { openingFade: theme.openingFadeDuration } : {}),
      ...(theme.closingFadeDuration != null ? { closingFade: theme.closingFadeDuration } : {}),
    },
    audio: {
      ...base.audio,
      ...(theme.musicVolumeDucked != null ? { musicDucked: theme.musicVolumeDucked } : {}),
      ...(theme.musicVolumeForward != null ? { musicForward: theme.musicVolumeForward } : {}),
      ...(theme.sfxVolume != null ? { sfxVolume: theme.sfxVolume } : {}),
    },
  };
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

/** Get Ken Burns from profile (replaces old hardcoded array cycling) */
function getKB(profile: CastProfile, idx: number, isScreenshot: boolean, mood?: string): Record<string, any> {
  const kb = getProfileKenBurns(profile, idx, isScreenshot, mood);
  return {
    zoom: kb.zoom,
    pan: kb.pan,
    'pan-distance': kb.panDistance,
  };
}

/** Get transition style based on mood — uses profile's transition config */
function getMoodTransition(profile: CastProfile, mood: string | undefined, index: number): string {
  if (mood && profile.transitions.byMood[mood]) {
    const styles = profile.transitions.byMood[mood];
    return styles[index % styles.length];
  }
  return profile.transitions.default[index % profile.transitions.default.length];
}

/** Filter out elements with invalid duration or missing src */
function filterSafeElements(elements: J2VElement[]): J2VElement[] {
  return elements.filter(el => {
    if (el.duration != null && el.duration <= 0) return false;
    if ((el.type === 'video' || el.type === 'image' || el.type === 'audio') && !el.src) return false;
    return true;
  });
}

/** Get kinetic text font size based on text length — uses profile font sizes */
function getKineticFontSize(text: string, profile: CastProfile): string {
  if (text.length > 100) return `${profile.fonts.kineticSmallSize}px`;
  if (text.length > 50) return `${profile.fonts.kineticMediumSize}px`;
  return `${profile.fonts.kineticLargeSize}px`;
}

// ── Scene Builders ─────────────────────────────────────────────────────────

function makeOpeningBookend(opening: CastBookends['opening'], profile: CastProfile): J2VScene {
  const dur = opening.duration;
  const { colors, fonts, timing } = profile;
  const elements: J2VElement[] = [];

  // Background image with Ken Burns
  if (isHttpUrl(opening.backgroundUrl)) {
    const bk = profile.kenBurns.bookend;
    elements.push({
      type: 'image', src: opening.backgroundUrl,
      start: 0, duration: dur,
      zoom: bk.zoom, pan: bk.pan, 'pan-distance': bk.panDistance,
      resize: 'cover',
      'fade-in': timing.openingFade, 'fade-out': 0.8,
      'z-index': 0,
      width: profile.images.outputWidth, height: profile.images.outputHeight,
    });
  }

  // Staggered kinetic text
  if (opening.episodeTag) {
    elements.push({
      type: 'text', text: opening.episodeTag,
      style: '002', start: 1, duration: dur - 1,
      settings: {
        'font-family': fonts.family, 'font-size': `${fonts.tagSize}px`, 'font-color': colors.secondary,
        'font-weight': '600', 'letter-spacing': '6px',
        'text-shadow': '2px 2px 8px rgba(0,0,0,0.9)',
      },
      position: 'center-center',
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 20,
    });
  }
  if (opening.title) {
    elements.push({
      type: 'text', text: opening.title,
      style: '003', start: 2.5, duration: dur - 2.5,
      settings: {
        'font-family': fonts.family, 'font-size': `${fonts.titleSize}px`, 'font-color': colors.primary,
        'font-weight': '700',
        'text-shadow': '4px 4px 16px rgba(0,0,0,0.95)',
      },
      position: 'center-center',
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 20,
    });
  }
  if (opening.subtitle) {
    elements.push({
      type: 'text', text: opening.subtitle,
      style: '002', start: 4.5, duration: dur - 4.5,
      settings: {
        'font-family': fonts.family, 'font-size': `${fonts.subtitleSize}px`, 'font-color': colors.tertiary,
        'text-shadow': '2px 2px 8px rgba(0,0,0,0.8)',
      },
      position: 'center-center',
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 20,
    });
  }
  if (opening.brand) {
    elements.push({
      type: 'text', text: opening.brand,
      style: '002', start: 7, duration: dur - 7,
      settings: {
        'font-family': fonts.family, 'font-size': `${fonts.brandSize}px`, 'font-color': colors.muted,
        'font-weight': '500', 'letter-spacing': '3px',
        'text-shadow': '2px 2px 6px rgba(0,0,0,0.7)',
      },
      position: 'bottom-left',
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 20,
    });
  }

  return {
    comment: 'Opening Bookend — Cinematic Reveal',
    duration: dur,
    'background-color': colors.background,
    elements: filterSafeElements(elements),
    transition: { style: 'fade', duration: timing.openingFade },
  };
}

function makeClosingBookend(closing: CastBookends['closing'], profile: CastProfile): J2VScene {
  const dur = closing.duration;
  const { colors, fonts, timing } = profile;
  const elements: J2VElement[] = [];

  if (isHttpUrl(closing.backgroundUrl)) {
    const bk = profile.kenBurns.bookend;
    elements.push({
      type: 'image', src: closing.backgroundUrl,
      start: 0, duration: dur,
      zoom: bk.zoom, pan: 'left', 'pan-distance': bk.panDistance,
      resize: 'cover',
      'fade-in': 0.8, 'fade-out': timing.closingFade,
      'z-index': 0,
      width: profile.images.outputWidth, height: profile.images.outputHeight,
    });
  }

  elements.push({
    type: 'text', text: closing.closingTitle || 'Thank You for Watching',
    style: '003', start: 1, duration: dur - 1,
    settings: {
      'font-family': fonts.family, 'font-size': `${fonts.closingTitleSize}px`, 'font-color': colors.primary,
      'font-weight': '700',
      'text-shadow': '4px 4px 16px rgba(0,0,0,0.95)',
    },
    position: 'center-center',
    'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 20,
  });
  elements.push({
    type: 'text', text: closing.closingSubtitle || 'The sprint continues...',
    style: '002', start: 3.5, duration: dur - 3.5,
    settings: {
      'font-family': fonts.family, 'font-size': `${fonts.subtitleSize}px`, 'font-color': colors.tertiary,
      'text-shadow': '2px 2px 8px rgba(0,0,0,0.8)',
    },
    position: 'center-center',
    'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 20,
  });
  elements.push({
    type: 'text', text: closing.closingBrand || 'Built with GenieSuite Cast  |  Follow @GenieSuite',
    style: '002', start: 6, duration: dur - 6,
    settings: {
      'font-family': fonts.family, 'font-size': `${fonts.captionSize}px`, 'font-color': colors.secondary,
      'font-weight': '500', 'letter-spacing': '2px',
      'text-shadow': '2px 2px 6px rgba(0,0,0,0.7)',
    },
    position: 'bottom-left',
    'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 20,
  });

  return {
    comment: 'Closing Bookend — CTA',
    duration: dur,
    'background-color': colors.background,
    elements: filterSafeElements(elements),
  };
}

/**
 * Dedicated kinetic text image scene — full-frame FLUX image with animated text overlay.
 */
function makeKineticImageScene(kt: CastKineticText, kbIdx: number, profile: CastProfile, mood?: string): J2VScene {
  const dur = Math.max(5, kt.duration);
  const kb = getKB(profile, kbIdx, false, mood);
  const { colors, fonts, timing } = profile;
  const elements: J2VElement[] = [];

  if (isHttpUrl(kt.imageUrl)) {
    elements.push({
      type: 'image', src: kt.imageUrl,
      start: 0, duration: dur,
      ...kb, resize: 'cover', width: profile.images.outputWidth, height: profile.images.outputHeight,
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 0,
    });
  }

  const fontSize = getKineticFontSize(kt.text, profile);
  elements.push({
    type: 'text', text: kt.text,
    style: '003', // word-by-word
    start: 0.5, duration: dur - 0.5,
    settings: {
      'font-family': fonts.family, 'font-size': fontSize, 'font-color': colors.primary,
      'font-weight': '700',
      'text-shadow': '4px 4px 16px rgba(0,0,0,0.95)',
      'background-color': `${colors.background}80`, padding: '16px 32px',
    },
    position: 'center-center',
    'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 20,
  });

  return {
    comment: `Kinetic Title: ${kt.text.substring(0, 50)}`,
    duration: dur,
    'background-color': colors.background,
    elements: filterSafeElements(elements),
    transition: { style: 'fade', duration: 0.8 },
  };
}

/**
 * Rich transition scene between chapters — AI-generated visuals + chapter title.
 */
function makeTransitionScene(t: CastTransition, profile: CastProfile): J2VScene {
  const dur = t.duration;
  const { colors, fonts, timing, audio: audioProfile } = profile;
  const elements: J2VElement[] = [];

  // Background: AI transition visual or next chapter's first image
  const bgUrl = t.transitionImageUrl || t.chapterHeaderImageUrl;
  if (isHttpUrl(bgUrl)) {
    const mediaType = detectMediaType(bgUrl);
    const bk = profile.kenBurns.bookend;
    elements.push({
      type: mediaType, src: bgUrl,
      start: 0, duration: dur,
      ...(mediaType === 'video'
        ? { volume: 0 }
        : { zoom: bk.zoom, pan: bk.pan, 'pan-distance': bk.panDistance }),
      resize: 'cover', width: profile.images.outputWidth, height: profile.images.outputHeight,
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 0,
    });
  }

  // Chapter header image overlay (if separate from transition visual)
  if (t.transitionImageUrl && isHttpUrl(t.chapterHeaderImageUrl)) {
    elements.push({
      type: 'image', src: t.chapterHeaderImageUrl,
      start: dur * 0.4, duration: dur * 0.6,
      zoom: 3, pan: 'left', 'pan-distance': 0.08,
      resize: 'cover', width: profile.images.outputWidth, height: profile.images.outputHeight,
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 5,
    });
  }

  // Chapter title text
  const titleText = t.chapterTitle
    || t.style.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  elements.push({
    type: 'text', text: titleText,
    style: '003',
    start: 0.3, duration: dur - 0.5,
    settings: {
      'font-family': fonts.family,
      'font-size': t.chapterTitle ? '42px' : '36px',
      'font-color': colors.primary,
      'font-weight': '700',
      'text-shadow': '4px 4px 16px rgba(0,0,0,0.95)',
      'background-color': `${colors.background}99`,
      padding: '20px 40px',
    },
    position: 'center-center',
    'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 25,
  });

  // Bridge narrator audio
  if (isHttpUrl(t.bridgeAudioUrl)) {
    elements.push({
      type: 'audio', src: t.bridgeAudioUrl,
      start: 0.5, duration: t.bridgeDuration || dur,
      volume: audioProfile.ttsVolume,
    });
  }

  // Transition SFX
  if (isHttpUrl(t.sfxUrl)) {
    elements.push({
      type: 'audio', src: t.sfxUrl,
      start: 0, duration: Math.min(audioProfile.sfxMaxDuration, dur),
      volume: audioProfile.sfxVolume,
      'fade-in': audioProfile.sfxFadeIn, 'fade-out': audioProfile.sfxFadeOut,
    });
  }

  return {
    comment: `Transition: ${t.from} → ${t.to} (${t.style})`,
    duration: dur,
    'background-color': colors.background,
    elements: filterSafeElements(elements),
    transition: { style: t.j2vTransition || 'fade', duration: profile.transitions.chapterTransitionDuration },
  };
}

/**
 * Per-TTS-line scene — the core building block.
 * Visual pacing: B-roll cycling → lipsync talking head → B-roll tail.
 * ALL parameters driven by CastProfile.
 */
function makeTtsLineScene(
  tts: CastTTSLine,
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
  allImages?: string[],
  screenshotUrlSet?: Set<string>,
  profile?: CastProfile,
  mood?: string,
): J2VScene {
  const p = profile || PROFILE_CINEMATIC_DARK;
  const elements: J2VElement[] = [];
  const { timing, audio: audioProfile, images: imgProfile } = p;
  const VISUAL_BEAT = timing.visualBeat;

  // ── Helper: add cycling image slideshow for a time range ──
  const addImageSlideshow = (imgs: string[], startTime: number, duration: number, baseKbIdx: number) => {
    if (imgs.length === 0 || duration <= 0) return;
    const beatCount = Math.max(1, Math.ceil(duration / VISUAL_BEAT));
    const beatDur = duration / beatCount;
    for (let bi = 0; bi < beatCount; bi++) {
      const img = imgs[(baseKbIdx + bi) % imgs.length];
      const isScreenshot = screenshotUrlSet?.has(img) ?? false;
      const kb = getKB(p, baseKbIdx + bi, isScreenshot, mood);
      elements.push({
        type: 'image', src: img,
        start: startTime + bi * beatDur,
        duration: beatDur + (bi < beatCount - 1 ? timing.crossfadeOverlap : 0),
        ...kb, resize: 'cover',
        width: imgProfile.outputWidth, height: imgProfile.outputHeight,
        'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 0,
      });
    }
  };

  // ── Visual layer (z-index 0-2) ──
  if (lipsync && isHttpUrl(lipsync.url)) {
    const lipsyncDur = Math.min(lipsync.duration, sceneDur);

    // Background image slideshow (visible after lipsync ends)
    const bgImages = (allImages && allImages.length > 0)
      ? allImages.filter(u => isHttpUrl(u))
      : (isHttpUrl(imageVisual) ? [imageVisual] : []);
    addImageSlideshow(bgImages, 0, sceneDur, kbIdx);

    // Video lead-in (establishing shot, z-index 3 above lipsync)
    const maxLeadIn = Math.min(timing.videoLeadInMax, lipsyncDur * timing.videoLeadInRatio);
    const VIDEO_LEAD_IN = isHttpUrl(videoVisual) ? Math.min(maxLeadIn, sceneDur * 0.2) : 0;
    if (isHttpUrl(videoVisual)) {
      elements.push({
        type: 'video', src: videoVisual,
        start: 0, duration: VIDEO_LEAD_IN,
        volume: 0, resize: 'cover',
        width: imgProfile.outputWidth, height: imgProfile.outputHeight,
        'fade-in': 0.3, 'fade-out': 0.8, 'z-index': 3,
      });
    }

    // Lipsync full-screen (z-index 2, time-windowed by renderer)
    elements.push({
      type: 'video', src: lipsync.url,
      start: 0, duration: lipsyncDur,
      volume: 0,
      'fade-in': 0.3, 'fade-out': 0.8,
      'z-index': 2,
      resize: 'cover', width: imgProfile.outputWidth, height: imgProfile.outputHeight,
    });
  } else {
    // No lipsync — full B-roll
    if (isHttpUrl(videoVisual)) {
      const videoDur = Math.min(15, sceneDur);
      elements.push({
        type: 'video', src: videoVisual,
        start: 0, duration: videoDur,
        volume: 0, resize: 'cover',
        width: imgProfile.outputWidth, height: imgProfile.outputHeight,
        'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 0,
      });
      // Fill remaining with cycling images
      const remainStart = videoDur - timing.crossfadeOverlap;
      const remainDur = sceneDur - videoDur + timing.crossfadeOverlap;
      const cycleImages = (allImages && allImages.length > 0)
        ? allImages.filter(u => isHttpUrl(u))
        : (isHttpUrl(imageVisual) ? [imageVisual] : []);
      if (remainDur > 0) addImageSlideshow(cycleImages, remainStart, remainDur, kbIdx);
    } else {
      // Image-only — cycle through pool
      const cycleImages = (allImages && allImages.length > 0)
        ? allImages.filter(u => isHttpUrl(u))
        : (isHttpUrl(imageVisual) ? [imageVisual] : []);
      addImageSlideshow(cycleImages, 0, sceneDur, kbIdx);
    }
  }

  // ── TTS audio ──
  if (isHttpUrl(tts.url)) {
    elements.push({
      type: 'audio', src: tts.url,
      start: 0, duration: sceneDur,
      volume: audioProfile.ttsVolume,
    });
  }

  // ── Music (looped, adaptive ducking) ──
  if (music && isHttpUrl(music.url)) {
    const hasTts = isHttpUrl(tts.url);
    const musicVolume = hasTts ? audioProfile.musicDucked : audioProfile.musicForward;
    elements.push({
      type: 'audio', src: music.url,
      start: 0, duration: sceneDur,
      volume: musicVolume, loop: music.loop ? -1 : 0,
      'fade-in': audioProfile.musicFadeIn, 'fade-out': audioProfile.musicFadeOut,
    });
  }

  // ── SFX ──
  sfx.forEach(s => {
    if (isHttpUrl(s.url)) {
      elements.push({
        type: 'audio', src: s.url,
        start: s.start, duration: s.duration,
        volume: audioProfile.sfxVolume,
        'fade-in': audioProfile.sfxFadeIn, 'fade-out': audioProfile.sfxFadeOut,
      });
    }
  });

  // ── Lower-third speaker ID (z-index 30) ──
  if (speakerChanged && speakerInfo) {
    const ltDur = Math.min(timing.lowerThirdDuration, sceneDur - timing.lowerThirdDelay);
    if (ltDur > 0.5) {
      elements.push({
        type: 'component', component: p.lowerThird.component,
        start: timing.lowerThirdDelay, duration: ltDur,
        settings: {
          headline: { text: speakerInfo.headline, color: speakerInfo.barColor },
          lead: { text: speakerInfo.lead, color: p.lowerThird.leadColor },
          bar: { background: speakerInfo.barColor },
        },
        position: 'bottom-left',
        'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 30,
      });
    }
  }

  // ── Kinetic text overlay (z-index 25) ──
  if (kineticOverlay) {
    const fontSize = getKineticFontSize(kineticOverlay.text, p);
    elements.push({
      type: 'text', text: kineticOverlay.text,
      style: kineticOverlay.style,
      start: kineticOverlay.start, duration: kineticOverlay.duration,
      settings: {
        'font-family': p.fonts.family, 'font-size': fontSize, 'font-color': p.colors.primary,
        'font-weight': '700',
        'text-shadow': '3px 3px 12px rgba(0,0,0,0.95)',
        'background-color': `${p.colors.background}80`, padding: '12px 24px',
      },
      position: 'center-center',
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 25,
    });
  }

  return {
    comment: `${chapterId} — ${tts.voice} (${tts.key || ''})`,
    duration: sceneDur,
    'background-color': p.colors.background,
    elements: filterSafeElements(elements),
    transition: { style: transitionStyle, duration: profile?.transitions.sceneTransitionDuration ?? 0.5 },
  };
}

// ── Subtitle Track Builder ───────────────────────────────────────────────

function makeSubtitleElement(
  text: string,
  start: number,
  duration: number,
  profile: CastProfile,
  subtitlePosition: string,
  subtitleRTL: boolean,
): J2VElement {
  const maxChars = 60;
  const displayText = text.length > maxChars
    ? text.substring(0, maxChars - 3) + '...'
    : text;

  return {
    type: 'text',
    text: displayText,
    style: '002',
    start,
    duration: Math.max(1, duration),
    settings: {
      'font-family': profile.fonts.family,
      'font-size': `${profile.fonts.captionSize}px`,
      'font-color': '#ffffff',
      'font-weight': '500',
      'text-shadow': '2px 2px 6px rgba(0,0,0,0.9)',
      'background-color': profile.colors.captionBg,
      padding: '8px 16px',
      ...(subtitleRTL ? { direction: 'rtl' } : {}),
    },
    position: subtitlePosition || 'bottom-left',
    'fade-in': 0.2,
    'fade-out': 0.2,
    'z-index': 35,
  };
}

function injectSubtitles(
  scenes: J2VScene[],
  chapters: CastChapter[],
  profile: CastProfile,
  subtitlesEnabled: boolean,
  subtitlePosition: string,
  subtitleRTL: boolean,
): void {
  if (!subtitlesEnabled) return;

  const allTtsLines: Array<{ text: string; voice: string; key?: string }> = [];
  for (const chapter of chapters) {
    for (const tts of chapter.ttsLines) {
      allTtsLines.push({
        text: tts.text || tts.key || '',
        voice: tts.voice,
        key: tts.key,
      });
    }
  }

  for (const scene of scenes) {
    const comment: string = scene.comment || '';
    const matchingLine = allTtsLines.find(l => l.key && comment.includes(l.key));
    if (matchingLine && matchingLine.text) {
      const ttsAudio = (scene.elements || []).find(
        (el: J2VElement) => el.type === 'audio' && el.volume === 1.0
      );
      if (ttsAudio) {
        scene.elements.push(
          makeSubtitleElement(
            matchingLine.text,
            ttsAudio.start || 0,
            ttsAudio.duration || scene.duration || 5,
            profile,
            subtitlePosition,
            subtitleRTL,
          )
        );
      }
    }
  }
}

// ── Chapter Builder ────────────────────────────────────────────────────────

function buildChapterScenes(chapter: CastChapter, speakers: CastSpeakerInfo, profile: CastProfile, mood?: string): J2VScene[] {
  const scenes: J2VScene[] = [];
  const { ttsLines, lipsyncClips, videos, images, kineticTexts, musicUrl, musicLoop, sfxTimings } = chapter;
  const screenshotUrlSet = new Set(chapter.screenshotUrls || []);
  const { timing, audio: audioProfile } = profile;
  console.log(`[CastTimeline] buildChapterScenes "${chapter.id}": ${videos.length} videos, ${images.length} images, ${ttsLines.length} TTS, ${lipsyncClips.length} lipsync, ${screenshotUrlSet.size} screenshots`);

  // No TTS → single visual scene
  if (ttsLines.length === 0) {
    const dur = chapter.duration || 30;
    const elements: J2VElement[] = [];
    if (videos.length > 0 && isHttpUrl(videos[0])) {
      elements.push({
        type: 'video', src: videos[0],
        start: 0, duration: Math.min(10, dur),
        volume: 0, resize: 'cover',
        width: profile.images.outputWidth, height: profile.images.outputHeight,
        'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 0,
      });
    } else if (images.length > 0 && isHttpUrl(images[0])) {
      const isScreenshot = screenshotUrlSet.has(images[0]);
      const kb = getKB(profile, 0, isScreenshot, mood);
      elements.push({
        type: 'image', src: images[0],
        start: 0, duration: dur,
        ...kb, resize: 'cover',
        width: profile.images.outputWidth, height: profile.images.outputHeight,
        'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 0,
      });
    }
    elements.push({
      type: 'text', text: chapter.title || chapter.id,
      style: '002', start: 0.5, duration: Math.min(6, dur - 0.5),
      settings: {
        'font-family': profile.fonts.family, 'font-size': '36px', 'font-color': '#ffffff',
        'font-weight': '600',
        'text-shadow': '2px 2px 8px rgba(0,0,0,0.7)',
        'background-color': `${profile.colors.background}99`, padding: '8px 16px',
      },
      position: 'bottom-left',
      'fade-in': timing.sceneFadeIn, 'fade-out': timing.sceneFadeOut, 'z-index': 25,
    });
    if (isHttpUrl(musicUrl)) {
      elements.push({
        type: 'audio', src: musicUrl,
        start: 0, duration: dur,
        volume: audioProfile.musicForward, loop: musicLoop ? -1 : 0,
        'fade-in': audioProfile.musicFadeIn, 'fade-out': audioProfile.musicFadeOut,
      });
    }
    scenes.push({
      comment: `${chapter.id} (visual only)`,
      duration: dur,
      'background-color': profile.colors.background,
      elements: filterSafeElements(elements),
      transition: { style: 'fade', duration: timing.sceneFadeIn },
    });
    return scenes;
  }

  // ── Build per-TTS-line scenes ──
  let videoPoolIdx = 0;
  let imagePoolIdx = 0;
  let kbIdx = 0;
  let lastSpeaker = '';

  const perTtsImages = chapter.perTtsImages;
  const hasSemanticMapping = perTtsImages && perTtsImages.length > 0;
  const perTtsVideos = chapter.perTtsVideos;
  const hasVideoMapping = perTtsVideos && perTtsVideos.length > 0;

  const kineticWithImages = (kineticTexts || [])
    .filter(kt => isHttpUrl(kt.imageUrl))
    .sort((a, b) => a.start - b.start);
  const kineticOverlaysOnly = (kineticTexts || [])
    .filter(kt => !isHttpUrl(kt.imageUrl));
  let kiIdx = 0;

  const music = isHttpUrl(musicUrl) ? { url: musicUrl, loop: !!musicLoop } : undefined;
  const usedLipsyncIndices = new Set<number>();

  for (let i = 0; i < ttsLines.length; i++) {
    const tts = ttsLines[i];
    const nextTts = ttsLines[i + 1];
    const sceneStart = tts.start;
    const sceneEnd = nextTts ? nextTts.start : chapter.duration;

    // Insert kinetic image interlude scenes
    while (kiIdx < kineticWithImages.length && kineticWithImages[kiIdx].start <= sceneStart + 1) {
      scenes.push(makeKineticImageScene(kineticWithImages[kiIdx], kbIdx++, profile, mood));
      kiIdx++;
    }

    const sceneDur = Math.max(timing.minSceneDuration, sceneEnd - sceneStart);

    // Find lipsync — uses profile-configured tolerance (default 0.5s instead of old 2s)
    const lipsyncIdx = lipsyncClips.findIndex((c, idx) =>
      !usedLipsyncIndices.has(idx) &&
      c.character === tts.voice &&
      Math.abs(c.start - tts.start) < timing.lipsyncTolerance
    );
    const lipsync = lipsyncIdx >= 0 ? lipsyncClips[lipsyncIdx] : undefined;
    if (lipsyncIdx >= 0) usedLipsyncIndices.add(lipsyncIdx);

    // ── Pick visuals — semantic per-TTS mapping when available ──
    const ttsImageGroup = hasSemanticMapping && perTtsImages![i]
      ? perTtsImages![i].filter(u => isHttpUrl(u))
      : [];
    const useSemanticImages = ttsImageGroup.length > 0;

    let videoVisual: string | undefined;
    let imageVisual: string | undefined;
    let tailImageVisual: string | undefined;
    let sceneImages: string[];

    // ── Pick video: semantic per-TTS mapping when available, else sequential pool ──
    const pickVideo = (): string | undefined => {
      if (hasVideoMapping && perTtsVideos![i]) {
        const vids = perTtsVideos![i].filter(u => isHttpUrl(u));
        if (vids.length > 0) return vids[0]; // first video for this TTS line
      }
      if (videoPoolIdx < videos.length && isHttpUrl(videos[videoPoolIdx])) {
        return videos[videoPoolIdx++];
      }
      return undefined;
    };

    if (!lipsync) {
      videoVisual = pickVideo();
      if (useSemanticImages) {
        imageVisual = ttsImageGroup[0];
        sceneImages = ttsImageGroup;
        if (sceneDur > 30 && ttsImageGroup.length < 3 && images.length > ttsImageGroup.length) {
          const existingSet = new Set(ttsImageGroup);
          const extras = images.filter(u => isHttpUrl(u) && !existingSet.has(u));
          if (extras.length > 0) sceneImages = [...ttsImageGroup, ...extras];
        }
      } else if (images.length > 0 && isHttpUrl(images[imagePoolIdx % images.length])) {
        imageVisual = images[imagePoolIdx % images.length];
        imagePoolIdx++;
        sceneImages = images;
      } else {
        sceneImages = images;
      }
    } else {
      videoVisual = pickVideo();
      if (useSemanticImages) {
        tailImageVisual = ttsImageGroup[0];
        sceneImages = ttsImageGroup;
        if (sceneDur > 30 && ttsImageGroup.length < 3 && images.length > ttsImageGroup.length) {
          const existingSet = new Set(ttsImageGroup);
          const extras = images.filter(u => isHttpUrl(u) && !existingSet.has(u));
          if (extras.length > 0) sceneImages = [...ttsImageGroup, ...extras];
        }
      } else if (images.length > 0 && isHttpUrl(images[imagePoolIdx % images.length])) {
        tailImageVisual = images[imagePoolIdx % images.length];
        imagePoolIdx++;
        sceneImages = images;
      } else {
        sceneImages = images;
      }
    }

    const speakerChanged = tts.voice !== lastSpeaker;
    const speakerInfo = speakers[tts.voice];
    lastSpeaker = tts.voice;

    const sfxList = (sfxTimings || [])
      .filter(s => s.start >= sceneStart && s.start < sceneEnd && isHttpUrl(s.url))
      .map(s => ({ ...s, start: s.start - sceneStart }));

    const ktOverlay = kineticOverlaysOnly.find(kt =>
      kt.start >= sceneStart && kt.start < sceneEnd
    );
    const kineticOverlay = ktOverlay ? {
      ...ktOverlay,
      start: Math.max(0, ktOverlay.start - sceneStart),
    } : undefined;

    const transStyle = i === 0 ? 'fade' : getMoodTransition(profile, mood, i);

    // Production diagnostic
    const uniqueSceneImgs = new Set(sceneImages.filter(u => isHttpUrl(u)));
    if (sceneDur > 20 && uniqueSceneImgs.size < 2) {
      console.error(`[CAST TIMELINE] CRITICAL: TTS#${i} "${tts.voice}:${tts.key}" (${Math.round(sceneDur)}s) has only ${uniqueSceneImgs.size} unique image(s) — will appear static!`);
    }
    console.log(`[CAST TIMELINE] TTS#${i} "${tts.voice}:${tts.key}" dur=${Math.round(sceneDur)}s: ${sceneImages.length} images (${uniqueSceneImgs.size} unique), lipsync=${!!lipsync}, video=${!!videoVisual}`);

    scenes.push(makeTtsLineScene(
      { ...tts, start: 0 },
      sceneDur,
      chapter.id,
      lipsync ? { ...lipsync, start: 0 } : undefined,
      videoVisual,
      imageVisual,
      tailImageVisual,
      music,
      sfxList,
      speakerChanged,
      speakerInfo,
      kineticOverlay,
      kbIdx++,
      transStyle,
      sceneImages,
      screenshotUrlSet,
      profile,
      mood,
    ));
  }

  // Trailing kinetic images after last TTS line
  while (kiIdx < kineticWithImages.length) {
    scenes.push(makeKineticImageScene(kineticWithImages[kiIdx], kbIdx++, profile, mood));
    kiIdx++;
  }

  return scenes;
}

// ── Scene Splitting for Very Long Scenes ──────────────────────────────────

function splitLongScenes(scenes: J2VScene[], profile: CastProfile): J2VScene[] {
  const MAX_SCENE_DURATION = profile.timing.maxSceneDuration;
  const result: J2VScene[] = [];

  for (const scene of scenes) {
    const sceneDur = scene.duration || 0;

    if (sceneDur <= MAX_SCENE_DURATION) {
      result.push(scene);
      continue;
    }

    const elements: J2VElement[] = scene.elements || [];
    const splitCount = Math.ceil(sceneDur / MAX_SCENE_DURATION);
    const subDur = sceneDur / splitCount;

    const ttsAudios = elements.filter(el => el.type === 'audio' && el.volume === 1.0 && el.loop == null);
    const musicAudios = elements.filter(el => el.type === 'audio' && el.loop != null);
    const sfxAudios = elements.filter(el => el.type === 'audio' && el.loop == null && el.volume !== 1.0);
    const videos = elements.filter(el => el.type === 'video');
    const bgImages = elements.filter(el => el.type === 'image' && (!el['z-index'] || el['z-index'] === 0) && !el.position);
    const overlayImages = elements.filter(el => el.type === 'image' && ((el['z-index'] as number) > 0 || !!el.position));
    const texts = elements.filter(el => el.type === 'text');
    const components = elements.filter(el => el.type === 'component');

    console.log(`[CastEngine] Splitting ${sceneDur}s scene into ${splitCount} × ${subDur.toFixed(1)}s sub-scenes: "${scene.comment}"`);

    const imageUrls = bgImages.map(el => el.src).filter((s: string) => isHttpUrl(s));
    const VISUAL_BEAT = profile.timing.visualBeat;

    for (let si = 0; si < splitCount; si++) {
      const subStart = si * subDur;
      const subEnd = Math.min((si + 1) * subDur, sceneDur);
      const thisDur = subEnd - subStart;
      const subElements: J2VElement[] = [];

      // Visual cycling
      if (imageUrls.length > 0) {
        const beatCount = Math.max(1, Math.ceil(thisDur / VISUAL_BEAT));
        const beatDur = thisDur / beatCount;
        const kbOffset = si * beatCount;
        for (let bi = 0; bi < beatCount; bi++) {
          const img = imageUrls[(kbOffset + bi) % imageUrls.length];
          const kb = getKB(profile, kbOffset + bi, false);
          subElements.push({
            type: 'image', src: img,
            start: bi * beatDur,
            duration: beatDur + (bi < beatCount - 1 ? profile.timing.crossfadeOverlap : 0),
            ...kb, resize: 'cover',
            width: profile.images.outputWidth, height: profile.images.outputHeight,
            'fade-in': profile.timing.sceneFadeIn, 'fade-out': profile.timing.sceneFadeOut, 'z-index': 0,
          });
        }
      }

      // Videos by time-overlap
      for (const v of videos) {
        const vStart = v.start ?? 0;
        const vDur = v.duration ?? 0;
        const vEnd = vStart + vDur;
        if (vEnd > subStart && vStart < subEnd) {
          const clippedStart = Math.max(0, vStart - subStart);
          const clippedDur = Math.min(vEnd, subEnd) - Math.max(vStart, subStart);
          if (clippedDur > 1) {
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

      // Overlay images by time-overlap
      for (const ov of overlayImages) {
        const ovStart = ov.start ?? 0;
        const ovDur = ov.duration ?? 0;
        const ovEnd = ovStart + ovDur;
        if (ovEnd > subStart && ovStart < subEnd) {
          const clippedStart = Math.max(0, ovStart - subStart);
          const clippedDur = Math.min(ovEnd, subEnd) - Math.max(ovStart, subStart);
          if (clippedDur > 1) {
            subElements.push({ ...ov, start: clippedStart, duration: clippedDur });
          }
        }
      }

      // TTS audio with seek
      for (const ttsEl of ttsAudios) {
        const ttsStart = ttsEl.start ?? 0;
        const ttsDur = ttsEl.duration ?? sceneDur;
        const ttsEnd = ttsStart + ttsDur;
        if (ttsEnd > subStart && ttsStart < subEnd) {
          const seekOffset = Math.max(0, subStart - ttsStart);
          const clippedStart = Math.max(0, ttsStart - subStart);
          const clippedDur = Math.min(ttsEnd, subEnd) - Math.max(ttsStart, subStart);
          subElements.push({
            ...ttsEl,
            start: clippedStart,
            duration: clippedDur,
            seek: seekOffset,
            'fade-in': si === 0 ? (ttsEl['fade-in'] || 0) : 0,
            'fade-out': si === splitCount - 1 ? (ttsEl['fade-out'] || 0) : 0,
          });
        }
      }

      // Music in every sub-scene
      for (const m of musicAudios) {
        subElements.push({
          ...m,
          start: 0,
          duration: thisDur,
          'fade-in': si === 0 ? (m['fade-in'] || profile.audio.musicFadeIn) : 0.1,
          'fade-out': si === splitCount - 1 ? (m['fade-out'] || profile.audio.musicFadeOut) : 0.1,
        });
      }

      // SFX by time-overlap
      for (const sfxEl of sfxAudios) {
        const sfxStart = sfxEl.start ?? 0;
        const sfxEnd = sfxStart + (sfxEl.duration ?? 0);
        if (sfxEnd > subStart && sfxStart < subEnd) {
          subElements.push({
            ...sfxEl,
            start: Math.max(0, sfxStart - subStart),
            duration: Math.min(sfxEnd, subEnd) - Math.max(sfxStart, subStart),
          });
        }
      }

      // Text + components: first sub-scene only
      if (si === 0) {
        for (const t of texts) {
          const tStart = t.start ?? 0;
          if (tStart < thisDur) {
            subElements.push({ ...t, duration: Math.min(t.duration ?? 5, thisDur - tStart) });
          }
        }
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
        'background-color': scene['background-color'] || profile.colors.background,
        elements: filterSafeElements(subElements),
        transition: si === 0
          ? scene.transition
          : { style: profile.transitions.splitTransition, duration: profile.transitions.splitTransitionDuration },
      });
    }
  }

  return result;
}

// ── Safety Pass ────────────────────────────────────────────────────────────

function applySafetyPass(scenes: J2VScene[], profile: CastProfile): void {
  for (const scene of scenes) {
    const sd = scene.duration || 0;
    scene.elements = (scene.elements || []).filter((el: J2VElement) => {
      const elStart = el.start ?? 0;
      if (elStart >= sd) return false;
      if (el.duration != null && el.duration <= 0) return false;
      return true;
    });
    for (const el of scene.elements) {
      const elStart = el.start ?? 0;
      const isLipsyncVideo = el.type === 'video' && (el as any).volume === 0;
      const isPrimaryTts = el.type === 'audio' && ((el as any).volume ?? 1) >= 0.9;
      if (!isLipsyncVideo && !isPrimaryTts && elStart + (el.duration ?? 0) > sd) {
        el.duration = Math.max(0.5, sd - elStart);
      }
      if (el.zoom != null) {
        el.zoom = Math.max(-10, Math.min(10, Math.round(el.zoom)));
      }
      if ((el.type === 'image' || el.type === 'video') && !el.width) {
        el.width = profile.images.outputWidth;
        el.height = profile.images.outputHeight;
      }
    }
  }
}

// ── SRT Generation ────────────────────────────────────────────────────────

/** Format seconds to SRT time code: HH:MM:SS,mmm */
function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/**
 * Generate SRT subtitle content from chapter TTS data.
 * Each TTS line becomes one subtitle entry with timing derived from
 * chapter offsets + TTS line start/duration.
 */
export function generateSRT(chapters: CastChapter[]): string {
  let srt = '';
  let idx = 1;
  let chapterOffset = 0;

  for (const ch of chapters) {
    for (const tts of ch.ttsLines) {
      const text = tts.text || tts.key || '';
      if (!text) continue;

      const start = chapterOffset + (tts.start || 0);
      const end = start + (tts.duration || 5);
      srt += `${idx}\n`;
      srt += `${formatSrtTime(start)} --> ${formatSrtTime(end)}\n`;
      srt += `${text}\n\n`;
      idx++;
    }
    chapterOffset += ch.duration;
  }
  return srt;
}

// ── Main Entry Point ───────────────────────────────────────────────────────

/**
 * Build a professional Cast timeline from chapters, transitions, and bookends.
 *
 * Architecture: one scene per TTS line (5-20s each).
 * Returns { resolution, quality, scenes, _totalDuration } ready for RunPod FFmpeg.
 *
 * @param chapters — ordered chapter data (TTS lines, visuals, music, SFX)
 * @param transitions — transitions between chapters
 * @param bookends — opening and closing sequences (null to skip)
 * @param speakers — speaker info for lower-third overlays
 * @param quality — 'draft' | 'production' | 'cinematic'
 * @param theme — legacy CastTheme overrides (mapped onto CastProfile)
 * @param mood — narrative mood for transition style + Ken Burns intensity
 * @param profileId — CastProfile ID (e.g., 'cinematic-dark', 'corporate-clean')
 */
export function buildCastTimeline(
  chapters: CastChapter[],
  transitions: CastTransition[],
  bookends: CastBookends | null,
  speakers: CastSpeakerInfo,
  quality: string,
  theme?: Partial<CastTheme>,
  mood?: string,
  profileId?: string,
): CastTimelineResult {
  const profile = resolveProfile(profileId, theme);
  const subtitlesEnabled = theme?.subtitlesEnabled ?? true;
  const subtitlePosition = theme?.subtitlePosition ?? 'bottom-left';
  const subtitleRTL = theme?.subtitleRTL ?? false;

  const resolution = 'full-hd';
  const scenes: J2VScene[] = [];

  // 1. Opening bookend
  if (bookends?.opening && bookends.opening.duration > 0) {
    scenes.push(makeOpeningBookend(bookends.opening, profile));
  }

  // 2. Per-chapter scenes + chapter transitions
  chapters.forEach((chapter) => {
    const chapterScenes = buildChapterScenes(chapter, speakers, profile, mood);
    scenes.push(...chapterScenes);

    const transition = transitions.find(t => t.from === chapter.id);
    if (transition) {
      scenes.push(makeTransitionScene(transition, profile));
    }
  });

  // 3. Closing bookend
  if (bookends?.closing && bookends.closing.duration > 0) {
    scenes.push(makeClosingBookend(bookends.closing, profile));
  }

  // 4. Inject subtitles
  injectSubtitles(scenes, chapters, profile, subtitlesEnabled, subtitlePosition, subtitleRTL);

  // 5. Split long scenes
  const splitScenes = splitLongScenes(scenes, profile);

  // 6. Safety pass
  applySafetyPass(splitScenes, profile);

  const totalDuration = splitScenes.reduce((sum, s) => sum + (s.duration || 0), 0);
  const splitCount = splitScenes.length - scenes.length;
  console.log(`[CastEngine] Built timeline: ${splitScenes.length} scenes (${splitCount > 0 ? `${splitCount} from splitting` : 'no splits'}), ~${Math.round(totalDuration)}s (${Math.round(totalDuration / 60)}min), subtitles: ${subtitlesEnabled ? 'ON' : 'OFF'}, profile: ${profile.id}`);

  // Timeline manifest
  console.log(`[CastEngine] ═══ TIMELINE MANIFEST (${splitScenes.length} scenes) ═══`);
  splitScenes.forEach((s, i) => {
    const els = s.elements || [];
    const audioCount = els.filter((e: any) => e.type === 'audio' && (e.volume ?? 1) >= 0.9).length;
    const lipsyncCount = els.filter((e: any) => e.type === 'video' && e.volume === 0).length;
    const trans = s.transition;
    const transInfo = trans ? ` → ${(trans as any).style || 'fade'}(${(trans as any).duration || 0}s)` : '';
    console.log(`  [manifest] scene ${i}: ${(s.duration || 0).toFixed(1)}s, ${audioCount} TTS, ${lipsyncCount} lipsync${transInfo} | ${s.comment || ''}`);
  });
  console.log(`[CastEngine] ═══ Transition-Chapter Alignment ═══`);
  chapters.forEach((ch) => {
    const matched = transitions.find(t => t.from === ch.id);
    if (matched) {
      console.log(`  [align] chapter "${ch.id}" → transition from="${matched.from}" to="${matched.to}" ✓`);
    } else {
      console.log(`  [align] chapter "${ch.id}" → no transition (last chapter or missing)`);
    }
  });

  // Embed profile in timeline payload for RunPod FFmpeg worker
  const profileData = serializeProfileForTimeline(profile);

  return {
    resolution,
    quality: quality === 'cinematic' ? 'high' : 'medium',
    scenes: splitScenes,
    _totalDuration: totalDuration,
    ...profileData,
  };
}
