
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApiServices } from '@/hooks/useApiServices';
import { useApiServiceDetails } from '@/hooks/useApiServiceDetails';
import { CheckCircle, AlertCircle, XCircle, Database, Shield, FileText } from 'lucide-react';

export const ApiDataValidator: React.FC = () => {
  const { apiServices, meta } = useApiServices();
  const { apiEndpoints, getDetailedApiStats, consolidateApiServices } = useApiServiceDetails();

  // Validate and consolidate data
  const consolidatedApis = React.useMemo(() => {
    return consolidateApiServices(apiServices);
  }, [apiServices, consolidateApiServices]);

  const detailedStats = React.useMemo(() => {
    return getDetailedApiStats(consolidatedApis);
  }, [consolidatedApis, getDetailedApiStats]);

  // Identify duplicates and inconsistencies
  const duplicateAnalysis = React.useMemo(() => {
    const duplicates: Record<string, any[]> = {};
    const coreApis: any[] = [];
    
    consolidatedApis.forEach(api => {
      // Check for core healthcare APIs
      if (api.name.toLowerCase().includes('core') || api.name.toLowerCase().includes('healthcare')) {
        coreApis.push(api);
      }
      
      // Group similar names
      const normalizedName = api.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!duplicates[normalizedName]) {
        duplicates[normalizedName] = [];
      }
      duplicates[normalizedName].push(api);
    });

    return {
      duplicateGroups: Object.entries(duplicates).filter(([_, group]) => group.length > 1),
      coreApis,
      totalOriginal: apiServices.length,
      totalConsolidated: consolidatedApis.length
    };
  }, [consolidatedApis, apiServices]);

  // Data validation results
  const validationResults = React.useMemo(() => {
    return {
      totalEndpointsMatch: detailedStats.totalEndpoints === apiEndpoints.length,
      hasInternalApis: consolidatedApis.some(api => api.type === 'internal'),
      hasDuplicateCoreApis: duplicateAnalysis.coreApis.length > 1,
      endpointDataIntegrity: apiEndpoints.every(ep => ep.external_api_id && ep.method && ep.external_path),
      schemaConsistency: detailedStats.totalSchemas > 0,
      securityPolicyConsistency: detailedStats.totalSecurityPolicies > 0
    };
  }, [detailedStats, apiEndpoints, consolidatedApis, duplicateAnalysis]);

  useEffect(() => {
    console.log('🔍 API Data Validation Report:', {
      originalCount: apiServices.length,
      consolidatedCount: consolidatedApis.length,
      totalEndpoints: detailedStats.totalEndpoints,
      duplicateGroups: duplicateAnalysis.duplicateGroups,
      coreApis: duplicateAnalysis.coreApis,
      validationResults
    });
  }, [apiServices, consolidatedApis, detailedStats, duplicateAnalysis, validationResults]);

  return (
    <div className="space-y-4">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            API Data Validation & Single Source of Truth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Validation Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {validationResults.totalEndpointsMatch ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <XCircle className="h-4 w-4 text-red-500" />
              }
              <span className="text-sm">Endpoint Count Consistency</span>
            </div>
            <div className="flex items-center gap-2">
              {!validationResults.hasDuplicateCoreApis ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              }
              <span className="text-sm">No Duplicate Core APIs</span>
            </div>
            <div className="flex items-center gap-2">
              {validationResults.endpointDataIntegrity ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <XCircle className="h-4 w-4 text-red-500" />
              }
              <span className="text-sm">Data Integrity</span>
            </div>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{duplicateAnalysis.totalOriginal}</p>
              <p className="text-sm text-muted-foreground">Original APIs</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{duplicateAnalysis.totalConsolidated}</p>
              <p className="text-sm text-muted-foreground">Consolidated APIs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{detailedStats.totalEndpoints}</p>
              <p className="text-sm text-muted-foreground">Total Endpoints</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{duplicateAnalysis.coreApis.length}</p>
              <p className="text-sm text-muted-foreground">Core APIs</p>
            </div>
          </div>

          {/* Core APIs Analysis */}
          {duplicateAnalysis.coreApis.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Core Healthcare APIs Found:</h4>
              <div className="space-y-2">
                {duplicateAnalysis.coreApis.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{api.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{api.type}</Badge>
                        <Badge variant="outline" className="text-xs">{api.direction}</Badge>
                        <span className="text-xs text-muted-foreground">ID: {api.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-3 w-3" />
                      <span>{api.endpoints_count || 0} endpoints</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {validationResults.hasDuplicateCoreApis && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Multiple core healthcare APIs detected. Consider consolidating to a single source of truth for better data consistency.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
