
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Globe, Users, Code, Shield, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

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
  console.log('📊 OverviewTabContent - Rendering with consolidated data:', {
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

  // Enhanced sync status display
  const getSyncStatusDisplay = () => {
    if (!syncStatus || typeof syncStatus !== 'object') {
      return {
        message: 'Synchronization in progress...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-l-yellow-500',
        icon: AlertTriangle
      };
    }

    const isFullySynced = syncStatus.syncedCount === syncStatus.internalCount && syncStatus.internalCount > 0;
    const hasData = totalEndpoints > 0;
    
    if (isFullySynced && hasData) {
      return {
        message: `✅ All ${syncStatus.internalCount} APIs synchronized with ${totalEndpoints} endpoints`,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-l-green-500',
        icon: CheckCircle
      };
    } else if (syncStatus.syncedCount > 0) {
      return {
        message: `⚠️ Partial sync: ${syncStatus.syncedCount}/${syncStatus.internalCount} APIs • ${totalEndpoints} endpoints available`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-l-yellow-500',
        icon: AlertTriangle
      };
    } else {
      return {
        message: `🔄 Initializing sync for ${syncStatus.internalCount} APIs...`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-l-blue-500',
        icon: RefreshCw
      };
    }
  };

  const syncDisplay = getSyncStatusDisplay();
  const IconComponent = syncDisplay.icon;

  console.log('📈 Overview Stats:', {
    totalEndpoints,
    totalSchemas,
    totalSecurityPolicies,
    activeIntegrations,
    syncedApis,
    schemaCompleteness,
    syncStatus,
    syncDisplay: syncDisplay.message
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Sync Status Banner */}
      <Card className={`border-l-4 ${syncDisplay.bgColor}`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent className={`h-5 w-5 ${syncDisplay.color}`} />
            <h3 className="font-semibold">API Synchronization Status</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className={`${syncDisplay.color} font-medium`}>
              {syncDisplay.message}
            </span>
            {syncStatus && (
              <>
                <Badge variant="outline">
                  {syncStatus.endpointsCount || totalEndpoints} total endpoints
                </Badge>
                {syncStatus.unsyncedCount > 0 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {syncStatus.unsyncedCount} pending sync
                  </Badge>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Overview with Real Data */}
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
              Real synchronized endpoints
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

      {/* API Details Grid with Enhanced Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Recent APIs (Live Data)
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
              API Categories (Live Distribution)
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
                  <Badge variant="outline">{String(count)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Metrics with Real Data */}
      <Card>
        <CardHeader>
          <CardTitle>Live System Metrics</CardTitle>
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
              <p className="text-2xl font-bold text-purple-600">{consolidatedApis.filter(api => api.status === 'published' || api.lifecycle_stage === 'production').length}</p>
              <p className="text-sm text-muted-foreground">Production APIs</p>
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
