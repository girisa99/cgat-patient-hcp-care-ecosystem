import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Plus, Search, RefreshCw, BarChart3, Settings,
  Database, Cloud, MessageSquare, FileText, Globe,
  CheckCircle, AlertTriangle, Clock, Filter,
  Eye, Edit, Trash2, Play, TrendingUp, X, Target
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ConnectorCreationWizard } from './ConnectorCreationWizard';
import { useAgentAPIAssignments } from '@/hooks/useAgentAPIAssignments';
import { useConnectorMetrics, type Connector } from '@/hooks/useConnectorMetrics';

// Helper functions for icons
const getStatusIcon = (status: 'active' | 'inactive' | 'testing' | 'error') => {
  switch (status) {
    case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'testing': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  }
};

const getTypeIcon = (type: 'database' | 'api' | 'messaging' | 'file_system' | 'external_service' | 'ai_model') => {
  switch (type) {
    case 'database': return <Database className="h-4 w-4 text-blue-500" />;
    case 'api': return <Cloud className="h-4 w-4 text-green-500" />;
    case 'messaging': return <MessageSquare className="h-4 w-4 text-purple-500" />;
    case 'file_system': return <FileText className="h-4 w-4 text-orange-500" />;
    case 'external_service': return <Globe className="h-4 w-4 text-red-500" />;
    case 'ai_model': return <Zap className="h-4 w-4 text-indigo-500" />;
    default: return <Globe className="h-4 w-4 text-gray-500" />;
  }
};

interface EnhancedConnectorSystemProps {
  agentId: string;
  actions: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    description?: string;
  }>;
  onAssignmentsChange: (assignments: any[]) => void;
  agentType?: string;
  agentPurpose?: string;
}

export const EnhancedConnectorSystem: React.FC<EnhancedConnectorSystemProps> = ({
  agentId,
  actions,
  onAssignmentsChange,
  agentType,
  agentPurpose
}) => {
  const { toast } = useToast();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedActionForAssignment, setSelectedActionForAssignment] = useState<any>(null);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    apiAssignments,
    assignAPI,
    updateAssignment,
    removeAssignment,
    getTaskAssignment
  } = useAgentAPIAssignments(agentId);

  const {
    connectors,
    isLoadingConnectors,
    connectorsError,
    createConnector,
    updateConnector,
    deleteConnector,
    testConnector,
    refetchConnectors
  } = useConnectorMetrics();

  const handleRefresh = async () => {
    try {
      await refetchConnectors();
      toast({
        title: "Refreshed",
        description: "Connector data has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh connector data",
        variant: "destructive"
      });
    }
  };

  const handleConnectorCreated = (newConnector: any) => {
    refetchConnectors();
    toast({
      title: "Connector Created",
      description: `${newConnector.name} has been successfully created`,
    });
  };

  const handleTestConnector = async (connectorId: string) => {
    const connector = connectors?.find(c => c.id === connectorId);
    if (!connector) return;

    try {
      await testConnector.mutateAsync(connectorId);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  const handleViewConnector = (connector: Connector) => {
    setSelectedConnector(connector);
    setIsViewDialogOpen(true);
  };

  const handleEditConnector = (connector: Connector) => {
    setSelectedConnector(connector);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConnector = async (connectorId: string) => {
    const connector = connectors?.find(c => c.id === connectorId);
    if (!connector) return;

    if (confirm(`Are you sure you want to delete "${connector.name}"?`)) {
      try {
        await deleteConnector.mutateAsync(connectorId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleCreateAssignment = async (assignmentData: any) => {
    try {
      await assignAPI.mutateAsync({
        agent_session_id: agentId,
        task_id: assignmentData.taskId || assignmentData.actionId,
        task_type: assignmentData.type || 'connector',
        assigned_api_service: assignmentData.connectorName,
        api_configuration: assignmentData.configuration || {}
      });

      toast({
        title: "Assignment Created",
        description: `Successfully assigned ${assignmentData.connectorName}`,
      });

      setIsAssignmentDialogOpen(false);
      setSelectedActionForAssignment(null);
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to create connector assignment",
        variant: "destructive"
      });
    }
  };

  const filteredConnectors = (connectors || []).filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || connector.status === statusFilter;
    const matchesType = typeFilter === 'all' || connector.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: connectors?.length || 0,
    active: connectors?.filter(c => c.status === 'active').length || 0,
    testing: connectors?.filter(c => c.status === 'testing').length || 0,
    error: connectors?.filter(c => c.status === 'error').length || 0,
    avgSuccessRate: connectors && connectors.length > 0 
      ? Math.round(connectors.reduce((sum, c) => sum + (c.success_rate || 0), 0) / connectors.length)
      : 0,
    totalUsage: connectors?.reduce((sum, c) => sum + (c.usage_count || 0), 0) || 0
  };

  if (isLoadingConnectors) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading connectors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Connectors & Assignment</h2>
          <p className="text-gray-600">
            Create and assign connectors to agent actions based on {agentType && `${agentType} agent`} requirements {agentPurpose && `for ${agentPurpose}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingConnectors}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingConnectors ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsWizardOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Connector
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Browse & Configure
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Assign Connectors
          </TabsTrigger>
        </TabsList>

        {/* Browse & Configure Tab */}
        <TabsContent value="create" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Connector
                </CardTitle>
                <div className="text-sm text-gray-600 mt-2">
                  <p>Set up new system integrations and data connectors for your agent</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Quick Create Options */}
                  <div>
                    <h4 className="font-medium mb-3">Quick Create Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Database Connector */}
                      <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200" 
                            onClick={() => setIsWizardOpen(true)}>
                        <CardContent className="p-4 text-center">
                          <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <h5 className="font-medium">Database</h5>
                          <p className="text-xs text-gray-500 mt-1">Oracle, MySQL, PostgreSQL</p>
                        </CardContent>
                      </Card>

                      {/* API Connector */}
                      <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200" 
                            onClick={() => setIsWizardOpen(true)}>
                        <CardContent className="p-4 text-center">
                          <Cloud className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <h5 className="font-medium">REST API</h5>
                          <p className="text-xs text-gray-500 mt-1">HTTP REST endpoints</p>
                        </CardContent>
                      </Card>

                      {/* Messaging Connector */}
                      <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200" 
                            onClick={() => setIsWizardOpen(true)}>
                        <CardContent className="p-4 text-center">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <h5 className="font-medium">Messaging</h5>
                          <p className="text-xs text-gray-500 mt-1">Kafka, RabbitMQ, SQS</p>
                        </CardContent>
                      </Card>

                      {/* File System Connector */}
                      <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200" 
                            onClick={() => setIsWizardOpen(true)}>
                        <CardContent className="p-4 text-center">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                          <h5 className="font-medium">File System</h5>
                          <p className="text-xs text-gray-500 mt-1">FTP, SFTP, S3</p>
                        </CardContent>
                      </Card>

                      {/* External Service Connector */}
                      <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200" 
                            onClick={() => setIsWizardOpen(true)}>
                        <CardContent className="p-4 text-center">
                          <Globe className="h-8 w-8 mx-auto mb-2 text-red-500" />
                          <h5 className="font-medium">External Service</h5>
                          <p className="text-xs text-gray-500 mt-1">Salesforce, Workday</p>
                        </CardContent>
                      </Card>

                      {/* AI Model Connector */}
                      <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200" 
                            onClick={() => setIsWizardOpen(true)}>
                        <CardContent className="p-4 text-center">
                          <Zap className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
                          <h5 className="font-medium">AI Model</h5>
                          <p className="text-xs text-gray-500 mt-1">OpenAI, Anthropic</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Existing Connectors */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Existing Connectors</h4>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Search connectors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64"
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="testing">Testing</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {filteredConnectors.length > 0 ? (
                      <div className="space-y-3">
                        {filteredConnectors.map((connector) => (
                          <Card key={connector.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {getTypeIcon(connector.type)}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-medium">{connector.name}</h5>
                                    {getStatusIcon(connector.status)}
                                    <Badge variant="outline">{connector.category}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">{connector.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>Created: {new Date(connector.created_at).toLocaleDateString()}</span>
                                    {connector.last_tested && (
                                      <span>Last tested: {new Date(connector.last_tested).toLocaleDateString()}</span>
                                    )}
                                    {connector.success_rate && (
                                      <span>Success: {connector.success_rate}%</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleTestConnector(connector.id)}
                                  disabled={testConnector.isPending}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Test
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleViewConnector(connector)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditConnector(connector)}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDeleteConnector(connector.id)}
                                  disabled={deleteConnector.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-6 text-center border-dashed">
                        <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          No connectors found. Create your first connector using the options above.
                        </p>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assign Connector Tab */}
        <TabsContent value="assignments" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Agent Actions & Connector Assignments
                </CardTitle>
                <div className="text-sm text-gray-600 mt-2">
                  {agentType && agentPurpose && (
                    <p>Managing connectors for <strong>{agentType}</strong> agent: <em>{agentPurpose}</em></p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Available Actions from Actions and Templates Tab */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Actions from Actions & Templates Tab
                    </h4>
                    {actions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {actions.map((action) => {
                          const hasAssignment = apiAssignments?.some((assignment: any) => 
                            assignment.task_id === action.id
                          );
                          return (
                            <Card key={action.id} className={`p-4 ${hasAssignment ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-medium text-sm">{action.name}</h5>
                                    {hasAssignment && (
                                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                        Assigned
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1">
                                    <strong>Category:</strong> {action.category}
                                  </p>
                                  <p className="text-xs text-gray-600 mb-1">
                                    <strong>Type:</strong> {action.type}
                                  </p>
                                  {action.description && (
                                    <p className="text-xs text-gray-500 mt-2">{action.description}</p>
                                  )}
                                </div>
                                <Button 
                                  variant={hasAssignment ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => {
                                    setSelectedActionForAssignment(action);
                                    setIsAssignmentDialogOpen(true);
                                  }}
                                  className={hasAssignment ? "" : "bg-blue-600 hover:bg-blue-700"}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {hasAssignment ? 'Reassign' : 'Assign Connector'}
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <Card className="p-6 text-center border-dashed">
                        <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          No actions configured. Go to the <strong>Actions</strong> tab to create actions first.
                        </p>
                      </Card>
                    )}
                  </div>

                  {/* Current Assignments */}
                  {apiAssignments && apiAssignments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Active Connector Assignments
                      </h4>
                      <div className="space-y-3">
                        {apiAssignments.map((assignment: any) => (
                          <Card key={assignment.id} className="p-4 bg-green-50 border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{assignment.assigned_api_service}</p>
                                <p className="text-sm text-gray-600">
                                  Assigned to: <strong>{actions.find(a => a.id === assignment.task_id)?.name || assignment.task_id}</strong>
                                </p>
                                <p className="text-xs text-gray-500">
                                  Type: {assignment.task_type} • Created: {new Date(assignment.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeAssignment.mutate(assignment.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Connector Creation Wizard */}
      <ConnectorCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onConnectorCreated={handleConnectorCreated}
        agentId={agentId}
        availableActions={actions}
      />

      {/* Assignment Dialog */}
      <AssignmentDialog 
        isOpen={isAssignmentDialogOpen}
        onClose={() => {
          setIsAssignmentDialogOpen(false);
          setSelectedActionForAssignment(null);
        }}
        connectors={connectors || []}
        selectedAction={selectedActionForAssignment}
        onAssignmentCreate={handleCreateAssignment}
      />

      {/* View Connector Dialog */}
      <ViewConnectorDialog
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedConnector(null);
        }}
        connector={selectedConnector}
      />

      {/* Edit Connector Dialog */}
      <EditConnectorDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedConnector(null);
        }}
        connector={selectedConnector}
        onUpdate={(updated) => {
          refetchConnectors();
          setIsEditDialogOpen(false);
          setSelectedConnector(null);
        }}
      />
    </div>
  );
};

// Assignment Dialog Component
interface AssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: Connector[];
  selectedAction: any;
  onAssignmentCreate: (assignmentData: any) => void;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  isOpen,
  onClose,
  connectors,
  selectedAction,
  onAssignmentCreate
}) => {
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('connector');
  
  const selectedConnectorData = connectors.find(c => c.id === selectedConnector);

  const handleSubmit = () => {
    if (!selectedConnector) return;

    const connector = connectors.find(c => c.id === selectedConnector);
    if (!connector) return;

    onAssignmentCreate({
      actionId: selectedAction?.id,
      taskId: selectedAction?.id || `task-${Date.now()}`,
      connectorId: selectedConnector,
      connectorName: connector.name,
      type: taskType,
      endpoint: selectedEndpoint,
      configuration: {
        connector_id: selectedConnector,
        connector_name: connector.name,
        endpoint_path: selectedEndpoint,
        auth_type: connector.auth_type
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Connector</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {selectedAction && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium">Selected Action</h4>
                <p className="text-sm text-gray-600">{selectedAction.name}</p>
                <p className="text-xs text-gray-500">{selectedAction.category}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <Label>Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="connector">Connector</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="workflow_step">Workflow Step</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Connector</Label>
              <Select value={selectedConnector} onValueChange={setSelectedConnector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a connector" />
                </SelectTrigger>
                <SelectContent>
                  {connectors.map((connector) => (
                    <SelectItem key={connector.id} value={connector.id}>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(connector.type)}
                        <span>{connector.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {connector.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedConnectorData && selectedConnectorData.endpoints && selectedConnectorData.endpoints.length > 0 && (
              <div>
                <Label>Endpoint</Label>
                <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an endpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedConnectorData.endpoints.map((endpoint: any) => (
                      <SelectItem key={endpoint.id} value={endpoint.path}>
                        <div>
                          <span className="font-medium">{endpoint.method}</span>
                          <span className="ml-2">{endpoint.path}</span>
                          {endpoint.description && (
                            <p className="text-xs text-gray-500">{endpoint.description}</p>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedConnectorData && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Connector Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Type:</strong> {selectedConnectorData.type}</p>
                    <p><strong>Status:</strong> {selectedConnectorData.status}</p>
                    <p><strong>Auth:</strong> {selectedConnectorData.auth_type}</p>
                    {selectedConnectorData.base_url && (
                      <p><strong>Base URL:</strong> {selectedConnectorData.base_url}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedConnector}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// View Connector Dialog Component
interface ViewConnectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  connector: Connector | null;
}

const ViewConnectorDialog: React.FC<ViewConnectorDialogProps> = ({
  isOpen,
  onClose,
  connector
}) => {
  if (!connector) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(connector.type)}
            {connector.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {connector.name}</p>
                  <p><strong>Type:</strong> {connector.type}</p>
                  <p><strong>Category:</strong> {connector.category}</p>
                  <p><strong>Status:</strong> {connector.status}</p>
                  <p><strong>Description:</strong> {connector.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Usage Statistics</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Success Rate:</strong> {connector.success_rate || 0}%</p>
                  <p><strong>Usage Count:</strong> {connector.usage_count || 0}</p>
                  <p><strong>Created:</strong> {new Date(connector.created_at).toLocaleDateString()}</p>
                  {connector.last_tested && (
                    <p><strong>Last Tested:</strong> {new Date(connector.last_tested).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="space-y-2 text-sm">
                {connector.base_url && (
                  <p><strong>Base URL:</strong> {connector.base_url}</p>
                )}
                <p><strong>Auth Type:</strong> {connector.auth_type}</p>
                {connector.endpoints && connector.endpoints.length > 0 && (
                  <div>
                    <p><strong>Endpoints:</strong></p>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {connector.endpoints.map((endpoint: any) => (
                        <li key={endpoint.id}>
                          <span className="font-medium">{endpoint.method}</span> {endpoint.path}
                          {endpoint.description && (
                            <span className="text-gray-500"> - {endpoint.description}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Connector Dialog Component
interface EditConnectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  connector: Connector | null;
  onUpdate: (connector: Connector) => void;
}

const EditConnectorDialog: React.FC<EditConnectorDialogProps> = ({
  isOpen,
  onClose,
  connector,
  onUpdate
}) => {
  const { toast } = useToast();
  const { updateConnector } = useConnectorMetrics();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    base_url: '',
    auth_type: ''
  });

  React.useEffect(() => {
    if (connector) {
      setFormData({
        name: connector.name,
        description: connector.description,
        category: connector.category,
        base_url: connector.base_url || '',
        auth_type: connector.auth_type
      });
    }
  }, [connector]);

  const handleSave = async () => {
    if (!connector) return;

    try {
      await updateConnector.mutateAsync({
        connectorId: connector.id,
        updates: formData
      });
      
      toast({
        title: "Connector Updated",
        description: `${formData.name} has been updated successfully`,
      });
      
      onUpdate({ ...connector, ...formData });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update connector",
        variant: "destructive"
      });
    }
  };

  if (!connector) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Connector</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="base_url">Base URL</Label>
            <Input
              id="base_url"
              value={formData.base_url}
              onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="auth_type">Auth Type</Label>
            <Select value={formData.auth_type} onValueChange={(value) => setFormData(prev => ({ ...prev, auth_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select auth type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="oauth">OAuth</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateConnector.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateConnector.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
