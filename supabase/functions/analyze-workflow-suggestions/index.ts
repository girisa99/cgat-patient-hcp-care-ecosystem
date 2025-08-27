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
    const { nodes, edges, analysisType, userPrompt, aiProvider = 'openai', generateCode = false } = await req.json();
    
    console.log('Analyzing workflow with:', {
      nodesCount: nodes?.length || 0,
      edgesCount: edges?.length || 0,
      analysisType: analysisType || 'comprehensive',
      aiProvider,
      generateCode
    });

    let result;
    
    if (analysisType === 'structure') {
      result = analyzeStructure(nodes || [], edges || []);
    } else if (analysisType === 'prompt-alignment') {
      result = analyzePromptAlignment(nodes || [], edges || [], userPrompt);
    } else if (analysisType === 'ai-enhanced') {
      result = await performAIEnhancedAnalysis(nodes || [], edges || [], aiProvider, generateCode);
    } else {
      result = await performComprehensiveAnalysis(nodes || [], edges || []);
    }

    console.log('Analysis completed:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-workflow-suggestions:', error);
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

// AI-Enhanced Analysis using multiple providers
async function performAIEnhancedAnalysis(nodes: any[], edges: any[], provider: string, generateCode: boolean) {
  const analysis = await performComprehensiveAnalysis(nodes, edges);
  
  if (generateCode && analysis.issues.length > 0) {
    const codeFixSuggestions = await generateCodeFixes(analysis.issues, provider);
    analysis.codeFixSuggestions = codeFixSuggestions;
  }
  
  const aiSuggestions = await getAISuggestions(nodes, edges, analysis, provider);
  analysis.aiSuggestions = aiSuggestions;
  
  return analysis;
}

// Generate code fixes using AI providers
async function generateCodeFixes(issues: any[], provider: string) {
  const fixes = [];
  
  for (const issue of issues) {
    try {
      const fix = await generateFixForIssue(issue, provider);
      if (fix) {
        fixes.push({
          issueType: issue.type,
          description: issue.description,
          generatedCode: fix.code,
          explanation: fix.explanation,
          confidence: fix.confidence,
          provider
        });
      }
    } catch (error) {
      console.error(`Failed to generate fix for issue ${issue.type}:`, error);
    }
  }
  
  return fixes;
}

// Generate fix for specific issue using AI
async function generateFixForIssue(issue: any, provider: string) {
  const prompt = `Fix this workflow issue: ${issue.description}
Issue Type: ${issue.type}
Severity: ${issue.severity}

Generate TypeScript/JavaScript code to fix this issue. Include:
1. The fix code
2. Explanation of the fix
3. Confidence level (1-10)

Respond in JSON format:
{
  "code": "// Your fix code here",
  "explanation": "Explanation of the fix",
  "confidence": 8
}`;

  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(prompt);
      case 'claude':
        return await callClaude(prompt);
      case 'gemini':
        return await callGemini(prompt);
      default:
        return await callOpenAI(prompt);
    }
  } catch (error) {
    console.error(`AI ${provider} call failed:`, error);
    return null;
  }
}

// OpenAI API call
async function callOpenAI(prompt: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert workflow analyzer and code generator. Generate clean, efficient fixes for workflow issues.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      code: content,
      explanation: "Generated fix code",
      confidence: 7
    };
  }
}

// Claude API call
async function callClaude(prompt: string) {
  const apiKey = Deno.env.get('CLAUDE_API_KEY');
  if (!apiKey) throw new Error('CLAUDE_API_KEY not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ]
    }),
  });

  const data = await response.json();
  const content = data.content[0].text;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      code: content,
      explanation: "Generated fix code",
      confidence: 8
    };
  }
}

// Gemini API call
async function callGemini(prompt: string) {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.3
      }
    }),
  });

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      code: content,
      explanation: "Generated fix code",
      confidence: 7
    };
  }
}

// Get AI suggestions for workflow optimization
async function getAISuggestions(nodes: any[], edges: any[], analysis: any, provider: string) {
  const prompt = `Analyze this workflow and provide optimization suggestions:
Nodes: ${nodes.length}
Edges: ${edges.length}
Current Issues: ${analysis.issues.map((i: any) => i.description).join(', ')}
Complexity: ${analysis.complexity}

Provide 3-5 specific suggestions to improve the workflow.`;

  try {
    const response = await generateFixForIssue({ 
      description: prompt, 
      type: 'optimization',
      severity: 'medium' 
    }, provider);
    
    return response?.explanation || "No specific suggestions available";
  } catch (error) {
    console.error('Failed to get AI suggestions:', error);
    return "AI suggestions temporarily unavailable";
  }
}

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