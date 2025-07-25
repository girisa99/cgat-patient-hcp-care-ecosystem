import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, X, Bot, MessageSquare, Database, Settings, Target, Clock, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ActionTemplateManager } from './ActionTemplateManager';
import { AgentAction } from './AgentActionsManager';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  description: string;
  useCase: string;
  performanceRating: number;
  costEfficiency: number;
  specialization: string[];
}

interface AgentTask {
  id: string;
  name: string;
  description: string;
  type: 'action' | 'validation' | 'analysis' | 'notification';
  category?: string;
  aiModelId?: string;
  timeout: number;
  isRequired: boolean;
  order: number;
  connectors?: string[];
}

interface MCPServer {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  description: string;
  reliability: number;
}

interface AgentActionsContentProps {
  onActionsChange: (actions: AgentAction[]) => void;
  initialActions?: AgentAction[];
  agentType?: string;
  agentPurpose?: string;
  agentId?: string;
}

// AI Model database simulation
const AI_MODELS: AIModel[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    capabilities: ['reasoning', 'analysis', 'writing', 'coding'],
    description: 'Advanced reasoning and analysis for complex healthcare scenarios',
    useCase: 'Complex decision-making, clinical analysis, research synthesis',
    performanceRating: 9.5,
    costEfficiency: 8.0,
    specialization: ['healthcare', 'clinical reasoning', 'compliance']
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    capabilities: ['multimodal', 'reasoning', 'vision', 'real-time'],
    description: 'Multimodal AI with vision capabilities for comprehensive analysis',
    useCase: 'Document analysis, image processing, real-time conversations',
    performanceRating: 9.0,
    costEfficiency: 7.5,
    specialization: ['multimodal', 'real-time', 'document analysis']
  }
];

const MCP_SERVERS: MCPServer[] = [
  {
    id: 'healthcare-server',
    name: 'Healthcare MCP Server',
    type: 'healthcare',
    capabilities: ['patient_data', 'clinical_workflows', 'compliance_check'],
    description: 'Specialized server for healthcare data and workflows',
    reliability: 9.8
  },
  {
    id: 'filesystem-server',
    name: 'Filesystem MCP Server',
    type: 'filesystem',
    capabilities: ['file_operations', 'document_management', 'content_indexing'],
    description: 'Manages files, documents, and content operations',
    reliability: 9.5
  }
];

export const AgentActionsContent: React.FC<AgentActionsContentProps> = ({
  onActionsChange,
  initialActions = [],
  agentType,
  agentPurpose,
  agentId
}) => {
  const [actions, setActions] = useState<AgentAction[]>(initialActions);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTasks, setEditingTasks] = useState<AgentTask[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);

  // Load real data from database
  useEffect(() => {
    loadAIModels();
    loadMCPServers();
  }, []);

  const loadAIModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_integrations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      const transformedModels = (data || []).map(model => ({
        id: model.id,
        name: model.name,
        provider: model.provider,
        capabilities: Array.isArray(model.capabilities) ? model.capabilities.map(cap => String(cap)) : [],
        description: `${model.model_type} model from ${model.provider}`,
        useCase: Array.isArray(model.healthcare_specialization) ? model.healthcare_specialization.join(', ') : 'General purpose',
        performanceRating: 8.5,
        costEfficiency: 8.0,
        specialization: Array.isArray(model.healthcare_specialization) ? model.healthcare_specialization.map(spec => String(spec)) : []
      }));
      
      setModels(transformedModels);
    } catch (error) {
      console.error('Error loading AI models:', error);
      setModels(AI_MODELS);
    }
  };

  const loadMCPServers = async () => {
    try {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      const transformedServers = (data || []).map(server => ({
        id: server.server_id,
        name: server.name,
        type: server.type,
        capabilities: Array.isArray(server.capabilities) ? server.capabilities.map(cap => String(cap)) : [],
        description: server.description,
        reliability: server.reliability_score || 9.0
      }));
      
      setMcpServers(transformedServers);
    } catch (error) {
      console.error('Error loading MCP servers:', error);
      setMcpServers(MCP_SERVERS);
    }
  };

  const addTask = () => {
    const newTask: AgentTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      description: '',
      type: 'action',
      aiModelId: models[0]?.id,
      timeout: 30,
      isRequired: false,
      order: editingTasks.length + 1
    };
    setEditingTasks([...editingTasks, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<AgentTask>) => {
    setEditingTasks(editingTasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const removeTask = (taskId: string) => {
    setEditingTasks(editingTasks.filter(task => task.id !== taskId));
  };

  const saveActionWithTasks = () => {
    if (!selectedAction) return;
    
    const updatedAction = {
      ...selectedAction,
      tasks: editingTasks
    };
    
    updateAction(updatedAction);
    setIsEditing(false);
  };

  const addAction = (template?: Partial<AgentAction>) => {
    const newAction: AgentAction = {
      id: `action-${Date.now()}`,
      name: template?.name || 'New Action',
      description: template?.description || '',
      category: template?.category || 'custom',
      type: template?.type || 'on_demand',
      priority: template?.priority || 'medium',
      estimatedDuration: template?.estimatedDuration || 5,
      requiresApproval: template?.requiresApproval || false,
      aiModelId: template?.aiModelId || models[0]?.id,
      mcpServerId: template?.mcpServerId || mcpServers[0]?.id,
      isEnabled: true,
      parameters: {},
      tasks: []
    };

    const updatedActions = [...actions, newAction];
    setActions(updatedActions);
    onActionsChange(updatedActions);
    setSelectedAction(newAction);
    setEditingTasks(newAction.tasks || []);
    setIsEditing(true);
  };

  const updateAction = (updatedAction: AgentAction) => {
    const updatedActions = actions.map(action => 
      action.id === updatedAction.id ? updatedAction : action
    );
    setActions(updatedActions);
    onActionsChange(updatedActions);
    
    if (selectedAction?.id === updatedAction.id) {
      setSelectedAction(updatedAction);
    }
  };

  const removeAction = (actionId: string) => {
    const updatedActions = actions.filter(action => action.id !== actionId);
    setActions(updatedActions);
    onActionsChange(updatedActions);
    if (selectedAction?.id === actionId) {
      setSelectedAction(null);
      setIsEditing(false);
    }
  };

  const getModelInfo = (modelId: string) => {
    return models.find(m => m.id === modelId);
  };

  const getMCPServerInfo = (serverId: string) => {
    return mcpServers.find(s => s.id === serverId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'data_processing': return <Database className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Actions List */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Configured Actions ({actions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No actions configured yet</p>
                <p className="text-sm">Add actions to define what your agent can do</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {actions.map((action) => (
                    <Card key={action.id} className={`cursor-pointer transition-all ${
                      selectedAction?.id === action.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`} onClick={() => {
                      setSelectedAction(action);
                      setEditingTasks(action.tasks || []);
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryIcon(action.category)}
                              <h4 className="font-medium">{action.name}</h4>
                              <Badge variant={getPriorityColor(action.priority) as any}>
                                {action.priority}
                              </Badge>
                              {!action.isEnabled && (
                                <Badge variant="outline">Disabled</Badge>
                              )}
                              {action.tasks && action.tasks.length > 0 && (
                                <Badge variant="secondary">{action.tasks.length} tasks</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {action.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                ~{action.estimatedDuration}min
                              </span>
                              <span className="flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                {getModelInfo(action.aiModelId!)?.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAction(action);
                                setEditingTasks(action.tasks || []);
                                setIsEditing(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAction(action.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Action Templates */}
        <ActionTemplateManager
          agentType={agentType}
          agentPurpose={agentPurpose}
          onTemplateSelect={(template) => {
            const actionFromTemplate = {
              id: `action-${Date.now()}`,
              name: template.name,
              description: template.description || '',
              category: template.category as AgentAction['category'],
              type: template.type as AgentAction['type'],
              priority: template.priority as AgentAction['priority'],
              estimatedDuration: template.estimated_duration,
              requiresApproval: template.requires_approval,
              aiModelId: models[0]?.id,
              mcpServerId: mcpServers[0]?.id,
              isEnabled: true,
              parameters: {}
            };
            
            const updatedActions = [...actions, actionFromTemplate];
            setActions(updatedActions);
            onActionsChange(updatedActions);
            toast.success(`Added action: ${template.name}`);
          }}
        />
      </div>

      {/* Action Details/Editor */}
      <div className="space-y-4">
        {selectedAction ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Action Details</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'View' : 'Edit'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="action-name">Action Name</Label>
                    <Input 
                      id="action-name"
                      value={selectedAction.name}
                      onChange={(e) => updateAction({
                        ...selectedAction, 
                        name: e.target.value
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="action-description">Description</Label>
                    <Textarea 
                      id="action-description"
                      value={selectedAction.description}
                      onChange={(e) => updateAction({
                        ...selectedAction, 
                        description: e.target.value
                      })}
                    />
                  </div>

                  {/* Category, Type, and Priority Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={selectedAction.category || ''} 
                        onValueChange={(value) => updateAction({
                          ...selectedAction,
                          category: value as AgentAction['category']
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="communication">Communication</SelectItem>
                          <SelectItem value="data_processing">Data Processing</SelectItem>
                          <SelectItem value="analysis">Analysis</SelectItem>
                          <SelectItem value="integration">Integration</SelectItem>
                          <SelectItem value="automation">Automation</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={selectedAction.type || ''} 
                        onValueChange={(value) => updateAction({
                          ...selectedAction,
                          type: value as AgentAction['type']
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trigger">Trigger</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="on_demand">On Demand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select 
                        value={selectedAction.priority || ''} 
                        onValueChange={(value) => updateAction({
                          ...selectedAction,
                          priority: value as AgentAction['priority']
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>AI Model</Label>
                      <Select 
                        value={selectedAction.aiModelId || ''} 
                        onValueChange={(value) => updateAction({
                          ...selectedAction,
                          aiModelId: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex flex-col py-1 w-full">
                                <span className="font-medium">{model.name}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {model.provider} • {model.specialization.slice(0, 2).join(', ')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>MCP Server</Label>
                      <Select 
                        value={selectedAction.mcpServerId || ''} 
                        onValueChange={(value) => updateAction({
                          ...selectedAction,
                          mcpServerId: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select MCP server" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {mcpServers.map((server) => (
                            <SelectItem key={server.id} value={server.id}>
                              <div className="flex flex-col py-1 w-full">
                                <span className="font-medium">{server.name}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {server.type} • {server.capabilities.slice(0, 2).join(', ')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="action-enabled"
                      checked={selectedAction.isEnabled}
                      onCheckedChange={(checked) => updateAction({
                        ...selectedAction, 
                        isEnabled: checked
                      })}
                    />
                    <Label htmlFor="action-enabled">Enabled</Label>
                  </div>

                  {/* Tasks Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Tasks</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addTask}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                    
                    {editingTasks.length === 0 ? (
                      <div className="text-center py-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">No tasks added</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editingTasks.map((task) => (
                          <Card key={task.id} className="p-3">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">Task {task.order}</Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTask(task.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Task Name</Label>
                                  <Input
                                    value={task.name}
                                    onChange={(e) => updateTask(task.id, { name: e.target.value })}
                                    className="h-8"
                                    placeholder="Enter task name"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Type</Label>
                                  <Select 
                                    value={task.type} 
                                    onValueChange={(value: any) => updateTask(task.id, { type: value })}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="action">Action</SelectItem>
                                      <SelectItem value="validation">Validation</SelectItem>
                                      <SelectItem value="analysis">Analysis</SelectItem>
                                      <SelectItem value="notification">Notification</SelectItem>
                                      <SelectItem value="data_transformation">Data Transformation</SelectItem>
                                      <SelectItem value="api_call">API Call</SelectItem>
                                      <SelectItem value="decision">Decision</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                  value={task.description}
                                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                  placeholder="Describe what this task does"
                                  className="h-16 text-xs"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">AI Model</Label>
                                  <Select 
                                    value={task.aiModelId || ''} 
                                    onValueChange={(value) => updateTask(task.id, { aiModelId: value })}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {models.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                          {model.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Timeout (min)</Label>
                                  <Input
                                    type="number"
                                    value={task.timeout}
                                    onChange={(e) => updateTask(task.id, { timeout: parseInt(e.target.value) || 30 })}
                                    className="h-8"
                                    min="1"
                                    max="120"
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Save Tasks Button */}
                    {editingTasks.length > 0 && (
                      <Button 
                        onClick={saveActionWithTasks}
                        className="w-full"
                        variant="default"
                      >
                        Save Action with Tasks
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedAction.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(selectedAction.priority) as any}>
                        {selectedAction.priority}
                      </Badge>
                      <Badge variant={selectedAction.isEnabled ? "default" : "outline"}>
                        {selectedAction.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select an action to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};