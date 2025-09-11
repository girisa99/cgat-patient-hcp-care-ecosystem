import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('RAG Status Check Request');

    // Mock RAG system status
    const status = {
      available: true,
      documentsCount: 1247, // Simulated document count
      labelStudioConnected: true,
      vectorStoreReady: true,
      embeddingModel: 'text-embedding-ada-002',
      lastIndexed: new Date().toISOString(),
      categories: {
        medical: 856,
        commercial: 234,
        regulatory: 157
      }
    };

    console.log('RAG Status:', status);

    return new Response(JSON.stringify(status), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('RAG Status Error:', error);
    return new Response(JSON.stringify({ 
      available: false,
      documentsCount: 0,
      labelStudioConnected: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});