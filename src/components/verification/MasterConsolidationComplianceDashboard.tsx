
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Database,
  Code,
  Layers,
  GitBranch,
  Zap,
  Target
} from 'lucide-react';
import { useMasterConsolidationCompliance } from '@/hooks/useMasterConsolidationCompliance';

export const MasterConsolidationComplianceDashboard: React.FC = () => {
  const compliance = useMasterConsolidationCompliance();
  
  const report = compliance.validateCompliance();
  const actions = compliance.generateComplianceActions(report);
  const isFullyCompliant = compliance.isFullyCompliant(report);

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 95) return 'default';
    if (score >= 80) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Overall Compliance Status */}
      <Card className={`border-2 ${isFullyCompliant ? 'border-green-500' : 'border-yellow-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isFullyCompliant ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            )}
            Master Consolidation Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-4 text-center">
            <span className={getScoreColor(report.overallScore)}>
              {report.overallScore}%
            </span>
          </div>
          <Progress value={report.overallScore} className="mb-4" />
          <div className="text-center">
            <Badge variant={getScoreBadge(report.overallScore)} className="text-lg px-4 py-2">
              {isFullyCompliant ? 'FULLY COMPLIANT' : 'NEEDS ATTENTION'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Master Hooks</span>
              </div>
              <Badge variant={getScoreBadge(report.masterHookCompliance.score)}>
                {report.masterHookCompliance.score}%
              </Badge>
            </div>
            <Progress value={report.masterHookCompliance.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Single Source</span>
              </div>
              <Badge variant={getScoreBadge(report.singleSourceCompliance.score)}>
                {report.singleSourceCompliance.score}%
              </Badge>
            </div>
            <Progress value={report.singleSourceCompliance.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">TypeScript</span>
              </div>
              <Badge variant={getScoreBadge(report.typeScriptAlignment.score)}>
                {report.typeScriptAlignment.score}%
              </Badge>
            </div>
            <Progress value={report.typeScriptAlignment.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Verification</span>
              </div>
              <Badge variant={getScoreBadge(report.verificationSystem.score)}>
                {report.verificationSystem.score}%
              </Badge>
            </div>
            <Progress value={report.verificationSystem.score} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Compliance Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Hook Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Master Hook Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Implemented Hooks</span>
                <span className="font-medium">{report.masterHookCompliance.implementedHooks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Missing Hooks</span>
                <span className="text-red-600 font-medium">{report.masterHookCompliance.missingHooks.length}</span>
              </div>
              
              {report.masterHookCompliance.implementedHooks.map((hook) => (
                <div key={hook} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{hook}</span>
                </div>
              ))}
              
              {report.masterHookCompliance.missingHooks.map((hook) => (
                <div key={hook} className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">{hook}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Single Source Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Single Source Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Consolidated Sources</span>
                <span className="text-green-600 font-medium">{report.singleSourceCompliance.consolidatedSources}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Distributed Sources</span>
                <span className="text-red-600 font-medium">{report.singleSourceCompliance.distributedSources}</span>
              </div>
              
              {report.singleSourceCompliance.violations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">Violations:</h4>
                  {report.singleSourceCompliance.violations.map((violation, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span>{violation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Validation System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Rules</span>
                <span className="font-medium">{report.validationSystem.activeRules}</span>
              </div>
              <div className="flex justify-between">
                <span>Passed Validations</span>
                <span className="text-green-600 font-medium">{report.validationSystem.passedValidations}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Validations</span>
                <span className="text-red-600 font-medium">{report.validationSystem.failedValidations}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Registry System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Components</span>
                <span className="font-medium">{report.registrySystem.registeredComponents}</span>
              </div>
              <div className="flex justify-between">
                <span>Consolidated</span>
                <span className="text-green-600 font-medium">{report.registrySystem.consolidatedEntries}</span>
              </div>
              <div className="flex justify-between">
                <span>Unconsolidated</span>
                <span className="text-red-600 font-medium">{report.registrySystem.unconsolidatedEntries}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Knowledge Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Learning Records</span>
                <span className="font-medium">{report.knowledgeLearning.learningRecords}</span>
              </div>
              <div className="flex justify-between">
                <span>Applied Corrections</span>
                <span className="text-green-600 font-medium">{report.knowledgeLearning.appliedCorrections}</span>
              </div>
              <div className="flex justify-between">
                <span>Pattern Recognition</span>
                <span className="text-blue-600 font-medium">{report.knowledgeLearning.patternRecognition}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      {actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Required Actions for Full Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Master Consolidation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={() => {
                const newReport = compliance.validateCompliance();
                console.log('🎯 Master Consolidation Compliance Report:', newReport);
              }}
            >
              Run Full Compliance Check
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                console.log('🔍 TypeScript Alignment:', compliance.typeAlignment.analyzeTypeAlignment());
              }}
            >
              Analyze TypeScript Alignment
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const learnings = compliance.verificationSystem.learnFromSystem();
                console.log('🧠 System Learning Analysis:', learnings);
              }}
            >
              Generate Learning Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
