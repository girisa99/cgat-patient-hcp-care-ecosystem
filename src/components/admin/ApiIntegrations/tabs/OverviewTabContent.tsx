
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Globe, Server, Users } from 'lucide-react';

interface OverviewTabContentProps {
  totalIntegrations: number;
  consolidatedData: any[];
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  totalIntegrations,
  consolidatedData
}) => {
  const stats = {
    active: consolidatedData.filter(api => api.status === 'active').length,
    published: consolidatedData.filter(api => api.status === 'published').length,
    development: consolidatedData.filter(api => api.lifecycle_stage === 'development').length,
    production: consolidatedData.filter(api => api.lifecycle_stage === 'production').length
  };

  const recentActivities = consolidatedData
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              Across all integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active APIs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              External marketplace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.production}</div>
            <p className="text-xs text-muted-foreground">
              Production ready
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates to your API integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((api) => (
              <div key={api.id} className="flex items-center justify-between border-b pb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{api.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(api.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                    {api.status}
                  </Badge>
                  <Badge variant="outline">{api.lifecycle_stage}</Badge>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
