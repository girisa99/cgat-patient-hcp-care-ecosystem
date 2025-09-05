import React, { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MarkerType } from '@xyflow/react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';

interface UseTemplateIntegrationProps {
  onWorkflowUpdate: (nodes: any[], edges: any[]) => void;
  onTemplateLoaded: (template: any) => void;
}

export const useTemplateIntegration = ({
  onWorkflowUpdate,
  onTemplateLoaded
}: UseTemplateIntegrationProps) => {
  const { nodeTypes, categories } = useWorkflowNodes();

  // Enhanced mapping to real database node types
  const inferDatabaseNodeType = (stage: any, availableNodeTypes: any[]): string => {
    const title = (stage.title || stage.name || '').toLowerCase();
    const description = (stage.description || '').toLowerCase();
    const stageType = (stage.type || '').toLowerCase();
    
    // Healthcare-specific mappings to real database node types
    if (title.includes('triage') || title.includes('assessment') || description.includes('triage')) {
      return availableNodeTypes.find(nt => nt.type_key.includes('triage') || nt.display_name.toLowerCase().includes('triage'))?.type_key || 'healthcare_triage';
    }
    if (title.includes('medication') || description.includes('medication') || description.includes('drug')) {
      return availableNodeTypes.find(nt => nt.type_key.includes('medication') || nt.display_name.toLowerCase().includes('medication'))?.type_key || 'medication_manager';
    }
    if (title.includes('ai') || title.includes('gpt') || title.includes('claude') || description.includes('ai decision')) {
      return availableNodeTypes.find(nt => nt.type_key.includes('openai') || nt.type_key.includes('claude') || nt.type_key.includes('gpt'))?.type_key || 'openai_gpt4';
    }
    if (title.includes('coordination') || title.includes('care plan') || description.includes('coordination')) {
      return availableNodeTypes.find(nt => nt.display_name.toLowerCase().includes('coordination') || nt.type_key.includes('care'))?.type_key || 'care_coordinator';
    }
    if (title.includes('clinical') || title.includes('decision') || description.includes('clinical')) {
      return availableNodeTypes.find(nt => nt.display_name.toLowerCase().includes('clinical') || nt.type_key.includes('decision'))?.type_key || 'clinical_decision_support';
    }
    
    // Generic mappings  
    if (stageType.includes('agent') || title.includes('agent') || description.includes('ai agent')) {
      return availableNodeTypes.find(nt => nt.type_key.includes('agent') || nt.display_name.toLowerCase().includes('agent'))?.type_key || 'single_agent';
    }
    if (stageType.includes('api') || title.includes('api') || description.includes('api call')) {
      return availableNodeTypes.find(nt => nt.type_key.includes('api') || nt.display_name.toLowerCase().includes('api'))?.type_key || 'api_endpoint';
    }
    if (stageType.includes('database') || title.includes('database') || description.includes('data storage')) {
      return availableNodeTypes.find(nt => nt.type_key.includes('database') || nt.display_name.toLowerCase().includes('database'))?.type_key || 'database_query';
    }
    
    // Workflow control
    if (title.includes('start') || stageType === 'start') return 'workflow_start';
    if (title.includes('end') || title.includes('complete') || stageType === 'end') return 'workflow_end';
    if (title.includes('condition') || title.includes('decision') || description.includes('routing')) return 'conditional_branch';
    
    // Default to enhanced node if no specific match
    return availableNodeTypes.find(nt => nt.type_key === 'enhanced')?.type_key || 'enhanced';
  };

  const getNodeTypeFromStage = (stage: any): string => {
    return inferDatabaseNodeType(stage, nodeTypes);
  };

  const handleTemplateLoad = useCallback(async (template: any) => {
    console.log('Loading template with enhanced logic:', template);
    
    try {
      let nodes: any[] = [];
      let edges: any[] = [];
      
      // Fetch full template data if only ID provided
      if (template.id && !template.configuration && !template.canvas) {
        console.log('Fetching full template data for ID:', template.id);
        const { data: fullTemplate, error } = await supabase
          .from('agent_templates')
          .select('*')
          .eq('id', template.id)
          .single();
          
        if (error) {
          console.error('Error fetching template:', error);
          toast.error('Failed to load template');
          return;
        }
        
        if (fullTemplate) {
          template = fullTemplate;
        }
      }
      
      // Enhanced template data structure handling
      console.log('Template structure analysis:', {
        hasConfiguration: !!template.configuration,
        hasCanvas: !!template.canvas,
        hasJourneyStages: !!template.journey_stages,
        configType: typeof template.configuration,
        canvasType: typeof template.canvas
      });
      
      // Priority 1: Direct nodes array in template root
      if (template.nodes && Array.isArray(template.nodes)) {
        nodes = template.nodes;
        edges = template.edges || [];
        console.log('Loaded from template.nodes');
      }
      // Priority 2: Configuration.nodes
      else if (template.configuration?.nodes && Array.isArray(template.configuration.nodes)) {
        nodes = template.configuration.nodes;
        edges = template.configuration.edges || [];
        console.log('Loaded from configuration.nodes');
      }
      // Priority 3: Canvas.nodes  
      else if (template.canvas?.nodes && Array.isArray(template.canvas.nodes)) {
        nodes = template.canvas.nodes;
        edges = template.canvas.edges || [];
        console.log('Loaded from canvas.nodes');
      }
      // Priority 4: Configuration.canvas.nodes
      else if (template.configuration?.canvas?.nodes && Array.isArray(template.configuration.canvas.nodes)) {
        nodes = template.configuration.canvas.nodes;
        edges = template.configuration.canvas.edges || [];
        console.log('Loaded from configuration.canvas.nodes');
      }
      // Priority 5: Convert journey_stages to workflow using REAL database node types
      else if (template.journey_stages && Array.isArray(template.journey_stages) && template.journey_stages.length > 0) {
        console.log('Converting journey stages to workflow nodes using DATABASE node types');
        console.log('Available node types:', nodeTypes.length);
        console.log('Available categories:', categories.length);
        
        nodes = template.journey_stages.map((stage: any, index: number) => {
          // Map stage to real database node type
          const stageType = inferDatabaseNodeType(stage, nodeTypes);
          const nodeType = nodeTypes.find(nt => nt.type_key === stageType) || nodeTypes.find(nt => nt.type_key === 'enhanced') || null;
          
          console.log(`Stage "${stage.title}" mapped to node type:`, stageType, nodeType?.display_name);
          
          return {
            id: stage.id || `stage-${index}`,
            type: nodeType?.type_key || 'enhanced',
            position: { x: index * 300 + 100, y: 100 + (index % 2) * 150 },
            data: {
              label: stage.title || stage.name || nodeType?.display_name || `Stage ${index + 1}`,
              description: stage.description || stage.purpose || nodeType?.description || '',
              type_key: nodeType?.type_key || 'enhanced',
              category: nodeType?.category?.name || 'general',
              // Use REAL database configuration merged with template data
              configuration: {
                ...nodeType?.default_config || {},
                ...stage.configuration || stage.config || {},
                // Healthcare-specific configs from stage
                duration: stage.duration,
                required_data: stage.required_data,
                outputs: stage.outputs,
                participants: stage.participants,
                stakeholders: stage.stakeholders
              },
              // Add database node metadata
              capabilities: nodeType?.capabilities || [],
              input_schema: nodeType?.input_schema || {},
              output_schema: nodeType?.output_schema || {},
              validation_rules: nodeType?.validationRules || {},
              templateSource: true,
              stageData: stage,
              databaseNodeType: nodeType
            }
          };
        });
        
        // Create sequential connections between stages
        edges = nodes.slice(0, -1).map((node, index) => ({
          id: `edge-${index}`,
          source: node.id,
          target: nodes[index + 1].id,
          animated: true,
          style: { stroke: '#8b5cf6' },
          markerEnd: { type: MarkerType.ArrowClosed }
        }));
      }
      // Priority 6: Parse configuration if it's a string
      else if (typeof template.configuration === 'string') {
        try {
          const parsed = JSON.parse(template.configuration);
          if (parsed.nodes && Array.isArray(parsed.nodes)) {
            nodes = parsed.nodes;
            edges = parsed.edges || [];
            console.log('Loaded from parsed JSON configuration');
          }
        } catch (e) {
          console.warn('Failed to parse configuration string:', e);
        }
      }
      
      // If still no nodes, create a default structure using REAL database nodes
      if (nodes.length === 0) {
        console.log('Creating default template structure from DATABASE node types');
        const startNode = nodeTypes.find(nt => nt.type_key === 'workflow_start') || nodeTypes.find(nt => nt.display_name.toLowerCase().includes('start'));
        const agentNode = nodeTypes.find(nt => nt.type_key === 'openai_gpt4') || nodeTypes.find(nt => nt.type_key.includes('agent'));
        const endNode = nodeTypes.find(nt => nt.type_key === 'workflow_end') || nodeTypes.find(nt => nt.display_name.toLowerCase().includes('end'));
        
        nodes = [
          {
            id: 'start-node',
            type: startNode?.type_key || 'start',
            position: { x: 100, y: 100 },
            data: {
              label: 'Start',
              description: `${template.name} workflow entry point`,
              type_key: startNode?.type_key || 'workflow_start',
              configuration: startNode?.default_config || {},
              capabilities: startNode?.capabilities || [],
              templateSource: true,
              databaseNodeType: startNode
            }
          },
          {
            id: 'main-agent',
            type: agentNode?.type_key || 'agent',
            position: { x: 400, y: 100 },
            data: {
              label: template.name || 'Template Agent',
              description: template.description || 'AI agent from template',
              type_key: agentNode?.type_key || 'openai_gpt4',
              configuration: {
                ...agentNode?.default_config || {},
                ...template.configuration || {}
              },
              capabilities: agentNode?.capabilities || [],
              templateSource: true,
              databaseNodeType: agentNode
            }
          },
          {
            id: 'end-node',
            type: endNode?.type_key || 'end',
            position: { x: 700, y: 100 },
            data: {
              label: 'End',
              description: `${template.name} workflow completion`,
              type_key: endNode?.type_key || 'workflow_end',
              configuration: endNode?.default_config || {},
              capabilities: endNode?.capabilities || [],
              templateSource: true,
              databaseNodeType: endNode
            }
          }
        ];
        
        edges = [
          {
            id: 'edge-start',
            source: 'start-node',
            target: 'main-agent',
            animated: true,
            style: { stroke: '#8b5cf6' },
            markerEnd: { type: MarkerType.ArrowClosed }
          },
          {
            id: 'edge-end',
            source: 'main-agent',
            target: 'end-node',
            animated: true,
            style: { stroke: '#8b5cf6' },
            markerEnd: { type: MarkerType.ArrowClosed }
          }
        ];
      }

      // Enhance nodes with proper ReactFlow structure and database integration
      const enhancedNodes = nodes.map((node: any, index: number) => {
        const position = node.position || { 
          x: 100 + (index * 250), 
          y: 100 + Math.floor(index / 4) * 150 
        };
        
        return {
          ...node,
          id: node.id || `node-${Date.now()}-${index}`,
          position,
          data: {
            label: node.data?.label || node.label || node.name || `Node ${index + 1}`,
            description: node.data?.description || node.description || '',
            configuration: node.data?.configuration || node.configuration || {},
            templateSource: true,
            originalTemplate: template,
            // Preserve database node type information
            type_key: node.data?.type_key || node.type_key,
            category: node.data?.category || node.category,
            capabilities: node.data?.capabilities || node.capabilities || [],
            input_schema: node.data?.input_schema || {},
            output_schema: node.data?.output_schema || {},
            validation_rules: node.data?.validation_rules || {},
            databaseNodeType: node.data?.databaseNodeType,
            ...node.data
          }
        };
      });

      // Enhance edges with proper ReactFlow structure
      const enhancedEdges = edges.map((edge: any, index: number) => ({
        id: edge.id || `edge-${Date.now()}-${index}`,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default',
        animated: edge.animated !== false,
        style: edge.style || { stroke: '#8b5cf6' },
        markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
        ...edge
      }));

      console.log('Template loaded successfully:', {
        nodesCount: enhancedNodes.length,
        edgesCount: enhancedEdges.length,
        templateName: template.name,
        databaseNodeTypesUsed: enhancedNodes.map(n => n.data?.type_key).filter(Boolean)
      });

      onWorkflowUpdate(enhancedNodes, enhancedEdges);
      onTemplateLoaded(template);
      
      toast.success(`Template "${template.name || 'Workflow'}" loaded with ${enhancedNodes.length} nodes using database node types`);
      
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  }, [onWorkflowUpdate, onTemplateLoaded, nodeTypes, categories, inferDatabaseNodeType]);

  return { handleTemplateLoad };
};