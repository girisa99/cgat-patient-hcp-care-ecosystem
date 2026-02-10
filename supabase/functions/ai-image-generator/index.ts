import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const ALIBABA_SG_KEY = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
const ALIBABA_VA_KEY = Deno.env.get('ALIBABA_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      provider = 'openai',
      model,
      size = '1024x1024',
      quality = 'high',
      output_format = 'png',
      // Alibaba-specific params
      negative_prompt,
      style,
      ref_image_url,
    } = await req.json();

    console.log('AI Image Generator:', { provider, model, promptLength: prompt?.length });

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    let imageUrl: string;

    switch (provider) {
      case 'openai':
        if (!OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        imageUrl = await generateWithOpenAI(prompt, model || 'gpt-image-1', size, quality, output_format);
        break;

      case 'huggingface':
        if (!HUGGING_FACE_TOKEN) {
          throw new Error('HuggingFace token not configured');
        }
        imageUrl = await generateWithHuggingFace(prompt, model || 'black-forest-labs/FLUX.1-schnell');
        break;

      case 'replicate':
        if (!REPLICATE_API_KEY) {
          throw new Error('Replicate API key not configured');
        }
        imageUrl = await generateWithReplicate(prompt, model || 'black-forest-labs/flux-schnell');
        break;

      case 'alibaba':
      case 'alibaba-wan': {
        const alibabaKey = ALIBABA_SG_KEY || ALIBABA_VA_KEY;
        if (!alibabaKey) {
          throw new Error('Alibaba API key not configured (ALIBABA_SINGAPORE_API_KEY or ALIBABA_API_KEY)');
        }
        const alibabaModel = model || 'wan2.1-t2i-turbo';
        imageUrl = await generateWithAlibaba(prompt, alibabaModel, alibabaKey, {
          size, negative_prompt, style, ref_image_url
        });
        break;
      }

      case 'alibaba-qwen':
      case 'qwen-image': {
        const qwenKey = ALIBABA_SG_KEY || ALIBABA_VA_KEY;
        if (!qwenKey) {
          throw new Error('Alibaba API key not configured for Qwen Image');
        }
        imageUrl = await generateWithQwenImage(prompt, qwenKey, { ref_image_url });
        break;
      }

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(JSON.stringify({ 
      imageUrl,
      mediaUrl: imageUrl,
      success: true,
      provider,
      model: model || getDefaultModel(provider),
      metadata: {
        prompt,
        size,
        quality,
        output_format,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

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

async function generateWithOpenAI(
  prompt: string, 
  model: string, 
  size: string, 
  quality: string, 
  output_format: string
): Promise<string> {
  const requestBody: any = {
    model,
    prompt,
    n: 1,
    size
  };

  // Add gpt-image-1 specific parameters
  if (model === 'gpt-image-1') {
    requestBody.quality = quality;
    requestBody.output_format = output_format;
    // gpt-image-1 always returns base64
  } else {
    // For DALL-E models
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
    // gpt-image-1 returns base64 data
    return data.data[0].b64_json ? `data:image/${output_format};base64,${data.data[0].b64_json}` : data.data[0].url;
  } else {
    // DALL-E models return URLs
    return data.data[0].url;
  }
}

async function generateWithHuggingFace(prompt: string, model: string): Promise<string> {
  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        num_inference_steps: 4,
        guidance_scale: 1.0
      }
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
  
  // Poll for completion
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
      },
    });
    
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Replicate generation failed: ${result.error}`);
  }

  return result.output[0]; // Return the image URL
}

function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'openai': return 'gpt-image-1';
    case 'huggingface': return 'black-forest-labs/FLUX.1-schnell';
    case 'replicate': return 'black-forest-labs/flux-schnell';
    case 'alibaba': case 'alibaba-wan': return 'wan2.1-t2i-turbo';
    case 'alibaba-qwen': case 'qwen-image': return 'qwen-image-edit';
    default: return 'gpt-image-1';
  }
}

function getReplicateVersion(model: string): string {
  const versionMap: Record<string, string> = {
    'black-forest-labs/flux-schnell': 'f2ab8a5569070ad23ec7c3df5b2e7b5a56f81b0afe2c3a1bb6bbf44eef2ab95e'
  };
  return versionMap[model] || versionMap['black-forest-labs/flux-schnell'];
}

// ============================================================================
// ALIBABA WAN T2I (Text-to-Image) - Singapore/Virginia
// ============================================================================

async function generateWithAlibaba(
  prompt: string,
  model: string,
  apiKey: string,
  options: { size?: string; negative_prompt?: string; style?: string; ref_image_url?: string }
): Promise<string> {
  const baseUrl = 'https://dashscope-intl.aliyuncs.com/api/v1';
  const endpoint = `${baseUrl}/services/aigc/text2image/image-synthesis`;

  console.log(`🌸 [Alibaba T2I] Model: ${model}, Endpoint: ${endpoint}`);

  // Parse size to width/height
  const [width, height] = (options.size || '1024x1024').split('x').map(Number);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: model,
      input: {
        prompt: prompt,
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

  if (!taskId) {
    throw new Error('No task ID returned from Alibaba T2I');
  }

  // Poll for completion
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
      if (results && results.length > 0) {
        return results[0].url || results[0].b64_image;
      }
      throw new Error('No image in Alibaba T2I response');
    } else if (statusData.output?.task_status === 'FAILED') {
      throw new Error(`Alibaba T2I failed: ${statusData.output?.message || 'Unknown error'}`);
    }
  }

  throw new Error('Alibaba T2I generation timed out');
}

// ============================================================================
// ALIBABA QWEN IMAGE EDIT - Singapore/Virginia
// ============================================================================

async function generateWithQwenImage(
  prompt: string,
  apiKey: string,
  options: { ref_image_url?: string }
): Promise<string> {
  const baseUrl = 'https://dashscope-intl.aliyuncs.com/api/v1';
  const endpoint = `${baseUrl}/services/aigc/image2image/image-synthesis`;

  console.log(`🎨 [Qwen Image Edit] Endpoint: ${endpoint}`);

  const payload: any = {
    model: 'wanx2.1-imageedit',
    input: {
      prompt: prompt,
    },
    parameters: {
      n: 1,
    },
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

  if (!taskId) {
    throw new Error('No task ID returned from Qwen Image');
  }

  // Poll for completion
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
      if (results && results.length > 0) {
        return results[0].url || results[0].b64_image;
      }
      throw new Error('No image in Qwen Image response');
    } else if (statusData.output?.task_status === 'FAILED') {
      throw new Error(`Qwen Image failed: ${statusData.output?.message || 'Unknown error'}`);
    }
  }

  throw new Error('Qwen Image generation timed out');
}