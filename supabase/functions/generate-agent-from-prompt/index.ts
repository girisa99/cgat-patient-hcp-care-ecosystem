import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, provider = 'openai', generateConnections = true, includeTemplates = true } = await req.json();

    console.log('Generating agent from prompt:', { prompt, provider });

    const systemPrompt = `You are an expert AI agent workflow designer. Based on the user's natural language description, generate a complete agent workflow with nodes and connections.

IMPORTANT RULES:
1. Always start with a "Start" node (type: "start")
2. Create meaningful, connected workflows based on the prompt
3. Use appropriate node types: start, agent, decision, action, human_review, integration, end
4. Generate realistic connections between nodes that make logical sense
5. Include node templates with proper configuration
6. For team-based requests, create multiple agent nodes with different specializations
7. Auto-connect nodes based on logical workflow progression

RESPONSE FORMAT (JSON):
{
  "agentName": "descriptive name",
  "description": "brief description",
  "nodes": [
    {
      "id": "unique-id",
      "type": "node-type",
      "position": {"x": number, "y": number},
      "data": {
        "label": "Node Label",
        "description": "What this node does",
        "aiProvider": "openai|claude|gemini",
        "model": "specific-model",
        "template": "pre-configured settings",
        "configuration": {}
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "default",
      "animated": false,
      "label": "connection description"
    }
  ],
  "templates": [
    {
      "nodeId": "node-id",
      "templateType": "agent|integration|decision",
      "configuration": "pre-built settings"
    }
  ]
}

Generate a workflow for: "${prompt}"`;

    let response;
    let result;

    switch (provider) {
      case 'openai':
        if (!openAIApiKey) throw new Error('OpenAI API key not configured');
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 3000
          }),
        });
        result = await response.json();
        break;

      case 'claude':
        if (!claudeApiKey) throw new Error('Claude API key not configured');
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': claudeApiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 3000,
            messages: [
              { role: 'user', content: systemPrompt + '\n\n' + prompt }
            ]
          }),
        });
        result = await response.json();
        break;

      case 'gemini':
        if (!geminiApiKey) throw new Error('Gemini API key not configured');
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: systemPrompt + '\n\n' + prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 3000
            }
          }),
        });
        result = await response.json();
        break;

      default:
        throw new Error('Unsupported AI provider');
    }

    console.log('AI response received');

    // Extract and parse the generated content
    let generatedContent;
    switch (provider) {
      case 'openai':
        generatedContent = result.choices[0].message.content;
        break;
      case 'claude':
        generatedContent = result.content[0].text;
        break;
      case 'gemini':
        generatedContent = result.candidates[0].content.parts[0].text;
        break;
    }

    // Parse JSON from the response
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const agentData = JSON.parse(jsonMatch[0]);

    // Enhance with auto-positioning if not provided
    if (agentData.nodes) {
      agentData.nodes.forEach((node: any, index: number) => {
        if (!node.position) {
          node.position = {
            x: (index % 3) * 300 + 100,
            y: Math.floor(index / 3) * 200 + 100
          };
        }
      });
    }

    // Add metadata
    agentData.metadata = {
      generatedAt: new Date().toISOString(),
      provider,
      prompt: prompt.substring(0, 100) + '...'
    };

    console.log('Agent generated successfully:', agentData.agentName);

    return new Response(JSON.stringify(agentData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-agent-from-prompt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate agent from prompt'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});