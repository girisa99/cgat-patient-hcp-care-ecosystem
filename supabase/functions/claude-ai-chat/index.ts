import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💬 Claude AI Chat started');
    
    const { message, context, conversation_id } = await req.json();
    
    console.log('📝 Chat request:', { hasMessage: !!message, conversation_id, contextKeys: Object.keys(context || {}) });

    // Check if we have the Anthropic API key
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      console.log('⚠️ No ANTHROPIC_API_KEY found, returning mock response');
      const mockResponse = {
        reply: `I understand you're saying: "${message}". This is a mock Claude response while the API key is being configured. Please add your ANTHROPIC_API_KEY to the Edge Function secrets to enable real Claude AI conversations.`,
        conversation_id: conversation_id || 'mock-conversation-id',
        timestamp: new Date().toISOString(),
        success: true,
        mock: true
      };

      return new Response(
        JSON.stringify(mockResponse),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Real Claude API call
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const claudeResponse = {
      reply: data.content[0].text,
      conversation_id: conversation_id || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      success: true,
      usage: data.usage
    };

    console.log('✅ Claude AI Chat completed successfully');

    return new Response(
      JSON.stringify(claudeResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('❌ Claude AI Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
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
})