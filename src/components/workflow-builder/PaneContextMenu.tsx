/**
 * FLOATING PANE CONTEXT MENU
 * Appears on right-click on canvas pane (empty area)
 * Provides node addition and quick actions
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Settings,
  Search,
  Wrench,
  Brain,
  Shield,
  Globe,
  Server,
  Activity,
  BarChart3,
  Layers,
  Link2,
  Users,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MULTI_AGENT_NODES, MULTI_AGENT_CATEGORIES } from './MultiAgentNodeRegistry';

interface AgentContext {
  name?: string;
  useCase?: { name: string; description?: string };
  useCaseId?: string;
}

interface PaneContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAddNode: (type: string, category: string, label: string, position: { x: number; y: number }) => void;
  agentContext?: AgentContext;
}

interface NodeCategory {
  id: string;
  name: string;
  description?: string;
  nodes: NodeType[];
}

interface NodeType {
  id: string;
  type_key: string;
  display_name: string;
  description?: string;
  category_id: string;
}

export const PaneContextMenu: React.FC<PaneContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  onAddNode,
  agentContext,
}) => {
  const [categories, setCategories] = useState<NodeCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Load categories and nodes
  useEffect(() => {
    if (isOpen) {
      loadCategoriesAndNodes();
    }
  }, [isOpen]);

  const loadCategoriesAndNodes = async () => {
    setIsLoading(true);
    try {
      const { data: categoriesData } = await (supabase as any)
        .from('workflow_node_categories')
        .select('id, name, description')
        .eq('is_active', true)
        .order('display_order');

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
      setCategories(getStaticCategories());
    } finally {
      setIsLoading(false);
    }
  };

  const getStaticCategories = (): NodeCategory[] => [
    {
      id: 'workflow',
      name: 'Workflow',
      nodes: [
        { id: 'start', type_key: 'start', display_name: 'Start', category_id: 'workflow' },
        { id: 'end', type_key: 'end', display_name: 'End', category_id: 'workflow' },
        { id: 'condition', type_key: 'condition', display_name: 'Condition', category_id: 'workflow' },
        { id: 'loop', type_key: 'loop', display_name: 'Loop', category_id: 'workflow' },
      ]
    },
    {
      id: 'ai-agents',
      name: 'AI Agents',
      nodes: [
        { id: 'agent', type_key: 'agent', display_name: 'AI Agent', category_id: 'ai-agents' },
        { id: 'llm', type_key: 'llm', display_name: 'LLM Node', category_id: 'ai-agents' },
      ]
    },
    {
      id: 'data',
      name: 'Data',
      nodes: [
        { id: 'database', type_key: 'database', display_name: 'Database', category_id: 'data' },
        { id: 'knowledge_base', type_key: 'knowledge_base', display_name: 'Knowledge Base', category_id: 'data' },
      ]
    },
    {
      id: 'integration',
      name: 'Integration',
      nodes: [
        { id: 'api', type_key: 'api', display_name: 'API Call', category_id: 'integration' },
        { id: 'webhook', type_key: 'webhook', display_name: 'Webhook', category_id: 'integration' },
      ]
    },
  ];

  // Filter based on search
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
    })).filter(cat => cat.nodes.length > 0);
  }, [categories, searchTerm]);

  // Quick add nodes
  const quickAddNodes = [
    { type: 'agent', category: 'ai-agents', label: 'AI Agent', icon: Bot },
    { type: 'condition', category: 'workflow', label: 'Condition', icon: GitBranch },
    { type: 'knowledge_base', category: 'data', label: 'Knowledge Base', icon: Database },
    { type: 'api', category: 'integration', label: 'API Call', icon: Zap },
  ];

  // Multi-agent nodes
  const multiAgentNodes = [
    { type: 'a2a_agent', category: 'multi-agent', label: 'A2A Agent', icon: Users },
    { type: 'agent_team', category: 'multi-agent', label: 'Agent Team', icon: Users },
    { type: 'react_loop', category: 'multi-agent', label: 'ReAct Loop', icon: Brain },
    { type: 'swarm_decision', category: 'multi-agent', label: 'Swarm Decision', icon: Brain },
    { type: 'task_handoff', category: 'multi-agent', label: 'Task Handoff', icon: Zap },
    { type: 'communication_hub', category: 'multi-agent', label: 'Communication Hub', icon: Server },
    { type: 'tool_sharing', category: 'multi-agent', label: 'Tool Sharing', icon: Layers },
    { type: 'tool_chain', category: 'multi-agent', label: 'Tool Chain', icon: Link2 },
    { type: 'self_reflection', category: 'multi-agent', label: 'Self Reflection', icon: Activity },
    { type: 'goal_decomposition', category: 'multi-agent', label: 'Goal Decomposition', icon: GitBranch },
  ];

  const handleNodeClick = (type: string, category: string, label: string) => {
    onAddNode(type, category, label, position);
    onClose();
  };

  if (!isOpen) return null;

  // Calculate position to keep menu in viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 280),
    top: Math.min(position.y, window.innerHeight - 400),
    zIndex: 9999,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="w-64 bg-card border border-border rounded-lg shadow-xl animate-fade-in"
    >
      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-sm"
            autoFocus
          />
        </div>
      </div>

      <ScrollArea className="max-h-[350px]">
        {/* Quick Add */}
        <div className="p-1 border-b border-border">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Quick Add</div>
          {quickAddNodes.map((node) => (
            <button
              key={node.type}
              onClick={() => handleNodeClick(node.type, node.category, node.label)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
            >
              <node.icon className="h-4 w-4 text-primary" />
              {node.label}
            </button>
          ))}
        </div>

        {/* Multi-Agent Section */}
        <div className="p-1 border-b border-border">
          <button
            onClick={() => setExpandedCategory(expandedCategory === 'multi-agent' ? null : 'multi-agent')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Multi-Agent / A2A</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">New</Badge>
              <ChevronRight className={`h-4 w-4 transition-transform ${expandedCategory === 'multi-agent' ? 'rotate-90' : ''}`} />
            </div>
          </button>
          {expandedCategory === 'multi-agent' && (
            <div className="ml-2 border-l border-border pl-2">
              {multiAgentNodes.map((node) => (
                <button
                  key={node.type}
                  onClick={() => handleNodeClick(node.type, node.category, node.label)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  <node.icon className="h-4 w-4 text-primary/70" />
                  {node.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Categories */}
        <div className="p-1">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex justify-between items-center">
            <span>All Node Categories</span>
            <Badge variant="secondary" className="text-xs">
              {categories.reduce((sum, cat) => sum + cat.nodes.length, 0)}
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No nodes found</div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">{category.nodes.length}</Badge>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>
                {expandedCategory === category.id && (
                  <div className="ml-2 border-l border-border pl-2 max-h-40 overflow-y-auto">
                    {category.nodes.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => handleNodeClick(node.type_key, category.id, node.display_name)}
                        className="w-full flex flex-col items-start px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                      >
                        <span className="font-medium">{node.display_name}</span>
                        {node.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">{node.description}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
