import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get API keys for different providers
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { useCase, context = 'Healthcare workflow automation', provider = 'openai' } = await req.json();

    if (!useCase?.trim()) {
      return new Response(JSON.stringify({ error: 'Use case is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 Generating journey suggestions for:', useCase);
    console.log('📋 Context:', context);
    console.log('🎯 Provider:', provider);

    // Generate steps based on provider
    let steps;
    
    switch (provider) {
      case 'openai':
        steps = await generateWithOpenAI(useCase, context);
        break;
      case 'perplexity':
        steps = await generateWithPerplexity(useCase, context);
        break;
      case 'anthropic':
        steps = await generateWithAnthropic(useCase, context);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log('🎉 Successfully generated', steps.length, 'journey steps via', provider);
    
    return new Response(JSON.stringify({ steps }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Error generating journey suggestions:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate journey suggestions',
      steps: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Provider-specific functions
async function generateWithOpenAI(useCase: string, context: string) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are an expert healthcare workflow architect. Generate 3-5 detailed, actionable journey steps for the given use case.

Context: ${context}

Each step should be a JSON object with these exact properties:
- id: string (unique identifier like "step-1", "step-2")
- title: string (clear, actionable title)
- description: string (detailed explanation 2-3 sentences)
- type: one of ["action", "decision", "integration", "validation"]
- connectors: array of connector types needed (e.g., ["EMR", "API", "Database"])
- actions: array of specific actions to take
- requirements: array of what's needed before this step
- stakeholders: array of who's involved (roles like "Nurse", "Provider", "Patient")
- businessValue: string explaining the value/benefit
- riskLevel: one of ["low", "medium", "high"]
- automationLevel: one of ["manual", "semi-automated", "fully-automated"]
- estimatedDuration: number (minutes)
- dependencies: array of other step IDs this depends on

Focus on healthcare-specific workflows, compliance, and practical implementation. Make steps actionable and specific.

Return only a valid JSON array of steps, no additional text or formatting.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Use case: ${useCase}` }
      ],
      max_completion_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('❌ OpenAI API error:', response.status, errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from OpenAI');
  }

  return JSON.parse(data.choices[0].message.content);
}

async function generateWithPerplexity(useCase: string, context: string) {
  if (!perplexityApiKey) {
    throw new Error('Perplexity API key not configured');
  }

  const systemPrompt = `You are an expert healthcare workflow architect. Generate 3-5 detailed, actionable journey steps for the healthcare use case.

Context: ${context}

Return only a JSON array of steps with these properties for each step:
- id, title, description, type (action/decision/integration/validation), connectors, actions, requirements, stakeholders, businessValue, riskLevel (low/medium/high), automationLevel (manual/semi-automated/fully-automated), estimatedDuration (minutes), dependencies

Focus on healthcare workflows, compliance, and practical implementation.`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate journey steps for: ${useCase}` }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('❌ Perplexity API error:', response.status, errorData);
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from Perplexity');
  }

  return JSON.parse(data.choices[0].message.content);
}

async function generateWithAnthropic(useCase: string, context: string) {
  if (!anthropicApiKey) {
    throw new Error('Claude API key not configured');
  }

  const systemPrompt = `You are an expert healthcare workflow architect. Generate 3-5 detailed, actionable journey steps for the healthcare use case.

Context: ${context}

Return only a JSON array of steps with these properties for each step:
- id, title, description, type (action/decision/integration/validation), connectors, actions, requirements, stakeholders, businessValue, riskLevel (low/medium/high), automationLevel (manual/semi-automated/fully-automated), estimatedDuration (minutes), dependencies

Focus on healthcare workflows, compliance, and practical implementation.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        { 
          role: 'user', 
          content: `${systemPrompt}\n\nGenerate journey steps for: ${useCase}` 
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('❌ Anthropic API error:', response.status, errorData);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.content?.[0]?.text) {
    throw new Error('Invalid response format from Claude');
  }

  return JSON.parse(data.content[0].text);
}