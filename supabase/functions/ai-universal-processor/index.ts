import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      provider, 
      model, 
      prompt, 
      systemPrompt, 
      temperature = 0.7, 
      maxTokens = 1000,
      context = {},
      action = 'generate'
    } = await req.json();

    console.log('AI Universal Processor:', { provider, model, promptLength: prompt?.length, action });

    let response;
    let usage = null;

    // Handle different actions
    let enhancedPrompt = prompt;
    let enhancedSystemPrompt = systemPrompt;

    if (action === 'configure_node') {
      enhancedSystemPrompt = `You are an AI assistant that helps configure workflow nodes. 
Generate a detailed configuration for the specified node based on the user's requirements.
Return a JSON object with the node configuration including settings, parameters, and properties.`;
      
      enhancedPrompt = `Configure a workflow node with the following requirements: ${prompt}
      
Context: ${JSON.stringify(context, null, 2)}

Please provide a comprehensive node configuration in JSON format.`;
    } else if (action === 'test_node') {
      enhancedSystemPrompt = `You are an AI assistant that helps test workflow nodes.
Simulate the execution of the specified node and provide test results.
Return a JSON object with test status, results, and any recommendations.`;
    } else if (action === 'deploy_agent') {
      enhancedSystemPrompt = `You are an AI assistant that helps deploy AI agents.
Generate deployment configuration and instructions for the specified agent.
Return a JSON object with deployment settings, environment requirements, and setup instructions.`;
    }

    switch (provider) {
      case 'openai':
        if (!OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        response = await callOpenAI(model || 'gpt-4o-mini', enhancedPrompt, enhancedSystemPrompt, temperature, maxTokens);
        usage = response.usage;
        break;

      case 'claude':
        if (!CLAUDE_API_KEY) {
          throw new Error('Claude API key not configured');
        }
        response = await callClaude(model || 'claude-3-haiku', enhancedPrompt, enhancedSystemPrompt, temperature, maxTokens);
        break;

      case 'gemini':
        if (!GEMINI_API_KEY) {
          throw new Error('Gemini API key not configured');
        }
        response = await callGemini(model || 'gemini-pro', enhancedPrompt, enhancedSystemPrompt, temperature, maxTokens);
        break;

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    const result = {
      content: response.content,
      provider,
      model: model || getDefaultModel(provider),
      usage,
      metadata: {
        timestamp: new Date().toISOString(),
        context,
        temperature,
        maxTokens
      }
    };

    console.log('AI Response generated successfully:', { 
      provider, 
      model, 
      contentLength: result.content?.length 
    });

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('AI Universal Processor Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'AI processing failed',
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

async function callOpenAI(model: string, prompt: string, systemPrompt?: string, temperature = 0.7, maxTokens = 1000) {
  const messages = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage
  };
}

async function callClaude(model: string, prompt: string, systemPrompt?: string, temperature = 0.7, maxTokens = 1000) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt || 'You are a helpful AI assistant.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude API Error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  return {
    content: data.content[0]?.text || ''
  };
}

async function callGemini(model: string, prompt: string, systemPrompt?: string, temperature = 0.7, maxTokens = 1000) {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  };
}

function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'openai': return 'gpt-4o-mini';
    case 'claude': return 'claude-3-haiku';
    case 'gemini': return 'gemini-pro';
    default: return 'gpt-4o-mini';
  }
}