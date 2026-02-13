/**
 * INTENT ANALYZER - Agentic AI for Intelligent Intent Classification
 * 
 * Uses the existing shared routing infrastructure:
 * - _shared/api-keys.ts → LLM provider fallback chain
 * - _shared/style-intent-routing.ts → Style intent → provider mapping
 * - Vertex AI JWT auth → Gemini 3.0 Flash via aiplatform.googleapis.com
 * 
 * Provider chain: Vertex Gemini 3.0 → Consumer Gemini 2.0 → OpenAI → Claude
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getGeminiKey, 
  getOpenAIKey, 
  getClaudeKey,
  getApiKey,
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
- suggested_styles: Array of matching style intents from: ${AVAILABLE_STYLES.slice(0, 30).join(', ')}... (${AVAILABLE_STYLES.length} total styles including cultural, nature, religious, regional modern)
- compliance_notes: Any industry-specific compliance considerations
- target_audience_hint: Who this content is likely for

RESPOND ONLY with valid JSON. No markdown, no explanation.`;

// ============================================================================
// VERTEX AI JWT AUTH (reuses pattern from _shared/image-providers.ts)
// ============================================================================

async function getVertexAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));

  const signInput = `${header}.${payload}`;
  const keyData = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(signInput));
  const sig64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${payload}.${sig64}`,
  });

  if (!tokenResp.ok) throw new Error(`Vertex auth failed: ${tokenResp.status}`);
  return (await tokenResp.json()).access_token;
}

// ============================================================================
// PROVIDER-SPECIFIC LLM CALL IMPLEMENTATIONS
// ============================================================================

async function callVertexGemini(description: string): Promise<any> {
  const saJson = Deno.env.get('GOOGLE_VERTEX_SERVICE_ACCOUNT');
  if (!saJson) throw new Error('GOOGLE_VERTEX_SERVICE_ACCOUNT not configured');

  const sa = JSON.parse(saJson);
  const token = await getVertexAccessToken(sa);
  const projectId = sa.project_id;
  const location = 'us-central1';
  const model = 'gemini-2.0-flash-001'; // Vertex-available model

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: description }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vertex Gemini error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Vertex Gemini returned empty response');
  return JSON.parse(text);
}

async function callGeminiConsumer(apiKey: string, model: string, description: string): Promise<any> {
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
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// UNIFIED LLM CALL WITH FALLBACK CHAIN
// Uses same pattern as ai-universal-processor resilience:
// Vertex Gemini (primary) → Consumer Gemini 2.0 (backup) → OpenAI → Claude
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
  
  const fallbackChain: Array<{
    id: string;
    call: () => Promise<any>;
    provider: string;
    model: string;
  }> = [];

  // 1. Vertex AI Gemini (primary - uses service account JWT, same as image/video gen)
  const vertexSA = Deno.env.get('GOOGLE_VERTEX_SERVICE_ACCOUNT');
  if (vertexSA) {
    fallbackChain.push({
      id: 'vertex_gemini',
      call: () => callVertexGemini(description),
      provider: 'google-vertex',
      model: 'gemini-2.0-flash-001',
    });
  }

  // 2. Consumer Gemini 2.0 Flash (backup - uses API key)
  const geminiKey = getGeminiKey();
  if (geminiKey) {
    fallbackChain.push({
      id: 'gemini_consumer',
      call: () => callGeminiConsumer(geminiKey, 'gemini-2.0-flash', description),
      provider: 'google',
      model: 'gemini-2.0-flash',
    });
  }

  // 3. OpenAI (fallback)
  const openaiKey = getOpenAIKey();
  if (openaiKey) {
    fallbackChain.push({
      id: 'openai',
      call: () => callOpenAI(openaiKey, description),
      provider: 'openai',
      model: 'gpt-4o-mini',
    });
  }

  // 4. Claude (fallback)
  const claudeKey = getClaudeKey();
  if (claudeKey) {
    fallbackChain.push({
      id: 'claude',
      call: () => callClaude(claudeKey, description),
      provider: 'anthropic',
      model: 'claude-3-5-haiku',
    });
  }

  if (fallbackChain.length === 0) {
    throw new Error('No AI providers configured. Set GOOGLE_VERTEX_SERVICE_ACCOUNT, GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.');
  }

  for (let i = 0; i < fallbackChain.length; i++) {
    const entry = fallbackChain[i];
    attempts.push(entry.id);
    
    try {
      console.log(`[intent-analyzer] Trying provider: ${entry.id} (${entry.model})`);
      const analysis = await entry.call();
      
      console.log(`[intent-analyzer] ✅ Success with ${entry.id}`);
      return {
        analysis,
        provider: entry.provider,
        model: entry.model,
        fallback_used: i > 0,
        attempts,
      };
    } catch (error) {
      console.warn(`[intent-analyzer] ❌ ${entry.id} failed:`, error.message);
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

    const result = await analyzeWithFallbackChain(description);

    // Validate suggested styles against the shared routing registry
    const analysis = result.analysis;
    if (analysis.suggested_styles) {
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
