
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  Shield,
  Database,
  Code2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useMasterVerificationSystem } from '@/hooks/useMasterVerificationSystem';
import { useMasterConsolidationCompliance } from '@/hooks/useMasterConsolidationCompliance';
import { useMasterTypeScriptCompliance } from '@/hooks/useMasterTypeScriptCompliance';

export const SystemVerificationDashboard: React.FC = () => {
  const verificationSystem = useMasterVerificationSystem();
  const consolidationCompliance = useMasterConsolidationCompliance();
  const typeScriptCompliance = useMasterTypeScriptCompliance();
  
  const compliance = consolidationCompliance.validateCompliance();
  const tsCompliance = typeScriptCompliance.validateTypeScriptCompliance();
  const systemHealth = verificationSystem.getSystemHealth();
  const registryStats = verificationSystem.getRegistryStats();

  const handleRunVerification = () => {
    verificationSystem.runSystemVerification();
    consolidationCompliance.runComplianceCheck();
    typeScriptCompliance.runTypeScriptValidation();
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 95) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Verification Dashboard</h1>
          <p className="text-muted-foreground">
            Master consolidation compliance and TypeScript alignment monitoring
          </p>
        </div>
        <Button onClick={handleRunVerification} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Run Verification
        </Button>
      </div>

      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${getScoreBg(compliance.overallScore)}`}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Master Compliance</p>
                <div className={`text-2xl font-bold ${getScoreColor(compliance.overallScore)}`}>
                  {compliance.overallScore}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${getScoreBg(tsCompliance.overallTypeScriptHealth)}`}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Code2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">TypeScript Health</p>
                <div className={`text-2xl font-bold ${getScoreColor(tsCompliance.overallTypeScriptHealth)}`}>
                  {tsCompliance.overallTypeScriptHealth}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${getScoreBg(systemHealth.score)}`}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <div className={`text-2xl font-bold ${getScoreColor(systemHealth.score)}`}>
                  {systemHealth.score}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${getScoreBg(registryStats.consolidationRate)}`}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Consolidation</p>
                <div className={`text-2xl font-bold ${getScoreColor(registryStats.consolidationRate)}`}>
                  {registryStats.consolidationRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Hook Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Master Hook Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Overall Score</span>
                <Badge variant={compliance.masterHookCompliance.score >= 95 ? "default" : "secondary"}>
                  {compliance.masterHookCompliance.score}%
                </Badge>
              </div>
              <Progress value={compliance.masterHookCompliance.score} className="w-full" />
              
              <div className="space-y-2">
                <h4 className="font-medium">Implemented Hooks</h4>
                {compliance.masterHookCompliance.implementedHooks.map((hook, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {hook}
                  </div>
                ))}
              </div>
              
              {compliance.masterHookCompliance.missingHooks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">Missing Hooks</h4>
                  {compliance.masterHookCompliance.missingHooks.map((hook, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      {hook}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TypeScript Alignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              TypeScript Alignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Health Score</span>
                <Badge variant={tsCompliance.overallTypeScriptHealth >= 95 ? "default" : "secondary"}>
                  {tsCompliance.overallTypeScriptHealth}%
                </Badge>
              </div>
              <Progress value={tsCompliance.overallTypeScriptHealth} className="w-full" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Build Errors</span>
                  <div className="font-medium">{tsCompliance.buildStatus.errorCount}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Interface Consistency</span>
                  <div className="font-medium">
                    {tsCompliance.validationResults.interfaceConsistency ? '✅' : '❌'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Validation Results</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Master Hooks Aligned</span>
                    <span>{tsCompliance.validationResults.masterHooksAligned ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UI Components Fixed</span>
                    <span>{tsCompliance.validationResults.uiComponentsFixed ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Build Errors Resolved</span>
                    <span>{tsCompliance.validationResults.buildErrorsResolved ? '✅' : '❌'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registry Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Component Registry Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{registryStats.totalEntries}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{registryStats.consolidatedHooks}</div>
              <div className="text-sm text-muted-foreground">Consolidated Hooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{registryStats.consolidationRate}%</div>
              <div className="text-sm text-muted-foreground">Consolidation Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Health Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemHealth.passed}</div>
              <div className="text-sm text-muted-foreground">Passed Checks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{systemHealth.failed}</div>
              <div className="text-sm text-muted-foreground">Failed Checks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemHealth.total}</div>
              <div className="text-sm text-muted-foreground">Total Checks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {tsCompliance.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tsCompliance.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
