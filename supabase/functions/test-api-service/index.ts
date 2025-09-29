import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nodeId, nodeType, nodeConfig, input } = await req.json();
    
    // Simulate processing time
    const delay = Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate test results based on node type
    const result = {
      success: Math.random() > 0.1, // 90% success rate
      output: {
        nodeId,
        processed: true,
        result: `Processed ${nodeType} node successfully`,
        data: input
      },
      metrics: {
        processingTimeMs: Math.round(delay),
        tokensUsed: Math.floor(Math.random() * 100) + 50,
        cost: (Math.random() * 0.001).toFixed(4)
      }
    };
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      output: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});