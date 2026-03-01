/**
 * STYLE ↔ CATEGORY ↔ FORMAT MAPPING
 *
 * Maps visual style `.category` strings (DB column) to content category `name`
 * strings and content format `name` strings from cast-content-seeds.
 *
 * Used by CreateConfigureStep to auto-recommend styles based on the user's
 * selected content category + format. Recommended styles show first;
 * remaining styles appear under "More Styles" so users can still pick freely.
 *
 * Style categories come from cast_visual_styles.category (DB):
 *   presentation, framework, artistic, media, demo, seasonal, education,
 *   gaming, lifestyle, social, motion, healthcare, ecommerce, storytelling,
 *   immersive, character, illustration
 *
 * Content categories come from cast-content-seeds.ts (38 total):
 *   media, healthcare, education, government, oil_gas, travel, commercial,
 *   technology, celebrations, finance, fintech, real_estate, automotive,
 *   entertainment, retail_ecommerce, sports_fitness, hospitality_hotels,
 *   pharma_biotech, fashion_apparel, beauty_cosmetics, agriculture,
 *   energy_renewables, construction, gaming_esports, music_arts,
 *   cybersecurity, ai_ml, aerospace_defense, legal, nonprofit, logistics,
 *   telecom, insurance, wellness_spa, food_beverage, mining_metals,
 *   environmental, pet_care
 *
 * Content formats come from cast-content-seeds.ts:
 *   podcast, webcast, video, presentation, script, tts, voice, ugc,
 *   + 14 celebration-specific formats
 */

// ─── STYLE → CONTENT CATEGORY MAPPING ──────────────────────────────────────

/** Which content categories each style category is recommended for.
 *  '*' = universal — recommended for ALL content categories. */
const STYLE_TO_CATEGORIES: Record<string, string[] | '*'> = {
  // ── Universal styles — work with any content category ─────────────
  artistic:      '*',
  character:     '*',
  illustration:  '*',
  motion:        '*',
  social:        '*',

  // ── Styles from master-ecosystem-registry.ts ──────────────────────
  // storytelling (6 styles: smart_storytelling, hook_videos, micro_drama, etc.)
  storytelling:  ['media', 'education', 'celebrations', 'nonprofit', 'entertainment',
                  'music_arts', 'environmental'],
  // avatar (7 styles: photorealistic, 3d_pixar, 2d_animated, talking_photos, etc.)
  avatar:        ['celebrations', 'education', 'healthcare', 'commercial', 'media',
                  'entertainment', 'technology', 'hospitality_hotels'],
  // animation (6 styles: anime, image_to_life, explainer_3d, motion_graphics, etc.)
  animation:     ['celebrations', 'education', 'entertainment', 'technology', 'media',
                  'gaming_esports', 'music_arts', 'retail_ecommerce'],
  // interactive (5 styles: educational, quiz, cta_videos, shoppable_video, etc.)
  interactive:   ['education', 'technology', 'celebrations', 'retail_ecommerce',
                  'gaming_esports', 'commercial'],
  // marketing (8 styles)
  marketing:     ['commercial', 'celebrations', 'retail_ecommerce', 'food_beverage',
                  'beauty_cosmetics', 'fashion_apparel', 'media', 'hospitality_hotels'],
  // enterprise (4 styles)
  enterprise:    ['commercial', 'government', 'finance', 'technology', 'insurance',
                  'legal', 'oil_gas', 'aerospace_defense'],
  // entertainment (4 styles)
  entertainment: ['entertainment', 'celebrations', 'media', 'music_arts',
                  'gaming_esports', 'sports_fitness'],
  // healthcare (3 styles)
  healthcare:    ['healthcare', 'pharma_biotech', 'wellness_spa'],
  // presentation (8 styles)
  presentation:  ['education', 'healthcare', 'government', 'oil_gas', 'technology', 'commercial',
                  'finance', 'fintech', 'insurance', 'legal', 'pharma_biotech', 'aerospace_defense',
                  'energy_renewables', 'mining_metals', 'logistics', 'telecom', 'construction',
                  'environmental', 'nonprofit', 'agriculture'],
  // infographic (7 styles)
  infographic:   ['education', 'healthcare', 'technology', 'finance', 'government',
                  'media', 'nonprofit', 'environmental'],
  // data_visualization (5 styles)
  data_visualization: ['technology', 'finance', 'healthcare', 'government', 'ai_ml',
                       'energy_renewables', 'logistics'],

  // ── Styles from extended-video-styles.ts ──────────────────────────
  // animated (7 styles)
  animated:      ['celebrations', 'education', 'entertainment', 'media', 'technology',
                  'gaming_esports', 'music_arts'],
  // educational (6 styles)
  educational:   ['education', 'healthcare', 'technology', 'ai_ml', 'nonprofit'],
  // cyber (5 styles)
  cyber:         ['technology', 'cybersecurity', 'ai_ml', 'fintech', 'gaming_esports'],
  // photorealistic (4 styles)
  photorealistic: ['commercial', 'celebrations', 'real_estate', 'travel', 'automotive',
                   'hospitality_hotels', 'fashion_apparel', 'food_beverage'],

  // ── Previously orphaned categories (master-ecosystem-registry) ──────
  // 3d_vr_ar — immersive 3D/VR/AR styles
  '3d_vr_ar':    ['technology', 'real_estate', 'automotive', 'construction', 'aerospace_defense',
                  'gaming_esports', 'education', 'celebrations'],
  // audio — audio-focused production styles
  audio:         ['media', 'education', 'entertainment', 'music_arts', 'celebrations'],
  // document — document/report generation styles
  document:      ['education', 'healthcare', 'government', 'finance', 'legal', 'insurance'],
  // image — static image/graphic styles
  image:         '*',
  // localization — translation/localization styles
  localization:  ['media', 'commercial', 'education', 'healthcare', 'government', 'technology'],
  // repurposing — content repurposing styles
  repurposing:   ['media', 'commercial', 'education', 'entertainment', 'marketing'],
  // text_based — text-heavy content styles
  text_based:    ['education', 'healthcare', 'government', 'finance', 'legal', 'nonprofit'],
  // training_ld — learning & development styles
  training_ld:   ['education', 'healthcare', 'technology', 'government', 'commercial'],
  // video — general video production category
  video:         '*',

  // ── Legacy category aliases (kept for backward compat with DB styles) ──
  media:         ['media', 'commercial', 'celebrations', 'entertainment', 'music_arts', 'sports_fitness'],
  education:     ['education', 'ai_ml', 'cybersecurity'],
  gaming:        ['media', 'technology', 'gaming_esports', 'entertainment'],
  lifestyle:     ['travel', 'commercial', 'media', 'celebrations', 'hospitality_hotels', 'wellness_spa',
                  'food_beverage', 'beauty_cosmetics', 'fashion_apparel', 'pet_care'],
  ecommerce:     ['commercial', 'retail_ecommerce', 'food_beverage', 'beauty_cosmetics',
                  'fashion_apparel', 'pet_care'],
  demo:          ['technology', 'commercial', 'education', 'fintech', 'ai_ml', 'telecom',
                  'cybersecurity', 'automotive', 'logistics'],
  framework:     ['government', 'technology', 'commercial', 'education', 'finance', 'fintech',
                  'insurance', 'legal', 'cybersecurity', 'ai_ml', 'aerospace_defense',
                  'energy_renewables', 'logistics', 'telecom'],
  seasonal:      ['celebrations', 'commercial', 'media', 'retail_ecommerce', 'food_beverage'],
  immersive:     ['technology', 'media', 'travel', 'celebrations', 'real_estate', 'automotive', 'hospitality_hotels',
                  'aerospace_defense', 'gaming_esports', 'construction', 'mining_metals'],
};

// ─── STYLE → CONTENT FORMAT MAPPING ────────────────────────────────────────

/** Which content formats each style category is recommended for.
 *  '*' = universal — recommended for ALL formats. */
/** Celebration-specific format names used across multiple style categories. */
const CELEBRATION_FORMATS = [
  'celebration_invitation_video', 'celebration_save_the_date',
  'celebration_ceremony_recap_video', 'celebration_photo_montage_video',
  'celebration_social_clip', 'celebration_thank_you_video',
  'celebration_highlight_reel', 'celebration_announcement_video',
  'celebration_tribute_video', 'celebration_webcast_live',
  'celebration_digital_invitation',
];

const STYLE_TO_FORMATS: Record<string, string[] | '*'> = {
  // ── Universal styles — work with any format ───────────────────────
  artistic:      '*',
  character:     '*',
  illustration:  '*',

  // ── Styles from master-ecosystem-registry.ts ──────────────────────
  storytelling:  ['video', 'script', 'podcast', ...CELEBRATION_FORMATS],
  avatar:        ['video', 'webcast', 'presentation', ...CELEBRATION_FORMATS],
  animation:     ['video', 'ugc', ...CELEBRATION_FORMATS],
  interactive:   ['video', 'webcast', 'presentation'],
  marketing:     ['video', 'ugc', ...CELEBRATION_FORMATS],
  enterprise:    ['video', 'presentation', 'webcast'],
  entertainment: ['video', 'ugc', 'podcast', ...CELEBRATION_FORMATS],
  healthcare:    ['video', 'presentation', 'webcast'],
  presentation:  ['presentation', 'script'],
  infographic:   ['video', 'presentation'],
  data_visualization: ['video', 'presentation'],

  // ── Styles from extended-video-styles.ts ──────────────────────────
  animated:      ['video', 'ugc', ...CELEBRATION_FORMATS],
  educational:   ['video', 'presentation', 'webcast', 'podcast'],
  cyber:         ['video', 'presentation'],
  photorealistic: ['video', 'ugc', ...CELEBRATION_FORMATS],

  // ── Previously orphaned categories (format mappings) ─────────────
  '3d_vr_ar':    ['video', 'presentation', ...CELEBRATION_FORMATS],
  audio:         ['podcast', 'voice', 'tts', ...CELEBRATION_FORMATS],
  document:      ['script', 'presentation'],
  image:         '*',
  localization:  '*',
  repurposing:   ['video', 'podcast', 'ugc', ...CELEBRATION_FORMATS],
  text_based:    ['script', 'presentation'],
  training_ld:   ['video', 'presentation', 'webcast'],
  video:         '*',

  // ── Legacy category aliases ───────────────────────────────────────
  framework:     ['presentation', 'video', 'script'],
  media:         ['podcast', 'webcast', 'video'],
  demo:          ['video', 'webcast', 'presentation'],
  social:        ['video', 'ugc', ...CELEBRATION_FORMATS],
  motion:        ['video', ...CELEBRATION_FORMATS],
  education:     ['video', 'presentation', 'webcast', 'podcast'],
  gaming:        ['video', 'ugc'],
  lifestyle:     ['video', 'ugc', 'podcast', ...CELEBRATION_FORMATS],
  ecommerce:     ['video', 'ugc'],
  immersive:     ['video', ...CELEBRATION_FORMATS],
  seasonal:      ['video', 'ugc', ...CELEBRATION_FORMATS],
};

// ─── CEREMONY → STYLE CATEGORY MAPPING ───────────────────────────────────
// Maps ceremony categories (from ceremony-type-registry) to style categories
// that produce the best visual results for that type of celebration.

export const CEREMONY_TO_STYLE_CATEGORIES: Record<string, string[]> = {
  wedding:           ['artistic', 'illustration', 'storytelling', 'avatar', 'animation', 'animated',
                      'photorealistic', 'entertainment', 'marketing'],
  pre_post_wedding:  ['artistic', 'social', 'motion', 'animation', 'animated', 'photorealistic',
                      'marketing'],
  religious:         ['artistic', 'illustration', 'storytelling', 'avatar', 'animated'],
  life_milestone:    ['character', 'social', 'motion', 'illustration', 'animation', 'animated',
                      'avatar', 'entertainment', 'marketing'],
  festival:          ['motion', 'social', 'animation', 'animated', 'entertainment',
                      'marketing', 'character'],
  corporate_event:   ['presentation', 'enterprise', 'avatar', 'infographic', 'marketing'],
  sports:            ['motion', 'social', 'entertainment', 'animation', 'character'],
  inauguration:      ['presentation', 'enterprise', 'avatar', 'storytelling'],
  memorial:          ['storytelling', 'artistic', 'illustration', 'avatar', 'animated'],
};

/**
 * Get recommended style categories for a given ceremony category.
 * Falls back to a broad set if the ceremony category is not mapped.
 */
export function getStyleCategoriesForCeremony(ceremonyCategory: string | null): string[] {
  if (!ceremonyCategory) return [];
  return CEREMONY_TO_STYLE_CATEGORIES[ceremonyCategory] ?? ['artistic', 'illustration', 'storytelling', 'animation', 'animated', 'avatar', 'entertainment'];
}

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Check if a style category matches a given content category name.
 */
function styleMatchesCategory(styleCategory: string, contentCategoryName: string | null): boolean {
  if (!contentCategoryName) return false;
  const mapping = STYLE_TO_CATEGORIES[styleCategory];
  if (!mapping) return false;
  if (mapping === '*') return true;
  return mapping.includes(contentCategoryName);
}

/**
 * Check if a style category matches a given content format name.
 */
function styleMatchesFormat(styleCategory: string, contentFormatName: string | null): boolean {
  if (!contentFormatName) return false;
  const mapping = STYLE_TO_FORMATS[styleCategory];
  if (!mapping) return false;
  if (mapping === '*') return true;
  // Also match celebration formats to seasonal styles by prefix
  if (styleCategory === 'seasonal' && contentFormatName.startsWith('celebration_')) return true;
  return mapping.includes(contentFormatName);
}

/**
 * Score how well a style matches the user's current selection.
 * Higher = better match. 0 = no match at all.
 *
 * Scoring:
 *   +2  if style category matches content category
 *   +2  if style category matches content format
 *   +1  if style is universal (category='*')
 *   +1  if style is format-universal (format='*')
 */
export function scoreStyleMatch(
  styleCategory: string,
  contentCategoryName: string | null,
  contentFormatName: string | null,
): number {
  let score = 0;

  // Category match
  const catMapping = STYLE_TO_CATEGORIES[styleCategory];
  if (catMapping === '*') {
    score += 1; // universal baseline
  } else if (contentCategoryName && catMapping && (catMapping as string[]).includes(contentCategoryName)) {
    score += 2; // specific match = higher
  }

  // Format match
  const fmtMapping = STYLE_TO_FORMATS[styleCategory];
  if (fmtMapping === '*') {
    score += 1;
  } else if (contentFormatName) {
    if (fmtMapping && (fmtMapping as string[]).includes(contentFormatName)) {
      score += 2;
    } else if (styleCategory === 'seasonal' && contentFormatName.startsWith('celebration_')) {
      score += 2;
    }
  }

  return score;
}

export interface StyleMatchResult<T> {
  /** Styles with score >= 2 (strong match to category AND/OR format) */
  recommended: T[];
  /** Styles with score 1 (universal but not specifically matched) */
  compatible: T[];
  /** Styles with score 0 (no match — still selectable) */
  other: T[];
}

/**
 * Partition an array of visual styles into recommended / compatible / other
 * based on the user's selected category + format.
 *
 * @param styles - All visual styles (parent or sub)
 * @param contentCategoryName - Selected content category `.name` (e.g. 'healthcare')
 * @param contentFormatName - Selected content format `.name` (e.g. 'video')
 */
export function partitionStylesByMatch<T extends { category: string }>(
  styles: T[],
  contentCategoryName: string | null,
  contentFormatName: string | null,
): StyleMatchResult<T> {
  const recommended: T[] = [];
  const compatible: T[] = [];
  const other: T[] = [];

  // If no category or format selected, everything is "compatible"
  if (!contentCategoryName && !contentFormatName) {
    return { recommended: [], compatible: styles, other: [] };
  }

  for (const style of styles) {
    const score = scoreStyleMatch(style.category, contentCategoryName, contentFormatName);
    if (score >= 2) {
      recommended.push(style);
    } else if (score >= 1) {
      compatible.push(style);
    } else {
      other.push(style);
    }
  }

  return { recommended, compatible, other };
}

/**
 * Build a flat sorted options list with group headers for PortalDropdown.
 * Returns options in order: Recommended → Compatible → More Styles,
 * each sub-sorted by style.category then sort_order.
 */
export function buildStyledOptionsWithGroups<T extends { id: string; category: string; label: string; sort_order: number }>(
  styles: T[],
  contentCategoryName: string | null,
  contentFormatName: string | null,
  getSubCount: (styleId: string) => number,
  iconMapper: (icon: string | undefined) => string,
  getIcon: (style: T) => string | undefined,
): Array<{ value: string; label: string; icon?: string; description: string }> {
  const { recommended, compatible, other } = partitionStylesByMatch(styles, contentCategoryName, contentFormatName);

  const sortFn = (a: T, b: T) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.sort_order - b.sort_order;
  };

  const mapStyle = (s: T, tag: string) => {
    const subCount = getSubCount(s.id);
    const catLabel = s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : '';
    return {
      value: s.id,
      label: s.label + (subCount > 0 ? ` (${subCount})` : ''),
      icon: iconMapper(getIcon(s)),
      description: `${tag} · ${catLabel}${subCount > 0 ? ` · ${subCount} sub-styles` : ''}`,
    };
  };

  return [
    ...recommended.sort(sortFn).map(s => mapStyle(s, 'Recommended')),
    ...compatible.sort(sortFn).map(s => mapStyle(s, 'Compatible')),
    ...other.sort(sortFn).map(s => mapStyle(s, 'More')),
  ];
}
