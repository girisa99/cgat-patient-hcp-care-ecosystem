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
      error: error instanceof Error ? error.message : 'Unknown error',
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

  // Core workflow patterns
  if (sourceType === 'start') {
    if (['agent', 'condition', 'llm', 'http'].includes(targetType)) {
      return {
        confidence: 0.95,
        reasoning: 'Start nodes should connect to initial processing nodes',
        type: 'logical',
        autoApply: true
      };
    }
  }

  // Agent to decision/condition patterns
  if (sourceType === 'agent' && ['condition', 'decision'].includes(targetType)) {
    return {
      confidence: 0.9,
      reasoning: 'AI agents typically route to decision logic',
      type: 'workflow',
      autoApply: true
    };
  }

  // Condition/decision to processing patterns
  if (['condition', 'decision'].includes(sourceType) && ['agent', 'http', 'direct_reply', 'database'].includes(targetType)) {
    return {
      confidence: 0.85,
      reasoning: 'Decision points route to appropriate processing nodes',
      type: 'logical',
      autoApply: true
    };
  }

  // HTTP API to database/agent patterns
  if (sourceType === 'http' && ['database', 'agent', 'custom_function'].includes(targetType)) {
    return {
      confidence: 0.8,
      reasoning: 'API calls typically feed into storage or processing',
      type: 'workflow',
      autoApply: true
    };
  }

  // Human input approval patterns
  if (sourceType === 'human_input' && ['agent', 'direct_reply', 'http'].includes(targetType)) {
    return {
      confidence: 0.9,
      reasoning: 'Human approval leads to action execution',
      type: 'workflow',
      autoApply: true
    };
  }

  // Agent to response patterns
  if (['agent', 'llm'].includes(sourceType) && ['direct_reply', 'http', 'database'].includes(targetType)) {
    return {
      confidence: 0.85,
      reasoning: 'AI processing leads to response or data storage',
      type: 'workflow',
      autoApply: true
    };
  }

  // Database to processing patterns
  if (sourceType === 'database' || sourceType === 'retriever') {
    if (['agent', 'llm', 'custom_function'].includes(targetType)) {
      return {
        confidence: 0.8,
        reasoning: 'Data retrieval feeds into processing nodes',
        type: 'workflow',
        autoApply: true
      };
    }
  }

  // Legacy workflow compatibility
  if (sourceType === 'customer' && ['agent', 'condition'].includes(targetType)) {
    return {
      confidence: 0.8,
      reasoning: 'Customer interactions flow to agent processing',
      type: 'workflow',
      autoApply: true
    };
  }

  // Semantic similarity with enhanced patterns
  const semanticScore = calculateSemanticSimilarity(sourceLabel, targetLabel);
  if (semanticScore > 0.6) {
    return {
      confidence: semanticScore,
      reasoning: `Semantically related nodes: ${sourceLabel} → ${targetLabel}`,
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

  // Core AI nodes
  if (type === 'agent' || type === 'llm') {
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
          temperature: 0.7,
          capabilities: ['conversation', 'problem-solving', 'escalation']
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
          temperature: 0.8,
          capabilities: ['content-creation', 'copywriting', 'editing']
        }
      };
    }
  }

  // Decision and condition nodes
  if (type === 'condition' || type === 'decision') {
    return {
      nodeId: node.id,
      templateType: 'smart-router',
      description: 'Intelligent routing based on content analysis',
      configuration: {
        evaluationType: 'rule-based',
        conditions: [
          { field: 'intent', operator: 'equals', value: 'support', target: 'support-agent' },
          { field: 'intent', operator: 'equals', value: 'sales', target: 'sales-agent' },
          { field: 'default', operator: 'always', value: true, target: 'general-agent' }
        ]
      }
    };
  }

  // HTTP and API integration nodes
  if (type === 'http' || label.includes('api') || label.includes('integration') || label.includes('webhook')) {
    return {
      nodeId: node.id,
      templateType: 'api-integration',
      description: 'REST API integration with authentication',
      configuration: {
        method: 'POST',
        endpoint: '',
        headers: { 'Content-Type': 'application/json' },
        authentication: 'bearer-token',
        timeout: 30000,
        retryPolicy: { maxRetries: 3, backoff: 'exponential' }
      }
    };
  }

  // Database and storage nodes
  if (type === 'database' || type === 'retriever') {
    return {
      nodeId: node.id,
      templateType: 'data-storage',
      description: 'Database operations with query optimization',
      configuration: {
        connectionType: 'read-write',
        queryType: 'select',
        indexing: true,
        caching: { enabled: true, ttl: 300 }
      }
    };
  }

  // Communication nodes
  if (type === 'direct_reply') {
    return {
      nodeId: node.id,
      templateType: 'message-sender',
      description: 'Direct message response configuration',
      configuration: {
        messageType: 'text',
        formatting: 'markdown',
        delivery: { immediate: true, fallback: 'email' }
      }
    };
  }

  // Human input nodes
  if (type === 'human_input') {
    return {
      nodeId: node.id,
      templateType: 'approval-workflow',
      description: 'Human approval with timeout and escalation',
      configuration: {
        approvalType: 'single',
        timeout: 3600,
        escalation: { enabled: true, after: 7200 },
        notificationChannels: ['email', 'slack']
      }
    };
  }

  // Custom function nodes
  if (type === 'custom_function') {
    return {
      nodeId: node.id,
      templateType: 'code-executor',
      description: 'Custom code execution environment',
      configuration: {
        runtime: 'javascript',
        timeout: 30,
        memory: '128MB',
        environment: 'sandboxed'
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