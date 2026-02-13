import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY');
const ALIBABA_SG_KEY = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
const ALIBABA_VA_KEY = Deno.env.get('ALIBABA_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');

// ============================================================================
// PROVIDER FALLBACK CHAIN (matches platform routing architecture)
// Primary: Gemini → Alibaba → ModelsLab → HuggingFace → Replicate → OpenAI
// ============================================================================

const FALLBACK_CHAIN: string[] = [
  'gemini',
  'alibaba',
  'modelslab',
  'huggingface',
  'replicate',
  'openai',
];

function getAvailableProviders(): string[] {
  const available: string[] = [];
  if (GEMINI_API_KEY) available.push('gemini');
  if (ALIBABA_SG_KEY || ALIBABA_VA_KEY) available.push('alibaba');
  if (MODELSLAB_API_KEY) available.push('modelslab');
  if (HUGGING_FACE_TOKEN) available.push('huggingface');
  if (REPLICATE_API_KEY) available.push('replicate');
  if (OPENAI_API_KEY) available.push('openai');
  return available;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      provider: requestedProvider,
      model,
      size = '1024x1024',
      quality = 'high',
      output_format = 'png',
      negative_prompt,
      style,
      ref_image_url,
      use_fallback = true, // Enable fallback by default
    } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const availableProviders = getAvailableProviders();
    console.log(`🎨 [AI Image] Available providers: [${availableProviders.join(', ')}]`);

    // Build ordered provider list: requested first, then fallback chain
    let providerOrder: string[];
    if (requestedProvider && !use_fallback) {
      // Explicit provider, no fallback
      providerOrder = [requestedProvider];
    } else if (requestedProvider) {
      // Explicit provider + fallback chain
      providerOrder = [requestedProvider, ...FALLBACK_CHAIN.filter(p => p !== requestedProvider)];
    } else {
      // Default: use full fallback chain
      providerOrder = [...FALLBACK_CHAIN];
    }

    // Filter to only available providers
    providerOrder = providerOrder.filter(p => availableProviders.includes(p));

    if (providerOrder.length === 0) {
      throw new Error('No image generation providers configured. Please add API keys for at least one provider.');
    }

    console.log(`🎨 [AI Image] Provider order: [${providerOrder.join(' → ')}]`);

    const options = { size, quality, output_format, negative_prompt, style, ref_image_url, model };
    let lastError: Error | null = null;

    for (const provider of providerOrder) {
      try {
        console.log(`🎨 [AI Image] Trying provider: ${provider}`);
        const imageUrl = await generateImage(provider, prompt, options);
        
        console.log(`✅ [AI Image] Success with provider: ${provider}`);
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
            timestamp: new Date().toISOString(),
            fallback_used: provider !== (requestedProvider || FALLBACK_CHAIN[0]),
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`⚠️ [AI Image] Provider ${provider} failed: ${lastError.message}`);
        // Continue to next provider
      }
    }

    // All providers failed
    throw lastError || new Error('All image generation providers failed');

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
  provider: string, 
  prompt: string, 
  options: {
    model?: string; size?: string; quality?: string; output_format?: string;
    negative_prompt?: string; style?: string; ref_image_url?: string;
  }
): Promise<string> {
  switch (provider) {
    case 'gemini':
      return generateWithGemini(prompt, options.model, options.size);

    case 'openai':
      if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
      return generateWithOpenAI(prompt, options.model || 'gpt-image-1', options.size || '1024x1024', options.quality || 'high', options.output_format || 'png');

    case 'huggingface':
      if (!HUGGING_FACE_TOKEN) throw new Error('HuggingFace token not configured');
      return generateWithHuggingFace(prompt, options.model || 'black-forest-labs/FLUX.1-schnell');

    case 'replicate':
      if (!REPLICATE_API_KEY) throw new Error('Replicate API key not configured');
      return generateWithReplicate(prompt, options.model || 'black-forest-labs/flux-schnell');

    case 'alibaba':
    case 'alibaba-wan': {
      const alibabaKey = ALIBABA_SG_KEY || ALIBABA_VA_KEY;
      if (!alibabaKey) throw new Error('Alibaba API key not configured');
      return generateWithAlibaba(prompt, options.model || 'wan2.1-t2i-turbo', alibabaKey, options);
    }

    case 'alibaba-qwen':
    case 'qwen-image': {
      const qwenKey = ALIBABA_SG_KEY || ALIBABA_VA_KEY;
      if (!qwenKey) throw new Error('Alibaba API key not configured for Qwen Image');
      return generateWithQwenImage(prompt, qwenKey, { ref_image_url: options.ref_image_url });
    }

    case 'modelslab':
      if (!MODELSLAB_API_KEY) throw new Error('ModelsLab API key not configured');
      return generateWithModelsLab(prompt, options.model || 'flux', options.size);

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// ============================================================================
// GEMINI (Imagen) - Primary provider
// ============================================================================

async function generateWithGemini(prompt: string, model?: string, size?: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

  const geminiModel = model || 'gemini-2.0-flash-exp';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`;

  console.log(`🌟 [Gemini Image] Model: ${geminiModel}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `Generate an image: ${prompt}` }]
      }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        responseMimeType: 'text/plain',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini Image Error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  // Extract inline image data from Gemini response
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image returned from Gemini');
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
      key: MODELSLAB_API_KEY,
      model_id: model,
      prompt,
      width,
      height,
      samples: 1,
      safety_checker: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`ModelsLab Error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();

  if (data.status === 'processing' && data.fetch_result) {
    // Poll for result
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const pollResp = await fetch(data.fetch_result, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: MODELSLAB_API_KEY }),
      });
      const pollData = await pollResp.json();
      if (pollData.status === 'success' && pollData.output?.length > 0) {
        return pollData.output[0];
      }
      if (pollData.status === 'failed') {
        throw new Error(`ModelsLab generation failed: ${pollData.message || 'Unknown'}`);
      }
    }
    throw new Error('ModelsLab generation timed out');
  }

  if (data.output && data.output.length > 0) {
    return data.output[0];
  }

  throw new Error('No image returned from ModelsLab');
}

// ============================================================================
// OPENAI (DALL-E / GPT Image)
// ============================================================================

async function generateWithOpenAI(
  prompt: string, 
  model: string, 
  size: string, 
  quality: string, 
  output_format: string
): Promise<string> {
  const requestBody: any = { model, prompt, n: 1, size };

  if (model === 'gpt-image-1') {
    requestBody.quality = quality;
    requestBody.output_format = output_format;
  } else {
    requestBody.response_format = 'url';
    if (model === 'dall-e-3') {
      requestBody.quality = quality === 'high' ? 'hd' : 'standard';
    }
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  if (model === 'gpt-image-1') {
    return data.data[0].b64_json ? `data:image/${output_format};base64,${data.data[0].b64_json}` : data.data[0].url;
  }
  return data.data[0].url;
}

// ============================================================================
// HUGGINGFACE (FLUX)
// ============================================================================

async function generateWithHuggingFace(prompt: string, model: string): Promise<string> {
  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { num_inference_steps: 4, guidance_scale: 1.0 }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HuggingFace API Error: ${response.status} - ${errorData}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return `data:image/png;base64,${base64}`;
}

// ============================================================================
// REPLICATE (FLUX)
// ============================================================================

async function generateWithReplicate(prompt: string, model: string): Promise<string> {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: getReplicateVersion(model),
      input: {
        prompt,
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 80,
        num_inference_steps: 4
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Replicate API Error: ${response.status} - ${errorData}`);
  }

  const prediction = await response.json();
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Replicate generation failed: ${result.error}`);
  }

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
  const endpoint = `${baseUrl}/services/aigc/text2image/image-synthesis`;
  const [width, height] = (options.size || '1024x1024').split('x').map(Number);

  console.log(`🌸 [Alibaba T2I] Model: ${model}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model,
      input: {
        prompt,
        ...(options.negative_prompt && { negative_prompt: options.negative_prompt }),
        ...(options.ref_image_url && { ref_img: options.ref_image_url }),
      },
      parameters: {
        size: `${width}*${height}`,
        n: 1,
        ...(options.style && { style: options.style }),
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Alibaba T2I Error: ${response.status} - ${errorData}`);
  }

  const result = await response.json();
  const taskId = result.output?.task_id;
  if (!taskId) throw new Error('No task ID returned from Alibaba T2I');

  const statusUrl = `${baseUrl}/tasks/${taskId}`;
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(statusUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!pollResponse.ok) continue;
    const statusData = await pollResponse.json();

    if (statusData.output?.task_status === 'SUCCEEDED') {
      const results = statusData.output?.results;
      if (results?.length > 0) return results[0].url || results[0].b64_image;
      throw new Error('No image in Alibaba T2I response');
    } else if (statusData.output?.task_status === 'FAILED') {
      throw new Error(`Alibaba T2I failed: ${statusData.output?.message || 'Unknown error'}`);
    }
  }
  throw new Error('Alibaba T2I generation timed out');
}

// ============================================================================
// ALIBABA QWEN IMAGE EDIT
// ============================================================================

async function generateWithQwenImage(
  prompt: string, apiKey: string,
  options: { ref_image_url?: string }
): Promise<string> {
  const baseUrl = 'https://dashscope-intl.aliyuncs.com/api/v1';
  const endpoint = `${baseUrl}/services/aigc/image2image/image-synthesis`;

  const payload: any = {
    model: 'wanx2.1-imageedit',
    input: { prompt },
    parameters: { n: 1 },
  };
  if (options.ref_image_url) {
    payload.input.base_image_url = options.ref_image_url;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Qwen Image Error: ${response.status} - ${errorData}`);
  }

  const result = await response.json();
  const taskId = result.output?.task_id;
  if (!taskId) throw new Error('No task ID returned from Qwen Image');

  const statusUrl = `${baseUrl}/tasks/${taskId}`;
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(statusUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!pollResponse.ok) continue;
    const statusData = await pollResponse.json();

    if (statusData.output?.task_status === 'SUCCEEDED') {
      const results = statusData.output?.results;
      if (results?.length > 0) return results[0].url || results[0].b64_image;
      throw new Error('No image in Qwen Image response');
    } else if (statusData.output?.task_status === 'FAILED') {
      throw new Error(`Qwen Image failed: ${statusData.output?.message || 'Unknown error'}`);
    }
  }
  throw new Error('Qwen Image generation timed out');
}

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'gemini': return 'gemini-2.0-flash-exp';
    case 'openai': return 'gpt-image-1';
    case 'huggingface': return 'black-forest-labs/FLUX.1-schnell';
    case 'replicate': return 'black-forest-labs/flux-schnell';
    case 'alibaba': case 'alibaba-wan': return 'wan2.1-t2i-turbo';
    case 'alibaba-qwen': case 'qwen-image': return 'qwen-image-edit';
    case 'modelslab': return 'flux';
    default: return 'gemini-2.0-flash-exp';
  }
}

function getReplicateVersion(model: string): string {
  const versionMap: Record<string, string> = {
    'black-forest-labs/flux-schnell': 'f2ab8a5569070ad23ec7c3df5b2e7b5a56f81b0afe2c3a1bb6bbf44eef2ab95e'
  };
  return versionMap[model] || versionMap['black-forest-labs/flux-schnell'];
}
