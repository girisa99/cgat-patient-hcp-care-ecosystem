/**
 * UNIFIED STYLE REGISTRY — Single import for Cast + Deck
 *
 * Merges ALL video/presentation/animation styles:
 *   - 43 original master styles (storytelling, avatar, animation, interactive, marketing, enterprise, healthcare, entertainment)
 *   - 20 presentation/infographic styles (NEW — animated infographic, customer journey, data story, etc.)
 *   - 30 extended styles (hand-drawn, photorealistic, character, cyber, educational, artistic)
 *   = 93 total production styles
 *
 * Used by: GenieCast, GenieDeck, GenieVibe, and any product that produces visual content.
 *
 * IMPORTANT: This is the SINGLE import point for all visual production styles.
 * Do NOT import from master-ecosystem-registry.ts or extended-video-styles.ts directly.
 */

import { MASTER_VIDEO_STYLES, type VideoStyleId, type VideoStyleEntry, type VideoStyleCategory } from './master-ecosystem-registry';
import { EXTENDED_VIDEO_STYLES, type ExtendedVideoStyle } from './extended-video-styles';

// Re-export core types
export type { VideoStyleId, VideoStyleEntry, VideoStyleCategory, ExtendedVideoStyle };

// ─── Unified style (superset type that works for both master and extended) ───

export interface UnifiedVideoStyle {
  id: string;
  title: string;
  category: VideoStyleCategory | ExtendedVideoStyle['category'];
  description: string;
  icon: string;
  videoProvider: string;
  avatarProvider?: string;
  animationProvider?: string;
  ttsStyle: string;
  pacing: 'slow' | 'normal' | 'fast' | 'dynamic';
  industries: string[];
  capabilities?: string[];
  regionalFit?: string[];
  popular?: boolean;
  new?: boolean;
  premium?: boolean;
  // Source tracking
  source: 'master' | 'extended';
  // Deck compatibility
  deckCompatible: boolean;
  // Cast compatibility
  castCompatible: boolean;
}

// ─── Merge all styles ────────────────────────────────────────────────────────

const masterAsUnified: UnifiedVideoStyle[] = MASTER_VIDEO_STYLES.map(s => ({
  ...s,
  source: 'master' as const,
  deckCompatible: true,
  castCompatible: true,
}));

const extendedAsUnified: UnifiedVideoStyle[] = EXTENDED_VIDEO_STYLES.map(s => ({
  ...s,
  source: 'extended' as const,
  deckCompatible: true,
  castCompatible: true,
}));

/**
 * ALL_STYLES — Complete merged registry of 93 production styles.
 * Deduplicated: if an extended style has the same ID as a master style, master wins.
 */
const masterIds = new Set(MASTER_VIDEO_STYLES.map(s => s.id));
const dedupedExtended = extendedAsUnified.filter(s => !masterIds.has(s.id as VideoStyleId));

export const ALL_STYLES: UnifiedVideoStyle[] = [...masterAsUnified, ...dedupedExtended];

// ─── Category groupings ─────────────────────────────────────────────────────

export type StyleSuperCategory =
  | 'storytelling_narrative'
  | 'avatar_presenter'
  | 'animation_motion'
  | 'presentation_infographic'
  | 'data_visualization'
  | 'interactive_immersive'
  | 'marketing_social'
  | 'enterprise_training'
  | 'healthcare_medical'
  | 'entertainment_creative'
  | 'hand_drawn_artistic'
  | 'cyber_futuristic'
  | 'photorealistic_cinematic'
  | 'educational';

const CATEGORY_MAP: Record<string, StyleSuperCategory> = {
  storytelling: 'storytelling_narrative',
  avatar: 'avatar_presenter',
  animation: 'animation_motion',
  presentation: 'presentation_infographic',
  infographic: 'presentation_infographic',
  data_visualization: 'data_visualization',
  interactive: 'interactive_immersive',
  marketing: 'marketing_social',
  social_platform: 'marketing_social',
  enterprise: 'enterprise_training',
  healthcare: 'healthcare_medical',
  entertainment: 'entertainment_creative',
  news_media: 'entertainment_creative',
  hand_drawn: 'hand_drawn_artistic',
  animated: 'hand_drawn_artistic',
  artistic: 'hand_drawn_artistic',
  cyber: 'cyber_futuristic',
  cyber_tech: 'cyber_futuristic',
  photorealistic: 'photorealistic_cinematic',
  character: 'avatar_presenter',
  education: 'educational',
  educational: 'educational',
  ecommerce: 'marketing_social',
};

export function getSuperCategory(category: string): StyleSuperCategory {
  return CATEGORY_MAP[category] || 'entertainment_creative';
}

// ─── Query helpers ──────────────────────────────────────────────────────────

/** Get all styles in a super-category */
export function getStylesBySuperCategory(superCat: StyleSuperCategory): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s => getSuperCategory(s.category) === superCat);
}

/** Get styles compatible with Deck (presentations) */
export function getDeckStyles(): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s => s.deckCompatible);
}

/** Get styles compatible with Cast (video production) */
export function getCastStyles(): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s => s.castCompatible);
}

/** Get styles by industry */
export function getStylesByIndustry(industry: string): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s => s.industries.includes(industry));
}

/** Get popular styles */
export function getPopularStyles(): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s => s.popular);
}

/** Get new styles */
export function getNewStyles(): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s => s.new);
}

/** Get styles that need avatar */
export function getAvatarStyles(): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s => !!s.avatarProvider);
}

/** Get styles that need animation */
export function getAnimationStyles(): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s => !!s.animationProvider);
}

/** Get presentation-specific styles (infographic, data-viz, presentation) */
export function getPresentationStyles(): UnifiedVideoStyle[] {
  return ALL_STYLES.filter(s =>
    s.category === 'presentation' || s.category === 'infographic' || s.category === 'data_visualization'
  );
}

/** Find a style by ID */
export function findStyle(id: string): UnifiedVideoStyle | undefined {
  return ALL_STYLES.find(s => s.id === id);
}

// ─── Super-category display metadata ────────────────────────────────────────

export const SUPER_CATEGORY_META: Record<StyleSuperCategory, {
  label: string;
  description: string;
  icon: string;
  count: number;
}> = {
  storytelling_narrative: {
    label: 'Storytelling & Narrative',
    description: 'Documentary, micro-drama, testimonial, narrative arc',
    icon: 'BookOpen',
    count: getStylesBySuperCategory('storytelling_narrative').length,
  },
  avatar_presenter: {
    label: 'Avatar & Presenter',
    description: 'Photorealistic, 3D Pixar, 2D animated, digital twin, mascot, full body',
    icon: 'User',
    count: getStylesBySuperCategory('avatar_presenter').length,
  },
  animation_motion: {
    label: 'Animation & Motion',
    description: 'Anime, motion graphics, kinetic typography, whiteboard, image-to-life',
    icon: 'Sparkles',
    count: getStylesBySuperCategory('animation_motion').length,
  },
  presentation_infographic: {
    label: 'Presentation & Infographic',
    description: 'Customer journey, process flow, org chart, mind map, timeline, funnel, SWOT',
    icon: 'BarChart3',
    count: getStylesBySuperCategory('presentation_infographic').length,
  },
  data_visualization: {
    label: 'Data Visualization',
    description: 'Animated charts, dashboards, KPI cards, geographic maps, data stories',
    icon: 'TrendingUp',
    count: getStylesBySuperCategory('data_visualization').length,
  },
  interactive_immersive: {
    label: 'Interactive & Immersive',
    description: 'Quiz overlay, shoppable video, branching narrative, CTA videos',
    icon: 'MousePointer',
    count: getStylesBySuperCategory('interactive_immersive').length,
  },
  marketing_social: {
    label: 'Marketing & Social',
    description: 'Social media, video ads, product demo, event promo, comparison',
    icon: 'Megaphone',
    count: getStylesBySuperCategory('marketing_social').length,
  },
  enterprise_training: {
    label: 'Enterprise & Training',
    description: 'Corporate training, compliance, internal comms, investor update',
    icon: 'Building',
    count: getStylesBySuperCategory('enterprise_training').length,
  },
  healthcare_medical: {
    label: 'Healthcare & Medical',
    description: 'Patient education, provider training, medical 3D explainer',
    icon: 'Heart',
    count: getStylesBySuperCategory('healthcare_medical').length,
  },
  entertainment_creative: {
    label: 'Entertainment & Creative',
    description: 'Gaming trailer, music video, short film, podcast video',
    icon: 'Clapperboard',
    count: getStylesBySuperCategory('entertainment_creative').length,
  },
  hand_drawn_artistic: {
    label: 'Hand-Drawn & Artistic',
    description: 'Crayon sketch, watercolor, oil painting, stop-motion, paper cutout, vintage',
    icon: 'PenTool',
    count: getStylesBySuperCategory('hand_drawn_artistic').length,
  },
  cyber_futuristic: {
    label: 'Cyber & Futuristic',
    description: 'Cyberpunk, neon glow, glitch art, holographic, retro synthwave',
    icon: 'Zap',
    count: getStylesBySuperCategory('cyber_futuristic').length,
  },
  photorealistic_cinematic: {
    label: 'Photorealistic & Cinematic',
    description: '4K photorealistic, hyper-real, cinematic film, image upscaler',
    icon: 'Camera',
    count: getStylesBySuperCategory('photorealistic_cinematic').length,
  },
  educational: {
    label: 'Educational',
    description: 'Explainer video, school, tutorial, science documentary, motivational',
    icon: 'GraduationCap',
    count: getStylesBySuperCategory('educational').length,
  },
};

// ─── Stats ──────────────────────────────────────────────────────────────────

export const STYLE_COUNTS = {
  total: ALL_STYLES.length,
  master: masterAsUnified.length,
  extended: dedupedExtended.length,
  presentation: getPresentationStyles().length,
  avatar: getAvatarStyles().length,
  animated: getAnimationStyles().length,
  popular: getPopularStyles().length,
  deckCompatible: getDeckStyles().length,
  castCompatible: getCastStyles().length,
};
