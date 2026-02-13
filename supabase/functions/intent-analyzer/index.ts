import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are an intelligent content intent analyzer for a video/media production platform (Genie Cast).

Given a natural language description of what a user wants to create, extract structured metadata.

You MUST respond using the "analyze_intent" tool. Extract:
- label: Short name (2-4 words, title case)
- description: One-sentence description (max 80 chars)
- category: One of "marketing", "education", "enterprise", "social"
- content_types: Array from ["video", "infographic", "animation", "chart", "whitepaper", "statistics_card", "customer_journey", "process_flow", "presentation", "social_post"]
- industry: Primary industry if mentioned (lowercase), or empty string
- capability_requirements: Array of required capabilities from ["video_generation", "image_generation", "tts", "avatar", "3d_generation", "data_visualization", "diagram_generation", "layout_engine", "llm_generation", "pdf_export", "slide_generation", "copywriting", "motion_graphics", "lipsync"]
- suggested_styles: Array of style intents that match (e.g., "photorealistic", "cinematic", "corporate", "educational", "ugc-authentic")
- compliance_notes: Any industry-specific compliance considerations
- target_audience_hint: Who this content is likely for`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    if (!description || typeof description !== 'string') {
      return new Response(JSON.stringify({ error: 'Description required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Gemini with tool calling for structured output
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: description }] }],
          tools: [{
            function_declarations: [{
              name: 'analyze_intent',
              description: 'Extract structured intent metadata from user description',
              parameters: {
                type: 'OBJECT',
                properties: {
                  label: { type: 'STRING', description: 'Short name (2-4 words)' },
                  description: { type: 'STRING', description: 'One-sentence description' },
                  category: { type: 'STRING', enum: ['marketing', 'education', 'enterprise', 'social'] },
                  content_types: { type: 'ARRAY', items: { type: 'STRING' } },
                  industry: { type: 'STRING' },
                  capability_requirements: { type: 'ARRAY', items: { type: 'STRING' } },
                  suggested_styles: { type: 'ARRAY', items: { type: 'STRING' } },
                  compliance_notes: { type: 'STRING' },
                  target_audience_hint: { type: 'STRING' },
                },
                required: ['label', 'description', 'category', 'content_types', 'capability_requirements'],
              },
            }],
          }],
          tool_config: { function_calling_config: { mode: 'ANY', allowed_function_names: ['analyze_intent'] } },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[intent-analyzer] Gemini error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const functionCall = result.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (!functionCall?.args) {
      console.error('[intent-analyzer] No function call in response:', JSON.stringify(result));
      return new Response(JSON.stringify({ error: 'AI did not return structured data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      analysis: functionCall.args,
      model: 'gemini-2.0-flash',
      analyzed_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[intent-analyzer] Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
