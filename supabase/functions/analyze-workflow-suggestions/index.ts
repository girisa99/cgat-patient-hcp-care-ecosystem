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
    const { 
      nodes, 
      edges, 
      analysisType, 
      userPrompt, 
      aiProvider = 'openai', 
      generateCode = false,
      connectionAnalysis = false,
      nodeSpecificAnalysis = false,
      templateGeneration = false
    } = await req.json();
    
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
      result = await performComprehensiveAnalysis(
        nodes || [], 
        edges || [], 
        connectionAnalysis, 
        nodeSpecificAnalysis, 
        templateGeneration, 
        userPrompt
      );
    }

    console.log('Analysis completed:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-workflow-suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
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
  const analysis: any = await performComprehensiveAnalysis(nodes, edges);
  
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
      model: 'claude-haiku-4-5-20251001',
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

async function performComprehensiveAnalysis(
  nodes: any[], 
  edges: any[], 
  connectionAnalysis = false, 
  nodeSpecificAnalysis = false, 
  templateGeneration = false, 
  userPrompt?: string
) {
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

  // Enhanced analysis features
  let connectionAnalysisResult = null;
  let nodeSpecificFixes: any[] = [];
  let templateNodes: any[] = [];

  if (connectionAnalysis) {
    connectionAnalysisResult = analyzeConnectionFlow(nodes, edges);
  }

  if (nodeSpecificAnalysis) {
    nodeSpecificFixes = generateNodeSpecificFixes(nodes, edges);
  }

  if (templateGeneration) {
    templateNodes = generateTemplateNodes(nodes, edges, userPrompt);
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
                   issues.length > 2 ? 'medium' : 'low',
    connectionAnalysis: connectionAnalysisResult,
    nodeSpecificFixes,
    templateNodes,
    workflowContext: {
      totalNodes: nodes.length,
      totalConnections: edges.length,
      nodeTypes: [...new Set(nodes.map(n => n.type))],
      agentConfigs: nodes.filter(n => n.type === 'agent').map(n => ({
        id: n.id,
        model: n.data?.model,
        provider: n.data?.provider,
        configuration: n.data?.config
      }))
    }
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

// Connection analysis functions
function analyzeConnectionFlow(nodes: any[], edges: any[]) {
  const connectionMap = new Map();
  const nodeConnections = new Map();
  
  // Build connection graph
  edges.forEach(edge => {
    if (!connectionMap.has(edge.source)) {
      connectionMap.set(edge.source, []);
    }
    connectionMap.get(edge.source).push(edge.target);
    
    // Track node connection counts
    nodeConnections.set(edge.source, (nodeConnections.get(edge.source) || 0) + 1);
    nodeConnections.set(edge.target, (nodeConnections.get(edge.target) || 0) + 1);
  });
  
  // Analyze flow paths
  const flowPaths: any[] = [];
  const startNodes = nodes.filter(n => !edges.some(e => e.target === n.id));
  
  startNodes.forEach(startNode => {
    const path = traverseFlow(startNode.id, connectionMap, []);
    flowPaths.push(path);
  });
  
  return {
    connectionMap: Object.fromEntries(connectionMap),
    nodeConnections: Object.fromEntries(nodeConnections),
    flowPaths,
    bottlenecks: findBottlenecks(nodes, edges),
    isolatedNodes: nodes.filter(n => !nodeConnections.has(n.id))
  };
}

function traverseFlow(nodeId: string, connectionMap: Map<string, string[]>, visited: string[]): string[] {
  if (visited.includes(nodeId)) return visited; // Circular dependency
  
  const newPath = [...visited, nodeId];
  const connections = connectionMap.get(nodeId) || [];
  
  if (connections.length === 0) return newPath; // End node
  
  // Follow first connection for simplicity
  return traverseFlow(connections[0], connectionMap, newPath);
}

function findBottlenecks(nodes: any[], edges: any[]) {
  return nodes.filter(node => {
    const incomingCount = edges.filter(e => e.target === node.id).length;
    const outgoingCount = edges.filter(e => e.source === node.id).length;
    return incomingCount > 3 || outgoingCount > 3;
  }).map(node => ({
    nodeId: node.id,
    type: node.type,
    incoming: edges.filter(e => e.target === node.id).length,
    outgoing: edges.filter(e => e.source === node.id).length
  }));
}

function generateNodeSpecificFixes(nodes: any[], edges: any[]) {
  const fixes: any[] = [];
  
  for (const node of nodes) {
    const connectedNodes = edges.filter(e => e.source === node.id || e.target === node.id);
    const nodeIssues = analyzeNodeIssues(node, connectedNodes, nodes);
    
    if (nodeIssues.length > 0) {
      fixes.push({
        nodeId: node.id,
        nodeType: node.type,
        issues: nodeIssues,
        suggestedFixes: generateNodeFixes(node, nodeIssues),
        connections: connectedNodes.length,
        confidence: calculateFixConfidence(node, nodeIssues)
      });
    }
  }
  
  return fixes;
}

function analyzeNodeIssues(node: any, connections: any[], allNodes: any[]) {
  const issues = [];
  
  // Check node configuration
  if (!node.data?.label && !node.data?.name) {
    issues.push('Missing node label or name');
  }
  
  // Agent-specific checks
  if (node.type === 'agent') {
    if (!node.data?.model) issues.push('Missing AI model configuration');
    if (!node.data?.provider) issues.push('Missing AI provider');
    if (!node.data?.systemPrompt) issues.push('Missing system prompt');
  }
  
  // Connection issues
  if (connections.length === 0) {
    issues.push('Node is isolated - no connections');
  }
  
  // Type-specific validations
  switch (node.type) {
    case 'start':
      if (connections.filter(c => c.source === node.id).length === 0) {
        issues.push('Start node has no outgoing connections');
      }
      break;
    case 'end':
      if (connections.filter(c => c.target === node.id).length === 0) {
        issues.push('End node has no incoming connections');
      }
      break;
  }
  
  return issues;
}

function generateNodeFixes(node: any, issues: string[]) {
  const fixes: any[] = [];
  
  issues.forEach(issue => {
    switch (issue) {
      case 'Missing node label or name':
        fixes.push({
          type: 'auto',
          description: 'Add default label',
          code: `node.data.label = "${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node";`,
          confidence: 0.9
        });
        break;
      case 'Missing AI model configuration':
        fixes.push({
          type: 'manual',
          description: 'Configure AI model',
          code: `node.data.model = "gpt-4o-mini"; // Recommended default model`,
          confidence: 0.8
        });
        break;
      case 'Node is isolated - no connections':
        fixes.push({
          type: 'manual',
          description: 'Connect node to workflow',
          code: `// Add edge: { source: "${node.id}", target: "target-node-id" }`,
          confidence: 0.7
        });
        break;
    }
  });
  
  return fixes;
}

function calculateFixConfidence(node: any, issues: string[]) {
  const baseConfidence = 1.0;
  const issueImpact = issues.length * 0.1;
  return Math.max(0.1, baseConfidence - issueImpact);
}

function generateTemplateNodes(nodes: any[], edges: any[], userPrompt?: string) {
  const templates = [];
  
  // Analyze existing pattern
  const nodeTypes = [...new Set(nodes.map(n => n.type))];
  const hasAgents = nodes.some(n => n.type === 'agent');
  const hasStart = nodes.some(n => n.type === 'start');
  const hasEnd = nodes.some(n => n.type === 'end');
  
  // Suggest missing essential nodes
  if (!hasStart) {
    templates.push({
      type: 'start',
      label: 'Start Node',
      data: { label: 'Start', isStart: true },
      position: { x: 100, y: 100 },
      suggested: true,
      reason: 'Every workflow needs a start node'
    });
  }
  
  if (!hasEnd) {
    templates.push({
      type: 'end',
      label: 'End Node', 
      data: { label: 'End', isEnd: true },
      position: { x: 500, y: 300 },
      suggested: true,
      reason: 'Every workflow needs an end node'
    });
  }
  
  // Suggest agents based on user prompt
  if (userPrompt && !hasAgents) {
    const agentSuggestions = analyzePromptForAgents(userPrompt);
    agentSuggestions.forEach((agent, index) => {
      templates.push({
        type: 'agent',
        label: agent.name,
        data: {
          label: agent.name,
          model: agent.recommendedModel,
          provider: 'openai',
          systemPrompt: agent.systemPrompt
        },
        position: { x: 200 + (index * 150), y: 200 },
        suggested: true,
        reason: `Suggested based on prompt analysis: ${agent.reasoning}`
      });
    });
  }
  
  return templates;
}

function analyzePromptForAgents(prompt: string) {
  const suggestions = [];
  
  if (prompt.toLowerCase().includes('supervisor') || prompt.toLowerCase().includes('manage')) {
    suggestions.push({
      name: 'Supervisor Agent',
      recommendedModel: 'gpt-4o-mini',
      systemPrompt: 'You are a supervisor agent responsible for coordinating and managing workflow execution.',
      reasoning: 'Prompt mentions supervision or management'
    });
  }
  
  if (prompt.toLowerCase().includes('review') || prompt.toLowerCase().includes('check')) {
    suggestions.push({
      name: 'Code Reviewer',
      recommendedModel: 'claude-3-7-sonnet-20250219',
      systemPrompt: 'You are a code reviewer agent that analyzes code quality and suggests improvements.',
      reasoning: 'Prompt mentions review or checking tasks'
    });
  }
  
  if (prompt.toLowerCase().includes('generate') || prompt.toLowerCase().includes('create')) {
    suggestions.push({
      name: 'Content Generator',
      recommendedModel: 'gpt-5-2025-08-07',
      systemPrompt: 'You are a content generation agent that creates high-quality content based on requirements.',
      reasoning: 'Prompt mentions generation or creation tasks'
    });
  }
  
  return suggestions;
}