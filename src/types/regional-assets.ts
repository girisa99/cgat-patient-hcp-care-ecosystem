/**
 * Regional Landing Content Asset Schema
 * Defines JSONB structure for all asset types per region
 * 
 * CRITICAL: Store only URLs/references, never store binary data
 * All file assets are stored in Supabase Storage or external CDN
 */

// Image asset with metadata
export interface ImageAsset {
  url: string;              // CDN URL to image file
  alt: string;              // Accessibility alt text
  format: 'webp' | 'jpg' | 'png' | 'avif';  // Image format
  width?: number;           // Pixel width (for OG images, critical)
  height?: number;          // Pixel height (for OG images, critical)
  size_kb?: number;         // File size in KB (for analytics)
  source?: 'uploaded' | 'cdn' | 'external'; // Source tracking
}

// Video asset with metadata
export interface VideoAsset {
  url: string;              // CDN URL to video file
  poster?: string;          // URL to poster/thumbnail image
  duration: number;         // Video duration in seconds
  format: 'mp4' | 'webm' | 'mov'; // Video format
  size_mb?: number;         // File size in MB
  auto_play?: boolean;      // Autoplay behavior
  loop?: boolean;           // Loop setting
  muted?: boolean;          // Muted by default
}

// 3D model/avatar asset
export interface Avatar3DAsset {
  model_url: string;        // URL to 3D model file (glb, gltf, etc)
  animation?: string;       // Default animation state (idle, talking, gesturing)
  format?: 'glb' | 'gltf' | 'fbx'; // Model format
  scale?: number;           // Scale factor for rendering
  has_morphs?: boolean;     // Supports morph targets (for speech sync)
}

// Logo asset with variants
export interface LogoAsset {
  url: string;              // URL to logo file
  variant: 'dark' | 'light' | 'mono' | 'full-color'; // Logo variant
  format: 'svg' | 'png' | 'webp'; // Logo format
  width?: number;           // Logo width in pixels
  height?: number;          // Logo height in pixels
}

// OG/Social meta image asset
export interface OGImageAsset {
  url: string;              // CDN URL to OG image
  width: number;            // MUST be 1200 for optimal OG compatibility
  height: number;           // MUST be 630 for optimal OG compatibility
  alt: string;              // Text description for social preview
}

// Complete regional assets collection
export interface RegionalAssets {
  hero_image?: ImageAsset;          // Hero section main image
  hero_video?: VideoAsset;          // Hero section background/feature video
  avatar_3d?: Avatar3DAsset;        // 3D character/avatar for hero or chat
  og_image?: OGImageAsset;          // Open Graph / social meta image
  brand_logo?: LogoAsset;           // Regional brand variant logo
  
  // Additional assets (future expansion)
  [key: string]: ImageAsset | VideoAsset | Avatar3DAsset | LogoAsset | OGImageAsset | undefined;
}

// Database row type (with assets as JSONB)
export interface RegionalLandingContentRow {
  id: string;
  region_code: string;
  headline: string;
  subheadline?: string;
  welcome_script?: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  language_code: string;
  rtl_enabled: boolean;
  assets: RegionalAssets; // JSONB column with asset URLs
  version: number;
  status: 'draft' | 'review' | 'approved' | 'active' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Asset validation and helper functions
 */

export const validateImageAsset = (asset: any): asset is ImageAsset => {
  return (
    typeof asset.url === 'string' &&
    typeof asset.alt === 'string' &&
    ['webp', 'jpg', 'png', 'avif'].includes(asset.format)
  );
};

export const validateVideoAsset = (asset: any): asset is VideoAsset => {
  return (
    typeof asset.url === 'string' &&
    typeof asset.duration === 'number' &&
    ['mp4', 'webm', 'mov'].includes(asset.format)
  );
};

export const validateAvatar3DAsset = (asset: any): asset is Avatar3DAsset => {
  return typeof asset.model_url === 'string';
};

export const validateOGImageAsset = (asset: any): asset is OGImageAsset => {
  return (
    typeof asset.url === 'string' &&
    asset.width === 1200 &&
    asset.height === 630
  );
};

export const validateRegionalAssets = (assets: any): assets is RegionalAssets => {
  if (!assets || typeof assets !== 'object') return false;
  
  // Validate each asset if present
  if (assets.hero_image && !validateImageAsset(assets.hero_image)) return false;
  if (assets.hero_video && !validateVideoAsset(assets.hero_video)) return false;
  if (assets.avatar_3d && !validateAvatar3DAsset(assets.avatar_3d)) return false;
  if (assets.og_image && !validateOGImageAsset(assets.og_image)) return false;
  if (assets.brand_logo && !validateLogAsset(assets.brand_logo)) return false;
  
  return true;
};

export const validateLogAsset = (asset: any): asset is LogoAsset => {
  return (
    typeof asset.url === 'string' &&
    ['dark', 'light', 'mono', 'full-color'].includes(asset.variant) &&
    ['svg', 'png', 'webp'].includes(asset.format)
  );
};

/**
 * Asset builder utilities
 */

export const createImageAsset = (
  url: string,
  alt: string,
  format: 'webp' | 'jpg' | 'png' | 'avif',
  width?: number,
  height?: number
): ImageAsset => ({
  url,
  alt,
  format,
  width,
  height,
});

export const createVideoAsset = (
  url: string,
  duration: number,
  format: 'mp4' | 'webm' | 'mov',
  poster?: string
): VideoAsset => ({
  url,
  duration,
  format,
  poster,
});

export const createOGImageAsset = (
  url: string,
  alt: string
): OGImageAsset => ({
  url,
  width: 1200,
  height: 630,
  alt,
});

export const mergeAssets = (
  baseAssets: RegionalAssets,
  overrideAssets: Partial<RegionalAssets>
): RegionalAssets => ({
  ...baseAssets,
  ...overrideAssets,
});
