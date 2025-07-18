import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, X, Bot, Zap, MessageSquare, Search, FileText, 
  Database, Settings, AlertCircle, CheckCircle, Brain,
  Sparkles, Target, Clock, Users, RefreshCw, Upload, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface AgentAction {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'data_processing' | 'analysis' | 'integration' | 'automation' | 'custom';
  type: 'trigger' | 'scheduled' | 'on_demand';
  parameters: Record<string, any>;
  aiModelId?: string;
  mcpServerId?: string;
  isEnabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration?: number; // in minutes
  requiresApproval?: boolean;
}

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

interface MCPServer {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  description: string;
  reliability: number;
}

interface AgentActionsManagerProps {
  onActionsChange: (actions: AgentAction[]) => void;
  initialActions?: AgentAction[];
  agentType?: string;
  agentPurpose?: string;
}

// AI Model database simulation (would come from actual DB)
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
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    capabilities: ['reasoning', 'math', 'coding', 'integration'],
    description: 'Strong mathematical reasoning and Google ecosystem integration',
    useCase: 'Data analysis, calculations, Google Workspace integration',
    performanceRating: 8.5,
    costEfficiency: 9.0,
    specialization: ['analytics', 'integration', 'mathematical reasoning']
  }
];

// MCP Server simulation
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

// Import the new ActionTemplateManager
import { ActionTemplateManager } from './ActionTemplateManager';

export const AgentActionsManager: React.FC<AgentActionsManagerProps> = ({
  onActionsChange,
  initialActions = [],
  agentType,
  agentPurpose
}) => {
  const [actions, setActions] = useState<AgentAction[]>(initialActions);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [models, setModels] = useState<AIModel[]>(AI_MODELS);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(MCP_SERVERS);

  // Auto-suggest actions based on agent type and purpose
  useEffect(() => {
    if (actions.length === 0 && (agentType || agentPurpose)) {
      suggestActionsForAgent();
    }
  }, [agentType, agentPurpose]);

  const suggestActionsForAgent = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-action-templates', {
        body: {
          agentType,
          agentPurpose,
          count: 3,
          context: 'healthcare'
        }
      });

      if (error) throw error;

      const generatedTemplates = data.templates || [];
      const suggestedActions = generatedTemplates.map((template: any, index: number) => ({
        id: `suggested-${index}`,
        name: template.name,
        description: template.description,
        category: template.category,
        type: template.type,
        priority: template.priority,
        estimatedDuration: template.estimated_duration,
        requiresApproval: template.requires_approval,
        aiModelId: getRecommendedModel(template.category).id,
        mcpServerId: getRecommendedMCPServer(template.category).id,
        isEnabled: true,
        parameters: {}
      } as AgentAction));

      setActions(suggestedActions);
      onActionsChange(suggestedActions);
      
      toast.success(`Added ${suggestedActions.length} AI-generated actions based on your agent configuration.`);
    } catch (error) {
      console.error('Error generating actions:', error);
      toast.error('Failed to generate actions. Using default templates.');
    }
  };

  const getRecommendedModel = (category: string): AIModel => {
    switch (category) {
      case 'analysis':
        return models.find(m => m.specialization.includes('clinical reasoning')) || models[0];
      case 'communication':
        return models.find(m => m.capabilities.includes('real-time')) || models[1];
      case 'data_processing':
        return models.find(m => m.capabilities.includes('multimodal')) || models[1];
      default:
        return models[0];
    }
  };

  const getRecommendedMCPServer = (category: string): MCPServer => {
    switch (category) {
      case 'analysis':
      case 'communication':
        return mcpServers.find(s => s.type === 'healthcare') || mcpServers[0];
      case 'data_processing':
        return mcpServers.find(s => s.type === 'filesystem') || mcpServers[1];
      default:
        return mcpServers[0];
    }
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
      aiModelId: template?.aiModelId || getRecommendedModel('custom').id,
      mcpServerId: template?.mcpServerId || getRecommendedMCPServer('custom').id,
      isEnabled: true,
      parameters: {}
    };

    const updatedActions = [...actions, newAction];
    setActions(updatedActions);
    onActionsChange(updatedActions);
    setSelectedAction(newAction);
    setIsEditing(true);
  };

  const updateAction = (updatedAction: AgentAction) => {
    const updatedActions = actions.map(action => 
      action.id === updatedAction.id ? updatedAction : action
    );
    setActions(updatedActions);
    onActionsChange(updatedActions);
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
      case 'integration': return <Zap className="h-4 w-4" />;
      case 'automation': return <Settings className="h-4 w-4" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Agent Actions & Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Configure what your agent can do and how it should behave
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={suggestActionsForAgent}>
            <Sparkles className="h-4 w-4 mr-2" />
            Auto-Suggest
          </Button>
          <Button size="sm" onClick={() => addAction()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </div>
      </div>

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
                      }`} onClick={() => setSelectedAction(action)}>
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

          {/* Action Templates - New Component */}
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
                aiModelId: getRecommendedModel(template.category).id,
                mcpServerId: getRecommendedMCPServer(template.category).id,
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{selectedAction.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedAction.description}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    {/* AI Model Info */}
                    <div>
                      <Label className="text-sm font-medium">AI Model</Label>
                      {(() => {
                        const model = getModelInfo(selectedAction.aiModelId!);
                        return model ? (
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{model.name}</h5>
                              <Badge variant="outline">{model.provider}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {model.description}
                            </p>
                            <div className="flex gap-2 text-xs">
                              <span>Performance: {model.performanceRating}/10</span>
                              <span>Cost Efficiency: {model.costEfficiency}/10</span>
                            </div>
                            <div className="mt-2">
                              <Label className="text-xs">Best for:</Label>
                              <p className="text-xs text-muted-foreground">{model.useCase}</p>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Alternative Models */}
                    <div>
                      <Label className="text-sm font-medium">Alternative Models</Label>
                      <div className="mt-2 space-y-2">
                        {models.filter(m => m.id !== selectedAction.aiModelId).slice(0, 2).map(model => (
                          <div key={model.id} className="p-2 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h6 className="text-sm font-medium">{model.name}</h6>
                                <p className="text-xs text-muted-foreground">{model.useCase}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateAction({
                                  ...selectedAction,
                                  aiModelId: model.id
                                })}
                              >
                                Select
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an action to view details</p>
                <p className="text-sm">Click on an action from the list to configure it</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};