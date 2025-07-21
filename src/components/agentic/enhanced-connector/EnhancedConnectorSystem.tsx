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
  Eye, Edit, Trash2, Play, TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConnectorCreationWizard } from './ConnectorCreationWizard';
import { useAgentAPIAssignments } from '@/hooks/useAgentAPIAssignments';

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
  onAssignmentsChange
}) => {
  const { toast } = useToast();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || connector.status === statusFilter;
    const matchesType = typeFilter === 'all' || connector.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: Connector['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'testing': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: Connector['type']) => {
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
          <h2 className="text-2xl font-bold">Enhanced Connector System</h2>
          <p className="text-gray-600">
            Comprehensive connector management with guided creation, testing, and analytics
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Testing</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.testing}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Errors</p>
                <p className="text-2xl font-bold text-red-900">{stats.error}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">{stats.avgSuccessRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600">Total Usage</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {stats.totalUsage.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-type">By Type</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search connectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="testing">Testing</option>
                <option value="error">Error</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="database">Database</option>
                <option value="api">API</option>
                <option value="messaging">Messaging</option>
                <option value="external_service">External Service</option>
                <option value="ai_model">AI Model</option>
              </select>
            </div>

            {/* Connector List */}
            <div className="space-y-4">
              {filteredConnectors.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-semibold mb-2">No Connectors Found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'No connectors match your current filters.'
                        : 'Start by creating your first connector.'}
                    </p>
                    <Button onClick={() => setIsWizardOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Connector
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredConnectors.map((connector) => (
                  <Card key={connector.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTypeIcon(connector.type)}
                            <h3 className="font-semibold">{connector.name}</h3>
                            {connector.brand && (
                              <Badge variant="outline">{connector.brand}</Badge>
                            )}
                            <Badge variant="outline">{connector.category}</Badge>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(connector.status)}
                              <span className="text-sm capitalize">{connector.status}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {connector.description}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span>Auth: {connector.authType}</span>
                            <span>Endpoints: {connector.endpoints.length}</span>
                            <span>Actions: {connector.assignedActions.length}</span>
                            {connector.success_rate && (
                              <span>Success: {connector.success_rate}%</span>
                            )}
                            {connector.usage_count && (
                              <span>Usage: {connector.usage_count.toLocaleString()}</span>
                            )}
                            {connector.last_tested && (
                              <span>
                                Last tested: {new Date(connector.last_tested).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {connector.aiGeneratedTasks.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-purple-600 font-medium">
                                {connector.aiGeneratedTasks.length} AI-generated tasks available
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnector(connector.id)}
                            disabled={connector.status === 'testing'}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="by-type" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['database', 'api', 'messaging', 'external_service', 'ai_model'].map((type) => {
              const typeConnectors = connectors.filter(c => c.type === type);
              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getTypeIcon(type as Connector['type'])}
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="outline">{typeConnectors.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {typeConnectors.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        No {type.replace('_', ' ')} connectors
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {typeConnectors.map((connector) => (
                          <div
                            key={connector.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="font-medium text-sm">{connector.name}</p>
                              <p className="text-xs text-gray-600">{connector.status}</p>
                            </div>
                            {getStatusIcon(connector.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Connector Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Performance Analytics</h3>
                  <p className="text-sm mb-4">
                    Detailed analytics showing connector performance, usage patterns, and reliability metrics.
                  </p>
                  <Button variant="outline">
                    View Detailed Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Connector Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Assignment Management</h3>
                  <p className="text-sm mb-4">
                    View and manage how connectors are assigned to specific actions and tasks.
                  </p>
                  <Button variant="outline">
                    Manage Assignments
                  </Button>
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
    </div>
  );
};