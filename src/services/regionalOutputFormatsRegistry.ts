/**
 * Regional Output Formats & File Types Registry
 * 
 * Comprehensive document, video, image, audio format preferences,
 * export presets by platform, and region-specific requirements.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type FormatDemand = 1 | 2 | 3 | 4 | 5; // ★ rating
export type FileSize = 'tiny' | 'small' | 'medium' | 'large';
export type QualityType = 'lossless' | 'lossy' | 'both' | 'vector';
export type SupportLevel = 'universal' | 'good' | 'limited' | 'apple_only' | 'modern_browsers' | 'web_print';

export type DocumentFormat = 'pptx' | 'pdf' | 'docx' | 'google_slides' | 'keynote' | 'wps_office' | 'html_export';
export type VideoFormat = 'mp4_h264' | 'mp4_h265' | 'webm' | 'mov' | 'gif';
export type ImageFormat = 'png' | 'jpg' | 'webp' | 'svg' | 'avif' | 'heic';
export type AudioFormat = 'mp3' | 'wav' | 'aac' | 'ogg' | 'flac';

export interface DocumentFormatPreference {
  format: DocumentFormat;
  displayName: string;
  demandByRegion: Record<string, FormatDemand>;
}

export interface OutputVideoFormatSpec {
  format: VideoFormat;
  displayName: string;
  resolution: string;
  codec: string;
  useCase: string;
  fileSize: FileSize;
}

export interface ImageFormatSpec {
  format: ImageFormat;
  displayName: string;
  useCase: string;
  quality: QualityType;
  fileSize: FileSize;
  support: SupportLevel;
}

export interface AudioFormatSpec {
  format: AudioFormat;
  displayName: string;
  quality: string;
  useCase: string;
  support: SupportLevel;
}

export interface PlatformExportPreset {
  platform: string;
  videoSpecs: string;
  imageSpecs: string;
  notes: string;
}

export interface RegionFormatNote {
  regionCode: string;
  regionName: string;
  primaryPlatforms: string[];
  preferredFormats: string;
  specialRequirements: string;
}

export interface RegionalVideoNote {
  regionCode: string;
  note: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT FORMATS BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const DOCUMENT_FORMAT_PREFERENCES: DocumentFormatPreference[] = [
  {
    format: 'pptx',
    displayName: 'PPTX (PowerPoint)',
    demandByRegion: {
      'US_UK_EU': 5, 'JP': 5, 'CN': 4, 'IN': 5, 'MENA': 5, 'AFRICA': 5
    }
  },
  {
    format: 'pdf',
    displayName: 'PDF',
    demandByRegion: {
      'US_UK_EU': 5, 'JP': 5, 'CN': 5, 'IN': 5, 'MENA': 5, 'AFRICA': 5
    }
  },
  {
    format: 'docx',
    displayName: 'DOCX (Word)',
    demandByRegion: {
      'US_UK_EU': 5, 'JP': 4, 'CN': 4, 'IN': 5, 'MENA': 5, 'AFRICA': 4
    }
  },
  {
    format: 'google_slides',
    displayName: 'Google Slides',
    demandByRegion: {
      'US_UK_EU': 4, 'JP': 3, 'CN': 1, 'IN': 5, 'MENA': 3, 'AFRICA': 5
    }
  },
  {
    format: 'keynote',
    displayName: 'Keynote',
    demandByRegion: {
      'US_UK_EU': 3, 'JP': 4, 'CN': 1, 'IN': 2, 'MENA': 2, 'AFRICA': 2
    }
  },
  {
    format: 'wps_office',
    displayName: 'WPS Office',
    demandByRegion: {
      'US_UK_EU': 1, 'JP': 2, 'CN': 5, 'IN': 2, 'MENA': 2, 'AFRICA': 3
    }
  },
  {
    format: 'html_export',
    displayName: 'HTML Export',
    demandByRegion: {
      'US_UK_EU': 4, 'JP': 3, 'CN': 4, 'IN': 4, 'MENA': 3, 'AFRICA': 4
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO FORMATS
// ═══════════════════════════════════════════════════════════════════════════════

export const VIDEO_FORMAT_SPECS: OutputVideoFormatSpec[] = [
  {
    format: 'mp4_h264',
    displayName: 'MP4 (H.264)',
    resolution: '1080p',
    codec: 'H.264/AAC',
    useCase: 'Universal, all platforms',
    fileSize: 'medium'
  },
  {
    format: 'mp4_h265',
    displayName: 'MP4 (H.265)',
    resolution: '4K',
    codec: 'HEVC/AAC',
    useCase: 'High quality, newer devices',
    fileSize: 'small'
  },
  {
    format: 'webm',
    displayName: 'WebM',
    resolution: '1080p',
    codec: 'VP9/Opus',
    useCase: 'Web embedding',
    fileSize: 'small'
  },
  {
    format: 'mov',
    displayName: 'MOV',
    resolution: '1080p-4K',
    codec: 'ProRes',
    useCase: 'Professional editing',
    fileSize: 'large'
  },
  {
    format: 'gif',
    displayName: 'GIF',
    resolution: '480p max',
    codec: 'GIF',
    useCase: 'Social, previews',
    fileSize: 'medium'
  }
];

export const REGIONAL_VIDEO_NOTES: RegionalVideoNote[] = [
  { regionCode: 'AFRICA', note: 'Offer lower res (720p) option for bandwidth' },
  { regionCode: 'IN', note: 'Offer lower res (720p) option for bandwidth' },
  { regionCode: 'CN', note: 'WeChat compression - optimize for mobile' },
  { regionCode: 'JP', note: 'High quality expected, 1080p minimum' },
  { regionCode: 'MENA', note: 'RTL text overlays need special handling' }
];

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE FORMATS
// ═══════════════════════════════════════════════════════════════════════════════

export const IMAGE_FORMAT_SPECS: ImageFormatSpec[] = [
  {
    format: 'png',
    displayName: 'PNG',
    useCase: 'Graphics, screenshots, transparency',
    quality: 'lossless',
    fileSize: 'large',
    support: 'universal'
  },
  {
    format: 'jpg',
    displayName: 'JPG/JPEG',
    useCase: 'Photos, web images',
    quality: 'lossy',
    fileSize: 'small',
    support: 'universal'
  },
  {
    format: 'webp',
    displayName: 'WebP',
    useCase: 'Web-optimized images',
    quality: 'both',
    fileSize: 'tiny',
    support: 'modern_browsers'
  },
  {
    format: 'svg',
    displayName: 'SVG',
    useCase: 'Icons, logos, vectors',
    quality: 'vector',
    fileSize: 'tiny',
    support: 'web_print'
  },
  {
    format: 'avif',
    displayName: 'AVIF',
    useCase: 'Next-gen web images',
    quality: 'both',
    fileSize: 'tiny',
    support: 'limited'
  },
  {
    format: 'heic',
    displayName: 'HEIC',
    useCase: 'Apple devices',
    quality: 'lossy',
    fileSize: 'small',
    support: 'apple_only'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO FORMATS
// ═══════════════════════════════════════════════════════════════════════════════

export const AUDIO_FORMAT_SPECS: AudioFormatSpec[] = [
  {
    format: 'mp3',
    displayName: 'MP3',
    quality: '128-320kbps',
    useCase: 'Universal audio, podcasts',
    support: 'universal'
  },
  {
    format: 'wav',
    displayName: 'WAV',
    quality: 'Lossless',
    useCase: 'Professional, editing',
    support: 'universal'
  },
  {
    format: 'aac',
    displayName: 'AAC',
    quality: '128-256kbps',
    useCase: 'Streaming, mobile',
    support: 'good'
  },
  {
    format: 'ogg',
    displayName: 'OGG',
    quality: '128-320kbps',
    useCase: 'Open source, web',
    support: 'limited'
  },
  {
    format: 'flac',
    displayName: 'FLAC',
    quality: 'Lossless',
    useCase: 'Archival, audiophile',
    support: 'limited'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT PRESETS BY PLATFORM
// ═══════════════════════════════════════════════════════════════════════════════

export const PLATFORM_EXPORT_PRESETS: PlatformExportPreset[] = [
  {
    platform: 'youtube',
    videoSpecs: '1080p/4K, 16:9, MP4',
    imageSpecs: '1280x720 thumbnail',
    notes: 'Chapters, captions support'
  },
  {
    platform: 'tiktok',
    videoSpecs: '1080x1920, 9:16, MP4',
    imageSpecs: '1080x1920',
    notes: 'Max 10 min'
  },
  {
    platform: 'instagram_feed',
    videoSpecs: '1080x1080 or 1080x1350, MP4',
    imageSpecs: '1080x1080',
    notes: 'Max 60s feed, 90s reels'
  },
  {
    platform: 'instagram_stories',
    videoSpecs: '1080x1920, 9:16, MP4',
    imageSpecs: '1080x1920',
    notes: 'Max 15s per story'
  },
  {
    platform: 'linkedin',
    videoSpecs: '1080p, 16:9 or 1:1, MP4',
    imageSpecs: '1200x627',
    notes: 'Max 10 min'
  },
  {
    platform: 'twitter',
    videoSpecs: '720-1080p, 16:9, MP4',
    imageSpecs: '1200x675 or 1080x1080',
    notes: 'Max 2:20 min'
  },
  {
    platform: 'facebook',
    videoSpecs: '1080p, 16:9 or 9:16, MP4',
    imageSpecs: '1200x630',
    notes: 'Various formats supported'
  },
  {
    platform: 'wechat',
    videoSpecs: '720p, 16:9, MP4',
    imageSpecs: '1080x1080',
    notes: 'Compressed for mobile'
  },
  {
    platform: 'whatsapp',
    videoSpecs: '720p, 16:9, MP4 (<16MB)',
    imageSpecs: '1280x720',
    notes: 'Size limit important'
  },
  {
    platform: 'douyin',
    videoSpecs: '1080x1920, 9:16, MP4',
    imageSpecs: '1080x1920',
    notes: 'China TikTok equivalent'
  },
  {
    platform: 'bilibili',
    videoSpecs: '1080p/4K, 16:9, MP4',
    imageSpecs: '1920x1080',
    notes: 'High quality expected'
  },
  {
    platform: 'line',
    videoSpecs: '720p, 16:9, MP4',
    imageSpecs: '1080x1080',
    notes: 'Japan/SEA popular'
  },
  {
    platform: 'kakaotalk',
    videoSpecs: '720p, 16:9, MP4',
    imageSpecs: '1080x1080',
    notes: 'Korea popular'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// REGION-SPECIFIC FORMAT NOTES
// ═══════════════════════════════════════════════════════════════════════════════

export const REGION_FORMAT_NOTES: RegionFormatNote[] = [
  {
    regionCode: 'US',
    regionName: 'United States',
    primaryPlatforms: ['YouTube', 'LinkedIn', 'TikTok'],
    preferredFormats: 'MP4 1080p, PNG, PDF',
    specialRequirements: 'Captions for accessibility'
  },
  {
    regionCode: 'UK',
    regionName: 'United Kingdom',
    primaryPlatforms: ['LinkedIn', 'YouTube'],
    preferredFormats: 'MP4 1080p, PDF',
    specialRequirements: 'GDPR compliance'
  },
  {
    regionCode: 'DE',
    regionName: 'Germany',
    primaryPlatforms: ['LinkedIn', 'Xing'],
    preferredFormats: 'MP4 1080p, PDF',
    specialRequirements: 'GDPR, high quality'
  },
  {
    regionCode: 'JP',
    regionName: 'Japan',
    primaryPlatforms: ['YouTube', 'LINE', 'Twitter'],
    preferredFormats: 'MP4 1080p+, PNG',
    specialRequirements: 'High quality expected'
  },
  {
    regionCode: 'KR',
    regionName: 'Korea',
    primaryPlatforms: ['YouTube', 'KakaoTalk', 'Naver'],
    preferredFormats: 'MP4 1080p, WebP',
    specialRequirements: 'Platform-specific sizing'
  },
  {
    regionCode: 'CN',
    regionName: 'China',
    primaryPlatforms: ['WeChat', 'Douyin', 'Bilibili'],
    preferredFormats: 'MP4 720p (compressed), PNG',
    specialRequirements: 'Size optimization crucial'
  },
  {
    regionCode: 'IN',
    regionName: 'India',
    primaryPlatforms: ['YouTube', 'WhatsApp', 'Instagram'],
    preferredFormats: 'MP4 720p (bandwidth), JPG',
    specialRequirements: 'Low bandwidth option'
  },
  {
    regionCode: 'MENA',
    regionName: 'Middle East & North Africa',
    primaryPlatforms: ['YouTube', 'Instagram', 'Snapchat'],
    preferredFormats: 'MP4 1080p, PNG',
    specialRequirements: 'RTL text support'
  },
  {
    regionCode: 'BR',
    regionName: 'Brazil',
    primaryPlatforms: ['YouTube', 'Instagram', 'WhatsApp'],
    preferredFormats: 'MP4 1080p, JPG',
    specialRequirements: 'WhatsApp optimization'
  },
  {
    regionCode: 'NG',
    regionName: 'Nigeria',
    primaryPlatforms: ['WhatsApp', 'YouTube', 'Instagram'],
    preferredFormats: 'MP4 720p, JPG',
    specialRequirements: 'Low bandwidth priority'
  },
  {
    regionCode: 'KE',
    regionName: 'Kenya',
    primaryPlatforms: ['WhatsApp', 'YouTube', 'Facebook'],
    preferredFormats: 'MP4 720p, JPG',
    specialRequirements: 'Mobile-first, small files'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get document format demand for a specific region
 */
export function getDocumentFormatDemand(format: DocumentFormat, regionCode: string): FormatDemand | undefined {
  const formatData = DOCUMENT_FORMAT_PREFERENCES.find(f => f.format === format);
  if (!formatData) return undefined;
  
  // Try direct match first
  if (formatData.demandByRegion[regionCode]) {
    return formatData.demandByRegion[regionCode];
  }
  
  // Map individual countries to region groups
  const regionMappings: Record<string, string> = {
    'US': 'US_UK_EU', 'UK': 'US_UK_EU', 'DE': 'US_UK_EU', 'FR': 'US_UK_EU',
    'SA': 'MENA', 'AE': 'MENA', 'EG': 'MENA',
    'NG': 'AFRICA', 'KE': 'AFRICA', 'ZA': 'AFRICA'
  };
  
  const mappedRegion = regionMappings[regionCode];
  if (mappedRegion && formatData.demandByRegion[mappedRegion]) {
    return formatData.demandByRegion[mappedRegion];
  }
  
  return undefined;
}

/**
 * Get top document formats for a region
 */
export function getTopDocumentFormatsForRegion(regionCode: string, limit: number = 3): DocumentFormatPreference[] {
  return DOCUMENT_FORMAT_PREFERENCES
    .map(f => ({
      ...f,
      demand: getDocumentFormatDemand(f.format, regionCode) || 0
    }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, limit);
}

/**
 * Get video format specification
 */
export function getVideoFormatSpec(format: VideoFormat): OutputVideoFormatSpec | undefined {
  return VIDEO_FORMAT_SPECS.find(f => f.format === format);
}

/**
 * Get image format specification
 */
export function getImageFormatSpec(format: ImageFormat): ImageFormatSpec | undefined {
  return IMAGE_FORMAT_SPECS.find(f => f.format === format);
}

/**
 * Get audio format specification
 */
export function getAudioFormatSpec(format: AudioFormat): AudioFormatSpec | undefined {
  return AUDIO_FORMAT_SPECS.find(f => f.format === format);
}

/**
 * Get export preset for a platform
 */
export function getPlatformExportPreset(platform: string): PlatformExportPreset | undefined {
  return PLATFORM_EXPORT_PRESETS.find(p => p.platform.toLowerCase() === platform.toLowerCase());
}

/**
 * Get all platforms for a region
 */
export function getPlatformsForRegion(regionCode: string): string[] {
  const note = REGION_FORMAT_NOTES.find(r => r.regionCode === regionCode);
  return note?.primaryPlatforms || [];
}

/**
 * Get format notes for a region
 */
export function getFormatNotesForRegion(regionCode: string): RegionFormatNote | undefined {
  return REGION_FORMAT_NOTES.find(r => r.regionCode === regionCode);
}

/**
 * Get video notes for a region
 */
export function getVideoNotesForRegion(regionCode: string): string | undefined {
  const note = REGIONAL_VIDEO_NOTES.find(n => n.regionCode === regionCode);
  return note?.note;
}

/**
 * Build complete output format configuration for a region
 */
export function buildOutputConfigForRegion(regionCode: string): {
  topDocumentFormats: DocumentFormatPreference[];
  regionFormatNote: RegionFormatNote | undefined;
  videoNote: string | undefined;
  platformPresets: PlatformExportPreset[];
} {
  const platforms = getPlatformsForRegion(regionCode);
  const platformPresets = platforms
    .map(p => getPlatformExportPreset(p.toLowerCase().replace(/\s+/g, '_')))
    .filter((p): p is PlatformExportPreset => p !== undefined);

  return {
    topDocumentFormats: getTopDocumentFormatsForRegion(regionCode, 3),
    regionFormatNote: getFormatNotesForRegion(regionCode),
    videoNote: getVideoNotesForRegion(regionCode),
    platformPresets
  };
}

/**
 * Get recommended video resolution for region
 */
export function getRecommendedVideoResolution(regionCode: string): '720p' | '1080p' | '4K' {
  const lowBandwidthRegions = ['IN', 'AFRICA', 'NG', 'KE', 'ZA'];
  const highQualityRegions = ['JP', 'KR', 'DE'];
  
  if (lowBandwidthRegions.includes(regionCode)) return '720p';
  if (highQualityRegions.includes(regionCode)) return '1080p'; // Can be 4K for premium
  return '1080p';
}

/**
 * Check if region requires RTL support
 */
export function requiresRTLSupport(regionCode: string): boolean {
  const rtlRegions = ['MENA', 'SA', 'AE', 'EG', 'IL'];
  return rtlRegions.includes(regionCode);
}

/**
 * Get all supported output format regions
 */
export function getSupportedOutputFormatRegions(): string[] {
  return REGION_FORMAT_NOTES.map(r => r.regionCode);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const RegionalOutputFormatsRegistry = {
  DOCUMENT_FORMAT_PREFERENCES,
  VIDEO_FORMAT_SPECS,
  REGIONAL_VIDEO_NOTES,
  IMAGE_FORMAT_SPECS,
  AUDIO_FORMAT_SPECS,
  PLATFORM_EXPORT_PRESETS,
  REGION_FORMAT_NOTES,
  getDocumentFormatDemand,
  getTopDocumentFormatsForRegion,
  getVideoFormatSpec,
  getImageFormatSpec,
  getAudioFormatSpec,
  getPlatformExportPreset,
  getPlatformsForRegion,
  getFormatNotesForRegion,
  getVideoNotesForRegion,
  buildOutputConfigForRegion,
  getRecommendedVideoResolution,
  requiresRTLSupport,
  getSupportedOutputFormatRegions
};

export default RegionalOutputFormatsRegistry;
