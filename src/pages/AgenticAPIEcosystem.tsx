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

const AgenticAPIEcosystem = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample API data
  const [apiServices] = useState([
    {
      id: '1',
      name: 'Cell Therapy API',
      description: 'Comprehensive API for cell therapy management and tracking',
      status: 'active',
      version: 'v2.1.0',
      endpoints: 24,
      uptime: '99.8%',
      requestsToday: 1247
    },
    {
      id: '2',
      name: 'Gene Therapy API',
      description: 'Advanced gene therapy protocols and patient management',
      status: 'active',
      version: 'v1.8.3',
      endpoints: 18,
      uptime: '99.5%',
      requestsToday: 892
    },
    {
      id: '3',
      name: 'Personalized Medicine API',
      description: 'Precision medicine and biomarker analysis platform',
      status: 'maintenance',
      version: 'v3.0.0',
      endpoints: 31,
      uptime: '98.2%',
      requestsToday: 2156
    }
  ]);

  const [connectedAgents] = useState([
    {
      id: '1',
      name: 'Treatment Protocol Agent',
      connectedAPIs: ['Cell Therapy API', 'Gene Therapy API'],
      status: 'active',
      lastActivity: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Patient Monitoring Agent',
      connectedAPIs: ['Personalized Medicine API'],
      status: 'active',
      lastActivity: '5 minutes ago'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agentic API Ecosystem</h2>
          <p className="text-muted-foreground mt-1">
            Intelligent API orchestration and management platform
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create API Integration
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">24</p>
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
                <p className="text-2xl font-bold">12</p>
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
                <p className="text-2xl font-bold">4.2M</p>
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
                <p className="text-2xl font-bold">99.2%</p>
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
                        <span>Cell Therapy API:</span>
                        <span className="text-green-600">125ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gene Therapy API:</span>
                        <span className="text-green-600">98ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Personalized Med:</span>
                        <span className="text-yellow-600">245ms</span>
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
                        <span>Peak Hour:</span>
                        <span>14:00-15:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Requests:</span>
                        <span>12.4K/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Transfer:</span>
                        <span>2.8TB today</span>
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
                {apiServices.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Network className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">{api.name}</h3>
                        <p className="text-sm text-muted-foreground">{api.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge 
                            variant={api.status === 'active' ? 'default' : api.status === 'maintenance' ? 'secondary' : 'outline'}
                          >
                            {api.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">v{api.version}</span>
                          <span className="text-xs text-muted-foreground">{api.endpoints} endpoints</span>
                          <span className="text-xs text-green-600">{api.uptime} uptime</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{api.requestsToday} requests today</p>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                {connectedAgents.map((agent) => (
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
                ))}
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