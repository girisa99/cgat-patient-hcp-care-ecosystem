import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nodes, edges, analysisType, userPrompt } = await req.json();
    
    // Handle different analysis types
    let analysis;
    
    switch (analysisType) {
      case 'structure':
        analysis = await analyzeStructure(nodes, edges);
        break;
      case 'prompt_alignment':
        analysis = await analyzePromptAlignment(nodes, edges, userPrompt);
        break;
      default:
        analysis = await performComprehensiveAnalysis(nodes, edges);
    }
    
    if (!analysis) {
      analysis = await performComprehensiveAnalysis(nodes, edges);
    }
    
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      issues: [],
      suggestions: [],
      complexity: 'unknown',
      estimatedRunTime: 0,
      estimatedCost: 0,
      riskAssessment: 'high'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performComprehensiveAnalysis(nodes: any[], edges: any[]) {
  const issues = [];
  
  // Basic structure checks
  if (nodes.length === 0) {
    issues.push({
      id: 'no-nodes',
      type: 'error',
      severity: 'high',
      title: 'Empty Workflow',
      description: 'The workflow contains no nodes',
      suggestion: 'Add nodes to create a functional workflow',
      autoFixAvailable: false,
      category: 'structure'
    });
  }

  // Check for isolated nodes
  const connectedNodes = new Set();
  edges.forEach((edge: any) => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  const isolatedNodes = nodes.filter((node: any) => !connectedNodes.has(node.id));
  if (isolatedNodes.length > 0) {
    issues.push({
      id: 'isolated-nodes',
      type: 'warning',
      severity: 'medium',
      title: 'Isolated Nodes Found',
      description: `${isolatedNodes.length} nodes are not connected`,
      suggestion: 'Connect isolated nodes or remove them',
      autoFixAvailable: true,
      category: 'connection'
    });
  }

  // Check for start/end nodes
  const hasStartNode = nodes.some((node: any) => node.type === 'start' || node.data?.isStart);
  const hasEndNode = nodes.some((node: any) => node.type === 'end' || node.data?.isEnd);
  
  if (!hasStartNode) {
    issues.push({
      id: 'no-start-node',
      type: 'error',
      severity: 'high',
      title: 'Missing Start Node',
      description: 'Workflow needs a start node',
      suggestion: 'Add a start node to define workflow entry point',
      autoFixAvailable: true,
      category: 'structure'
    });
  }

  if (!hasEndNode) {
    issues.push({
      id: 'no-end-node',
      type: 'error',
      severity: 'high',
      title: 'Missing End Node',
      description: 'Workflow needs an end node',
      suggestion: 'Add an end node to define workflow completion',
      autoFixAvailable: true,
      category: 'structure'
    });
  }

  // Check for circular dependencies
  const hasCircularDependency = detectCircularDependency(nodes, edges);
  if (hasCircularDependency) {
    issues.push({
      id: 'circular-dependency',
      type: 'error',
      severity: 'high',
      title: 'Circular Dependency Detected',
      description: 'Workflow contains circular references',
      suggestion: 'Restructure workflow to remove circular dependencies',
      autoFixAvailable: false,
      category: 'logic'
    });
  }

  return {
    issues,
    suggestions: [
      'Consider adding more connections between nodes',
      'Validate node configurations',
      'Test workflow execution paths'
    ],
    complexity: nodes.length > 10 ? 'complex' : 'simple',
    estimatedRunTime: nodes.length * 250,
    estimatedCost: nodes.length * 0.001,
    riskAssessment: issues.filter(i => i.severity === 'high').length > 0 ? 'high' : 
                   issues.length > 2 ? 'medium' : 'low'
  };
}

async function analyzeStructure(nodes: any[], edges: any[]) {
  const issues = [];
  
  // Structure-specific analysis
  if (nodes.length === 0) {
    return {
      success: false,
      message: 'Empty workflow structure',
      issues: ['No nodes found']
    };
  }

  const connectedNodes = new Set();
  edges.forEach((edge: any) => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  const isolatedCount = nodes.filter((node: any) => !connectedNodes.has(node.id)).length;
  
  return {
    success: isolatedCount === 0,
    message: isolatedCount > 0 ? `Found ${isolatedCount} isolated nodes` : 'Structure is valid',
    isolatedNodes: isolatedCount,
    totalNodes: nodes.length,
    totalConnections: edges.length
  };
}

async function analyzePromptAlignment(nodes: any[], edges: any[], userPrompt?: string) {
  if (!userPrompt) {
    return {
      alignmentScore: 0,
      suggestions: ['No prompt provided for alignment check'],
      message: 'Cannot analyze alignment without original prompt'
    };
  }

  // Simple keyword-based alignment analysis
  const promptWords = userPrompt.toLowerCase().split(/\s+/);
  const workflowTerms = nodes.map((node: any) => 
    [node.data?.label, node.data?.name, node.type].filter(Boolean).join(' ').toLowerCase()
  ).join(' ');

  let matchingTerms = 0;
  let totalTerms = 0;

  promptWords.forEach(word => {
    if (word.length > 3) { // Only consider meaningful words
      totalTerms++;
      if (workflowTerms.includes(word)) {
        matchingTerms++;
      }
    }
  });

  const alignmentScore = totalTerms > 0 ? Math.round((matchingTerms / totalTerms) * 100) : 0;
  
  const suggestions = [];
  if (alignmentScore < 60) {
    suggestions.push('Consider reviewing workflow against original requirements');
    suggestions.push('Add or modify nodes to better match the prompt');
  }
  if (alignmentScore < 40) {
    suggestions.push('Workflow significantly differs from original prompt');
    suggestions.push('Consider restructuring the workflow');
  }

  return {
    alignmentScore,
    suggestions,
    message: `Prompt alignment: ${alignmentScore}%`,
    matchingTerms,
    totalTerms
  };
}

function detectCircularDependency(nodes: any[], edges: any[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (nodeId: string): boolean => {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter((e: any) => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (hasCycle(edge.target)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (hasCycle(node.id)) return true;
  }

  return false;
}