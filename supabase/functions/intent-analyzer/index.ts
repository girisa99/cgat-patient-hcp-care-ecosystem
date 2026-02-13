/**
 * INTENT ANALYZER - Agentic AI for Intelligent Intent Classification
 * 
 * Uses the existing shared routing infrastructure:
 * - _shared/api-keys.ts → LLM provider fallback chain (Gemini → OpenAI → Claude)
 * - _shared/style-intent-routing.ts → Style intent → provider mapping
 * 
 * This ensures the intent analyzer uses the SAME routing as the Regional Assets Lab,
 * ai-universal-processor, and all other edge functions in the platform.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getAIProviders, 
  getFirstAvailableProvider, 
  getGeminiKey, 
  getOpenAIKey, 
  getClaudeKey,
  type AIProviderConfig 
} from '../_shared/api-keys.ts';
import { getAllStyleIntents } from '../_shared/style-intent-routing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AVAILABLE_STYLES = getAllStyleIntents();

const SYSTEM_PROMPT = `You are an intelligent content intent analyzer for a video/media production platform (Genie Cast).

Given a natural language description of what a user wants to create, extract structured metadata.

You MUST respond with a JSON object containing:
- label: Short name (2-4 words, title case)
- description: One-sentence description (max 80 chars)
- category: One of "marketing", "education", "enterprise", "social"
- content_types: Array from ["video", "infographic", "animation", "chart", "whitepaper", "statistics_card", "customer_journey", "process_flow", "presentation", "social_post"]
- industry: Primary industry if mentioned (lowercase), or empty string
- capability_requirements: Array from ["video_generation", "image_generation", "tts", "avatar", "3d_generation", "data_visualization", "diagram_generation", "layout_engine", "llm_generation", "pdf_export", "slide_generation", "copywriting", "motion_graphics", "lipsync"]
- suggested_styles: Array of matching style intents from: ${AVAILABLE_STYLES.slice(0, 30).join(', ')}... (67 total styles including cultural, nature, religious, regional modern)
- compliance_notes: Any industry-specific compliance considerations
- target_audience_hint: Who this content is likely for

RESPOND ONLY with valid JSON. No markdown, no explanation.`;

// ============================================================================
// PROVIDER-SPECIFIC LLM CALL IMPLEMENTATIONS
// ============================================================================

async function callGemini(apiKey: string, model: string, description: string): Promise<any> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: description }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini ${model} error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');
  return JSON.parse(text);
}

async function callOpenAI(apiKey: string, description: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: description },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned empty response');
  return JSON.parse(text);
}

async function callClaude(apiKey: string, description: string): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: description }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text;
  if (!text) throw new Error('Claude returned empty response');
  
  // Claude may wrap JSON in markdown code blocks
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// UNIFIED LLM CALL WITH FALLBACK CHAIN
// ============================================================================

interface LLMResult {
  analysis: any;
  provider: string;
  model: string;
  fallback_used: boolean;
  attempts: string[];
}

async function analyzeWithFallbackChain(description: string): Promise<LLMResult> {
  const attempts: string[] = [];
  
  // Use the shared provider priority: Gemini 3.0 → Gemini 2.0 → OpenAI → Claude
  const providers = getAIProviders();
  const fallbackChain: Array<{
    id: string;
    call: () => Promise<any>;
    provider: string;
    model: string;
  }> = [];

  // Gemini 3.0 Flash (primary)
  if (providers.gemini_primary.available) {
    fallbackChain.push({
      id: 'gemini_primary',
      call: () => callGemini(providers.gemini_primary.apiKey!, providers.gemini_primary.model, description),
      provider: 'google',
      model: providers.gemini_primary.model,
    });
  }

  // Gemini 2.0 Flash (backup)
  if (providers.gemini_backup.available) {
    fallbackChain.push({
      id: 'gemini_backup',
      call: () => callGemini(providers.gemini_backup.apiKey!, providers.gemini_backup.model, description),
      provider: 'google',
      model: providers.gemini_backup.model,
    });
  }

  // OpenAI (fallback)
  if (providers.openai.available) {
    fallbackChain.push({
      id: 'openai',
      call: () => callOpenAI(providers.openai.apiKey!, description),
      provider: 'openai',
      model: providers.openai.model,
    });
  }

  // Claude (fallback)
  if (providers.claude.available) {
    fallbackChain.push({
      id: 'claude',
      call: () => callClaude(providers.claude.apiKey!, description),
      provider: 'anthropic',
      model: providers.claude.model,
    });
  }

  if (fallbackChain.length === 0) {
    throw new Error('No AI providers configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.');
  }

  for (let i = 0; i < fallbackChain.length; i++) {
    const entry = fallbackChain[i];
    attempts.push(entry.id);
    
    try {
      console.log(`[intent-analyzer] Trying provider: ${entry.id} (${entry.model})`);
      const analysis = await entry.call();
      
      console.log(`[intent-analyzer] Success with ${entry.id}`);
      return {
        analysis,
        provider: entry.provider,
        model: entry.model,
        fallback_used: i > 0,
        attempts,
      };
    } catch (error) {
      console.warn(`[intent-analyzer] ${entry.id} failed:`, error.message);
      // Continue to next provider in the chain
    }
  }

  throw new Error(`All ${attempts.length} providers failed: ${attempts.join(' → ')}`);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, language } = await req.json();
    if (!description || typeof description !== 'string') {
      return new Response(JSON.stringify({ error: 'Description required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use the unified fallback chain from shared infrastructure
    const result = await analyzeWithFallbackChain(description);

    // Enrich with available style intents from the shared routing registry
    const analysis = result.analysis;
    if (analysis.suggested_styles) {
      // Validate suggested styles against the shared registry
      analysis.suggested_styles = analysis.suggested_styles.filter(
        (s: string) => AVAILABLE_STYLES.includes(s)
      );
    }

    return new Response(JSON.stringify({ 
      analysis,
      routing: {
        provider: result.provider,
        model: result.model,
        fallback_used: result.fallback_used,
        attempts: result.attempts,
        available_styles_count: AVAILABLE_STYLES.length,
      },
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
