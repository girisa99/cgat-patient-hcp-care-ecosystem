/**
 * Image Preview Service — Phase 6B (B-009)
 *
 * Routes image generation preview requests to the appropriate provider
 * based on region and content type. Used by StyleCustomizationPanel
 * for AI-generated style previews.
 *
 * Provider routing:
 *   Western regions → Gemini Image / DALL-E 3
 *   CJK regions → Alibaba Wanx
 *   SEA/India → Gemini Image
 *   All → ModelsLab FLUX as fallback
 */

import { supabase } from '@/integrations/supabase/client';

export type ImageProvider = 'gemini' | 'openai' | 'alibaba' | 'modelslab';

export interface ImagePreviewRequest {
  prompt: string;
  style: string;
  width?: number;
  height?: number;
  regionCode?: string;
  provider?: ImageProvider;
}

export interface ImagePreviewResult {
  imageUrl: string;
  provider: ImageProvider;
  generationTimeMs: number;
  error?: string;
}

/** Route to the best image provider for the given region */
function selectImageProvider(regionCode: string = 'NAM_US'): ImageProvider {
  if (regionCode.startsWith('CJK')) return 'alibaba';
  if (regionCode.startsWith('SEA') || regionCode.startsWith('APAC_IN')) return 'gemini';
  return 'gemini'; // Default to Gemini for Western regions
}

/**
 * Generate a style preview image.
 * Calls ai-universal-processor with image_generation action.
 */
export async function generateStylePreview(request: ImagePreviewRequest): Promise<ImagePreviewResult> {
  const provider = request.provider || selectImageProvider(request.regionCode);
  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'image_generation',
        prompt: `${request.prompt}. Style: ${request.style}. High quality, professional, suitable for video production thumbnail.`,
        width: request.width || 512,
        height: request.height || 512,
        provider,
        model: provider === 'gemini' ? 'gemini-2.0-flash'
          : provider === 'openai' ? 'dall-e-3'
          : provider === 'alibaba' ? 'wanx-v1'
          : 'flux-schnell',
      },
    });

    if (error) throw error;

    return {
      imageUrl: data?.imageUrl || data?.url || '',
      provider,
      generationTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      imageUrl: '',
      provider,
      generationTimeMs: Date.now() - startTime,
      error: err.message || 'Image generation failed',
    };
  }
}

/**
 * Generate multiple preview thumbnails for a batch of styles.
 * Runs in parallel with a concurrency limit.
 */
export async function generateBatchPreviews(
  styles: Array<{ name: string; prompt: string }>,
  regionCode: string = 'NAM_US',
  concurrency: number = 3,
): Promise<Map<string, ImagePreviewResult>> {
  const results = new Map<string, ImagePreviewResult>();
  const queue = [...styles];

  async function processNext() {
    while (queue.length > 0) {
      const style = queue.shift()!;
      const result = await generateStylePreview({
        prompt: style.prompt,
        style: style.name,
        regionCode,
      });
      results.set(style.name, result);
    }
  }

  // Run N workers in parallel
  const workers = Array.from({ length: Math.min(concurrency, styles.length) }, () => processNext());
  await Promise.all(workers);

  return results;
}
