
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Globe, Shield } from 'lucide-react';

interface OverviewTabContentProps {
  totalIntegrations: number;
  consolidatedData?: any[];
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  totalIntegrations,
  consolidatedData = []
}) => {
  console.log('📊 OverviewTabContent - Rendering with data:', {
    totalIntegrations,
    consolidatedData: consolidatedData.length
  });

  // Calculate statistics from real data
  const stats = {
    total: consolidatedData.length,
    internal: consolidatedData.filter(api => api.type === 'internal').length,
    external: consolidatedData.filter(api => api.type === 'external').length,
    active: consolidatedData.filter(api => api.status === 'active').length,
    published: consolidatedData.filter(api => api.status === 'published').length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All API integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internal APIs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.internal}</div>
            <p className="text-xs text-muted-foreground">
              Internal services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External APIs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.external}</div>
            <p className="text-xs text-muted-foreground">
              External services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              Live integrations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Integration Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consolidatedData.length > 0 ? (
              consolidatedData.map((api, index) => (
                <div key={api.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {api.type === 'internal' ? (
                      <Database className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Globe className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <h4 className="font-medium">{api.name || 'Unnamed API'}</h4>
                      <p className="text-sm text-gray-600">{api.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                      {api.status || 'inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {api.type || 'unknown'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No API integrations found</p>
                <p className="text-sm">Create your first API integration to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
