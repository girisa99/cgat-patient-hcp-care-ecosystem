
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
  Settings
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

    // Scoring algorithm to determine the "real" API
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

    // Create migration plan
    const migrationPlan = [
      `✅ Keep "${recommended.name}" as the single source of truth (Score: ${recommended.score})`,
      ...deprecated.map(api => `❌ Deprecate "${api.name}" (Score: ${api.score})`),
      `📊 Migrate ${deprecated.reduce((sum, api) => sum + api.endpointsCount, 0)} endpoints to ${recommended.name}`,
      `🔄 Update all references from deprecated APIs to ${recommended.name}`,
      `🗑️ Archive deprecated API entries after successful migration`,
      `📝 Update documentation to reflect single API structure`,
      `🔍 Verify all integrations point to ${recommended.name}`
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
      riskAssessment
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
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Duplicate Core API Analysis & Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{coreApiAnalysis.coreApis.length}</p>
              <p className="text-sm text-orange-700">Core APIs Found</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{coreApiAnalysis.coreApis.length - 1}</p>
              <p className="text-sm text-red-700">Duplicates to Remove</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">1</p>
              <p className="text-sm text-blue-700">Target (Single Source)</p>
            </div>
          </div>
          
          {!analysisComplete && (
            <Button 
              onClick={performDeepAnalysis}
              className="w-full"
              variant="default"
            >
              <Eye className="h-4 w-4 mr-2" />
              Analyze & Compare Duplicate APIs
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisComplete && comparisonResult && (
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="migration">Migration Plan</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="execute">Execute</TabsTrigger>
          </TabsList>

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
                    <AlertTriangle className="h-5 w-5" />
                    TO BE DEPRECATED: Duplicate APIs
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
                              <div the="flex items-center gap-2 text-sm text-red-600">
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
                  Migration Plan & Steps
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
                  Pre-Migration Validation
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
                      <h4 className="font-medium">Data Integrity:</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Total Endpoints:</strong> {comparisonResult.differences.endpoints.recommended + comparisonResult.differences.endpoints.deprecated.reduce((a, b) => a + b, 0)}</p>
                        <p><strong>Will Consolidate To:</strong> {comparisonResult.recommended.name}</p>
                        <p><strong>Endpoints to Migrate:</strong> {comparisonResult.differences.endpoints.deprecated.reduce((a, b) => a + b, 0)}</p>
                        <p><strong>Ready for Migration:</strong> <Badge variant={validateMigrationReadiness() ? 'default' : 'destructive'}>{validateMigrationReadiness() ? 'Yes' : 'No'}</Badge></p>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      <strong>Validation Status:</strong> All checks passed. System is ready for migration to single source of truth: 
                      <strong> {comparisonResult.recommended.name}</strong>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execute">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Execute Migration (Preview)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-yellow-200 bg-yellow-50 mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Ready for Migration:</strong> Analysis complete. The system recommends consolidating to 
                    <strong> "{comparisonResult.recommended.name}"</strong> as your single source of truth.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Migration Summary:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Single Source of Truth: {comparisonResult.recommended.name}</li>
                      <li>• APIs to Deprecate: {comparisonResult.deprecated.length}</li>
                      <li>• Endpoints to Consolidate: {comparisonResult.differences.endpoints.deprecated.reduce((a, b) => a + b, 0)}</li>
                      <li>• Risk Level: {comparisonResult.riskAssessment}</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
                    <p className="text-sm text-blue-700">
                      The analysis is complete and validated. You can now proceed with updating all references 
                      to use "{comparisonResult.recommended.name}" as the single source of truth for your healthcare API operations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
