/**
 * CDN Provider Domains — Single Source of Truth
 *
 * These domains serve AI-generated assets that EXPIRE after 24-48 hours.
 * Any URL containing these domains MUST be re-uploaded to Supabase Storage
 * for permanent access.
 *
 * Used by: useVisualGeneration, useMusicSfxGeneration, useAssemblyPipeline,
 *          ai-video-generator edge fn, ai-universal-processor edge fn
 *
 * When adding a new AI provider, add their CDN domain here.
 */

export const EXPIRING_CDN_DOMAINS = [
  // Alibaba / DashScope
  'aliyuncs.com',
  'dashscope',
  // Replicate
  'replicate.delivery',
  'pbxt.replicate',
  // ModelsLab
  'modelslab.com',
  // fal.ai
  'fal.media',
  // Cloudflare R2 (temporary URLs)
  'r2.cloudflarestorage',
  // Google Cloud / Vertex AI
  'googleapis.com',
  'storage.googleapis.com',
  // OpenAI / Sora
  'sora2api',
  // Together AI
  'together.ai',
  // RunPod (temporary output URLs)
  'runpod.ai',
] as const;

/** Check if a URL is from an expiring CDN provider and needs re-upload */
export function needsCdnReUpload(url: string): boolean {
  if (!url || url.startsWith('data:') || url.includes('supabase.co/storage')) return false;
  return EXPIRING_CDN_DOMAINS.some(domain => url.includes(domain));
}

/** Check if a URL is already in permanent Supabase Storage */
export function isSupabaseStorageUrl(url: string): boolean {
  return typeof url === 'string' && url.includes('supabase.co/storage');
}

/** Check if a URL is a base64 data URI (must never be stored or sent to edge functions) */
export function isBase64DataUri(url: string): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}
