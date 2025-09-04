import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, MessageCircle, Phone, Mail, Calendar,
  AlertTriangle, Users, Database, Brain, Tag,
  TestTube, Settings, Workflow, Sparkles
} from 'lucide-react';

interface NodePaletteProps {
  onNodeAdd?: (nodeType: any) => void;
}

const nodeTypes = [
  {
    type: 'customer',
    label: 'Customer',
    description: 'Customer or patient entry point',
    icon: Users,
    color: '#3b82f6',
    category: 'Input'
  },
  {
    type: 'agent',
    label: 'AI Agent',
    description: 'Intelligent agent with AI capabilities',
    icon: Bot,
    color: '#10b981',
    category: 'Processing'
  },
  {
    type: 'touchpoint',
    label: 'Touchpoint',
    description: 'Communication channel',
    icon: MessageCircle,
    color: '#8b5cf6',
    category: 'Communication'
  },
  {
    type: 'decision',
    label: 'Decision',
    description: 'Conditional logic node',
    icon: AlertTriangle,
    color: '#f59e0b',
    category: 'Logic'
  },
  {
    type: 'mcp',
    label: 'MCP Server',
    description: 'Model Context Protocol integration',
    icon: Database,
    color: '#0ea5e9',
    category: 'Data'
  },
  {
    type: 'labelstudio',
    label: 'Label Studio',
    description: 'Data labeling and annotation',
    icon: Tag,
    color: '#a855f7',
    category: 'Data'
  }
];

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeAdd }) => {
  const handleDragStart = (event: React.DragEvent, nodeType: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddNode = (nodeType: any) => {
    if (onNodeAdd) {
      const newNode = {
        id: `${nodeType.type}-${Date.now()}`,
        type: nodeType.type,
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          label: nodeType.label,
          description: nodeType.description,
          category: nodeType.category
        }
      };
      onNodeAdd(newNode);
    }
  };

  const categories = [...new Set(nodeTypes.map(node => node.category))];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Node Palette
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(category => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
            <div className="space-y-2">
              {nodeTypes
                .filter(node => node.category === category)
                .map(nodeType => {
                  const Icon = nodeType.icon;
                  return (
                    <div
                      key={nodeType.type}
                      className="p-3 border rounded-lg cursor-move hover:border-primary/50 hover:bg-accent/50 transition-all"
                      draggable
                      onDragStart={(e) => handleDragStart(e, nodeType)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <Icon 
                            className="h-4 w-4 flex-shrink-0" 
                            style={{ color: nodeType.color }} 
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm">{nodeType.label}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {nodeType.description}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddNode(nodeType)}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Sparkles className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Drag & Drop:</strong> Drag nodes to the canvas</p>
            <p>✨ <strong>Quick Add:</strong> Click the sparkle icon</p>
            <p>🤖 <strong>AI Generate:</strong> Use AI Workflow Assistant</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};