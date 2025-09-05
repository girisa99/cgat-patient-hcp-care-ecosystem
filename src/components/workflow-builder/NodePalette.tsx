import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow, Sparkles } from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';

interface NodePaletteProps {
  onNodeAdd?: (nodeType: any) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeAdd }) => {
  const { categories, nodeTypesByCategory, isLoading } = useWorkflowNodes();

  const handleDragStart = (event: React.DragEvent, nodeType: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddNode = (nodeType: any) => {
    if (onNodeAdd) {
      const newNode = {
        id: `${nodeType.node_key}-${Date.now()}`,
        type: nodeType.node_key,
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          label: nodeType.display_name,
          description: nodeType.description,
          category: nodeType.category_name,
          configuration: nodeType.configuration
        }
      };
      onNodeAdd(newNode);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Node Palette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading nodes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Node Palette ({Object.values(nodeTypesByCategory).flat().length} nodes, {categories.length} categories)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(category => {
          const nodesInCategory = nodeTypesByCategory[category.name] || [];
          if (nodesInCategory.length === 0) return null;
          
          return (
            <div key={category.id} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {category.name} ({nodesInCategory.length})
              </h4>
              <div className="space-y-2">
                {nodesInCategory.map(nodeType => (
                  <div
                    key={nodeType.id}
                    className="p-3 border rounded-lg cursor-move hover:border-primary/50 hover:bg-accent/50 transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, nodeType)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{nodeType.display_name}</div>
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
                ))}
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Database-driven:</strong> All nodes from workflow_node_types table</p>
            <p>🎯 <strong>Consistent:</strong> Same data for AI Prompt and Visual Builder</p>
            <p>✨ <strong>Drag & Drop:</strong> Drag nodes to canvas or click sparkle</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};