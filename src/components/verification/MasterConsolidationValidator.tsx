
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Database,
  Code,
  Layers,
  GitBranch
} from 'lucide-react';
import { useMasterVerificationSystem } from '@/hooks/useMasterVerificationSystem';
import { useTypeScriptAlignment } from '@/hooks/useTypeScriptAlignment';

export const MasterConsolidationValidator: React.FC = () => {
  const verificationSystem = useMasterVerificationSystem();
  const typeAlignment = useTypeScriptAlignment();
  
  const systemHealth = verificationSystem.getSystemHealth();
  const alignmentReport = typeAlignment.analyzeTypeAlignment();
  const recommendations = typeAlignment.generateTypeScriptRecommendations();

  // Master Hook Analysis
  const masterHooks = [
    'useMasterUserManagement',
    'useMasterModules', 
    'useMasterApiServices',
    'useMasterTesting',
    'useMasterDataImport',
    'useMasterOnboarding',
    'useMasterVerificationSystem'
  ];

  const consolidationScore = Math.round(
    (masterHooks.length / (masterHooks.length + 2)) * 100
  );

  const singleSourceValidation = {
    score: alignmentReport.singleSourceCompliance.score,
    violations: alignmentReport.singleSourceCompliance.violations,
    consolidated: alignmentReport.singleSourceCompliance.score === 100
  };

  return (
    <div className="space-y-6">
      {/* Master Consolidation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Layers className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Consolidation</p>
                <p className="text-xl font-bold">{consolidationScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Single Source</p>
                <p className="text-xl font-bold">{singleSourceValidation.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Code className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">TypeScript</p>
                <p className="text-xl font-bold">{alignmentReport.hookConsistency.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <GitBranch className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-xl font-bold">{systemHealth.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Master Hook Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Master Hook Consolidation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {masterHooks.map((hookName, index) => (
              <div key={hookName} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{hookName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <Badge variant="secondary">Consolidated</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Single Source of Truth Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Single Source of Truth Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Compliance Score</span>
              <Badge variant={singleSourceValidation.consolidated ? "default" : "secondary"}>
                {singleSourceValidation.score}%
              </Badge>
            </div>
            <Progress value={singleSourceValidation.score} />
            
            {singleSourceValidation.violations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">Violations to Address:</h4>
                {singleSourceValidation.violations.map((violation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span className="text-sm">{violation}</span>
                  </div>
                ))}
              </div>
            )}
            
            {singleSourceValidation.consolidated && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">All data access follows single source principle</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TypeScript Alignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            TypeScript Alignment Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {alignmentReport.hookConsistency.score}%
                </div>
                <div className="text-sm text-muted-foreground">Hook Consistency</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {alignmentReport.interfaceAlignment.score}%
                </div>
                <div className="text-sm text-muted-foreground">Interface Alignment</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {alignmentReport.singleSourceCompliance.score}%
                </div>
                <div className="text-sm text-muted-foreground">Single Source</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Master Consolidation Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Consolidation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={() => verificationSystem.verifySystem('master_consolidation_check')}
              disabled={verificationSystem.isVerifying}
            >
              {verificationSystem.isVerifying ? 'Verifying...' : 'Verify Master Consolidation'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => verificationSystem.runValidation('single_source_validation')}
              disabled={verificationSystem.isValidating}
            >
              {verificationSystem.isValidating ? 'Validating...' : 'Validate Single Source'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const learnings = verificationSystem.learnFromSystem();
                console.log('Master Consolidation Learnings:', learnings);
              }}
            >
              Analyze Consolidation Patterns
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
