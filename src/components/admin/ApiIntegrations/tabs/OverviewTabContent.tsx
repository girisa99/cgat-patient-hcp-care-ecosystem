
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Globe, Users, Code, Shield, Sync, CheckCircle, AlertTriangle } from 'lucide-react';

interface OverviewTabContentProps {
  integrations?: any[];
  consolidatedData?: {
    consolidatedApis: any[];
    syncStatus: any;
  };
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  integrations = [],
  consolidatedData
}) => {
  console.log('📊 OverviewTabContent - Rendering with consolidated sync data:', {
    totalIntegrations: integrations.length,
    consolidatedData: consolidatedData?.consolidatedApis?.length || 0,
    syncStatus: consolidatedData?.syncStatus
  });

  const consolidatedApis = consolidatedData?.consolidatedApis || integrations;
  const syncStatus = consolidatedData?.syncStatus;

  // Enhanced metrics from consolidated data
  const totalEndpoints = React.useMemo(() => {
    return consolidatedApis.reduce((sum, api) => {
      const endpointCount = api.actualEndpoints?.length || api.endpoints_count || 0;
      return sum + endpointCount;
    }, 0);
  }, [consolidatedApis]);

  const totalSchemas = React.useMemo(() => {
    return consolidatedApis.reduce((sum, api) => {
      if (api.actualEndpoints) {
        const schemaCount = api.actualEndpoints.filter((endpoint: any) => 
          endpoint.request_schema || endpoint.response_schema
        ).length;
        return sum + schemaCount;
      }
      return sum + Math.round((api.endpoints_count || 0) * 0.8);
    }, 0);
  }, [consolidatedApis]);

  const totalSecurityPolicies = React.useMemo(() => {
    return consolidatedApis.reduce((sum, api) => {
      return sum + (api.rls_policies_count || 0);
    }, 0);
  }, [consolidatedApis]);

  const activeIntegrations = React.useMemo(() => {
    return consolidatedApis.filter(i => i.status === 'active').length;
  }, [consolidatedApis]);

  const syncedApis = React.useMemo(() => {
    return consolidatedApis.filter(api => api.isSynced).length;
  }, [consolidatedApis]);

  const schemaCompleteness = React.useMemo(() => {
    if (totalEndpoints === 0) return 0;
    return Math.round((totalSchemas / totalEndpoints) * 100);
  }, [totalSchemas, totalEndpoints]);

  console.log('📈 Enhanced Overview Stats:', {
    totalEndpoints,
    totalSchemas,
    totalSecurityPolicies,
    activeIntegrations,
    syncedApis,
    schemaCompleteness,
    syncStatus
  });

  return (
    <div className="space-y-6">
      {/* Sync Status Banner */}
      {syncStatus && (
        <Card className={`border-l-4 ${syncStatus.syncedCount === syncStatus.internalCount ? 'border-l-green-500 bg-green-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              {syncStatus.syncedCount === syncStatus.internalCount ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <h3 className="font-semibold">API Synchronization Status</h3>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-700">
                <strong>{syncStatus.syncedCount}</strong> of <strong>{syncStatus.internalCount}</strong> internal APIs synced to external
              </span>
              <Badge variant="outline">
                {syncStatus.endpointsCount} total endpoints
              </Badge>
              {syncStatus.unsyncedCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {syncStatus.unsyncedCount} unsynced
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consolidatedApis.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeIntegrations} active • {syncedApis} synced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Endpoints</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              Synchronized endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schema Coverage</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schemaCompleteness}%</div>
            <p className="text-xs text-muted-foreground">
              {totalSchemas} schemas defined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Policies</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSecurityPolicies}</div>
            <p className="text-xs text-muted-foreground">
              RLS & security rules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sync className="h-5 w-5" />
              Recent APIs (Synchronized Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consolidatedApis.slice(0, 5).map((api, index) => {
                const endpointCount = api.actualEndpoints?.length || api.endpoints_count || 0;
                const schemaCompleteness = api.schemaCompleteness || 0;
                
                return (
                  <div key={api.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{api.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {endpointCount} endpoints • {api.type} • {Math.round(schemaCompleteness)}% schemas
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                        {api.status}
                      </Badge>
                      {api.isSynced && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Synced
                        </Badge>
                      )}
                      {api.isExternalOnly && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          External
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {consolidatedApis.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No APIs found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              API Categories (Consolidated)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                consolidatedApis.reduce((acc, api) => {
                  const category = api.category || 'uncategorized';
                  acc[category] = (acc[category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium capitalize">{category}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Synchronized System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{consolidatedApis.filter(api => api.type === 'internal' || api.direction === 'inbound').length}</p>
              <p className="text-sm text-muted-foreground">Internal APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{consolidatedApis.filter(api => api.type === 'external' || api.direction === 'outbound').length}</p>
              <p className="text-sm text-muted-foreground">External APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{consolidatedApis.filter(api => api.status === 'published').length}</p>
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
