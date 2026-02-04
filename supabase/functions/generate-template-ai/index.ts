/**
 * AI Template Generation Edge Function
 * Uses INTERNAL AI routing (AIRoutingIntelligence) to generate template structure
 * NO Lovable AI - Uses our Universal AI Processor
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Internal AI Providers with priority routing
const AI_PROVIDERS = {
  primary: {
    name: 'gemini',
    model: 'gemini-2.0-flash-exp',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    envKey: 'GEMINI_API_KEY',
  },
  secondary: {
    name: 'openai',
    model: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    envKey: 'OPENAI_API_KEY',
  },
  tertiary: {
    name: 'anthropic',
    model: 'claude-3-haiku-20240307',
    endpoint: 'https://api.anthropic.com/v1/messages',
    envKey: 'ANTHROPIC_API_KEY',
  },
  fallback: {
    name: 'deepseek',
    model: 'deepseek-chat',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    envKey: 'DEEPSEEK_API_KEY',
  }
};

const TEMPLATE_GENERATION_PROMPT = `You are an AI video template generator for Genie Studio. Given a user's description, generate a video template configuration.

Return a JSON object with this exact structure:
{
  "name": "Template Name",
  "description": "Brief description of what the template creates",
  "category": "one of: marketing, educational, storytelling, healthcare, entertainment, travel, corporate, animation, 3d, avatar, interactive, ppt, smb, oil_gas, automotive, hospitality",
  "videoStyle": "one of: photorealistic, pixar, anime, crayon, microworld, whiteboard, cyber, stop_motion, motion_graphics, documentary, character_vlog, explainer, ppt_slides, hand_sketch, watercolor, hyper_real",
  "capabilities": ["array of: text_to_video, image_to_video, 3d_generation, avatar, lipsync, tts, music_gen, video_effects, pixar_style, anime_style, ppt_animation, slideshow"],
  "regions": ["array of: western, europe, cjk, india, mena, africa, latam, sea, caribbean, pakistan, indonesia"],
  "duration": 60,
  "industries": ["relevant industry tags like: saas, healthcare, travel, restaurants, coffee_shops, grocery, automotive, oil_gas, mechanics, cleaners, real_estate, education, schools"]
}

Always respond with valid JSON only, no markdown or explanation.`;

// Call Gemini API
async function callGemini(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${TEMPLATE_GENERATION_PROMPT}\n\nUser request: ${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      }),
    });

    if (!response.ok) {
      console.error('Gemini error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini call failed:', error);
    return null;
  }
}

// Call OpenAI API
async function callOpenAI(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: TEMPLATE_GENERATION_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return null;
  }
}

// Call Anthropic Claude API
async function callClaude(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: `${TEMPLATE_GENERATION_PROMPT}\n\nUser request: ${prompt}` }
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.error('Claude call failed:', error);
    return null;
  }
}

// Call DeepSeek API
async function callDeepSeek(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: TEMPLATE_GENERATION_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('DeepSeek call failed:', error);
    return null;
  }
}

// Intelligent routing with fallback chain
async function generateWithInternalAI(prompt: string): Promise<{ content: string | null; provider: string }> {
  // Try Gemini first (primary)
  const geminiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  if (geminiKey) {
    console.log('🔄 Trying Gemini (primary)...');
    const result = await callGemini(prompt, geminiKey);
    if (result) return { content: result, provider: 'gemini' };
  }

  // Try OpenAI (secondary)
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (openaiKey) {
    console.log('🔄 Trying OpenAI (secondary)...');
    const result = await callOpenAI(prompt, openaiKey);
    if (result) return { content: result, provider: 'openai' };
  }

  // Try Claude (tertiary)
  const claudeKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (claudeKey) {
    console.log('🔄 Trying Claude (tertiary)...');
    const result = await callClaude(prompt, claudeKey);
    if (result) return { content: result, provider: 'anthropic' };
  }

  // Try DeepSeek (fallback)
  const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (deepseekKey) {
    console.log('🔄 Trying DeepSeek (fallback)...');
    const result = await callDeepSeek(prompt, deepseekKey);
    if (result) return { content: result, provider: 'deepseek' };
  }

  return { content: null, provider: 'none' };
}

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

    console.log("🤖 Generating template via Internal AI Routing:", prompt.substring(0, 100) + "...");

    // Use internal AI routing (NOT Lovable AI)
    const { content, provider } = await generateWithInternalAI(prompt);

    if (!content) {
      // Return a default template if all providers fail
      console.log("⚠️ All AI providers failed, returning default template");
      const defaultTemplate = {
        name: "Custom Template",
        description: prompt.substring(0, 200),
        category: "marketing",
        videoStyle: "motion_graphics",
        capabilities: ["text_to_video", "tts"],
        regions: ["western"],
        duration: 60,
        industries: ["general"]
      };

      return new Response(
        JSON.stringify({ template: defaultTemplate, provider: 'fallback_default' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📝 AI Response from ${provider}:`, content.substring(0, 200));

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

    console.log(`✅ Generated template via ${provider}:`, template.name);

    return new Response(
      JSON.stringify({ template, provider }),
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
