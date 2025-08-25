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
    // Existing icons
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
    // New icons for comprehensive node support
    'heart': Bot, // Using Bot as fallback for heart
    'sparkles': Zap, // Using Zap as fallback for sparkles
    'search': Search,
    'shield': Bot, // Using Bot as fallback for shield 
    'terminal': Bot, // Using Bot as fallback for terminal
    'message-circle': MessageSquare,
    'code': Settings,
    'cloud': Database,
    'globe': Link,
    'building': Database,
    'flame': Zap,
    'twitter': Bot,
    'layers': Workflow,
    'edit': Settings,
    'table': Grid3X3,
    'list': Filter,
    'check-circle': Bot,
    'download': Bot,
    'upload': Bot,
    'scissors': Filter,
    'hash': Filter,
    'sticky-note': FileText,
    'route': Link,
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
    // Auto-expand categories that have nodes
    'genai_llm': true,
    'cache': true,
    'vector_stores': true,
    'tools': true,
    'document_loaders': true,
    'flows': true,
    'chains': true,
    // Collapse empty or less frequently used categories by default
    'small_language_models': false,
    'vision_models': false,
    'mcp': false,
    'prompts': false,
    'parsers': false,
    'utilities': false,
  });
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

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
    <div className={cn("flex flex-col h-full", heightClass)}>
      <div className="flex-shrink-0 px-3 pb-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes (e.g., 'OpenAI', 'agent', 'database')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-xs placeholder:text-xs"
          />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            <strong>{nodeTypes.length}</strong> nodes • <strong>{categories.length}</strong> categories
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              const hasCollapsed = Object.values(expandedCategories).some(v => !v);
              const newState = categories.reduce((acc, cat) => ({
                ...acc,
                [cat.name]: hasCollapsed
              }), {});
              setExpandedCategories(newState);
            }}
          >
            {Object.values(expandedCategories).every(v => v) ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
        
        {!searchTerm && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 mb-3">
            <div className="font-medium mb-2 text-foreground">Popular Categories:</div>
            <div className="flex flex-wrap gap-1">
              {categories
                .filter(cat => (nodeTypesByCategory[cat.name]?.length || 0) > 0)
                .slice(0, 3)
                .map(cat => (
                  <Badge 
                    key={cat.id} 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-primary/20"
                    onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.name]: true }))}
                  >
                    {cat.display_name} ({nodeTypesByCategory[cat.name]?.length || 0})
                  </Badge>
                ))
              }
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-3 pb-6 space-y-2">
            {/* Show categories with nodes first, then empty ones if showAllCategories is true */}
            {categories
              .filter(category => {
                const hasNodes = (filteredByCategory[category.name]?.length || 0) > 0;
                return hasNodes || (showAllCategories && !searchTerm);
              })
              .sort((a, b) => {
                // Sort by: 1) has nodes, 2) order index
                const aHasNodes = (filteredByCategory[a.name]?.length || 0) > 0;
                const bHasNodes = (filteredByCategory[b.name]?.length || 0) > 0;
                if (aHasNodes && !bHasNodes) return -1;
                if (!aHasNodes && bHasNodes) return 1;
                return a.order_index - b.order_index;
              })
              .map((category) => {
                const categoryNodes = filteredByCategory[category.name] || [];
                const isExpanded = expandedCategories[category.name];
                const IconComponent = getIconComponent(category.icon);
                const hasNodes = categoryNodes.length > 0;
                
                return (
                  <Collapsible 
                    key={category.id} 
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(category.name)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between p-2 h-auto transition-all",
                          hasNodes 
                            ? "hover:bg-muted/50 border border-transparent hover:border-muted" 
                            : "hover:bg-muted/30 opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={cn(
                              "p-1.5 rounded-md shadow-sm transition-all",
                              isExpanded && hasNodes ? "scale-110" : ""
                            )}
                            style={{ 
                              backgroundColor: `${category.color}${hasNodes ? '20' : '10'}`, 
                              color: category.color 
                            }}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-medium text-sm">{category.display_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {categoryNodes.length} node{categoryNodes.length !== 1 ? 's' : ''}
                              </span>
                              {!hasNodes && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasNodes && isExpanded && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 mr-1">
                              Expanded
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-1 pt-1">
                      {hasNodes ? (
                        <div className="space-y-2 ml-2 pl-2 border-l-2 border-muted">
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
                                  "group p-3 rounded-lg border transition-all duration-200",
                                  "cursor-grab active:cursor-grabbing hover:shadow-md",
                                  "bg-card hover:bg-accent/50",
                                  isSelected 
                                    ? "border-primary bg-primary/5 shadow-md transform scale-[1.02]" 
                                    : "border-border hover:border-muted-foreground/30"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div 
                                    className={cn(
                                      "p-2 rounded-md shadow-sm flex-shrink-0 transition-transform",
                                      "group-hover:scale-110"
                                    )}
                                    style={{ 
                                      backgroundColor: `${category.color}15`, 
                                      color: category.color,
                                      border: `1px solid ${category.color}30`
                                    }}
                                  >
                                    <NodeIcon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2 flex-wrap mb-1">
                                      {nodeType.display_name}
                                      {nodeType.capabilities.length > 0 && (
                                        <Badge 
                                          variant="secondary" 
                                          className="text-xs px-1.5 py-0.5"
                                          style={{ backgroundColor: `${category.color}10`, color: category.color }}
                                        >
                                          {nodeType.capabilities.length} features
                                        </Badge>
                                      )}
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {nodeType.description}
                                    </p>
                                    
                                    {isSelected && (
                                      <div className="mt-3 space-y-3 animate-in slide-in-from-top-1">
                                        <div className="text-xs bg-muted/50 rounded-md p-2">
                                          <div className="font-semibold mb-1 text-foreground">Detailed Information:</div>
                                          <div className="text-muted-foreground leading-relaxed text-xs">
                                            {nodeType.detailed_explanation}
                                          </div>
                                        </div>
                                        
                                        {nodeType.capabilities.length > 0 && (
                                          <div className="text-xs">
                                            <div className="font-semibold mb-2 text-foreground">Key Capabilities:</div>
                                            <div className="flex flex-wrap gap-1">
                                              {nodeType.capabilities.map((capability, index) => (
                                                <Badge 
                                                  key={index} 
                                                  variant="outline" 
                                                  className="text-xs px-2 py-0.5"
                                                  style={{ borderColor: `${category.color}40`, color: category.color }}
                                                >
                                                  {capability.replace(/_/g, ' ')}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {Object.keys(nodeType.requirements).length > 0 && (
                                          <div className="text-xs">
                                            <div className="font-semibold mb-1 text-foreground">Configuration Requirements:</div>
                                            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-md p-2 border border-amber-200 dark:border-amber-900/40">
                                              {Object.entries(nodeType.requirements).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center py-0.5">
                                                  <span className="font-medium text-amber-800 dark:text-amber-200">
                                                    {key.replace(/_/g, ' ')}:
                                                  </span>
                                                  <Badge 
                                                    variant={String(value) === 'required' ? 'destructive' : 'secondary'} 
                                                    className="text-xs ml-2"
                                                  >
                                                    {String(value)}
                                                  </Badge>
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
                      ) : (
                        <div className="ml-2 pl-4 py-2 text-xs text-muted-foreground border-l-2 border-dashed border-muted">
                          <div className="italic">No nodes in this category yet.</div>
                          <div className="text-xs mt-1">Will be available in future updates.</div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            
            {/* Show empty categories toggle */}
            {!searchTerm && (
              <div className="pt-2 border-t border-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                >
                  {showAllCategories ? 'Hide Empty Categories' : 'Show All Categories'}
                  <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", showAllCategories && "rotate-180")} />
                </Button>
              </div>
            )}
            
            {categories.filter(category => {
              const hasNodes = (filteredByCategory[category.name]?.length || 0) > 0;
              return hasNodes || (showAllCategories && !searchTerm);
            }).length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground space-y-2">
                  <div className="text-sm font-medium">
                    {searchTerm ? `No nodes found for "${searchTerm}"` : 'No nodes available'}
                  </div>
                  {searchTerm && (
                    <div className="text-xs">
                      Try searching for terms like "agent", "openai", "database", or "cache"
                    </div>
                  )}
                </div>
              </div>
            )}
            {!showAllCategories && categories.some(cat => (filteredByCategory[cat.name]?.length || 0) === 0) && (
              <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-dashed">
                <div className="text-center">
                  <Info className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs font-medium text-foreground mb-1">More Categories Available</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Some categories are being populated.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllCategories(true)}
                    className="text-xs h-6"
                  >
                    Show All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};