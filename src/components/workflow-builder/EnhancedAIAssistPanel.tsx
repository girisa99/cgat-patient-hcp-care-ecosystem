/**
 * ENHANCED AI ASSIST PANEL
 * Multi-tab AI assistant for workflow canvas with context preservation
 * Supports: Architecture, Generate, Analyze, MCP Tools, KB/RAG, Performance
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Sparkles, 
  X, 
  Send, 
  Brain, 
  Wrench, 
  Database, 
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Zap,
  Link2,
  Bot,
  Users,
  Network,
  RefreshCw,
  Share2,
  Cpu,
  MessageSquare,
  Plug,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MULTI_AGENT_NODES, determineAgentArchitecture, getArchitectureInfo } from './MultiAgentNodeRegistry';
import { 
  agentArchitectureIntelligence, 
  AgentArchitectureType,
  ArchitectureRecommendation 
} from '@/services/agentArchitectureIntelligence';

interface AgentContext {
  id?: string;
  name: string;
  description?: string;
  useCaseId?: string;
  useCase?: { name: string; description?: string };
  brandName?: string;
  channels?: string[];
}

interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    type_key: string;
    intent?: string;
    configuration?: any;
  };
  position: { x: number; y: number };
}

interface EnhancedAIAssistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  agentContext: AgentContext;
  workflowNodes: WorkflowNode[];
  workflowEdges: any[];
  onNodesGenerated: (nodes: WorkflowNode[]) => void;
  onNodeUpdate?: (nodeId: string, updates: any) => void;
}

type AIProvider = 'openai' | 'claude' | 'gemini';

interface Suggestion {
  id: string;
  type: 'improvement' | 'warning' | 'recommendation';
  title: string;
  description: string;
  action?: () => void;
}

export const EnhancedAIAssistPanel: React.FC<EnhancedAIAssistPanelProps> = ({
  isOpen,
  onClose,
  agentContext,
  workflowNodes,
  workflowEdges,
  onNodesGenerated,
  onNodeUpdate
}) => {
  const { generateResponse, isLoading, providers } = useUniversalAI();
  
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [kbEntries, setKbEntries] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load MCP tools on mount
  useEffect(() => {
    loadMCPTools();
    loadKnowledgeBaseEntries();
  }, []);

  // Auto-analyze when workflow changes
  useEffect(() => {
    if (workflowNodes.length > 0 && activeTab === 'analyze') {
      analyzeWorkflow();
    }
  }, [workflowNodes.length, activeTab]);

  const loadMCPTools = async () => {
    try {
      // Load available MCP tools from database
      const { data } = await supabase
        .from('workflow_node_types')
        .select('id, type_key, display_name, description, category:workflow_node_categories(name)')
        .eq('is_active', true)
        .or('type_key.ilike.%mcp%,type_key.ilike.%connector%,type_key.ilike.%integration%')
        .limit(20);
      
      setMcpTools(data || []);
    } catch (e) {
      console.error('Failed to load MCP tools:', e);
    }
  };

  const loadKnowledgeBaseEntries = async () => {
    try {
      const { data } = await (supabase as any)
        .from('universal_knowledge_base')
        .select('id, title, category, topics, source_type')
        .eq('is_active', true)
        .limit(20);
      
      setKbEntries(data || []);
    } catch (e) {
      console.error('Failed to load KB entries:', e);
    }
  };

  const analyzeWorkflow = useCallback(async () => {
    if (workflowNodes.length === 0) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    const newSuggestions: Suggestion[] = [];

    // Check for missing connections
    const nodesWithoutOutgoing = workflowNodes.filter(node => {
      const hasOutgoing = workflowEdges.some(edge => edge.source === node.id);
      return !hasOutgoing && node.data.type_key !== 'output' && node.data.type_key !== 'end';
    });

    if (nodesWithoutOutgoing.length > 0) {
      newSuggestions.push({
        id: 'missing-connections',
        type: 'warning',
        title: 'Disconnected Nodes',
        description: `${nodesWithoutOutgoing.length} node(s) have no outgoing connections: ${nodesWithoutOutgoing.map(n => n.data.label).join(', ')}`,
      });
    }

    // Check for KB/RAG integration
    const hasKBNode = workflowNodes.some(n => 
      n.data.type_key === 'knowledge_base' || n.data.type_key === 'rag_retrieval'
    );

    if (!hasKBNode && agentContext.useCase) {
      newSuggestions.push({
        id: 'add-kb',
        type: 'recommendation',
        title: 'Add Knowledge Base',
        description: `Consider adding a Knowledge Base node for ${agentContext.useCase.name} context`,
        action: () => addRecommendedNode('knowledge_base')
      });
    }

    // Check for MCP integration
    const hasMCPNode = workflowNodes.some(n => 
      n.data.type_key?.includes('mcp') || n.data.type_key?.includes('connector')
    );

    if (!hasMCPNode) {
      newSuggestions.push({
        id: 'add-mcp',
        type: 'recommendation',
        title: 'Add MCP Integration',
        description: 'MCP tools can enhance your agent with external data and actions',
        action: () => setActiveTab('mcp')
      });
    }

    // Check for error handling
    const hasErrorHandler = workflowNodes.some(n => 
      n.data.type_key === 'error_handler' || n.data.label?.toLowerCase().includes('error')
    );

    if (!hasErrorHandler && workflowNodes.length > 3) {
      newSuggestions.push({
        id: 'add-error-handling',
        type: 'improvement',
        title: 'Add Error Handling',
        description: 'Add an error handler node for robust workflow execution',
        action: () => addRecommendedNode('error_handler')
      });
    }

    // Check for validation nodes
    const hasValidation = workflowNodes.some(n => 
      n.data.type_key === 'validation' || n.data.type_key === 'condition'
    );

    if (!hasValidation && workflowNodes.length > 2) {
      newSuggestions.push({
        id: 'add-validation',
        type: 'improvement',
        title: 'Add Input Validation',
        description: 'Validate inputs before processing for better reliability',
        action: () => addRecommendedNode('validation')
      });
    }

    // Check for multi-agent capabilities
    const hasMultiAgent = workflowNodes.some(n => 
      ['a2a_agent', 'agent_team', 'swarm_decision', 'task_handoff'].includes(n.data.type_key)
    );

    if (!hasMultiAgent && workflowNodes.length >= 2) {
      newSuggestions.push({
        id: 'add-multi-agent',
        type: 'recommendation',
        title: 'Consider Multi-Agent Architecture',
        description: 'Complex workflows benefit from specialized agent teams. Add A2A or Agent Team nodes.',
        action: () => addRecommendedNode('agent_team')
      });
    }

    // Check for agentic capabilities
    const hasAgenticNodes = workflowNodes.some(n => 
      ['react_loop', 'tool_chain', 'self_reflection'].includes(n.data.type_key)
    );

    if (!hasAgenticNodes && agentContext.useCase?.name?.toLowerCase().includes('autonom')) {
      newSuggestions.push({
        id: 'add-agentic',
        type: 'recommendation',
        title: 'Add Agentic AI Capabilities',
        description: 'Enable autonomous reasoning with ReAct loops for goal-oriented behavior.',
        action: () => addRecommendedNode('react_loop')
      });
    }

    setSuggestions(newSuggestions);
    setIsAnalyzing(false);
  }, [workflowNodes, workflowEdges, agentContext]);

  const addRecommendedNode = useCallback((type: string) => {
    const nodeLabels: { [key: string]: string } = {
      'knowledge_base': 'Knowledge Base',
      'rag_retrieval': 'RAG Retrieval',
      'error_handler': 'Error Handler',
      'validation': 'Input Validation',
      'mcp_connector': 'MCP Connector',
      // Multi-agent nodes
      'a2a_agent': 'A2A Agent',
      'agent_team': 'Agent Team',
      'task_handoff': 'Task Handoff',
      'swarm_decision': 'Swarm Decision',
      'react_loop': 'ReAct Loop',
      'tool_chain': 'Tool Chain',
      'self_reflection': 'Self Reflection',
      'communication_hub': 'Communication Hub'
    };

    const nodeIntents: { [key: string]: string } = {
      'knowledge_base': 'Query knowledge base for relevant context',
      'rag_retrieval': 'Retrieve relevant documents using RAG',
      'error_handler': 'Handle errors and exceptions gracefully',
      'validation': 'Validate input data before processing',
      'mcp_connector': 'Connect to external MCP tool',
      // Multi-agent intents
      'a2a_agent': 'A2A Protocol compliant agent with task lifecycle',
      'agent_team': 'Coordinated team of specialized agents',
      'task_handoff': 'Transfer task context between agents',
      'swarm_decision': 'Collective decision using swarm intelligence',
      'react_loop': 'Reasoning and acting loop for autonomous goals',
      'tool_chain': 'Sequential tool execution with output chaining',
      'self_reflection': 'Agent self-evaluation and strategy adjustment',
      'communication_hub': 'Central message routing between agents'
    };

    const newNode: WorkflowNode = {
      id: `rec-${Date.now()}`,
      type: 'enhanced',
      position: { x: 500, y: 150 + workflowNodes.length * 80 },
      data: {
        label: nodeLabels[type] || type,
        type_key: type,
        intent: nodeIntents[type] || `Process ${type}`,
        configuration: {}
      }
    };

    onNodesGenerated([newNode]);
    toast.success(`Added ${nodeLabels[type] || type} node`);
  }, [workflowNodes.length, onNodesGenerated]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      const contextPrompt = `
Agent: ${agentContext.name}
Description: ${agentContext.description || 'N/A'}
Use Case: ${agentContext.useCase?.name || 'General'}
Current Nodes: ${workflowNodes.map(n => n.data.label).join(', ') || 'None'}

User Request: ${prompt}

Generate workflow nodes as a JSON array. Each node should have:
- label: display name
- type: node type (action, condition, output, knowledge_base, rag_retrieval, api_call, mcp_connector)
- intent: short description of purpose (REQUIRED)
- description: detailed explanation

Return ONLY the JSON array, no other text.`;

      const response = await generateResponse({
        provider: selectedProvider,
        model: selectedProvider === 'gemini' ? 'gemini-2.0-flash' : undefined,
        prompt: contextPrompt,
      });

      if (response?.content) {
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedNodes = JSON.parse(jsonMatch[0]);
          const newNodes = parsedNodes.map((n: any, idx: number) => ({
            id: `gen-${Date.now()}-${idx}`,
            type: 'enhanced',
            position: { x: 400 + (idx % 3) * 180, y: 100 + Math.floor(idx / 3) * 120 },
            data: {
              label: n.label || n.name || `Node ${idx + 1}`,
              type_key: n.type || 'action',
              intent: n.intent || n.description || 'Process data',
              configuration: n.configuration || {}
            }
          }));
          
          onNodesGenerated(newNodes);
          toast.success(`Generated ${newNodes.length} nodes`);
          setPrompt('');
        }
      }
    } catch (e: any) {
      toast.error('Generation failed: ' + (e.message || 'Unknown error'));
    }
  };

  const addMCPTool = (tool: any) => {
    const newNode: WorkflowNode = {
      id: `mcp-${Date.now()}`,
      type: 'enhanced',
      position: { x: 500, y: 150 + workflowNodes.length * 80 },
      data: {
        label: tool.display_name,
        type_key: tool.type_key,
        intent: tool.description || `Integrate with ${tool.display_name}`,
        configuration: { toolId: tool.id }
      }
    };

    onNodesGenerated([newNode]);
    toast.success(`Added ${tool.display_name}`);
  };

  const linkKnowledgeBase = (entry: any) => {
    const newNode: WorkflowNode = {
      id: `kb-${Date.now()}`,
      type: 'enhanced',
      position: { x: 500, y: 150 + workflowNodes.length * 80 },
      data: {
        label: `KB: ${entry.title}`,
        type_key: 'knowledge_base',
        intent: `Query ${entry.title} knowledge`,
        configuration: { 
          knowledgeBaseId: entry.id,
          category: entry.category,
          topics: entry.topics
        }
      }
    };

    onNodesGenerated([newNode]);
    toast.success(`Linked ${entry.title}`);
  };

  if (!isOpen) return null;

  return (
    <Card className="absolute top-4 right-4 w-[420px] z-50 shadow-xl border-primary/20 max-h-[calc(100vh-120px)] flex flex-col">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Assist
          <Badge variant="secondary" className="text-xs ml-2">
            {agentContext.name}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={selectedProvider} onValueChange={(v: AIProvider) => setSelectedProvider(v)}>
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-5 mx-4 mt-2">
          <TabsTrigger value="generate" className="text-xs px-2">
            <Sparkles className="h-3 w-3 mr-1" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="analyze" className="text-xs px-2">
            <Brain className="h-3 w-3 mr-1" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="mcp" className="text-xs px-2">
            <Wrench className="h-3 w-3 mr-1" />
            MCP
          </TabsTrigger>
          <TabsTrigger value="kb" className="text-xs px-2">
            <Database className="h-3 w-3 mr-1" />
            KB
          </TabsTrigger>
          <TabsTrigger value="perf" className="text-xs px-2">
            <BarChart3 className="h-3 w-3 mr-1" />
            Perf
          </TabsTrigger>
        </TabsList>

        <CardContent className="flex-1 overflow-hidden p-4">
          {/* Generate Tab */}
          <TabsContent value="generate" className="mt-0 space-y-3 h-full">
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              <p className="font-medium mb-1">Context: {agentContext.useCase?.name || 'General Agent'}</p>
              <p className="truncate">{agentContext.description || 'No description'}</p>
            </div>
            <Textarea 
              placeholder="Describe nodes to add... e.g., 'Add validation node to check user input, then branch to success or error'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] text-sm resize-none"
            />
            <Button 
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full"
              size="sm"
            >
              {isLoading ? 'Generating...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate with {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
                </>
              )}
            </Button>
          </TabsContent>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="mt-0 h-full">
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Workflow Analysis</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={analyzeWorkflow}
                    disabled={isAnalyzing}
                    className="h-7 text-xs"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Refresh'}
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  <p>Nodes: {workflowNodes.length} | Connections: {workflowEdges.length}</p>
                </div>

                {suggestions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">Workflow looks good!</p>
                    <p className="text-xs">No suggestions at this time</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {suggestions.map(suggestion => (
                      <div 
                        key={suggestion.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {suggestion.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                          {suggestion.type === 'improvement' && <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />}
                          {suggestion.type === 'recommendation' && <Zap className="h-4 w-4 text-purple-500 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{suggestion.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
                            {suggestion.action && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 h-6 text-xs"
                                onClick={suggestion.action}
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* MCP Tools Tab */}
          <TabsContent value="mcp" className="mt-0 h-full">
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Add MCP SDK tools to connect external services and data
                </p>
                {mcpTools.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No MCP tools available
                  </p>
                ) : (
                  mcpTools.map(tool => (
                    <div 
                      key={tool.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => addMCPTool(tool)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{tool.display_name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {tool.category?.name || 'Tool'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tool.description || 'MCP integration tool'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="kb" className="mt-0 h-full">
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Link knowledge base entries to enhance agent context
                </p>
                {kbEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No knowledge base entries available
                  </p>
                ) : (
                  kbEntries.map(entry => (
                    <div 
                      key={entry.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => linkKnowledgeBase(entry)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{entry.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {entry.category || 'KB'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.topics?.slice(0, 3).map((topic: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="perf" className="mt-0 h-full">
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Real-time performance metrics for {agentContext.name || 'this agent'}
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground">Total Nodes</p>
                    <p className="text-xl font-bold">{workflowNodes.length}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground">Connections</p>
                    <p className="text-xl font-bold">{workflowEdges.length}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Node Types</p>
                  <div className="space-y-1">
                    {Object.entries(
                      workflowNodes.reduce((acc: Record<string, number>, node) => {
                        const type = node.data.type_key || 'unknown';
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{type}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Case Context */}
                {agentContext.useCase && (
                  <div className="p-3 rounded-lg border bg-primary/5">
                    <p className="text-sm font-medium mb-1">Use Case</p>
                    <p className="text-xs text-muted-foreground">
                      {agentContext.useCase.name}
                    </p>
                    {agentContext.useCase.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {agentContext.useCase.description}
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    if (agentContext.id) {
                      window.open(`/genie-analytics/${agentContext.id}`, '_blank');
                    } else {
                      window.open('/enterprise-analytics', '_blank');
                    }
                  }}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Open Full Analytics Dashboard
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
