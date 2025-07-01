
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Globe, Users, Code, Shield } from 'lucide-react';

interface OverviewTabContentProps {
  integrations?: any[];
  internalApis?: any[];
  externalApis?: any[];
  publishedApis?: any[];
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  integrations = [],
  internalApis = [],
  externalApis = [],
  publishedApis = []
}) => {
  console.log('📊 OverviewTabContent - Rendering with corrected data:', {
    totalIntegrations: integrations.length,
    internalCount: internalApis.length,
    externalCount: externalApis.length,
    publishedCount: publishedApis.length
  });

  // Fixed endpoint calculation using real data structure
  const totalEndpoints = React.useMemo(() => {
    return integrations.reduce((sum, integration) => {
      // Use endpoints_count from database or fallback to 0
      return sum + (integration.endpoints_count || 0);
    }, 0);
  }, [integrations]);

  const activeIntegrations = React.useMemo(() => {
    return integrations.filter(i => i.status === 'active').length;
  }, [integrations]);

  // Calculate real consuming APIs (bidirectional or consuming purpose)
  const consumingApis = React.useMemo(() => {
    return integrations.filter(api => 
      api.direction === 'bidirectional' || 
      (api.purpose && api.purpose.toLowerCase().includes('consuming'))
    );
  }, [integrations]);

  return (
    <div className="space-y-6">
      {/* Stats Overview - Using Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeIntegrations} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              Across all integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internal APIs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internalApis.length}</div>
            <p className="text-xs text-muted-foreground">
              Private endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External APIs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{externalApis.length}</div>
            <p className="text-xs text-muted-foreground">
              Third-party integrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Recent Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.slice(0, 5).map((integration, index) => (
                <div key={integration.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {integration.endpoints_count || 0} endpoints • {integration.type}
                    </p>
                  </div>
                  <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                    {integration.status}
                  </Badge>
                </div>
              ))}
              {integrations.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No integrations found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              API Categories (Real Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Healthcare</span>
                <Badge variant="outline">
                  {integrations.filter(i => i.category === 'healthcare').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Authentication</span>
                <Badge variant="outline">
                  {integrations.filter(i => i.category === 'authentication' || i.category === 'auth').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Integration</span>
                <Badge variant="outline">
                  {integrations.filter(i => i.category === 'integration').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">API Services</span>
                <Badge variant="outline">
                  {integrations.filter(i => i.category === 'api').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Development</span>
                <Badge variant="outline">
                  {integrations.filter(i => i.category === 'development').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Health & Performance (Real Metrics)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{internalApis.length}</p>
              <p className="text-sm text-muted-foreground">Internal APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{consumingApis.length}</p>
              <p className="text-sm text-muted-foreground">Consuming APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{publishedApis.length}</p>
              <p className="text-sm text-muted-foreground">Published APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{activeIntegrations}</p>
              <p className="text-sm text-muted-foreground">Active Services</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
