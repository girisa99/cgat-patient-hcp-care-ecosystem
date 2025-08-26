import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Workflow, ChevronDown, ChevronRight, Search, Info, 
  Bot, Database, Brain, Zap, Eye, Link, Grid3X3, 
  Wrench, FileText, MessageSquare, Filter, Settings, GitBranch, Plus
} from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useWorkflowNodePopulation } from '@/hooks/useWorkflowNodePopulation';
import { ProviderDropdown } from './ProviderDropdown';
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
  searchTermExternal?: string;
  hideSearch?: boolean;
}

export const EnhancedNodePalette: React.FC<EnhancedNodePaletteProps> = ({ 
  heightClass = "h-full",
  onNodeSelect,
  searchTermExternal,
  hideSearch = false
}) => {
  const {
    categories, 
    nodeTypes, 
    nodeTypesByCategory, 
    isLoading, 
    error
  } = useWorkflowNodes();

  const { getPopulatedNodes } = useWorkflowNodePopulation();
  
const [internalSearch, setInternalSearch] = useState('');
  const searchTerm = searchTermExternal ?? internalSearch;
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(true);
  const [designNav, setDesignNav] = useState<'layout' | 'nodes' | 'edges'>('layout');

  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    console.log('[EnhancedNodePalette] mounted', { path: window.location.pathname });
    if (el) {
      const r = el.getBoundingClientRect();
      console.log('[EnhancedNodePalette] container', { height: r.height });
    }
  }, []);

  React.useEffect(() => {
    if (categories.length) {
      setExpandedCategories((prev) => {
        if (Object.keys(prev).length) return prev;
        const initial: Record<string, boolean> = {};
        categories.forEach((cat) => { initial[cat.name] = false; });
        return initial;
      });
    }
  }, [categories]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const handleDesignNav = (tab: 'layout' | 'nodes' | 'edges') => {
    setDesignNav(tab);
    window.dispatchEvent(new CustomEvent('workflow-design-nav', { detail: { tab } }));
  };

  const filteredNodeTypes = nodeTypes.filter(nodeType =>
    nodeType.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nodeType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nodeType.category?.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const baseByCategory = filteredNodeTypes.reduce((acc, nodeType) => {
    const categoryName = nodeType.category?.name || 'uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [] as typeof nodeTypes;
    }
    acc[categoryName].push(nodeType);
    return acc;
  }, {} as Record<string, typeof nodeTypes>);

  // Derive additional groupings so existing nodes appear under desired categories
  const match = (nt: any, keywords: string[]) => {
    const t = `${nt.type_key} ${nt.display_name} ${nt.description}`.toLowerCase();
    return keywords.some(k => t.includes(k));
  };

  // Get populated nodes from backend data
  const populatedNodes = getPopulatedNodes();

  // Consolidated 8 meaningful categories with provider-based grouping
  const computed: Record<string, typeof nodeTypes> = {
    // 1. AI Models & Processing - Group by provider with dropdowns
    ai_models_processing: [
      ...filteredNodeTypes.filter((nt) =>
        match(nt, ['openai','anthropic','claude','gpt','mistral','cohere','gemini','groq','llm','bedrock','azure','deepseek','ollama','llama','phi','qwen','vision','multimodal','mcp','model context protocol'])
      ),
      ...populatedNodes.genai_llm.map(n => ({ ...n, id: n.type_key, provider_group: (n as any).provider || 'Other' } as any)),
      ...populatedNodes.small_language_models.map(n => ({ ...n, id: n.type_key, provider_group: (n as any).provider || 'Other' } as any)),
      ...populatedNodes.mcp.map(n => ({ ...n, id: n.type_key, provider_group: 'MCP' } as any))
    ],
    
    // 2. Data & Integration
    data_integration: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['parser','parse','processor','process','transform','normalize','extract','clean','database','cache','memory','buffer','history','scratchpad','api','webhook','integration'])),
    ],
    
    // 3. Communication Channels - Group by provider
    communication_channels: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['channel','voice call','web chat','email','messaging','instagram','deployment matrix','voice','speech','audio','tts','stt','whisper','eleven','recognition','synthesis'])),
      ...populatedNodes.channel_deployment.map(n => ({ ...n, id: n.type_key, provider_group: (n as any).provider || 'Other' } as any)),
      ...populatedNodes.voice_config.map(n => ({ ...n, id: n.type_key, provider_group: (n as any).provider || 'Other' } as any))
    ],
    
    // 4. Automation & Workflow
    automation_workflow: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['workflow','automation','trigger','action','condition','loop','branch','decision','route']))
    ],
    
    // 5. Development & Testing
    development_testing: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['test','testing','validation','debug','simulation','flow test','dev','uat','staging','snippet','code','docker','kubernetes']))
    ],
    
    // 6. Templates & Configuration
    templates_configuration: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['prompt','template','few-shot','few shot','instruction','system prompt','example','config','setting','parameter'])),
      ...populatedNodes.prompts.map(n => ({ ...n, id: n.type_key, provider_group: 'Templates' } as any))
    ],
    
    // 7. Storage & Cache
    storage_cache: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['storage','file','document','upload','download','backup','sync','s3','blob']))
    ],
    
    // 8. Human Oversight
    human_oversight: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['human','handoff','escalation','transfer','agent transfer','live agent','approval','review','oversight','supervision','label','annotation','label studio']))
    ]
  };

  const dedupe = (arr: typeof nodeTypes) => {
    const m = new Map(arr.map((n) => [n.id, n]));
    return Array.from(m.values());
  };

  const allNodeTypesByCategory = Object.entries(computed).reduce((acc, [key, list]) => {
    acc[key] = dedupe([...(baseByCategory[key] || []), ...list]);
    return acc;
  }, { ...baseByCategory } as Record<string, typeof nodeTypes>);

  const allCategories = React.useMemo(() => {
    const list = [...categories];
    const ensure = (name: string, display_name: string, icon: string, color: string) => {
      if (!list.find((c) => c.name === name)) {
        list.push({
          id: `virtual-${name}`,
          name,
          display_name,
          description: display_name,
          icon,
          color,
          order_index: (list[list.length - 1]?.order_index || 0) + 1,
          is_active: true,
          created_at: '',
          updated_at: ''
        } as any);
      }
    };
    // Create the 8 consolidated categories
    ensure('ai_models_processing','AI Models & Processing','brain','#3b82f6');
    ensure('data_integration','Data & Integration','database','#06b6d4');
    ensure('communication_channels','Communication Channels','message-square','#10b981');
    ensure('automation_workflow','Automation & Workflow','zap','#f59e0b');
    ensure('development_testing','Development & Testing','wrench','#8b5cf6');
    ensure('templates_configuration','Templates & Configuration','file-text','#ef4444');
    ensure('storage_cache','Storage & Cache','grid-3x3','#84cc16');
    ensure('human_oversight','Human Oversight','eye','#f97316');
    return list;
  }, [categories]);

  const onDragStart = (event: React.DragEvent, nodeType: any) => {
    // Enhanced drag payload with full node type information
    event.dataTransfer.setData('application/reactflow', nodeType.type_key);
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        ...nodeType,
        source: 'enhanced-node-palette',
        isWorkflowNode: true,
        label: nodeType.display_name,
      })
    );
    event.dataTransfer.setData('text/plain', nodeType.type_key);
    event.dataTransfer.effectAllowed = 'move';
    console.log('[RF] dragStart', { type: nodeType.type_key, nodeType });
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
    <div ref={rootRef} className={cn("flex flex-col h-full min-h-0", heightClass)}>
      <div className="flex-shrink-0 px-3 pb-2 space-y-3">
        {!hideSearch && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes (e.g., 'OpenAI', 'agent', 'database')..."
              value={searchTerm}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="pl-8 h-9 text-xs placeholder:text-xs"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            <strong>{nodeTypes.length}</strong> nodes • <strong>{allCategories.length}</strong> categories
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
            const hasCollapsed = Object.values(expandedCategories).some(v => !v);
            const newState = allCategories.reduce((acc, cat) => ({
              ...acc,
              [cat.name]: hasCollapsed
            }), {});
              setExpandedCategories(newState);
            }}
          >
            {Object.values(expandedCategories).every(v => v) ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>

        {/* Workflow Design quick nav - Remove duplicate, only keep palette navigation */}
        <div className="mt-1">
          <div className="text-xs text-muted-foreground mb-1">Workflow Design</div>
          <div className="flex flex-col gap-1">
            <Button variant={designNav==='layout' ? 'secondary' : 'ghost'} size="sm" className="h-7 justify-start" onClick={() => handleDesignNav('layout')}>
              <Workflow className="h-3 w-3 mr-2" /> Layout
            </Button>
            <Button variant={designNav==='nodes' ? 'secondary' : 'ghost'} size="sm" className="h-7 justify-start" onClick={() => handleDesignNav('nodes')}>
              <Grid3X3 className="h-3 w-3 mr-2" /> Nodes
            </Button>
            <Button variant={designNav==='edges' ? 'secondary' : 'ghost'} size="sm" className="h-7 justify-start" onClick={() => handleDesignNav('edges')}>
              <Link className="h-3 w-3 mr-2" /> Edges
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/20 rounded">
            💡 Controls will appear in the main workflow area when selected
          </div>
        </div>
        
        {!searchTerm && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 mb-3">
            <div className="font-medium mb-2 text-foreground">Popular Categories:</div>
            <div className="flex flex-wrap gap-1">
              {allCategories
                .filter(cat => (allNodeTypesByCategory[cat.name]?.length || 0) > 0)
                .slice(0, 3)
                .map(cat => (
                  <Badge 
                    key={cat.id} 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-primary/20"
                    onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.name]: true }))}
                  >
                    {cat.display_name} ({allNodeTypesByCategory[cat.name]?.length || 0})
                  </Badge>
                ))
              }
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto pointer-events-auto"
           onWheelCapture={(e) => e.stopPropagation()}
           onTouchMoveCapture={(e) => e.stopPropagation()}
           onScrollCapture={(e) => e.stopPropagation()}
           style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}>

        <div className="px-3 pb-6 space-y-2">
            {/* Show categories with nodes first, then empty ones if showAllCategories is true */}
            {allCategories
              .filter(category => {
                const hasNodes = (allNodeTypesByCategory[category.name]?.length || 0) > 0;
                return hasNodes || (showAllCategories && !searchTerm);
              })
              .sort((a, b) => {
                // Sort by: 1) has nodes, 2) order index
                const aHasNodes = (allNodeTypesByCategory[a.name]?.length || 0) > 0;
                const bHasNodes = (allNodeTypesByCategory[b.name]?.length || 0) > 0;
                if (aHasNodes && !bHasNodes) return -1;
                if (!aHasNodes && bHasNodes) return 1;
                return a.order_index - b.order_index;
              })
              .map((category) => {
                const categoryNodes = allNodeTypesByCategory[category.name] || [];
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
                          {/* Provider-based dropdowns for certain categories */}
                          {(category.name === 'ai_models_processing' || 
                            category.name === 'communication_channels' || 
                            category.name === 'templates_configuration') && categoryNodes.length > 5 ? (
                            <ProviderDropdown 
                              nodes={categoryNodes}
                              onNodeSelect={handleNodeClick}
                              onDragStart={onDragStart}
                            />
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {categoryNodes
                                .slice(0, searchTerm ? undefined : 8)
                                .map((nodeType, index) => {
                                  const isSelected = selectedNodeType === nodeType.id;
                                  const IconComponent = getIconComponent(nodeType.icon);
                                  
                                  return (
                                    <div
                                      key={nodeType.id}
                                      className={cn(
                                        "group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all",
                                        "border border-transparent text-xs",
                                        isSelected 
                                          ? "bg-primary/10 border-primary/20 text-primary" 
                                          : "hover:bg-muted/50 hover:border-muted"
                                      )}
                                      draggable
                                      onDragStart={(e) => onDragStart(e, nodeType)}
                                      onClick={() => handleNodeClick(nodeType)}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div 
                                          className={cn(
                                            "p-1 rounded transition-transform",
                                            isSelected && "scale-110"
                                          )}
                                          style={{ 
                                            backgroundColor: `${nodeType.color || category.color}20`, 
                                            color: nodeType.color || category.color 
                                          }}
                                        >
                                          <IconComponent className="h-3 w-3" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-medium truncate">
                                            {nodeType.display_name}
                                          </div>
                                          {nodeType.description && (
                                            <div className="text-xs text-muted-foreground truncate">
                                              {nodeType.description.substring(0, 50)}...
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Settings className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
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
            
            {allCategories.filter(category => {
              const hasNodes = (allNodeTypesByCategory[category.name]?.length || 0) > 0;
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
            {!showAllCategories && allCategories.some(cat => (allNodeTypesByCategory[cat.name]?.length || 0) === 0) && (
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

            {/* Config & Testing sections at bottom */}
            <div className="mt-4 space-y-3">
              <div className="text-xs font-medium text-muted-foreground px-1">Tools & Actions</div>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <span>Add New Tool</span>
                    <Plus className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-tool-creator'))}
                  >
                    <Plus className="w-3 h-3 mr-2" /> Create Custom Tool
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-category-creator'))}
                  >
                    <Settings className="w-3 h-3 mr-2" /> Add Category
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <span>Testing & Debug</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                    <Workflow className="w-3 h-3 mr-2" /> Test Runner
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                    <Settings className="w-3 h-3 mr-2" /> Debug Console
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <span>Config & Deploy</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                    <Settings className="w-3 h-3 mr-2" /> Deployment Config
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                    <GitBranch className="w-3 h-3 mr-2" /> Environment Setup
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            </div>
        </div>
      </div>
    </div>
  );
};