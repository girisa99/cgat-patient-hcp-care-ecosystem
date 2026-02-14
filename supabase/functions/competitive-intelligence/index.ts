import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, analysisType, scope, scopeFilter } = await req.json();

    if (action === 'analyze') {
      // Fetch competitor data for context
      const { data: competitors } = await supabase
        .from('competitor_profiles')
        .select('name, category, key_features, weaknesses, pricing_range, target_market')
        .eq('is_active', true);

      const { data: features } = await supabase
        .from('feature_comparison_matrix')
        .select('feature_name, genie_capability, genie_details, is_differentiator, competitor_scores')
        .eq('is_differentiator', true);

      const { data: usps } = await supabase
        .from('usp_registry')
        .select('usp_statement, supporting_evidence, competitors_lacking, market_segment');

      // Build analysis prompt
      const competitorContext = (competitors || []).map(c =>
        `${c.name} (${c.category}): Features: ${(c.key_features || []).join(', ')}. Weaknesses: ${(c.weaknesses || []).join(', ')}. Pricing: ${c.pricing_range}`
      ).join('\n');

      const featureContext = (features || []).map(f =>
        `${f.feature_name} [${f.genie_capability}]: ${f.genie_details}. Competitors: ${JSON.stringify(f.competitor_scores)}`
      ).join('\n');

      const uspContext = (usps || []).map(u =>
        `USP: ${u.usp_statement}. Evidence: ${(u.supporting_evidence || []).join(', ')}. Competitors lacking: ${(u.competitors_lacking || []).join(', ')}`
      ).join('\n');

      const analysisPrompts: Record<string, string> = {
        positioning: `Generate a comprehensive market positioning analysis for Genie Suite. Identify the optimal positioning strategy, key messages for different segments, and specific competitive advantages to emphasize. Include actionable positioning statements.`,
        gap_analysis: `Perform a gap analysis comparing Genie Suite against all competitors. Identify market gaps we fill that no one else does, gaps we should address, and emerging market needs. Prioritize opportunities by market size and strategic fit.`,
        battle_card: `Create detailed battle cards for each major competitor. For each competitor, provide: their pitch, our counter-pitch, feature comparison, pricing comparison, and specific objection handling scripts.`,
        usp_summary: `Synthesize all USPs and differentiators into a compelling narrative. Create tiered messaging: elevator pitch (30 sec), short pitch (2 min), detailed pitch (5 min). Include specific proof points and competitor comparisons.`,
        swot: `Perform a comprehensive SWOT analysis for Genie Suite in the current AI content creation market. Consider technology trends, competitor movements, market demands, and our unique capabilities.`,
        trend_report: `Analyze current market trends in AI video, presentation, and content creation tools. Identify emerging technologies, shifting buyer preferences, new competitor entries, and strategic implications for Genie Suite.`,
      };

      const systemPrompt = `You are a senior market analyst specializing in AI SaaS competitive intelligence. Analyze the provided data and generate actionable insights. Be specific with numbers, competitor names, and strategic recommendations. Return your analysis as structured JSON with fields: title, summary, key_insights (array), recommendations (array), detailed_analysis (object with sections).`;

      const userPrompt = `${analysisPrompts[analysisType] || analysisPrompts.positioning}

## Competitor Landscape
${competitorContext}

## Our Differentiating Features
${featureContext}

## Our USPs
${uspContext}

Scope: ${scope}${scopeFilter ? ` - Filter: ${scopeFilter}` : ''}

Return valid JSON with these exact fields:
{
  "title": "string",
  "summary": "string (2-3 sentences)",
  "key_insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "detailed_analysis": { "sections": [...] }
}`;

      // Try Gemini first, fallback to OpenAI
      let analysisResult: any;
      const geminiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
      const openaiKey = Deno.env.get('OPENAI_API_KEY');

      if (geminiKey) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 4000, responseMimeType: 'application/json' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          analysisResult = JSON.parse(text);
        }
      }

      if (!analysisResult && openaiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 4000,
            temperature: 0.4,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          analysisResult = JSON.parse(data.choices[0].message.content);
        }
      }

      if (!analysisResult) {
        throw new Error('No AI provider available. Configure GEMINI_API_KEY or OPENAI_API_KEY.');
      }

      // Store the analysis
      const { data: stored, error: storeError } = await supabase
        .from('market_analysis_results')
        .insert({
          analysis_type: analysisType,
          scope,
          scope_filter: scopeFilter || null,
          title: analysisResult.title || `${analysisType} Analysis`,
          summary: analysisResult.summary || '',
          detailed_analysis: analysisResult.detailed_analysis || {},
          key_insights: analysisResult.key_insights || [],
          recommendations: analysisResult.recommendations || [],
          data_sources: (competitors || []).map((c: any) => c.name),
          confidence_score: 0.85,
          model_used: geminiKey ? 'gemini-2.5-flash' : 'gpt-4.1',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
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
