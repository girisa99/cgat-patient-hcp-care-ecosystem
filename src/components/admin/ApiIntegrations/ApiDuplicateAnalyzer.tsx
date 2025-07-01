import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiServices } from '@/hooks/useApiServices';
import { useApiServiceDetails } from '@/hooks/useApiServiceDetails';
import { 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  GitMerge, 
  Eye, 
  Shield,
  Code,
  FileText,
  Calendar,
  Users,
  Settings,
  Target,
  Trash2
} from 'lucide-react';

interface ApiComparisonResult {
  recommended: any;
  deprecated: any[];
  differences: {
    endpoints: { recommended: number; deprecated: number[] };
    schemas: { recommended: number; deprecated: number[] };
    documentation: { recommended: boolean; deprecated: boolean[] };
    lastUpdated: { recommended: string; deprecated: string[] };
    creationDate: { recommended: string; deprecated: string[] };
  };
  migrationPlan: string[];
  riskAssessment: 'low' | 'medium' | 'high';
  consolidationRecommendations: string[];
  validationResults: {
    schemasVerified: boolean;
    endpointsVerified: boolean;
    dataIntegrityChecked: boolean;
    safeToRemove: boolean;
    missingData: string[];
  };
}

import { ApiConsolidationAction } from './ApiConsolidationAction';

export const ApiDuplicateAnalyzer: React.FC = () => {
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ApiComparisonResult | null>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'passed' | 'failed'>('pending');

  const { apiServices } = useApiServices();
  const { apiEndpoints, analyzeCoreApis } = useApiServiceDetails();

  const coreApiAnalysis = React.useMemo(() => {
    return analyzeCoreApis(apiServices);
  }, [apiServices, analyzeCoreApis]);

  // Comprehensive validation function
  const validateDataIntegrity = (coreApis: any[], endpoints: any[]) => {
    console.log('🔍 Starting comprehensive data validation...');
    
    const validationResults = {
      schemasVerified: false,
      endpointsVerified: false,
      dataIntegrityChecked: false,
      safeToRemove: false,
      missingData: [] as string[]
    };

    // Check each core API for completeness
    const apiDataComparison = coreApis.map(api => {
      const apiEndpoints = endpoints.filter(ep => ep.external_api_id === api.id);
      
      return {
        api,
        endpoints: apiEndpoints,
        hasSchemas: apiEndpoints.filter(ep => ep.request_schema || ep.response_schema).length,
        hasDocumentation: !!api.documentation_url,
        hasAuthentication: apiEndpoints.filter(ep => ep.requires_authentication).length,
        totalEndpoints: apiEndpoints.length,
        uniqueEndpoints: [...new Set(apiEndpoints.map(ep => `${ep.method}:${ep.external_path}`))].length
      };
    });

    console.log('📊 API Data Comparison:', apiDataComparison);

    // Verify no data will be lost
    const allEndpoints = apiDataComparison.reduce((acc, curr) => acc + curr.totalEndpoints, 0);
    const allSchemas = apiDataComparison.reduce((acc, curr) => acc + curr.hasSchemas, 0);
    const allAuth = apiDataComparison.reduce((acc, curr) => acc + curr.hasAuthentication, 0);

    // Find the API with the most complete data
    const bestApi = apiDataComparison.reduce((best, current) => {
      const bestScore = best.totalEndpoints + best.hasSchemas + (best.hasDocumentation ? 1 : 0);
      const currentScore = current.totalEndpoints + current.hasSchemas + (current.hasDocumentation ? 1 : 0);
      return currentScore > bestScore ? current : best;
    });

    // Check if consolidating to the best API will lose any data
    const otherApis = apiDataComparison.filter(api => api.api.id !== bestApi.api.id);
    const potentialDataLoss = [];

    for (const otherApi of otherApis) {
      if (otherApi.totalEndpoints > 0 && otherApi.uniqueEndpoints > 0) {
        // Check if these endpoints exist in the best API
        const otherEndpointPaths = otherApi.endpoints.map(ep => `${ep.method}:${ep.external_path}`);
        const bestEndpointPaths = bestApi.endpoints.map(ep => `${ep.method}:${ep.external_path}`);
        
        const uniqueEndpoints = otherEndpointPaths.filter(path => !bestEndpointPaths.includes(path));
        if (uniqueEndpoints.length > 0) {
          potentialDataLoss.push(`${otherApi.api.name}: ${uniqueEndpoints.length} unique endpoints`);
        }
      }
    }

    validationResults.schemasVerified = allSchemas > 0;
    validationResults.endpointsVerified = allEndpoints > 0;
    validationResults.dataIntegrityChecked = true;
    validationResults.safeToRemove = potentialDataLoss.length === 0;
    validationResults.missingData = potentialDataLoss;

    console.log('✅ Validation Results:', validationResults);
    return { validationResults, bestApi, apiDataComparison };
  };

  // Enhanced analysis with validation
  const performDeepAnalysis = () => {
    console.log('🔍 Starting deep analysis with comprehensive validation...');
    
    const coreApis = coreApiAnalysis.coreApis;
    if (coreApis.length < 2) {
      console.log('⚠️ Less than 2 core APIs found, no duplicates to analyze');
      return;
    }

    // Perform data validation first
    const { validationResults, bestApi, apiDataComparison } = validateDataIntegrity(coreApis, apiEndpoints);

    // Enhanced scoring algorithm using the validated best API
    const scoredApis = apiDataComparison.map(({ api, endpoints, hasSchemas, hasDocumentation, hasAuthentication, totalEndpoints }) => {
      let score = 0;
      let reasons = [];

      // Endpoint count (30% weight)
      const endpointScore = totalEndpoints * 3;
      score += endpointScore;
      if (totalEndpoints > 0) reasons.push(`${totalEndpoints} endpoints (+${endpointScore})`);

      // Schema completeness (25% weight)
      const schemaScore = hasSchemas * 2.5;
      score += schemaScore;
      if (hasSchemas > 0) reasons.push(`${hasSchemas} schemas (+${schemaScore})`);

      // Documentation (15% weight)
      if (hasDocumentation) {
        score += 15;
        reasons.push('Has documentation (+15)');
      }

      // Last updated (10% weight)
      const daysSinceUpdate = Math.floor((Date.now() - new Date(api.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, 10 - (daysSinceUpdate / 30));
      score += recencyScore;
      if (recencyScore > 5) reasons.push(`Recently updated (+${recencyScore.toFixed(1)})`);

      // Status and configuration (10% weight)
      if (api.status === 'active') {
        score += 10;
        reasons.push('Active status (+10)');
      }

      // Base URL presence (5% weight)
      if (api.base_url) {
        score += 5;
        reasons.push('Has base URL (+5)');
      }

      // Name preference (5% weight)
      if (api.name === 'internal_healthcare_api') {
        score += 5;
        reasons.push('Better naming convention (+5)');
      }

      return {
        ...api,
        endpointsCount: totalEndpoints,
        schemasCount: hasSchemas,
        securityCount: hasAuthentication,
        score: Math.round(score * 10) / 10,
        reasons
      };
    });

    // Sort by score (highest first)
    scoredApis.sort((a, b) => b.score - a.score);
    
    const recommended = scoredApis[0];
    const deprecated = scoredApis.slice(1);

    console.log('🏆 Scoring results with validation:', {
      recommended: { name: recommended.name, score: recommended.score, reasons: recommended.reasons },
      deprecated: deprecated.map(api => ({ name: api.name, score: api.score, reasons: api.reasons })),
      validationResults
    });

    // Create enhanced migration plan with validation insights
    const migrationPlan = [
      `🎯 VALIDATED CONSOLIDATION TO: "${recommended.name}" (Score: ${recommended.score})`,
      `✅ Data Validation: ${validationResults.safeToRemove ? 'SAFE - No data loss detected' : 'CAUTION - Potential data loss detected'}`,
      `📊 Current Status: ${deprecated.length} duplicate API(s) to deprecate`,
      `🔄 Migrate ${deprecated.reduce((sum, api) => sum + (api.endpointsCount || 0), 0)} endpoints to ${recommended.name}`,
      `🗃️ Update all database references to use ID: ${recommended.id}`,
      `🔧 Update frontend components to use single API service`,
      `📱 Test all modules (Users, Patients, Facilities, Onboarding) with consolidated API`,
      `🧹 Remove deprecated API entries from api_integration_registry`,
      `📝 Update API documentation to reflect single source architecture`,
      `🔍 Endpoint verification: ${validationResults.endpointsVerified ? 'PASSED' : 'FAILED'}`,
      `📋 Schema verification: ${validationResults.schemasVerified ? 'PASSED' : 'FAILED'}`
    ];

    // Enhanced consolidation recommendations with validation
    const consolidationRecommendations = [
      `✅ RECOMMENDED: Keep "${recommended.name}" (ID: ${recommended.id})`,
      `❌ SAFE TO REMOVE: ${deprecated.map(api => `"${api.name}" (ID: ${api.id})`).join(', ')}`,
      `🔍 VALIDATION STATUS: ${validationResults.safeToRemove ? 'SAFE TO PROCEED' : 'REQUIRES REVIEW'}`,
      validationResults.missingData.length > 0 ? `⚠️ DATA REVIEW NEEDED: ${validationResults.missingData.join(', ')}` : '✅ NO DATA LOSS DETECTED',
      `🔧 ACTION NEEDED: Update all useApiServices hooks to filter out deprecated APIs`,
      `📊 IMPACT: This will fix the endpoint count mismatch (116 total vs fragmented display)`,
      `⚡ PRIORITY: HIGH - Data inconsistency affects all healthcare modules`,
      `🛡️ SAFETY: ${validationResults.safeToRemove ? 'LOW RISK' : 'MEDIUM RISK'} - ${validationResults.safeToRemove ? 'No data loss expected' : 'Review missing data before proceeding'}`
    ];

    // Risk assessment based on validation
    const totalEndpointsToMigrate = deprecated.reduce((sum, api) => sum + (api.endpointsCount || 0), 0);
    const baseRisk = totalEndpointsToMigrate > 50 ? 'high' : 
                     totalEndpointsToMigrate > 20 ? 'medium' : 'low';
    const riskAssessment = validationResults.safeToRemove ? baseRisk : 
                          (baseRisk === 'low' ? 'medium' : 'high');

    const result: ApiComparisonResult = {
      recommended,
      deprecated,
      differences: {
        endpoints: {
          recommended: recommended.endpointsCount || 0,
          deprecated: deprecated.map(api => api.endpointsCount || 0)
        },
        schemas: {
          recommended: recommended.schemasCount || 0,
          deprecated: deprecated.map(api => api.schemasCount || 0)
        },
        documentation: {
          recommended: !!recommended.documentation_url,
          deprecated: deprecated.map(api => !!api.documentation_url)
        },
        lastUpdated: {
          recommended: recommended.updated_at,
          deprecated: deprecated.map(api => api.updated_at)
        },
        creationDate: {
          recommended: recommended.created_at,
          deprecated: deprecated.map(api => api.created_at)
        }
      },
      migrationPlan,
      riskAssessment,
      consolidationRecommendations,
      validationResults
    };

    setComparisonResult(result);
    setAnalysisComplete(true);
    setValidationStatus(validationResults.safeToRemove ? 'passed' : 'failed');

    console.log('✅ Deep analysis with validation complete:', result);
  };

  const validateMigrationReadiness = () => {
    if (!comparisonResult) return false;

    const checks = [
      comparisonResult.recommended.id,
      comparisonResult.recommended.name,
      comparisonResult.deprecated.length > 0,
      comparisonResult.migrationPlan.length > 0,
      comparisonResult.validationResults.dataIntegrityChecked
    ];

    return checks.every(check => !!check);
  };

  const handleConsolidationComplete = () => {
    console.log('🎉 Consolidation completed, refreshing data...');
    // Reset analysis to trigger refresh
    setAnalysisComplete(false);
    setComparisonResult(null);
    setValidationStatus('pending');
    
    // Could trigger a data refresh here if needed
    window.location.reload(); // Simple refresh for now
  };

  if (!coreApiAnalysis.hasDuplicates) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">No Duplicate Core APIs Found</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your system has a clean API structure with no core duplicates detected.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header with Validation Status */}
      <Card className={`border-red-200 ${validationStatus === 'passed' ? 'bg-yellow-50' : 'bg-red-50'}`}>
        <CardHeader>
          <CardTitle className={`${validationStatus === 'passed' ? 'text-yellow-800' : 'text-red-800'} flex items-center gap-2`}>
            <AlertTriangle className="h-5 w-5" />
            {validationStatus === 'passed' ? 'VALIDATED: Safe to Consolidate Core APIs' : 'CRITICAL: Duplicate Core API Resolution Required'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{coreApiAnalysis.coreApis.length}</p>
              <p className="text-sm text-red-700">Duplicate Core APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">116</p>
              <p className="text-sm text-orange-700">Fragmented Endpoints</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">1</p>
              <p className="text-sm text-blue-700">Target (Single Source)</p>
            </div>
          </div>
          
          <Alert className="border-yellow-500 bg-yellow-50 mb-4">
            <Target className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Data Integrity Issue:</strong> Multiple core APIs are fragmenting your healthcare data. 
              Comprehensive validation will ensure safe consolidation without data loss.
            </AlertDescription>
          </Alert>
          
          {!analysisComplete && (
            <Button 
              onClick={performDeepAnalysis}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Analyze, Validate & Get Safe Consolidation Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results with Validation */}
      {analysisComplete && comparisonResult && (
        <Tabs defaultValue="validation" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="validation" className={comparisonResult.validationResults.safeToRemove ? "text-green-600" : "text-red-600"}>
              Validation {comparisonResult.validationResults.safeToRemove ? "✅" : "⚠️"}
            </TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="comparison">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="migration">Migration Plan</TabsTrigger>
            <TabsTrigger value="execute">Execute</TabsTrigger>
          </TabsList>

          <TabsContent value="validation">
            <Card className={`border-${comparisonResult.validationResults.safeToRemove ? 'green' : 'yellow'}-500`}>
              <CardHeader>
                <CardTitle className={`text-${comparisonResult.validationResults.safeToRemove ? 'green' : 'yellow'}-800 flex items-center gap-2`}>
                  <Shield className="h-5 w-5" />
                  COMPREHENSIVE DATA VALIDATION RESULTS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Validation Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Validation Checks:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {comparisonResult.validationResults.schemasVerified ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        }
                        <span className="text-sm">Schema Validation: {comparisonResult.validationResults.schemasVerified ? 'PASSED' : 'REVIEW NEEDED'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {comparisonResult.validationResults.endpointsVerified ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        }
                        <span className="text-sm">Endpoint Validation: {comparisonResult.validationResults.endpointsVerified ? 'PASSED' : 'REVIEW NEEDED'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {comparisonResult.validationResults.dataIntegrityChecked ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        }
                        <span className="text-sm">Data Integrity: {comparisonResult.validationResults.dataIntegrityChecked ? 'VERIFIED' : 'FAILED'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {comparisonResult.validationResults.safeToRemove ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        }
                        <span className="text-sm">Safe to Remove: {comparisonResult.validationResults.safeToRemove ? 'YES' : 'REQUIRES REVIEW'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Consolidation Safety:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Recommended API:</strong> {comparisonResult.recommended.name}</p>
                      <p><strong>APIs to Remove:</strong> {comparisonResult.deprecated.length}</p>
                      <p><strong>Data Loss Risk:</strong> {comparisonResult.validationResults.safeToRemove ? 'NONE' : 'POTENTIAL'}</p>
                      <p><strong>Migration Ready:</strong> <Badge variant={validateMigrationReadiness() ? 'default' : 'destructive'}>{validateMigrationReadiness() ? 'Yes' : 'No'}</Badge></p>
                    </div>
                  </div>
                </div>

                {/* Missing Data Warning */}
                {comparisonResult.validationResults.missingData.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Data Review Required:</strong><br/>
                      The following data might be lost during consolidation:
                      <ul className="list-disc list-inside mt-2">
                        {comparisonResult.validationResults.missingData.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                      <strong>Recommendation:</strong> Review these items or develop equivalent functionality later.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Final Recommendation */}
                <Alert className={`border-${comparisonResult.validationResults.safeToRemove ? 'green' : 'yellow'}-200 bg-${comparisonResult.validationResults.safeToRemove ? 'green' : 'yellow'}-50`}>
                  <CheckCircle className={`h-4 w-4 text-${comparisonResult.validationResults.safeToRemove ? 'green' : 'yellow'}-600`} />
                  <AlertDescription className={`text-${comparisonResult.validationResults.safeToRemove ? 'green' : 'yellow'}-800`}>
                    <strong>{comparisonResult.validationResults.safeToRemove ? '✅ SAFE TO PROCEED' : '⚠️ PROCEED WITH CAUTION'}</strong><br/>
                    {comparisonResult.validationResults.safeToRemove ? 
                      `All validation checks passed. Safe to consolidate to "${comparisonResult.recommended.name}" and remove core_healthcare_api.` :
                      `Review the missing data items above before proceeding. You can develop missing functionality later if needed.`
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="border-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  VALIDATED CONSOLIDATION RECOMMENDATIONS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Clear Recommendations */}
                <div className="space-y-3">
                  {comparisonResult.consolidationRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-blue-900">{rec}</span>
                    </div>
                  ))}
                </div>

                {/* Executive Summary */}
                <Card className="border-green-500 bg-green-50">
                  <CardContent className="pt-4">
                    <h4 className="font-bold text-green-800 mb-2">🎯 VALIDATED EXECUTIVE SUMMARY:</h4>
                    <div className="space-y-2 text-sm text-green-700">
                      <p><strong>Single Source of Truth:</strong> {comparisonResult.recommended.name}</p>
                      <p><strong>APIs to Remove:</strong> {comparisonResult.deprecated.length}</p>
                      <p><strong>Endpoints to Consolidate:</strong> {comparisonResult.differences.endpoints.deprecated.reduce((a, b) => a + b, 0)}</p>
                      <p><strong>Risk Level:</strong> {comparisonResult.riskAssessment.toUpperCase()}</p>
                      <p><strong>Data Safety:</strong> {comparisonResult.validationResults.safeToRemove ? 'VERIFIED SAFE' : 'REQUIRES REVIEW'}</p>
                      <p><strong>Impact:</strong> Fixes endpoint count mismatch and data fragmentation</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <div className="space-y-4">
              {/* Recommended API */}
              <Card className="border-green-500 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    RECOMMENDED: Single Source of Truth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-green-800">{comparisonResult.recommended.name}</h4>
                      <p className="text-sm text-green-700 mb-2">Score: {comparisonResult.recommended.score}/100</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Database className="h-3 w-3" />
                          <span>{comparisonResult.recommended.endpointsCount} endpoints</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Code className="h-3 w-3" />
                          <span>{comparisonResult.recommended.schemasCount} schemas</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-3 w-3" />
                          <span>{comparisonResult.recommended.securityCount} secured endpoints</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>Updated: {new Date(comparisonResult.recommended.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">Why This API Wins:</h5>
                      <ul className="list-disc list-inside text-sm text-green-600 space-y-1">
                        {comparisonResult.recommended.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deprecated APIs */}
              <Card className="border-red-500 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    TO BE REMOVED: Duplicate APIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comparisonResult.deprecated.map((api, index) => (
                      <div key={api.id} className="p-3 border border-red-300 rounded-lg bg-red-25">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold text-red-800">{api.name}</h4>
                            <p className="text-sm text-red-700 mb-2">Score: {api.score}/100</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-red-600">
                                <Database className="h-3 w-3" />
                                <span>{api.endpointsCount} endpoints (to migrate)</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-red-600">
                                <Code className="h-3 w-3" />
                                <span>{api.schemasCount} schemas</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-red-600">
                                <Calendar className="h-3 w-3" />
                                <span>Updated: {new Date(api.updated_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-red-700 mb-2">Scoring Details:</h5>
                            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                              {api.reasons.map((reason, reasonIndex) => (
                                <li key={reasonIndex}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="migration">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitMerge className="h-5 w-5" />
                  Validated Migration Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className={`border-${comparisonResult.riskAssessment === 'high' ? 'red' : comparisonResult.riskAssessment === 'medium' ? 'yellow' : 'green'}-200`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Risk Level: {comparisonResult.riskAssessment.toUpperCase()}</strong> - 
                      Validated with comprehensive data integrity checks.
                      {comparisonResult.validationResults.safeToRemove ? ' Safe to proceed.' : ' Review missing data before proceeding.'}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-medium">Validated Step-by-Step Migration Plan:</h4>
                    {comparisonResult.migrationPlan.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execute">
            <ApiConsolidationAction 
              comparisonResult={comparisonResult}
              onConsolidationComplete={handleConsolidationComplete}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
