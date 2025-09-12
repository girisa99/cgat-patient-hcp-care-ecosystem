import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Mock RAG system status
    const status = {
      available: true,
      documentsCount: 150, // Mock count of indexed documents
      labelStudioConnected: true, // Mock Label Studio connection status
      lastIndexed: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      categories: {
        medical: 85,
        general: 45,
        research: 20
      },
      health: {
        vectorStore: 'operational',
        embedding: 'operational', 
        search: 'operational'
      }
    };

    console.log('RAG status check completed:', status);

    return new Response(
      JSON.stringify(status),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('RAG status error:', error);
    return new Response(
      JSON.stringify({ 
        available: false,
        documentsCount: 0,
        labelStudioConnected: false,
        error: error.message || 'RAG status check failed'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});