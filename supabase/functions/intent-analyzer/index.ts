/**
 * INTENT ANALYZER - Agentic AI for Intelligent Intent Classification
 * 
 * REGION-AWARE LLM routing matching the master regional-routing-registry:
 * - Western/EU/LATAM/NAM/Oceania/Turkey → Claude 4 (Anthropic)
 * - MENA/CJK → Qwen Max (Alibaba)
 * - India/SEA/Africa/Bangladesh → Gemini 2.5 Pro (Vertex)
 * - Pakistan/Caribbean/Eastern Europe/Central Asia → GPT-4o (OpenAI)
 * - DeepSeek → Fallback only (never primary)
 * 
 * Also returns full multi-modal provider chains (image, video, avatar, 3D)
 * per suggested style, using the shared style-intent-routing registry.
 * 
 * P0 FOUNDATION (Dual-Mode Ready):
 * Analyzes user intent (NL + structured) to classify:
 * 1. Output type (Video, PPT, Avatar, 3D, Combination)
 * 2. Required AI capabilities (lipsync, TTS, animation, 3D, etc.)
 * 3. Style intent + provider chains from video_style_registry
 * 4. Suggested templates + scoring
 * 5. Confidence score + routing recommendations
 * 
 * Returns standardized schema for both internal (8 Genie products) and 
 * external (subscriber) modes.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getGeminiKey, 
  getOpenAIKey, 
  getClaudeKey,
  getApiKey,
} from '../_shared/api-keys.ts';
import { 
  getAllStyleIntents,
  STYLE_TO_IMAGE_PROVIDER,
  STYLE_TO_VIDEO_PROVIDER,
  STYLE_TO_AVATAR_PROVIDER,
  STYLE_TO_3D_PROVIDER,
  DEFAULT_IMAGE_CHAIN,
  DEFAULT_VIDEO_CHAIN,
} from '../_shared/style-intent-routing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AVAILABLE_STYLES = getAllStyleIntents();

// ============================================================================
// REGION → PRIMARY PROVIDER MAPPING (mirrors regional-routing-registry.ts)
// ============================================================================

interface RegionRoute {
  provider: string; // 'claude' | 'alibaba' | 'gemini' | 'openai'
  model: string;
  fallbackOrder: string[]; // provider IDs in priority order
}

/**
 * Master region→LLM mapping, consistent with REGION_LLM_ROUTING
 * and SUB_REGION_FALLBACK_ORDER in regional-routing-registry.ts
 */
const REGION_LLM_MAP: Record<string, RegionRoute> = {
  // Western zones → Claude primary
  'nam':      { provider: 'claude', model: 'claude-sonnet-4-20250514', fallbackOrder: ['claude', 'openai', 'vertex_gemini', 'alibaba', 'deepseek'] },
  'eu':       { provider: 'claude', model: 'claude-sonnet-4-20250514', fallbackOrder: ['claude', 'openai', 'vertex_gemini', 'alibaba', 'deepseek'] },
  'latam':    { provider: 'claude', model: 'claude-sonnet-4-20250514', fallbackOrder: ['claude', 'openai', 'vertex_gemini', 'alibaba', 'deepseek'] },
  'oceania':  { provider: 'claude', model: 'claude-sonnet-4-20250514', fallbackOrder: ['claude', 'openai', 'vertex_gemini', 'deepseek', 'alibaba'] },
  'turkey':   { provider: 'claude', model: 'claude-sonnet-4-20250514', fallbackOrder: ['claude', 'openai', 'deepseek', 'vertex_gemini', 'alibaba'] },
  
  // MENA/CJK → Alibaba Qwen primary
  'mena':     { provider: 'alibaba', model: 'qwen-max', fallbackOrder: ['alibaba', 'openai', 'claude', 'vertex_gemini', 'deepseek'] },
  'cjk':      { provider: 'alibaba', model: 'qwen-max', fallbackOrder: ['alibaba', 'openai', 'claude', 'vertex_gemini', 'deepseek'] },
  
  // India/SEA/Africa/Bangladesh → Gemini primary
  'india':      { provider: 'gemini', model: 'gemini-2.5-pro', fallbackOrder: ['vertex_gemini', 'consumer_gemini', 'openai', 'claude', 'alibaba', 'deepseek'] },
  'sea':        { provider: 'gemini', model: 'gemini-2.5-pro', fallbackOrder: ['vertex_gemini', 'consumer_gemini', 'claude', 'openai', 'alibaba', 'deepseek'] },
  'africa':     { provider: 'gemini', model: 'gemini-2.5-pro', fallbackOrder: ['vertex_gemini', 'consumer_gemini', 'claude', 'openai', 'alibaba', 'deepseek'] },
  'bangladesh': { provider: 'gemini', model: 'gemini-2.5-pro', fallbackOrder: ['vertex_gemini', 'consumer_gemini', 'openai', 'claude', 'alibaba', 'deepseek'] },
  
  // Pakistan/Caribbean/Eastern Europe/Central Asia → OpenAI primary
  'pakistan':        { provider: 'openai', model: 'gpt-4o', fallbackOrder: ['openai', 'vertex_gemini', 'claude', 'alibaba', 'deepseek'] },
  'caribbean':      { provider: 'openai', model: 'gpt-4o', fallbackOrder: ['openai', 'claude', 'vertex_gemini', 'deepseek', 'alibaba'] },
  'eastern_europe': { provider: 'openai', model: 'gpt-4o', fallbackOrder: ['openai', 'claude', 'deepseek', 'vertex_gemini', 'alibaba'] },
  'central_asia':   { provider: 'openai', model: 'gpt-4o', fallbackOrder: ['openai', 'claude', 'vertex_gemini', 'deepseek', 'alibaba'] },
};

// Default fallback for unknown regions
const DEFAULT_ROUTE: RegionRoute = {
  provider: 'vertex_gemini', model: 'gemini-2.5-flash',
  fallbackOrder: ['vertex_gemini', 'consumer_gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
};

/**
 * Detect zone from sub-region code (e.g. 'INDIA_NORTH' → 'india', 'MENA_GULF' → 'mena')
 */
function detectZoneFromRegion(regionCode?: string): string {
  if (!regionCode) return 'default';
  const r = regionCode.toLowerCase();
  
  if (r.startsWith('nam')) return 'nam';
  if (r.startsWith('eu_') || r === 'eu') return 'eu';
  if (r.startsWith('latam')) return 'latam';
  if (r.startsWith('cjk')) return 'cjk';
  if (r.startsWith('mena')) return 'mena';
  if (r.startsWith('india')) return 'india';
  if (r.startsWith('sea')) return 'sea';
  if (r.startsWith('africa')) return 'africa';
  if (r.startsWith('oceania')) return 'oceania';
  if (r.startsWith('caribbean')) return 'caribbean';
  if (r === 'turkey') return 'turkey';
  if (r === 'pakistan') return 'pakistan';
  if (r === 'bangladesh') return 'bangladesh';
  if (r.startsWith('asia_central') || r.startsWith('central_asia')) return 'central_asia';
  if (r.startsWith('eu_ukraine') || r.startsWith('eu_balkans') || r.startsWith('eu_caucasus')) return 'eastern_europe';
  
  return 'default';
}

const SYSTEM_PROMPT = `You are an intelligent content intent analyzer for a video/media production platform (Genie Cast).

Given a natural language description of what a user wants to create, extract structured metadata.

You MUST respond with a JSON object containing:
- label: Short name (2-4 words, title case)
- description: One-sentence description (max 80 chars)
- category: One of "marketing", "education", "enterprise", "social"
- content_types: Array from ["video", "infographic", "animation", "chart", "whitepaper", "statistics_card", "customer_journey", "process_flow", "presentation", "social_post", "3d_avatar", "hero_image", "thumbnail", "banner_ad", "og_image", "podcast_cover", "audio_intro"]
- industry: Primary industry if mentioned (lowercase), or empty string
- capability_requirements: Array from ["video_generation", "image_generation", "tts", "avatar", "3d_generation", "data_visualization", "diagram_generation", "layout_engine", "llm_generation", "pdf_export", "slide_generation", "copywriting", "motion_graphics", "lipsync", "stt", "translation", "ocr"]
- suggested_styles: Array of matching style intents from: ${AVAILABLE_STYLES.slice(0, 40).join(', ')}... (${AVAILABLE_STYLES.length} total styles across cultural heritage, nature, religious, regional modern categories)
- compliance_notes: Any industry-specific compliance considerations
- target_audience_hint: Who this content is likely for
- creative_direction: Brief creative direction note for visual assets

RESPOND ONLY with valid JSON. No markdown, no explanation.`;

// ============================================================================
// VERTEX AI JWT AUTH (shared pattern)
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

async function callGeminiConsumer(apiKey: string, description: string): Promise<any> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: description }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini consumer error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini consumer returned empty response');
  return JSON.parse(text);
}

async function callAlibaba(apiKey: string, description: string): Promise<any> {
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
        parameters: { temperature: 0.3, result_format: 'message' },
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

async function callOpenAI(apiKey: string, model: string, description: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
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
    throw new Error(`OpenAI ${model} error ${response.status}: ${errorText.slice(0, 200)}`);
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

async function callClaude(apiKey: string, model: string, description: string): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: description }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude ${model} error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text;
  if (!text) throw new Error('Claude returned empty response');
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// REGION-AWARE FALLBACK CHAIN BUILDER
// ============================================================================

interface ProviderEntry {
  id: string;
  call: () => Promise<any>;
  provider: string;
  model: string;
}

function buildRegionChain(zone: string, description: string): ProviderEntry[] {
  const route = REGION_LLM_MAP[zone] || DEFAULT_ROUTE;
  const entries: ProviderEntry[] = [];
  const added = new Set<string>();

  const vertexSA = Deno.env.get('GOOGLE_VERTEX_SERVICE_ACCOUNT');
  const geminiKey = getGeminiKey();
  const alibabaKey = getApiKey('ALIBABA_SINGAPORE_API_KEY', 'ALIBABA_API_KEY');
  const openaiKey = getOpenAIKey();
  const claudeKey = getClaudeKey();
  const deepseekKey = getApiKey('DEEPSEEK_API_KEY');

  function tryAdd(providerId: string) {
    if (added.has(providerId)) return;
    added.add(providerId);

    switch (providerId) {
      case 'vertex_gemini':
        if (vertexSA) {
          entries.push({
            id: `vertex_gemini_${route.provider === 'gemini' ? '2.5_pro' : '2.5_flash'}`,
            call: () => callVertexGemini(
              route.provider === 'gemini' ? 'gemini-2.5-pro-preview-05-06' : 'gemini-2.5-flash',
              description
            ),
            provider: 'google-vertex',
            model: route.provider === 'gemini' ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
          });
        }
        break;
      case 'consumer_gemini':
        if (geminiKey) {
          entries.push({
            id: 'consumer_gemini',
            call: () => callGeminiConsumer(geminiKey, description),
            provider: 'google',
            model: 'gemini-2.0-flash',
          });
        }
        break;
      case 'alibaba':
        if (alibabaKey) {
          entries.push({
            id: 'alibaba_qwen',
            call: () => callAlibaba(alibabaKey, description),
            provider: 'alibaba',
            model: 'qwen-max',
          });
        }
        break;
      case 'openai':
        if (openaiKey) {
          entries.push({
            id: `openai_${route.provider === 'openai' ? 'gpt4o' : 'gpt4o_mini'}`,
            call: () => callOpenAI(openaiKey, route.provider === 'openai' ? 'gpt-4o' : 'gpt-4o-mini', description),
            provider: 'openai',
            model: route.provider === 'openai' ? 'gpt-4o' : 'gpt-4o-mini',
          });
        }
        break;
      case 'claude':
        if (claudeKey) {
          entries.push({
            id: `claude_${route.provider === 'claude' ? 'sonnet4' : 'haiku'}`,
            call: () => callClaude(
              claudeKey,
              route.provider === 'claude' ? 'claude-sonnet-4-20250514' : 'claude-3-5-haiku-20241022',
              description
            ),
            provider: 'anthropic',
            model: route.provider === 'claude' ? 'claude-sonnet-4' : 'claude-3-5-haiku',
          });
        }
        break;
      case 'deepseek':
        if (deepseekKey) {
          entries.push({
            id: 'deepseek',
            call: () => callDeepSeek(deepseekKey, description),
            provider: 'deepseek',
            model: 'deepseek-chat',
          });
        }
        break;
    }
  }

  // Build chain in region-specific priority order
  for (const pid of route.fallbackOrder) {
    tryAdd(pid);
  }

  // Ensure we always have consumer_gemini as a safety net
  if (!added.has('consumer_gemini')) tryAdd('consumer_gemini');

  return entries;
}

// ============================================================================
// MULTI-MODAL PROVIDER ENRICHMENT
// ============================================================================

function enrichWithProviderChains(analysis: any) {
  const styles: string[] = analysis.suggested_styles || [];
  
  const providerRouting: Record<string, any> = {};
  
  for (const style of styles) {
    providerRouting[style] = {
      image: STYLE_TO_IMAGE_PROVIDER[style] || DEFAULT_IMAGE_CHAIN,
      video: STYLE_TO_VIDEO_PROVIDER[style] || DEFAULT_VIDEO_CHAIN,
      avatar: STYLE_TO_AVATAR_PROVIDER[style] || null,
      '3d': STYLE_TO_3D_PROVIDER[style] || null,
    };
  }

  return providerRouting;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

interface LLMResult {
  analysis: any;
  provider: string;
  model: string;
  fallback_used: boolean;
  attempts: string[];
  zone: string;
}

async function analyzeWithRegionalRouting(description: string, regionCode?: string): Promise<LLMResult> {
  const zone = detectZoneFromRegion(regionCode);
  const chain = buildRegionChain(zone, description);
  const attempts: string[] = [];

  if (chain.length === 0) {
    throw new Error('No AI providers configured. Set GOOGLE_VERTEX_SERVICE_ACCOUNT, GEMINI_API_KEY, ALIBABA_SINGAPORE_API_KEY, OPENAI_API_KEY, DEEPSEEK_API_KEY, or ANTHROPIC_API_KEY.');
  }

  const routeInfo = REGION_LLM_MAP[zone] || DEFAULT_ROUTE;
  console.log(`[intent-analyzer] Zone: ${zone} | Primary: ${routeInfo.provider}/${routeInfo.model} | Chain: ${chain.map(e => e.id).join(' → ')}`);

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
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
        zone,
      };
    } catch (error) {
      console.warn(`[intent-analyzer] ❌ ${entry.id} failed:`, error.message);
    }
  }

  throw new Error(`All ${attempts.length} providers failed for zone ${zone}: ${attempts.join(' → ')}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, language, region } = await req.json();
    if (!description || typeof description !== 'string') {
      return new Response(JSON.stringify({ error: 'Description required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await analyzeWithRegionalRouting(description, region);

    // Validate suggested styles against the shared routing registry
    const analysis = result.analysis;
    if (analysis.suggested_styles) {
      analysis.suggested_styles = analysis.suggested_styles.filter(
        (s: string) => AVAILABLE_STYLES.includes(s)
      );
    }

    // Enrich with full multi-modal provider chains per style
    const styleProviderChains = enrichWithProviderChains(analysis);

    return new Response(JSON.stringify({
      analysis,
      routing: {
        zone: result.zone,
        provider: result.provider,
        model: result.model,
        fallback_used: result.fallback_used,
        attempts: result.attempts,
        chain_depth: result.attempts.length,
        region_requested: region || null,
        available_styles_count: AVAILABLE_STYLES.length,
      },
      style_provider_chains: styleProviderChains,
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
