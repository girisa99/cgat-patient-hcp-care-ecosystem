import React, { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { toast } from 'sonner';

interface EnhancedDragDropHandlerProps {
  onNodeAdd: (node: Node) => void;
  onAIAssist?: (nodeId: string, mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure') => void;
}

export const useEnhancedDragDropHandler = ({
  onNodeAdd,
  onAIAssist,
}: EnhancedDragDropHandlerProps) => {
  const { nodeTypes, getNodeTypeByKey } = useWorkflowNodes();

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = (event.target as Element).getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    try {
      // Parse drag data
      const dragData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      const { type, nodeType, category, configuration = {}, aiAssistMode } = dragData;

      // Get full node type information from database
      const fullNodeType = getNodeTypeByKey(type) || nodeType;
      
      // Enhanced node creation with category-based configuration
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: type,
        position,
        data: {
          label: fullNodeType?.display_name || dragData.label || type,
          type: type,
          category: category || fullNodeType?.category?.name,
          icon: fullNodeType?.icon || dragData.icon,
          configuration: {
            ...fullNodeType?.default_config,
            ...configuration,
          },
          // Include tools and models based on category
          tools: getToolsForCategory(category || fullNodeType?.category?.name),
          models: getModelsForCategory(category || fullNodeType?.category?.name),
          capabilities: fullNodeType?.capabilities || [],
          requirements: fullNodeType?.requirements || {},
          // AI assist integration
          aiAssistEnabled: true,
          supportedModes: ['build', 'generate', 'test', 'deploy', 'configure'],
        },
      };

      onNodeAdd(newNode);

      // Auto-trigger AI assist if specified
      if (aiAssistMode && onAIAssist) {
        setTimeout(() => {
          onAIAssist(newNode.id, aiAssistMode);
        }, 500);
      }

      toast.success(`Added ${newNode.data.label} node`);
    } catch (error) {
      console.error('Error handling drop:', error);
      toast.error('Failed to add node');
    }
  }, [nodeTypes, getNodeTypeByKey, onNodeAdd, onAIAssist]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const getToolsForCategory = (category: string): string[] => {
    switch (category) {
      case 'ai-agents':
        return ['OpenAI', 'Claude', 'Gemini', 'GPT-4', 'DALL-E'];
      case 'integrations':
        return ['REST API', 'GraphQL', 'Webhook', 'OAuth2', 'JWT'];
      case 'data-processing':
        return ['SQL', 'NoSQL', 'Redis', 'Elasticsearch', 'MongoDB'];
      case 'communication':
        return ['Email', 'SMS', 'Slack', 'Teams', 'WhatsApp'];
      case 'automation':
        return ['Scheduler', 'Trigger', 'Workflow', 'Lambda', 'CRON'];
      case 'analytics':
        return ['Metrics', 'Dashboard', 'Reports', 'Charts', 'KPIs'];
      default:
        return ['General', 'Custom', 'Basic'];
    }
  };

  const getModelsForCategory = (category: string): string[] => {
    switch (category) {
      case 'ai-agents':
        return ['gpt-4o-mini', 'claude-sonnet-4-6', 'gemini-2.5-flash', 'gpt-4o'];
      case 'integrations':
        return ['REST', 'GraphQL', 'SOAP', 'gRPC'];
      case 'data-processing':
        return ['SQL', 'Document', 'Key-Value', 'Graph'];
      case 'communication':
        return ['SMTP', 'HTTP', 'WebSocket', 'Push'];
      case 'automation':
        return ['Event', 'Schedule', 'Trigger', 'Condition'];
      case 'analytics':
        return ['Time Series', 'Aggregation', 'Reporting', 'Real-time'];
      default:
        return ['Standard'];
    }
  };

  return {
    handleDrop,
    handleDragOver,
    getToolsForCategory,
    getModelsForCategory,
  };
};