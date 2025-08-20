import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, MapPin, Wand2, Bot, Zap, Plug, Database, 
  MessageCircle, Mic, Users, Rocket, TestTube, Settings,
  CheckSquare, Workflow, Target
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
  // Core Workflow Nodes
  {
    id: 'use-case',
    type: 'useCaseNode',
    title: 'Use Case',
    icon: Lightbulb,
    description: 'Define the primary use case and requirements',
    category: 'core',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'journey-stages',
    type: 'journeyStagesNode',
    title: 'Journey Stages',
    icon: MapPin,
    description: 'Configure sequential journey stages',
    category: 'core',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'wizard',
    type: 'wizardNode',
    title: 'Wizard Flow',
    icon: Wand2,
    description: 'Create step-by-step wizard flows',
    category: 'core',
    color: 'bg-emerald-50 border-emerald-200'
  },
  {
    id: 'tasks',
    type: 'tasksNode',
    title: 'Tasks Config',
    icon: CheckSquare,
    description: 'Configure tasks and workflows',
    category: 'core',
    color: 'bg-blue-50 border-blue-200'
  },

  // AI & Intelligence
  {
    id: 'ai-models',
    type: 'aiModelsNode',
    title: 'AI Models',
    icon: Bot,
    description: 'Configure AI models and prompts',
    category: 'ai',
    color: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'knowledge-base',
    type: 'knowledgeBaseNode',
    title: 'Knowledge Base',
    icon: Database,
    description: 'Manage knowledge and documents',
    category: 'ai',
    color: 'bg-indigo-50 border-indigo-200'
  },

  // Actions & Automation
  {
    id: 'actions',
    type: 'actionsNode',
    title: 'Actions',
    icon: Zap,
    description: 'Define automated actions and triggers',
    category: 'actions',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'connectors',
    type: 'connectorsNode',
    title: 'Connectors',
    icon: Plug,
    description: 'Configure external integrations',
    category: 'integrations',
    color: 'bg-cyan-50 border-cyan-200'
  },

  // Communication & Channels
  {
    id: 'channel-assignment',
    type: 'channelNode',
    title: 'Channel Assignment',
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
    title: 'Testing',
    icon: TestTube,
    description: 'Configure test cases and validation',
    category: 'deployment',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'deployment',
    type: 'deploymentNode',
    title: 'Deployment',
    icon: Rocket,
    description: 'Configure deployment settings',
    category: 'deployment',
    color: 'bg-green-50 border-green-200'
  }
];

const categories = [
  { id: 'core', name: 'Core Workflow', color: 'bg-slate-100' },
  { id: 'ai', name: 'AI & Intelligence', color: 'bg-indigo-100' },
  { id: 'actions', name: 'Actions & Automation', color: 'bg-orange-100' },
  { id: 'integrations', name: 'Integrations', color: 'bg-cyan-100' },
  { id: 'deployment', name: 'Deployment', color: 'bg-green-100' }
];

export const NodePalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/json', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          Node Palette
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Drag nodes to the canvas to build your workflow
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-4">
            {categories.map((category) => {
              const categoryNodes = nodeTypes.filter(node => node.category === category.id);
              
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <Badge variant="secondary" className={`text-xs ${category.color}`}>
                      {category.name}
                    </Badge>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  
                  <div className="space-y-2">
                    {categoryNodes.map((node) => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type, {
                          label: node.title,
                          type: node.type,
                          category: node.category
                        })}
                        className={`
                          p-3 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing
                          hover:shadow-sm transition-all duration-200 hover:scale-[1.02]
                          ${node.color}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-white rounded-md shadow-sm">
                            <node.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground">
                              {node.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {node.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};