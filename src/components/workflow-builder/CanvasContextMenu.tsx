/**
 * ENHANCED CANVAS CONTEXT MENU
 * Full node library accessible via right-click
 * Loads categories and nodes from database
 */
import React, { useState, useEffect, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  FileOutput,
  Search,
  Wrench,
  Brain,
  Shield,
  Globe,
  Server,
  Code,
  Mail,
  Users,
  FileText,
  Activity,
  BarChart3,
  Clock,
  Layers,
  Link2,
  Cpu,
  CloudCog
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  position: { x: number; y: number };
  onAddNode: (type: string, category: string, label: string, position: { x: number; y: number }) => void;
}

interface NodeCategory {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  nodes: NodeType[];
}

interface NodeType {
  id: string;
  type_key: string;
  display_name: string;
  description?: string;
  category_id: string;
}

// Map icon names to Lucide icons
const iconMap: { [key: string]: React.ComponentType<any> } = {
  'workflow': Workflow,
  'bot': Bot,
  'database': Database,
  'zap': Zap,
  'settings': Settings,
  'brain': Brain,
  'shield': Shield,
  'globe': Globe,
  'server': Server,
  'code': Code,
  'mail': Mail,
  'users': Users,
  'file-text': FileText,
  'activity': Activity,
  'bar-chart': BarChart3,
  'clock': Clock,
  'layers': Layers,
  'link': Link2,
  'cpu': Cpu,
  'cloud': CloudCog,
  'wrench': Wrench,
  'message-square': MessageSquare,
  'git-branch': GitBranch,
  'play': Play,
  'check': CheckCircle,
  'file-input': FileInput,
  'file-output': FileOutput,
};

const getIconForCategory = (categoryName: string, iconName?: string): React.ComponentType<any> => {
  if (iconName && iconMap[iconName.toLowerCase()]) {
    return iconMap[iconName.toLowerCase()];
  }
  
  // Fallback based on category name
  const name = categoryName.toLowerCase();
  if (name.includes('ai') || name.includes('agent')) return Bot;
  if (name.includes('workflow') || name.includes('flow')) return Workflow;
  if (name.includes('data')) return Database;
  if (name.includes('integration') || name.includes('api')) return Zap;
  if (name.includes('mcp') || name.includes('connector')) return Wrench;
  if (name.includes('security') || name.includes('auth')) return Shield;
  if (name.includes('analytics') || name.includes('monitor')) return BarChart3;
  if (name.includes('communication') || name.includes('message')) return MessageSquare;
  if (name.includes('healthcare') || name.includes('medical')) return Activity;
  
  return Settings;
};

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  children,
  position,
  onAddNode,
}) => {
  const [categories, setCategories] = useState<NodeCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load categories and nodes from database
  useEffect(() => {
    loadCategoriesAndNodes();
  }, []);

  const loadCategoriesAndNodes = async () => {
    setIsLoading(true);
    try {
      // Load categories
      const { data: categoriesData } = await (supabase as any)
        .from('workflow_node_categories')
        .select('id, name, description')
        .eq('is_active', true)
        .order('display_order');

      // Load node types
      const { data: nodesData } = await supabase
        .from('workflow_node_types')
        .select('id, type_key, display_name, description, category_id')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesData && nodesData) {
        const categoriesWithNodes: NodeCategory[] = (categoriesData as any[]).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          nodes: (nodesData as any[]).filter((node: any) => node.category_id === cat.id)
        })).filter((cat: NodeCategory) => cat.nodes.length > 0);

        setCategories(categoriesWithNodes);
      }
    } catch (error) {
      console.error('Failed to load node categories:', error);
      // Fallback to static categories
      setCategories(getStaticCategories());
    } finally {
      setIsLoading(false);
    }
  };

  // Static fallback categories
  const getStaticCategories = (): NodeCategory[] => [
    {
      id: 'workflow',
      name: 'Workflow',
      nodes: [
        { id: 'start', type_key: 'start', display_name: 'Start', category_id: 'workflow' },
        { id: 'end', type_key: 'end', display_name: 'End', category_id: 'workflow' },
        { id: 'condition', type_key: 'condition', display_name: 'Condition', category_id: 'workflow' },
        { id: 'loop', type_key: 'loop', display_name: 'Loop', category_id: 'workflow' },
        { id: 'parallel', type_key: 'parallel', display_name: 'Parallel', category_id: 'workflow' },
      ]
    },
    {
      id: 'ai-agents',
      name: 'AI Agents',
      nodes: [
        { id: 'agent', type_key: 'agent', display_name: 'AI Agent', category_id: 'ai-agents' },
        { id: 'multi-agent', type_key: 'multi-agent', display_name: 'Multi-Agent Team', category_id: 'ai-agents' },
        { id: 'llm', type_key: 'llm', display_name: 'LLM Node', category_id: 'ai-agents' },
        { id: 'reasoning', type_key: 'reasoning', display_name: 'Reasoning Agent', category_id: 'ai-agents' },
        { id: 'vision', type_key: 'vision', display_name: 'Vision Agent', category_id: 'ai-agents' },
      ]
    },
    {
      id: 'data',
      name: 'Data',
      nodes: [
        { id: 'database', type_key: 'database', display_name: 'Database', category_id: 'data' },
        { id: 'input', type_key: 'input', display_name: 'Input', category_id: 'data' },
        { id: 'output', type_key: 'output', display_name: 'Output', category_id: 'data' },
        { id: 'knowledge_base', type_key: 'knowledge_base', display_name: 'Knowledge Base', category_id: 'data' },
        { id: 'rag_retrieval', type_key: 'rag_retrieval', display_name: 'RAG Retrieval', category_id: 'data' },
        { id: 'transform', type_key: 'transform', display_name: 'Transform', category_id: 'data' },
      ]
    },
    {
      id: 'integration',
      name: 'Integration',
      nodes: [
        { id: 'api', type_key: 'api', display_name: 'API Call', category_id: 'integration' },
        { id: 'webhook', type_key: 'webhook', display_name: 'Webhook', category_id: 'integration' },
        { id: 'function', type_key: 'function', display_name: 'Function', category_id: 'integration' },
        { id: 'http', type_key: 'http', display_name: 'HTTP Request', category_id: 'integration' },
      ]
    },
    {
      id: 'mcp',
      name: 'MCP Connectors',
      nodes: [
        { id: 'mcp_connector', type_key: 'mcp_connector', display_name: 'MCP Connector', category_id: 'mcp' },
        { id: 'healthcare_mcp', type_key: 'healthcare_mcp', display_name: 'Healthcare MCP', category_id: 'mcp' },
        { id: 'filesystem_mcp', type_key: 'filesystem_mcp', display_name: 'Filesystem MCP', category_id: 'mcp' },
        { id: 'database_mcp', type_key: 'database_mcp', display_name: 'Database MCP', category_id: 'mcp' },
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      nodes: [
        { id: 'npi_verification', type_key: 'npi_verification', display_name: 'NPI Verification', category_id: 'healthcare' },
        { id: 'patient_intake', type_key: 'patient_intake', display_name: 'Patient Intake', category_id: 'healthcare' },
        { id: 'ehr_integration', type_key: 'ehr_integration', display_name: 'EHR Integration', category_id: 'healthcare' },
        { id: 'hipaa_compliance', type_key: 'hipaa_compliance', display_name: 'HIPAA Compliance', category_id: 'healthcare' },
      ]
    },
    {
      id: 'communication',
      name: 'Communication',
      nodes: [
        { id: 'email', type_key: 'email', display_name: 'Email', category_id: 'communication' },
        { id: 'sms', type_key: 'sms', display_name: 'SMS', category_id: 'communication' },
        { id: 'notification', type_key: 'notification', display_name: 'Notification', category_id: 'communication' },
        { id: 'voice', type_key: 'voice', display_name: 'Voice Call', category_id: 'communication' },
      ]
    },
  ];

  // Filter categories and nodes based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    
    const term = searchTerm.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      nodes: cat.nodes.filter(node => 
        node.display_name.toLowerCase().includes(term) ||
        node.type_key.toLowerCase().includes(term) ||
        node.description?.toLowerCase().includes(term)
      )
    })).filter(cat => cat.nodes.length > 0 || cat.name.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  // Quick add nodes (most commonly used)
  const quickAddNodes = [
    { type: 'agent', category: 'ai-agents', label: 'AI Agent', icon: Bot },
    { type: 'condition', category: 'workflow', label: 'Condition', icon: GitBranch },
    { type: 'api', category: 'integration', label: 'API Call', icon: Zap },
    { type: 'knowledge_base', category: 'data', label: 'Knowledge Base', icon: Database },
    { type: 'mcp_connector', category: 'mcp', label: 'MCP Connector', icon: Wrench },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-background border shadow-xl">
        {/* Search */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Quick Add */}
        <div className="p-1 border-b">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Quick Add</div>
          {quickAddNodes.map((node) => (
            <ContextMenuItem
              key={node.type}
              onSelect={() => onAddNode(node.type, node.category, node.label, position)}
              className="text-sm"
            >
              <node.icon className="mr-2 h-4 w-4 text-primary" />
              {node.label}
            </ContextMenuItem>
          ))}
        </div>

        <ContextMenuSeparator />

        {/* Node Categories */}
        <div className="max-h-[400px] overflow-y-auto">
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Plus className="mr-2 h-4 w-4" />
              All Node Categories
              <Badge variant="secondary" className="ml-auto text-xs">
                {categories.reduce((sum, cat) => sum + cat.nodes.length, 0)}
              </Badge>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56 bg-background border shadow-lg">
              <ScrollArea className="max-h-[500px]">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading nodes...
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No nodes found
                  </div>
                ) : (
                  filteredCategories.map((category) => {
                    const CategoryIcon = getIconForCategory(category.name, category.icon_name);
                    return (
                      <ContextMenuSub key={category.id}>
                        <ContextMenuSubTrigger>
                          <CategoryIcon className="mr-2 h-4 w-4" />
                          {category.name}
                          <Badge variant="outline" className="ml-auto text-xs">
                            {category.nodes.length}
                          </Badge>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-52 bg-background border shadow-lg">
                          <ScrollArea className="max-h-[300px]">
                            {category.nodes.map((node) => (
                              <ContextMenuItem
                                key={node.id}
                                onSelect={() => onAddNode(
                                  node.type_key, 
                                  category.name.toLowerCase().replace(/\s+/g, '-'), 
                                  node.display_name, 
                                  position
                                )}
                                className="flex flex-col items-start py-2"
                              >
                                <span className="text-sm font-medium">{node.display_name}</span>
                                {node.description && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {node.description}
                                  </span>
                                )}
                              </ContextMenuItem>
                            ))}
                          </ScrollArea>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                    );
                  })
                )}
              </ScrollArea>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
};
