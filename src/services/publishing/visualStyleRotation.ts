/**
 * Visual Style Rotation Engine
 *
 * Deterministic weekly rotation through 12 creative style families.
 * Uses ISO week number to cycle styles — same week always = same style.
 * All styles use full_body character framing for cinematic renders.
 */

import type { CreativeStyleFamily } from '@/services/brand-intelligence/castCreativeStylesRegistry';

// ─── Types ──────────────────────────────────────────────────────────

export interface CinematographyPreset {
  cameraAngles: string[];
  lightingStyle: string;
  colorGrade: string;
  transitionStyle: string;
  characterFraming: 'full_body' | 'medium_shot' | 'close_up' | 'dynamic_mix';
  backgroundComplexity: 'minimal' | 'moderate' | 'detailed' | 'cinematic';
}

export interface VisualRotationSchedule {
  weekNumber: number;
  styleFamily: CreativeStyleFamily;
  label: string;
  description: string;
  cinematography: CinematographyPreset;
}

// ─── 12-Week Rotation Cycle ─────────────────────────────────────────

interface RotationEntry {
  family: CreativeStyleFamily;
  label: string;
  description: string;
  cinematography: CinematographyPreset;
}

const ROTATION_CYCLE: RotationEntry[] = [
  {
    family: 'pixar_3d',
    label: 'Pixar / Disney 3D',
    description: 'Vibrant 3D renders with dramatic angles and expressive characters',
    cinematography: {
      cameraAngles: ['hero_low_angle', 'over_shoulder', 'dramatic_zoom', 'wide_establishing'],
      lightingStyle: 'three_point_dramatic',
      colorGrade: 'vibrant_saturated',
      transitionStyle: 'smooth_dolly',
      characterFraming: 'full_body',
      backgroundComplexity: 'cinematic',
    },
  },
  {
    family: 'watercolor',
    label: 'Watercolor',
    description: 'Soft watercolor textures with pastel palettes and gentle camera pans',
    cinematography: {
      cameraAngles: ['gentle_pan', 'static_wide', 'soft_zoom_in', 'lateral_drift'],
      lightingStyle: 'soft_diffused',
      colorGrade: 'pastel_warm',
      transitionStyle: 'dissolve_fade',
      characterFraming: 'full_body',
      backgroundComplexity: 'moderate',
    },
  },
  {
    family: 'anime',
    label: 'Anime',
    description: 'Japanese anime style with speed lines, dynamic poses, and bold colors',
    cinematography: {
      cameraAngles: ['speed_zoom', 'dutch_angle', 'action_tracking', 'dramatic_close_pull'],
      lightingStyle: 'cel_shaded_dramatic',
      colorGrade: 'bold_saturated',
      transitionStyle: 'cut_flash',
      characterFraming: 'full_body',
      backgroundComplexity: 'detailed',
    },
  },
  {
    family: 'disney_2d',
    label: 'Disney Classic 2D',
    description: 'Fluid Disney 2D animation with musical energy and warmth',
    cinematography: {
      cameraAngles: ['sweeping_arc', 'follow_character', 'wide_musical', 'intimate_close'],
      lightingStyle: 'warm_golden',
      colorGrade: 'classic_rich',
      transitionStyle: 'wipe_iris',
      characterFraming: 'full_body',
      backgroundComplexity: 'detailed',
    },
  },
  {
    family: 'stop_motion',
    label: 'Stop Motion / Claymation',
    description: 'Tactile claymation feel with warm lighting and handcrafted textures',
    cinematography: {
      cameraAngles: ['table_top', 'slight_tilt', 'miniature_wide', 'macro_detail'],
      lightingStyle: 'warm_practical',
      colorGrade: 'earthy_muted',
      transitionStyle: 'jump_cut_stop',
      characterFraming: 'full_body',
      backgroundComplexity: 'detailed',
    },
  },
  {
    family: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon-lit futuristic aesthetic with dark tones and holographic elements',
    cinematography: {
      cameraAngles: ['low_neon_angle', 'rain_tracking', 'hologram_orbit', 'drone_sweep'],
      lightingStyle: 'neon_rim_dark',
      colorGrade: 'teal_magenta',
      transitionStyle: 'glitch_cut',
      characterFraming: 'full_body',
      backgroundComplexity: 'cinematic',
    },
  },
  {
    family: 'comic_book',
    label: 'Comic Book',
    description: 'Bold ink lines, halftone patterns, and action panel framing',
    cinematography: {
      cameraAngles: ['panel_static', 'action_burst', 'hero_pose', 'dramatic_splash'],
      lightingStyle: 'flat_bold',
      colorGrade: 'primary_vivid',
      transitionStyle: 'panel_wipe',
      characterFraming: 'full_body',
      backgroundComplexity: 'moderate',
    },
  },
  {
    family: 'motion_graphics',
    label: 'Motion Graphics',
    description: 'Clean infographic style with data visualization and smooth transitions',
    cinematography: {
      cameraAngles: ['centered_static', 'zoom_data', 'slide_lateral', 'pull_back_reveal'],
      lightingStyle: 'flat_clean',
      colorGrade: 'brand_consistent',
      transitionStyle: 'slide_morph',
      characterFraming: 'full_body',
      backgroundComplexity: 'minimal',
    },
  },
  {
    family: 'cultural_illustration',
    label: 'Cultural Illustration',
    description: 'Region-specific art styles — Madhubani, Ukiyo-e, Islamic geometry, African patterns',
    cinematography: {
      cameraAngles: ['showcase_static', 'gentle_zoom', 'pattern_reveal', 'cultural_pan'],
      lightingStyle: 'natural_ambient',
      colorGrade: 'region_authentic',
      transitionStyle: 'fade_blend',
      characterFraming: 'full_body',
      backgroundComplexity: 'detailed',
    },
  },
  {
    family: 'documentary',
    label: 'Documentary',
    description: 'Real footage feel with cinematic film grain, interview framing, and B-roll style',
    cinematography: {
      cameraAngles: ['handheld_follow', 'interview_medium', 'broll_wide', 'cinematic_slow_pan'],
      lightingStyle: 'natural_cinematic',
      colorGrade: 'film_desaturated',
      transitionStyle: 'crossfade',
      characterFraming: 'full_body',
      backgroundComplexity: 'cinematic',
    },
  },
  {
    family: 'flat_design',
    label: 'Flat Design',
    description: 'Minimal Google/Apple style with clean shapes and modern typography',
    cinematography: {
      cameraAngles: ['centered_clean', 'static_balanced', 'subtle_parallax', 'type_zoom'],
      lightingStyle: 'flat_even',
      colorGrade: 'modern_pastel',
      transitionStyle: 'material_morph',
      characterFraming: 'full_body',
      backgroundComplexity: 'minimal',
    },
  },
  {
    family: 'retro_vintage',
    label: 'Retro / Vintage',
    description: '80s/90s nostalgia with VHS grain, synthwave palettes, and neon accents',
    cinematography: {
      cameraAngles: ['vhs_static', 'retro_zoom', 'neon_pan', 'film_strip_scroll'],
      lightingStyle: 'neon_warm_retro',
      colorGrade: 'synthwave_gradient',
      transitionStyle: 'vhs_glitch',
      characterFraming: 'full_body',
      backgroundComplexity: 'moderate',
    },
  },
];

// ─── ISO Week Calculation ───────────────────────────────────────────

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Get the visual style for a given week. Deterministic — same ISO week always returns the same style.
 * @param date Optional date (defaults to now)
 */
export function getVisualStyleForWeek(date?: Date): VisualRotationSchedule {
  const target = date ?? new Date();
  const weekNum = getISOWeekNumber(target);
  const cycleIndex = weekNum % ROTATION_CYCLE.length;
  const entry = ROTATION_CYCLE[cycleIndex];

  return {
    weekNumber: weekNum,
    styleFamily: entry.family,
    label: entry.label,
    description: entry.description,
    cinematography: entry.cinematography,
  };
}

/**
 * Preview the upcoming rotation schedule for the next N weeks.
 */
export function getUpcomingRotation(weeks: number = 4, startDate?: Date): VisualRotationSchedule[] {
  const start = startDate ?? new Date();
  const result: VisualRotationSchedule[] = [];

  for (let i = 0; i < weeks; i++) {
    const future = new Date(start);
    future.setDate(future.getDate() + i * 7);
    result.push(getVisualStyleForWeek(future));
  }

  return result;
}

/**
 * Get the full 12-week rotation cycle labels.
 */
export function getFullRotationCycle(): Array<{ index: number; family: CreativeStyleFamily; label: string }> {
  return ROTATION_CYCLE.map((entry, index) => ({
    index,
    family: entry.family,
    label: entry.label,
  }));
}

/**
 * Get cinematography preset for a specific style family (outside of rotation).
 */
export function getCinematographyForFamily(family: CreativeStyleFamily): CinematographyPreset | undefined {
  const entry = ROTATION_CYCLE.find(e => e.family === family);
  return entry?.cinematography;
}
