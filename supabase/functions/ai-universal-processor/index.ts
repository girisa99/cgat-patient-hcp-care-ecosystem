import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  provider: 'openai' | 'claude' | 'gemini' | 'lovable';
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  action?: string;
  // Image generation parameters
  imageGeneration?: boolean;
  aspectRatio?: string;
  style?: string;
}

// Universal AI supported models registry
const UNIVERSAL_AI_REGISTRY = {
  llm: {
    openai: ['gpt-5-2025-08-07', 'gpt-4.1-2025-04-14', 'o3-2025-04-16', 'o4-mini-2025-04-16', 'gpt-4o', 'gpt-4o-mini'],
    claude: ['claude-opus-4-1-20250805', 'claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    gemini: ['gemini-2.0-flash-exp', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.0-flash']
  },
  image: {
    lovable: ['google/gemini-2.5-flash-image-preview', 'google/gemini-3-pro-image-preview'],
    openai: ['dall-e-3', 'dall-e-2'],
    stability: ['stable-diffusion-xl', 'stable-diffusion-3']
  },
  vision: {
    openai: ['gpt-4o', 'o4-mini-2025-04-16'],
    claude: ['claude-3-5-sonnet-20241022'],
    gemini: ['gemini-1.5-pro-latest', 'gemini-2.0-flash-exp']
  }
};

interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: any;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, model, prompt, systemPrompt, temperature = 0.7, maxTokens = 4000, action, imageGeneration, aspectRatio, style } = await req.json() as AIRequest;

    console.log(`[UniversalAI] Processing request - Provider: ${provider}, Model: ${model}, Action: ${action}, ImageGen: ${imageGeneration}`);

    // Lightweight actions that don't require full params
    if (action === 'health_check' || action === 'ping') {
      return new Response(JSON.stringify({ 
        ok: true, 
        status: 'ok', 
        available: true, 
        healthy: true, 
        success: true,
        provider: provider || 'system', 
        registry: UNIVERSAL_AI_REGISTRY,
        timestamp: new Date().toISOString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return registry info
    if (action === 'list_models') {
      return new Response(JSON.stringify({ 
        success: true,
        registry: UNIVERSAL_AI_REGISTRY,
        timestamp: new Date().toISOString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required parameters for generation requests
    if (!provider || !prompt) {
      throw new Error('Missing required parameters: provider or prompt');
    }

    let response;
    
    // Route to appropriate handler based on provider
    switch (provider) {
      case 'openai':
        response = await callOpenAI(model || 'gpt-4o-mini', prompt, systemPrompt, temperature, maxTokens);
        break;
      case 'claude':
        response = await callClaude(model || 'claude-3-5-haiku-20241022', prompt, systemPrompt, temperature, maxTokens);
        break;
      case 'gemini':
        response = await callGemini(model || 'gemini-2.0-flash', prompt, systemPrompt, temperature, maxTokens);
        break;
      case 'lovable':
        // Route through Lovable AI Gateway (for image generation or text)
        response = await callLovableAI(model || 'google/gemini-2.5-flash', prompt, systemPrompt, imageGeneration, aspectRatio, style);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}. Available: openai, claude, gemini, lovable`);
    }

    const aiResponse: AIResponse = {
      content: response.content,
      provider,
      model,
      usage: response.usage,
      timestamp: new Date().toISOString()
    };

    console.log(`AI response generated successfully - Provider: ${provider}, Content length: ${response.content.length}`);

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-universal-processor:', error);
    
    const errorResponse = {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.stack : 'Unknown error'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Normalize OpenAI model names to valid API model IDs
function normalizeOpenAIModel(model: string): string {
  const ml = model.toLowerCase();
  
  // Vision model mappings - gpt-5-vision doesn't exist, use gpt-4o which has vision
  if (ml.includes('gpt-5-vision') || ml.includes('gpt5-vision')) {
    return 'gpt-4o'; // GPT-4o has vision capabilities
  }
  // GPT-5 family - use stable dated versions
  if (ml === 'gpt-5' || ml.includes('gpt-5') && !ml.includes('mini') && !ml.includes('nano')) {
    return 'gpt-4o'; // Fall back to stable model
  }
  if (ml.includes('gpt-5-mini')) {
    return 'gpt-4o-mini';
  }
  if (ml.includes('gpt-5-nano')) {
    return 'gpt-4o-mini';
  }
  // Already valid models
  if (ml === 'gpt-4o' || ml === 'gpt-4o-mini') {
    return model;
  }
  // Default fallback
  return 'gpt-4o-mini';
}

async function callOpenAI(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your Edge Function secrets.');
  }

  // Normalize model to valid API ID
  const normalizedModel = normalizeOpenAIModel(model);
  console.log(`OpenAI model normalization: ${model} -> ${normalizedModel}`);

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  // Handle different model parameter requirements
  const requestBody: any = {
    model: normalizedModel,
    messages,
  };

  // Legacy models (gpt-4o family) use max_tokens and support temperature
  requestBody.max_tokens = maxTokens;
  requestBody.temperature = temperature;

  console.log(`Calling OpenAI API with model: ${normalizedModel}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`OpenAI API error (${response.status}):`, errorData);
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  };
}

async function callClaude(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('CLAUDE_API_KEY');
  if (!apiKey) {
    throw new Error('Claude API key not configured. Please add ANTHROPIC_API_KEY (or CLAUDE_API_KEY) to your Edge Function secrets.');
  }

  // Normalize Claude model names to valid API model IDs
  const normalizeModel = (m: string): string => {
    const ml = m.toLowerCase();
    
    // Claude 4 models - use latest stable versions
    if (ml.includes('claude-4-vision') || ml.includes('claude-sonnet-4') || ml.includes('claude-4')) {
      return 'claude-sonnet-4-20250514'; // Latest Claude 4 Sonnet
    }
    if (ml.includes('claude-opus-4')) {
      return 'claude-opus-4-5-20251101';
    }
    // Claude 3.5/3.7 models
    if (ml.includes('haiku-fast') || ml.includes('haiku')) {
      return 'claude-3-5-haiku-20241022';
    }
    if (ml === 'claude-3-5-sonnet' || ml === 'claude-3-5-sonnet-latest' || (ml.includes('sonnet') && !ml.match(/20\d{2}/))) {
      return 'claude-sonnet-4-20250514'; // Upgrade to Claude 4
    }
    // Already has dated version
    if (ml.match(/claude-.*-20\d{6}/)) {
      return m;
    }
    // Default fallback
    return 'claude-3-5-haiku-20241022';
  };

  let targetModel = normalizeModel(model);

  const buildBody = (mdl: string) => {
    const body: any = {
      model: mdl,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }]
    };
    if (systemPrompt) body.system = systemPrompt;
    return body;
  };

  const makeRequest = async (mdl: string) => {
    console.log(`Calling Claude API with model: ${mdl}`);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(buildBody(mdl)),
    });
    return response;
  };

  // First attempt
  let response = await makeRequest(targetModel);

  // If model not found (404), retry once with a stable fallback
  if (!response.ok && response.status === 404) {
    const errText = await response.text();
    console.error(`Claude API error (first attempt ${response.status}):`, errText);
    if (targetModel !== 'claude-3-5-haiku-20241022') {
      console.log('Retrying Claude call with fallback model: claude-3-5-haiku-20241022');
      targetModel = 'claude-3-5-haiku-20241022';
      response = await makeRequest(targetModel);
    }
  }

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Claude API error (${response.status}):`, errorData);
    throw new Error(`Claude API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.content?.[0]?.text || '',
    usage: data.usage
  };
}

// Normalize Gemini model names to valid API model IDs (updated for 2025+)
function normalizeGeminiModel(model: string): string {
  const ml = model.toLowerCase();
  
  // Map to currently available Gemini models - gemini-2.0-flash is stable now
  if (ml.includes('gemini-2.5') || ml.includes('gemini-2.0') || ml.includes('gemini-2')) {
    return 'gemini-2.0-flash';
  }
  if (ml.includes('gemini-1.5-flash') || ml.includes('flash')) {
    return 'gemini-2.0-flash'; // 1.5 deprecated, use 2.0
  }
  if (ml.includes('gemini-1.5-pro') || ml.includes('pro')) {
    return 'gemini-2.0-flash';
  }
  if (ml.includes('gemini-pro')) {
    return 'gemini-2.0-flash';
  }
  // Default to stable model
  return 'gemini-2.0-flash';
}

async function callGemini(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please add GOOGLE_API_KEY (or GEMINI_API_KEY) to your Edge Function secrets.');
  }

  // Normalize model to valid API ID
  const normalizedModel = normalizeGeminiModel(model);
  console.log(`Gemini model normalization: ${model} -> ${normalizedModel}`);

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  console.log(`Calling Gemini API with model: ${normalizedModel}`);

  let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    }),
  });

  // If model not found, retry with fallback models
  if (!response.ok && response.status === 404) {
    const errText = await response.text();
    console.error(`Gemini API error (first attempt ${response.status}):`, errText);
    
    // Try fallback models in order
    const fallbackModels = ['gemini-1.5-flash-latest', 'gemini-pro'];
    
    for (const fallbackModel of fallbackModels) {
      console.log(`Retrying Gemini call with fallback model: ${fallbackModel}`);
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: temperature ?? 0.7,
            maxOutputTokens: maxTokens ?? 4096
          }
        }),
      });
      
      if (response.ok) {
        console.log(`Fallback model ${fallbackModel} succeeded`);
        break;
      }
      
      // Read error but continue to next fallback - clone to avoid body consumed
      if (!response.ok) {
        try {
          const fallbackErr = await response.clone().text();
          console.error(`Fallback model ${fallbackModel} failed (${response.status}):`, fallbackErr);
        } catch (e) {
          console.error(`Fallback model ${fallbackModel} failed (${response.status})`);
        }
      }
    }
  }

  if (!response.ok) {
    // Clone response before reading to avoid double consumption error
    let errorData: string;
    try {
      errorData = await response.clone().text();
    } catch {
      errorData = 'Unable to read error response';
    }
    console.error(`Gemini API error (${response.status}):`, errorData);
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  // Handle empty response
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error('Gemini returned empty response:', JSON.stringify(data));
    throw new Error('Gemini returned empty response - content may have been filtered');
  }
  
  return {
    content: data.candidates[0].content.parts[0].text,
    usage: data.usageMetadata
  };
}

/**
 * Call Lovable AI Gateway (Universal AI connector for Gemini models)
 * Supports both text generation and image generation (nano banana)
 */
async function callLovableAI(
  model: string, 
  prompt: string, 
  systemPrompt?: string, 
  imageGeneration?: boolean,
  aspectRatio?: string,
  style?: string
) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY not configured. This is auto-provisioned in Lovable Cloud projects.');
  }

  // Determine if this is an image generation model
  const isImageModel = imageGeneration || 
    model.includes('image') || 
    model.includes('nano-banana') ||
    model === 'google/gemini-2.5-flash-image-preview' ||
    model === 'google/gemini-3-pro-image-preview';

  // Normalize model name
  let targetModel = model;
  if (model === 'gemini-nano-banana' || model === 'nano-banana') {
    targetModel = 'google/gemini-2.5-flash-image-preview';
  } else if (!model.startsWith('google/') && !model.startsWith('openai/')) {
    // Default to flash for text generation
    targetModel = 'google/gemini-2.5-flash';
  }

  console.log(`[UniversalAI-Lovable] Calling Lovable AI Gateway: model=${targetModel}, isImage=${isImageModel}`);

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  
  // For image generation, add safety guidance
  const finalPrompt = isImageModel && style
    ? `Create a ${style} style image: ${fullPrompt}. ${aspectRatio || '1:1'} aspect ratio. Professional, high quality. Safe for all audiences.`
    : fullPrompt;

  const requestBody: any = {
    model: targetModel,
    messages: [{ role: 'user', content: finalPrompt }],
  };

  // Add modalities for image generation
  if (isImageModel) {
    requestBody.modalities = ['image', 'text'];
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[UniversalAI-Lovable] Error (${response.status}):`, errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later or upgrade your plan.');
    }
    if (response.status === 402) {
      throw new Error('API credits exhausted. Please add funds to your Lovable workspace.');
    }
    
    throw new Error(`Lovable AI Gateway error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Handle image response
  if (isImageModel) {
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || '';
    
    return {
      content: imageUrl || textContent,
      imageUrl: imageUrl,
      isImage: !!imageUrl,
      usage: data.usage
    };
  }

  // Handle text response
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage
  };
}