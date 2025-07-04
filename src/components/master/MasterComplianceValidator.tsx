
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { useMasterTypeScriptCompliance } from '@/hooks/useMasterTypeScriptCompliance';
import { useMasterSystemCompliance } from '@/hooks/useMasterSystemCompliance';
import { useMasterVerificationSystem } from '@/hooks/useMasterVerificationSystem';
import { useMasterToast } from '@/hooks/useMasterToast';

export const MasterComplianceValidator: React.FC = () => {
  const typeScriptCompliance = useMasterTypeScriptCompliance();
  const systemCompliance = useMasterSystemCompliance();
  const verificationSystem = useMasterVerificationSystem();
  const { showSuccess, showInfo, showError } = useMasterToast();
  
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  console.log('🎯 Master Compliance Validator - Ensuring Single Source of Truth & TypeScript Alignment');

  const runFullValidation = async () => {
    setIsValidating(true);
    
    try {
      // Run comprehensive validation across all systems
      const tsReport = typeScriptCompliance.runTypeScriptValidation();
      const systemReport = systemCompliance.runFullComplianceCheck();
      await verificationSystem.runSystemVerification();
      
      const overallScore = Math.round((tsReport.overallTypeScriptHealth + systemReport.overallCompliance) / 2);
      
      if (overallScore >= 95) {
        showSuccess(
          '🎉 Perfect Master Compliance Achieved',
          `Overall Score: ${overallScore}%. All systems aligned with master consolidation principles.`
        );
      } else if (overallScore >= 85) {
        showInfo(
          'Excellent Compliance Status',
          `Overall Score: ${overallScore}%. Minor optimizations available.`
        );
      } else {
        showError(
          'Compliance Issues Detected',
          `Overall Score: ${overallScore}%. Critical issues require attention.`
        );
      }
      
      setLastValidation(new Date());
    } catch (error) {
      showError('Validation Failed', 'Error occurred during compliance validation');
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-run validation on component mount
  useEffect(() => {
    runFullValidation();
  }, []);

  const tsReport = typeScriptCompliance.validateTypeScriptCompliance();
  const systemReport = systemCompliance.validateSystemCompliance();
  const systemHealth = verificationSystem.getSystemHealth();
  const registryStats = verificationSystem.getRegistryStats();

  const overallScore = Math.round((tsReport.overallTypeScriptHealth + systemReport.overallCompliance) / 2);

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
              <span>Master Compliance Status</span>
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

            {/* TypeScript Compliance */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(tsReport.overallTypeScriptHealth)}`}>
                  {tsReport.overallTypeScriptHealth}%
                </div>
                <div className="text-sm text-gray-600">TypeScript Health</div>
                <div className="text-xs text-gray-500 mt-1">
                  Build: {tsReport.buildStatus.hasErrors ? 'Issues' : 'Clean'}
                </div>
              </CardContent>
            </Card>

            {/* System Compliance */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(systemReport.overallCompliance)}`}>
                  {systemReport.overallCompliance}%
                </div>
                <div className="text-sm text-gray-600">System Health</div>
                <div className="text-xs text-gray-500 mt-1">
                  Registry: {registryStats.consolidationRate}%
                </div>
              </CardContent>
            </Card>

            {/* Verification System */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(systemHealth.score)}`}>
                  {systemHealth.score}%
                </div>
                <div className="text-sm text-gray-600">Verification</div>
                <div className="text-xs text-gray-500 mt-1">
                  Entries: {registryStats.totalEntries}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Status */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">TypeScript Validation Results</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Master Hooks Aligned</span>
                      {tsReport.validationResults.masterHooksAligned ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">UI Components Fixed</span>
                      {tsReport.validationResults.uiComponentsFixed ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Build Errors Resolved</span>
                      {tsReport.validationResults.buildErrorsResolved ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Compliance Results</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Single Source Truth</span>
                      {systemReport.singleSourceTruth.isCompliant ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Master Consolidation</span>
                      {systemReport.masterConsolidation.isCompliant ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Registry System</span>
                      {systemReport.registrySystem.score >= 95 ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

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
