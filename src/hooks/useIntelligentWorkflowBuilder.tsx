import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useWorkflowNodes } from './useWorkflowNodes';
import { useMasterToast } from './useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface IntelligentSuggestion {
  id: string;
  type: 'node_addition' | 'connection' | 'configuration' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  nodeType?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  configKey?: string;
  configValue?: any;
  reasoning: string;
}

interface UseCaseAnalysis {
  industry: string;
  complexity: 'low' | 'medium' | 'high';
  requiredNodeTypes: string[];
  suggestedConnections: Array<{
    from: string;
    to: string;
    reason: string;
    confidence: number;
  }>;
  riskFactors: string[];
  businessValue: string;
}

interface NodeCompatibility {
  nodeId: string;
  compatibleWith: string[];
  incompatibleWith: string[];
  preferredConnections: Array<{
    nodeType: string;
    weight: number;
    reason: string;
  }>;
  connectorTypes: Array<{
    id: string;
    name: string;
    dataType: string;
    required: boolean;
  }>;
}

export const useIntelligentWorkflowBuilder = () => {
  const { nodeTypes, categories } = useWorkflowNodes();
  const { showSuccess, showError } = useMasterToast();
  
  const [suggestions, setSuggestions] = useState<IntelligentSuggestion[]>([]);
  const [useCaseAnalysis, setUseCaseAnalysis] = useState<UseCaseAnalysis | null>(null);
  const [nodeCompatibilities, setNodeCompatibilities] = useState<Map<string, NodeCompatibility>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Analyze use case and generate intelligent suggestions
  const analyzeUseCase = useCallback(async (useCase: string, nodes: Node[] = [], edges: Edge[] = []) => {
    setIsAnalyzing(true);
    
    try {
      // Call AI service to analyze the use case
      const { data, error } = await supabase.functions.invoke('analyze-workflow-usecase', {
        body: { 
          useCase, 
          currentNodes: nodes.map(n => ({ 
            id: n.id, 
            type: n.type, 
            data: n.data 
          })), 
          currentEdges: edges.map(e => ({ 
            source: e.source, 
            target: e.target 
          })) 
        }
      });

      if (error) throw error;

      const analysis: UseCaseAnalysis = data.analysis;
      const newSuggestions: IntelligentSuggestion[] = data.suggestions;

      setUseCaseAnalysis(analysis);
      setSuggestions(newSuggestions);
      
      showSuccess(`Found ${newSuggestions.length} intelligent suggestions for your workflow`);
      
      return { analysis, suggestions: newSuggestions };
    } catch (error) {
      console.error('Use case analysis failed:', error);
      showError('Failed to analyze use case');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [showSuccess, showError]);

  // Get intelligent node suggestions based on current workflow state
  const getIntelligentNodeSuggestions = useCallback((nodes: Node[], edges: Edge[], scenario?: string) => {
    const existingNodeTypes = new Set(nodes.map(n => n.type));
    const suggestions: IntelligentSuggestion[] = [];

    // Healthcare-specific intelligence
    const scenarioLower = scenario?.toLowerCase() || '';
    if (scenarioLower.includes('patient') || scenarioLower.includes('healthcare')) {
      if (!existingNodeTypes.has('healthcare-compliance')) {
        suggestions.push({
          id: `suggest-${Date.now()}-1`,
          type: 'node_addition',
          title: 'Add Healthcare Compliance Node',
          description: 'Ensure HIPAA compliance and patient data protection',
          confidence: 0.9,
          nodeType: 'healthcare-compliance',
          reasoning: 'Healthcare workflows require compliance monitoring for patient data security'
        });
      }
      
      if (!existingNodeTypes.has('ehr-integration')) {
        suggestions.push({
          id: `suggest-${Date.now()}-2`,
          type: 'node_addition',
          title: 'Add EHR Integration Node',
          description: 'Connect to Electronic Health Records system',
          confidence: 0.85,
          nodeType: 'ehr-integration',
          reasoning: 'Patient workflows typically need access to medical records'
        });
      }
    }

    // AI Agent optimization
    const agentNodes = nodes.filter(n => n.type === 'agent' || n.type === 'single-agent' || n.type === 'multi-agent');
    if (agentNodes.length > 2) {
      suggestions.push({
        id: `suggest-${Date.now()}-3`,
        type: 'optimization',
        title: 'Consider Multi-Agent Coordination',
        description: 'Multiple agents detected. Add coordination node for better performance.',
        confidence: 0.75,
        nodeType: 'agent-coordinator',
        reasoning: 'Multiple agents can benefit from centralized coordination'
      });
    }

    return suggestions;
  }, []);

  // Analyze node compatibility and suggest optimal connections
  const analyzeNodeCompatibility = useCallback((sourceNode: Node, targetNode: Node, existingEdges: Edge[]) => {
    const sourceType = sourceNode.type || 'unknown';
    const targetType = targetNode.type || 'unknown';
    
    // Define compatibility rules
    const compatibilityRules = {
      'start': { compatible: ['agent', 'single-agent', 'multi-agent', 'condition'], weight: 0.9 },
      'agent': { compatible: ['condition', 'action', 'human-input', 'end'], weight: 0.8 },
      'single-agent': { compatible: ['condition', 'action', 'multi-agent', 'end'], weight: 0.8 },
      'multi-agent': { compatible: ['action', 'human-input', 'end'], weight: 0.7 },
      'condition': { compatible: ['agent', 'action', 'human-input', 'end'], weight: 0.8 },
      'action': { compatible: ['condition', 'end', 'agent'], weight: 0.7 },
      'human-input': { compatible: ['condition', 'action', 'end'], weight: 0.8 },
      'healthcare-compliance': { compatible: ['agent', 'action', 'end'], weight: 0.9 },
      'ehr-integration': { compatible: ['agent', 'multi-agent', 'action'], weight: 0.85 }
    };

    const sourceRule = compatibilityRules[sourceType as keyof typeof compatibilityRules];
    if (!sourceRule) return { compatible: false, confidence: 0, reason: 'Unknown source node type' };

    const isCompatible = sourceRule.compatible.includes(targetType);
    const confidence = isCompatible ? sourceRule.weight : 0.2;
    
    // Check for existing connections
    const hasExistingConnection = existingEdges.some(e => 
      e.source === sourceNode.id && e.target === targetNode.id
    );

    if (hasExistingConnection) {
      return { compatible: false, confidence: 0, reason: 'Connection already exists' };
    }

    const reason = isCompatible 
      ? `${sourceType} nodes work well with ${targetType} nodes`
      : `${sourceType} nodes are not typically connected to ${targetType} nodes`;

    return { compatible: isCompatible, confidence, reason };
  }, []);

  // Generate optimal workflow connections
  const generateOptimalConnections = useCallback((nodes: Node[], scenario?: string) => {
    const connections: Array<{ source: string; target: string; confidence: number; reason: string }> = [];
    
    // Find start and end nodes
    const startNode = nodes.find(n => n.type === 'start');
    const endNodes = nodes.filter(n => n.type === 'end');
    const agentNodes = nodes.filter(n => n.type?.includes('agent'));
    const actionNodes = nodes.filter(n => n.type === 'action');
    const conditionNodes = nodes.filter(n => n.type === 'condition');

    // Create flow: Start -> Agent -> Condition -> Action/End
    if (startNode && agentNodes.length > 0) {
      connections.push({
        source: startNode.id,
        target: agentNodes[0].id,
        confidence: 0.9,
        reason: 'Start nodes should connect to primary processing agents'
      });
    }

    // Connect agents to conditions or actions
    agentNodes.forEach(agent => {
      if (conditionNodes.length > 0) {
        const condition = conditionNodes[0];
        connections.push({
          source: agent.id,
          target: condition.id,
          confidence: 0.8,
          reason: 'Agents typically route to decision points'
        });
      } else if (actionNodes.length > 0) {
        connections.push({
          source: agent.id,
          target: actionNodes[0].id,
          confidence: 0.7,
          reason: 'Agents can directly trigger actions'
        });
      }
    });

    // Connect conditions to actions and end nodes
    conditionNodes.forEach(condition => {
      if (actionNodes.length > 0) {
        connections.push({
          source: condition.id,
          target: actionNodes[0].id,
          confidence: 0.8,
          reason: 'Conditions route to appropriate actions'
        });
      }
      if (endNodes.length > 0) {
        connections.push({
          source: condition.id,
          target: endNodes[0].id,
          confidence: 0.7,
          reason: 'Some conditions may end the workflow'
        });
      }
    });

    // Connect actions to end nodes
    actionNodes.forEach(action => {
      if (endNodes.length > 0) {
        connections.push({
          source: action.id,
          target: endNodes[0].id,
          confidence: 0.9,
          reason: 'Actions typically complete the workflow'
        });
      }
    });

    return connections;
  }, []);

  // Suggest connector swaps within nodes
  const suggestConnectorSwaps = useCallback((node: Node, availableConnectors: string[]) => {
    const currentConnectors = node.data?.connectors || [];
    const suggestions: IntelligentSuggestion[] = [];

    // Analyze node type and suggest better connectors
    if (node.type?.includes('agent')) {
      // For AI agents, suggest vision models if handling images
      if ((node.data?.capabilities as string[])?.includes('vision') && !currentConnectors.includes('gpt-4-vision')) {
        suggestions.push({
          id: `connector-swap-${Date.now()}`,
          type: 'configuration',
          title: 'Upgrade to Vision-Capable Model',
          description: 'Switch to GPT-4 Vision for enhanced image processing',
          confidence: 0.85,
          configKey: 'model',
          configValue: 'gpt-4-vision',
          reasoning: 'Vision capabilities require specialized models'
        });
      }

      // Suggest multi-modal models for complex tasks
      if ((node.data?.capabilities as string[])?.length > 3 && !currentConnectors.includes('gpt-4o')) {
        suggestions.push({
          id: `connector-swap-${Date.now()}-2`,
          type: 'configuration',
          title: 'Consider Multi-Modal Model',
          description: 'Upgrade to GPT-4o for better multi-task performance',
          confidence: 0.8,
          configKey: 'model',
          configValue: 'gpt-4o',
          reasoning: 'Complex agents benefit from advanced multi-modal capabilities'
        });
      }
    }

    return suggestions;
  }, []);

  // Optimize entire workflow based on performance metrics
  const optimizeWorkflow = useCallback(async (nodes: Node[], edges: Edge[], metrics?: any) => {
    setIsOptimizing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('optimize-workflow', {
        body: {
          nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
          edges: edges.map(e => ({ source: e.source, target: e.target, data: e.data })),
          metrics
        }
      });

      if (error) throw error;

      const optimizations: IntelligentSuggestion[] = data.optimizations;
      setSuggestions(prev => [...prev, ...optimizations]);
      
      showSuccess(`Generated ${optimizations.length} optimization suggestions`);
      return optimizations;
    } catch (error) {
      console.error('Workflow optimization failed:', error);
      showError('Failed to optimize workflow');
      return [];
    } finally {
      setIsOptimizing(false);
    }
  }, [showSuccess, showError]);

  // Apply a suggestion to the workflow
  const applySuggestion = useCallback((suggestion: IntelligentSuggestion, nodes: Node[], setNodes: (nodes: Node[]) => void) => {
    switch (suggestion.type) {
      case 'node_addition':
        if (suggestion.nodeType) {
          const newNode: Node = {
            id: `${suggestion.nodeType}-${Date.now()}`,
            type: suggestion.nodeType,
            position: { x: 300, y: 200 },
            data: { 
              label: suggestion.title,
              description: suggestion.description,
              aiGenerated: true,
              confidence: suggestion.confidence
            }
          };
          setNodes([...nodes, newNode]);
          showSuccess(`Added ${suggestion.title}`);
        }
        break;
        
      case 'configuration':
        if (suggestion.configKey && suggestion.configValue) {
          const updatedNodes = nodes.map(node => {
            if (suggestion.nodeType && node.type === suggestion.nodeType) {
              return {
                ...node,
                data: {
                  ...node.data,
                  [suggestion.configKey!]: suggestion.configValue
                }
              };
            }
            return node;
          });
          setNodes(updatedNodes);
          showSuccess(`Applied ${suggestion.title}`);
        }
        break;
    }

    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, [showSuccess]);

  return {
    suggestions,
    useCaseAnalysis,
    nodeCompatibilities,
    isAnalyzing,
    isOptimizing,
    analyzeUseCase,
    getIntelligentNodeSuggestions,
    analyzeNodeCompatibility,
    generateOptimalConnections,
    suggestConnectorSwaps,
    optimizeWorkflow,
    applySuggestion,
    setSuggestions
  };
};

export default useIntelligentWorkflowBuilder;