import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Plus, Search, RefreshCw, BarChart3, Settings,
  Database, Cloud, MessageSquare, FileText, Globe,
  CheckCircle, AlertTriangle, Clock, Filter,
  Eye, Edit, Trash2, Play, TrendingUp, X
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

interface Connector {
  id: string;
  name: string;
  description: string;
  type: 'database' | 'api' | 'messaging' | 'file_system' | 'external_service' | 'ai_model';
  category: string;
  brand?: string;
  status: 'active' | 'inactive' | 'testing' | 'error';
  baseUrl?: string;
  endpoints: Array<{
    id: string;
    path: string;
    method: string;
    description: string;
  }>;
  assignedActions: string[];
  aiGeneratedTasks: Array<{
    id: string;
    name: string;
    description: string;
    suggestedEndpoint: string;
  }>;
  authType: string;
  created_at: string;
  last_tested?: string;
  success_rate?: number;
  usage_count?: number;
}

export const EnhancedConnectorSystem: React.FC<EnhancedConnectorSystemProps> = ({
  agentId,
  actions,
  onAssignmentsChange,
  agentType,
  agentPurpose
}) => {
  const { toast } = useToast();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedActionForAssignment, setSelectedActionForAssignment] = useState<any>(null);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);

  const {
    apiAssignments,
    assignAPI,
    updateAssignment,
    removeAssignment,
    getTaskAssignment
  } = useAgentAPIAssignments(agentId);

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    // Load existing connectors - this would typically come from an API
    const mockConnectors: Connector[] = [
      {
        id: 'oracle-connector-1',
        name: 'Oracle Healthcare DB',
        description: 'Main Oracle database for patient records',
        type: 'database',
        category: 'Healthcare',
        brand: 'Oracle',
        status: 'active',
        baseUrl: 'oracle://healthcare-db:1521',
        endpoints: [
          { id: 'ep1', path: '/patients', method: 'GET', description: 'Get patient records' },
          { id: 'ep2', path: '/appointments', method: 'GET', description: 'Get appointments' }
        ],
        assignedActions: ['action-1', 'action-2'],
        aiGeneratedTasks: [],
        authType: 'bearer',
        created_at: '2024-01-15T10:00:00Z',
        last_tested: '2024-01-20T10:00:00Z',
        success_rate: 98,
        usage_count: 1247
      },
      {
        id: 'salesforce-connector-1',
        name: 'Salesforce CRM Integration',
        description: 'Integration with Salesforce for customer data',
        type: 'external_service',
        category: 'CRM',
        brand: 'Salesforce',
        status: 'testing',
        baseUrl: 'https://api.salesforce.com',
        endpoints: [
          { id: 'ep3', path: '/sobjects/Account', method: 'GET', description: 'Get accounts' },
          { id: 'ep4', path: '/sobjects/Contact', method: 'GET', description: 'Get contacts' }
        ],
        assignedActions: [],
        aiGeneratedTasks: [
          {
            id: 'task1',
            name: 'Sync Customer Data',
            description: 'Synchronize customer information from Salesforce',
            suggestedEndpoint: '/sobjects/Account'
          }
        ],
        authType: 'oauth',
        created_at: '2024-01-18T14:30:00Z',
        success_rate: 85,
        usage_count: 342
      }
    ];
    
    setConnectors(mockConnectors);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadConnectors();
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
    setIsRefreshing(false);
  };

  const handleConnectorCreated = (newConnector: any) => {
    setConnectors(prev => [...prev, newConnector]);
    toast({
      title: "Connector Created",
      description: `${newConnector.name} has been successfully created`,
    });
  };

  const handleTestConnector = async (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) return;

    setConnectors(prev => 
      prev.map(c => 
        c.id === connectorId ? { ...c, status: 'testing' as const } : c
      )
    );

    // Simulate testing
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      setConnectors(prev => 
        prev.map(c => 
          c.id === connectorId 
            ? { 
                ...c, 
                status: success ? 'active' as const : 'error' as const,
                last_tested: new Date().toISOString(),
                success_rate: success ? (c.success_rate || 0) + 1 : Math.max((c.success_rate || 0) - 5, 0)
              } 
            : c
        )
      );

      toast({
        title: success ? "Test Successful" : "Test Failed",
        description: success 
          ? `${connector.name} is working correctly`
          : `${connector.name} connection failed`,
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const handleViewConnector = (connector: Connector) => {
    setSelectedConnector(connector);
    // Could open a detailed view modal
    toast({
      title: "Connector Details",
      description: `Viewing details for ${connector.name}`,
    });
  };

  const handleEditConnector = (connector: Connector) => {
    setSelectedConnector(connector);
    // Could open edit modal
    toast({
      title: "Edit Connector",
      description: `Edit functionality for ${connector.name} would open here`,
    });
  };

  const handleConfigureConnector = (connector: Connector) => {
    setSelectedConnector(connector);
    // Could open configuration modal
    toast({
      title: "Configure Connector",
      description: `Configuration for ${connector.name} would open here`,
    });
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

  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || connector.status === statusFilter;
    const matchesType = typeFilter === 'all' || connector.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });


  const stats = {
    total: connectors.length,
    active: connectors.filter(c => c.status === 'active').length,
    testing: connectors.filter(c => c.status === 'testing').length,
    error: connectors.filter(c => c.status === 'error').length,
    avgSuccessRate: connectors.length > 0 
      ? Math.round(connectors.reduce((sum, c) => sum + (c.success_rate || 0), 0) / connectors.length)
      : 0,
    totalUsage: connectors.reduce((sum, c) => sum + (c.usage_count || 0), 0)
  };

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
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="assignments">Connector Assignments</TabsTrigger>
        </TabsList>


        <TabsContent value="assignments" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Connector Assignments
                  </CardTitle>
                  <Button 
                    onClick={() => setIsAssignmentDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Connector
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Assignments */}
                  {apiAssignments && apiAssignments.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Current Assignments</h4>
                      {apiAssignments.map((assignment: any) => (
                        <Card key={assignment.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{assignment.assigned_api_service}</p>
                              <p className="text-sm text-gray-600">
                                Task: {assignment.task_id} ({assignment.task_type})
                              </p>
                              <p className="text-xs text-gray-500">
                                Created: {new Date(assignment.created_at).toLocaleDateString()}
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">No Assignments Yet</h3>
                      <p className="text-sm mb-4">
                        Start assigning connectors to actions and tasks to enable automated workflows.
                      </p>
                      <Button 
                        onClick={() => setIsAssignmentDialogOpen(true)}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Assignment
                      </Button>
                    </div>
                  )}

                  {/* Available Actions */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Available Actions for Assignment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {actions.map((action) => (
                        <Card key={action.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{action.name}</p>
                              <p className="text-xs text-gray-600">{action.category}</p>
                              {action.description && (
                                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedActionForAssignment(action);
                                setIsAssignmentDialogOpen(true);
                              }}
                            >
                              Assign
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
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
        connectors={connectors}
        selectedAction={selectedActionForAssignment}
        onAssignmentCreate={handleCreateAssignment}
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
        auth_type: connector.authType
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

            {selectedConnectorData && selectedConnectorData.endpoints.length > 0 && (
              <div>
                <Label>Endpoint</Label>
                <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an endpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedConnectorData.endpoints.map((endpoint) => (
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
                    <p><strong>Auth:</strong> {selectedConnectorData.authType}</p>
                    {selectedConnectorData.baseUrl && (
                      <p><strong>Base URL:</strong> {selectedConnectorData.baseUrl}</p>
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