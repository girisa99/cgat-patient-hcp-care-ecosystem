/**
 * AI Template Generation Edge Function
 * Uses Lovable AI to generate template structure from natural language
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("🤖 Generating template from prompt:", prompt.substring(0, 100) + "...");

    // Call Lovable AI to generate template structure
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI video template generator. Given a user's description, generate a video template configuration.

Return a JSON object with this exact structure:
{
  "name": "Template Name",
  "description": "Brief description of what the template creates",
  "category": "one of: marketing, educational, storytelling, healthcare, entertainment, travel, corporate, animation, 3d, avatar, interactive",
  "videoStyle": "one of: photorealistic, pixar, anime, crayon, microworld, whiteboard, cyber, stop_motion, motion_graphics, documentary, character_vlog, explainer",
  "capabilities": ["array of: text_to_video, image_to_video, 3d_generation, avatar, lipsync, tts, music_gen, video_effects, pixar_style, anime_style"],
  "regions": ["array of: western, europe, cjk, india, mena, africa, latam, sea, caribbean"],
  "duration": 60,
  "industries": ["relevant industry tags"]
}

Always respond with valid JSON only, no markdown or explanation.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("📝 AI Response:", content.substring(0, 200));

    // Parse JSON from response
    let template;
    try {
      // Remove any markdown code blocks if present
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      template = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return a default template if parsing fails
      template = {
        name: "Custom Template",
        description: prompt.substring(0, 200),
        category: "marketing",
        videoStyle: "motion_graphics",
        capabilities: ["text_to_video", "tts"],
        regions: ["western"],
        duration: 60,
        industries: ["general"]
      };
    }

    console.log("✅ Generated template:", template.name);

    return new Response(
      JSON.stringify({ template }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error generating template:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
