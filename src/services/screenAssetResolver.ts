/**
 * Screen Asset Resolver — Resolves screenIds to actual storage URLs
 *
 * REUSABLE: Works for any product's screenshots, not just EP04.
 * Reads from the `product-screenshots` bucket using the centralized
 * storage path pattern from universal-script-schema.ts.
 *
 * Usage:
 *   const resolver = createScreenAssetResolver();
 *   const urls = await resolver.resolveScreens('sprint-tracker', ['day-1-view', 'day-2-view']);
 */

import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_STORAGE_PATHS } from '@/config/universal-script-schema';

// ─── TYPES ──────────────────────────────────────────────────────────────────────

export interface ResolvedScreenAsset {
  screenId: string;
  productId: string;
  publicUrl: string;
  storagePath: string;
  exists: boolean;
  /** If multiple captures exist, returns the most recent */
  capturedAt?: string;
}

export interface ScreenAssetResolverOptions {
  /** Bucket name override (default: from universal-script-schema) */
  bucket?: string;
  /** Prefix inside the bucket (default: 'screenshots') */
  prefix?: string;
  /** Whether to use signed URLs instead of public (default: false) */
  useSigned?: boolean;
  /** Signed URL expiry in seconds (default: 3600) */
  signedExpiry?: number;
}

// ─── RESOLVER ───────────────────────────────────────────────────────────────────

/**
 * Resolves screen IDs to actual storage URLs from the product-screenshots bucket.
 * Matches files by pattern: `{prefix}/{productId}-{screenId}.*` or `{prefix}/{screenId}.*`
 */
export async function resolveScreenAssets(
  productId: string,
  screenIds: string[],
  options: ScreenAssetResolverOptions = {}
): Promise<ResolvedScreenAsset[]> {
  const bucket = options.bucket || DEFAULT_STORAGE_PATHS.screenshotBucket;
  const prefix = options.prefix || 'screenshots';

  // List all files in the bucket prefix
  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });

  if (error || !files) {
    console.warn('[ScreenAssetResolver] Failed to list bucket:', error?.message);
    return screenIds.map(id => ({
      screenId: id,
      productId,
      publicUrl: '',
      storagePath: '',
      exists: false,
    }));
  }

  // Build a lookup: screenId → best matching file
  const fileMap = new Map<string, { name: string; created_at?: string }>();

  for (const file of files) {
    const baseName = file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '');

    for (const screenId of screenIds) {
      if (fileMap.has(screenId)) continue; // already found (most recent due to sort)

      // Match patterns: "{productId}-{screenId}", "{screenId}", "sprint-tracker-{screenId}"
      if (
        baseName === `${productId}-${screenId}` ||
        baseName === screenId ||
        baseName.endsWith(`-${screenId}`)
      ) {
        fileMap.set(screenId, { name: file.name, created_at: file.created_at });
      }
    }
  }

  // Resolve URLs
  return screenIds.map(screenId => {
    const match = fileMap.get(screenId);
    if (!match) {
      return {
        screenId,
        productId,
        publicUrl: '',
        storagePath: '',
        exists: false,
      };
    }

    const storagePath = `${prefix}/${match.name}`;

    if (options.useSigned) {
      // Will be resolved async — for now return public URL pattern
      const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      return {
        screenId,
        productId,
        publicUrl: data.publicUrl,
        storagePath,
        exists: true,
        capturedAt: match.created_at,
      };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return {
      screenId,
      productId,
      publicUrl: data.publicUrl,
      storagePath,
      exists: true,
      capturedAt: match.created_at,
    };
  });
}

/**
 * Convenience: resolve all screens for a given scene's visual pipeline.
 * Filters pipeline steps of type 'screen-capture' and resolves their screenIds.
 */
export async function resolveSceneScreenAssets(
  productId: string,
  visualPipeline: Record<string, unknown>[],
  options?: ScreenAssetResolverOptions
): Promise<ResolvedScreenAsset[]> {
  const screenIds: string[] = [];
  for (const step of visualPipeline) {
    if (step.type === 'screen-capture' && Array.isArray(step.screenIds)) {
      screenIds.push(...(step.screenIds as string[]));
    }
    if (step.type === 'ai-screen-enhance' && Array.isArray(step.screenIds)) {
      screenIds.push(...(step.screenIds as string[]));
    }
  }

  const unique = [...new Set(screenIds)];
  if (unique.length === 0) return [];
  return resolveScreenAssets(productId, unique, options);
}

/**
 * Batch resolve: resolves screen assets for ALL scenes in a template mapping.
 * Returns a map of sceneKey → ResolvedScreenAsset[].
 */
export async function batchResolveScreenAssets(
  productId: string,
  scenes: Array<{ sceneKey: string; visualPipeline?: Record<string, unknown>[] }>,
  options?: ScreenAssetResolverOptions
): Promise<Map<string, ResolvedScreenAsset[]>> {
  // Collect all unique screenIds across all scenes
  const allScreenIds = new Set<string>();
  const sceneScreenMap = new Map<string, string[]>();

  for (const scene of scenes) {
    if (!scene.visualPipeline) continue;
    const ids: string[] = [];
    for (const step of scene.visualPipeline) {
      if ((step.type === 'screen-capture' || step.type === 'ai-screen-enhance') && Array.isArray(step.screenIds)) {
        ids.push(...(step.screenIds as string[]));
      }
    }
    if (ids.length > 0) {
      sceneScreenMap.set(scene.sceneKey, [...new Set(ids)]);
      ids.forEach(id => allScreenIds.add(id));
    }
  }

  if (allScreenIds.size === 0) return new Map();

  // Single bulk resolve
  const allResolved = await resolveScreenAssets(productId, [...allScreenIds], options);
  const resolvedLookup = new Map(allResolved.map(r => [r.screenId, r]));

  // Map back to scenes
  const result = new Map<string, ResolvedScreenAsset[]>();
  for (const [sceneKey, ids] of sceneScreenMap) {
    result.set(sceneKey, ids.map(id => resolvedLookup.get(id)!).filter(Boolean));
  }
  return result;
}
