/**
 * SHARED VIDEO GENERATION PROVIDERS
 * 
 * All video generation implementations in one place.
 * Imported by: ai-universal-processor, ai-image-generator (for motion)
 * 
 * Providers: Alibaba Wan 2.6 T2V, Vertex Veo, Replicate, ModelsLab AnimateDiff
 */

import { type VideoProvider, resolveVideoProviderOrder } from './style-intent-routing.ts';

// ============================================================================
// API KEY ACCESSORS
// ============================================================================

const getKey = (name: string, ...aliases: string[]): string | undefined => {
  const k = Deno.env.get(name);
  if (k) return k;
  for (const a of aliases) {
    const ak = Deno.env.get(a);
    if (ak) return ak;
  }
  return undefined;
};

const videoKeys = {
  alibaba: () => getKey('ALIBABA_SINGAPORE_API_KEY', 'ALIBABA_API_KEY'),
  vertexSA: () => getKey('GOOGLE_VERTEX_SERVICE_ACCOUNT'),
  replicate: () => getKey('REPLICATE_API_TOKEN', 'REPLICATE_API_KEY'),
  modelslab: () => getKey('MODELSLAB_API_KEY'),
};

// ============================================================================
// PROVIDER AVAILABILITY
// ============================================================================

export function isVideoProviderAvailable(provider: VideoProvider): boolean {
  switch (provider) {
    case 'alibaba-wan': return !!videoKeys.alibaba();
    case 'vertex-veo': return !!videoKeys.vertexSA();
    case 'replicate': return !!videoKeys.replicate();
    case 'modelslab-animate': return !!videoKeys.modelslab();
    default: return false;
  }
}

// ============================================================================
// UNIFIED VIDEO GENERATION ENTRY POINT
// ============================================================================

export interface VideoGenOptions {
  model?: string;
  duration?: number;
  aspectRatio?: string;
  size?: string;
}

export interface VideoGenResult {
  taskId?: string;
  videoUrl?: string;
  provider: string;
  model: string;
  status: 'processing' | 'succeeded' | 'failed';
  pollUrl?: string;
  providerChain: string[];
}

/**
 * Generate a video using style-intent-based provider routing with automatic fallback.
 */
export async function generateVideoWithRouting(
  prompt: string,
  styleIntent?: string,
  explicitProvider?: string,
  options: VideoGenOptions = {}
): Promise<VideoGenResult> {
  const providerOrder = resolveVideoProviderOrder(
    styleIntent, explicitProvider, isVideoProviderAvailable
  );

  console.log(`🎬 [VideoProviders] Style: ${styleIntent || 'default'}, Chain: [${providerOrder.join(' → ')}]`);

  if (providerOrder.length === 0) {
    throw new Error('No video generation providers available.');
  }

  let lastError: Error | null = null;

  for (const provider of providerOrder) {
    try {
      console.log(`🎬 [VideoProviders] Trying: ${provider}`);
      const result = await generateVideoWithProvider(provider, prompt, options);
      console.log(`✅ [VideoProviders] Success: ${provider}`);
      return { ...result, providerChain: providerOrder };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`⚠️ [VideoProviders] ${provider} failed: ${lastError.message}`);
    }
  }

  throw lastError || new Error('All video providers failed');
}

// ============================================================================
// PROVIDER DISPATCH
// ============================================================================

async function generateVideoWithProvider(
  provider: VideoProvider, prompt: string, options: VideoGenOptions
): Promise<Omit<VideoGenResult, 'providerChain'>> {
  switch (provider) {
    case 'alibaba-wan': return generateWithAlibabaWan(prompt, options);
    case 'vertex-veo': return generateWithVertexVeo(prompt, options);
    case 'replicate': return generateWithReplicateVideo(prompt, options);
    case 'modelslab-animate': return generateWithModelsLabAnimate(prompt, options);
    default: throw new Error(`Unsupported video provider: ${provider}`);
  }
}

// ============================================================================
// ALIBABA WAN 2.6 T2V
// ============================================================================

async function generateWithAlibabaWan(prompt: string, options: VideoGenOptions): Promise<Omit<VideoGenResult, 'providerChain'>> {
  const apiKey = videoKeys.alibaba();
  if (!apiKey) throw new Error('Alibaba key missing');

  const sizeMap: Record<string, string> = {
    '16:9': '1280*720', '9:16': '720*1280', '1:1': '960*960',
  };
  const size = sizeMap[options.aspectRatio || '16:9'] || '1280*720';
  const model = options.model || 'wan2.6-t2v';
  const endpoint = 'https://dashscope-intl.aliyuncs.com';

  const response = await fetch(`${endpoint}/api/v1/services/aigc/video-generation/video-synthesis`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model,
      input: { prompt },
      parameters: { size, duration: options.duration || 5 },
    }),
  });

  if (!response.ok) throw new Error(`Alibaba Video Error: ${response.status} - ${await response.text()}`);

  const data = await response.json();
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error('Alibaba Video: no task_id');

  return {
    taskId,
    provider: 'alibaba-wan',
    model,
    status: 'processing',
    pollUrl: `${endpoint}/api/v1/tasks/${taskId}`,
  };
}

// ============================================================================
// VERTEX VEO (Video via Vertex AI)
// ============================================================================

async function generateWithVertexVeo(prompt: string, options: VideoGenOptions): Promise<Omit<VideoGenResult, 'providerChain'>> {
  const saJson = videoKeys.vertexSA();
  if (!saJson) throw new Error('Vertex service account missing');

  // Vertex Veo requires specific quota — throw to trigger fallback if not available
  const sa = JSON.parse(saJson);
  const model = options.model || 'veo-002';

  console.log(`🎬 [Vertex Veo] Model: ${model} — Note: Requires GenerateVideoRequests quota`);
  
  // For now, delegate to Alibaba as Veo quota is limited
  throw new Error('Vertex Veo: quota-limited, delegating to fallback');
}

// ============================================================================
// REPLICATE VIDEO
// ============================================================================

async function generateWithReplicateVideo(prompt: string, options: VideoGenOptions): Promise<Omit<VideoGenResult, 'providerChain'>> {
  const token = videoKeys.replicate();
  if (!token) throw new Error('Replicate key missing');

  const resp = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: 'luma/ray',
      input: { prompt, num_frames: (options.duration || 5) * 24 },
    }),
  });

  if (!resp.ok) throw new Error(`Replicate Video Error: ${resp.status} - ${await resp.text()}`);
  const data = await resp.json();

  return {
    taskId: data.id,
    provider: 'replicate',
    model: 'luma/ray',
    status: 'processing',
    pollUrl: `https://api.replicate.com/v1/predictions/${data.id}`,
  };
}

// ============================================================================
// MODELSLAB ANIMATEDIFF
// ============================================================================

async function generateWithModelsLabAnimate(prompt: string, options: VideoGenOptions): Promise<Omit<VideoGenResult, 'providerChain'>> {
  const apiKey = videoKeys.modelslab();
  if (!apiKey) throw new Error('ModelsLab key missing');

  const response = await fetch('https://modelslab.com/api/v6/video/text2video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: apiKey,
      model_id: options.model || 'animatediff',
      prompt,
      num_frames: (options.duration || 5) * 8,
      width: 512, height: 512,
    }),
  });

  if (!response.ok) throw new Error(`ModelsLab Animate Error: ${response.status} - ${await response.text()}`);
  const data = await response.json();

  if (data.output?.length > 0) {
    return {
      videoUrl: data.output[0],
      provider: 'modelslab-animate',
      model: 'animatediff',
      status: 'succeeded',
    };
  }

  return {
    taskId: data.id,
    provider: 'modelslab-animate',
    model: 'animatediff',
    status: 'processing',
    pollUrl: data.fetch_result,
  };
}
