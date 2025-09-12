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
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock Label Studio search functionality
    // In production, this would connect to actual Label Studio API
    const mockAnnotations = [
      `Medical Context: Patient presenting symptoms related to "${query}"`,
      `Clinical Notes: Previous observations for "${query}" cases`,
      `Treatment Protocol: Standard procedures for "${query}" related conditions`,
    ].filter(annotation => 
      query.toLowerCase().split(' ').some(term => 
        annotation.toLowerCase().includes(term)
      )
    );

    console.log(`Label Studio search for "${query}" found ${mockAnnotations.length} annotations`);

    return new Response(
      JSON.stringify({ 
        annotations: mockAnnotations,
        query,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Label Studio search error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        annotations: [] 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});