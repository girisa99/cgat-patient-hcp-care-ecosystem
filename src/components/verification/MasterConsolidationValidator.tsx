
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { useMasterConsolidationValidator } from '@/hooks/useMasterConsolidationValidator';
import { useMasterToast } from '@/hooks/useMasterToast';

export const MasterConsolidationValidator: React.FC = () => {
  const consolidationValidator = useMasterConsolidationValidator();
  const { showSuccess, showInfo, showError } = useMasterToast();
  
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  console.log('🎯 Master Consolidation Validator - Fixed Method Signatures');

  // Fixed method calls - no parameters
  const runFullValidation = async () => {
    setIsValidating(true);
    
    try {
      const report = consolidationValidator.runConsolidationValidation();
      const ensureResult = consolidationValidator.ensureConsolidation();
      const enforceResult = consolidationValidator.enforceConsolidation();
      
      const overallScore = Math.round((report.overallCompliance + ensureResult.overallCompliance + enforceResult.overallCompliance) / 3);
      
      if (overallScore >= 95) {
        showSuccess(
          '🎉 Perfect Master Consolidation Achieved',
          `Overall Score: ${overallScore}%. All systems aligned with master consolidation principles.`
        );
      } else if (overallScore >= 85) {
        showInfo(
          'Excellent Consolidation Status',
          `Overall Score: ${overallScore}%. Minor optimizations available.`
        );
      } else {
        showError(
          'Consolidation Issues Detected',
          `Overall Score: ${overallScore}%. Critical issues require attention.`
        );
      }
      
      setLastValidation(new Date());
    } catch (error) {
      showError('Validation Failed', 'Error occurred during consolidation validation');
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-run validation on component mount
  useEffect(() => {
    runFullValidation();
  }, []);

  const report = consolidationValidator.validateConsolidation();
  const plan = consolidationValidator.createConsolidationPlan();

  const overallScore = report.overallCompliance;

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 85) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getScoreIcon(overallScore)}
              <span>Master Consolidation Validator</span>
            </div>
            <Button 
              onClick={runFullValidation}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validating...' : 'Run Validation'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Score */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </div>
                <div className="text-sm text-gray-600">Overall Compliance</div>
                <Badge variant={overallScore >= 95 ? 'default' : overallScore >= 85 ? 'secondary' : 'destructive'}>
                  {overallScore >= 95 ? 'Perfect' : overallScore >= 85 ? 'Good' : 'Needs Work'}
                </Badge>
              </CardContent>
            </Card>

            {/* Consolidated Hooks */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(report.masterHookCompliance.score)}`}>
                  {report.consolidatedHooks}
                </div>
                <div className="text-sm text-gray-600">Consolidated Hooks</div>
                <div className="text-xs text-gray-500 mt-1">
                  Total: {report.totalHooks}
                </div>
              </CardContent>
            </Card>

            {/* Single Source */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score}%
                </div>
                <div className="text-sm text-gray-600">Single Source</div>
                <div className="text-xs text-gray-500 mt-1">
                  TypeScript: {report.typeScriptAligned ? 'Aligned' : 'Issues'}
                </div>
              </CardContent>
            </Card>

            {/* Validations */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(90)}`}>
                  {report.validationsPassed}
                </div>
                <div className="text-sm text-gray-600">Validations</div>
                <div className="text-xs text-gray-500 mt-1">
                  Knowledge: {report.knowledgeLearningActive ? 'Active' : 'Inactive'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Status */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Master Hook Compliance</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Score</span>
                      <Badge variant={report.masterHookCompliance.isCompliant ? 'default' : 'destructive'}>
                        {report.masterHookCompliance.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Activated Hooks</span>
                      <span className="font-medium">{report.masterHookCompliance.activatedHooks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missing Hooks</span>
                      <span className="font-medium">{report.masterHookCompliance.missingHooks.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Consolidation Plan</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Status</span>
                      <Badge variant="default">{plan.currentStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Priority</span>
                      <Badge variant={plan.priority === 'high' ? 'destructive' : 'secondary'}>
                        {plan.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Architecture</span>
                      <span className="text-xs text-gray-500">{plan.architectureType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Registry Entries */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Registry Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {report.registryEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium text-sm">{entry.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{entry.type}</Badge>
                      <Badge variant={entry.status === 'active' ? 'default' : 'secondary'}>
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {lastValidation && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Last validation: {lastValidation.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
