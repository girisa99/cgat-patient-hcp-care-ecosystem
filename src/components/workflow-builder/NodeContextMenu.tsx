import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Settings, Copy, Trash2, Edit3, Database, MessageSquare, Bot } from 'lucide-react';

interface NodeContextMenuProps {
  children: React.ReactNode;
  nodeId: string;
  nodeType: string;
  onConfigureNode: (nodeId: string, action: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onOpenChat: (nodeId: string) => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  children,
  nodeId,
  nodeType,
  onConfigureNode,
  onDeleteNode,
  onDuplicateNode,
  onOpenChat,
}) => {
  const getConfigurationOptions = () => {
    switch (nodeType) {
      case 'agent':
        return [
          { label: 'AI Model Settings', action: 'ai-model' },
          { label: 'Prompt Configuration', action: 'prompt' },
          { label: 'Response Format', action: 'response-format' },
          { label: 'Memory Settings', action: 'memory' },
        ];
      case 'api':
        return [
          { label: 'Endpoint Configuration', action: 'endpoint' },
          { label: 'Authentication', action: 'auth' },
          { label: 'Headers & Parameters', action: 'headers' },
          { label: 'Rate Limiting', action: 'rate-limit' },
        ];
      case 'database':
        return [
          { label: 'Connection Settings', action: 'connection' },
          { label: 'Query Configuration', action: 'query' },
          { label: 'Table Mappings', action: 'mappings' },
          { label: 'Security Policies', action: 'security' },
        ];
      case 'workflow':
        return [
          { label: 'Flow Logic', action: 'flow-logic' },
          { label: 'Conditions', action: 'conditions' },
          { label: 'Error Handling', action: 'error-handling' },
          { label: 'Timeout Settings', action: 'timeout' },
        ];
      default:
        return [
          { label: 'Basic Settings', action: 'basic' },
          { label: 'Advanced Options', action: 'advanced' },
        ];
    }
  };

  const configOptions = getConfigurationOptions();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={() => onOpenChat(nodeId)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Configure with AI Chat
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Settings className="mr-2 h-4 w-4" />
            Configuration Options
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {configOptions.map((option) => (
              <ContextMenuItem
                key={option.action}
                onClick={() => onConfigureNode(nodeId, option.action)}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                {option.label}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => onDuplicateNode(nodeId)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate Node
        </ContextMenuItem>

        <ContextMenuItem 
          onClick={() => onDeleteNode(nodeId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Node
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};