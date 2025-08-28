import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nodes, edges, generateTemplates = true, intelligentRouting = true } = await req.json();

    console.log('Processing auto-connections for', nodes.length, 'nodes');

    // Analyze nodes and existing connections
    const connectionSuggestions = await generateConnectionSuggestions(nodes, edges);
    const nodeTemplates = generateTemplates ? await generateNodeTemplates(nodes) : [];

    // Auto-apply high confidence connections
    const autoApplied = connectionSuggestions.filter(s => s.autoApply && s.confidence > 0.8).length;

    const result = {
      suggestions: connectionSuggestions,
      templates: nodeTemplates,
      autoApplied,
      metadata: {
        totalNodes: nodes.length,
        existingEdges: edges.length,
        processedAt: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-auto-connections function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [],
      templates: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateConnectionSuggestions(nodes: any[], edges: any[]) {
  const suggestions = [];

  // Rule-based connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[j];

      // Check if connection already exists
      const connectionExists = edges.some(edge => 
        (edge.source === sourceNode.id && edge.target === targetNode.id) ||
        (edge.source === targetNode.id && edge.target === sourceNode.id)
      );

      if (connectionExists) continue;

      const suggestion = analyzeNodeConnection(sourceNode, targetNode);
      if (suggestion) {
        suggestions.push({
          id: `${sourceNode.id}-${targetNode.id}`,
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          ...suggestion
        });
      }
    }
  }

  // AI-powered suggestions for complex workflows
  if (openAIApiKey && nodes.length >= 3) {
    const aiSuggestions = await generateAISuggestions(nodes, edges);
    suggestions.push(...aiSuggestions);
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

function analyzeNodeConnection(sourceNode: any, targetNode: any) {
  const sourceType = sourceNode.type || 'default';
  const targetType = targetNode.type || 'default';
  const sourceLabel = sourceNode.data?.label?.toLowerCase() || '';
  const targetLabel = targetNode.data?.label?.toLowerCase() || '';

  // Start node connections
  if (sourceType === 'start' || sourceLabel.includes('start')) {
    return {
      confidence: 0.9,
      reasoning: 'Start nodes should connect to initial processing nodes',
      type: 'logical',
      autoApply: true
    };
  }

  // Agent workflow connections
  if (sourceType === 'agent' && targetType === 'agent') {
    if (sourceLabel.includes('route') || sourceLabel.includes('decision')) {
      return {
        confidence: 0.8,
        reasoning: 'Routing agents typically connect to specialized agents',
        type: 'workflow',
        autoApply: true
      };
    }
  }

  // Human review connections
  if (targetLabel.includes('human') || targetLabel.includes('review') || targetLabel.includes('approval')) {
    if (sourceLabel.includes('generate') || sourceLabel.includes('create') || sourceLabel.includes('process')) {
      return {
        confidence: 0.85,
        reasoning: 'Generated content should flow to human review',
        type: 'workflow',
        autoApply: true
      };
    }
  }

  // Publishing/output connections
  if (targetLabel.includes('publish') || targetLabel.includes('send') || targetLabel.includes('output')) {
    if (sourceLabel.includes('review') || sourceLabel.includes('approve')) {
      return {
        confidence: 0.9,
        reasoning: 'Approved content should flow to publishing',
        type: 'logical',
        autoApply: true
      };
    }
  }

  // Semantic similarity
  const semanticScore = calculateSemanticSimilarity(sourceLabel, targetLabel);
  if (semanticScore > 0.6) {
    return {
      confidence: semanticScore,
      reasoning: `Semantically related: ${sourceLabel} → ${targetLabel}`,
      type: 'semantic',
      autoApply: semanticScore > 0.8
    };
  }

  return null;
}

async function generateAISuggestions(nodes: any[], edges: any[]) {
  try {
    const prompt = `Analyze this agent workflow and suggest logical connections:

NODES:
${nodes.map(n => `- ${n.id}: ${n.data?.label || 'Unlabeled'} (type: ${n.type || 'default'})`).join('\n')}

EXISTING EDGES:
${edges.map(e => `- ${e.source} → ${e.target}`).join('\n')}

Suggest up to 3 additional connections that would create a logical workflow. Return JSON array:
[{
  "sourceId": "node-id",
  "targetId": "node-id", 
  "confidence": 0.8,
  "reasoning": "why this connection makes sense",
  "type": "ai-recommended",
  "autoApply": false
}]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at analyzing agent workflows and suggesting logical connections.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;
    
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
  }

  return [];
}

async function generateNodeTemplates(nodes: any[]) {
  const templates = [];

  for (const node of nodes) {
    const template = generateTemplateForNode(node);
    if (template) {
      templates.push(template);
    }
  }

  return templates;
}

function generateTemplateForNode(node: any) {
  const label = node.data?.label?.toLowerCase() || '';
  const type = node.type || 'default';

  // Agent nodes
  if (type === 'agent' || label.includes('agent')) {
    if (label.includes('support') || label.includes('help')) {
      return {
        nodeId: node.id,
        templateType: 'customer-support-agent',
        description: 'Pre-configured customer support agent with common responses',
        configuration: {
          aiProvider: 'openai',
          model: 'gpt-4o-mini',
          systemPrompt: 'You are a helpful customer support agent. Be polite, professional, and solution-oriented.',
          maxTokens: 500,
          temperature: 0.7
        }
      };
    }

    if (label.includes('content') || label.includes('generate') || label.includes('write')) {
      return {
        nodeId: node.id,
        templateType: 'content-generator-agent',
        description: 'AI agent optimized for content creation and writing',
        configuration: {
          aiProvider: 'openai',
          model: 'gpt-4o',
          systemPrompt: 'You are a creative content writer. Generate engaging, high-quality content.',
          maxTokens: 1000,
          temperature: 0.8
        }
      };
    }
  }

  // Decision nodes
  if (type === 'decision' || label.includes('route') || label.includes('decision')) {
    return {
      nodeId: node.id,
      templateType: 'smart-router',
      description: 'Intelligent routing based on content analysis',
      configuration: {
        routingRules: [
          { condition: 'intent === "support"', target: 'support-agent' },
          { condition: 'intent === "sales"', target: 'sales-agent' },
          { condition: 'default', target: 'general-agent' }
        ]
      }
    };
  }

  // Integration nodes  
  if (label.includes('api') || label.includes('integration') || label.includes('webhook')) {
    return {
      nodeId: node.id,
      templateType: 'api-integration',
      description: 'REST API integration with authentication',
      configuration: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        authentication: 'bearer-token',
        retryPolicy: { maxRetries: 3, backoff: 'exponential' }
      }
    };
  }

  return null;
}

function calculateSemanticSimilarity(text1: string, text2: string): number {
  // Simple semantic similarity based on common keywords
  const keywords1 = text1.split(/\s+/);
  const keywords2 = text2.split(/\s+/);
  
  const commonWords = keywords1.filter(word => keywords2.includes(word));
  const totalWords = Math.max(keywords1.length, keywords2.length);
  
  return commonWords.length / totalWords;
}