import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Workflow, ChevronDown, ChevronRight, Search, Info, 
  Bot, Database, Brain, Zap, Eye, Link, Grid3X3, 
  Wrench, FileText, MessageSquare, Filter, Settings, GitBranch
} from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { cn } from '@/lib/utils';

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'bot': Bot,
    'database': Database,
    'brain': Brain,
    'zap': Zap,
    'eye': Eye,
    'link': Link,
    'grid-3x3': Grid3X3,
    'wrench': Wrench,
    'file-text': FileText,
    'message-square': MessageSquare,
    'filter': Filter,
    'workflow': Workflow,
    'settings': Settings,
    'git-branch': GitBranch,
  };
  
  return iconMap[iconName] || Workflow;
};

interface EnhancedNodePaletteProps {
  heightClass?: string;
  onNodeSelect?: (nodeType: any) => void;
}

export const EnhancedNodePalette: React.FC<EnhancedNodePaletteProps> = ({ 
  heightClass = "h-full",
  onNodeSelect 
}) => {
  const { 
    categories, 
    nodeTypes, 
    nodeTypesByCategory, 
    isLoading, 
    error 
  } = useWorkflowNodes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'agents': true,
    'genai_llm': true,
    'cache': false,
    'tools': false,
  });
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const filteredNodeTypes = nodeTypes.filter(nodeType =>
    nodeType.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nodeType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nodeType.category?.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByCategory = filteredNodeTypes.reduce((acc, nodeType) => {
    const categoryName = nodeType.category?.name || 'uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(nodeType);
    return acc;
  }, {} as Record<string, typeof nodeTypes>);

  const onDragStart = (event: React.DragEvent, nodeType: any) => {
    // Enhanced drag payload with full node type information
    event.dataTransfer.setData('application/reactflow', nodeType.type_key);
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        ...nodeType,
        source: 'enhanced-node-palette',
        isWorkflowNode: true,
        label: nodeType.display_name
      })
    );
    event.dataTransfer.setData('text/plain', nodeType.type_key);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeClick = (nodeType: any) => {
    setSelectedNodeType(selectedNodeType === nodeType.id ? null : nodeType.id);
    onNodeSelect?.(nodeType);
  };

  if (isLoading) {
    return (
      <Card className={cn("flex flex-col", heightClass)}>
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Enhanced Node Palette
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading nodes...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("flex flex-col", heightClass)}>
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Enhanced Node Palette
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-sm text-destructive">Failed to load nodes</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col", heightClass)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          Enhanced Node Palette
        </CardTitle>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Drag & Drop Nodes:</strong> {nodeTypes.length} nodes across {categories.length} categories
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pr-3 pb-6 space-y-3">
            {categories
              .filter(category => filteredByCategory[category.name]?.length > 0)
              .map((category) => {
                const categoryNodes = filteredByCategory[category.name] || [];
                const isExpanded = expandedCategories[category.name];
                const IconComponent = getIconComponent(category.icon);
                
                return (
                  <Collapsible 
                    key={category.id} 
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(category.name)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-2 h-auto hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-1 rounded-md" 
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">{category.display_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {categoryNodes.length} node{categoryNodes.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-2 pt-2">
                      <div className="space-y-2 ml-2">
                        {categoryNodes.map((nodeType) => {
                          const NodeIcon = getIconComponent(nodeType.icon);
                          const isSelected = selectedNodeType === nodeType.id;
                          
                          return (
                            <div
                              key={nodeType.id}
                              draggable
                              onDragStart={(e) => onDragStart(e, nodeType)}
                              onClick={() => handleNodeClick(nodeType)}
                              className={cn(
                                "p-3 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing",
                                "hover:shadow-sm transition-all duration-200 hover:scale-[1.01]",
                                "bg-background hover:bg-muted/50",
                                isSelected && "border-primary bg-primary/5"
                              )}
                              style={{
                                borderColor: isSelected ? category.color : '#e5e7eb'
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div 
                                  className="p-1.5 rounded-md shadow-sm flex-shrink-0"
                                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                >
                                  <NodeIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-foreground flex items-center gap-2 flex-wrap">
                                    {nodeType.display_name}
                                    {nodeType.capabilities.length > 0 && (
                                      <Badge variant="secondary" className="text-xs px-1 py-0">
                                        {nodeType.capabilities.length} capabilities
                                      </Badge>
                                    )}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {nodeType.description}
                                  </p>
                                  
                                  {isSelected && (
                                    <div className="mt-3 space-y-2">
                                      <div className="text-xs">
                                        <div className="font-medium mb-1">Detailed Explanation:</div>
                                        <div className="text-muted-foreground leading-relaxed">
                                          {nodeType.detailed_explanation}
                                        </div>
                                      </div>
                                      
                                      {nodeType.capabilities.length > 0 && (
                                        <div className="text-xs">
                                          <div className="font-medium mb-1">Capabilities:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {nodeType.capabilities.map((capability, index) => (
                                              <Badge key={index} variant="outline" className="text-xs">
                                                {capability}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {Object.keys(nodeType.requirements).length > 0 && (
                                        <div className="text-xs">
                                          <div className="font-medium mb-1">Requirements:</div>
                                          <div className="text-muted-foreground">
                                            {Object.entries(nodeType.requirements).map(([key, value]) => (
                                              <div key={key} className="truncate">
                                                <span className="font-medium">{key}:</span> {String(value)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            
            {categories.filter(category => filteredByCategory[category.name]?.length > 0).length === 0 && (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">
                  {searchTerm ? `No nodes found for "${searchTerm}"` : 'No nodes available'}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};