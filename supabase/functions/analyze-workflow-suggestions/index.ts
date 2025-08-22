import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

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
    const { nodes, context, analytics } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('User authentication required');
    }

    console.log('Analyzing workflow for user:', user.id);
    console.log('Current nodes:', nodes?.length || 0);
    console.log('Analytics data:', analytics?.length || 0);

    // Analyze current workflow structure
    const workflowAnalysis = analyzeWorkflowStructure(nodes, context);
    
    // Generate suggestions based on analysis and analytics
    const suggestions = await generateIntelligentSuggestions(
      workflowAnalysis,
      analytics,
      context
    );

    // Store analysis results in database
    await supabase.from('workflow_analysis').insert({
      workflow_id: context?.workflowId || null,
      user_id: user.id,
      analysis_type: 'suggestions',
      current_nodes: nodes || [],
      analysis_results: workflowAnalysis,
      suggestions_generated: suggestions.length,
      performance_score: workflowAnalysis.performanceScore,
      complexity_score: workflowAnalysis.complexityScore,
      optimization_opportunities: workflowAnalysis.optimizationOpportunities
    });

    // Store suggestions in database
    if (suggestions.length > 0) {
      await supabase.from('node_suggestions').insert(
        suggestions.map(suggestion => ({
          workflow_id: context?.workflowId || null,
          user_id: user.id,
          node_type: suggestion.type,
          suggestion_type: suggestion.category,
          title: suggestion.label,
          description: suggestion.description,
          priority: suggestion.priority,
          confidence_score: suggestion.confidence || 0.8,
          config_template: suggestion.config || {},
          dependencies: suggestion.dependencies || [],
          implementation_notes: suggestion.implementationNotes || null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }))
      );
    }

    return new Response(JSON.stringify({ 
      suggestions,
      analysis: workflowAnalysis,
      analyticsUsed: analytics?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-workflow-suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeWorkflowStructure(nodes: any[], context: any) {
  const nodeTypes = nodes?.map(n => n.type) || [];
  const nodeCount = nodes?.length || 0;
  
  // Calculate complexity score based on node count and connections
  const complexityScore = Math.min(nodeCount / 10, 1.0); // Scale to 0-1
  
  // Calculate performance score based on node types and structure
  const performanceScore = calculatePerformanceScore(nodes, context);
  
  // Identify optimization opportunities
  const optimizationOpportunities = identifyOptimizationOpportunities(nodes);
  
  // Analyze workflow patterns
  const patterns = analyzeWorkflowPatterns(nodes);
  
  return {
    nodeCount,
    nodeTypes,
    complexityScore,
    performanceScore,
    optimizationOpportunities,
    patterns,
    timestamp: new Date().toISOString()
  };
}

function calculatePerformanceScore(nodes: any[], context: any): number {
  if (!nodes || nodes.length === 0) return 0.5;
  
  let score = 0.8; // Start with good base score
  
  // Reduce score for overly complex workflows
  if (nodes.length > 15) score -= 0.2;
  
  // Check for error handling nodes
  const hasErrorHandling = nodes.some(n => 
    n.type === 'escalation' || n.type === 'validation' || n.type === 'fallback'
  );
  if (!hasErrorHandling && nodes.length > 3) score -= 0.1;
  
  // Check for decision nodes in complex workflows
  const hasDecisionLogic = nodes.some(n => n.type === 'decision');
  if (!hasDecisionLogic && nodes.length > 5) score -= 0.1;
  
  return Math.max(0.1, Math.min(1.0, score));
}

function identifyOptimizationOpportunities(nodes: any[]): any[] {
  const opportunities = [];
  
  if (!nodes || nodes.length === 0) {
    return [
      {
        type: 'missing_start',
        title: 'Add Starting Node',
        description: 'Workflow needs at least one starting node',
        impact: 'high'
      }
    ];
  }
  
  // Check for missing error handling
  const hasErrorHandling = nodes.some(n => 
    n.type === 'escalation' || n.type === 'validation'
  );
  if (!hasErrorHandling && nodes.length > 2) {
    opportunities.push({
      type: 'missing_error_handling',
      title: 'Add Error Handling',
      description: 'Consider adding escalation or validation nodes',
      impact: 'medium'
    });
  }
  
  // Check for missing AI capabilities
  const hasAI = nodes.some(n => n.type === 'agent');
  if (!hasAI) {
    opportunities.push({
      type: 'missing_ai',
      title: 'Add AI Agent',
      description: 'AI agents can improve user interaction',
      impact: 'medium'
    });
  }
  
  // Check for workflow bottlenecks
  if (nodes.length > 10) {
    opportunities.push({
      type: 'complexity_reduction',
      title: 'Simplify Workflow',
      description: 'Consider breaking complex workflows into smaller parts',
      impact: 'high'
    });
  }
  
  return opportunities;
}

function analyzeWorkflowPatterns(nodes: any[]): any {
  const patterns = {
    isLinear: true,
    hasBranching: false,
    hasLoops: false,
    hasParallelPaths: false,
    commonNodeSequences: []
  };
  
  if (!nodes || nodes.length === 0) return patterns;
  
  // Simple pattern analysis
  const nodeTypes = nodes.map(n => n.type);
  
  // Check for decision nodes (branching)
  patterns.hasBranching = nodeTypes.includes('decision');
  
  // Check for common sequences
  if (nodeTypes.includes('agent') && nodeTypes.includes('decision')) {
    patterns.commonNodeSequences.push('ai_decision_pattern');
  }
  
  if (nodeTypes.includes('validation') && nodeTypes.includes('escalation')) {
    patterns.commonNodeSequences.push('validation_escalation_pattern');
  }
  
  return patterns;
}

async function generateIntelligentSuggestions(
  analysis: any,
  analytics: any[],
  context: any
): Promise<any[]> {
  const suggestions = [];
  
  // Suggest based on missing patterns
  if (analysis.nodeCount === 0) {
    suggestions.push({
      id: 'start-with-agent',
      type: 'agent',
      label: 'AI Agent Starter',
      description: 'Start your workflow with an AI agent to handle user interactions',
      category: 'next_node',
      priority: 'high',
      confidence: 0.9,
      config: {
        model: 'gpt-4o-mini',
        systemPrompt: 'You are a helpful assistant managing this workflow.',
        capabilities: ['conversation', 'reasoning']
      }
    });
  }
  
  // Suggest next logical nodes based on existing ones
  if (analysis.patterns?.hasBranching && !analysis.nodeTypes.includes('escalation')) {
    suggestions.push({
      id: 'add-escalation',
      type: 'escalation',
      label: 'Add Escalation Rules',
      description: 'Handle edge cases and timeouts with escalation logic',
      category: 'best_practice',
      priority: 'medium',
      confidence: 0.8,
      config: {
        triggers: [{ condition: 'timeout', value: 300, action: 'escalate' }],
        escalationLevels: [{ level: 1, assignTo: 'supervisor', timeout: 600 }]
      }
    });
  }
  
  // Suggest based on analytics (most successful patterns)
  if (analytics && analytics.length > 0) {
    const topPerformingNodes = analytics
      .filter(a => a.successRate > 0.8)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3);
    
    topPerformingNodes.forEach((nodeAnalytic, index) => {
      if (index < 2 && !analysis.nodeTypes.includes(nodeAnalytic.nodeType)) {
        suggestions.push({
          id: `analytics-suggested-${nodeAnalytic.nodeType}`,
          type: nodeAnalytic.nodeType,
          label: `Add ${nodeAnalytic.nodeType} Node`,
          description: `This node type has ${Math.round(nodeAnalytic.successRate * 100)}% success rate`,
          category: 'optimization',
          priority: 'medium',
          confidence: nodeAnalytic.successRate,
          implementationNotes: `Used successfully ${nodeAnalytic.usageCount} times by other users`
        });
      }
    });
  }
  
  // Suggest optimization opportunities
  analysis.optimizationOpportunities?.forEach((opp: any) => {
    if (opp.type === 'missing_error_handling') {
      suggestions.push({
        id: 'add-validation',
        type: 'validation',
        label: 'Add Input Validation',
        description: 'Validate user inputs before processing',
        category: 'best_practice',
        priority: 'medium',
        confidence: 0.7,
        config: {
          validationRules: [
            { field: 'email', type: 'email', required: true }
          ],
          errorHandling: 'stop'
        }
      });
    }
  });
  
  // Connection suggestions
  if (analysis.nodeCount > 1 && analysis.nodeCount < 5) {
    suggestions.push({
      id: 'connect-api',
      type: 'api',
      label: 'Connect External Service',
      description: 'Integrate with external APIs for additional functionality',
      category: 'connection',
      priority: 'low',
      confidence: 0.6,
      config: {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 30
      }
    });
  }
  
  return suggestions;
}