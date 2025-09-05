import React, { useCallback } from 'react';
import { toast } from 'sonner';
import { MarkerType } from '@xyflow/react';
import { useUniversalAI } from '@/hooks/useUniversalAI';

interface UseAIWorkflowIntegrationProps {
  onWorkflowUpdate: (nodes: any[], edges: any[]) => void;
  onNodeGenerated: (node: any) => void;
}

export const useAIWorkflowIntegration = ({
  onWorkflowUpdate,
  onNodeGenerated
}: UseAIWorkflowIntegrationProps) => {
  const { generateAgent, isLoading } = useUniversalAI();

  const handleAIWorkflowGeneration = useCallback(async (prompt: string, provider: 'openai' | 'claude' | 'gemini' = 'openai') => {
    if (!prompt.trim()) {
      toast.error('Please provide a workflow description');
      return;
    }

    try {
      console.log('Generating workflow from AI prompt:', { prompt, provider });
      
      const result = await generateAgent(prompt, provider);
      console.log('AI workflow generation result:', result);

      if (!result) {
        throw new Error('No workflow generated from AI');
      }

      // Handle different response structures
      let workflow = result;
      if (result.workflow) workflow = result.workflow;
      if (result.data?.workflow) workflow = result.data.workflow;
      if (result.agent) workflow = result.agent;

      // Extract nodes and edges with enhanced validation
      const rawNodes: any[] = Array.isArray(workflow?.nodes) ? workflow.nodes : [];
      const rawEdges: any[] = Array.isArray(workflow?.edges) ? workflow.edges : 
                             Array.isArray(workflow?.connections) ? workflow.connections : [];

      if (rawNodes.length === 0) {
        // Create a single agent node if no structured workflow returned
        const agentNode = {
          id: `ai-agent-${Date.now()}`,
          type: 'agent',
          position: { x: 300, y: 200 },
          data: {
            label: workflow.name || 'AI Generated Agent',
            description: workflow.description || prompt,
            configuration: workflow.configuration || workflow.config || {},
            aiGenerated: true,
            originalPrompt: prompt
          }
        };
        
        onNodeGenerated(agentNode);
        toast.success('AI Agent created successfully!');
        return;
      }

      // Process and normalize nodes
      const processedNodes = rawNodes.map((node: any, index: number) => {
        const nodeId = node.id || `ai-node-${Date.now()}-${index}`;
        
        return {
          id: nodeId,
          type: inferNodeType(node),
          position: node.position || { 
            x: 100 + (index * 250), 
            y: 100 + Math.floor(index / 3) * 150 
          },
          data: {
            label: node.label || node.name || node.title || `Generated Node ${index + 1}`,
            description: node.description || node.purpose || 'AI-generated workflow node',
            configuration: node.configuration || node.config || {},
            aiGenerated: true,
            originalPrompt: prompt,
            nodeIndex: index,
            ...node.data
          }
        };
      });

      // Process and normalize edges
      const processedEdges = rawEdges.map((edge: any, index: number) => {
        let source = edge.source || edge.from || edge.start;
        let target = edge.target || edge.to || edge.end;
        
        // Handle node index references
        if (typeof source === 'number' && processedNodes[source]) {
          source = processedNodes[source].id;
        }
        if (typeof target === 'number' && processedNodes[target]) {
          target = processedNodes[target].id;
        }
        
        return {
          id: edge.id || `ai-edge-${Date.now()}-${index}`,
          source: source,
          target: target,
          type: edge.type || 'default',
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
          data: {
            aiGenerated: true,
            condition: edge.condition,
            ...edge.data
          }
        };
      }).filter(edge => edge.source && edge.target);

      console.log('Processed AI workflow:', {
        nodes: processedNodes.length,
        edges: processedEdges.length
      });

      onWorkflowUpdate(processedNodes, processedEdges);
      toast.success(`AI workflow generated with ${processedNodes.length} nodes and ${processedEdges.length} connections`);
      
    } catch (error: any) {
      console.error('AI workflow generation failed:', error);
      toast.error(`Failed to generate workflow: ${error.message}`);
    }
  }, [generateAgent, onWorkflowUpdate, onNodeGenerated]);

  const handleAINodeGeneration = useCallback(async (nodePrompt: string, nodeType?: string, provider: 'openai' | 'claude' | 'gemini' = 'openai') => {
    if (!nodePrompt.trim()) {
      toast.error('Please provide a node description');
      return;
    }

    try {
      console.log('Generating single node from AI:', { nodePrompt, nodeType, provider });
      
      const result = await generateAgent(`Create a ${nodeType || 'agent'} node for: ${nodePrompt}`, provider);
      
      if (!result) {
        throw new Error('No node generated from AI');
      }

      // Handle different response structures
      let nodeData = result;
      if (result.node) nodeData = result.node;
      if (result.agent) nodeData = result.agent;
      if (result.data?.node) nodeData = result.data.node;

      const generatedNode = {
        id: `ai-node-${Date.now()}`,
        type: nodeType || inferNodeType(nodeData) || 'agent',
        position: { 
          x: Math.random() * 400 + 200, 
          y: Math.random() * 300 + 150 
        },
        data: {
          label: nodeData.name || nodeData.label || nodeData.title || 'AI Generated Node',
          description: nodeData.description || nodeData.purpose || nodePrompt,
          configuration: nodeData.configuration || nodeData.config || {},
          aiGenerated: true,
          originalPrompt: nodePrompt,
          nodeType: nodeType
        }
      };

      onNodeGenerated(generatedNode);
      toast.success('AI node generated successfully!');
      
    } catch (error: any) {
      console.error('AI node generation failed:', error);
      toast.error(`Failed to generate node: ${error.message}`);
    }
  }, [generateAgent, onNodeGenerated]);

  const inferNodeType = (node: any): string => {
    const type = String(node.type || '').toLowerCase();
    const name = String(node.name || node.label || '').toLowerCase();
    const category = String(node.category || '').toLowerCase();
    
    if (type.includes('start') || name.includes('start')) return 'start';
    if (type.includes('end') || name.includes('end') || name.includes('finish')) return 'end';
    if (type.includes('agent') || category.includes('agent') || name.includes('agent')) return 'agent';
    if (type.includes('api') || name.includes('api')) return 'api';
    if (type.includes('database') || type.includes('db') || name.includes('database')) return 'database';
    if (type.includes('condition') || name.includes('condition') || name.includes('decision')) return 'condition';
    if (type.includes('action') || name.includes('action')) return 'action';
    
    return 'enhanced'; // Default to enhanced node
  };

  return {
    handleAIWorkflowGeneration,
    handleAINodeGeneration,
    isLoading
  };
};