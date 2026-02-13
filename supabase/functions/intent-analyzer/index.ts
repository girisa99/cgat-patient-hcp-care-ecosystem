/**
 * INTENT ANALYZER - Agentic AI for Intelligent Intent Classification
 * 
 * Full 7-provider LLM fallback chain matching ecosystem routing:
 * Vertex Gemini 2.5 Flash → Vertex Gemini 2.0 → Consumer Gemini → 
 * Alibaba Qwen-Max → OpenAI → DeepSeek → Claude
 * 
 * Uses shared infrastructure:
 * - _shared/api-keys.ts → Key retrieval with fallback aliases
 * - _shared/style-intent-routing.ts → Style intent validation
 * - Vertex AI JWT auth → Same pattern as image/video providers
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
// VERTEX AI JWT AUTH (shared pattern from _shared/image-providers.ts)
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
// PROVIDER-SPECIFIC LLM IMPLEMENTATIONS
// ============================================================================

async function callVertexGemini(model: string, description: string): Promise<any> {
  const saJson = Deno.env.get('GOOGLE_VERTEX_SERVICE_ACCOUNT');
  if (!saJson) throw new Error('GOOGLE_VERTEX_SERVICE_ACCOUNT not configured');

  const sa = JSON.parse(saJson);
  const token = await getVertexAccessToken(sa);
  const projectId = sa.project_id;
  const location = 'us-central1';

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
    throw new Error(`Vertex ${model} error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Vertex ${model} returned empty response`);
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
    throw new Error(`Gemini ${model} error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');
  return JSON.parse(text);
}

async function callAlibaba(apiKey: string, description: string): Promise<any> {
  // Alibaba DashScope REST API (native, per infrastructure standards)
  const response = await fetch(
    'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: description },
          ],
        },
        parameters: {
          temperature: 0.3,
          result_format: 'message',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Alibaba Qwen error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.output?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Alibaba Qwen returned empty response');
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Alibaba Qwen did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
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
    throw new Error(`OpenAI error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned empty response');
  return JSON.parse(text);
}

async function callDeepSeek(apiKey: string, description: string): Promise<any> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
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
    throw new Error(`DeepSeek error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek returned empty response');
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
    throw new Error(`Claude error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text;
  if (!text) throw new Error('Claude returned empty response');
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// FULL 7-PROVIDER FALLBACK CHAIN
// Matches ecosystem routing: Vertex → Consumer Gemini → Alibaba → OpenAI → DeepSeek → Claude
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

  // 1. Vertex AI - Gemini 2.5 Flash (deep thinking, quality-critical)
  const vertexSA = Deno.env.get('GOOGLE_VERTEX_SERVICE_ACCOUNT');
  if (vertexSA) {
    fallbackChain.push({
      id: 'vertex_gemini_2.5_flash',
      call: () => callVertexGemini('gemini-2.5-flash', description),
      provider: 'google-vertex',
      model: 'gemini-2.5-flash',
    });
  }

  // 2. Vertex AI - Gemini 2.0 Flash (speed backup)
  if (vertexSA) {
    fallbackChain.push({
      id: 'vertex_gemini_2.0',
      call: () => callVertexGemini('gemini-2.0-flash-001', description),
      provider: 'google-vertex',
      model: 'gemini-2.0-flash',
    });
  }

  // 3. Consumer Gemini 2.0 Flash (API key backup)
  const geminiKey = getGeminiKey();
  if (geminiKey) {
    fallbackChain.push({
      id: 'gemini_consumer',
      call: () => callGeminiConsumer(geminiKey, 'gemini-2.0-flash', description),
      provider: 'google',
      model: 'gemini-2.0-flash',
    });
  }

  // 4. Alibaba Qwen-Max (CJK/MENA zone primary per regional routing)
  const alibabaKey = getApiKey('ALIBABA_SINGAPORE_API_KEY', 'ALIBABA_API_KEY');
  if (alibabaKey) {
    fallbackChain.push({
      id: 'alibaba_qwen',
      call: () => callAlibaba(alibabaKey, description),
      provider: 'alibaba',
      model: 'qwen-max',
    });
  }

  // 5. OpenAI GPT-4o-mini (fallback)
  const openaiKey = getOpenAIKey();
  if (openaiKey) {
    fallbackChain.push({
      id: 'openai',
      call: () => callOpenAI(openaiKey, description),
      provider: 'openai',
      model: 'gpt-4o-mini',
    });
  }

  // 6. DeepSeek (cross-platform fallback per routing policy)
  const deepseekKey = getApiKey('DEEPSEEK_API_KEY');
  if (deepseekKey) {
    fallbackChain.push({
      id: 'deepseek',
      call: () => callDeepSeek(deepseekKey, description),
      provider: 'deepseek',
      model: 'deepseek-chat',
    });
  }

  // 7. Claude (final fallback)
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
    throw new Error('No AI providers configured. Set GOOGLE_VERTEX_SERVICE_ACCOUNT, GEMINI_API_KEY, ALIBABA_SINGAPORE_API_KEY, OPENAI_API_KEY, DEEPSEEK_API_KEY, or ANTHROPIC_API_KEY.');
  }

  console.log(`[intent-analyzer] Chain: ${fallbackChain.map(e => e.id).join(' → ')} (${fallbackChain.length} providers)`);

  for (let i = 0; i < fallbackChain.length; i++) {
    const entry = fallbackChain[i];
    attempts.push(entry.id);
    
    try {
      console.log(`[intent-analyzer] Trying: ${entry.id} (${entry.model})`);
      const analysis = await entry.call();
      
      console.log(`[intent-analyzer] ✅ Success: ${entry.id}`);
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
        chain_depth: result.attempts.length,
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
