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
 * Content categories come from cast-content-seeds.ts:
 *   media, healthcare, education, government, oil_gas, travel, commercial,
 *   technology, celebrations
 *
 * Content formats come from cast-content-seeds.ts:
 *   podcast, webcast, video, presentation, script, tts, voice, ugc,
 *   + 14 celebration-specific formats
 */

// ─── STYLE → CONTENT CATEGORY MAPPING ──────────────────────────────────────

/** Which content categories each style category is recommended for.
 *  '*' = universal — recommended for ALL content categories. */
const STYLE_TO_CATEGORIES: Record<string, string[] | '*'> = {
  // Universal styles — work with any content category
  artistic:      '*',
  character:     '*',
  illustration:  '*',
  motion:        '*',
  social:        '*',

  // Industry-specific styles
  media:         ['media', 'commercial'],
  healthcare:    ['healthcare'],
  education:     ['education'],
  gaming:        ['media', 'technology'],
  lifestyle:     ['travel', 'commercial', 'media'],
  ecommerce:     ['commercial'],
  demo:          ['technology', 'commercial', 'education'],
  presentation:  ['education', 'healthcare', 'government', 'oil_gas', 'technology', 'commercial'],
  framework:     ['government', 'technology', 'commercial', 'education'],
  seasonal:      ['celebrations', 'commercial', 'media'],
  storytelling:  ['media', 'education', 'celebrations'],
  immersive:     ['technology', 'media', 'travel'],
};

// ─── STYLE → CONTENT FORMAT MAPPING ────────────────────────────────────────

/** Which content formats each style category is recommended for.
 *  '*' = universal — recommended for ALL formats. */
const STYLE_TO_FORMATS: Record<string, string[] | '*'> = {
  // Universal styles — work with any format
  artistic:      '*',
  character:     '*',
  illustration:  '*',

  // Format-specific styles
  presentation:  ['presentation'],
  framework:     ['presentation', 'video'],
  media:         ['podcast', 'webcast', 'video'],
  demo:          ['video', 'webcast'],
  social:        ['video', 'ugc'],
  motion:        ['video'],
  education:     ['video', 'presentation', 'webcast'],
  gaming:        ['video'],
  lifestyle:     ['video', 'ugc'],
  healthcare:    ['video', 'presentation'],
  ecommerce:     ['video', 'ugc'],
  storytelling:  ['video', 'script'],
  immersive:     ['video'],
  seasonal:      ['video', 'ugc',
    // All celebration video formats
    'celebration_invitation_video', 'celebration_save_the_date',
    'celebration_ceremony_recap_video', 'celebration_photo_montage_video',
    'celebration_social_clip', 'celebration_thank_you_video',
    'celebration_highlight_reel', 'celebration_announcement_video',
    'celebration_tribute_video', 'celebration_webcast_live',
    'celebration_digital_invitation',
  ],
};

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
