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

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Fetch real categories and node types from database
    const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/workflow_node_categories?is_active=eq.true&order=order_index`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const nodeTypesResponse = await fetch(`${supabaseUrl}/rest/v1/workflow_node_types?is_active=eq.true&select=*,category:workflow_node_categories(*)&order=order_index`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    const categories = await categoriesResponse.json();
    const nodeTypes = await nodeTypesResponse.json();

    // Build dynamic system prompt with real node types
    const categorizedNodes = categories.map(cat => {
      const categoryNodes = nodeTypes.filter(nt => nt.category_id === cat.id);
      return `${cat.display_name}: ${categoryNodes.map(nt => `${nt.type_key} (${nt.display_name})`).join(', ')}`;
    }).join('\n');

    const systemPrompt = `You are an expert AI agent workflow designer. Based on the user's natural language description, generate a complete agent workflow with nodes and connections using the actual node types from our system.

AVAILABLE NODE TYPES BY CATEGORY:
${categorizedNodes}

IMPORTANT RULES:
1. ONLY use node types from the available list above (use exact type_key values)
2. Always start with a node that makes sense for the workflow
3. Create meaningful, connected workflows based on the prompt
4. Generate realistic connections between nodes that make logical sense
5. Include proper node data with category information
6. For team-based requests, create multiple agent nodes with different specializations
7. Auto-connect nodes based on logical workflow progression
8. Choose specific node types that match the workflow requirements
9. Include personalized configuration based on node capabilities
10. Use the display_name for labels and type_key for the actual node type

RESPONSE FORMAT (JSON):
{
  "agentName": "descriptive name",
  "description": "brief description",
  "nodes": [
    {
      "id": "unique-id",
      "type": "type_key_from_database",
      "position": {"x": number, "y": number},
      "data": {
        "label": "Display Name from Database",
        "description": "What this node does",
        "type_key": "type_key_from_database",
        "category": "category_name_from_database",
        "personalized": true,
        "configuration": {},
        "capabilities": [],
        "requirements": {}
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
  "metadata": {
    "usesPersonalizedNodes": true,
    "categories": ["category_names_used"],
    "nodeTypes": ["type_keys_used"]
  }
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
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 4000
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

    console.log('AI response received, status:', response?.status);
    
    if (!response?.ok) {
      throw new Error(`AI API error: ${response?.status} ${response?.statusText}`);
    }

    // Extract and parse the generated content
    let generatedContent;
    switch (provider) {
      case 'openai':
        if (!result.choices?.[0]?.message?.content) {
          throw new Error('OpenAI returned no content');
        }
        generatedContent = result.choices[0].message.content;
        break;
      case 'claude':
        if (!result.content?.[0]?.text) {
          throw new Error('Claude returned no content');
        }
        generatedContent = result.content[0].text;
        break;
      case 'gemini':
        if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Gemini returned no content');
        }
        generatedContent = result.candidates[0].content.parts[0].text;
        break;
    }
    
    console.log('Generated content preview:', generatedContent.substring(0, 300) + '...');

    // Parse JSON from the response - improved parsing with fallback
    let agentData;
    try {
      // First try to parse entire content as JSON
      agentData = JSON.parse(generatedContent);
    } catch {
      // If that fails, try to extract JSON from the content
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not find JSON in response:', generatedContent.substring(0, 500));
        throw new Error('AI response did not contain valid JSON. Response: ' + generatedContent.substring(0, 200));
      }
      
      try {
        agentData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Content:', jsonMatch[0].substring(0, 200));
        
        // Create a fallback minimal workflow if parsing fails completely
        const fallbackNodes = [{
          id: 'start-node',
          type: 'start_flow',
          position: { x: 100, y: 100 },
          data: {
            label: 'Start',
            description: 'Starting node for the workflow',
            type_key: 'start_flow',
            category: 'triggers',
            configuration: {}
          }
        }];
        
        agentData = {
          agentName: 'Generated Workflow',
          description: 'AI-generated workflow from prompt',
          nodes: fallbackNodes,
          edges: [],
          metadata: { fallback: true, originalPrompt: prompt }
        };
      }
    }

    console.log('Parsed agent data successfully, nodes:', agentData.nodes?.length || 0);

    // Ensure nodes have required properties for the canvas
    if (agentData.nodes && Array.isArray(agentData.nodes)) {
      agentData.nodes = agentData.nodes.map((node: any, index: number) => {
        // Auto-position if not provided
        if (!node.position) {
          node.position = {
            x: (index % 3) * 300 + 100,
            y: Math.floor(index / 3) * 200 + 100
          };
        }
        
        // Ensure required data structure
        if (!node.data) {
          node.data = {};
        }
        
        // Ensure we have a label
        if (!node.data.label && !node.label) {
          node.data.label = node.name || node.data.display_name || `Node ${index + 1}`;
        }
        
        // Ensure we have a type_key
        if (!node.data.type_key && node.type) {
          node.data.type_key = node.type;
        }
        
        return node;
      });
      
      console.log('Enhanced nodes count:', agentData.nodes.length);
      console.log('Sample node structure:', JSON.stringify(agentData.nodes[0] || {}, null, 2));
    } else {
      console.warn('No valid nodes array found in agentData');
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