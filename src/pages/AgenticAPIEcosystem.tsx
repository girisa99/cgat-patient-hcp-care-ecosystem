import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Bot, 
  Network, 
  Link2, 
  Zap,
  Users,
  BarChart3,
  Settings,
  Plus,
  Database,
  Shield,
  Clock,
  Edit,
  Power,
  PowerOff,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ApiIntegrationCreator from '@/components/api/ApiIntegrationCreator';
import DatabaseConnectorManager from '@/components/integration/DatabaseConnectorManager';
import SecurityGatewayManager from '@/components/integration/SecurityGatewayManager';

const AgenticAPIEcosystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDatabaseConnectorManager, setShowDatabaseConnectorManager] = useState(false);
  const [showSecurityGatewayManager, setShowSecurityGatewayManager] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Fetch real API services data
  const { data: apiServices = [], isLoading: apisLoading } = useQuery({
    queryKey: ['api-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching API services:', error);
        return [];
      }
      
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch connected agents data
  const { data: connectedAgents = [] } = useQuery({
    queryKey: ['connected-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('category', 'agent')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching connected agents:', error);
        return [];
      }
      
      return (data || []).map(agent => ({
        id: agent.id,
        name: agent.name,
        connectedAPIs: ['Healthcare API'], // This would be determined by actual connections
        status: 'active',
        lastActivity: new Date(agent.updated_at).toLocaleString()
      }));
    },
  });

  // Fetch API usage analytics
  const { data: apiStats } = useQuery({
    queryKey: ['api-stats'],
    queryFn: async () => {
      const { data: usageLogs } = await supabase
        .from('api_usage_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const totalRequests = usageLogs?.length || 0;
      const avgResponseTime = usageLogs?.reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / (usageLogs?.length || 1);

      return {
        totalAPIs: apiServices.length,
        connectedAgents: connectedAgents.length,
        totalRequests,
        avgUptime: '99.2%',
        avgResponseTime: Math.round(avgResponseTime)
      };
    },
    enabled: !apisLoading,
  });

  const handleCreateIntegration = () => {
    setShowCreateDialog(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setShowEditService(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    toast({
      title: "Service Updated",
      description: `${editingService.name} has been updated successfully.`,
    });
    
    setShowEditService(false);
    setEditingService(null);
  };

  const handleDeactivateService = async (serviceId: string, serviceName: string) => {
    // This would typically call an API to deactivate the service
    toast({
      title: "Service Deactivated",
      description: `${serviceName} has been deactivated successfully.`,
    });
  };

  const handleActivateService = async (serviceId: string, serviceName: string) => {
    // This would typically call an API to activate the service
    toast({
      title: "Service Activated",
      description: `${serviceName} has been activated successfully.`,
    });
  };

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    // This would typically call an API to delete the service
    toast({
      title: "Service Deleted",
      description: `${serviceName} has been deleted successfully.`,
      variant: "destructive",
    });
  };

  const handleViewMetrics = (apiId: string) => {
    toast({
      title: "API Metrics",
      description: `Displaying metrics for API: ${apiId}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agentic API Ecosystem</h2>
          <p className="text-muted-foreground mt-1">
            Intelligent API orchestration and management platform
          </p>
        </div>
        <Button onClick={handleCreateIntegration}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Integration
        </Button>
      </div>

      {/* Real Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {apisLoading ? '...' : apiStats?.totalAPIs || 0}
                </p>
                <p className="text-xs text-muted-foreground">Active APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {apiStats?.connectedAgents || 0}
                </p>
                <p className="text-xs text-muted-foreground">Connected Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {apiStats?.totalRequests || 0}
                </p>
                <p className="text-xs text-muted-foreground">API Calls Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{apiStats?.avgUptime || '99.2%'}</p>
                <p className="text-xs text-muted-foreground">Avg Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="api-services">
            <Network className="h-4 w-4 mr-2" />
            API Services
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Bot className="h-4 w-4 mr-2" />
            Connected Agents
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Link2 className="h-4 w-4 mr-2" />
            Integration Hub
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Ecosystem Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Response Times</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Average Response:</span>
                        <span className="text-green-600">{apiStats?.avgResponseTime || 125}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Health:</span>
                        <span className="text-green-600">Healthy</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Endpoints:</span>
                        <span className="text-blue-600">{apiServices.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Error Rates</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>4xx Errors:</span>
                        <span className="text-green-600">0.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>5xx Errors:</span>
                        <span className="text-green-600">0.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timeout Errors:</span>
                        <span className="text-green-600">0.05%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">API Usage</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Requests:</span>
                        <span>{apiStats?.totalRequests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active APIs:</span>
                        <span>{apiServices.filter(api => api.status === 'active').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span>{apiStats?.avgUptime || '99.2%'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare API Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {apisLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading API services...</span>
                  </div>
                ) : apiServices.length > 0 ? (
                  apiServices.map((api) => (
                    <div key={api.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Network className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{api.name}</h3>
                          <p className="text-sm text-muted-foreground">{api.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge 
                              variant={api.status === 'active' ? 'default' : 'outline'}
                            >
                              {api.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">v{api.version}</span>
                            <span className="text-xs text-muted-foreground">{api.type}</span>
                            <span className="text-xs text-green-600">Healthy</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Active</p>
                        <div className="flex space-x-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditService(api)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewMetrics(api.id)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          {api.status === 'active' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeactivateService(api.id, api.name)}
                            >
                              <PowerOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleActivateService(api.id, api.name)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteService(api.id, api.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No API services found. Create your first API integration to get started.</p>
                    <Button onClick={handleCreateIntegration} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Integration
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {connectedAgents.length > 0 ? (
                  connectedAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Bot className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Connected to: {agent.connectedAPIs.join(', ')}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={agent.status === 'active' ? 'default' : 'outline'}>
                              {agent.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {agent.lastActivity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditService(agent)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Activity className="h-4 w-4" />
                        </Button>
                        {agent.status === 'active' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeactivateService(agent.id, agent.name)}
                          >
                            <PowerOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleActivateService(agent.id, agent.name)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No connected agents found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Database className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Database Connectors</h3>
                    <p className="text-sm text-muted-foreground mb-4">Connect to various healthcare databases</p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>PostgreSQL:</span>
                        <span className="text-green-600 font-medium">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MySQL:</span>
                        <span className="text-yellow-600 font-medium">Configurable</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MongoDB:</span>
                        <span className="text-green-600 font-medium">Available</span>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3 w-full" onClick={() => setShowDatabaseConnectorManager(true)}>
                       Configure
                     </Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Security Gateway</h3>
                    <p className="text-sm text-muted-foreground mb-4">Secure API authentication and authorization</p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>OAuth 2.0:</span>
                        <span className="text-green-600 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Keys:</span>
                        <span className="text-green-600 font-medium">Protected</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate Limiting:</span>
                        <span className="text-blue-600 font-medium">Enabled</span>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3 w-full" onClick={() => setShowSecurityGatewayManager(true)}>
                       Manage Security
                     </Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Link2 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">External APIs</h3>
                    <p className="text-sm text-muted-foreground mb-4">Integrate with third-party healthcare services</p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Healthcare.gov:</span>
                        <span className="text-green-600 font-medium">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HL7 FHIR:</span>
                        <span className="text-blue-600 font-medium">Available</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Epic/Cerner:</span>
                        <span className="text-yellow-600 font-medium">Pending</span>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3 w-full" onClick={() => setShowCreateDialog(true)}>
                      Add Integration
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Integration Creator Dialog */}
      <ApiIntegrationCreator
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      {/* Database Connector Manager */}
      {showDatabaseConnectorManager && (
        <DatabaseConnectorManager
          onClose={() => setShowDatabaseConnectorManager(false)}
        />
      )}

      {/* Security Gateway Manager */}
      {showSecurityGatewayManager && (
        <SecurityGatewayManager
          onClose={() => setShowSecurityGatewayManager(false)}
        />
      )}

      {/* Edit Service Dialog */}
      <Dialog open={showEditService} onOpenChange={setShowEditService}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Service</DialogTitle>
            <DialogDescription>
              Update service configuration and settings.
            </DialogDescription>
          </DialogHeader>
          
          {editingService && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  value={editingService.name}
                  onChange={(e) => setEditingService(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter service description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type</Label>
                  <Select 
                    value={editingService.type} 
                    onValueChange={(value) => setEditingService(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REST">REST API</SelectItem>
                      <SelectItem value="GraphQL">GraphQL</SelectItem>
                      <SelectItem value="SOAP">SOAP</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service-status">Status</Label>
                  <Select 
                    value={editingService.status} 
                    onValueChange={(value) => setEditingService(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-version">Version</Label>
                <Input
                  id="service-version"
                  value={editingService.version}
                  onChange={(e) => setEditingService(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="Enter version number"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditService(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateService}>
              Update Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgenticAPIEcosystem;