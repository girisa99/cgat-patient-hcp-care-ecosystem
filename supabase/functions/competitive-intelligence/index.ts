import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============================================================================
// DYNAMIC PROVIDER ROUTING (mirrors platform's 4-zone + fallback chain)
// Gemini → OpenAI → Claude → DeepSeek → Alibaba
// ============================================================================

interface ProviderConfig {
  name: string;
  envKey: string;
  call: (apiKey: string, systemPrompt: string, userPrompt: string) => Promise<any>;
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 4000, responseMimeType: 'application/json' },
      }),
    }
  );
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return { result: JSON.parse(text), model: 'gemini-2.5-flash' };
}

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.4,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}`);
  const data = await response.json();
  return { result: JSON.parse(data.choices[0].message.content), model: 'gpt-4o' };
}

async function callClaude(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!response.ok) throw new Error(`Claude ${response.status}`);
  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';
  // Extract JSON from possible markdown wrapping
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return { result: JSON.parse(jsonMatch ? jsonMatch[0] : text), model: 'claude-sonnet-4' };
}

async function callDeepSeek(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.4,
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek ${response.status}`);
  const data = await response.json();
  return { result: JSON.parse(data.choices[0].message.content), model: 'deepseek-chat' };
}

// Provider chain with 5-deep fallback
const PROVIDER_CHAIN: ProviderConfig[] = [
  { name: 'Gemini', envKey: 'GEMINI_API_KEY', call: callGemini },
  { name: 'OpenAI', envKey: 'OPENAI_API_KEY', call: callOpenAI },
  { name: 'Claude', envKey: 'ANTHROPIC_API_KEY', call: callClaude },
  { name: 'DeepSeek', envKey: 'DEEPSEEK_API_KEY', call: callDeepSeek },
];

async function routeToProvider(systemPrompt: string, userPrompt: string): Promise<{ result: any; model: string }> {
  const errors: string[] = [];

  for (const provider of PROVIDER_CHAIN) {
    const apiKey = Deno.env.get(provider.envKey);
    if (!apiKey) {
      errors.push(`${provider.name}: no key`);
      continue;
    }
    try {
      console.log(`[CI] Trying ${provider.name}...`);
      const result = await provider.call(apiKey, systemPrompt, userPrompt);
      console.log(`[CI] ${provider.name} succeeded`);
      return result;
    } catch (err) {
      errors.push(`${provider.name}: ${err.message}`);
      console.warn(`[CI] ${provider.name} failed: ${err.message}`);
    }
  }

  throw new Error(`All providers failed: ${errors.join('; ')}`);
}

// ============================================================================
// REGION MAPPING (mirrors platform's 15 parent → 62+ sub-region structure)
// ============================================================================

const REGION_HIERARCHY: Record<string, string[]> = {
  'north_america': ['us', 'canada', 'mexico'],
  'europe': ['uk', 'germany', 'france', 'spain', 'italy', 'nordics', 'benelux', 'eastern_europe'],
  'mena': ['uae', 'saudi', 'egypt', 'qatar', 'kuwait', 'bahrain', 'oman', 'jordan', 'lebanon', 'iraq', 'morocco', 'tunisia', 'algeria'],
  'india': ['north_india', 'south_india', 'east_india', 'west_india', 'pan_india'],
  'sea': ['singapore', 'malaysia', 'indonesia', 'thailand', 'philippines', 'vietnam'],
  'cjk': ['japan', 'korea', 'china', 'hong_kong', 'taiwan'],
  'latam': ['brazil', 'argentina', 'colombia', 'chile', 'peru'],
  'africa': ['south_africa', 'nigeria', 'kenya', 'ghana', 'ethiopia', 'tanzania'],
  'oceania': ['australia', 'new_zealand'],
  'central_asia': ['turkey', 'pakistan', 'bangladesh', 'kazakhstan', 'uzbekistan'],
  'caribbean': ['jamaica', 'trinidad', 'bahamas', 'barbados'],
  'global': ['global'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, analysisType, scope, scopeFilter, region, subRegion } = await req.json();

    if (action === 'analyze') {
      // Fetch competitor data with optional region filter
      let competitorQuery = supabase
        .from('competitor_profiles')
        .select('name, category, key_features, weaknesses, pricing_range, target_market, regions_active')
        .eq('is_active', true);

      if (region && region !== 'global') {
        competitorQuery = competitorQuery.contains('regions_active', [region]);
      }

      const { data: competitors } = await competitorQuery;

      const { data: features } = await supabase
        .from('feature_comparison_matrix')
        .select('feature_name, genie_capability, genie_details, is_differentiator, competitor_scores')
        .eq('is_differentiator', true);

      const { data: usps } = await supabase
        .from('usp_registry')
        .select('usp_statement, supporting_evidence, competitors_lacking, market_segment');

      // Build analysis prompt with regional context
      const competitorContext = (competitors || []).map(c =>
        `${c.name} (${c.category}): Features: ${(c.key_features || []).join(', ')}. Weaknesses: ${(c.weaknesses || []).join(', ')}. Pricing: ${c.pricing_range}. Regions: ${(c.regions_active || []).join(', ')}`
      ).join('\n');

      const featureContext = (features || []).map(f =>
        `${f.feature_name} [${f.genie_capability}]: ${f.genie_details}. Competitors: ${JSON.stringify(f.competitor_scores)}`
      ).join('\n');

      const uspContext = (usps || []).map(u =>
        `USP: ${u.usp_statement}. Evidence: ${(u.supporting_evidence || []).join(', ')}. Competitors lacking: ${(u.competitors_lacking || []).join(', ')}`
      ).join('\n');

      const regionLabel = region ? `Region: ${region}${subRegion ? ` → ${subRegion}` : ''}` : 'Global';

      const analysisPrompts: Record<string, string> = {
        positioning: `Generate a comprehensive market positioning analysis for Genie Suite${region ? ` focused on the ${regionLabel} market` : ''}. Identify the optimal positioning strategy, key messages for different segments, and specific competitive advantages to emphasize. Include actionable positioning statements.`,
        gap_analysis: `Perform a gap analysis comparing Genie Suite against all competitors${region ? ` in the ${regionLabel} market` : ''}. Identify market gaps we fill that no one else does, gaps we should address, and emerging market needs. Prioritize opportunities by market size and strategic fit.`,
        battle_card: `Create detailed battle cards for each major competitor${region ? ` relevant to the ${regionLabel} market` : ''}. For each competitor, provide: their pitch, our counter-pitch, feature comparison, pricing comparison, and specific objection handling scripts.`,
        usp_summary: `Synthesize all USPs and differentiators into a compelling narrative${region ? ` tailored for the ${regionLabel} market` : ''}. Create tiered messaging: elevator pitch (30 sec), short pitch (2 min), detailed pitch (5 min). Include specific proof points and competitor comparisons.`,
        swot: `Perform a comprehensive SWOT analysis for Genie Suite${region ? ` in the ${regionLabel} market` : ''} in the current AI content creation market. Consider technology trends, competitor movements, market demands, and our unique capabilities.`,
        trend_report: `Analyze current market trends in AI video, presentation, and content creation tools${region ? ` specifically for the ${regionLabel} market` : ''}. Identify emerging technologies, shifting buyer preferences, new competitor entries, and strategic implications for Genie Suite.`,
      };

      const systemPrompt = `You are a senior market analyst specializing in AI SaaS competitive intelligence. Analyze the provided data and generate actionable insights. Be specific with numbers, competitor names, and strategic recommendations. ${region ? `Focus your analysis on the ${regionLabel} market context.` : ''} Return your analysis as structured JSON with fields: title, summary, key_insights (array), recommendations (array), detailed_analysis (object with sections).`;

      const userPrompt = `${analysisPrompts[analysisType] || analysisPrompts.positioning}

## Competitor Landscape
${competitorContext || 'No competitor data available for this scope.'}

## Our Differentiating Features
${featureContext || 'No feature comparison data available.'}

## Our USPs
${uspContext || 'No USPs registered yet.'}

Scope: ${scope}${scopeFilter ? ` - Filter: ${scopeFilter}` : ''}
${regionLabel}

Return valid JSON with these exact fields:
{
  "title": "string",
  "summary": "string (2-3 sentences)",
  "key_insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "detailed_analysis": { "sections": [...] }
}`;

      // Dynamic provider routing with fallback chain
      const { result: analysisResult, model: modelUsed } = await routeToProvider(systemPrompt, userPrompt);

      // Store the analysis
      const { data: stored, error: storeError } = await supabase
        .from('market_analysis_results')
        .insert({
          analysis_type: analysisType,
          scope: region || scope,
          scope_filter: subRegion || scopeFilter || null,
          title: analysisResult.title || `${analysisType} Analysis`,
          summary: analysisResult.summary || '',
          detailed_analysis: analysisResult.detailed_analysis || {},
          key_insights: analysisResult.key_insights || [],
          recommendations: analysisResult.recommendations || [],
          data_sources: (competitors || []).map((c: any) => c.name),
          confidence_score: 0.85,
          model_used: modelUsed,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (storeError) {
        console.error('Failed to store analysis:', storeError);
      }

      return new Response(
        JSON.stringify({ success: true, analysis: stored || analysisResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Get Region Hierarchy ────────────────────────────────────────────
    if (action === 'get_regions') {
      return new Response(
        JSON.stringify({ success: true, regions: REGION_HIERARCHY }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Competitive intelligence error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
