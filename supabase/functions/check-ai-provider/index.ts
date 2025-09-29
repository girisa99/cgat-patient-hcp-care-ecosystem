import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider } = await req.json();

    let available = false;
    let apiKey = null;

    switch (provider) {
      case 'openai':
        apiKey = OPENAI_API_KEY;
        break;
      case 'claude':
        apiKey = CLAUDE_API_KEY;
        break;
      case 'gemini':
        apiKey = GEMINI_API_KEY;
        break;
      case 'huggingface':
        apiKey = HUGGING_FACE_TOKEN;
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    available = !!(apiKey && apiKey.length > 0);

    console.log(`Provider ${provider} availability check:`, { available: available ? 'YES' : 'NO' });

    return new Response(JSON.stringify({ 
      provider, 
      available,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Provider Check Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: (error instanceof Error ? error.message : 'Provider check failed'),
        available: false
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