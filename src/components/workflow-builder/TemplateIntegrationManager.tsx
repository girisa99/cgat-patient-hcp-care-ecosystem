import React, { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MarkerType } from '@xyflow/react';

interface UseTemplateIntegrationProps {
  onWorkflowUpdate: (nodes: any[], edges: any[]) => void;
  onTemplateLoaded: (template: any) => void;
}

export const useTemplateIntegration = ({
  onWorkflowUpdate,
  onTemplateLoaded
}: UseTemplateIntegrationProps) => {

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
      // Priority 5: Convert journey_stages to workflow
      else if (template.journey_stages && Array.isArray(template.journey_stages) && template.journey_stages.length > 0) {
        console.log('Converting journey stages to workflow nodes');
        nodes = template.journey_stages.map((stage: any, index: number) => ({
          id: stage.id || `stage-${index}`,
          type: getNodeTypeFromStage(stage),
          position: { x: index * 300 + 100, y: 100 + (index % 2) * 150 },
          data: {
            label: stage.title || stage.name || `Stage ${index + 1}`,
            description: stage.description || stage.purpose || '',
            type_key: stage.type || 'action',
            category: stage.category || 'general',
            configuration: stage.configuration || stage.config || {},
            templateSource: true,
            stageData: stage
          }
        }));
        
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
      
      // If still no nodes, create a default structure based on template metadata
      if (nodes.length === 0) {
        console.log('Creating default template structure from metadata');
        nodes = [
          {
            id: 'start-node',
            type: 'start',
            position: { x: 100, y: 100 },
            data: {
              label: 'Start',
              description: `${template.name} workflow entry point`,
              templateSource: true
            }
          },
          {
            id: 'main-agent',
            type: 'agent',
            position: { x: 400, y: 100 },
            data: {
              label: template.name || 'Template Agent',
              description: template.description || 'AI agent from template',
              configuration: template.configuration || {},
              templateSource: true
            }
          },
          {
            id: 'end-node',
            type: 'end',
            position: { x: 700, y: 100 },
            data: {
              label: 'End',
              description: `${template.name} workflow completion`,
              templateSource: true
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

      // Enhance nodes with proper ReactFlow structure
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
        templateName: template.name
      });

      onWorkflowUpdate(enhancedNodes, enhancedEdges);
      onTemplateLoaded(template);
      
      toast.success(`Template "${template.name || 'Workflow'}" loaded with ${enhancedNodes.length} nodes`);
      
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  }, [onWorkflowUpdate, onTemplateLoaded]);

  const getNodeTypeFromStage = (stage: any): string => {
    const stageType = (stage.type || '').toLowerCase();
    const stageName = (stage.name || stage.title || '').toLowerCase();
    
    if (stageType.includes('agent') || stageName.includes('agent')) return 'agent';
    if (stageType.includes('api') || stageName.includes('api')) return 'api';
    if (stageType.includes('database') || stageName.includes('database')) return 'database';
    if (stageType.includes('condition') || stageName.includes('condition')) return 'condition';
    if (stageType.includes('start') || stageName.includes('start')) return 'start';
    if (stageType.includes('end') || stageName.includes('end')) return 'end';
    
    return 'enhanced'; // Default enhanced node type
  };

  return { handleTemplateLoad };
};