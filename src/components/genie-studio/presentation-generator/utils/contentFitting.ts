/**
 * Content Fitting Utilities
 * Smart content validation, auto-truncation, and responsive layout helpers
 * Addresses content overflow issues reported in reviews
 */

export interface ContentFitConfig {
  maxTitleLength: number;
  maxSubtitleLength: number;
  maxBulletLength: number;
  maxBulletsPerSlide: number;
  maxParagraphLength: number;
  maxSpeakerNotesLength: number;
  truncationSuffix: string;
}

export interface ContentFitResult {
  isValid: boolean;
  issues: ContentIssue[];
  suggestions: ContentSuggestion[];
  fittedContent?: FittedContent;
}

export interface ContentIssue {
  type: 'overflow' | 'empty' | 'too_long' | 'too_many_items' | 'formatting';
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  originalLength?: number;
  maxLength?: number;
}

export interface ContentSuggestion {
  field: string;
  action: 'truncate' | 'split' | 'summarize' | 'remove';
  description: string;
  autoFixable: boolean;
}

export interface FittedContent {
  title?: string;
  subtitle?: string;
  bullets?: string[];
  paragraphs?: string[];
  speakerNotes?: string;
  wasTruncated: boolean;
  truncatedFields: string[];
}

// Default configurations for different slide types
export const SLIDE_FIT_CONFIGS: Record<string, ContentFitConfig> = {
  title: {
    maxTitleLength: 60,
    maxSubtitleLength: 120,
    maxBulletLength: 0,
    maxBulletsPerSlide: 0,
    maxParagraphLength: 200,
    maxSpeakerNotesLength: 500,
    truncationSuffix: '...'
  },
  content: {
    maxTitleLength: 50,
    maxSubtitleLength: 80,
    maxBulletLength: 150,
    maxBulletsPerSlide: 6,
    maxParagraphLength: 300,
    maxSpeakerNotesLength: 500,
    truncationSuffix: '...'
  },
  section: {
    maxTitleLength: 40,
    maxSubtitleLength: 100,
    maxBulletLength: 0,
    maxBulletsPerSlide: 0,
    maxParagraphLength: 150,
    maxSpeakerNotesLength: 300,
    truncationSuffix: '...'
  },
  stats: {
    maxTitleLength: 50,
    maxSubtitleLength: 80,
    maxBulletLength: 80,
    maxBulletsPerSlide: 4,
    maxParagraphLength: 200,
    maxSpeakerNotesLength: 400,
    truncationSuffix: '...'
  },
  infographic: {
    maxTitleLength: 40,
    maxSubtitleLength: 60,
    maxBulletLength: 100,
    maxBulletsPerSlide: 5,
    maxParagraphLength: 200,
    maxSpeakerNotesLength: 400,
    truncationSuffix: '...'
  },
  default: {
    maxTitleLength: 50,
    maxSubtitleLength: 100,
    maxBulletLength: 120,
    maxBulletsPerSlide: 5,
    maxParagraphLength: 300,
    maxSpeakerNotesLength: 500,
    truncationSuffix: '...'
  }
};

/**
 * Smart truncation that preserves word boundaries
 */
export function smartTruncate(text: string, maxLength: number, suffix = '...'): string {
  if (!text || text.length <= maxLength) return text;
  
  const truncateAt = maxLength - suffix.length;
  let truncated = text.slice(0, truncateAt);
  
  // Find the last space to avoid cutting words
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > truncateAt * 0.7) { // Only use if we don't lose too much
    truncated = truncated.slice(0, lastSpace);
  }
  
  return truncated.trim() + suffix;
}

/**
 * Validate content against slide type configuration
 */
export function validateSlideContent(
  slideType: string,
  content: {
    title?: string;
    subtitle?: string;
    bullets?: Array<string | { text: string }>;
    paragraphs?: string[];
    speakerNotes?: string;
  },
  customConfig?: Partial<ContentFitConfig>
): ContentFitResult {
  const config = { 
    ...SLIDE_FIT_CONFIGS[slideType] || SLIDE_FIT_CONFIGS.default,
    ...customConfig 
  };
  
  const issues: ContentIssue[] = [];
  const suggestions: ContentSuggestion[] = [];
  
  // Validate title
  if (content.title) {
    if (content.title.length > config.maxTitleLength) {
      issues.push({
        type: 'too_long',
        field: 'title',
        message: `Title exceeds ${config.maxTitleLength} characters (${content.title.length})`,
        severity: 'warning',
        originalLength: content.title.length,
        maxLength: config.maxTitleLength
      });
      suggestions.push({
        field: 'title',
        action: 'truncate',
        description: 'Shorten title to prevent overflow',
        autoFixable: true
      });
    }
  }
  
  // Validate subtitle
  if (content.subtitle && content.subtitle.length > config.maxSubtitleLength) {
    issues.push({
      type: 'too_long',
      field: 'subtitle',
      message: `Subtitle exceeds ${config.maxSubtitleLength} characters (${content.subtitle.length})`,
      severity: 'warning',
      originalLength: content.subtitle.length,
      maxLength: config.maxSubtitleLength
    });
    suggestions.push({
      field: 'subtitle',
      action: 'truncate',
      description: 'Shorten subtitle',
      autoFixable: true
    });
  }
  
  // Validate bullets
  if (content.bullets && content.bullets.length > 0) {
    if (content.bullets.length > config.maxBulletsPerSlide) {
      issues.push({
        type: 'too_many_items',
        field: 'bullets',
        message: `Too many bullets (${content.bullets.length}). Max: ${config.maxBulletsPerSlide}`,
        severity: 'warning',
        originalLength: content.bullets.length,
        maxLength: config.maxBulletsPerSlide
      });
      suggestions.push({
        field: 'bullets',
        action: 'split',
        description: 'Split into multiple slides or consolidate',
        autoFixable: false
      });
    }
    
    content.bullets.forEach((bullet, idx) => {
      const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
      if (bulletText.length > config.maxBulletLength) {
        issues.push({
          type: 'too_long',
          field: `bullets[${idx}]`,
          message: `Bullet ${idx + 1} exceeds ${config.maxBulletLength} characters (${bulletText.length})`,
          severity: 'warning',
          originalLength: bulletText.length,
          maxLength: config.maxBulletLength
        });
        suggestions.push({
          field: `bullets[${idx}]`,
          action: 'summarize',
          description: `Summarize bullet ${idx + 1}`,
          autoFixable: true
        });
      }
    });
  }
  
  // Validate paragraphs
  if (content.paragraphs) {
    content.paragraphs.forEach((para, idx) => {
      if (para.length > config.maxParagraphLength) {
        issues.push({
          type: 'too_long',
          field: `paragraphs[${idx}]`,
          message: `Paragraph ${idx + 1} exceeds ${config.maxParagraphLength} characters`,
          severity: 'warning',
          originalLength: para.length,
          maxLength: config.maxParagraphLength
        });
        suggestions.push({
          field: `paragraphs[${idx}]`,
          action: 'split',
          description: `Split paragraph ${idx + 1}`,
          autoFixable: false
        });
      }
    });
  }
  
  // Validate speaker notes
  if (content.speakerNotes && content.speakerNotes.length > config.maxSpeakerNotesLength) {
    issues.push({
      type: 'too_long',
      field: 'speakerNotes',
      message: `Speaker notes exceed ${config.maxSpeakerNotesLength} characters`,
      severity: 'info',
      originalLength: content.speakerNotes.length,
      maxLength: config.maxSpeakerNotesLength
    });
    suggestions.push({
      field: 'speakerNotes',
      action: 'truncate',
      description: 'Truncate speaker notes',
      autoFixable: true
    });
  }
  
  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    suggestions
  };
}

/**
 * Auto-fit content to slide configuration
 */
export function autoFitContent(
  slideType: string,
  content: {
    title?: string;
    subtitle?: string;
    bullets?: Array<string | { text: string }>;
    paragraphs?: string[];
    speakerNotes?: string;
  },
  customConfig?: Partial<ContentFitConfig>
): FittedContent {
  const config = { 
    ...SLIDE_FIT_CONFIGS[slideType] || SLIDE_FIT_CONFIGS.default,
    ...customConfig 
  };
  
  const truncatedFields: string[] = [];
  let wasTruncated = false;
  
  // Fit title
  let fittedTitle = content.title;
  if (fittedTitle && fittedTitle.length > config.maxTitleLength) {
    fittedTitle = smartTruncate(fittedTitle, config.maxTitleLength, config.truncationSuffix);
    truncatedFields.push('title');
    wasTruncated = true;
  }
  
  // Fit subtitle
  let fittedSubtitle = content.subtitle;
  if (fittedSubtitle && fittedSubtitle.length > config.maxSubtitleLength) {
    fittedSubtitle = smartTruncate(fittedSubtitle, config.maxSubtitleLength, config.truncationSuffix);
    truncatedFields.push('subtitle');
    wasTruncated = true;
  }
  
  // Fit bullets
  let fittedBullets: string[] | undefined;
  if (content.bullets) {
    fittedBullets = content.bullets
      .slice(0, config.maxBulletsPerSlide)
      .map((bullet, idx) => {
        const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
        if (bulletText.length > config.maxBulletLength) {
          truncatedFields.push(`bullets[${idx}]`);
          wasTruncated = true;
          return smartTruncate(bulletText, config.maxBulletLength, config.truncationSuffix);
        }
        return bulletText;
      });
    
    if (content.bullets.length > config.maxBulletsPerSlide) {
      truncatedFields.push('bullets.count');
      wasTruncated = true;
    }
  }
  
  // Fit paragraphs (don't auto-truncate, just flag)
  const fittedParagraphs = content.paragraphs;
  
  // Fit speaker notes
  let fittedSpeakerNotes = content.speakerNotes;
  if (fittedSpeakerNotes && fittedSpeakerNotes.length > config.maxSpeakerNotesLength) {
    fittedSpeakerNotes = smartTruncate(fittedSpeakerNotes, config.maxSpeakerNotesLength, config.truncationSuffix);
    truncatedFields.push('speakerNotes');
    wasTruncated = true;
  }
  
  return {
    title: fittedTitle,
    subtitle: fittedSubtitle,
    bullets: fittedBullets,
    paragraphs: fittedParagraphs,
    speakerNotes: fittedSpeakerNotes,
    wasTruncated,
    truncatedFields
  };
}

/**
 * Calculate estimated text display height (for responsive layouts)
 */
export function estimateTextHeight(
  text: string,
  fontSize: number,
  containerWidth: number,
  lineHeight = 1.5
): number {
  // Approximate characters per line based on average character width
  const avgCharWidth = fontSize * 0.5;
  const charsPerLine = Math.floor(containerWidth / avgCharWidth);
  const lines = Math.ceil(text.length / charsPerLine);
  return lines * fontSize * lineHeight;
}

/**
 * Check if content fits in a given slide area
 */
export function checkContentFitsArea(
  content: {
    title?: string;
    subtitle?: string;
    bullets?: Array<string | { text: string }>;
  },
  areaHeight: number,
  options: {
    titleFontSize?: number;
    subtitleFontSize?: number;
    bulletFontSize?: number;
    containerWidth?: number;
    padding?: number;
  } = {}
): { fits: boolean; overflow: number; recommendations: string[] } {
  const {
    titleFontSize = 32,
    subtitleFontSize = 18,
    bulletFontSize = 16,
    containerWidth = 800,
    padding = 40
  } = options;
  
  const effectiveWidth = containerWidth - (padding * 2);
  let totalHeight = padding;
  const recommendations: string[] = [];
  
  // Title height
  if (content.title) {
    totalHeight += estimateTextHeight(content.title, titleFontSize, effectiveWidth);
    totalHeight += 16; // margin
  }
  
  // Subtitle height
  if (content.subtitle) {
    totalHeight += estimateTextHeight(content.subtitle, subtitleFontSize, effectiveWidth);
    totalHeight += 24; // margin
  }
  
  // Bullets height
  if (content.bullets) {
    content.bullets.forEach(bullet => {
      const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
      totalHeight += estimateTextHeight(bulletText, bulletFontSize, effectiveWidth - 24);
      totalHeight += 8; // bullet spacing
    });
  }
  
  totalHeight += padding; // bottom padding
  
  const fits = totalHeight <= areaHeight;
  const overflow = Math.max(0, totalHeight - areaHeight);
  
  if (!fits) {
    if (content.bullets && content.bullets.length > 4) {
      recommendations.push('Consider reducing bullets to 4 or fewer');
    }
    if (content.title && content.title.length > 40) {
      recommendations.push('Shorten the title');
    }
    recommendations.push('Use AI Enhance to summarize content');
  }
  
  return { fits, overflow, recommendations };
}

/**
 * Generate content warnings for the UI
 */
export function generateContentWarnings(
  slideType: string,
  content: {
    title?: string;
    subtitle?: string;
    bullets?: Array<string | { text: string }>;
    paragraphs?: string[];
    speakerNotes?: string;
  }
): { type: 'error' | 'warning' | 'info'; message: string; field: string }[] {
  const result = validateSlideContent(slideType, content);
  
  return result.issues.map(issue => ({
    type: issue.severity,
    message: issue.message,
    field: issue.field
  }));
}
