
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, ExternalLink, Settings, Activity } from 'lucide-react';

const ApiIntegrations = () => {
  console.log('🔗 API Integrations page rendering...');
  
  // Mock data for demonstration
  const apiIntegrations = [
    {
      id: '1',
      name: 'Healthcare Provider API',
      status: 'active',
      type: 'REST',
      version: 'v1.2.0',
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Patient Management System',
      status: 'active',
      type: 'GraphQL',
      version: 'v2.1.0',
      lastActivity: '1 day ago'
    },
    {
      id: '3',
      name: 'Billing Integration',
      status: 'inactive',
      type: 'REST',
      version: 'v1.0.0',
      lastActivity: '1 week ago'
    }
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="API Integrations"
          subtitle="Manage and monitor your API integrations"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiIntegrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {integration.name}
                  </CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                      {integration.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {integration.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-medium">{integration.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Activity:</span>
                      <span className="text-muted-foreground">{integration.lastActivity}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Monitor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Integration Management</CardTitle>
              <CardDescription>
                Add new integrations or manage existing ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Add New Integration
                </Button>
                <Button variant="outline">
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ApiIntegrations;
