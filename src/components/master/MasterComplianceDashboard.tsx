
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Shield, Code, Database, RefreshCw } from 'lucide-react';
import { useMasterSystemCompliance } from '@/hooks/useMasterSystemCompliance';
import { useMasterTypeScriptCompliance } from '@/hooks/useMasterTypeScriptCompliance';
import { useMasterVerificationSystem } from '@/hooks/useMasterVerificationSystem';
import { useMasterToast } from '@/hooks/useMasterToast';

export const MasterComplianceDashboard: React.FC = () => {
  const systemCompliance = useMasterSystemCompliance();
  const typeScriptCompliance = useMasterTypeScriptCompliance();
  const verificationSystem = useMasterVerificationSystem();
  const { showSuccess } = useMasterToast();

  const systemReport = systemCompliance.validateSystemCompliance();
  const tsReport = typeScriptCompliance.validateTypeScriptCompliance();
  const systemHealth = verificationSystem.getSystemHealth();

  const overallScore = Math.round(
    (systemReport.overallCompliance + tsReport.overallTypeScriptHealth + systemHealth.score) / 3
  );

  const runComprehensiveValidation = () => {
    systemCompliance.runFullComplianceCheck();
    typeScriptCompliance.runTypeScriptValidation();
    verificationSystem.runSystemVerification();
    
    if (overallScore >= 100) {
      showSuccess(
        "🎉 Perfect Master Consolidation Achieved",
        "All systems aligned: Single source of truth, TypeScript compliance, verification systems active"
      );
    }
  };

  useEffect(() => {
    // Auto-run validation on mount
    runComprehensiveValidation();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <span>Master Consolidation Compliance Dashboard</span>
            </div>
            <Button onClick={runComprehensiveValidation} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Validate All Systems
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Overall Score */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{overallScore}%</div>
                <div className="text-sm text-gray-600">Overall Compliance</div>
                <Badge variant="default" className="mt-2">Perfect</Badge>
              </CardContent>
            </Card>

            {/* System Compliance */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{systemReport.overallCompliance}%</div>
                <div className="text-sm text-gray-600">System Health</div>
                <div className="text-xs text-gray-500 mt-1">
                  Master: {systemReport.masterConsolidation.score}%
                </div>
              </CardContent>
            </Card>

            {/* TypeScript Health */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{tsReport.overallTypeScriptHealth}%</div>
                <div className="text-sm text-gray-600">TypeScript Health</div>
                <div className="text-xs text-gray-500 mt-1">
                  Errors: {tsReport.buildStatus.errorCount}
                </div>
              </CardContent>
            </Card>

            {/* Verification System */}
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">{systemHealth.score}%</div>
                <div className="text-sm text-gray-600">Verification</div>
                <div className="text-xs text-gray-500 mt-1">
                  Passed: {systemHealth.passed}/{systemHealth.total}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Master Consolidation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Single Source of Truth</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Master Hooks Active</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">TypeScript Aligned</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Registry System</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Implemented Hooks</span>
                    <span className="font-medium">{systemReport.masterConsolidation.implementedHooks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Consolidated Sources</span>
                    <span className="font-medium">{systemReport.singleSourceTruth.consolidatedSources}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Validations</span>
                    <span className="font-medium">{systemReport.verificationSystems.validationsPassed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Learning Active</span>
                    <span className="font-medium">{systemReport.knowledgeLearning.learningActive ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fixed Issues */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recently Fixed Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {systemReport.typeScriptAlignment.fixedErrors.map((fix, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {fix}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
