/**
 * REGIONAL PRESENTATION TEMPLATES REGISTRY
 * Comprehensive template specifications by region:
 * 1. Slide Layout Preferences
 * 2. Template Categories by Use Case
 * 3. Slide Dimensions & Formats
 * 4. Default Template Components
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type SlideDensity = 'low' | 'medium' | 'high' | 'medium-high' | 'high-clean';
export type AnimationLevel = 'none' | 'minimal' | 'subtle' | 'moderate' | 'dynamic' | 'engaging' | 'sophisticated';
export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16';

export interface RegionalSlidePreference {
  region: string;
  regionCode: string;
  layoutStyle: string;
  slideDensity: SlideDensity;
  densityPoints: string;
  animation: AnimationLevel;
  animationDescription: string;
  imageryStyle: string[];
  colorPalette: string[];
  typography: {
    headingStyle: string;
    bodyStyle: string;
    emphasis: string;
  };
}

export interface TemplateCategoryByRegion {
  templateType: string;
  templateId: string;
  usUkStyle: string;
  japanKoreaStyle: string;
  menaStyle: string;
  indiaAfricaStyle: string;
  slideCount: { min: number; max: number };
  keyFeatures: string[];
}

export interface RegionalSlideFormat {
  region: string;
  regionCode: string;
  preferredRatio: AspectRatio;
  alternativeRatios: AspectRatio[];
  fileFormats: string[];
  primaryFormat: string;
  notes: string;
  layoutDirection: 'ltr' | 'rtl';
  lowBandwidthOption: boolean;
}

export interface SlideComponent {
  componentId: string;
  componentName: string;
  description: string;
  regionalVariations: Record<string, string>;
  isRequired: boolean;
  defaultPosition: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE LAYOUT PREFERENCES BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const REGIONAL_SLIDE_PREFERENCES: RegionalSlidePreference[] = [
  {
    region: 'US Corporate',
    regionCode: 'US',
    layoutStyle: 'Modern grid, clean sections',
    slideDensity: 'medium',
    densityPoints: '5-7 points',
    animation: 'subtle',
    animationDescription: 'Subtle transitions',
    imageryStyle: ['Professional photos', 'Icons', 'Clean graphics'],
    colorPalette: ['Corporate blue', 'Professional grays', 'Accent colors'],
    typography: {
      headingStyle: 'Bold, sans-serif',
      bodyStyle: 'Clean, readable',
      emphasis: 'Color highlights'
    }
  },
  {
    region: 'US Startup',
    regionCode: 'US-STARTUP',
    layoutStyle: 'Bold, single-message per slide',
    slideDensity: 'low',
    densityPoints: '1-3 points',
    animation: 'dynamic',
    animationDescription: 'Dynamic, engaging',
    imageryStyle: ['Large images', 'Minimal text', 'Bold visuals'],
    colorPalette: ['Vibrant primary', 'High contrast', 'Modern gradients'],
    typography: {
      headingStyle: 'Extra bold, impact',
      bodyStyle: 'Minimal, large size',
      emphasis: 'Size contrast'
    }
  },
  {
    region: 'United Kingdom',
    regionCode: 'UK',
    layoutStyle: 'Traditional, structured',
    slideDensity: 'medium-high',
    densityPoints: '6-8 points',
    animation: 'minimal',
    animationDescription: 'Minimal',
    imageryStyle: ['Conservative', 'Professional', 'Understated'],
    colorPalette: ['Navy', 'Forest green', 'Burgundy', 'Classic'],
    typography: {
      headingStyle: 'Classic serif optional',
      bodyStyle: 'Professional, readable',
      emphasis: 'Subtle bold'
    }
  },
  {
    region: 'Germany',
    regionCode: 'DE',
    layoutStyle: 'Data-focused, precise',
    slideDensity: 'high',
    densityPoints: '8-10+ points (detailed)',
    animation: 'none',
    animationDescription: 'None/minimal',
    imageryStyle: ['Charts', 'Diagrams', 'Precision graphics', 'Technical'],
    colorPalette: ['Blue', 'Gray', 'Professional tones'],
    typography: {
      headingStyle: 'Clear, functional',
      bodyStyle: 'Detailed, precise',
      emphasis: 'Data highlighting'
    }
  },
  {
    region: 'France',
    regionCode: 'FR',
    layoutStyle: 'Elegant, artistic',
    slideDensity: 'medium',
    densityPoints: '4-6 points',
    animation: 'sophisticated',
    animationDescription: 'Subtle, sophisticated',
    imageryStyle: ['Stylish imagery', 'Whitespace', 'Artistic', 'Refined'],
    colorPalette: ['Sophisticated neutrals', 'Elegant accents', 'Refined'],
    typography: {
      headingStyle: 'Elegant serif',
      bodyStyle: 'Refined, cultured',
      emphasis: 'Tasteful contrast'
    }
  },
  {
    region: 'Japan',
    regionCode: 'JP',
    layoutStyle: 'Minimalist, organized',
    slideDensity: 'high-clean',
    densityPoints: 'High but clean',
    animation: 'subtle',
    animationDescription: 'Subtle',
    imageryStyle: ['Nature', 'Seasons', 'Precision', 'Zen aesthetics'],
    colorPalette: ['Natural tones', 'Subtle pastels', 'Clean whites'],
    typography: {
      headingStyle: 'Clean, respectful',
      bodyStyle: 'Organized, detailed',
      emphasis: 'Subtle color'
    }
  },
  {
    region: 'Korea',
    regionCode: 'KR',
    layoutStyle: 'Modern, K-style',
    slideDensity: 'medium',
    densityPoints: '5-7 points',
    animation: 'moderate',
    animationDescription: 'Smooth transitions',
    imageryStyle: ['Tech-forward', 'Trendy', 'K-style aesthetic'],
    colorPalette: ['Modern pastels', 'Tech blues', 'Trendy gradients'],
    typography: {
      headingStyle: 'Modern, trendy',
      bodyStyle: 'Clean, contemporary',
      emphasis: 'Design-forward'
    }
  },
  {
    region: 'China',
    regionCode: 'CN',
    layoutStyle: 'Information-dense, visual',
    slideDensity: 'high',
    densityPoints: '8-12 points',
    animation: 'dynamic',
    animationDescription: 'Dynamic OK',
    imageryStyle: ['Rich imagery', 'Prosperity symbols', 'Red/gold accents'],
    colorPalette: ['Auspicious red', 'Gold', 'Prosperity colors'],
    typography: {
      headingStyle: 'Bold, impactful',
      bodyStyle: 'Dense, informative',
      emphasis: 'Color and size'
    }
  },
  {
    region: 'India',
    regionCode: 'IN',
    layoutStyle: 'Colorful, detailed',
    slideDensity: 'high',
    densityPoints: '7-10 points',
    animation: 'moderate',
    animationDescription: 'Moderate',
    imageryStyle: ['Vibrant', 'Cultural elements OK', 'Diverse representation'],
    colorPalette: ['Vibrant colors', 'Cultural tones', 'Warm palette'],
    typography: {
      headingStyle: 'Bold, colorful',
      bodyStyle: 'Detailed, readable',
      emphasis: 'Color variety'
    }
  },
  {
    region: 'MENA',
    regionCode: 'SA',
    layoutStyle: 'Elegant, geometric',
    slideDensity: 'medium',
    densityPoints: '5-7 points',
    animation: 'subtle',
    animationDescription: 'Subtle',
    imageryStyle: ['Geometric patterns', 'Luxury', 'Islamic art inspiration'],
    colorPalette: ['Gold', 'Deep blue', 'Luxury tones', 'Desert inspired'],
    typography: {
      headingStyle: 'Elegant Arabic/Latin',
      bodyStyle: 'Formal, refined',
      emphasis: 'Gold accents'
    }
  },
  {
    region: 'Latin America',
    regionCode: 'MX',
    layoutStyle: 'Warm, expressive',
    slideDensity: 'medium',
    densityPoints: '5-7 points',
    animation: 'engaging',
    animationDescription: 'Engaging',
    imageryStyle: ['Colorful', 'Relatable imagery', 'Warm visuals'],
    colorPalette: ['Warm colors', 'Vibrant accents', 'Tropical tones'],
    typography: {
      headingStyle: 'Expressive, warm',
      bodyStyle: 'Friendly, readable',
      emphasis: 'Color warmth'
    }
  },
  {
    region: 'Africa',
    regionCode: 'NG',
    layoutStyle: 'Clear, high-contrast',
    slideDensity: 'medium',
    densityPoints: '5-7 points',
    animation: 'moderate',
    animationDescription: 'Moderate',
    imageryStyle: ['Bold', 'Local representation', 'High contrast'],
    colorPalette: ['Bold primary', 'Earth tones', 'Vibrant accents'],
    typography: {
      headingStyle: 'Bold, clear',
      bodyStyle: 'High contrast, readable',
      emphasis: 'Strong contrast'
    }
  },
  {
    region: 'Australia',
    regionCode: 'AU',
    layoutStyle: 'Casual professional, clean',
    slideDensity: 'medium',
    densityPoints: '5-7 points',
    animation: 'subtle',
    animationDescription: 'Subtle',
    imageryStyle: ['Natural', 'Outdoor', 'Relaxed professional'],
    colorPalette: ['Earth tones', 'Ocean blues', 'Natural greens'],
    typography: {
      headingStyle: 'Clean, approachable',
      bodyStyle: 'Readable, casual',
      emphasis: 'Subtle highlights'
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE CATEGORIES BY USE CASE
// ═══════════════════════════════════════════════════════════════════════════════

export const TEMPLATE_CATEGORIES_BY_USE_CASE: TemplateCategoryByRegion[] = [
  {
    templateType: 'Pitch Deck',
    templateId: 'pitch-deck',
    usUkStyle: '10-12 slides, bold headlines, investor focus',
    japanKoreaStyle: '15-20 slides, detailed, conservative',
    menaStyle: 'Luxury feel, relationship focus',
    indiaAfricaStyle: 'Colorful, story-driven',
    slideCount: { min: 10, max: 20 },
    keyFeatures: ['Problem', 'Solution', 'Market', 'Traction', 'Team', 'Financials', 'Ask']
  },
  {
    templateType: 'Sales Proposal',
    templateId: 'sales-proposal',
    usUkStyle: 'Benefits-focused, ROI prominent',
    japanKoreaStyle: 'Feature-detailed, specifications',
    menaStyle: 'Trust-building, partnership',
    indiaAfricaStyle: 'Value + relationship',
    slideCount: { min: 8, max: 15 },
    keyFeatures: ['Executive Summary', 'Solution', 'Benefits', 'Pricing', 'Timeline', 'Next Steps']
  },
  {
    templateType: 'Training',
    templateId: 'training',
    usUkStyle: 'Interactive, engaging, gamified',
    japanKoreaStyle: 'Structured, comprehensive',
    menaStyle: 'Respectful, formal',
    indiaAfricaStyle: 'Visual, step-by-step',
    slideCount: { min: 15, max: 50 },
    keyFeatures: ['Objectives', 'Content Modules', 'Activities', 'Assessments', 'Summary']
  },
  {
    templateType: 'Corporate Report',
    templateId: 'corporate-report',
    usUkStyle: 'Executive summary first, data viz',
    japanKoreaStyle: 'Detailed appendix, thorough',
    menaStyle: 'Professional, formal',
    indiaAfricaStyle: 'Clear hierarchy',
    slideCount: { min: 20, max: 40 },
    keyFeatures: ['Executive Summary', 'Highlights', 'Detailed Analysis', 'Appendix']
  },
  {
    templateType: 'Marketing',
    templateId: 'marketing',
    usUkStyle: 'Bold, creative, eye-catching',
    japanKoreaStyle: 'Clean, lifestyle-focused',
    menaStyle: 'Luxury, aspirational',
    indiaAfricaStyle: 'Vibrant, local flavor',
    slideCount: { min: 8, max: 20 },
    keyFeatures: ['Hero Visual', 'Value Proposition', 'Features', 'Social Proof', 'CTA']
  },
  {
    templateType: 'Product Launch',
    templateId: 'product-launch',
    usUkStyle: 'Hero imagery, benefit-led',
    japanKoreaStyle: 'Technical specs + lifestyle',
    menaStyle: 'Premium positioning',
    indiaAfricaStyle: 'Feature + affordability',
    slideCount: { min: 10, max: 25 },
    keyFeatures: ['Launch Announcement', 'Product Features', 'Benefits', 'Availability', 'CTA']
  },
  {
    templateType: 'Company Overview',
    templateId: 'company-overview',
    usUkStyle: 'Concise, vision-focused',
    japanKoreaStyle: 'History + achievements',
    menaStyle: 'Heritage + relationships',
    indiaAfricaStyle: 'Story + community impact',
    slideCount: { min: 10, max: 20 },
    keyFeatures: ['About Us', 'Mission/Vision', 'Team', 'Achievements', 'Contact']
  },
  {
    templateType: 'Case Study',
    templateId: 'case-study',
    usUkStyle: 'Results-focused, metrics prominent',
    japanKoreaStyle: 'Detailed process + learnings',
    menaStyle: 'Partnership story',
    indiaAfricaStyle: 'Challenge + impact',
    slideCount: { min: 8, max: 15 },
    keyFeatures: ['Client', 'Challenge', 'Solution', 'Results', 'Testimonial']
  },
  {
    templateType: 'Quarterly Review',
    templateId: 'quarterly-review',
    usUkStyle: 'KPI dashboard, key metrics',
    japanKoreaStyle: 'Comprehensive analysis',
    menaStyle: 'Achievements + outlook',
    indiaAfricaStyle: 'Progress + next steps',
    slideCount: { min: 15, max: 30 },
    keyFeatures: ['Summary', 'Performance', 'Highlights', 'Challenges', 'Next Quarter']
  },
  {
    templateType: 'Workshop/Webinar',
    templateId: 'workshop',
    usUkStyle: 'Interactive, Q&A integrated',
    japanKoreaStyle: 'Structured, detailed handouts',
    menaStyle: 'Collaborative, discussion-focused',
    indiaAfricaStyle: 'Practical, hands-on',
    slideCount: { min: 20, max: 40 },
    keyFeatures: ['Agenda', 'Learning Modules', 'Exercises', 'Q&A', 'Resources']
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE DIMENSIONS & FORMATS BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const REGIONAL_SLIDE_FORMATS: RegionalSlideFormat[] = [
  {
    region: 'US/UK/EU',
    regionCode: 'US',
    preferredRatio: '16:9',
    alternativeRatios: ['4:3'],
    fileFormats: ['PPTX', 'PDF', 'Google Slides'],
    primaryFormat: 'PPTX',
    notes: 'Widescreen standard',
    layoutDirection: 'ltr',
    lowBandwidthOption: false
  },
  {
    region: 'Japan',
    regionCode: 'JP',
    preferredRatio: '16:9',
    alternativeRatios: ['4:3'],
    fileFormats: ['PPTX', 'PDF', 'Keynote'],
    primaryFormat: 'PPTX',
    notes: '4:3 still common in traditional companies',
    layoutDirection: 'ltr',
    lowBandwidthOption: false
  },
  {
    region: 'Korea',
    regionCode: 'KR',
    preferredRatio: '16:9',
    alternativeRatios: [],
    fileFormats: ['PPTX', 'PDF', 'Hancom Office'],
    primaryFormat: 'PPTX',
    notes: 'Modern widescreen preferred',
    layoutDirection: 'ltr',
    lowBandwidthOption: false
  },
  {
    region: 'China',
    regionCode: 'CN',
    preferredRatio: '16:9',
    alternativeRatios: ['4:3'],
    fileFormats: ['PPTX', 'PDF', 'WPS Office'],
    primaryFormat: 'PPTX',
    notes: 'WPS format support recommended',
    layoutDirection: 'ltr',
    lowBandwidthOption: false
  },
  {
    region: 'India',
    regionCode: 'IN',
    preferredRatio: '16:9',
    alternativeRatios: [],
    fileFormats: ['PPTX', 'PDF', 'Google Slides'],
    primaryFormat: 'Google Slides',
    notes: 'Google Slides popular',
    layoutDirection: 'ltr',
    lowBandwidthOption: true
  },
  {
    region: 'MENA',
    regionCode: 'SA',
    preferredRatio: '16:9',
    alternativeRatios: [],
    fileFormats: ['PPTX', 'PDF'],
    primaryFormat: 'PPTX',
    notes: 'RTL layout option needed',
    layoutDirection: 'rtl',
    lowBandwidthOption: false
  },
  {
    region: 'Africa',
    regionCode: 'NG',
    preferredRatio: '16:9',
    alternativeRatios: [],
    fileFormats: ['PPTX', 'PDF'],
    primaryFormat: 'PDF',
    notes: 'Low-bandwidth PDF option important',
    layoutDirection: 'ltr',
    lowBandwidthOption: true
  },
  {
    region: 'Latin America',
    regionCode: 'MX',
    preferredRatio: '16:9',
    alternativeRatios: [],
    fileFormats: ['PPTX', 'PDF', 'Google Slides'],
    primaryFormat: 'PPTX',
    notes: 'Google Slides gaining popularity',
    layoutDirection: 'ltr',
    lowBandwidthOption: false
  },
  {
    region: 'Australia/NZ',
    regionCode: 'AU',
    preferredRatio: '16:9',
    alternativeRatios: [],
    fileFormats: ['PPTX', 'PDF', 'Keynote', 'Google Slides'],
    primaryFormat: 'PPTX',
    notes: 'Keynote popular in creative industries',
    layoutDirection: 'ltr',
    lowBandwidthOption: false
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT TEMPLATE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_SLIDE_COMPONENTS: SlideComponent[] = [
  {
    componentId: 'title-slide',
    componentName: 'Title Slide',
    description: 'Company logo, title, subtitle, date',
    regionalVariations: {
      'MENA': 'RTL layout',
      'JP': 'Minimal, zen-inspired',
      'CN': 'Prosperity elements optional',
      'US': 'Bold, direct'
    },
    isRequired: true,
    defaultPosition: 1
  },
  {
    componentId: 'agenda',
    componentName: 'Agenda',
    description: 'Overview of presentation flow',
    regionalVariations: {
      'DE': 'Detailed, comprehensive',
      'US': 'Brief, high-level',
      'JP': 'Thorough, ordered',
      'UK': 'Structured, professional'
    },
    isRequired: true,
    defaultPosition: 2
  },
  {
    componentId: 'section-divider',
    componentName: 'Section Divider',
    description: 'Visual break between sections',
    regionalVariations: {
      'JP': 'Nature imagery, seasonal',
      'MENA': 'Geometric patterns',
      'FR': 'Artistic, elegant',
      'DE': 'Functional, numbered'
    },
    isRequired: false,
    defaultPosition: 0
  },
  {
    componentId: 'content-slide',
    componentName: 'Content Slide',
    description: '1-2 column layouts',
    regionalVariations: {
      'MENA': 'RTL mirrored',
      'CN': 'Dense content OK',
      'JP': 'High-density but organized',
      'US-STARTUP': 'Single message focus'
    },
    isRequired: true,
    defaultPosition: 0
  },
  {
    componentId: 'chart-slide',
    componentName: 'Chart Slide',
    description: 'Data visualization',
    regionalVariations: {
      'DE': 'Detailed, precise data',
      'US': 'Simplified, key insights',
      'JP': 'Thorough, accurate',
      'IN': 'Colorful, annotated'
    },
    isRequired: false,
    defaultPosition: 0
  },
  {
    componentId: 'image-full',
    componentName: 'Image Full',
    description: 'Full-bleed imagery with text overlay',
    regionalVariations: {
      'ALL': 'Region-appropriate imagery',
      'MENA': 'Cultural sensitivity',
      'JP': 'Nature, zen aesthetic',
      'NG': 'Local representation'
    },
    isRequired: false,
    defaultPosition: 0
  },
  {
    componentId: 'quote-slide',
    componentName: 'Quote Slide',
    description: 'Testimonial or key message',
    regionalVariations: {
      'JP': 'Subtle, respectful',
      'MX': 'Bold, expressive',
      'US': 'Prominent, impactful',
      'UK': 'Understated, credible'
    },
    isRequired: false,
    defaultPosition: 0
  },
  {
    componentId: 'team-slide',
    componentName: 'Team Slide',
    description: 'Team member introductions',
    regionalVariations: {
      'ALL': 'Culturally appropriate photos',
      'JP': 'Hierarchical order',
      'US': 'Diverse representation',
      'MENA': 'Gender considerations'
    },
    isRequired: false,
    defaultPosition: 0
  },
  {
    componentId: 'timeline',
    componentName: 'Timeline',
    description: 'Project or historical timeline',
    regionalVariations: {
      'MENA': 'RTL direction',
      'ALL': 'LTR default',
      'DE': 'Detailed milestones',
      'US': 'High-level phases'
    },
    isRequired: false,
    defaultPosition: 0
  },
  {
    componentId: 'comparison',
    componentName: 'Comparison',
    description: 'Before/after, A vs B',
    regionalVariations: {
      'ALL': 'Universal format',
      'DE': 'Detailed criteria',
      'JP': 'Thorough analysis',
      'US': 'Quick comparison'
    },
    isRequired: false,
    defaultPosition: 0
  },
  {
    componentId: 'pricing',
    componentName: 'Pricing',
    description: 'Pricing tiers or options',
    regionalVariations: {
      'ALL': 'Regional currency',
      'IN': 'PPP adjusted',
      'NG': 'Local pricing',
      'MENA': 'Premium positioning'
    },
    isRequired: false,
    defaultPosition: 0
  },
  {
    componentId: 'cta-close',
    componentName: 'CTA/Close',
    description: 'Call to action, contact info',
    regionalVariations: {
      'MENA': 'WhatsApp prominent',
      'IN': 'Multiple channels',
      'US': 'Direct CTA',
      'JP': 'Humble, respectful close'
    },
    isRequired: true,
    defaultPosition: -1
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get slide preferences for a specific region
 */
export function getSlidePreferencesForRegion(regionCode: string): RegionalSlidePreference | undefined {
  return REGIONAL_SLIDE_PREFERENCES.find(p => p.regionCode === regionCode);
}

/**
 * Get template style for a specific use case and region
 */
export function getTemplateStyleForRegion(
  templateId: string,
  regionCode: string
): { style: string; slideCount: { min: number; max: number } } | undefined {
  const template = TEMPLATE_CATEGORIES_BY_USE_CASE.find(t => t.templateId === templateId);
  if (!template) return undefined;

  let style = template.usUkStyle;
  if (['JP', 'KR'].includes(regionCode)) {
    style = template.japanKoreaStyle;
  } else if (['SA', 'AE', 'EG'].includes(regionCode)) {
    style = template.menaStyle;
  } else if (['IN', 'NG', 'KE', 'GH'].includes(regionCode)) {
    style = template.indiaAfricaStyle;
  }

  return { style, slideCount: template.slideCount };
}

/**
 * Get slide format for a specific region
 */
export function getSlideFormatForRegion(regionCode: string): RegionalSlideFormat | undefined {
  return REGIONAL_SLIDE_FORMATS.find(f => f.regionCode === regionCode) || 
         REGIONAL_SLIDE_FORMATS.find(f => f.regionCode === 'US'); // Default to US
}

/**
 * Get component variations for a region
 */
export function getComponentVariations(componentId: string, regionCode: string): string {
  const component = DEFAULT_SLIDE_COMPONENTS.find(c => c.componentId === componentId);
  if (!component) return '';
  
  return component.regionalVariations[regionCode] || 
         component.regionalVariations['ALL'] || 
         component.description;
}

/**
 * Get required components for a template
 */
export function getRequiredComponents(): SlideComponent[] {
  return DEFAULT_SLIDE_COMPONENTS.filter(c => c.isRequired);
}

/**
 * Get all components ordered by position
 */
export function getOrderedComponents(): SlideComponent[] {
  return [...DEFAULT_SLIDE_COMPONENTS].sort((a, b) => {
    if (a.defaultPosition === -1) return 1;
    if (b.defaultPosition === -1) return -1;
    return a.defaultPosition - b.defaultPosition;
  });
}

/**
 * Build template configuration for region
 */
export function buildTemplateConfigForRegion(
  templateId: string,
  regionCode: string
): {
  preferences: RegionalSlidePreference | undefined;
  style: { style: string; slideCount: { min: number; max: number } } | undefined;
  format: RegionalSlideFormat | undefined;
  components: SlideComponent[];
} {
  return {
    preferences: getSlidePreferencesForRegion(regionCode),
    style: getTemplateStyleForRegion(templateId, regionCode),
    format: getSlideFormatForRegion(regionCode),
    components: getOrderedComponents()
  };
}

/**
 * Get template recommendations for region
 */
export function getTemplateRecommendationsForRegion(
  regionCode: string
): TemplateCategoryByRegion[] {
  return TEMPLATE_CATEGORIES_BY_USE_CASE;
}

// Export main registry object
export const RegionalPresentationTemplatesRegistry = {
  slidePreferences: REGIONAL_SLIDE_PREFERENCES,
  templateCategories: TEMPLATE_CATEGORIES_BY_USE_CASE,
  slideFormats: REGIONAL_SLIDE_FORMATS,
  components: DEFAULT_SLIDE_COMPONENTS,
  getPreferences: getSlidePreferencesForRegion,
  getStyle: getTemplateStyleForRegion,
  getFormat: getSlideFormatForRegion,
  getVariation: getComponentVariations,
  getRequired: getRequiredComponents,
  getOrdered: getOrderedComponents,
  buildConfig: buildTemplateConfigForRegion,
  getRecommendations: getTemplateRecommendationsForRegion
};

export default RegionalPresentationTemplatesRegistry;
