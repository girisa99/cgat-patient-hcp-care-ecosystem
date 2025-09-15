import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
      output_format = 'png'
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

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(JSON.stringify({ 
      imageUrl,
      mediaUrl: imageUrl, // For compatibility with universalMediaService
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
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('AI Image Generator Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Image generation failed',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
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
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
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
    default: return 'gpt-image-1';
  }
}

function getReplicateVersion(model: string): string {
  // Map model names to their Replicate versions
  const versionMap: Record<string, string> = {
    'black-forest-labs/flux-schnell': 'f2ab8a5569070ad23ec7c3df5b2e7b5a56f81b0afe2c3a1bb6bbf44eef2ab95e'
  };
  
  return versionMap[model] || versionMap['black-forest-labs/flux-schnell'];
}