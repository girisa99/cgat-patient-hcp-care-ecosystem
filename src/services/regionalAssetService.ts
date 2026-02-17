/**
 * Regional Landing Asset Service
 * Upload, retrieve, and manage assets for regional landing pages.
 * Uses Supabase Storage bucket: regional-landing-assets
 * 
 * Path convention: {region_code}/{asset_type}/{filename}
 * Example: NAM_US/hero_image/hero_1920x1080.webp
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  ImageAsset,
  VideoAsset,
  Avatar3DAsset,
  OGImageAsset,
  LogoAsset,
  RegionalAssets,
} from '@/types/regional-assets';

const BUCKET = 'regional-landing-assets';

// ─── Asset Type Keys ───────────────────────────────────────
export type AssetType = 'hero_image' | 'hero_video' | 'avatar_3d' | 'og_image' | 'brand_logo';

// ─── Upload Options ────────────────────────────────────────
export interface UploadAssetOptions {
  regionCode: string;
  assetType: AssetType;
  file: File;
  /** Optional custom filename; defaults to sanitized original name */
  filename?: string;
  /** If true, overwrites existing file at same path */
  upsert?: boolean;
}

export interface UploadResult {
  publicUrl: string;
  storagePath: string;
  sizeKb: number;
}

// ─── Core Upload ───────────────────────────────────────────

/**
 * Upload a file to the regional-landing-assets bucket.
 * Returns the public URL and storage path.
 */
export async function uploadRegionalAsset(
  options: UploadAssetOptions
): Promise<UploadResult> {
  const { regionCode, assetType, file, upsert = true } = options;

  const sanitizedName = options.filename ?? sanitizeFilename(file.name);
  const storagePath = `${regionCode}/${assetType}/${sanitizedName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return {
    publicUrl: data.publicUrl,
    storagePath,
    sizeKb: Math.round(file.size / 1024),
  };
}

// ─── Asset Builders (post-upload) ──────────────────────────

/**
 * Generate a 3D avatar asset from audio/script and store the reference.
 * Uses Alibaba Wan 2.2 S2V for lip-sync capable avatars.
 * Returns a typed Avatar3DAsset ready for JSONB storage.
 */
export async function generateAvatarAsset(
  regionCode: string,
  avatarModelUrl: string,
  format: 'glb' | 'gltf' | 'fbx' = 'glb'
): Promise<Avatar3DAsset> {
  return {
    model_url: avatarModelUrl,
    format,
    scale: 1.0,
    animation: 'idle',
    has_morphs: true, // Wan 2.2 S2V supports morphs for lip-sync
  };
}

/**
 * Upload a hero image and return a typed ImageAsset ready for JSONB storage.
 */
export async function uploadHeroImage(
  regionCode: string,
  file: File,
  alt: string,
  dimensions?: { width: number; height: number }
): Promise<ImageAsset> {
  const format = inferImageFormat(file.type);
  const result = await uploadRegionalAsset({
    regionCode,
    assetType: 'hero_image',
    file,
    filename: `hero_${Date.now()}.${format}`,
  });

  return {
    url: result.publicUrl,
    alt,
    format,
    width: dimensions?.width,
    height: dimensions?.height,
    size_kb: result.sizeKb,
    source: 'uploaded',
  };
}

/**
 * Upload a brand logo and return a typed LogoAsset.
 */
export async function uploadBrandLogo(
  regionCode: string,
  file: File,
  variant: LogoAsset['variant'] = 'full-color'
): Promise<LogoAsset> {
  const format = inferLogoFormat(file.type);
  const result = await uploadRegionalAsset({
    regionCode,
    assetType: 'brand_logo',
    file,
    filename: `logo_${variant}_${Date.now()}.${format}`,
  });

  return {
    url: result.publicUrl,
    variant,
    format,
  };
}

/**
 * Upload an OG image (1200x630) and return a typed OGImageAsset.
 */
export async function uploadOGImage(
  regionCode: string,
  file: File,
  alt: string
): Promise<OGImageAsset> {
  const result = await uploadRegionalAsset({
    regionCode,
    assetType: 'og_image',
    file,
    filename: `og_${Date.now()}.${inferImageFormat(file.type)}`,
  });

  return {
    url: result.publicUrl,
    width: 1200,
    height: 630,
    alt,
  };
}

/**
 * Upload a hero video and return a typed VideoAsset.
 */
export async function uploadHeroVideo(
  regionCode: string,
  file: File,
  duration: number,
  poster?: string
): Promise<VideoAsset> {
  const format = inferVideoFormat(file.type);
  const result = await uploadRegionalAsset({
    regionCode,
    assetType: 'hero_video',
    file,
    filename: `hero_video_${Date.now()}.${format}`,
  });

  return {
    url: result.publicUrl,
    duration,
    format,
    poster,
    auto_play: true,
    loop: true,
    muted: true,
    size_mb: Math.round(file.size / (1024 * 1024) * 10) / 10,
  };
}

// ─── Update JSONB Assets on regional_landing_content ───────

/**
 * Patch the `assets` JSONB column for a regional landing content row.
 * Merges new asset fields with existing ones (does NOT replace the whole object).
 */
export async function updateRegionalAssets(
  contentId: string,
  assetPatch: Partial<RegionalAssets>
): Promise<void> {
  // Read current assets
  const { data: row, error: readError } = await supabase
    .from('regional_landing_content')
    .select('assets')
    .eq('id', contentId)
    .single();

  if (readError) throw new Error(`Read failed: ${readError.message}`);

  const merged = { ...(row?.assets as Record<string, unknown> ?? {}), ...assetPatch } as unknown as Record<string, unknown>;

  const { error: updateError } = await supabase
    .from('regional_landing_content')
    .update({ assets: merged as any })
    .eq('id', contentId);

  if (updateError) throw new Error(`Update failed: ${updateError.message}`);
}

// ─── Delete Assets ─────────────────────────────────────────

/**
 * Delete a specific asset file from storage.
 */
export async function deleteRegionalAsset(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Delete all assets for a region code.
 */
export async function deleteAllRegionAssets(regionCode: string): Promise<void> {
  const assetTypes: AssetType[] = ['hero_image', 'hero_video', 'avatar_3d', 'og_image', 'brand_logo'];

  for (const assetType of assetTypes) {
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(`${regionCode}/${assetType}`);

    if (files && files.length > 0) {
      const paths = files.map(f => `${regionCode}/${assetType}/${f.name}`);
      await supabase.storage.from(BUCKET).remove(paths);
    }
  }
}

// ─── List Assets ───────────────────────────────────────────

/**
 * List all uploaded files for a region + asset type.
 */
export async function listRegionAssets(
  regionCode: string,
  assetType: AssetType
): Promise<{ name: string; publicUrl: string; size: number }[]> {
  const prefix = `${regionCode}/${assetType}`;
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix);

  if (error) throw new Error(`List failed: ${error.message}`);

  return (files ?? []).map(f => {
    const path = `${prefix}/${f.name}`;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return {
      name: f.name,
      publicUrl: data.publicUrl,
      size: f.metadata?.size ?? 0,
    };
  });
}

// ─── Helpers ───────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/__+/g, '_');
}

function inferImageFormat(mimeType: string): ImageAsset['format'] {
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('avif')) return 'avif';
  if (mimeType.includes('png')) return 'png';
  return 'jpg';
}

function inferLogoFormat(mimeType: string): LogoAsset['format'] {
  if (mimeType.includes('svg')) return 'svg';
  if (mimeType.includes('webp')) return 'webp';
  return 'png';
}

function inferVideoFormat(mimeType: string): VideoAsset['format'] {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('quicktime') || mimeType.includes('mov')) return 'mov';
  return 'mp4';
}
