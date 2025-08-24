import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Lightbulb, MapPin, Wand2, Bot, Zap, Plug, Database, 
  MessageCircle, Mic, Users, Rocket, TestTube, Settings,
  CheckSquare, Workflow, Target, ChevronDown, ChevronRight
} from 'lucide-react';

interface NodePaletteItem {
  id: string;
  type: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'core' | 'ai' | 'actions' | 'integrations' | 'deployment';
  color: string;
}

const nodeTypes: NodePaletteItem[] = [
  // Core Workflow Execution Nodes
  {
    id: 'start',
    type: 'start',
    title: 'Start Node',
    icon: Target,
    description: 'Starting point of workflow execution',
    category: 'core',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'condition',
    type: 'condition',
    title: 'Condition',
    icon: Target,
    description: 'If-else logic branching',
    category: 'core',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'agent',
    type: 'agent',
    title: 'AI Agent',
    icon: Bot,
    description: 'AI agent with multi-step reasoning',
    category: 'ai',
    color: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'llm',
    type: 'llm',
    title: 'LLM Node',
    icon: Bot,
    description: 'Large language model processing',
    category: 'ai',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'human_input',
    type: 'human_input',
    title: 'Human Input',
    icon: Users,
    description: 'Request human approval/input',
    category: 'core',
    color: 'bg-orange-50 border-orange-200'
  },
  
  // Flow Control Nodes
  {
    id: 'conditional_agent',
    type: 'conditional_agent',
    title: 'Conditional Agent',
    icon: Bot,
    description: 'Dynamic condition evaluation',
    category: 'ai',
    color: 'bg-cyan-50 border-cyan-200'
  },
  {
    id: 'iteration',
    type: 'iteration',
    title: 'Iteration',
    icon: Workflow,
    description: 'Loop through N iterations',
    category: 'core',
    color: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'loop',
    type: 'loop',
    title: 'Loop',
    icon: Workflow,
    description: 'Loop back to previous node',
    category: 'core',
    color: 'bg-pink-50 border-pink-200'
  },
  {
    id: 'execute_flow',
    type: 'execute_flow',
    title: 'Execute Flow',
    icon: Zap,
    description: 'Run another workflow',
    category: 'core',
    color: 'bg-emerald-50 border-emerald-200'
  },
  
  // Communication Nodes
  {
    id: 'direct_reply',
    type: 'direct_reply',
    title: 'Direct Reply',
    icon: MessageCircle,
    description: 'Send message to user',
    category: 'integrations',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'http',
    type: 'http',
    title: 'HTTP Request',
    icon: Plug,
    description: 'Make API calls',
    category: 'integrations',
    color: 'bg-gray-50 border-gray-200'
  },
  {
    id: 'tools',
    type: 'tools',
    title: 'Tools',
    icon: Settings,
    description: 'External tool integration',
    category: 'integrations',
    color: 'bg-amber-50 border-amber-200'
  },
  
  // Data & Storage Nodes
  {
    id: 'retriever',
    type: 'retriever',
    title: 'Retriever',
    icon: Database,
    description: 'Vector database search',
    category: 'integrations',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'custom_function',
    type: 'custom_function',
    title: 'Custom Function',
    icon: Settings,
    description: 'Execute custom code',
    category: 'integrations',
    color: 'bg-red-50 border-red-200'
  },
  {
    id: 'stick_note',
    type: 'stick_note',
    title: 'Stick Note',
    icon: Lightbulb,
    description: 'Add documentation',
    category: 'core',
    color: 'bg-yellow-50 border-yellow-200'
  },
  
  // Legacy workflow nodes for compatibility
  {
    id: 'customer',
    type: 'customer',
    title: 'Customer',
    icon: Users,
    description: 'Customer touchpoint or interaction node',
    category: 'core',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'decision',
    type: 'decision', 
    title: 'Decision',
    icon: Target,
    description: 'Decision point for routing and logic',
    category: 'core',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'database',
    type: 'database',
    title: 'Database',
    icon: Database,
    description: 'Data storage and retrieval node',
    category: 'integrations',
    color: 'bg-cyan-50 border-cyan-200'
  },
  {
    id: 'group',
    type: 'group',
    title: 'Group',
    icon: Workflow,
    description: 'Container for grouping related nodes',
    category: 'core',
    color: 'bg-gray-50 border-gray-200'
  },

  // Configuration Nodes (Opens Config Panels)
  {
    id: 'ai-intelligence',
    type: 'aiIntelligence',
    title: 'AI Intelligence',
    icon: Bot,
    description: 'Complete AI setup with all models, variables, APIs & actions',
    category: 'ai',
    color: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'smart-agent',
    type: 'agentNode',
    title: 'Smart Agent',
    icon: Users,
    description: 'Configurable AI agent with capabilities & channels',
    category: 'ai',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'smart-data-source',
    type: 'dataSource',
    title: 'Smart Data Source',
    icon: Database,
    description: 'All-in-one database, API & storage connection',
    category: 'integrations',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'use-case',
    type: 'useCaseNode',
    title: 'Use Case Config',
    icon: Lightbulb,
    description: 'Define the primary use case and requirements',
    category: 'actions',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'journey-stages',
    type: 'journeyStagesNode',
    title: 'Journey Config',
    icon: MapPin,
    description: 'Configure sequential journey stages',
    category: 'actions',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'ai-models',
    type: 'aiModelsNode',
    title: 'AI Models Config',
    icon: Bot,
    description: 'Configure AI models and prompts',
    category: 'ai',
    color: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'actions',
    type: 'actionsNode',
    title: 'Actions Config',
    icon: Zap,
    description: 'Define automated actions and triggers',
    category: 'actions',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'connectors',
    type: 'connectorsNode',
    title: 'Connectors Config',
    icon: Plug,
    description: 'Configure external integrations',
    category: 'integrations',
    color: 'bg-cyan-50 border-cyan-200'
  },
  {
    id: 'knowledge-base',
    type: 'knowledgeBaseNode',
    title: 'Knowledge Base',
    icon: Database,
    description: 'Manage knowledge and documents',
    category: 'integrations',
    color: 'bg-indigo-50 border-indigo-200'
  },

  // Communication & Channels
  {
    id: 'channel-assignment',
    type: 'channelNode',
    title: 'Channel Config',
    icon: MessageCircle,
    description: 'Configure communication channels',
    category: 'integrations',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'voice-config',
    type: 'voiceNode',
    title: 'Voice Config',
    icon: Mic,
    description: 'Configure voice and speech settings',
    category: 'integrations',
    color: 'bg-pink-50 border-pink-200'
  },
  {
    id: 'human-loop',
    type: 'humanLoopNode',
    title: 'Human in Loop',
    icon: Users,
    description: 'Configure human intervention points',
    category: 'actions',
    color: 'bg-amber-50 border-amber-200'
  },

  // Deployment & Testing
  {
    id: 'testing',
    type: 'testingNode',
    title: 'Testing Config',
    icon: TestTube,
    description: 'Configure test cases and validation',
    category: 'deployment',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'deployment',
    type: 'deploymentNode',
    title: 'Deployment Config',
    icon: Rocket,
    description: 'Configure deployment settings',
    category: 'deployment',
    color: 'bg-green-50 border-green-200'
  }
];

const categories = [
  { id: 'core', name: 'Workflow Nodes', color: 'bg-slate-100' },
  { id: 'ai', name: 'AI & Intelligence (Enhanced)', color: 'bg-indigo-100' },
  { id: 'integrations', name: 'Data & Connectors', color: 'bg-purple-100' },
  { id: 'actions', name: 'Configuration (Assets, APIs, Variables)', color: 'bg-orange-100' },
  { id: 'deployment', name: 'Deployment & Testing', color: 'bg-green-100' }
];

export const NodePalette: React.FC<{ heightClass?: string }> = ({ heightClass }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'core': true,
    'ai': true,
    'integrations': false,
    'actions': false,
    'deployment': false
  });
  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    // Standardized drag payload: primary type + JSON meta for config
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({ ...data, source: 'node-palette' })
    );
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          Node Palette
        </CardTitle>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            <strong>Drag & Drop Workflow Nodes:</strong>
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
              <span><strong>Enhanced Nodes</strong> → All-in-one configuration within nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span><strong>Workflow Nodes</strong> → Create executable workflow elements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0" />
              <span><strong>Config Nodes</strong> → Open configuration panels</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pr-3 pb-6 space-y-3">
            {categories.map((category) => {
              const categoryNodes = nodeTypes.filter(node => node.category === category.id);
              const isOpen = openCategories[category.id];
              
              return (
                <Collapsible 
                  key={category.id} 
                  open={isOpen}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-2 h-auto hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-xs ${category.color}`}>
                          {category.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({categoryNodes.length})
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-2 pt-2">
                    <div className="space-y-2">
                      {categoryNodes.map((node) => (
                        <div
                          key={node.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, node.type, {
                            label: node.title,
                            type: node.type.includes('Node') ? node.id : node.type,
                            category: node.category,
                            isWorkflowNode: !node.type.includes('Node'),
                            configType: node.type.includes('Node') ? node.type : undefined
                          })}
                           className={`
                             p-3 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing
                             hover:shadow-sm transition-all duration-200 hover:scale-[1.01]
                             ${node.color} ${!node.type.includes('Node') ? 'ring-1 ring-primary/20' : ''}
                             ${['aiIntelligence', 'agentNode', 'dataSource'].includes(node.type) ? 'ring-2 ring-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50' : ''}
                           `}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-white rounded-md shadow-sm flex-shrink-0">
                              <node.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-medium text-sm text-foreground flex items-center gap-1 flex-wrap">
                                 {node.title}
                                 {['aiIntelligence', 'agentNode', 'dataSource'].includes(node.type) && (
                                   <Badge variant="default" className="text-xs px-1 py-0 bg-indigo-500">Enhanced</Badge>
                                 )}
                                 {!node.type.includes('Node') && !['aiIntelligence', 'agentNode', 'dataSource'].includes(node.type) && (
                                   <Badge variant="outline" className="text-xs px-1 py-0">Workflow</Badge>
                                 )}
                                 {node.type.includes('Node') && (
                                   <Badge variant="secondary" className="text-xs px-1 py-0">Config</Badge>
                                 )}
                               </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {node.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};