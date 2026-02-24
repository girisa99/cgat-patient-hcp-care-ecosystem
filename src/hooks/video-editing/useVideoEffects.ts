/**
 * useVideoEffects — Visual Effects & Filter Engine
 *
 * Per-clip visual effects system for the timeline editor:
 *   - Color grading presets (warm, cool, vintage, noir, vivid, cinematic, etc.)
 *   - Filters (blur, sharpen, vignette, grain, glow, sepia, etc.)
 *   - Text overlays (title cards, lower thirds, captions)
 *   - Transitions between clips (already in TimelineClip.transition)
 *   - Motion effects (ken burns, parallax, zoom, pan)
 *   - Composition effects (picture-in-picture, split screen, green screen)
 *   - Per-clip effect stacking with order control
 *   - Preset library (cinematic, social media, corporate, documentary, etc.)
 *   - Real-time preview state management
 */

import { useState, useCallback, useMemo } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

export type EffectCategory =
  | 'color_grading' | 'filter' | 'overlay' | 'motion' | 'composition' | 'transition' | 'text';

export type ColorGradingPreset =
  | 'none' | 'warm' | 'cool' | 'vintage' | 'noir' | 'vivid' | 'cinematic'
  | 'documentary' | 'neon' | 'pastel' | 'high_contrast' | 'low_contrast'
  | 'bleach_bypass' | 'cross_process' | 'teal_orange' | 'desaturated';

export type FilterType =
  | 'blur' | 'gaussian_blur' | 'motion_blur' | 'sharpen' | 'vignette'
  | 'grain' | 'glow' | 'sepia' | 'grayscale' | 'invert' | 'emboss'
  | 'edge_detect' | 'posterize' | 'pixelate' | 'chromatic_aberration'
  | 'lens_flare' | 'light_leak' | 'film_dust' | 'glitch' | 'halftone';

export type MotionEffect =
  | 'none' | 'ken_burns' | 'parallax' | 'zoom_in' | 'zoom_out'
  | 'pan_left' | 'pan_right' | 'pan_up' | 'pan_down' | 'dolly_zoom'
  | 'orbit' | 'shake' | 'float' | 'bounce';

export type CompositionMode =
  | 'normal' | 'picture_in_picture' | 'split_screen_h' | 'split_screen_v'
  | 'green_screen' | 'overlay_blend' | 'side_by_side' | 'grid_2x2'
  | 'cutaway' | 'reaction';

export interface VideoEffect {
  id: string;
  clipId: string;
  category: EffectCategory;
  type: string;
  intensity: number; // 0-100
  enabled: boolean;
  order: number;
  params: Record<string, any>;
}

export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  category: 'cinematic' | 'social_media' | 'corporate' | 'documentary' | 'creative' | 'broadcast' | 'music_video';
  effects: Omit<VideoEffect, 'id' | 'clipId'>[];
  thumbnail?: string;
}

// ─── Color Grading Metadata ────────────────────────────────────────────────

export const COLOR_GRADING_META: Record<ColorGradingPreset, {
  label: string;
  description: string;
  params: Record<string, number>;
}> = {
  none: { label: 'None', description: 'No color adjustment', params: {} },
  warm: { label: 'Warm', description: 'Golden tones, warm highlights', params: { temperature: 25, tint: 5, saturation: 10 } },
  cool: { label: 'Cool', description: 'Blue tones, cool shadows', params: { temperature: -25, tint: -5, saturation: 5 } },
  vintage: { label: 'Vintage', description: 'Faded film look with warm cast', params: { temperature: 15, contrast: -10, saturation: -20, highlights: -10, shadows: 15 } },
  noir: { label: 'Noir', description: 'High contrast black and white', params: { saturation: -100, contrast: 30, brightness: -5, shadows: -20 } },
  vivid: { label: 'Vivid', description: 'Boosted colors, punchy contrast', params: { saturation: 35, contrast: 15, brightness: 5 } },
  cinematic: { label: 'Cinematic', description: 'Teal shadows, orange highlights', params: { temperature: 10, tint: -5, contrast: 10, saturation: -5, shadows: -10, highlights: 5 } },
  documentary: { label: 'Documentary', description: 'Natural, slightly desaturated', params: { saturation: -10, contrast: 5, temperature: 5 } },
  neon: { label: 'Neon', description: 'Electric colors, glowing highlights', params: { saturation: 50, contrast: 20, brightness: 10, highlights: 25 } },
  pastel: { label: 'Pastel', description: 'Soft, muted pastels', params: { saturation: -15, brightness: 15, contrast: -15, highlights: 20 } },
  high_contrast: { label: 'High Contrast', description: 'Deep blacks, bright whites', params: { contrast: 40, shadows: -15, highlights: 15 } },
  low_contrast: { label: 'Low Contrast', description: 'Flat, matte look', params: { contrast: -30, shadows: 20, highlights: -15 } },
  bleach_bypass: { label: 'Bleach Bypass', description: 'Desaturated, high contrast film look', params: { saturation: -30, contrast: 25, brightness: -5, shadows: -10 } },
  cross_process: { label: 'Cross Process', description: 'Shifted colors, retro feel', params: { temperature: -15, tint: 20, saturation: 15, contrast: 10 } },
  teal_orange: { label: 'Teal & Orange', description: 'Hollywood blockbuster grading', params: { temperature: 15, tint: -15, saturation: 10, contrast: 10, shadows: -10 } },
  desaturated: { label: 'Desaturated', description: 'Muted, washed-out tones', params: { saturation: -40, brightness: 5, contrast: -5 } },
};

// ─── Filter Metadata ───────────────────────────────────────────────────────

export const FILTER_META: Record<FilterType, {
  label: string;
  description: string;
  defaultIntensity: number;
  params: Record<string, any>;
}> = {
  blur: { label: 'Blur', description: 'Uniform blur', defaultIntensity: 30, params: { radius: 4 } },
  gaussian_blur: { label: 'Gaussian Blur', description: 'Smooth gaussian blur', defaultIntensity: 40, params: { radius: 6, sigma: 2 } },
  motion_blur: { label: 'Motion Blur', description: 'Directional motion blur', defaultIntensity: 35, params: { angle: 0, distance: 10 } },
  sharpen: { label: 'Sharpen', description: 'Enhance edge detail', defaultIntensity: 50, params: { amount: 1.5 } },
  vignette: { label: 'Vignette', description: 'Dark edges, bright center', defaultIntensity: 50, params: { size: 0.6, softness: 0.5 } },
  grain: { label: 'Film Grain', description: 'Analog film grain texture', defaultIntensity: 30, params: { size: 1, roughness: 0.5 } },
  glow: { label: 'Glow', description: 'Soft light glow effect', defaultIntensity: 40, params: { radius: 8, threshold: 0.6 } },
  sepia: { label: 'Sepia', description: 'Warm brown toning', defaultIntensity: 70, params: {} },
  grayscale: { label: 'Grayscale', description: 'Remove all color', defaultIntensity: 100, params: {} },
  invert: { label: 'Invert', description: 'Negative image effect', defaultIntensity: 100, params: {} },
  emboss: { label: 'Emboss', description: 'Raised surface texture', defaultIntensity: 50, params: { strength: 1 } },
  edge_detect: { label: 'Edge Detect', description: 'Outline edges only', defaultIntensity: 80, params: { threshold: 0.3 } },
  posterize: { label: 'Posterize', description: 'Reduced color palette', defaultIntensity: 60, params: { levels: 6 } },
  pixelate: { label: 'Pixelate', description: 'Retro pixel mosaic', defaultIntensity: 40, params: { blockSize: 8 } },
  chromatic_aberration: { label: 'Chromatic Aberration', description: 'RGB color fringing', defaultIntensity: 30, params: { offset: 3 } },
  lens_flare: { label: 'Lens Flare', description: 'Cinematic light flare', defaultIntensity: 50, params: { x: 0.7, y: 0.3, brightness: 1 } },
  light_leak: { label: 'Light Leak', description: 'Analog film light leak', defaultIntensity: 40, params: { color: '#ff6600', position: 'top_right' } },
  film_dust: { label: 'Film Dust', description: 'Vintage film scratches and dust', defaultIntensity: 25, params: { density: 0.3, scratchCount: 4 } },
  glitch: { label: 'Glitch', description: 'Digital glitch distortion', defaultIntensity: 50, params: { sliceCount: 5, rgbShift: 4, scanlines: true } },
  halftone: { label: 'Halftone', description: 'Print halftone dot pattern', defaultIntensity: 60, params: { dotSize: 4, angle: 45 } },
};

// ─── Motion Effect Metadata ────────────────────────────────────────────────

export const MOTION_META: Record<MotionEffect, {
  label: string;
  description: string;
  defaultParams: Record<string, number>;
}> = {
  none: { label: 'None', description: 'No motion effect', defaultParams: {} },
  ken_burns: { label: 'Ken Burns', description: 'Slow zoom and pan across image', defaultParams: { speed: 0.5, startScale: 1.0, endScale: 1.3 } },
  parallax: { label: 'Parallax', description: 'Depth-based layer movement', defaultParams: { speed: 0.3, depth: 2 } },
  zoom_in: { label: 'Zoom In', description: 'Gradual zoom towards center', defaultParams: { speed: 0.5, startScale: 1.0, endScale: 1.5 } },
  zoom_out: { label: 'Zoom Out', description: 'Pull back from center', defaultParams: { speed: 0.5, startScale: 1.5, endScale: 1.0 } },
  pan_left: { label: 'Pan Left', description: 'Horizontal pan left to right', defaultParams: { speed: 0.4, distance: 100 } },
  pan_right: { label: 'Pan Right', description: 'Horizontal pan right to left', defaultParams: { speed: 0.4, distance: 100 } },
  pan_up: { label: 'Pan Up', description: 'Vertical pan bottom to top', defaultParams: { speed: 0.4, distance: 100 } },
  pan_down: { label: 'Pan Down', description: 'Vertical pan top to bottom', defaultParams: { speed: 0.4, distance: 100 } },
  dolly_zoom: { label: 'Dolly Zoom', description: 'Vertigo effect, zoom + dolly', defaultParams: { speed: 0.6, intensity: 1.0 } },
  orbit: { label: 'Orbit', description: '3D orbital rotation', defaultParams: { speed: 0.3, radius: 50, axis: 0 } },
  shake: { label: 'Shake', description: 'Handheld camera shake', defaultParams: { speed: 1.0, intensity: 5 } },
  float: { label: 'Float', description: 'Gentle floating movement', defaultParams: { speed: 0.2, amplitude: 10 } },
  bounce: { label: 'Bounce', description: 'Rhythmic bounce motion', defaultParams: { speed: 0.8, height: 15, damping: 0.9 } },
};

// ─── Composition Mode Metadata ─────────────────────────────────────────────

export const COMPOSITION_META: Record<CompositionMode, {
  label: string;
  description: string;
  defaultParams: Record<string, any>;
}> = {
  normal: { label: 'Normal', description: 'Standard single-clip view', defaultParams: {} },
  picture_in_picture: { label: 'Picture-in-Picture', description: 'Small overlay in corner', defaultParams: { position: 'bottom_right', scale: 0.3, padding: 16 } },
  split_screen_h: { label: 'Split Horizontal', description: 'Side-by-side horizontal split', defaultParams: { splitRatio: 0.5, gap: 2 } },
  split_screen_v: { label: 'Split Vertical', description: 'Top-bottom vertical split', defaultParams: { splitRatio: 0.5, gap: 2 } },
  green_screen: { label: 'Green Screen', description: 'Chroma key background removal', defaultParams: { keyColor: '#00ff00', tolerance: 0.3, softness: 0.1 } },
  overlay_blend: { label: 'Overlay Blend', description: 'Blended overlay compositing', defaultParams: { blendMode: 'overlay', opacity: 0.5 } },
  side_by_side: { label: 'Side by Side', description: 'Equal side-by-side layout', defaultParams: { gap: 4, borderRadius: 8 } },
  grid_2x2: { label: '2x2 Grid', description: 'Four-way grid layout', defaultParams: { gap: 4, borderRadius: 4 } },
  cutaway: { label: 'Cutaway', description: 'B-roll insert over A-roll', defaultParams: { transitionDurationMs: 300, opacity: 1.0 } },
  reaction: { label: 'Reaction', description: 'Reaction cam with main content', defaultParams: { reactorPosition: 'bottom_left', reactorScale: 0.35, mainScale: 0.9 } },
};

// ─── Effect Presets Library ────────────────────────────────────────────────

const EFFECT_PRESETS: EffectPreset[] = [
  {
    id: 'preset_cinematic_blockbuster',
    name: 'Cinematic Blockbuster',
    description: 'Hollywood-grade teal & orange grading with lens flare and subtle vignette',
    category: 'cinematic',
    effects: [
      { category: 'color_grading', type: 'teal_orange', intensity: 80, enabled: true, order: 0, params: { ...COLOR_GRADING_META.teal_orange.params } },
      { category: 'filter', type: 'vignette', intensity: 40, enabled: true, order: 1, params: { size: 0.6, softness: 0.5 } },
      { category: 'filter', type: 'lens_flare', intensity: 25, enabled: true, order: 2, params: { x: 0.7, y: 0.3, brightness: 0.8 } },
      { category: 'filter', type: 'grain', intensity: 15, enabled: true, order: 3, params: { size: 0.8, roughness: 0.3 } },
    ],
  },
  {
    id: 'preset_cinematic_noir',
    name: 'Cinematic Noir',
    description: 'High contrast black & white with heavy vignette and film grain',
    category: 'cinematic',
    effects: [
      { category: 'color_grading', type: 'noir', intensity: 100, enabled: true, order: 0, params: { ...COLOR_GRADING_META.noir.params } },
      { category: 'filter', type: 'vignette', intensity: 70, enabled: true, order: 1, params: { size: 0.4, softness: 0.6 } },
      { category: 'filter', type: 'grain', intensity: 35, enabled: true, order: 2, params: { size: 1.2, roughness: 0.6 } },
    ],
  },
  {
    id: 'preset_cinematic_dreamy',
    name: 'Dreamy Cinema',
    description: 'Soft glow, pastel tones, and gentle motion for romantic or fantasy scenes',
    category: 'cinematic',
    effects: [
      { category: 'color_grading', type: 'pastel', intensity: 70, enabled: true, order: 0, params: { ...COLOR_GRADING_META.pastel.params } },
      { category: 'filter', type: 'glow', intensity: 50, enabled: true, order: 1, params: { radius: 12, threshold: 0.5 } },
      { category: 'filter', type: 'light_leak', intensity: 30, enabled: true, order: 2, params: { color: '#ffaacc', position: 'top_left' } },
    ],
  },
  {
    id: 'preset_social_tiktok_viral',
    name: 'TikTok Viral',
    description: 'Vivid colors, high contrast, slight glitch for attention-grabbing content',
    category: 'social_media',
    effects: [
      { category: 'color_grading', type: 'vivid', intensity: 85, enabled: true, order: 0, params: { ...COLOR_GRADING_META.vivid.params } },
      { category: 'filter', type: 'sharpen', intensity: 40, enabled: true, order: 1, params: { amount: 1.2 } },
      { category: 'filter', type: 'chromatic_aberration', intensity: 20, enabled: true, order: 2, params: { offset: 2 } },
    ],
  },
  {
    id: 'preset_social_instagram_warm',
    name: 'Instagram Warm',
    description: 'Warm golden tones with soft vignette for lifestyle and travel content',
    category: 'social_media',
    effects: [
      { category: 'color_grading', type: 'warm', intensity: 75, enabled: true, order: 0, params: { ...COLOR_GRADING_META.warm.params } },
      { category: 'filter', type: 'vignette', intensity: 30, enabled: true, order: 1, params: { size: 0.7, softness: 0.6 } },
      { category: 'filter', type: 'glow', intensity: 20, enabled: true, order: 2, params: { radius: 6, threshold: 0.7 } },
    ],
  },
  {
    id: 'preset_social_reels_pop',
    name: 'Reels Pop',
    description: 'High saturation with cool undertones for eye-catching social media content',
    category: 'social_media',
    effects: [
      { category: 'color_grading', type: 'cool', intensity: 50, enabled: true, order: 0, params: { ...COLOR_GRADING_META.cool.params } },
      { category: 'filter', type: 'sharpen', intensity: 60, enabled: true, order: 1, params: { amount: 1.8 } },
      { category: 'motion', type: 'zoom_in', intensity: 30, enabled: true, order: 2, params: { speed: 0.3, startScale: 1.0, endScale: 1.1 } },
    ],
  },
  {
    id: 'preset_corporate_clean',
    name: 'Corporate Clean',
    description: 'Professional, neutral tones with subtle sharpening for business presentations',
    category: 'corporate',
    effects: [
      { category: 'color_grading', type: 'none', intensity: 100, enabled: true, order: 0, params: { brightness: 5, contrast: 5, saturation: -5, temperature: 0 } },
      { category: 'filter', type: 'sharpen', intensity: 35, enabled: true, order: 1, params: { amount: 1.0 } },
    ],
  },
  {
    id: 'preset_corporate_branded',
    name: 'Corporate Branded',
    description: 'Slightly warm and contrasty for polished branded video content',
    category: 'corporate',
    effects: [
      { category: 'color_grading', type: 'warm', intensity: 30, enabled: true, order: 0, params: { temperature: 10, contrast: 8, saturation: 5 } },
      { category: 'filter', type: 'vignette', intensity: 20, enabled: true, order: 1, params: { size: 0.8, softness: 0.7 } },
      { category: 'filter', type: 'sharpen', intensity: 25, enabled: true, order: 2, params: { amount: 0.8 } },
    ],
  },
  {
    id: 'preset_documentary_gritty',
    name: 'Documentary Gritty',
    description: 'Desaturated, grainy look for raw, authentic documentary storytelling',
    category: 'documentary',
    effects: [
      { category: 'color_grading', type: 'desaturated', intensity: 80, enabled: true, order: 0, params: { ...COLOR_GRADING_META.desaturated.params } },
      { category: 'filter', type: 'grain', intensity: 45, enabled: true, order: 1, params: { size: 1.5, roughness: 0.7 } },
      { category: 'filter', type: 'sharpen', intensity: 30, enabled: true, order: 2, params: { amount: 1.3 } },
      { category: 'filter', type: 'vignette', intensity: 35, enabled: true, order: 3, params: { size: 0.5, softness: 0.4 } },
    ],
  },
  {
    id: 'preset_documentary_natural',
    name: 'Documentary Natural',
    description: 'Subtle grading for nature and wildlife documentaries',
    category: 'documentary',
    effects: [
      { category: 'color_grading', type: 'documentary', intensity: 60, enabled: true, order: 0, params: { ...COLOR_GRADING_META.documentary.params } },
      { category: 'filter', type: 'sharpen', intensity: 40, enabled: true, order: 1, params: { amount: 1.1 } },
    ],
  },
  {
    id: 'preset_creative_retro_vhs',
    name: 'Retro VHS',
    description: 'Nostalgic VHS tape look with glitch, grain, and chromatic aberration',
    category: 'creative',
    effects: [
      { category: 'color_grading', type: 'vintage', intensity: 70, enabled: true, order: 0, params: { ...COLOR_GRADING_META.vintage.params } },
      { category: 'filter', type: 'grain', intensity: 60, enabled: true, order: 1, params: { size: 2, roughness: 0.8 } },
      { category: 'filter', type: 'chromatic_aberration', intensity: 45, enabled: true, order: 2, params: { offset: 5 } },
      { category: 'filter', type: 'glitch', intensity: 25, enabled: true, order: 3, params: { sliceCount: 3, rgbShift: 6, scanlines: true } },
    ],
  },
  {
    id: 'preset_creative_comic_book',
    name: 'Comic Book',
    description: 'Posterized colors with halftone dots and edge detection for comic style',
    category: 'creative',
    effects: [
      { category: 'color_grading', type: 'high_contrast', intensity: 80, enabled: true, order: 0, params: { ...COLOR_GRADING_META.high_contrast.params } },
      { category: 'filter', type: 'posterize', intensity: 70, enabled: true, order: 1, params: { levels: 4 } },
      { category: 'filter', type: 'halftone', intensity: 40, enabled: true, order: 2, params: { dotSize: 3, angle: 45 } },
      { category: 'filter', type: 'edge_detect', intensity: 30, enabled: true, order: 3, params: { threshold: 0.25 } },
    ],
  },
  {
    id: 'preset_broadcast_news',
    name: 'Broadcast News',
    description: 'Clean, bright, and sharp for professional broadcast look',
    category: 'broadcast',
    effects: [
      { category: 'color_grading', type: 'none', intensity: 100, enabled: true, order: 0, params: { brightness: 8, contrast: 10, saturation: 5, temperature: -3 } },
      { category: 'filter', type: 'sharpen', intensity: 55, enabled: true, order: 1, params: { amount: 1.5 } },
    ],
  },
  {
    id: 'preset_music_video_neon',
    name: 'Music Video Neon',
    description: 'Neon-lit electric colors with glow and chromatic aberration for energy',
    category: 'music_video',
    effects: [
      { category: 'color_grading', type: 'neon', intensity: 90, enabled: true, order: 0, params: { ...COLOR_GRADING_META.neon.params } },
      { category: 'filter', type: 'glow', intensity: 60, enabled: true, order: 1, params: { radius: 10, threshold: 0.4 } },
      { category: 'filter', type: 'chromatic_aberration', intensity: 35, enabled: true, order: 2, params: { offset: 4 } },
      { category: 'filter', type: 'light_leak', intensity: 30, enabled: true, order: 3, params: { color: '#ff00ff', position: 'center' } },
    ],
  },
  {
    id: 'preset_music_video_moody',
    name: 'Music Video Moody',
    description: 'Dark, atmospheric look with bleach bypass grading and heavy vignette',
    category: 'music_video',
    effects: [
      { category: 'color_grading', type: 'bleach_bypass', intensity: 85, enabled: true, order: 0, params: { ...COLOR_GRADING_META.bleach_bypass.params } },
      { category: 'filter', type: 'vignette', intensity: 60, enabled: true, order: 1, params: { size: 0.4, softness: 0.5 } },
      { category: 'filter', type: 'grain', intensity: 20, enabled: true, order: 2, params: { size: 1, roughness: 0.4 } },
    ],
  },
];

// ─── ID Generator ──────────────────────────────────────────────────────────

function generateEffectId(): string {
  return `vfx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generatePresetId(): string {
  return `preset_custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Hook Return Type ──────────────────────────────────────────────────────

export interface VideoEffectsHook {
  // State
  clipEffects: Record<string, VideoEffect[]>;
  activePreviewClipId: string | null;
  isProcessing: boolean;
  presets: EffectPreset[];

  // Effect management
  addEffect: (clipId: string, category: EffectCategory, type: string, params?: Record<string, any>) => string;
  removeEffect: (effectId: string) => void;
  updateEffect: (effectId: string, updates: Partial<VideoEffect>) => void;
  reorderEffects: (clipId: string, effectIds: string[]) => void;
  toggleEffect: (effectId: string) => void;
  clearClipEffects: (clipId: string) => void;

  // Presets
  applyPreset: (clipId: string, presetId: string) => void;
  applyPresetToAll: (presetId: string) => void;
  saveAsPreset: (clipId: string, name: string, category: EffectPreset['category']) => void;

  // Color grading
  setColorGrading: (clipId: string, preset: ColorGradingPreset) => void;
  adjustColorGrading: (clipId: string, adjustments: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    temperature?: number;
    tint?: number;
    highlights?: number;
    shadows?: number;
  }) => void;

  // Filters
  addFilter: (clipId: string, filter: FilterType, intensity?: number) => string;

  // Motion
  setMotionEffect: (clipId: string, motion: MotionEffect, params?: { speed?: number; direction?: number }) => void;

  // Composition
  setCompositionMode: (clipId: string, mode: CompositionMode) => void;

  // Preview
  previewEffect: (clipId: string) => void;
  stopPreview: () => void;

  // Bulk operations
  copyEffects: (fromClipId: string, toClipIds: string[]) => void;

  // Stats
  effectCount: number;
  clipsWithEffects: number;
}

// ─── Hook Implementation ───────────────────────────────────────────────────

export function useVideoEffects(): VideoEffectsHook {
  const [clipEffects, setClipEffects] = useState<Record<string, VideoEffect[]>>({});
  const [activePreviewClipId, setActivePreviewClipId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPresets, setCustomPresets] = useState<EffectPreset[]>([]);

  // Combined presets: built-in + custom
  const presets = useMemo(() => [...EFFECT_PRESETS, ...customPresets], [customPresets]);

  // ── Helper: get effects for a clip ─────────────────────────────────────

  const getClipEffects = useCallback((clipId: string): VideoEffect[] => {
    return clipEffects[clipId] || [];
  }, [clipEffects]);

  // ── Helper: get next order value for a clip ────────────────────────────

  const getNextOrder = useCallback((clipId: string): number => {
    const effects = getClipEffects(clipId);
    if (effects.length === 0) return 0;
    return Math.max(...effects.map(e => e.order)) + 1;
  }, [getClipEffects]);

  // ── Helper: find effect by id across all clips ─────────────────────────

  const findEffect = useCallback((effectId: string): { clipId: string; effect: VideoEffect } | null => {
    for (const [clipId, effects] of Object.entries(clipEffects)) {
      const effect = effects.find(e => e.id === effectId);
      if (effect) return { clipId, effect };
    }
    return null;
  }, [clipEffects]);

  // ── addEffect ──────────────────────────────────────────────────────────

  const addEffect = useCallback((
    clipId: string,
    category: EffectCategory,
    type: string,
    params: Record<string, any> = {},
  ): string => {
    const id = generateEffectId();
    const order = getNextOrder(clipId);

    const newEffect: VideoEffect = {
      id,
      clipId,
      category,
      type,
      intensity: 75,
      enabled: true,
      order,
      params,
    };

    setClipEffects(prev => ({
      ...prev,
      [clipId]: [...(prev[clipId] || []), newEffect],
    }));

    return id;
  }, [getNextOrder]);

  // ── removeEffect ───────────────────────────────────────────────────────

  const removeEffect = useCallback((effectId: string) => {
    const found = findEffect(effectId);
    if (!found) return;

    setClipEffects(prev => {
      const updated = (prev[found.clipId] || []).filter(e => e.id !== effectId);
      const reordered = updated.map((e, idx) => ({ ...e, order: idx }));
      if (reordered.length === 0) {
        const next = { ...prev };
        delete next[found.clipId];
        return next;
      }
      return { ...prev, [found.clipId]: reordered };
    });
  }, [findEffect]);

  // ── updateEffect ───────────────────────────────────────────────────────

  const updateEffect = useCallback((effectId: string, updates: Partial<VideoEffect>) => {
    const found = findEffect(effectId);
    if (!found) return;

    setClipEffects(prev => ({
      ...prev,
      [found.clipId]: (prev[found.clipId] || []).map(e =>
        e.id === effectId ? { ...e, ...updates, id: e.id, clipId: e.clipId } : e
      ),
    }));
  }, [findEffect]);

  // ── reorderEffects ─────────────────────────────────────────────────────

  const reorderEffects = useCallback((clipId: string, effectIds: string[]) => {
    setClipEffects(prev => {
      const existing = prev[clipId] || [];
      const effectMap = new Map(existing.map(e => [e.id, e]));
      const reordered = effectIds
        .map((id, idx) => {
          const effect = effectMap.get(id);
          if (!effect) return null;
          return { ...effect, order: idx };
        })
        .filter((e): e is VideoEffect => e !== null);

      // Append any effects not in the provided order
      const orderedIds = new Set(effectIds);
      const remaining = existing
        .filter(e => !orderedIds.has(e.id))
        .map((e, idx) => ({ ...e, order: reordered.length + idx }));

      return { ...prev, [clipId]: [...reordered, ...remaining] };
    });
  }, []);

  // ── toggleEffect ───────────────────────────────────────────────────────

  const toggleEffect = useCallback((effectId: string) => {
    const found = findEffect(effectId);
    if (!found) return;

    setClipEffects(prev => ({
      ...prev,
      [found.clipId]: (prev[found.clipId] || []).map(e =>
        e.id === effectId ? { ...e, enabled: !e.enabled } : e
      ),
    }));
  }, [findEffect]);

  // ── clearClipEffects ───────────────────────────────────────────────────

  const clearClipEffects = useCallback((clipId: string) => {
    setClipEffects(prev => {
      const next = { ...prev };
      delete next[clipId];
      return next;
    });
  }, []);

  // ── applyPreset ────────────────────────────────────────────────────────

  const applyPreset = useCallback((clipId: string, presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setIsProcessing(true);

    const newEffects: VideoEffect[] = preset.effects.map((effect, idx) => ({
      ...effect,
      id: generateEffectId(),
      clipId,
      order: idx,
    }));

    setClipEffects(prev => ({
      ...prev,
      [clipId]: newEffects,
    }));

    setIsProcessing(false);
  }, [presets]);

  // ── applyPresetToAll ───────────────────────────────────────────────────

  const applyPresetToAll = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setIsProcessing(true);

    setClipEffects(prev => {
      const allClipIds = new Set(Object.keys(prev));
      const next: Record<string, VideoEffect[]> = {};

      allClipIds.forEach(clipId => {
        next[clipId] = preset.effects.map((effect, idx) => ({
          ...effect,
          id: generateEffectId(),
          clipId,
          order: idx,
        }));
      });

      return next;
    });

    setIsProcessing(false);
  }, [presets]);

  // ── saveAsPreset ───────────────────────────────────────────────────────

  const saveAsPreset = useCallback((clipId: string, name: string, category: EffectPreset['category']) => {
    const effects = getClipEffects(clipId);
    if (effects.length === 0) return;

    const newPreset: EffectPreset = {
      id: generatePresetId(),
      name,
      description: `Custom preset created from clip effects (${effects.length} effects)`,
      category,
      effects: effects.map(({ id, clipId: _cid, ...rest }) => rest),
    };

    setCustomPresets(prev => [...prev, newPreset]);
  }, [getClipEffects]);

  // ── setColorGrading ────────────────────────────────────────────────────

  const setColorGrading = useCallback((clipId: string, preset: ColorGradingPreset) => {
    const meta = COLOR_GRADING_META[preset];
    if (!meta) return;

    // Remove any existing color grading effect on this clip
    setClipEffects(prev => {
      const existing = (prev[clipId] || []).filter(e => e.category !== 'color_grading');

      if (preset === 'none') {
        const reordered = existing.map((e, idx) => ({ ...e, order: idx }));
        if (reordered.length === 0) {
          const next = { ...prev };
          delete next[clipId];
          return next;
        }
        return { ...prev, [clipId]: reordered };
      }

      const newEffect: VideoEffect = {
        id: generateEffectId(),
        clipId,
        category: 'color_grading',
        type: preset,
        intensity: 75,
        enabled: true,
        order: 0,
        params: { ...meta.params },
      };

      const reordered = [newEffect, ...existing.map((e, idx) => ({ ...e, order: idx + 1 }))];
      return { ...prev, [clipId]: reordered };
    });
  }, []);

  // ── adjustColorGrading ─────────────────────────────────────────────────

  const adjustColorGrading = useCallback((clipId: string, adjustments: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    temperature?: number;
    tint?: number;
    highlights?: number;
    shadows?: number;
  }) => {
    setClipEffects(prev => {
      const existing = prev[clipId] || [];
      const gradingEffect = existing.find(e => e.category === 'color_grading');

      if (gradingEffect) {
        return {
          ...prev,
          [clipId]: existing.map(e =>
            e.id === gradingEffect.id
              ? { ...e, params: { ...e.params, ...adjustments } }
              : e
          ),
        };
      }

      // No color grading effect yet, create a manual one
      const newEffect: VideoEffect = {
        id: generateEffectId(),
        clipId,
        category: 'color_grading',
        type: 'none',
        intensity: 100,
        enabled: true,
        order: 0,
        params: { ...adjustments },
      };

      const reordered = [newEffect, ...existing.map((e, idx) => ({ ...e, order: idx + 1 }))];
      return { ...prev, [clipId]: reordered };
    });
  }, []);

  // ── addFilter ──────────────────────────────────────────────────────────

  const addFilter = useCallback((clipId: string, filter: FilterType, intensity?: number): string => {
    const meta = FILTER_META[filter];
    const effectIntensity = intensity ?? meta.defaultIntensity;

    return addEffect(clipId, 'filter', filter, { ...meta.params, intensity: effectIntensity });
  }, [addEffect]);

  // ── setMotionEffect ────────────────────────────────────────────────────

  const setMotionEffect = useCallback((clipId: string, motion: MotionEffect, params?: { speed?: number; direction?: number }) => {
    const meta = MOTION_META[motion];
    if (!meta) return;

    // Remove existing motion effect on this clip
    setClipEffects(prev => {
      const existing = (prev[clipId] || []).filter(e => e.category !== 'motion');

      if (motion === 'none') {
        const reordered = existing.map((e, idx) => ({ ...e, order: idx }));
        if (reordered.length === 0) {
          const next = { ...prev };
          delete next[clipId];
          return next;
        }
        return { ...prev, [clipId]: reordered };
      }

      const newEffect: VideoEffect = {
        id: generateEffectId(),
        clipId,
        category: 'motion',
        type: motion,
        intensity: 75,
        enabled: true,
        order: existing.length,
        params: { ...meta.defaultParams, ...params },
      };

      return { ...prev, [clipId]: [...existing, newEffect] };
    });
  }, []);

  // ── setCompositionMode ─────────────────────────────────────────────────

  const setCompositionMode = useCallback((clipId: string, mode: CompositionMode) => {
    const meta = COMPOSITION_META[mode];
    if (!meta) return;

    // Remove existing composition effect on this clip
    setClipEffects(prev => {
      const existing = (prev[clipId] || []).filter(e => e.category !== 'composition');

      if (mode === 'normal') {
        const reordered = existing.map((e, idx) => ({ ...e, order: idx }));
        if (reordered.length === 0) {
          const next = { ...prev };
          delete next[clipId];
          return next;
        }
        return { ...prev, [clipId]: reordered };
      }

      const newEffect: VideoEffect = {
        id: generateEffectId(),
        clipId,
        category: 'composition',
        type: mode,
        intensity: 100,
        enabled: true,
        order: existing.length,
        params: { ...meta.defaultParams },
      };

      return { ...prev, [clipId]: [...existing, newEffect] };
    });
  }, []);

  // ── previewEffect ──────────────────────────────────────────────────────

  const previewEffect = useCallback((clipId: string) => {
    setActivePreviewClipId(clipId);
  }, []);

  // ── stopPreview ────────────────────────────────────────────────────────

  const stopPreview = useCallback(() => {
    setActivePreviewClipId(null);
  }, []);

  // ── copyEffects ────────────────────────────────────────────────────────

  const copyEffects = useCallback((fromClipId: string, toClipIds: string[]) => {
    const sourceEffects = getClipEffects(fromClipId);
    if (sourceEffects.length === 0) return;

    setIsProcessing(true);

    setClipEffects(prev => {
      const next = { ...prev };
      toClipIds.forEach(targetClipId => {
        next[targetClipId] = sourceEffects.map((effect, idx) => ({
          ...effect,
          id: generateEffectId(),
          clipId: targetClipId,
          order: idx,
        }));
      });
      return next;
    });

    setIsProcessing(false);
  }, [getClipEffects]);

  // ── Stats ──────────────────────────────────────────────────────────────

  const effectCount = useMemo(() => {
    return Object.values(clipEffects).reduce((sum, effects) => sum + effects.length, 0);
  }, [clipEffects]);

  const clipsWithEffects = useMemo(() => {
    return Object.keys(clipEffects).filter(clipId => (clipEffects[clipId] || []).length > 0).length;
  }, [clipEffects]);

  // ── Return ─────────────────────────────────────────────────────────────

  return {
    // State
    clipEffects,
    activePreviewClipId,
    isProcessing,
    presets,

    // Effect management
    addEffect,
    removeEffect,
    updateEffect,
    reorderEffects,
    toggleEffect,
    clearClipEffects,

    // Presets
    applyPreset,
    applyPresetToAll,
    saveAsPreset,

    // Color grading
    setColorGrading,
    adjustColorGrading,

    // Filters
    addFilter,

    // Motion
    setMotionEffect,

    // Composition
    setCompositionMode,

    // Preview
    previewEffect,
    stopPreview,

    // Bulk operations
    copyEffects,

    // Stats
    effectCount,
    clipsWithEffects,
  };
}
