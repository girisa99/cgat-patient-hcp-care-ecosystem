import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search, Plus, Edit2, Trash2, Power, Settings, Bot, Brain,
  MessageSquare, Phone, Mail, Database, Zap, Eye, Workflow,
  Globe, Shield, Mic, Video, Headphones, Users, GitBranch,
  FileText, Cloud, Code, Cpu, Layers, Network, Server
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useConversationEngines } from '@/hooks/useConversationEngines';
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import { NodeConfigurationForm } from './NodeConfigurationForm';

interface NodeItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  type: 'llm' | 'vlm' | 'mcp' | 'api' | 'channel' | 'workflow' | 'data';
  provider?: string;
  status: 'active' | 'inactive' | 'beta';
  capabilities: string[];
  configuration: Record<string, any>;
  icon: React.ReactNode;
  version?: string;
  lastUpdated?: string;
}

const defaultNodes: NodeItem[] = [
  // Small Language Models
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast, efficient language model for general conversations and analysis',
    category: 'Language Models',
    subcategory: 'Small Language Models',
    type: 'llm',
    provider: 'OpenAI',
    status: 'active',
    capabilities: ['Text Generation', 'Analysis', 'Conversation'],
    configuration: { max_tokens: 4096, temperature: 0.7 },
    icon: <Brain className="w-4 h-4" />,
    version: '1.0',
    lastUpdated: '2024-11-24'
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    description: 'Anthropic\'s fast and efficient model for quick responses',
    category: 'Language Models',
    subcategory: 'Small Language Models',
    type: 'llm',
    provider: 'Anthropic',
    status: 'active',
    capabilities: ['Text Generation', 'Analysis', 'Code'],
    configuration: { max_tokens: 4096, temperature: 0.7 },
    icon: <Brain className="w-4 h-4" />,
    version: '1.0',
    lastUpdated: '2024-11-24'
  },
  // Vision Language Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Advanced multimodal model for image analysis, text, and more',
    category: 'Language Models',
    subcategory: 'Vision Language Models',
    type: 'vlm',
    provider: 'OpenAI',
    status: 'active',
    capabilities: ['Image Analysis', 'OCR', 'Visual Understanding'],
    configuration: { max_tokens: 4096, detail: 'high' },
    icon: <Eye className="w-4 h-4" />,
    version: '1.2',
    lastUpdated: '2024-11-20'
  },
  // MCP Servers
  {
    id: 'mcp-filesystem',
    name: 'Filesystem MCP',
    description: 'Model Context Protocol server for file system operations',
    category: 'MCP Servers',
    subcategory: 'System Integration',
    type: 'mcp',
    provider: 'Anthropic',
    status: 'active',
    capabilities: ['File Operations', 'Directory Management', 'Content Reading'],
    configuration: { root_path: '/workspace', allowed_extensions: ['.txt', '.md', '.json'] },
    icon: <FileText className="w-4 h-4" />,
    version: '2025.7.1',
    lastUpdated: '2024-11-15'
  },
  // Conversational Channels
  {
    id: 'chat-web',
    name: 'Web Chat',
    description: 'Web-based chat interface for customer interactions',
    category: 'Channels',
    subcategory: 'Conversational',
    type: 'channel',
    provider: 'Internal',
    status: 'active',
    capabilities: ['Real-time Chat', 'File Upload', 'Emoji Support'],
    configuration: { theme: 'auto', max_message_length: 2000 },
    icon: <MessageSquare className="w-4 h-4" />,
    version: '3.2',
    lastUpdated: '2024-11-23'
  },
  {
    id: 'voice-channel',
    name: 'Voice Channel',
    description: 'Voice-based communication with speech-to-text and text-to-speech',
    category: 'Channels',
    subcategory: 'Voice Configuration',
    type: 'channel',
    provider: 'Internal',
    status: 'beta',
    capabilities: ['Speech Recognition', 'Voice Synthesis', 'Call Routing'],
    configuration: { language: 'en-US', voice: 'neural' },
    icon: <Mic className="w-4 h-4" />,
    version: '1.0-beta',
    lastUpdated: '2024-11-22'
  },
  // API Integrations
  {
    id: 'supabase-db',
    name: 'Supabase Database',
    description: 'Real-time database operations and authentication',
    category: 'APIs & Integrations',
    subcategory: 'Database',
    type: 'api',
    provider: 'Supabase',
    status: 'active',
    capabilities: ['CRUD Operations', 'Real-time Updates', 'Authentication'],
    configuration: { connection_pool: 10, ssl: true },
    icon: <Database className="w-4 h-4" />,
    version: '2.50.2',
    lastUpdated: '2024-11-24'
  }
];

interface EnhancedNodeLibraryPanelProps {
  onNodeSelect: (node: NodeItem) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const EnhancedNodeLibraryPanel: React.FC<EnhancedNodeLibraryPanelProps> = ({
  onNodeSelect,
  isOpen,
  onToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [nodes, setNodes] = useState<NodeItem[]>(defaultNodes);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeItem | null>(null);
  
  const { showSuccess, showError } = useMasterToast();
  const { engines } = useConversationEngines();
  const { apiServices } = useMasterApiServices();

  // Load additional nodes from hooks
  useEffect(() => {
    const additionalNodes: NodeItem[] = [];
    
    // Add conversation engines
    engines.forEach(engine => {
      additionalNodes.push({
        id: engine.id,
        name: engine.name,
        description: engine.description || 'Conversation engine',
        category: 'Language Models',
        subcategory: engine.engine_type === 'llm' ? 'Small Language Models' : 'Vision Language Models',
        type: engine.engine_type === 'llm' ? 'llm' : 'vlm',
        provider: engine.provider,
        status: engine.status === 'active' ? 'active' : 'inactive',
        capabilities: Array.isArray(engine.capabilities) ? engine.capabilities : [],
        configuration: engine.configuration || {},
        icon: <Brain className="w-4 h-4" />,
        version: engine.version,
        lastUpdated: engine.updated_at
      });
    });

    // Add API services
    apiServices.forEach(service => {
      additionalNodes.push({
        id: service.id,
        name: service.name,
        description: service.description || 'API service',
        category: 'APIs & Integrations',
        subcategory: service.type,
        type: 'api',
        provider: 'External',
        status: service.status === 'active' ? 'active' : 'inactive',
        capabilities: [],
        configuration: {},
        icon: <Globe className="w-4 h-4" />,
        version: '1.0',
        lastUpdated: service.updated_at
      });
    });

    setNodes(prev => [...defaultNodes, ...additionalNodes]);
  }, [engines, apiServices]);

  const categories = [
    { id: 'all', name: 'All Nodes', icon: <Layers className="w-4 h-4" /> },
    { id: 'Language Models', name: 'Language Models', icon: <Brain className="w-4 h-4" /> },
    { id: 'Multi-Agent', name: 'Multi-Agent', icon: <Users className="w-4 h-4" /> },
    { id: 'MCP Servers', name: 'MCP Servers', icon: <Server className="w-4 h-4" /> },
    { id: 'Channels', name: 'Channels', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'APIs & Integrations', name: 'APIs & Integrations', icon: <Globe className="w-4 h-4" /> },
    { id: 'Workflows', name: 'Workflows', icon: <Workflow className="w-4 h-4" /> }
  ];

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNodeAction = async (action: 'edit' | 'delete' | 'toggle', node: NodeItem) => {
    try {
      switch (action) {
        case 'edit':
          setEditingNode(node);
          setShowNodeForm(true);
          break;
        case 'delete':
          setNodes(prev => prev.filter(n => n.id !== node.id));
          showSuccess(`${node.name} deleted successfully`);
          break;
        case 'toggle':
          const newStatus = node.status === 'active' ? 'inactive' : 'active';
          setNodes(prev => prev.map(n => 
            n.id === node.id ? { ...n, status: newStatus } : n
          ));
          showSuccess(`${node.name} ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
          break;
      }
    } catch (error) {
      showError(`Failed to ${action} node`);
    }
  };

  const handleSaveNode = (nodeData: Partial<NodeItem>) => {
    if (editingNode) {
      setNodes(prev => prev.map(n => 
        n.id === editingNode.id ? { ...n, ...nodeData } : n
      ));
      showSuccess('Node updated successfully');
    } else {
      const newNode: NodeItem = {
        id: `custom-${Date.now()}`,
        name: nodeData.name || 'New Node',
        description: nodeData.description || '',
        category: nodeData.category || 'Custom',
        type: nodeData.type || 'workflow',
        status: 'active',
        capabilities: nodeData.capabilities || [],
        configuration: nodeData.configuration || {},
        icon: <Bot className="w-4 h-4" />,
        lastUpdated: new Date().toISOString(),
        ...nodeData
      };
      setNodes(prev => [...prev, newNode]);
      showSuccess('Node created successfully');
    }
    setShowNodeForm(false);
    setEditingNode(null);
  };

  if (!isOpen) {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="bg-background/95 backdrop-blur-sm border-border/50"
        >
          <Layers className="w-4 h-4 mr-2" />
          Node Library
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-80 h-full flex flex-col bg-background/95 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Node Library</CardTitle>
            <div className="flex items-center gap-1">
              <Dialog open={showNodeForm} onOpenChange={setShowNodeForm}>
                <DialogTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingNode(null);
                          setShowNodeForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create New Node</TooltipContent>
                  </Tooltip>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNode ? 'Edit Node' : 'Create New Node'}
                    </DialogTitle>
                  </DialogHeader>
                  <NodeConfigurationForm
                    node={editingNode}
                    onSave={handleSaveNode}
                    onCancel={() => {
                      setShowNodeForm(false);
                      setEditingNode(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
            <div className="px-4">
              <TabsList className="grid w-full grid-cols-3 h-8 text-xs">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="Language Models" className="text-xs">LLMs</TabsTrigger>
                <TabsTrigger value="Channels" className="text-xs">Channels</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 py-4">
                {categories.map(category => {
                  const categoryNodes = filteredNodes.filter(node => 
                    category.id === 'all' || node.category === category.id
                  );
                  
                  if (categoryNodes.length === 0 && selectedCategory === 'all') return null;
                  if (selectedCategory !== 'all' && selectedCategory !== category.id) return null;

                  // Group by subcategory
                  const subcategories = categoryNodes.reduce((acc, node) => {
                    const sub = node.subcategory || 'Other';
                    if (!acc[sub]) acc[sub] = [];
                    acc[sub].push(node);
                    return acc;
                  }, {} as Record<string, NodeItem[]>);

                  return (
                    <div key={category.id} className="space-y-2">
                      {selectedCategory === 'all' && (
                        <>
                          <div className="flex items-center gap-2 px-1">
                            {category.icon}
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {category.name}
                            </span>
                          </div>
                          <Separator className="my-2" />
                        </>
                      )}
                      
                      {Object.entries(subcategories).map(([subcategory, subcategoryNodes]) => (
                        <div key={subcategory} className="space-y-2">
                          {Object.keys(subcategories).length > 1 && (
                            <div className="text-xs font-medium text-muted-foreground/80 px-1">
                              {subcategory}
                            </div>
                          )}
                          
                          {subcategoryNodes.map(node => (
                            <div
                              key={node.id}
                              className="group relative p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                              onClick={() => onNodeSelect(node)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <div className="p-1.5 rounded bg-primary/10 text-primary flex-shrink-0">
                                    {node.icon}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-medium truncate">{node.name}</h4>
                                      <Badge 
                                        variant={node.status === 'active' ? 'default' : 
                                               node.status === 'beta' ? 'secondary' : 'outline'}
                                        className="text-xs px-1 py-0"
                                      >
                                        {node.status}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                      {node.description}
                                    </p>
                                    {node.capabilities.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {node.capabilities.slice(0, 2).map(cap => (
                                          <Badge key={cap} variant="outline" className="text-xs px-1 py-0">
                                            {cap}
                                          </Badge>
                                        ))}
                                        {node.capabilities.length > 2 && (
                                          <Badge variant="outline" className="text-xs px-1 py-0">
                                            +{node.capabilities.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleNodeAction('edit', node);
                                        }}
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Node</TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleNodeAction('toggle', node);
                                        }}
                                      >
                                        <Power className={`w-3 h-3 ${node.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {node.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleNodeAction('delete', node);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3 text-destructive" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Node</TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })}
                
                {filteredNodes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No nodes found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};