
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Globe, 
  Key, 
  Settings, 
  BarChart3,
  Database,
  Shield,
  Zap,
  Plus
} from 'lucide-react';

const ApiServices: React.FC = () => {
  // Mock data for demonstration
  const apiStats = {
    totalAPIs: 8,
    activeEndpoints: 24,
    monthlyRequests: 15420,
    averageResponse: 245
  };

  const internalAPIs = [
    {
      id: '1',
      name: 'User Management API',
      version: 'v1.2.0',
      status: 'active',
      endpoints: 8,
      description: 'Manage users, roles, and permissions'
    },
    {
      id: '2',
      name: 'Facility Management API',
      version: 'v2.0.1',
      status: 'active',
      endpoints: 6,
      description: 'Healthcare facility data management'
    },
    {
      id: '3',
      name: 'Onboarding API',
      version: 'v1.0.0',
      status: 'beta',
      endpoints: 12,
      description: 'Treatment center onboarding workflow'
    }
  ];

  const externalAPIs = [
    {
      id: '1',
      name: 'Payment Processing',
      provider: 'Stripe',
      status: 'connected',
      lastSync: '2024-01-15 14:30'
    },
    {
      id: '2',
      name: 'SMS Notifications',
      provider: 'Twilio',
      status: 'connected',
      lastSync: '2024-01-15 12:15'
    },
    {
      id: '3',
      name: 'Email Service',
      provider: 'SendGrid',
      status: 'pending',
      lastSync: 'Never'
    }
  ];

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full";
    switch (status) {
      case 'active':
      case 'connected':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'beta':
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'inactive':
      case 'disconnected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <MainLayout>
      <PageContainer
        title="API Services"
        subtitle="Manage internal APIs, external integrations, and developer tools"
        headerActions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New API
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiStats.totalAPIs}</div>
                <p className="text-xs text-muted-foreground">
                  Internal & external
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiStats.activeEndpoints}</div>
                <p className="text-xs text-muted-foreground">
                  Currently available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Requests</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiStats.monthlyRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiStats.averageResponse}ms</div>
                <p className="text-xs text-muted-foreground">
                  Response time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* API Management Tabs */}
          <Tabs defaultValue="internal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="internal">Internal APIs</TabsTrigger>
              <TabsTrigger value="external">External APIs</TabsTrigger>
              <TabsTrigger value="marketplace">API Marketplace</TabsTrigger>
              <TabsTrigger value="developer">Developer Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Internal API Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {internalAPIs.map((api) => (
                      <div key={api.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{api.name}</h3>
                            <p className="text-sm text-gray-600">{api.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-500">
                                Version: {api.version}
                              </span>
                              <span className="text-sm text-gray-500">
                                Endpoints: {api.endpoints}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={getStatusBadge(api.status)}>
                              {api.status}
                            </span>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="external" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>External Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {externalAPIs.map((api) => (
                      <div key={api.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{api.name}</h3>
                            <p className="text-sm text-gray-600">Provider: {api.provider}</p>
                            <p className="text-sm text-gray-500">
                              Last sync: {api.lastSync}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={getStatusBadge(api.status)}>
                              {api.status}
                            </span>
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Marketplace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">API Marketplace coming soon</p>
                    <p className="text-sm text-gray-400">
                      Publish and discover APIs for the healthcare ecosystem
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="developer" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      API Keys
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage API keys for authentication and access control
                    </p>
                    <Button variant="outline" className="w-full">
                      Manage API Keys
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security & Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure security policies and access permissions
                    </p>
                    <Button variant="outline" className="w-full">
                      Security Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default ApiServices;
