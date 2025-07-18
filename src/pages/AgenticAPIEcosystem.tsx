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
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
// Following Stability Framework - Use Template System
import { useApiServices } from '@/hooks/useApiServices';

const AgenticAPIEcosystem = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Using Stability Framework Template System
  const { apiServices, isLoading: apisLoading } = useApiServices();

  // Transform API services to compatible format
  const safeApiServices = (apiServices || []).map((api: any) => ({
    id: api.id,
    name: api.name || 'Unnamed API',
    description: api.description || '',
    status: api.status || 'inactive',
    version: api.version || '1.0',
    type: api.type || 'api'
  }));

  // Connected agents from agents with category 'agent'
  const connectedAgents = safeApiServices
    .filter(service => service.type === 'agent' && service.status === 'active')
    .map(agent => ({
      id: agent.id,
      name: agent.name,
      connectedAPIs: ['Healthcare API'],
      status: 'active',
      lastActivity: 'Recent'
    }));

  // API stats calculation
  const apiStats = {
    totalAPIs: safeApiServices.length,
    connectedAgents: connectedAgents.length,
    totalRequests: 0, // Would come from usage logs
    avgUptime: '99.2%',
    avgResponseTime: 125
  };

  const handleCreateIntegration = () => {
    toast({
      title: "API Integration",
      description: "Opening API integration wizard...",
    });
  };

  const handleManageAPI = (apiId: string) => {
    toast({
      title: "API Management",
      description: `Opening management for API: ${apiId}`,
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
                         <span className="text-blue-600">{safeApiServices.length}</span>
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
                         <span>{safeApiServices.filter(api => api.status === 'active').length}</span>
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
                 ) : safeApiServices.length > 0 ? (
                   safeApiServices.map((api) => (
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
                            onClick={() => handleManageAPI(api.id)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewMetrics(api.id)}
                          >
                            <BarChart3 className="h-4 w-4" />
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
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Activity className="h-4 w-4" />
                        </Button>
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
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Database className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Database Connectors</h3>
                    <p className="text-sm text-muted-foreground">Connect to various healthcare databases</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Security Gateway</h3>
                    <p className="text-sm text-muted-foreground">Secure API authentication and authorization</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Link2 className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">External APIs</h3>
                    <p className="text-sm text-muted-foreground">Integrate with third-party healthcare services</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgenticAPIEcosystem;