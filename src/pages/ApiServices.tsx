import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useApiServices } from '@/hooks/useApiServices';
import { Badge } from '@/components/ui/badge';

const ApiServices: React.FC = () => {
  console.log('🔗 API Services page rendering');
  const { currentRole, hasAccess } = useRoleBasedNavigation();
  const { apiServices, isLoading, internalApis, externalApis, totalCount } = useApiServices();

  if (!hasAccess('/api-services')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access API Services.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="API Services">
      <div className="space-y-6">
        {/* API Services Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Total APIs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{internalApis.length}</div>
              <div className="text-sm text-muted-foreground">Internal APIs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{externalApis.length}</div>
              <div className="text-sm text-muted-foreground">External APIs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{apiServices.filter((api: any) => api.status === 'active').length}</div>
              <div className="text-sm text-muted-foreground">Active Services</div>
            </CardContent>
          </Card>
        </div>

        {/* API Services Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              API Services & Integrations
              <Badge variant="outline">{apiServices.length} services</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading API services...</p>
            ) : (
              <div className="space-y-4">
                <p>Managing {apiServices.length} API services and integrations across the platform.</p>
                
                {/* API Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Internal APIs</h3>
                    <p className="text-sm text-muted-foreground mb-2">Manage internal API endpoints and documentation</p>
                    <Badge variant="outline">{internalApis.length} endpoints</Badge>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">External Integrations</h3>
                    <p className="text-sm text-muted-foreground mb-2">Configure third-party API integrations</p>
                    <Badge variant="outline">{externalApis.length} integrations</Badge>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">API Keys & Access</h3>
                    <p className="text-sm text-muted-foreground">Manage API keys and access permissions</p>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Usage Analytics</h3>
                    <p className="text-sm text-muted-foreground">Monitor API usage and performance metrics</p>
                  </div>
                </div>

                {/* Recent API Activity */}
                {apiServices.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent API Services</h4>
                    {apiServices.slice(0, 3).map((service: any) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">{service.description}</div>
                        </div>
                        <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ApiServices;