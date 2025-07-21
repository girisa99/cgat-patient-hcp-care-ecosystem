import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot, Zap, MessageSquare, Database, Brain, Settings,
  Plug, Cloud, Server, Cpu, ExternalLink, Plus, Edit, Trash2,
  CheckCircle, AlertCircle, Activity, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { useAgentAPIAssignments, type APIAssignment } from '@/hooks/useAgentAPIAssignments';
import { useConnectorAssignments } from '@/hooks/useConnectorAssignments';

interface AgentAction {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  priority: string;
  aiModelId?: string;
  mcpServerId?: string;
  isEnabled: boolean;
  tasks?: AgentTask[];
}

interface AgentTask {
  id: string;
  name: string;
  description: string;
  type: string;
  aiModelId?: string;
  timeout: number;
  isRequired: boolean;
  order: number;
  connectors?: string[];
}

interface ConnectorAssignment {
  id: string;
  connectorId: string;
  connectorName: string;
  connectorType: 'external' | 'internal';
  taskId?: string;
  actionId?: string;
  isActive: boolean;
}

interface AIModelAssignment {
  id: string;
  modelId: string;
  modelName: string;
  provider: string;
  taskId?: string;
  actionId?: string;
  isActive: boolean;
}

interface MCPAssignment {
  id: string;
  mcpId: string;
  mcpName: string;
  mcpType: 'server' | 'client';
  taskId?: string;
  actionId?: string;
  isActive: boolean;
}

interface AgentAssignmentOverviewProps {
  sessionId: string;
  actions: AgentAction[];
  onAssignmentChange?: () => void;
}

export const AgentAssignmentOverview: React.FC<AgentAssignmentOverviewProps> = ({
  sessionId,
  actions,
  onAssignmentChange
}) => {
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<'connector' | 'api' | 'ai_model' | 'mcp'>('connector');
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { 
    apiAssignments, 
    availableAPIs, 
    assignAPI, 
    removeAssignment, 
    updateAssignment 
  } = useAgentAPIAssignments(sessionId);

  const {
    assignments: connectorAssignments,
    availableConnectors,
    assignConnector,
    removeAssignment: removeConnectorAssignment,
    updateAssignment: updateConnectorAssignment
  } = useConnectorAssignments(sessionId);

  // Mock data for other assignment types - in real app, these would come from hooks
  const aiModelAssignments: AIModelAssignment[] = [];
  const mcpAssignments: MCPAssignment[] = [];

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

  const getAssignmentIcon = (type: string) => {
    switch (type) {
      case 'connector': return <Plug className="h-4 w-4" />;
      case 'api': return <Cloud className="h-4 w-4" />;
      case 'ai_model': return <Brain className="h-4 w-4" />;
      case 'mcp': return <Server className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTaskAssignments = (taskId: string, type: 'connector' | 'api' | 'ai_model' | 'mcp') => {
    // Find the task across all actions
    let task: AgentTask | undefined;
    let action: AgentAction | undefined;
    
    for (const act of actions) {
      const foundTask = act.tasks?.find(t => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        action = act;
        break;
      }
    }
    
    switch (type) {
      case 'connector':
        return connectorAssignments.filter(ca => ca.task_id === taskId && ca.task_type === 'workflow_step');
      case 'api':
        return apiAssignments.filter(aa => aa.task_id === taskId);
      case 'ai_model':
        // Return task-level AI model assignment if exists
        return task?.aiModelId ? [{
          id: `${taskId}-ai-model`,
          modelId: task.aiModelId,
          modelName: task.aiModelId, // Would be resolved from models list in real app
          provider: 'Various',
          taskId: taskId,
          isActive: true
        }] : [];
      case 'mcp':
        return mcpAssignments.filter(ma => ma.taskId === taskId);
      default:
        return [];
    }
  };

  const getActionAssignments = (actionId: string, type: 'connector' | 'api' | 'ai_model' | 'mcp') => {
    const action = actions.find(a => a.id === actionId);
    
    switch (type) {
      case 'connector':
        return connectorAssignments.filter(ca => ca.task_id === actionId && ca.task_type === 'action');
      case 'api':
        return apiAssignments.filter(aa => aa.task_type === 'action' && aa.task_id === actionId);
      case 'ai_model':
        // Return action-level AI model assignment if exists
        return action?.aiModelId ? [{
          id: `${actionId}-ai-model`,
          modelId: action.aiModelId,
          modelName: action.aiModelId, // Would be resolved from models list in real app
          provider: 'Various',
          actionId: actionId,
          isActive: true
        }] : [];
      case 'mcp':
        // Return action-level MCP assignment if exists  
        return action?.mcpServerId ? [{
          id: `${actionId}-mcp`,
          mcpId: action.mcpServerId,
          mcpName: action.mcpServerId, // Would be resolved from MCP servers list in real app
          mcpType: 'server' as const,
          actionId: actionId,
          isActive: true
        }] : [];
      default:
        return [];
    }
  };

  const handleCreateAssignment = (actionId: string, taskId?: string) => {
    console.log('Creating assignment for:', { actionId, taskId, type: selectedAssignmentType });
    setEditingAssignment({ 
      actionId, 
      taskId, 
      type: selectedAssignmentType,
      apiService: '',
      connectorId: '',
      configuration: {}
    });
    setIsDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!editingAssignment) return;

    try {
      if (editingAssignment.type === 'api') {
        await assignAPI.mutateAsync({
          agent_session_id: sessionId,
          task_id: editingAssignment.taskId || editingAssignment.actionId,
          task_type: editingAssignment.taskId ? 'workflow_step' : 'action',
          assigned_api_service: editingAssignment.apiService,
          api_configuration: editingAssignment.configuration || {}
        });
      } else if (editingAssignment.type === 'connector') {
        await assignConnector.mutateAsync({
          agent_session_id: sessionId,
          connector_id: editingAssignment.connectorId,
          task_id: editingAssignment.taskId || editingAssignment.actionId,
          task_type: editingAssignment.taskId ? 'workflow_step' : 'action',
          assignment_config: editingAssignment.configuration || {}
        });
      }
      // Handle other assignment types here

      toast.success('Assignment created successfully');
      setIsDialogOpen(false);
      setEditingAssignment(null);
      onAssignmentChange?.();
    } catch (error) {
      toast.error('Failed to create assignment');
      console.error('Assignment error:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, type: string) => {
    try {
      if (type === 'api') {
        await removeAssignment.mutateAsync(assignmentId);
      } else if (type === 'connector') {
        await removeConnectorAssignment.mutateAsync(assignmentId);
      }
      // Handle other assignment types here

      toast.success('Assignment removed successfully');
      onAssignmentChange?.();
    } catch (error) {
      toast.error('Failed to remove assignment');
      console.error('Delete assignment error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Assignment Overview</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all connector, API, AI model, and MCP assignments for actions and tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedAssignmentType} onValueChange={(value: any) => setSelectedAssignmentType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="connector">Connectors</SelectItem>
              <SelectItem value="api">APIs</SelectItem>
              <SelectItem value="ai_model">AI Models</SelectItem>
              <SelectItem value="mcp">MCP Servers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignment Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Plug className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Connectors</span>
            </div>
            <div className="text-2xl font-bold">{connectorAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {connectorAssignments.filter(c => c.connector?.type === 'external_service').length} External, 
              {connectorAssignments.filter(c => c.connector?.type !== 'external_service').length} Internal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-5 w-5 text-green-500" />
              <span className="font-medium">API Services</span>
            </div>
            <div className="text-2xl font-bold">{apiAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {apiAssignments.filter(a => a.task_type === 'action').length} Actions, 
              {apiAssignments.filter(a => a.task_type === 'workflow_step').length} Tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="font-medium">AI Models</span>
            </div>
            <div className="text-2xl font-bold">{aiModelAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Assigned models</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-5 w-5 text-orange-500" />
              <span className="font-medium">MCP Servers</span>
            </div>
            <div className="text-2xl font-bold">{mcpAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {mcpAssignments.filter(m => m.mcpType === 'server').length} Server, 
              {mcpAssignments.filter(m => m.mcpType === 'client').length} Client
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Assignment View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getAssignmentIcon(selectedAssignmentType)}
            {selectedAssignmentType.replace('_', ' ').toUpperCase()} Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Accordion type="multiple" className="w-full">
              {actions.map((action) => (
                <AccordionItem key={action.id} value={action.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      {getCategoryIcon(action.category)}
                      <div>
                        <div className="font-medium">{action.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {action.tasks?.length || 0} tasks • {getActionAssignments(action.id, selectedAssignmentType).length} {selectedAssignmentType} assignments
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-7">
                      {/* Action-level assignments */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">Action-Level Assignments</h5>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCreateAssignment(action.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Assign {selectedAssignmentType.replace('_', ' ')}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {getActionAssignments(action.id, selectedAssignmentType).map((assignment: any) => (
                            <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                {getAssignmentIcon(selectedAssignmentType)}
                                <span className="text-sm">
                                  {selectedAssignmentType === 'api' ? assignment.assigned_api_service : 
                                   selectedAssignmentType === 'connector' ? assignment.connector?.name || assignment.connector_id :
                                   assignment.name}
                                </span>
                                <Badge variant="secondary" className="text-xs">Action</Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setEditingAssignment(assignment)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteAssignment(assignment.id, selectedAssignmentType)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {getActionAssignments(action.id, selectedAssignmentType).length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No assignments</p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Task-level assignments */}
                      <div>
                        <h5 className="font-medium text-sm mb-3">Task-Level Assignments</h5>
                        {action.tasks?.length ? (
                          <div className="space-y-3">
                            {action.tasks.map((task) => (
                              <div key={task.id} className="border rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    <span className="font-medium text-sm">{task.name}</span>
                                    <Badge variant="outline" className="text-xs">{task.type}</Badge>
                                    {task.isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleCreateAssignment(action.id, task.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Assign
                                  </Button>
                                </div>
                                <div className="space-y-1 ml-6">
                                  {getTaskAssignments(task.id, selectedAssignmentType).map((assignment: any) => (
                                    <div key={assignment.id} className="flex items-center justify-between p-1 bg-muted rounded text-sm">
                                      <div className="flex items-center gap-2">
                                        {getAssignmentIcon(selectedAssignmentType)}
                                        <span>
                                          {selectedAssignmentType === 'api' ? assignment.assigned_api_service : 
                                           selectedAssignmentType === 'connector' ? assignment.connector?.name || assignment.connector_id :
                                           assignment.name}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">Task</Badge>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => setEditingAssignment(assignment)}>
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          onClick={() => handleDeleteAssignment(assignment.id, selectedAssignmentType)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  {getTaskAssignments(task.id, selectedAssignmentType).length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">No assignments</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No tasks defined</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Assign {selectedAssignmentType.replace('_', ' ').toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedAssignmentType === 'api' && (
              <div>
                <Label>API Service</Label>
                <Select 
                  value={editingAssignment?.apiService || ''} 
                  onValueChange={(value) => setEditingAssignment(prev => ({ ...prev, apiService: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select API service" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAPIs.map((api) => (
                      <SelectItem key={api.id} value={api.name}>
                        {api.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedAssignmentType === 'connector' && (
              <div>
                <Label>Connector</Label>
                <Select 
                  value={editingAssignment?.connectorId || ''} 
                  onValueChange={(value) => setEditingAssignment(prev => ({ ...prev, connectorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select connector" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConnectors.map((connector) => (
                      <SelectItem key={connector.id} value={connector.id}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            connector.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                          {connector.name} ({connector.type})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedAssignmentType === 'ai_model' && (
              <div>
                <Label>AI Model</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  AI Model assignments are managed in the action configuration. Use the edit action form to assign AI models.
                </div>
              </div>
            )}
            
            {selectedAssignmentType === 'mcp' && (
              <div>
                <Label>MCP Server</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  MCP Server assignments are managed in the action configuration. Use the edit action form to assign MCP servers.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {(selectedAssignmentType === 'api' || selectedAssignmentType === 'connector') && (
              <Button onClick={handleSaveAssignment}>
                Assign
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};