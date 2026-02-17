/**
 * Regional Content Types & Categories Registry
 * 
 * Comprehensive content category demand, use cases, tone guidelines,
 * and length preferences by region for the Genie Suite ecosystem.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type DemandLevel = 1 | 2 | 3 | 4 | 5; // ★ rating

export type ContentCategory = 
  | 'corporate_training'
  | 'sales_marketing'
  | 'product_demos'
  | 'educational_elearning'
  | 'social_media_content'
  | 'internal_communications'
  | 'compliance_legal'
  | 'religious_cultural'
  | 'government_public'
  | 'healthcare';

export type ContentToneType = 'business' | 'marketing' | 'training';

export type ContentLengthType = 
  | 'email_subject'
  | 'email_body'
  | 'blog_post'
  | 'social_post'
  | 'video_script_1min'
  | 'presentation_slides'
  | 'product_description';

export interface ContentCategoryDemand {
  category: ContentCategory;
  displayName: string;
  demandByRegion: Record<string, DemandLevel>;
}

export interface RegionalUseCase {
  regionCode: string;
  regionName: string;
  topUseCases: [string, string, string]; // Top 3
  emerging: string;
}

export interface ContentToneGuideline {
  regionCode: string;
  regionName: string;
  businessTone: string;
  marketingTone: string;
  trainingTone: string;
  avoid: string;
}

export interface ContentLengthPreference {
  contentType: ContentLengthType;
  displayName: string;
  preferencesByRegion: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT CATEGORY DEMAND BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTENT_CATEGORY_DEMAND: ContentCategoryDemand[] = [
  {
    category: 'corporate_training',
    displayName: 'Corporate Training',
    demandByRegion: {
      'US_UK': 5, 'DE': 5, 'JP': 5, 'IN': 4, 'MENA': 4, 'AFRICA': 3, 'LATAM': 4
    }
  },
  {
    category: 'sales_marketing',
    displayName: 'Sales/Marketing',
    demandByRegion: {
      'US_UK': 5, 'DE': 4, 'JP': 4, 'IN': 5, 'MENA': 4, 'AFRICA': 5, 'LATAM': 5
    }
  },
  {
    category: 'product_demos',
    displayName: 'Product Demos',
    demandByRegion: {
      'US_UK': 5, 'DE': 5, 'JP': 5, 'IN': 4, 'MENA': 4, 'AFRICA': 3, 'LATAM': 4
    }
  },
  {
    category: 'educational_elearning',
    displayName: 'Educational/E-Learning',
    demandByRegion: {
      'US_UK': 4, 'DE': 4, 'JP': 4, 'IN': 5, 'MENA': 5, 'AFRICA': 5, 'LATAM': 5
    }
  },
  {
    category: 'social_media_content',
    displayName: 'Social Media Content',
    demandByRegion: {
      'US_UK': 5, 'DE': 3, 'JP': 4, 'IN': 5, 'MENA': 4, 'AFRICA': 5, 'LATAM': 5
    }
  },
  {
    category: 'internal_communications',
    displayName: 'Internal Communications',
    demandByRegion: {
      'US_UK': 4, 'DE': 5, 'JP': 5, 'IN': 3, 'MENA': 4, 'AFRICA': 3, 'LATAM': 3
    }
  },
  {
    category: 'compliance_legal',
    displayName: 'Compliance/Legal',
    demandByRegion: {
      'US_UK': 4, 'DE': 5, 'JP': 4, 'IN': 3, 'MENA': 4, 'AFRICA': 3, 'LATAM': 3
    }
  },
  {
    category: 'religious_cultural',
    displayName: 'Religious/Cultural',
    demandByRegion: {
      'US_UK': 1, 'DE': 1, 'JP': 2, 'IN': 5, 'MENA': 5, 'AFRICA': 4, 'LATAM': 3
    }
  },
  {
    category: 'government_public',
    displayName: 'Government/Public',
    demandByRegion: {
      'US_UK': 3, 'DE': 4, 'JP': 4, 'IN': 5, 'MENA': 5, 'AFRICA': 4, 'LATAM': 4
    }
  },
  {
    category: 'healthcare',
    displayName: 'Healthcare',
    demandByRegion: {
      'US_UK': 4, 'DE': 4, 'JP': 4, 'IN': 5, 'MENA': 4, 'AFRICA': 4, 'LATAM': 4
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// POPULAR USE CASES BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const REGIONAL_USE_CASES: RegionalUseCase[] = [
  {
    regionCode: 'US',
    regionName: 'United States',
    topUseCases: ['Sales enablement', 'Product marketing', 'Employee training'],
    emerging: 'AI assistants'
  },
  {
    regionCode: 'UK',
    regionName: 'United Kingdom',
    topUseCases: ['Corporate comms', 'Training compliance', 'Marketing content'],
    emerging: 'Personalization'
  },
  {
    regionCode: 'DE',
    regionName: 'Germany',
    topUseCases: ['Technical training', 'Product documentation', 'Compliance'],
    emerging: 'Process automation'
  },
  {
    regionCode: 'FR',
    regionName: 'France',
    topUseCases: ['Marketing creative', 'Brand content', 'Corporate comms'],
    emerging: 'Luxury marketing'
  },
  {
    regionCode: 'JP',
    regionName: 'Japan',
    topUseCases: ['Training manuals', 'Product demos', 'Corporate announcements'],
    emerging: 'Customer service'
  },
  {
    regionCode: 'KR',
    regionName: 'Korea',
    topUseCases: ['K-content marketing', 'E-commerce', 'Corporate training'],
    emerging: 'Influencer content'
  },
  {
    regionCode: 'CN',
    regionName: 'China',
    topUseCases: ['E-commerce/marketing', 'Corporate training', 'Sales content'],
    emerging: 'Live commerce'
  },
  {
    regionCode: 'IN',
    regionName: 'India',
    topUseCases: ['Education/edtech', 'Corporate training', 'Marketing'],
    emerging: 'Government services'
  },
  {
    regionCode: 'SA',
    regionName: 'Saudi Arabia',
    topUseCases: ['Government comms', 'Corporate training', 'Vision 2030 content'],
    emerging: 'Education'
  },
  {
    regionCode: 'AE',
    regionName: 'UAE',
    topUseCases: ['Tourism marketing', 'Corporate content', 'Real estate'],
    emerging: 'Events'
  },
  {
    regionCode: 'NG',
    regionName: 'Nigeria',
    topUseCases: ['SMB marketing', 'Education', 'Fintech/banking'],
    emerging: 'E-commerce'
  },
  {
    regionCode: 'KE',
    regionName: 'Kenya',
    topUseCases: ['Mobile banking', 'Education', 'Agriculture info'],
    emerging: 'SMB content'
  },
  {
    regionCode: 'BR',
    regionName: 'Brazil',
    topUseCases: ['Social marketing', 'E-commerce', 'Corporate training'],
    emerging: 'Fintech'
  },
  {
    regionCode: 'MX',
    regionName: 'Mexico',
    topUseCases: ['Marketing/advertising', 'Corporate training', 'Education'],
    emerging: 'Manufacturing'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT TONE BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTENT_TONE_GUIDELINES: ContentToneGuideline[] = [
  {
    regionCode: 'US',
    regionName: 'United States',
    businessTone: 'Direct, confident, benefit-focused',
    marketingTone: 'Bold, engaging, action-oriented',
    trainingTone: 'Interactive, engaging',
    avoid: 'Passive voice'
  },
  {
    regionCode: 'UK',
    regionName: 'United Kingdom',
    businessTone: 'Professional, understated, polite',
    marketingTone: 'Refined, clever, sophisticated',
    trainingTone: 'Structured, thorough',
    avoid: 'Overly casual'
  },
  {
    regionCode: 'DE',
    regionName: 'Germany',
    businessTone: 'Formal, precise, factual',
    marketingTone: 'Technical, quality-focused',
    trainingTone: 'Detailed, systematic',
    avoid: 'Vague claims'
  },
  {
    regionCode: 'FR',
    regionName: 'France',
    businessTone: 'Elegant, formal, refined',
    marketingTone: 'Artistic, sophisticated',
    trainingTone: 'Intellectual, thorough',
    avoid: 'Crude/direct'
  },
  {
    regionCode: 'JP',
    regionName: 'Japan',
    businessTone: 'Very polite (keigo), humble',
    marketingTone: 'Gentle, aspirational, subtle',
    trainingTone: 'Respectful, detailed',
    avoid: 'Direct criticism'
  },
  {
    regionCode: 'KR',
    regionName: 'Korea',
    businessTone: 'Respectful, professional',
    marketingTone: 'Modern, trendy, engaging',
    trainingTone: 'Structured, clear',
    avoid: 'Informal to seniors'
  },
  {
    regionCode: 'CN',
    regionName: 'China',
    businessTone: 'Formal, relationship-aware',
    marketingTone: 'Aspirational, prosperity',
    trainingTone: 'Comprehensive',
    avoid: 'Political topics'
  },
  {
    regionCode: 'IN',
    regionName: 'India',
    businessTone: 'Respectful, warm, detailed',
    marketingTone: 'Emotional, family values',
    trainingTone: 'Thorough, practical',
    avoid: 'Offensive to religion'
  },
  {
    regionCode: 'MENA',
    regionName: 'Middle East & North Africa',
    businessTone: 'Formal, respectful, hospitable',
    marketingTone: 'Premium, aspirational',
    trainingTone: 'Clear, respectful',
    avoid: 'Religious insensitivity'
  },
  {
    regionCode: 'LATAM',
    regionName: 'Latin America',
    businessTone: 'Warm, personal, relationship',
    marketingTone: 'Emotional, celebratory',
    trainingTone: 'Engaging, practical',
    avoid: 'Cold/distant'
  },
  {
    regionCode: 'AFRICA',
    regionName: 'Africa',
    businessTone: 'Respectful, clear, practical',
    marketingTone: 'Aspirational, empowering',
    trainingTone: 'Step-by-step, visual',
    avoid: 'Condescending'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT LENGTH PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTENT_LENGTH_PREFERENCES: ContentLengthPreference[] = [
  {
    contentType: 'email_subject',
    displayName: 'Email Subject',
    preferencesByRegion: {
      'US_UK': '40-50 chars',
      'DE': '50-60 chars',
      'JP': '30-40 chars',
      'MENA': '40-50 chars',
      'IN_AFRICA': '50-60 chars'
    }
  },
  {
    contentType: 'email_body',
    displayName: 'Email Body',
    preferencesByRegion: {
      'US_UK': 'Short, scannable',
      'DE': 'Detailed',
      'JP': 'Polite, formal',
      'MENA': 'Respectful',
      'IN_AFRICA': 'Clear, direct'
    }
  },
  {
    contentType: 'blog_post',
    displayName: 'Blog Post',
    preferencesByRegion: {
      'US_UK': '1500-2500 words',
      'DE': '2000-3000 words',
      'JP': '1500-2000 words',
      'MENA': '1500-2000 words',
      'IN_AFRICA': '1000-1500 words'
    }
  },
  {
    contentType: 'social_post',
    displayName: 'Social Post',
    preferencesByRegion: {
      'US_UK': '100-150 chars',
      'DE': '150-200 chars',
      'JP': '100-150 chars',
      'MENA': '150-200 chars',
      'IN_AFRICA': '100-150 chars'
    }
  },
  {
    contentType: 'video_script_1min',
    displayName: 'Video Script (1min)',
    preferencesByRegion: {
      'US_UK': '150 words',
      'DE': '130 words',
      'JP': '120 words',
      'MENA': '140 words',
      'IN_AFRICA': '150 words'
    }
  },
  {
    contentType: 'presentation_slides',
    displayName: 'Presentation Slides',
    preferencesByRegion: {
      'US_UK': '5-7 bullets max',
      'DE': '8-10 bullets',
      'JP': '6-8 bullets',
      'MENA': '6-8 bullets',
      'IN_AFRICA': '5-6 bullets'
    }
  },
  {
    contentType: 'product_description',
    displayName: 'Product Description',
    preferencesByRegion: {
      'US_UK': '150-200 words',
      'DE': '250-300 words',
      'JP': '200-250 words',
      'MENA': '200-250 words',
      'IN_AFRICA': '150-200 words'
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get demand levels for a specific content category across all regions
 */
export function getCategoryDemand(category: ContentCategory): ContentCategoryDemand | undefined {
  return CONTENT_CATEGORY_DEMAND.find(c => c.category === category);
}

/**
 * Get top categories for a specific region (sorted by demand)
 */
export function getTopCategoriesForRegion(regionCode: string, limit: number = 5): ContentCategoryDemand[] {
  return CONTENT_CATEGORY_DEMAND
    .filter(c => c.demandByRegion[regionCode] !== undefined)
    .sort((a, b) => (b.demandByRegion[regionCode] || 0) - (a.demandByRegion[regionCode] || 0))
    .slice(0, limit);
}

/**
 * Get use cases for a specific region
 */
export function getUseCasesForRegion(regionCode: string): RegionalUseCase | undefined {
  return REGIONAL_USE_CASES.find(u => u.regionCode === regionCode);
}

/**
 * Get tone guidelines for a specific region
 */
export function getToneGuidelinesForRegion(regionCode: string): ContentToneGuideline | undefined {
  // Check direct match first
  const direct = CONTENT_TONE_GUIDELINES.find(t => t.regionCode === regionCode);
  if (direct) return direct;
  
  // Fall back to region group mappings
  const regionMappings: Record<string, string> = {
    'SA': 'MENA',
    'AE': 'MENA',
    'EG': 'MENA',
    'BR': 'LATAM',
    'MX': 'LATAM',
    'NG': 'AFRICA',
    'KE': 'AFRICA',
    'ZA': 'AFRICA'
  };
  
  const mappedRegion = regionMappings[regionCode];
  if (mappedRegion) {
    return CONTENT_TONE_GUIDELINES.find(t => t.regionCode === mappedRegion);
  }
  
  return undefined;
}

/**
 * Get specific tone for region and type
 */
export function getToneForRegion(regionCode: string, toneType: ContentToneType): string {
  const guidelines = getToneGuidelinesForRegion(regionCode);
  if (!guidelines) return 'Professional and clear';
  
  switch (toneType) {
    case 'business': return guidelines.businessTone;
    case 'marketing': return guidelines.marketingTone;
    case 'training': return guidelines.trainingTone;
    default: return guidelines.businessTone;
  }
}

/**
 * Get content length preference for a specific type and region
 */
export function getContentLengthForRegion(
  contentType: ContentLengthType,
  regionCode: string
): string {
  const preference = CONTENT_LENGTH_PREFERENCES.find(p => p.contentType === contentType);
  if (!preference) return 'Standard length';
  
  // Check direct match
  if (preference.preferencesByRegion[regionCode]) {
    return preference.preferencesByRegion[regionCode];
  }
  
  // Region group mappings
  const regionToGroup: Record<string, string> = {
    'US': 'US_UK', 'UK': 'US_UK',
    'IN': 'IN_AFRICA', 'NG': 'IN_AFRICA', 'KE': 'IN_AFRICA', 'ZA': 'IN_AFRICA',
    'SA': 'MENA', 'AE': 'MENA', 'EG': 'MENA'
  };
  
  const group = regionToGroup[regionCode];
  if (group && preference.preferencesByRegion[group]) {
    return preference.preferencesByRegion[group];
  }
  
  // Default to US_UK standard
  return preference.preferencesByRegion['US_UK'] || 'Standard length';
}

/**
 * Build complete content configuration for a region
 */
export function buildContentConfigForRegion(regionCode: string): {
  topCategories: ContentCategoryDemand[];
  useCases: RegionalUseCase | undefined;
  toneGuidelines: ContentToneGuideline | undefined;
  lengthPreferences: Record<ContentLengthType, string>;
} {
  const lengthPreferences: Record<ContentLengthType, string> = {} as Record<ContentLengthType, string>;
  
  CONTENT_LENGTH_PREFERENCES.forEach(pref => {
    lengthPreferences[pref.contentType] = getContentLengthForRegion(pref.contentType, regionCode);
  });
  
  return {
    topCategories: getTopCategoriesForRegion(regionCode, 5),
    useCases: getUseCasesForRegion(regionCode),
    toneGuidelines: getToneGuidelinesForRegion(regionCode),
    lengthPreferences
  };
}

/**
 * Get all supported region codes
 */
export function getSupportedContentRegions(): string[] {
  const regionSet = new Set<string>();
  
  REGIONAL_USE_CASES.forEach(u => regionSet.add(u.regionCode));
  CONTENT_TONE_GUIDELINES.forEach(t => regionSet.add(t.regionCode));
  
  return Array.from(regionSet).sort();
}

/**
 * Check if category has high demand in region (4 or 5 stars)
 */
export function isHighDemandCategory(category: ContentCategory, regionCode: string): boolean {
  const categoryData = getCategoryDemand(category);
  if (!categoryData) return false;
  
  const demand = categoryData.demandByRegion[regionCode];
  return demand !== undefined && demand >= 4;
}

/**
 * Get recommended content types for a region based on demand
 */
export function getRecommendedContentTypes(regionCode: string): ContentCategory[] {
  return CONTENT_CATEGORY_DEMAND
    .filter(c => {
      const demand = c.demandByRegion[regionCode];
      return demand !== undefined && demand >= 4;
    })
    .map(c => c.category);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const RegionalContentTypesRegistry = {
  CONTENT_CATEGORY_DEMAND,
  REGIONAL_USE_CASES,
  CONTENT_TONE_GUIDELINES,
  CONTENT_LENGTH_PREFERENCES,
  getCategoryDemand,
  getTopCategoriesForRegion,
  getUseCasesForRegion,
  getToneGuidelinesForRegion,
  getToneForRegion,
  getContentLengthForRegion,
  buildContentConfigForRegion,
  getSupportedContentRegions,
  isHighDemandCategory,
  getRecommendedContentTypes
};

export default RegionalContentTypesRegistry;
