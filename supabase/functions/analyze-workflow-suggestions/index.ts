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
    const { nodes, edges } = await req.json();
    
    // Analyze workflow for issues
    const issues = [];
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

    const analysis = {
      issues,
      suggestions: ['Consider adding more connections between nodes'],
      complexity: nodes.length > 10 ? 'complex' : 'simple',
      estimatedRunTime: nodes.length * 250,
      estimatedCost: nodes.length * 0.001,
      riskAssessment: issues.length > 2 ? 'high' : 'low'
    };
    
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