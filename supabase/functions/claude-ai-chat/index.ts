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

    // For now, return a mock response until we implement full Claude integration
    const mockResponse = {
      reply: `I understand you're saying: "${message}". This is a mock response while we set up the full Claude integration.`,
      conversation_id: conversation_id || 'mock-conversation-id',
      timestamp: new Date().toISOString(),
      success: true
    };

    console.log('✅ Claude AI Chat completed successfully');

    return new Response(
      JSON.stringify(mockResponse),
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