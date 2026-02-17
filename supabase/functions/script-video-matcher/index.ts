/**
 * Script-to-Video Matcher Edge Function
 * Generates embeddings for script segments and video clips
 */

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
    const { action, type, items } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (action === 'generate_embeddings') {
      const texts = items.map((item: any) => item.text || '');
      
      // Use OpenAI embeddings
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: texts,
        }),
      });

      if (!response.ok) {
        throw new Error('Embedding generation failed');
      }

      const data = await response.json();
      const embeddings = data.data.map((d: any) => d.embedding);

      return new Response(
        JSON.stringify({ embeddings, sentiments: texts.map(() => 'neutral') }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Unknown action');
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
