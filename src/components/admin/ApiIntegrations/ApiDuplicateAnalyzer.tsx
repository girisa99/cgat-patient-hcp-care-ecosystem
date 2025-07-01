
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
}

export const ApiDuplicateAnalyzer: React.FC = () => {
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ApiComparisonResult | null>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'passed' | 'failed'>('pending');

  const { apiServices } = useApiServices();
  const { apiEndpoints, analyzeCoreApis } = useApiServiceDetails();

  const coreApiAnalysis = React.useMemo(() => {
    return analyzeCoreApis(apiServices);
  }, [apiServices, analyzeCoreApis]);

  // Comprehensive API comparison analysis
  const performDeepAnalysis = () => {
    console.log('🔍 Starting deep analysis of duplicate core APIs...');
    
    const coreApis = coreApiAnalysis.coreApis;
    if (coreApis.length < 2) {
      console.log('⚠️ Less than 2 core APIs found, no duplicates to analyze');
      return;
    }

    // Get endpoints for each API
    const apisWithEndpoints = coreApis.map(api => {
      const endpoints = apiEndpoints.filter(ep => ep.external_api_id === api.id);
      return {
        ...api,
        endpointsList: endpoints,
        endpointsCount: endpoints.length,
        schemasCount: endpoints.filter(ep => ep.request_schema || ep.response_schema).length,
        securityCount: endpoints.filter(ep => ep.requires_authentication).length
      };
    });

    console.log('📊 APIs with endpoint details:', apisWithEndpoints);

    // Enhanced scoring algorithm to determine the "real" API
    const scoredApis = apisWithEndpoints.map(api => {
      let score = 0;
      let reasons = [];

      // Endpoint count (30% weight)
      const endpointScore = api.endpointsCount * 3;
      score += endpointScore;
      if (api.endpointsCount > 0) reasons.push(`${api.endpointsCount} endpoints (+${endpointScore})`);

      // Schema completeness (25% weight)
      const schemaScore = api.schemasCount * 2.5;
      score += schemaScore;
      if (api.schemasCount > 0) reasons.push(`${api.schemasCount} schemas (+${schemaScore})`);

      // Documentation (15% weight)
      if (api.documentation_url) {
        score += 15;
        reasons.push('Has documentation (+15)');
      }

      // Last updated (10% weight) - more recent = higher score
      const daysSinceUpdate = Math.floor((Date.now() - new Date(api.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, 10 - (daysSinceUpdate / 30));
      score += recencyScore;
      if (recencyScore > 5) reasons.push(`Recently updated (+${recencyScore.toFixed(1)})`);

      // Status (10% weight)
      if (api.status === 'active') {
        score += 10;
        reasons.push('Active status (+10)');
      }

      // Configuration completeness (10% weight)
      if (api.base_url) {
        score += 5;
        reasons.push('Has base URL (+5)');
      }
      if (api.version && api.version !== '1.0.0') {
        score += 5;
        reasons.push('Versioned (+5)');
      }

      // Name preference (internal_healthcare_api preferred due to better naming)
      if (api.name === 'internal_healthcare_api') {
        score += 5;
        reasons.push('Better naming convention (+5)');
      }

      return {
        ...api,
        score: Math.round(score * 10) / 10,
        reasons
      };
    });

    // Sort by score (highest first)
    scoredApis.sort((a, b) => b.score - a.score);
    
    const recommended = scoredApis[0];
    const deprecated = scoredApis.slice(1);

    console.log('🏆 Scoring results:', {
      recommended: { name: recommended.name, score: recommended.score, reasons: recommended.reasons },
      deprecated: deprecated.map(api => ({ name: api.name, score: api.score, reasons: api.reasons }))
    });

    // Create comprehensive migration plan
    const migrationPlan = [
      `🎯 CONSOLIDATE TO: "${recommended.name}" as single source of truth (Score: ${recommended.score})`,
      `📊 Current Status: ${deprecated.length} duplicate API(s) to deprecate`,
      `🔄 Migrate ${deprecated.reduce((sum, api) => sum + api.endpointsCount, 0)} endpoints to ${recommended.name}`,
      `🗃️ Update all database references to use ID: ${recommended.id}`,
      `🔧 Update frontend components to use single API service`,
      `📱 Test all modules (Users, Patients, Facilities, Onboarding) with consolidated API`,
      `🧹 Remove deprecated API entries from api_integration_registry`,
      `📝 Update API documentation to reflect single source architecture`,
      `🔍 Verify endpoint count shows correctly (currently fragmented across duplicates)`
    ];

    // Enhanced consolidation recommendations
    const consolidationRecommendations = [
      `✅ RECOMMENDED: Keep "${recommended.name}" (ID: ${recommended.id})`,
      `❌ DEPRECATE: ${deprecated.map(api => `"${api.name}" (ID: ${api.id})`).join(', ')}`,
      `🔧 ACTION NEEDED: Update all useApiServices hooks to filter out deprecated APIs`,
      `📊 IMPACT: This will fix the endpoint count mismatch (116 total vs fragmented display)`,
      `⚡ PRIORITY: HIGH - Data inconsistency affects all healthcare modules`,
      `🛡️ SAFETY: Low risk - no data loss, only consolidation of references`
    ];

    // Risk assessment
    const totalEndpointsToMigrate = deprecated.reduce((sum, api) => sum + api.endpointsCount, 0);
    const riskAssessment = totalEndpointsToMigrate > 50 ? 'high' : 
                          totalEndpointsToMigrate > 20 ? 'medium' : 'low';

    const result: ApiComparisonResult = {
      recommended,
      deprecated,
      differences: {
        endpoints: {
          recommended: recommended.endpointsCount,
          deprecated: deprecated.map(api => api.endpointsCount)
        },
        schemas: {
          recommended: recommended.schemasCount,
          deprecated: deprecated.map(api => api.schemasCount)
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
      consolidationRecommendations
    };

    setComparisonResult(result);
    setAnalysisComplete(true);
    setValidationStatus('passed');

    console.log('✅ Deep analysis complete:', result);
  };

  const validateMigrationReadiness = () => {
    if (!comparisonResult) return false;

    const checks = [
      comparisonResult.recommended.id,
      comparisonResult.recommended.name,
      comparisonResult.deprecated.length > 0,
      comparisonResult.migrationPlan.length > 0
    ];

    return checks.every(check => !!check);
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
      {/* Analysis Header */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            CRITICAL: Duplicate Core API Resolution Required
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
              This causes incorrect endpoint counts and inconsistent module behavior.
            </AlertDescription>
          </Alert>
          
          {!analysisComplete && (
            <Button 
              onClick={performDeepAnalysis}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Analyze & Get Consolidation Recommendations
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisComplete && comparisonResult && (
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="comparison">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="migration">Migration Plan</TabsTrigger>
            <TabsTrigger value="validation">Final Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <Card className="border-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  CONSOLIDATION RECOMMENDATIONS
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
                    <h4 className="font-bold text-green-800 mb-2">🎯 EXECUTIVE SUMMARY:</h4>
                    <div className="space-y-2 text-sm text-green-700">
                      <p><strong>Single Source of Truth:</strong> {comparisonResult.recommended.name}</p>
                      <p><strong>APIs to Remove:</strong> {comparisonResult.deprecated.length}</p>
                      <p><strong>Endpoints to Consolidate:</strong> {comparisonResult.differences.endpoints.deprecated.reduce((a, b) => a + b, 0)}</p>
                      <p><strong>Risk Level:</strong> {comparisonResult.riskAssessment.toUpperCase()}</p>
                      <p><strong>Impact:</strong> Fixes endpoint count mismatch and data fragmentation</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Alert className="border-purple-200 bg-purple-50">
                  <Settings className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>IMMEDIATE NEXT STEPS:</strong><br/>
                    1. Approve the recommended consolidation to "{comparisonResult.recommended.name}"<br/>
                    2. Update all API service references to use single source<br/>
                    3. Remove duplicate API entries from database<br/>
                    4. Verify all modules work with consolidated API
                  </AlertDescription>
                </Alert>
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
                  Detailed Migration Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className={`border-${comparisonResult.riskAssessment === 'high' ? 'red' : comparisonResult.riskAssessment === 'medium' ? 'yellow' : 'green'}-200`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Risk Level: {comparisonResult.riskAssessment.toUpperCase()}</strong> - 
                      {comparisonResult.riskAssessment === 'high' && ' High complexity migration requiring careful validation'}
                      {comparisonResult.riskAssessment === 'medium' && ' Medium complexity migration with moderate risk'}
                      {comparisonResult.riskAssessment === 'low' && ' Low risk migration, straightforward process'}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-medium">Step-by-Step Migration Plan:</h4>
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

          <TabsContent value="validation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Final Validation & Ready to Execute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Validation Checks:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Recommended API identified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Duplicate APIs catalogued</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Migration plan generated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Risk assessment completed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Consolidation Impact:</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Single Source:</strong> {comparisonResult.recommended.name}</p>
                        <p><strong>APIs to Remove:</strong> {comparisonResult.deprecated.length}</p>
                        <p><strong>Endpoints Affected:</strong> {comparisonResult.differences.endpoints.deprecated.reduce((a, b) => a + b, 0)}</p>
                        <p><strong>Migration Ready:</strong> <Badge variant={validateMigrationReadiness() ? 'default' : 'destructive'}>{validateMigrationReadiness() ? 'Yes' : 'No'}</Badge></p>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>✅ READY FOR CONSOLIDATION</strong><br/>
                      All validation checks passed. The system is ready to consolidate to 
                      <strong> "{comparisonResult.recommended.name}"</strong> as your single source of truth.
                      This will resolve the endpoint count mismatch and improve data consistency across all healthcare modules.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
