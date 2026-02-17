import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Workflow, Sparkles, Search, ChevronDown, ChevronRight, GripVertical, Lightbulb } from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { cn } from '@/lib/utils';

interface NodePaletteProps {
  onNodeAdd?: (nodeType: any) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeAdd }) => {
  const { categories, nodeTypesByCategory, isLoading } = useWorkflowNodes();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['triggers', 'actions', 'GenAI & LLM']));

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter(cat => {
      const nodes = nodeTypesByCategory[cat.name] || [];
      return nodes.some(n => 
        n.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [categories, nodeTypesByCategory, searchQuery]);

  const getFilteredNodes = (categoryName: string) => {
    const nodes = nodeTypesByCategory[categoryName] || [];
    if (!searchQuery.trim()) return nodes;
    return nodes.filter(n => 
      n.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const totalNodes = Object.values(nodeTypesByCategory).flat().length;

  const handleDragStart = (event: React.DragEvent, nodeType: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddNode = (nodeType: any) => {
    if (onNodeAdd) {
      const newNode = {
        id: `${nodeType.type_key || nodeType.node_key}-${Date.now()}`,
        type: 'enhanced',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          label: nodeType.display_name,
          description: nodeType.description,
          category: nodeType.category?.name || nodeType.category_name,
          type_key: nodeType.type_key || nodeType.node_key,
          color: nodeType.color || nodeType.category?.color,
          icon: nodeType.icon,
          configuration: nodeType.default_config || {}
        }
      };
      onNodeAdd(newNode);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Workflow className="h-4 w-4 text-primary" />
            Node Palette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" />
            Node Palette
          </div>
          <Badge variant="secondary" className="text-[10px] font-normal">
            {totalNodes} nodes • {categories.length} categories
          </Badge>
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background/50"
          />
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {filteredCategories.map(category => {
            const nodesInCategory = getFilteredNodes(category.name);
            if (nodesInCategory.length === 0) return null;
            const isExpanded = expandedCategories.has(category.name);
            
            return (
              <Collapsible 
                key={category.id} 
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.name)}
              >
                <CollapsibleTrigger className="w-full">
                  <div 
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200",
                      "hover:bg-accent/50 cursor-pointer group"
                    )}
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color || 'hsl(var(--primary))' }}
                    />
                    <span className="text-xs font-medium flex-1 text-left truncate">
                      {category.display_name || category.name}
                    </span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                      {nodesInCategory.length}
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform" />
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="animate-accordion-down">
                  <div className="pl-4 py-1 space-y-1">
                    {nodesInCategory.map(nodeType => (
                      <div
                        key={nodeType.id}
                        className={cn(
                          "group flex items-center gap-2 p-2 rounded-lg cursor-grab",
                          "border border-transparent hover:border-border/50",
                          "bg-background/30 hover:bg-background/60",
                          "transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                        )}
                        draggable
                        onDragStart={(e) => handleDragStart(e, nodeType)}
                      >
                        <GripVertical className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div 
                          className="w-1 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: nodeType.color || category.color || 'hsl(var(--primary))' }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs truncate">{nodeType.display_name}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1">
                            {nodeType.description || 'No description'}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddNode(nodeType);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Sparkles className="h-3 w-3 text-primary" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
        
        {/* Tips Section */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
            <Lightbulb className="h-3 w-3 text-amber-500" />
            <span className="font-medium">Quick Tips</span>
          </div>
          <div className="space-y-1 text-[10px] text-muted-foreground/80">
            <p>• Drag nodes to canvas or click ✨</p>
            <p>• Connect nodes by dragging handles</p>
            <p>• Double-click node to configure</p>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};