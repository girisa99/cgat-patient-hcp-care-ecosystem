
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApiServices } from '@/hooks/useApiServices';
import { useApiServiceDetails } from '@/hooks/useApiServiceDetails';
import { CheckCircle, AlertCircle, XCircle, Database, Shield, FileText, AlertTriangle } from 'lucide-react';

export const ApiDataValidator: React.FC = () => {
  const { apiServices, meta } = useApiServices();
  const { apiEndpoints, getDetailedApiStats, consolidateApiServices, analyzeCoreApis } = useApiServiceDetails();

  // Validate and consolidate data
  const consolidatedApis = React.useMemo(() => {
    return consolidateApiServices(apiServices);
  }, [apiServices, consolidateApiServices]);

  const detailedStats = React.useMemo(() => {
    return getDetailedApiStats(consolidatedApis);
  }, [consolidatedApis, getDetailedApiStats]);

  // Analyze core APIs for duplicates
  const coreApiAnalysis = React.useMemo(() => {
    return analyzeCoreApis(apiServices);
  }, [apiServices, analyzeCoreApis]);

  // Data validation results
  const validationResults = React.useMemo(() => {
    const results = {
      totalEndpointsMatch: detailedStats.totalEndpoints === apiEndpoints.length,
      hasInternalApis: consolidatedApis.some(api => api.type === 'internal'),
      hasDuplicateCoreApis: coreApiAnalysis.hasDuplicates,
      endpointDataIntegrity: apiEndpoints.every(ep => ep.external_api_id && ep.method && ep.external_path),
      schemaConsistency: detailedStats.totalSchemas > 0,
      securityPolicyConsistency: detailedStats.totalSecurityPolicies > 0,
      coreApiConflict: coreApiAnalysis.duplicateGroups.length > 0
    };
    
    console.log('🔍 Validation Results:', results);
    return results;
  }, [detailedStats, apiEndpoints, consolidatedApis, coreApiAnalysis]);

  useEffect(() => {
    console.log('🔍 API Data Validation Report:', {
      originalCount: apiServices.length,
      consolidatedCount: consolidatedApis.length,
      totalEndpoints: detailedStats.totalEndpoints,
      coreApiAnalysis,
      validationResults
    });
  }, [apiServices, consolidatedApis, detailedStats, coreApiAnalysis, validationResults]);

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
          {/* Critical Issues Alert */}
          {validationResults.coreApiConflict && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-800">
                <strong>Critical Issue Detected:</strong> Duplicate core healthcare APIs found. This causes data inconsistency and endpoint count mismatches.
              </AlertDescription>
            </Alert>
          )}

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
                <AlertCircle className="h-4 w-4 text-red-500" />
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
              <p className="text-2xl font-bold text-blue-600">{apiServices.length}</p>
              <p className="text-sm text-muted-foreground">Original APIs</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{consolidatedApis.length}</p>
              <p className="text-sm text-muted-foreground">Consolidated APIs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{detailedStats.totalEndpoints}</p>
              <p className="text-sm text-muted-foreground">Total Endpoints</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{coreApiAnalysis.coreApis.length}</p>
              <p className="text-sm text-muted-foreground">Core APIs</p>
            </div>
          </div>

          {/* Core API Conflict Analysis */}
          {coreApiAnalysis.hasDuplicates && (
            <div>
              <h4 className="font-medium mb-2 text-red-700">⚠️ Duplicate Core Healthcare APIs Detected:</h4>
              <div className="space-y-2">
                {coreApiAnalysis.coreApis.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-3 border-2 border-red-200 rounded-lg bg-red-50">
                    <div>
                      <span className="font-medium text-red-800">{api.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-red-300">{api.type}</Badge>
                        <Badge variant="outline" className="text-xs border-red-300">{api.direction}</Badge>
                        <span className="text-xs text-red-600">ID: {api.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-3 w-3 text-red-600" />
                      <span className="text-red-700">{api.endpoints_count || 0} endpoints</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Recommendations */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">🔧 Recommended Actions:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                  {coreApiAnalysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                  <li>Choose one API as the single source of truth for all healthcare operations</li>
                  <li>Migrate users, patients, facilities, modules, and dashboard integrations to the chosen API</li>
                </ul>
              </div>
            </div>
          )}

          {/* Root Cause Analysis */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Root Cause Analysis:</strong> The endpoint count mismatch (showing 116 total but only 9 in internal) 
              is likely caused by duplicate core healthcare APIs. These duplicates fragment the endpoint data across 
              multiple API entries, making accurate counts impossible.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
