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
import { 
  Plus, 
  Bot, 
  Database, 
  Workflow,
  MessageSquare,
  Zap,
  GitBranch,
  Play,
  CheckCircle,
  Settings,
  FileInput,
  FileOutput
} from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  position: { x: number; y: number };
  onAddNode: (type: string, category: string, label: string, position: { x: number; y: number }) => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  children,
  position,
  onAddNode,
}) => {
  const nodeCategories = [
    {
      name: 'Workflow',
      icon: Workflow,
      nodes: [
        { type: 'start', label: 'Start', icon: Play },
        { type: 'end', label: 'End', icon: CheckCircle },
        { type: 'condition', label: 'Condition', icon: GitBranch },
      ]
    },
    {
      name: 'AI Agents',
      icon: Bot,
      nodes: [
        { type: 'agent', label: 'AI Agent', icon: Bot },
        { type: 'multi-agent', label: 'Multi-Agent Team', icon: Bot },
        { type: 'llm', label: 'LLM Node', icon: MessageSquare },
      ]
    },
    {
      name: 'Data',
      icon: Database,
      nodes: [
        { type: 'database', label: 'Database', icon: Database },
        { type: 'input', label: 'Input', icon: FileInput },
        { type: 'output', label: 'Output', icon: FileOutput },
      ]
    },
    {
      name: 'Integration',
      icon: Zap,
      nodes: [
        { type: 'api', label: 'API Call', icon: Zap },
        { type: 'webhook', label: 'Webhook', icon: Zap },
        { type: 'function', label: 'Function', icon: Settings },
      ]
    },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-background border shadow-lg">
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 bg-background border shadow-lg">
            {nodeCategories.map((category) => (
              <ContextMenuSub key={category.name}>
                <ContextMenuSubTrigger>
                  <category.icon className="mr-2 h-4 w-4" />
                  {category.name}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-44 bg-background border shadow-lg">
                  {category.nodes.map((node) => (
                    <ContextMenuItem
                      key={node.type}
                      onSelect={() => onAddNode(node.type, category.name.toLowerCase(), node.label, position)}
                    >
                      <node.icon className="mr-2 h-4 w-4" />
                      {node.label}
                    </ContextMenuItem>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        {/* Quick add common nodes */}
        <ContextMenuItem onSelect={() => onAddNode('agent', 'ai-agents', 'AI Agent', position)}>
          <Bot className="mr-2 h-4 w-4" />
          Quick Add Agent
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onAddNode('api', 'integration', 'API Call', position)}>
          <Zap className="mr-2 h-4 w-4" />
          Quick Add API
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onAddNode('condition', 'workflow', 'Condition', position)}>
          <GitBranch className="mr-2 h-4 w-4" />
          Quick Add Condition
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
