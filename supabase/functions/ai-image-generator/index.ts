import { corsHeaders } from '../_shared/cors.ts';

// ============================================================================
// API KEYS
// ============================================================================
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY');
const ALIBABA_SG_KEY = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
const ALIBABA_VA_KEY = Deno.env.get('ALIBABA_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
const GOOGLE_VERTEX_SA = Deno.env.get('GOOGLE_VERTEX_SERVICE_ACCOUNT');

// ============================================================================
// STYLE-INTENT → IMAGE PROVIDER ROUTING
// Mirrors src/services/styleIntentResolver.ts STYLE_TO_IMAGE_PROVIDER
// ============================================================================

type StyleIntent = 
  | 'photorealistic' | 'cinematic' | 'anime' | 'pixar-3d'
  | 'watercolor' | 'minimalist' | 'corporate' | 'editorial'
  | 'product-hero' | 'lifestyle' | 'documentary' | 'explainer'
  | 'ugc-authentic' | 'luxury-fashion' | 'tech-startup';

interface ProviderChain {
  primary: string;
  secondary: string;
  tertiary: string;
  fallback: string;
}

const STYLE_TO_IMAGE_PROVIDER: Record<StyleIntent, ProviderChain> = {
  'photorealistic': { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'cinematic':      { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'anime':          { primary: 'modelslab', secondary: 'alibaba', tertiary: 'replicate', fallback: 'huggingface' },
  'pixar-3d':       { primary: 'alibaba', secondary: 'modelslab', tertiary: 'gemini', fallback: 'openai' },
  'watercolor':     { primary: 'modelslab', secondary: 'gemini', tertiary: 'alibaba', fallback: 'openai' },
  'minimalist':     { primary: 'gemini', secondary: 'modelslab', tertiary: 'huggingface', fallback: 'openai' },
  'corporate':      { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'editorial':      { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'product-hero':   { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'lifestyle':      { primary: 'modelslab', secondary: 'gemini', tertiary: 'replicate', fallback: 'openai' },
  'documentary':    { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'explainer':      { primary: 'gemini', secondary: 'modelslab', tertiary: 'huggingface', fallback: 'openai' },
  'ugc-authentic':  { primary: 'modelslab', secondary: 'gemini', tertiary: 'alibaba', fallback: 'openai' },
  'luxury-fashion': { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'tech-startup':   { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
};

// Default chain when no style_intent is provided
const DEFAULT_CHAIN: ProviderChain = {
  primary: 'gemini', secondary: 'alibaba', tertiary: 'modelslab', fallback: 'huggingface'
};

// ============================================================================
// PROVIDER AVAILABILITY CHECK
// ============================================================================

function isProviderAvailable(provider: string): boolean {
  switch (provider) {
    case 'gemini': return !!GEMINI_API_KEY;
    case 'vertex-imagen': return !!GOOGLE_VERTEX_SA;
    case 'openai': return !!OPENAI_API_KEY;
    case 'alibaba': return !!(ALIBABA_SG_KEY || ALIBABA_VA_KEY);
    case 'modelslab': return !!MODELSLAB_API_KEY;
    case 'huggingface': return !!HUGGING_FACE_TOKEN;
    case 'replicate': return !!REPLICATE_API_KEY;
    default: return false;
  }
}

function resolveProviderOrder(styleIntent?: string, explicitProvider?: string): string[] {
  // If explicit provider requested, try it first then fall through chain
  const chain = (styleIntent && STYLE_TO_IMAGE_PROVIDER[styleIntent as StyleIntent]) 
    ? STYLE_TO_IMAGE_PROVIDER[styleIntent as StyleIntent] 
    : DEFAULT_CHAIN;

  const ordered = explicitProvider
    ? [explicitProvider, chain.primary, chain.secondary, chain.tertiary, chain.fallback]
    : [chain.primary, chain.secondary, chain.tertiary, chain.fallback];

  // Deduplicate and filter to available
  const seen = new Set<string>();
  return ordered.filter(p => {
    if (seen.has(p)) return false;
    seen.add(p);
    return isProviderAvailable(p);
  });
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      provider: explicitProvider,
      style_intent,
      region,
      model,
      size = '1024x1024',
      quality = 'high',
      output_format = 'png',
      negative_prompt,
      style,
      ref_image_url,
    } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const providerOrder = resolveProviderOrder(style_intent, explicitProvider);

    console.log(`🎨 [AI Image] Style: ${style_intent || 'default'}, Region: ${region || 'global'}, Chain: [${providerOrder.join(' → ')}]`);

    if (providerOrder.length === 0) {
      throw new Error('No image generation providers available. Configure at least one API key.');
    }

    const options = { size, quality, output_format, negative_prompt, style, ref_image_url, model };
    let lastError: Error | null = null;

    for (const provider of providerOrder) {
      try {
        console.log(`🎨 [AI Image] Trying: ${provider}`);
        const imageUrl = await generateImage(provider, prompt, options);
        
        console.log(`✅ [AI Image] Success: ${provider}`);
        return new Response(JSON.stringify({ 
          imageUrl,
          mediaUrl: imageUrl,
          success: true,
          provider,
          model: options.model || getDefaultModel(provider),
          metadata: {
            prompt,
            size,
            quality,
            output_format,
            style_intent: style_intent || 'default',
            region: region || 'global',
            provider_chain: providerOrder,
            timestamp: new Date().toISOString(),
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`⚠️ [AI Image] ${provider} failed: ${lastError.message}`);
      }
    }

    throw lastError || new Error('All image providers failed');

  } catch (error) {
    console.error('AI Image Generator Error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error instanceof Error ? error.message : 'Image generation failed'),
        details: String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// UNIFIED DISPATCH
// ============================================================================

async function generateImage(
  provider: string, prompt: string,
  options: { model?: string; size?: string; quality?: string; output_format?: string;
    negative_prompt?: string; style?: string; ref_image_url?: string }
): Promise<string> {
  switch (provider) {
    case 'gemini':
      return generateWithGemini(prompt, options.model, options.size);
    case 'vertex-imagen':
      return generateWithVertexImagen(prompt, options.size);
    case 'openai':
      if (!OPENAI_API_KEY) throw new Error('OpenAI key missing');
      return generateWithOpenAI(prompt, options.model || 'gpt-image-1', options.size || '1024x1024', options.quality || 'high', options.output_format || 'png');
    case 'huggingface':
      if (!HUGGING_FACE_TOKEN) throw new Error('HuggingFace token missing');
      return generateWithHuggingFace(prompt, options.model || 'black-forest-labs/FLUX.1-schnell');
    case 'replicate':
      if (!REPLICATE_API_KEY) throw new Error('Replicate key missing');
      return generateWithReplicate(prompt, options.model || 'black-forest-labs/flux-schnell');
    case 'alibaba': {
      const key = ALIBABA_SG_KEY || ALIBABA_VA_KEY;
      if (!key) throw new Error('Alibaba key missing');
      return generateWithAlibaba(prompt, options.model || 'wan2.1-t2i-turbo', key, options);
    }
    case 'modelslab':
      if (!MODELSLAB_API_KEY) throw new Error('ModelsLab key missing');
      return generateWithModelsLab(prompt, options.model || 'flux', options.size);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// ============================================================================
// GEMINI (Imagen via Gemini API)
// ============================================================================

async function generateWithGemini(prompt: string, model?: string, size?: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('Gemini key missing');
  const geminiModel = model || 'gemini-2.0-flash-exp';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`;

  console.log(`🌟 [Gemini] Model: ${geminiModel}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], responseMimeType: 'text/plain' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error('No image returned from Gemini');
}

// ============================================================================
// VERTEX AI IMAGEN 3.0
// ============================================================================

async function generateWithVertexImagen(prompt: string, size?: string): Promise<string> {
  if (!GOOGLE_VERTEX_SA) throw new Error('Vertex service account missing');

  const sa = JSON.parse(GOOGLE_VERTEX_SA);
  const token = await getVertexAccessToken(sa);
  const projectId = sa.project_id;
  const model = 'imagen-3.0-generate-002';
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`;

  console.log(`🖼️ [Vertex Imagen] Model: ${model}`);

  // Parse aspect ratio from size
  const [w, h] = (size || '1024x1024').split('x').map(Number);
  let aspectRatio = '1:1';
  if (w > h) aspectRatio = '16:9';
  else if (h > w) aspectRatio = '9:16';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Vertex Imagen Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (b64) return `data:image/png;base64,${b64}`;
  throw new Error('No image returned from Vertex Imagen');
}

// JWT for Vertex AI
async function getVertexAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
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

  const jwt = `${header}.${payload}.${sig64}`;

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResp.ok) throw new Error(`Vertex auth failed: ${tokenResp.status}`);
  const tokenData = await tokenResp.json();
  return tokenData.access_token;
}

// ============================================================================
// MODELSLAB (FLUX, Stable Diffusion)
// ============================================================================

async function generateWithModelsLab(prompt: string, model: string, size?: string): Promise<string> {
  const [width, height] = (size || '1024x1024').split('x').map(Number);
  console.log(`🔮 [ModelsLab] Model: ${model}, Size: ${width}x${height}`);

  const response = await fetch('https://modelslab.com/api/v6/images/text2img', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: MODELSLAB_API_KEY, model_id: model, prompt,
      width, height, samples: 1, safety_checker: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ModelsLab Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  if (data.status === 'processing' && data.fetch_result) {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const poll = await fetch(data.fetch_result, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: MODELSLAB_API_KEY }),
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
// OPENAI (DALL-E / GPT Image)
// ============================================================================

async function generateWithOpenAI(prompt: string, model: string, size: string, quality: string, output_format: string): Promise<string> {
  const body: any = { model, prompt, n: 1, size };
  if (model === 'gpt-image-1') {
    body.quality = quality;
    body.output_format = output_format;
  } else {
    body.response_format = 'url';
    if (model === 'dall-e-3') body.quality = quality === 'high' ? 'hd' : 'standard';
  }

  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI Error: ${resp.status} - ${errText}`);
  }

  const data = await resp.json();
  if (model === 'gpt-image-1') {
    return data.data[0].b64_json ? `data:image/${output_format};base64,${data.data[0].b64_json}` : data.data[0].url;
  }
  return data.data[0].url;
}

// ============================================================================
// HUGGINGFACE (FLUX)
// ============================================================================

async function generateWithHuggingFace(prompt: string, model: string): Promise<string> {
  const resp = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4, guidance_scale: 1.0 } }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`HuggingFace Error: ${resp.status} - ${errText}`);
  }
  const buf = await resp.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `data:image/png;base64,${b64}`;
}

// ============================================================================
// REPLICATE (FLUX)
// ============================================================================

async function generateWithReplicate(prompt: string, model: string): Promise<string> {
  const resp = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Token ${REPLICATE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: getReplicateVersion(model),
      input: { prompt, go_fast: true, megapixels: '1', num_outputs: 1, aspect_ratio: '1:1', output_format: 'webp', output_quality: 80, num_inference_steps: 4 },
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Replicate Error: ${resp.status} - ${errText}`);
  }

  let result = await resp.json();
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(r => setTimeout(r, 1000));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` },
    });
    result = await poll.json();
  }
  if (result.status === 'failed') throw new Error(`Replicate failed: ${result.error}`);
  return result.output[0];
}

// ============================================================================
// ALIBABA WAN T2I
// ============================================================================

async function generateWithAlibaba(
  prompt: string, model: string, apiKey: string,
  options: { size?: string; negative_prompt?: string; style?: string; ref_image_url?: string }
): Promise<string> {
  const baseUrl = 'https://dashscope-intl.aliyuncs.com/api/v1';
  const [width, height] = (options.size || '1024x1024').split('x').map(Number);

  console.log(`🌸 [Alibaba T2I] Model: ${model}`);

  const resp = await fetch(`${baseUrl}/services/aigc/text2image/image-synthesis`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-DashScope-Async': 'enable' },
    body: JSON.stringify({
      model,
      input: { prompt, ...(options.negative_prompt && { negative_prompt: options.negative_prompt }), ...(options.ref_image_url && { ref_img: options.ref_image_url }) },
      parameters: { size: `${width}*${height}`, n: 1, ...(options.style && { style: options.style }) },
    }),
  });

  if (!resp.ok) { const t = await resp.text(); throw new Error(`Alibaba T2I Error: ${resp.status} - ${t}`); }

  const result = await resp.json();
  const taskId = result.output?.task_id;
  if (!taskId) throw new Error('No task ID from Alibaba');

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const poll = await fetch(`${baseUrl}/tasks/${taskId}`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    if (!poll.ok) continue;
    const s = await poll.json();
    if (s.output?.task_status === 'SUCCEEDED') {
      const r = s.output?.results;
      if (r?.length > 0) return r[0].url || r[0].b64_image;
      throw new Error('No image in Alibaba response');
    }
    if (s.output?.task_status === 'FAILED') throw new Error(`Alibaba failed: ${s.output?.message}`);
  }
  throw new Error('Alibaba T2I timed out');
}

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultModel(provider: string): string {
  const map: Record<string, string> = {
    'gemini': 'gemini-2.0-flash-exp',
    'vertex-imagen': 'imagen-3.0-generate-002',
    'openai': 'gpt-image-1',
    'huggingface': 'black-forest-labs/FLUX.1-schnell',
    'replicate': 'black-forest-labs/flux-schnell',
    'alibaba': 'wan2.1-t2i-turbo',
    'modelslab': 'flux',
  };
  return map[provider] || 'gemini-2.0-flash-exp';
}

function getReplicateVersion(model: string): string {
  const map: Record<string, string> = {
    'black-forest-labs/flux-schnell': 'f2ab8a5569070ad23ec7c3df5b2e7b5a56f81b0afe2c3a1bb6bbf44eef2ab95e',
  };
  return map[model] || map['black-forest-labs/flux-schnell'];
}
