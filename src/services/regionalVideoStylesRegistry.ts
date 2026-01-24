/**
 * Regional Video Styles & Formats Registry
 * 
 * Comprehensive registry for video aesthetic preferences, duration standards,
 * format specifications, and content preferences by region.
 * 
 * Used across: Genie Vibe, Deck (video export), Arc (publishing)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type VideoPacing = 'slow' | 'calm' | 'measured' | 'medium' | 'medium-fast' | 'fast' | 'dynamic' | 'energetic';

export type MusicStyle = 
  | 'corporate-ambient'
  | 'uplifting'
  | 'upbeat-indie'
  | 'electronic'
  | 'sophisticated'
  | 'orchestral'
  | 'minimal'
  | 'functional'
  | 'french-touch'
  | 'ambient'
  | 'nature-sounds'
  | 'k-pop'
  | 'modern'
  | 'inspiring'
  | 'bollywood'
  | 'oud-arabic'
  | 'brazilian-beats'
  | 'afrobeats'
  | 'african-rhythms';

export type MotionGraphicsStyle = 
  | 'modern-geometric'
  | 'sleek'
  | 'bold-playful'
  | 'trendy'
  | 'elegant-minimal'
  | 'clean-lines'
  | 'engineering'
  | 'artistic-refined'
  | 'subtle-precise'
  | 'delicate'
  | 'colorful-dynamic'
  | 'prosperity-themes'
  | 'vibrant-celebratory'
  | 'geometric-islamic'
  | 'bold-colors';

export interface VideoAestheticPreference {
  regionCode: string;
  regionName: string;
  variant?: string; // e.g., 'Corporate' vs 'Startup' for US
  visualStyle: string;
  pacing: VideoPacing;
  musicStyle: MusicStyle[];
  motionGraphics: MotionGraphicsStyle[];
  colorPalette: 'neutral' | 'warm' | 'cool' | 'vibrant' | 'luxury' | 'natural';
  productionQuality: 'standard' | 'high' | 'premium' | 'ultra';
}

export interface VideoDurationPreference {
  regionGroup: string;
  socialShort: string;
  explainer: string;
  productDemo: string;
  trainingModule: string;
  corporateVideo: string;
  webinarClip: string;
}

export interface VideoFormatSpec {
  platform: string;
  resolution: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  format: string;
  maxFileSize?: string;
  notes: string;
}

export interface RegionalVideoContentPreference {
  regionCode: string;
  presenterStyle: string[];
  brollPreferences: string[];
  ctaStyle: string;
  testimonialFormat: 'formal' | 'casual' | 'storytelling' | 'data-driven';
  closingStyle: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO AESTHETIC PREFERENCES BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const VIDEO_AESTHETIC_PREFERENCES: Record<string, VideoAestheticPreference> = {
  'US_CORPORATE': {
    regionCode: 'US',
    regionName: 'United States',
    variant: 'Corporate',
    visualStyle: 'Clean, professional, diverse casting',
    pacing: 'medium-fast',
    musicStyle: ['corporate-ambient', 'uplifting'],
    motionGraphics: ['modern-geometric', 'sleek'],
    colorPalette: 'neutral',
    productionQuality: 'high',
  },
  'US_STARTUP': {
    regionCode: 'US',
    regionName: 'United States',
    variant: 'Startup',
    visualStyle: 'Dynamic, authentic, casual',
    pacing: 'energetic',
    musicStyle: ['upbeat-indie', 'electronic'],
    motionGraphics: ['bold-playful', 'trendy'],
    colorPalette: 'vibrant',
    productionQuality: 'high',
  },
  'UK': {
    regionCode: 'UK',
    regionName: 'United Kingdom',
    visualStyle: 'Polished, understated, classic',
    pacing: 'measured',
    musicStyle: ['sophisticated', 'orchestral'],
    motionGraphics: ['elegant-minimal'],
    colorPalette: 'neutral',
    productionQuality: 'premium',
  },
  'DE': {
    regionCode: 'DE',
    regionName: 'Germany',
    visualStyle: 'Precise, technical, quality-focused',
    pacing: 'measured',
    musicStyle: ['minimal', 'functional'],
    motionGraphics: ['clean-lines', 'engineering'],
    colorPalette: 'cool',
    productionQuality: 'ultra',
  },
  'FR': {
    regionCode: 'FR',
    regionName: 'France',
    visualStyle: 'Artistic, cinematic, chic',
    pacing: 'medium',
    musicStyle: ['sophisticated', 'french-touch'],
    motionGraphics: ['artistic-refined'],
    colorPalette: 'neutral',
    productionQuality: 'premium',
  },
  'JP': {
    regionCode: 'JP',
    regionName: 'Japan',
    visualStyle: 'Minimal, clean, seasonal themes',
    pacing: 'calm',
    musicStyle: ['ambient', 'nature-sounds'],
    motionGraphics: ['subtle-precise', 'delicate'],
    colorPalette: 'natural',
    productionQuality: 'ultra',
  },
  'KR': {
    regionCode: 'KR',
    regionName: 'South Korea',
    visualStyle: 'High production, K-style, trendy',
    pacing: 'dynamic',
    musicStyle: ['k-pop', 'modern'],
    motionGraphics: ['sleek', 'colorful-dynamic'],
    colorPalette: 'vibrant',
    productionQuality: 'ultra',
  },
  'CN': {
    regionCode: 'CN',
    regionName: 'China',
    visualStyle: 'Vibrant, aspirational, tech-forward',
    pacing: 'fast',
    musicStyle: ['modern', 'inspiring'],
    motionGraphics: ['colorful-dynamic', 'prosperity-themes'],
    colorPalette: 'warm',
    productionQuality: 'high',
  },
  'IN': {
    regionCode: 'IN',
    regionName: 'India',
    visualStyle: 'Colorful, emotional, storytelling',
    pacing: 'medium-fast',
    musicStyle: ['bollywood', 'uplifting'],
    motionGraphics: ['vibrant-celebratory'],
    colorPalette: 'vibrant',
    productionQuality: 'high',
  },
  'SA': {
    regionCode: 'SA',
    regionName: 'Saudi Arabia',
    visualStyle: 'Elegant, premium, respectful',
    pacing: 'medium',
    musicStyle: ['oud-arabic'],
    motionGraphics: ['geometric-islamic'],
    colorPalette: 'luxury',
    productionQuality: 'premium',
  },
  'AE': {
    regionCode: 'AE',
    regionName: 'United Arab Emirates',
    visualStyle: 'Luxurious, modern, international',
    pacing: 'medium',
    musicStyle: ['oud-arabic', 'modern'],
    motionGraphics: ['geometric-islamic', 'sleek'],
    colorPalette: 'luxury',
    productionQuality: 'ultra',
  },
  'BR': {
    regionCode: 'BR',
    regionName: 'Brazil',
    visualStyle: 'Vibrant, diverse, festive energy',
    pacing: 'fast',
    musicStyle: ['brazilian-beats', 'uplifting'],
    motionGraphics: ['colorful-dynamic'],
    colorPalette: 'vibrant',
    productionQuality: 'high',
  },
  'NG': {
    regionCode: 'NG',
    regionName: 'Nigeria',
    visualStyle: 'Bold, energetic, entrepreneurial',
    pacing: 'fast',
    musicStyle: ['afrobeats', 'inspiring'],
    motionGraphics: ['bold-colors', 'colorful-dynamic'],
    colorPalette: 'vibrant',
    productionQuality: 'high',
  },
  'KE': {
    regionCode: 'KE',
    regionName: 'Kenya',
    visualStyle: 'Natural, authentic, progressive',
    pacing: 'medium',
    musicStyle: ['african-rhythms', 'modern'],
    motionGraphics: ['bold-colors'],
    colorPalette: 'natural',
    productionQuality: 'standard',
  },
  'ZA': {
    regionCode: 'ZA',
    regionName: 'South Africa',
    visualStyle: 'Diverse, modern, aspirational',
    pacing: 'medium-fast',
    musicStyle: ['african-rhythms', 'modern'],
    motionGraphics: ['bold-colors', 'modern-geometric'],
    colorPalette: 'vibrant',
    productionQuality: 'high',
  },
  'MX': {
    regionCode: 'MX',
    regionName: 'Mexico',
    visualStyle: 'Warm, colorful, family-oriented',
    pacing: 'medium-fast',
    musicStyle: ['uplifting', 'inspiring'],
    motionGraphics: ['colorful-dynamic', 'bold-playful'],
    colorPalette: 'warm',
    productionQuality: 'high',
  },
  'AU': {
    regionCode: 'AU',
    regionName: 'Australia',
    visualStyle: 'Casual, authentic, outdoor-focused',
    pacing: 'medium-fast',
    musicStyle: ['upbeat-indie', 'modern'],
    motionGraphics: ['modern-geometric', 'bold-playful'],
    colorPalette: 'natural',
    productionQuality: 'high',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO DURATION PREFERENCES BY REGION GROUP
// ═══════════════════════════════════════════════════════════════════════════════

export const VIDEO_DURATION_PREFERENCES: Record<string, VideoDurationPreference> = {
  'US_UK': {
    regionGroup: 'US/UK/EU',
    socialShort: '15-30s',
    explainer: '60-90s',
    productDemo: '2-3 min',
    trainingModule: '5-10 min',
    corporateVideo: '2-4 min',
    webinarClip: '3-5 min',
  },
  'JAPAN_KOREA': {
    regionGroup: 'Japan/Korea',
    socialShort: '15-60s',
    explainer: '90-120s',
    productDemo: '3-5 min',
    trainingModule: '10-15 min',
    corporateVideo: '5-8 min',
    webinarClip: '5-10 min',
  },
  'MENA': {
    regionGroup: 'MENA',
    socialShort: '30-60s',
    explainer: '90-120s',
    productDemo: '2-4 min',
    trainingModule: '5-10 min',
    corporateVideo: '3-5 min',
    webinarClip: '5-8 min',
  },
  'INDIA': {
    regionGroup: 'India',
    socialShort: '30-60s',
    explainer: '90-180s',
    productDemo: '3-5 min',
    trainingModule: '10-15 min',
    corporateVideo: '4-6 min',
    webinarClip: '5-10 min',
  },
  'AFRICA': {
    regionGroup: 'Africa',
    socialShort: '30-60s',
    explainer: '60-90s',
    productDemo: '2-3 min',
    trainingModule: '5-8 min',
    corporateVideo: '3-5 min',
    webinarClip: '3-5 min',
  },
  'LATAM': {
    regionGroup: 'Latin America',
    socialShort: '30-60s',
    explainer: '60-120s',
    productDemo: '2-4 min',
    trainingModule: '8-12 min',
    corporateVideo: '3-5 min',
    webinarClip: '4-7 min',
  },
  'CHINA': {
    regionGroup: 'China',
    socialShort: '15-60s',
    explainer: '60-120s',
    productDemo: '2-4 min',
    trainingModule: '8-15 min',
    corporateVideo: '3-6 min',
    webinarClip: '5-10 min',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO FORMAT SPECIFICATIONS BY PLATFORM
// ═══════════════════════════════════════════════════════════════════════════════

export const VIDEO_FORMAT_SPECIFICATIONS: VideoFormatSpec[] = [
  {
    platform: 'youtube',
    resolution: '1080p/4K',
    aspectRatio: '16:9',
    format: 'MP4 (H.264)',
    notes: 'Universal standard',
  },
  {
    platform: 'tiktok',
    resolution: '1080x1920',
    aspectRatio: '9:16',
    format: 'MP4 (H.264)',
    notes: 'Mobile-first vertical',
  },
  {
    platform: 'instagram_reels',
    resolution: '1080x1920',
    aspectRatio: '9:16',
    format: 'MP4 (H.264)',
    notes: 'Vertical format',
  },
  {
    platform: 'instagram_feed',
    resolution: '1080x1080',
    aspectRatio: '1:1',
    format: 'MP4',
    notes: 'Square default',
  },
  {
    platform: 'instagram_stories',
    resolution: '1080x1920',
    aspectRatio: '9:16',
    format: 'MP4',
    notes: 'Vertical',
  },
  {
    platform: 'linkedin',
    resolution: '1080p',
    aspectRatio: '16:9',
    format: 'MP4',
    notes: 'Square (1:1) also performs well',
  },
  {
    platform: 'twitter',
    resolution: '720p-1080p',
    aspectRatio: '16:9',
    format: 'MP4',
    notes: 'Shorter preferred',
  },
  {
    platform: 'wechat',
    resolution: '720p',
    aspectRatio: '16:9',
    format: 'MP4',
    notes: 'Compressed for mobile, China-specific',
  },
  {
    platform: 'whatsapp_status',
    resolution: '720p',
    aspectRatio: '9:16',
    format: 'MP4',
    maxFileSize: '16MB',
    notes: 'File size limit important',
  },
  {
    platform: 'facebook',
    resolution: '1080p',
    aspectRatio: '16:9',
    format: 'MP4 (H.264)',
    notes: 'Square and vertical also supported',
  },
  {
    platform: 'vimeo',
    resolution: '4K',
    aspectRatio: '16:9',
    format: 'MP4 (H.264/H.265)',
    notes: 'Professional/premium hosting',
  },
  {
    platform: 'bilibili',
    resolution: '1080p/4K',
    aspectRatio: '16:9',
    format: 'MP4',
    notes: 'China video platform',
  },
  {
    platform: 'douyin',
    resolution: '1080x1920',
    aspectRatio: '9:16',
    format: 'MP4',
    notes: 'Chinese TikTok',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REGIONAL VIDEO CONTENT PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

export const REGIONAL_VIDEO_CONTENT_PREFERENCES: Record<string, RegionalVideoContentPreference> = {
  'US': {
    regionCode: 'US',
    presenterStyle: ['Diverse', 'confident', 'direct'],
    brollPreferences: ['Tech', 'office', 'lifestyle'],
    ctaStyle: 'Clear, action-oriented',
    testimonialFormat: 'casual',
    closingStyle: 'Thanks for watching. See you next time!',
  },
  'UK': {
    regionCode: 'UK',
    presenterStyle: ['Professional', 'measured'],
    brollPreferences: ['Urban', 'traditional', 'nature'],
    ctaStyle: 'Polite, professional',
    testimonialFormat: 'formal',
    closingStyle: 'Thank you for joining us. Goodbye.',
  },
  'DE': {
    regionCode: 'DE',
    presenterStyle: ['Expert', 'credible'],
    brollPreferences: ['Industrial', 'precision', 'quality'],
    ctaStyle: 'Informative, logical',
    testimonialFormat: 'data-driven',
    closingStyle: 'Vielen Dank für Ihre Aufmerksamkeit.',
  },
  'FR': {
    regionCode: 'FR',
    presenterStyle: ['Sophisticated', 'articulate'],
    brollPreferences: ['Artistic', 'lifestyle', 'elegant'],
    ctaStyle: 'Refined, subtle',
    testimonialFormat: 'storytelling',
    closingStyle: 'Merci de votre attention.',
  },
  'JP': {
    regionCode: 'JP',
    presenterStyle: ['Polite', 'humble', 'expert'],
    brollPreferences: ['Nature', 'seasons', 'clean spaces'],
    ctaStyle: 'Subtle, respectful',
    testimonialFormat: 'formal',
    closingStyle: 'ご視聴ありがとうございました。',
  },
  'KR': {
    regionCode: 'KR',
    presenterStyle: ['Trendy', 'engaging'],
    brollPreferences: ['Modern', 'tech', 'lifestyle'],
    ctaStyle: 'Friendly, clear',
    testimonialFormat: 'casual',
    closingStyle: '시청해 주셔서 감사합니다.',
  },
  'CN': {
    regionCode: 'CN',
    presenterStyle: ['Confident', 'aspirational'],
    brollPreferences: ['Modern cities', 'tech', 'family'],
    ctaStyle: 'Direct, benefit-focused',
    testimonialFormat: 'storytelling',
    closingStyle: '感谢您的观看，再见。',
  },
  'IN': {
    regionCode: 'IN',
    presenterStyle: ['Warm', 'relatable', 'expert'],
    brollPreferences: ['Diverse India', 'tech hubs'],
    ctaStyle: 'Multiple contact options',
    testimonialFormat: 'storytelling',
    closingStyle: 'Thank you. We hope this was helpful.',
  },
  'SA': {
    regionCode: 'SA',
    presenterStyle: ['Respectful', 'authoritative'],
    brollPreferences: ['Luxury', 'modern', 'heritage'],
    ctaStyle: 'Relationship-building',
    testimonialFormat: 'formal',
    closingStyle: 'شكراً لمتابعتكم.',
  },
  'AE': {
    regionCode: 'AE',
    presenterStyle: ['Professional', 'international'],
    brollPreferences: ['Luxury', 'modern Dubai', 'heritage'],
    ctaStyle: 'Relationship-building, premium',
    testimonialFormat: 'formal',
    closingStyle: 'شكراً لمتابعتكم.',
  },
  'BR': {
    regionCode: 'BR',
    presenterStyle: ['Warm', 'personable', 'energetic'],
    brollPreferences: ['Diverse', 'vibrant cities'],
    ctaStyle: 'Personal, inviting',
    testimonialFormat: 'storytelling',
    closingStyle: 'Obrigado por assistir. Até a próxima!',
  },
  'MX': {
    regionCode: 'MX',
    presenterStyle: ['Warm', 'friendly', 'relatable'],
    brollPreferences: ['Vibrant cities', 'family', 'culture'],
    ctaStyle: 'Personal, inviting',
    testimonialFormat: 'storytelling',
    closingStyle: '¡Gracias por vernos! Hasta pronto.',
  },
  'NG': {
    regionCode: 'NG',
    presenterStyle: ['Confident', 'authentic', 'inspiring'],
    brollPreferences: ['Modern Africa', 'entrepreneurs'],
    ctaStyle: 'Mobile-first CTA',
    testimonialFormat: 'casual',
    closingStyle: 'Thank you for watching. God bless!',
  },
  'KE': {
    regionCode: 'KE',
    presenterStyle: ['Authentic', 'progressive'],
    brollPreferences: ['Modern Kenya', 'nature', 'tech'],
    ctaStyle: 'Mobile-first CTA',
    testimonialFormat: 'casual',
    closingStyle: 'Asante sana. Thank you for watching!',
  },
  'ZA': {
    regionCode: 'ZA',
    presenterStyle: ['Diverse', 'confident', 'modern'],
    brollPreferences: ['Urban', 'diverse communities', 'nature'],
    ctaStyle: 'Clear, inclusive',
    testimonialFormat: 'casual',
    closingStyle: 'Thank you for watching!',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get video aesthetic preferences for a specific region
 */
export function getVideoAestheticForRegion(
  regionCode: string, 
  variant?: 'corporate' | 'startup'
): VideoAestheticPreference {
  // Check for variant-specific preference first (e.g., US_CORPORATE)
  if (variant) {
    const variantKey = `${regionCode}_${variant.toUpperCase()}`;
    if (VIDEO_AESTHETIC_PREFERENCES[variantKey]) {
      return VIDEO_AESTHETIC_PREFERENCES[variantKey];
    }
  }
  
  // Default to base region or US_CORPORATE fallback
  return VIDEO_AESTHETIC_PREFERENCES[regionCode] || VIDEO_AESTHETIC_PREFERENCES['US_CORPORATE'];
}

/**
 * Get video duration preferences for a region
 */
export function getVideoDurationForRegion(regionCode: string): VideoDurationPreference {
  // Map region codes to region groups
  const regionMapping: Record<string, string> = {
    'US': 'US_UK', 'UK': 'US_UK', 'DE': 'US_UK', 'FR': 'US_UK', 'AU': 'US_UK',
    'JP': 'JAPAN_KOREA', 'KR': 'JAPAN_KOREA',
    'SA': 'MENA', 'AE': 'MENA', 'EG': 'MENA',
    'IN': 'INDIA',
    'NG': 'AFRICA', 'KE': 'AFRICA', 'ZA': 'AFRICA', 'GH': 'AFRICA',
    'BR': 'LATAM', 'MX': 'LATAM', 'AR': 'LATAM',
    'CN': 'CHINA', 'TW': 'CHINA', 'HK': 'CHINA',
  };
  
  const groupKey = regionMapping[regionCode] || 'US_UK';
  return VIDEO_DURATION_PREFERENCES[groupKey];
}

/**
 * Get video format specification for a platform
 */
export function getVideoFormatForPlatform(platform: string): VideoFormatSpec | undefined {
  return VIDEO_FORMAT_SPECIFICATIONS.find(spec => spec.platform === platform.toLowerCase());
}

/**
 * Get all video formats for a specific aspect ratio
 */
export function getVideoFormatsForAspectRatio(aspectRatio: '16:9' | '9:16' | '1:1' | '4:3'): VideoFormatSpec[] {
  return VIDEO_FORMAT_SPECIFICATIONS.filter(spec => spec.aspectRatio === aspectRatio);
}

/**
 * Get video content preferences for a region
 */
export function getVideoContentPreferencesForRegion(regionCode: string): RegionalVideoContentPreference {
  return REGIONAL_VIDEO_CONTENT_PREFERENCES[regionCode] || REGIONAL_VIDEO_CONTENT_PREFERENCES['US'];
}

/**
 * Build complete video configuration for a region and platform
 */
export function buildVideoConfigForRegion(
  regionCode: string,
  platform: string,
  contentType: 'socialShort' | 'explainer' | 'productDemo' | 'trainingModule' | 'corporateVideo' | 'webinarClip' = 'explainer',
  variant?: 'corporate' | 'startup'
): {
  aesthetic: VideoAestheticPreference;
  duration: string;
  format: VideoFormatSpec | undefined;
  contentPreferences: RegionalVideoContentPreference;
} {
  const aesthetic = getVideoAestheticForRegion(regionCode, variant);
  const durationPrefs = getVideoDurationForRegion(regionCode);
  const format = getVideoFormatForPlatform(platform);
  const contentPreferences = getVideoContentPreferencesForRegion(regionCode);
  
  return {
    aesthetic,
    duration: durationPrefs[contentType],
    format,
    contentPreferences,
  };
}

/**
 * Get recommended platforms for a region
 */
export function getRecommendedPlatformsForRegion(regionCode: string): string[] {
  const platformsByRegion: Record<string, string[]> = {
    'US': ['youtube', 'linkedin', 'tiktok', 'instagram_reels', 'twitter'],
    'UK': ['youtube', 'linkedin', 'instagram_feed', 'twitter'],
    'DE': ['youtube', 'linkedin', 'instagram_feed'],
    'FR': ['youtube', 'linkedin', 'instagram_feed'],
    'JP': ['youtube', 'twitter', 'instagram_feed'],
    'KR': ['youtube', 'instagram_reels', 'tiktok'],
    'CN': ['bilibili', 'douyin', 'wechat'],
    'IN': ['youtube', 'instagram_reels', 'whatsapp_status'],
    'SA': ['youtube', 'instagram_feed', 'whatsapp_status'],
    'AE': ['youtube', 'instagram_feed', 'linkedin', 'whatsapp_status'],
    'BR': ['youtube', 'instagram_reels', 'tiktok', 'whatsapp_status'],
    'MX': ['youtube', 'facebook', 'tiktok', 'whatsapp_status'],
    'NG': ['youtube', 'instagram_reels', 'whatsapp_status', 'tiktok'],
    'KE': ['youtube', 'whatsapp_status', 'facebook'],
    'ZA': ['youtube', 'instagram_feed', 'facebook', 'linkedin'],
  };
  
  return platformsByRegion[regionCode] || platformsByRegion['US'];
}

/**
 * Get all supported regions for video
 */
export function getSupportedVideoRegions(): string[] {
  return [...new Set(Object.values(VIDEO_AESTHETIC_PREFERENCES).map(p => p.regionCode))];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const RegionalVideoStylesRegistry = {
  aestheticPreferences: VIDEO_AESTHETIC_PREFERENCES,
  durationPreferences: VIDEO_DURATION_PREFERENCES,
  formatSpecifications: VIDEO_FORMAT_SPECIFICATIONS,
  contentPreferences: REGIONAL_VIDEO_CONTENT_PREFERENCES,
  getAestheticForRegion: getVideoAestheticForRegion,
  getDurationForRegion: getVideoDurationForRegion,
  getFormatForPlatform: getVideoFormatForPlatform,
  getFormatsForAspectRatio: getVideoFormatsForAspectRatio,
  getContentPreferencesForRegion: getVideoContentPreferencesForRegion,
  buildConfigForRegion: buildVideoConfigForRegion,
  getRecommendedPlatforms: getRecommendedPlatformsForRegion,
  getSupportedRegions: getSupportedVideoRegions,
};

export default RegionalVideoStylesRegistry;
