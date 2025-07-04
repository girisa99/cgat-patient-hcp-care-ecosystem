
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Shield, Code, Database } from 'lucide-react';
import { useMasterConsolidationValidator } from '@/hooks/useMasterConsolidationValidator';
import { useMasterToast } from '@/hooks/useMasterToast';

export const MasterConsolidationComplianceDashboard: React.FC = () => {
  const consolidationValidator = useMasterConsolidationValidator();
  const { showSuccess, showInfo } = useMasterToast();
  
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  console.log('🎯 Master Consolidation Compliance Dashboard - Single Source Validation Active');

  const runComplianceValidation = async () => {
    setIsValidating(true);
    
    try {
      const report = consolidationValidator.validateMasterConsolidation();
      
      if (report.overallCompliance >= 95) {
        showSuccess(
          '🎉 Excellent Master Consolidation',
          `Compliance: ${report.overallCompliance}%. Single source of truth achieved.`
        );
      } else {
        showInfo(
          'Consolidation Progress',
          `Current compliance: ${report.overallCompliance}%`
        );
      }
      
      setLastValidation(new Date());
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-run validation on component mount
  useEffect(() => {
    runComplianceValidation();
  }, []);

  const report = consolidationValidator.validateMasterConsolidation();
  const consolidationPlan = consolidationValidator.generateConsolidationPlan();

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
              {getScoreIcon(report.overallCompliance)}
              <span>Master Consolidation Compliance</span>
            </div>
            <Button 
              onClick={runComplianceValidation}
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
            {/* Overall Compliance */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold ${getScoreColor(report.overallCompliance)}`}>
                  {report.overallCompliance}%
                </div>
                <div className="text-sm text-gray-600">Overall Compliance</div>
                <Badge variant={report.overallCompliance >= 95 ? 'default' : 'secondary'}>
                  {report.singleSourceCompliant ? 'Single Source' : 'Multiple Sources'}
                </Badge>
              </CardContent>
            </Card>

            {/* TypeScript Alignment */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${report.typeScriptAligned ? 'text-green-600' : 'text-red-600'}`}>
                  {report.typeScriptAligned ? '✅' : '❌'}
                </div>
                <div className="text-sm text-gray-600">TypeScript Aligned</div>
                <div className="text-xs text-gray-500 mt-1">
                  Master Hooks: {report.masterHooksActive.length}
                </div>
              </CardContent>
            </Card>

            {/* Validations Passed */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {report.validationsPassed}
                </div>
                <div className="text-sm text-gray-600">Validations Passed</div>
                <div className="text-xs text-gray-500 mt-1">
                  Registry: {report.registryEntries} entries
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Learning */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${report.knowledgeLearningActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {report.knowledgeLearningActive ? '🧠' : '💤'}
                </div>
                <div className="text-sm text-gray-600">Knowledge Learning</div>
                <div className="text-xs text-gray-500 mt-1">
                  {report.knowledgeLearningActive ? 'Active' : 'Inactive'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Master Hooks Status */}
          <div className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Active Master Hooks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {report.masterHooksActive.map((hookName) => (
                    <Badge key={hookName} variant="default" className="text-xs">
                      {hookName}
                    </Badge>
                  ))}
                </div>
                {report.masterHooksActive.length === 0 && (
                  <p className="text-sm text-gray-500">No master hooks detected</p>
                )}
              </CardContent>
            </Card>

            {/* Consolidation Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Consolidation Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Status:</span>
                    <Badge variant="outline">{consolidationPlan.currentStatus}</Badge>
                  </div>
                  <div className="text-sm">
                    <strong>Next Steps:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {consolidationPlan.nextSteps.map((step, index) => (
                        <li key={index} className="text-xs text-gray-600">{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {report.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* System Meta Information */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">System Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Validator Version</div>
                  <div className="text-muted-foreground">{consolidationValidator.meta.validatorVersion}</div>
                </div>
                <div>
                  <div className="font-medium">Architecture</div>
                  <div className="text-muted-foreground">{consolidationValidator.meta.architectureType}</div>
                </div>
                <div>
                  <div className="font-medium">Single Source</div>
                  <div className="text-green-600">
                    {consolidationValidator.meta.singleSourceValidated ? '✅ Validated' : '❌ Invalid'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Last Validated</div>
                  <div className="text-muted-foreground">
                    {lastValidation ? lastValidation.toLocaleTimeString() : 'Never'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
