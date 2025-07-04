
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Activity, Database, Zap } from 'lucide-react';
import { useApiServices } from '@/hooks/useApiServices';

const ApiServices: React.FC = () => {
  const { apiServices, isLoading } = useApiServices();

  const stats = {
    total: apiServices.length,
    active: apiServices.filter(api => api.status === 'active').length,
    development: apiServices.filter(api => api.lifecycle_stage === 'development').length,
    production: apiServices.filter(api => api.lifecycle_stage === 'production').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">API Services</h1>
        <p className="text-muted-foreground">
          Manage API integrations and external services
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Registered services
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
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Development</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.development}</div>
            <p className="text-xs text-muted-foreground">
              In development
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.production}</div>
            <p className="text-xs text-muted-foreground">
              Production ready
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Services List */}
      <Card>
        <CardHeader>
          <CardTitle>API Integration Registry</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-8">Loading API services...</div>
          ) : apiServices.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API services found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiServices.map((api) => (
                <div key={api.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="font-medium">{api.name}</div>
                    <div className="text-sm text-muted-foreground">{api.description}</div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {api.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {api.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        v{api.version}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={api.status === 'active' ? "default" : "secondary"}>
                      {api.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {api.lifecycle_stage}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiServices;
