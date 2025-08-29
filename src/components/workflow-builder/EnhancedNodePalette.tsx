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
    // Initialize expanded state for the 8 consolidated categories only
    setExpandedCategories((prev) => {
      if (Object.keys(prev).length) return prev;
      const initial: Record<string, boolean> = {};
      ['ai_models_processing','data_integration','communication_channels','automation_workflow','development_testing','templates_configuration','storage_cache','human_oversight']
        .forEach((name) => { initial[name] = false; });
      return initial;
    });
  }, []);

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

  // Helper function to get provider group for templates
  const getTemplateProviderGroup = (templateNode: any) => {
    if (templateNode.type_key?.startsWith('prompt_template_')) {
      return `${templateNode.default_config?.category || 'Template'} Templates`;
    }
    if (templateNode.type_key?.startsWith('agent_template_')) {
      return templateNode.default_config?.is_default ? 'System Templates' : 'Custom Templates';
    }
    return 'Prompt Templates';
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

  // Consolidated 8 meaningful categories with optimized UX sequence and provider grouping
  const computed: Record<string, typeof nodeTypes> = {
    // 1. AI Models & Processing - Most important, group by provider
    ai_models_processing: [
      ...filteredNodeTypes.filter((nt) =>
        match(nt, ['openai','anthropic','claude','gpt','mistral','cohere','gemini','groq','llm','bedrock','azure','deepseek','ollama','llama','phi','qwen','vision','multimodal','mcp','model context protocol','ai','intelligence'])
      ),
      ...populatedNodes.genai_llm.map(n => ({ ...n, id: n.type_key, provider_group: (n as any).provider || 'LLM Providers' } as any)),
      ...populatedNodes.small_language_models.map(n => ({ ...n, id: n.type_key, provider_group: (n as any).provider || 'Small Models' } as any)),
      ...populatedNodes.mcp.map(n => ({ ...n, id: n.type_key, provider_group: 'MCP Tools' } as any))
    ].sort((a, b) => {
      // Define priority order for agent creation workflow
      const getPriority = (node: any) => {
        const name = (node.display_name || node.type_key).toLowerCase();
        const provider = (node.provider_group || node.provider || '').toLowerCase();
        
        // Core models first (most commonly used in agent creation)
        if (name.includes('gpt') || name.includes('claude') || name.includes('openai')) return 1;
        if (name.includes('gemini') || name.includes('anthropic')) return 2;
        if (provider.includes('llm') || name.includes('llm')) return 3;
        if (provider.includes('small') || name.includes('small')) return 4;
        if (provider.includes('mcp') || name.includes('mcp')) return 5;
        return 6;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      const providerA = (a as any).provider_group || (a as any).provider || 'Other';
      const providerB = (b as any).provider_group || (b as any).provider || 'Other';
      if (providerA !== providerB) return providerA.localeCompare(providerB);
      return (a.display_name || a.type_key).localeCompare(b.display_name || b.type_key);
    }),
    
    // 2. Templates & Configuration - Second most important for setup
    templates_configuration: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['prompt','template','few-shot','few shot','instruction','system prompt','example','config','setting','parameter','system','setup'])),
      ...populatedNodes.prompts.map(n => ({ 
        ...n, 
        id: n.type_key, 
        provider_group: getTemplateProviderGroup(n),
        // Preserve all enhanced properties
        detailed_explanation: n.detailed_explanation,
        input_schema: n.input_schema,
        output_schema: n.output_schema,
        capabilities: n.capabilities,
        requirements: n.requirements,
        default_config: n.default_config
      } as any))
    ].sort((a, b) => (a.display_name || a.type_key).localeCompare(b.display_name || b.type_key)),
    
    // 3. Communication Channels - Essential for deployment
    communication_channels: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['channel','voice call','web chat','email','messaging','instagram','deployment matrix','voice','speech','audio','tts','stt','whisper','eleven','recognition','synthesis','phone','chat','message'])),
      ...populatedNodes.channel_deployment.map(n => ({ ...n, id: n.type_key, provider_group: (n as any).provider || 'Channel Providers' } as any)),
      ...populatedNodes.voice_config.map(n => ({ ...n, id: n.type_key, provider_group: (n as any).provider || 'Voice Providers' } as any))
    ].sort((a, b) => {
      const getPriority = (node: any) => {
        const name = (node.display_name || node.type_key).toLowerCase();
        
        // Primary communication channels first
        if (name.includes('web') && name.includes('chat')) return 1;
        if (name.includes('voice') && name.includes('call')) return 2;
        if (name.includes('phone') || name.includes('sms')) return 3;
        if (name.includes('email')) return 4;
        if (name.includes('voice') || name.includes('tts') || name.includes('stt')) return 5;
        if (name.includes('messaging') || name.includes('chat')) return 6;
        return 7;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      const providerA = (a as any).provider_group || (a as any).provider || 'Other';
      const providerB = (b as any).provider_group || (b as any).provider || 'Other';
      if (providerA !== providerB) return providerA.localeCompare(providerB);
      
      return (a.display_name || a.type_key).localeCompare(b.display_name || b.type_key);
    }),
    
    // 4. Automation & Workflow - Core workflow logic
    automation_workflow: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['workflow','automation','trigger','action','condition','loop','branch','decision','route','flow','logic']))
    ].sort((a, b) => {
      const getPriority = (node: any) => {
        const name = (node.display_name || node.type_key).toLowerCase();
        
        // Start nodes first, then logic, then actions
        if (name.includes('start') || name.includes('trigger') || name.includes('begin')) return 1;
        if (name.includes('condition') || name.includes('decision') || name.includes('if')) return 2;
        if (name.includes('branch') || name.includes('route') || name.includes('switch')) return 3;
        if (name.includes('loop') || name.includes('repeat') || name.includes('iterate')) return 4;
        if (name.includes('action') || name.includes('execute') || name.includes('run')) return 5;
        if (name.includes('end') || name.includes('finish') || name.includes('complete')) return 6;
        return 7;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      return (a.display_name || a.type_key).localeCompare(b.display_name || b.type_key);
    }),
    
    // 5. Data & Integration - Data handling
    data_integration: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['parser','parse','processor','process','transform','normalize','extract','clean','database','api','webhook','integration','data','json','xml']))
    ].sort((a, b) => {
      const getPriority = (node: any) => {
        const name = (node.display_name || node.type_key).toLowerCase();
        
        // Input -> Process -> Transform -> Output order
        if (name.includes('input') || name.includes('receive') || name.includes('webhook')) return 1;
        if (name.includes('parse') || name.includes('extract')) return 2;
        if (name.includes('process') || name.includes('transform')) return 3;
        if (name.includes('normalize') || name.includes('clean') || name.includes('validate')) return 4;
        if (name.includes('api') || name.includes('database') || name.includes('integration')) return 5;
        if (name.includes('output') || name.includes('send') || name.includes('export')) return 6;
        return 7;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      return (a.display_name || a.type_key).localeCompare(b.display_name || b.type_key);
    }),
    
    // 6. Storage & Cache - Memory and storage
    storage_cache: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['storage','file','document','upload','download','backup','sync','s3','blob','cache','memory','buffer','history','scratchpad','store']))
    ].sort((a, b) => {
      const getPriority = (node: any) => {
        const name = (node.display_name || node.type_key).toLowerCase();
        
        // Memory -> Session -> Persistent -> Backup order
        if (name.includes('memory') || name.includes('buffer') || name.includes('scratchpad')) return 1;
        if (name.includes('cache') || name.includes('session')) return 2;
        if (name.includes('history') || name.includes('log')) return 3;
        if (name.includes('storage') || name.includes('database') || name.includes('file')) return 4;
        if (name.includes('backup') || name.includes('archive')) return 5;
        if (name.includes('sync') || name.includes('upload') || name.includes('download')) return 6;
        return 7;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      return (a.display_name || a.type_key).localeCompare(b.display_name || b.type_key);
    }),
    
    // 7. Human Oversight - Human interaction
    human_oversight: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['human','handoff','escalation','transfer','agent transfer','live agent','approval','review','oversight','supervision','label','annotation','label studio','manual']))
    ].sort((a, b) => {
      const getPriority = (node: any) => {
        const name = (node.display_name || node.type_key).toLowerCase();
        
        // Review -> Approval -> Escalation -> Manual order
        if (name.includes('review') || name.includes('check') || name.includes('oversight')) return 1;
        if (name.includes('approval') || name.includes('authorize')) return 2;
        if (name.includes('escalation') || name.includes('escalate')) return 3;
        if (name.includes('handoff') || name.includes('transfer')) return 4;
        if (name.includes('live') || name.includes('agent')) return 5;
        if (name.includes('manual') || name.includes('human') || name.includes('label')) return 6;
        return 7;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      return (a.display_name || a.type_key).localeCompare(b.display_name || b.type_key);
    }),
    
    // 8. Development & Testing - Advanced tools
    development_testing: [
      ...filteredNodeTypes.filter((nt) => match(nt, ['test','testing','validation','debug','simulation','flow test','dev','uat','staging','snippet','code','docker','kubernetes','debug']))
    ].sort((a, b) => {
      const getPriority = (node: any) => {
        const name = (node.display_name || node.type_key).toLowerCase();
        
        // Unit Tests -> Integration -> Debug -> Deploy order
        if (name.includes('unit') || (name.includes('test') && !name.includes('flow'))) return 1;
        if (name.includes('validation') || name.includes('validate')) return 2;
        if (name.includes('flow') && name.includes('test')) return 3;
        if (name.includes('integration') || name.includes('uat')) return 4;
        if (name.includes('debug') || name.includes('simulation')) return 5;
        if (name.includes('staging') || name.includes('deploy')) return 6;
        if (name.includes('docker') || name.includes('kubernetes')) return 7;
        return 8;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      return (a.display_name || a.type_key).localeCompare(b.display_name || b.type_key);
    })
  };

  const dedupe = (arr: typeof nodeTypes) => {
    const m = new Map(arr.map((n) => [n.id, n]));
    return Array.from(m.values());
  };

  const allNodeTypesByCategory = Object.entries(computed).reduce((acc, [key, list]) => {
    acc[key] = dedupe([...(baseByCategory[key] || []), ...list]);
    return acc;
  }, { ...baseByCategory } as Record<string, typeof nodeTypes>);

  // 8 consolidated categories with optimized UX sequence
  const allCategories = React.useMemo(() => {
    return [
      {
        id: 'ai-models-processing',
        name: 'ai_models_processing', 
        display_name: 'AI Models & Processing',
        description: 'Core AI models, LLMs, and processing nodes',
        icon: 'brain',
        color: '#3b82f6',
        order_index: 1,
        is_active: true,
        created_at: '',
        updated_at: ''
      },
      {
        id: 'templates-configuration',
        name: 'templates_configuration',
        display_name: 'Templates & Configuration', 
        description: 'Prompts, templates, and system configurations',
        icon: 'file-text',
        color: '#ef4444',
        order_index: 2,
        is_active: true,
        created_at: '',
        updated_at: ''
      },
      {
        id: 'communication-channels',
        name: 'communication_channels',
        display_name: 'Communication Channels',
        description: 'Voice, chat, email, and deployment channels',
        icon: 'message-square',
        color: '#10b981',
        order_index: 3,
        is_active: true,
        created_at: '',
        updated_at: ''
      },
      {
        id: 'automation-workflow',
        name: 'automation_workflow', 
        display_name: 'Automation & Workflow',
        description: 'Workflow controls, conditions, and automation',
        icon: 'zap',
        color: '#f59e0b',
        order_index: 4,
        is_active: true,
        created_at: '',
        updated_at: ''
      },
      {
        id: 'data-integration',
        name: 'data_integration',
        display_name: 'Data & Integration',
        description: 'Data processing, APIs, and integrations',
        icon: 'database',
        color: '#06b6d4',
        order_index: 5,
        is_active: true,
        created_at: '',
        updated_at: ''
      },
      {
        id: 'storage-cache',
        name: 'storage_cache',
        display_name: 'Storage & Cache',
        description: 'Data storage, memory, and caching systems',
        icon: 'grid-3x3',
        color: '#84cc16',
        order_index: 6,
        is_active: true,
        created_at: '',
        updated_at: ''
      },
      {
        id: 'human-oversight',
        name: 'human_oversight',
        display_name: 'Human Oversight',
        description: 'Human handoffs, approvals, and supervision',
        icon: 'eye',
        color: '#f97316',
        order_index: 7,
        is_active: true,
        created_at: '',
        updated_at: ''
      },
      {
        id: 'development-testing',
        name: 'development_testing',
        display_name: 'Development & Testing',
        description: 'Testing, validation, and development tools',
        icon: 'wrench',
        color: '#8b5cf6',
        order_index: 8,
        is_active: true,
        created_at: '',
        updated_at: ''
      }
    ] as any[];
  }, []);

  // Enhanced drag start for node palette
  const onDragStart = (event: React.DragEvent, nodeType: any) => {
    // Enhanced drag payload with full node type information including AI assist integration
    const dragData = {
      type: nodeType.type_key,
      nodeType,
      category: nodeType.category?.name,
      configuration: nodeType.default_config || {},
      aiAssistMode: 'configure', // Default mode, can be overridden
      label: nodeType.display_name,
      icon: nodeType.icon,
    };

    event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
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
            <strong>{Object.values(allNodeTypesByCategory).flat().length}</strong> nodes • <strong>{allCategories.length}</strong> categories
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