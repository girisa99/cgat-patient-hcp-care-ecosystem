
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Globe, Shield, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

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
  console.log('📊 OverviewTabContent - Rendering with data:', {
    totalIntegrations: integrations.length,
    consolidatedData: consolidatedData?.consolidatedApis?.length || 0
  });

  const consolidatedApis = consolidatedData?.consolidatedApis || integrations;
  const syncStatus = consolidatedData?.syncStatus;

  // Calculate simple metrics
  const totalEndpoints = consolidatedApis.reduce((sum, api) => {
    return sum + (api.endpoints_count || 0);
  }, 0);

  const totalSchemas = Math.floor(totalEndpoints * 0.8); // Estimate 80% have schemas
  const totalSecurityPolicies = consolidatedApis.reduce((sum, api) => {
    return sum + (api.rls_policies_count || 0);
  }, 0);

  const activeIntegrations = consolidatedApis.filter(i => i.status === 'active').length;
  const syncedApis = consolidatedApis.filter(api => api.isSynced !== false).length;
  const schemaCompleteness = totalEndpoints > 0 ? Math.round((totalSchemas / totalEndpoints) * 100) : 0;

  // Simple sync status display
  const getSyncStatusDisplay = () => {
    if (!syncStatus) {
      return {
        message: 'Loading...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-l-blue-500',
        icon: RefreshCw
      };
    }

    const hasData = totalEndpoints > 0;
    
    if (hasData && syncStatus.syncedCount > 0) {
      return {
        message: `✅ ${syncStatus.syncedCount} APIs synchronized with ${totalEndpoints} endpoints`,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-l-green-500',
        icon: CheckCircle
      };
    } else {
      return {
        message: `🔄 Initializing ${syncStatus.internalCount || 0} APIs...`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-l-blue-500',
        icon: RefreshCw
      };
    }
  };

  const syncDisplay = getSyncStatusDisplay();
  const IconComponent = syncDisplay.icon;

  return (
    <div className="space-y-6">
      {/* Sync Status Banner */}
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
              <Badge variant="outline">
                {totalEndpoints} total endpoints
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
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
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
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

      {/* Recent APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recent APIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {consolidatedApis.slice(0, 5).map((api, index) => (
              <div key={api.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{api.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {api.endpoints_count || 0} endpoints • {api.type} • {api.category}
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
                </div>
              </div>
            ))}
            {consolidatedApis.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No APIs found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
