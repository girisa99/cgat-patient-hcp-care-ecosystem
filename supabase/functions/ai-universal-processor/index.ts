import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  provider: 'openai' | 'claude' | 'gemini';
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  action?: string;
}

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
    const { provider, model, prompt, systemPrompt, temperature = 0.7, maxTokens = 1000, action } = await req.json() as AIRequest;

    console.log(`Processing AI request - Provider: ${provider}, Model: ${model}, Action: ${action}`);

    // Lightweight actions that don't require full params
    if (action === 'health_check' || action === 'ping') {
      return new Response(JSON.stringify({ ok: true, provider: provider || 'openai', timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required parameters for generation requests
    if (!provider || !model || !prompt) {
      throw new Error('Missing required parameters: provider, model, or prompt');
    }

    let response;
    switch (provider) {
      case 'openai':
        response = await callOpenAI(model, prompt, systemPrompt, temperature, maxTokens);
        break;
      case 'claude':
        response = await callClaude(model, prompt, systemPrompt, temperature, maxTokens);
        break;
      case 'gemini':
        response = await callGemini(model, prompt, systemPrompt, temperature, maxTokens);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
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
      error: error.message,
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.stack : 'Unknown error'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your Edge Function secrets.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  // Handle different model parameter requirements
  const requestBody: any = {
    model,
    messages,
  };

  // Newer models (GPT-5, GPT-4.1+, O3, O4) use max_completion_tokens and don't support temperature
  if (model.includes('gpt-5') || model.includes('gpt-4.1') || model.includes('o3') || model.includes('o4')) {
    requestBody.max_completion_tokens = maxTokens;
    // Don't include temperature for newer models
  } else {
    // Legacy models use max_tokens and support temperature
    requestBody.max_tokens = maxTokens;
    requestBody.temperature = temperature;
  }

  console.log(`Calling OpenAI API with model: ${model}`);

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
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your Edge Function secrets.');
  }

  const requestBody: any = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }]
  };

  if (systemPrompt) {
    requestBody.system = systemPrompt;
  }

  console.log(`Calling Claude API with model: ${model}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Claude API error (${response.status}):`, errorData);
    throw new Error(`Claude API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: data.usage
  };
}

async function callGemini(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) {
    throw new Error('Google API key not configured. Please add GOOGLE_API_KEY to your Edge Function secrets.');
  }

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  console.log(`Calling Gemini API with model: ${model}`);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Gemini API error (${response.status}):`, errorData);
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    usage: data.usageMetadata
  };
}