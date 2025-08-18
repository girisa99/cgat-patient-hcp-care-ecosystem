import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { useCase, modelType, context } = await req.json();

    if (!useCase || typeof useCase !== 'string') {
      return new Response(JSON.stringify({ error: 'useCase is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!PERPLEXITY_API_KEY) {
      return new Response(JSON.stringify({ error: 'PERPLEXITY_API_KEY is not set in Edge Function Secrets' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt =
      'You are an expert healthcare workflow designer. Return ONLY valid JSON. ' +
      'Generate a comprehensive, sequential customer journey as an array of steps. ' +
      'Each step must be a JSON object with keys: id, title, description, type (action|decision|integration|validation), ' +
      'connectors (string[]), actions (string[]), requirements (string[]), stakeholders (string[]), businessValue (string), ' +
      'riskLevel (low|medium|high), automationLevel (manual|\n' +
      'semi-automated|fully-automated), estimatedDuration (number, minutes), dependencies (string[]).';

    const userPrompt = `Use case: ${useCase}\n` +
      `Preferred model type: ${modelType || 'llm'}\n` +
      `Additional context: ${context || 'N/A'}\n` +
      `Generate as many steps as needed (no hard limit). Respond ONLY with a JSON array.`;

    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;

    let steps: unknown = [];
    try {
      steps = JSON.parse(content);
    } catch (_) {
      const match = typeof content === 'string' ? content.match(/[\[{][\s\S]*[\]}]/) : null;
      if (match) {
        steps = JSON.parse(match[0]);
      }
    }

    if (!Array.isArray(steps)) {
      throw new Error('Invalid AI response format (expected JSON array)');
    }

    const normalized = (steps as any[]).map((s, idx) => ({
      id: s.id || `ai-step-${Date.now()}-${idx + 1}`,
      title: s.title ?? `Step ${idx + 1}`,
      description: s.description ?? '',
      type: ['action','decision','integration','validation'].includes(s.type) ? s.type : 'action',
      connectors: Array.isArray(s.connectors) ? s.connectors : [],
      actions: Array.isArray(s.actions) ? s.actions : [],
      requirements: Array.isArray(s.requirements) ? s.requirements : [],
      stakeholders: Array.isArray(s.stakeholders) ? s.stakeholders : [],
      businessValue: s.businessValue ?? '',
      riskLevel: ['low','medium','high'].includes(s.riskLevel) ? s.riskLevel : 'low',
      automationLevel: ['manual','semi-automated','fully-automated'].includes(s.automationLevel) ? s.automationLevel : 'manual',
      estimatedDuration: typeof s.estimatedDuration === 'number' ? s.estimatedDuration : 30,
      dependencies: Array.isArray(s.dependencies) ? s.dependencies : []
    }));

    return new Response(JSON.stringify({ steps: normalized }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-journey-suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
