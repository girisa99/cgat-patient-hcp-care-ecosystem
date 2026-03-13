/**
 * SHARED IMAGE GENERATION PROVIDERS
 * 
 * All image generation implementations in one place.
 * Imported by: ai-image-generator, ai-universal-processor
 * 
 * Providers: Gemini, Vertex Imagen 3.0, OpenAI, Alibaba Wan, 
 *            ModelsLab, HuggingFace, Replicate, DeepSeek
 */

import { type ImageProvider, resolveImageProviderOrder, getDefaultImageModel } from './style-intent-routing.ts';
import { ACTIVE_MODELS } from './model-versions.ts';

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

const keys = {
  gemini: () => getKey('GEMINI_API_KEY', 'GOOGLE_API_KEY'),
  vertexSA: () => getKey('GOOGLE_VERTEX_SERVICE_ACCOUNT'),
  openai: () => getKey('OPENAI_API_KEY'),
  alibabaSG: () => getKey('ALIBABA_SINGAPORE_API_KEY'),
  alibabaVA: () => getKey('ALIBABA_API_KEY'),
  modelslab: () => getKey('MODELSLAB_API_KEY'),
  huggingface: () => getKey('HUGGING_FACE_ACCESS_TOKEN'),
  replicate: () => getKey('REPLICATE_API_TOKEN', 'REPLICATE_API_KEY'),
  deepseek: () => getKey('DEEPSEEK_API_KEY'),
};

// ============================================================================
// PROVIDER AVAILABILITY
// ============================================================================

export function isImageProviderAvailable(provider: string): boolean {
  switch (provider) {
    case 'gemini': return !!keys.gemini();
    case 'vertex-imagen': return !!keys.vertexSA();
    case 'openai': return !!keys.openai();
    case 'alibaba': return !!(keys.alibabaSG() || keys.alibabaVA());
    case 'modelslab': return !!keys.modelslab();
    case 'huggingface': return !!keys.huggingface();
    case 'replicate': return !!keys.replicate();
    case 'deepseek': return !!keys.deepseek();
    default: return false;
  }
}

// ============================================================================
// UNIFIED IMAGE GENERATION ENTRY POINT
// ============================================================================

export interface ImageGenOptions {
  model?: string;
  size?: string;
  quality?: string;
  output_format?: string;
  negative_prompt?: string;
  style?: string;
  aspectRatio?: string;
  ref_image_url?: string;
}

export interface ImageGenResult {
  imageUrl: string;
  provider: string;
  model: string;
  success: boolean;
  providerChain: string[];
}

/**
 * Generate an image using style-intent-based provider routing with automatic fallback.
 * This is the primary entry point for all image generation across edge functions.
 */
export async function generateImageWithRouting(
  prompt: string,
  styleIntent?: string,
  explicitProvider?: string,
  options: ImageGenOptions = {}
): Promise<ImageGenResult> {
  const providerOrder = resolveImageProviderOrder(
    styleIntent, explicitProvider, isImageProviderAvailable
  );

  console.log(`🎨 [ImageProviders] Style: ${styleIntent || 'default'}, Chain: [${providerOrder.join(' → ')}]`);

  if (providerOrder.length === 0) {
    throw new Error('No image generation providers available. Configure at least one API key.');
  }

  let lastError: Error | null = null;

  for (const provider of providerOrder) {
    try {
      console.log(`🎨 [ImageProviders] Trying: ${provider}`);
      const imageUrl = await generateWithProvider(provider, prompt, options);
      console.log(`✅ [ImageProviders] Success: ${provider}`);
      return {
        imageUrl,
        provider,
        model: options.model || getDefaultImageModel(provider),
        success: true,
        providerChain: providerOrder,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`⚠️ [ImageProviders] ${provider} failed: ${lastError.message}`);
    }
  }

  throw lastError || new Error('All image providers failed');
}

// ============================================================================
// PROVIDER DISPATCH
// ============================================================================

async function generateWithProvider(
  provider: ImageProvider, prompt: string, options: ImageGenOptions
): Promise<string> {
  switch (provider) {
    case 'gemini': return generateWithGemini(prompt, options);
    case 'vertex-imagen': return generateWithVertexImagen(prompt, options);
    case 'openai': return generateWithOpenAI(prompt, options);
    case 'alibaba': return generateWithAlibaba(prompt, options);
    case 'modelslab': return generateWithModelsLab(prompt, options);
    case 'huggingface': return generateWithHuggingFace(prompt, options);
    case 'replicate': return generateWithReplicate(prompt, options);
    case 'deepseek': return generateWithDeepSeek(prompt, options);
    default: throw new Error(`Unsupported image provider: ${provider}`);
  }
}

// ============================================================================
// GEMINI (Imagen via Gemini API)
// ============================================================================

async function generateWithGemini(prompt: string, options: ImageGenOptions): Promise<string> {
  const apiKey = keys.gemini();
  if (!apiKey) throw new Error('Gemini key missing');
  // Only use passed model if it's a Gemini/Imagen model; otherwise use default
  const isGeminiModel = options.model && (options.model.startsWith('gemini') || options.model.startsWith('imagen'));
  const model = isGeminiModel ? options.model! : ACTIVE_MODELS.image.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], responseMimeType: 'text/plain' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini Error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  for (const part of (data.candidates?.[0]?.content?.parts || [])) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error('No image returned from Gemini');
}

// ============================================================================
// VERTEX AI IMAGEN 3.0
// ============================================================================

async function generateWithVertexImagen(prompt: string, options: ImageGenOptions): Promise<string> {
  const saJson = keys.vertexSA();
  if (!saJson) throw new Error('Vertex service account missing');

  const sa = JSON.parse(saJson);
  const token = await getVertexAccessToken(sa);
  const projectId = sa.project_id;
  const model = options.model || ACTIVE_MODELS.image.vertexImagen;
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`;

  const [w, h] = (options.size || '1024x1024').split('x').map(Number);
  let aspectRatio = '1:1';
  if (w > h) aspectRatio = '16:9';
  else if (h > w) aspectRatio = '9:16';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: options.aspectRatio || aspectRatio },
    }),
  });

  if (!response.ok) {
    throw new Error(`Vertex Imagen Error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (b64) return `data:image/png;base64,${b64}`;
  throw new Error('No image returned from Vertex Imagen');
}

async function getVertexAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));

  const signInput = `${header}.${payload}`;
  const keyData = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(signInput));
  const sig64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${payload}.${sig64}`,
  });

  if (!tokenResp.ok) throw new Error(`Vertex auth failed: ${tokenResp.status}`);
  return (await tokenResp.json()).access_token;
}

// ============================================================================
// OPENAI (DALL-E / GPT Image)
// ============================================================================

async function generateWithOpenAI(prompt: string, options: ImageGenOptions): Promise<string> {
  const apiKey = keys.openai();
  if (!apiKey) throw new Error('OpenAI key missing');
  // Only use passed model if it's an OpenAI model; otherwise use default
  const isOpenAIModel = options.model && (options.model.startsWith('dall-e') || options.model.startsWith('gpt-image'));
  const model = isOpenAIModel ? options.model! : ACTIVE_MODELS.image.openai;

  const body: any = { model, prompt, n: 1, size: options.size || '1024x1024' };
  if (model === 'gpt-image-1') {
    body.quality = options.quality || 'high';
    body.output_format = options.output_format || 'png';
  } else {
    body.response_format = 'url';
    if (model === 'dall-e-3') body.quality = options.quality === 'high' ? 'hd' : 'standard';
  }

  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) throw new Error(`OpenAI Error: ${resp.status} - ${await resp.text()}`);
  const data = await resp.json();
  
  if (model === 'gpt-image-1' && data.data[0].b64_json) {
    return `data:image/${options.output_format || 'png'};base64,${data.data[0].b64_json}`;
  }
  return data.data[0].url;
}

// ============================================================================
// ALIBABA WAN (Image Generation)
// ============================================================================

async function generateWithAlibaba(prompt: string, options: ImageGenOptions): Promise<string> {
  const apiKey = keys.alibabaSG() || keys.alibabaVA();
  if (!apiKey) throw new Error('Alibaba key missing');
  const model = options.model || ACTIVE_MODELS.image.alibaba;
  const endpoint = 'https://dashscope-intl.aliyuncs.com';

  const sizeMap: Record<string, string> = {
    '16:9': '1280*720', '9:16': '720*1280', '1:1': '1024*1024',
  };
  const ar = options.aspectRatio || '16:9';
  // Accept explicit size (convert 'x' to '*' for DashScope format) or derive from aspect ratio
  const size = options.size
    ? options.size.replace('x', '*')
    : (sizeMap[ar] || '1280*720');

  const isWan26 = model.includes('wan2.6');
  const apiPath = isWan26
    ? '/api/v1/services/aigc/multimodal-generation/generation'
    : '/api/v1/services/aigc/text2image/image-synthesis';

  // Build message content — include reference image for image-to-image when provided
  const messageContent: Array<Record<string, string>> = [];
  if (options.ref_image_url && isWan26) {
    messageContent.push({ image: options.ref_image_url });
    console.log(`[Alibaba-Image] Using reference image for i2i: ${options.ref_image_url.substring(0, 80)}...`);
  }
  messageContent.push({ text: prompt });

  const body = isWan26 ? {
    model: 'wan2.6-t2i',
    input: { messages: [{ role: 'user', content: messageContent }] },
    parameters: { size, n: 1 },
  } : {
    model, input: { prompt },
    parameters: { size, n: 1, style: options.style },
  };

  // Use SYNCHRONOUS mode (no X-DashScope-Async header).
  // The API key does not support async calls (403 AccessDenied).
  // Synchronous calls block until the image is ready (~10-30s for t2i).
  const response = await fetch(`${endpoint}${apiPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[Alibaba-Image] Submit failed ${response.status}: ${errText}`);
    throw new Error(`Alibaba Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  console.log(`[Alibaba-Image] Response keys: ${JSON.stringify(Object.keys(data))}, output keys: ${JSON.stringify(Object.keys(data.output || {}))}`);

  // Synchronous multimodal-generation response: choices[].message.content[].image
  const choices = data.output?.choices;
  if (choices?.length > 0) {
    for (const choice of choices) {
      const contentParts = choice?.message?.content || [];
      for (const part of contentParts) {
        if (part.image) return part.image;
      }
    }
  }

  // Older text2image synchronous response: results[].url
  const directUrl = data.output?.results?.[0]?.url;
  if (directUrl) return directUrl;

  // If somehow we got a task_id (async response), poll for it
  const taskId = data.output?.task_id;
  if (taskId) {
    console.log(`[Alibaba-Image] Got async task_id: ${taskId}, polling...`);
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`${endpoint}/api/v1/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      const statusData = await statusRes.json();
      const status = statusData.output?.task_status;
      if (status === 'SUCCEEDED') {
        const url = statusData.output?.results?.[0]?.url;
        if (url) return url;
        throw new Error('Alibaba: no image URL in result');
      }
      if (status === 'FAILED') throw new Error(`Alibaba task failed: ${JSON.stringify(statusData.output)}`);
    }
    throw new Error('Alibaba: timeout');
  }

  throw new Error(`Alibaba: unexpected response format. Response: ${JSON.stringify(data).slice(0, 300)}`);
}

// ============================================================================
// MODELSLAB (FLUX, Stable Diffusion)
// ============================================================================

async function generateWithModelsLab(prompt: string, options: ImageGenOptions): Promise<string> {
  const apiKey = keys.modelslab();
  if (!apiKey) throw new Error('ModelsLab key missing');
  const [width, height] = (options.size || '1024x1024').split('x').map(Number);
  const model = options.model || ACTIVE_MODELS.image.flux;

  const response = await fetch('https://modelslab.com/api/v6/images/text2img', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: apiKey, model_id: model, prompt,
      width, height, samples: 1, safety_checker: true,
      negative_prompt: options.negative_prompt,
    }),
  });

  if (!response.ok) throw new Error(`ModelsLab Error: ${response.status} - ${await response.text()}`);
  const data = await response.json();

  if (data.status === 'processing' && data.fetch_result) {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const poll = await fetch(data.fetch_result, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey }),
      });
      const pData = await poll.json();
      if (pData.status === 'success' && pData.output?.length > 0) return pData.output[0];
      if (pData.status === 'failed') throw new Error(`ModelsLab failed: ${pData.message}`);
    }
    throw new Error('ModelsLab timed out');
  }
  if (data.output?.length > 0) return data.output[0];
  throw new Error('No image from ModelsLab');
}

// ============================================================================
// HUGGINGFACE (FLUX)
// ============================================================================

async function generateWithHuggingFace(prompt: string, options: ImageGenOptions): Promise<string> {
  const token = keys.huggingface();
  if (!token) throw new Error('HuggingFace token missing');

  // HuggingFace Pro subscription — use FLUX.1-schnell as primary via Pro Router API
  const candidateModels = [
    options.model,
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
  ].filter(Boolean) as string[];
  const models = [...new Set(candidateModels)];

  let lastResp: Response | null = null;
  for (const model of models) {
    // Use the Pro Router API endpoint (requires HF Pro subscription)
    const endpoint = `https://router.huggingface.co/hf-inference/models/${model}`;
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'x-wait-for-model': 'true' },
        body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4, guidance_scale: 3.5 } }),
      });
      if (resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('image') || contentType.includes('octet-stream')) {
          const buf = await resp.arrayBuffer();
          if (buf.byteLength > 100) {
            // Chunk-based base64 to avoid stack overflow on large images
            const bytes = new Uint8Array(buf);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
            }
            return `data:image/png;base64,${btoa(binary)}`;
          }
        }
        // If response is JSON (e.g. queued), treat as not ready
        await resp.text().catch(() => {});
        console.warn(`[ImageProviders] HF model ${model} returned non-image content, trying next...`);
        continue;
      }
      lastResp = resp;
      const errBody = await resp.text().catch(() => '');
      console.warn(`[ImageProviders] HF model ${model} returned ${resp.status}: ${errBody.slice(0, 200)}, trying next...`);
    } catch (e) {
      console.warn(`[ImageProviders] HF model ${model} fetch error: ${e}`);
    }
  }

  const statusText = lastResp ? `${lastResp.status}` : 'no response';
  throw new Error(`HuggingFace Error: ${statusText} - All models exhausted`);
}

// ============================================================================
// REPLICATE (FLUX)
// ============================================================================

async function generateWithReplicate(prompt: string, options: ImageGenOptions): Promise<string> {
  const token = keys.replicate();
  if (!token) throw new Error('Replicate key missing');
  const model = options.model || ACTIVE_MODELS.image.replicateFlux;

  const versionMap: Record<string, string> = {
    'black-forest-labs/flux-schnell': 'f2ab8a5bfe79f02f0789a146cf5e73d2a4ff2684a98c2b303d1e382c43c8735f',
    'stability-ai/sdxl': '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  };

  const resp = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: versionMap[model] || versionMap['black-forest-labs/flux-schnell'],
      input: { prompt, num_outputs: 1, aspect_ratio: options.aspectRatio || '1:1' },
    }),
  });

  if (!resp.ok) throw new Error(`Replicate Error: ${resp.status} - ${await resp.text()}`);
  const data = await resp.json();

  // Poll for completion
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const pollResp = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
      headers: { 'Authorization': `Token ${token}` },
    });
    const pollData = await pollResp.json();
    if (pollData.status === 'succeeded' && pollData.output?.length > 0) return pollData.output[0];
    if (pollData.status === 'failed') throw new Error(`Replicate failed: ${pollData.error}`);
  }
  throw new Error('Replicate: timeout');
}

// ============================================================================
// DEEPSEEK (Technical diagrams, CJK specialist)
// ============================================================================

async function generateWithDeepSeek(prompt: string, options: ImageGenOptions): Promise<string> {
  const apiKey = keys.deepseek();
  if (!apiKey) throw new Error('DeepSeek key missing');

  // DeepSeek doesn't have native image gen — use its vision+text to create SVG/diagram descriptions
  // then fall through to Gemini. For now, throw to trigger fallback.
  throw new Error('DeepSeek image generation: delegating to fallback provider');
}
