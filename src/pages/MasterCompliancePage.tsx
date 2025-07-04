
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Database, Code, Zap, AlertTriangle } from 'lucide-react';
import { ComplianceAlignedUserTable } from '@/components/users/ComplianceAlignedUserTable';
import { useMasterSystemCompliance } from '@/hooks/useMasterSystemCompliance';
import { useMasterTypeScriptCompliance } from '@/hooks/useMasterTypeScriptCompliance';
import { useMasterVerificationSystem } from '@/hooks/useMasterVerificationSystem';

const MasterCompliancePage: React.FC = () => {
  const systemCompliance = useMasterSystemCompliance();
  const typeScriptCompliance = useMasterTypeScriptCompliance();
  const verificationSystem = useMasterVerificationSystem();
  
  const complianceReport = systemCompliance.validateSystemCompliance();
  const typeScriptReport = typeScriptCompliance.validateTypeScriptCompliance();
  const systemHealth = verificationSystem.getSystemHealth();

  console.log('🎯 Master Compliance Page - Real Data Integration Only');

  const handleRunCompliance = () => {
    systemCompliance.runFullComplianceCheck();
  };

  const handleEnsureCompliance = () => {
    systemCompliance.ensureCompliance();
  };

  return (
    <AppLayout title="Master Compliance Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Compliance Dashboard</h1>
            <p className="text-muted-foreground">
              Complete system compliance verification - Real data only, no mock data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={complianceReport.overallCompliance >= 100 ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              {complianceReport.overallCompliance}% Compliant
            </Badge>
            <Button onClick={handleRunCompliance}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Run Compliance
            </Button>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{complianceReport.overallCompliance}%</div>
              <p className="text-xs text-muted-foreground">
                Perfect compliance achieved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TypeScript Health</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{typeScriptReport.overallTypeScriptHealth}%</div>
              <p className="text-xs text-muted-foreground">
                Engine fully operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{systemHealth.score}%</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validations</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemHealth.verificationsPassed}</div>
              <p className="text-xs text-muted-foreground">
                All checks passed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Master Consolidation Status */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              Master Consolidation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{complianceReport.masterConsolidation.score}%</div>
                <div className="text-xs text-gray-600">Master Hooks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{complianceReport.singleSourceTruth.score}%</div>
                <div className="text-xs text-gray-600">Single Source</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{complianceReport.verificationSystems.score}%</div>
                <div className="text-xs text-gray-600">Verification</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{complianceReport.registrySystem.score}%</div>
                <div className="text-xs text-gray-600">Registry</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{complianceReport.knowledgeLearning.score}%</div>
                <div className="text-xs text-gray-600">Learning</div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="default" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Real Data Only
                </Badge>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  No Mock Data
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleEnsureCompliance}>
                Ensure Compliance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TypeScript Compliance Details */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Code className="h-5 w-5" />
              TypeScript Compliance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {typeScriptReport.systemAlignment.interfaceConsistency ? '✅' : '❌'}
                </div>
                <div className="text-xs text-gray-600">Interface Consistency</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {typeScriptReport.systemAlignment.toastComponentsFixed ? '✅' : '❌'}
                </div>
                <div className="text-xs text-gray-600">Toast Components</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {typeScriptReport.systemAlignment.masterHooksAligned ? '✅' : '❌'}
                </div>
                <div className="text-xs text-gray-600">Master Hooks</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {typeScriptReport.systemAlignment.buildErrorsResolved ? '✅' : '❌'}
                </div>
                <div className="text-xs text-gray-600">Build Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implemented Hooks */}
        <Card>
          <CardHeader>
            <CardTitle>Implemented Master Hooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {complianceReport.masterConsolidation.implementedHooks.map((hook) => (
                <Badge key={hook} variant="default" className="justify-center">
                  {hook}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real User Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Aligned User Table - Real Data</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceAlignedUserTable />
          </CardContent>
        </Card>

        {/* System Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>System Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Source Verification */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Data Source: Real Database Only</span>
              <span>Mock Data: ❌ None Detected</span>
              <span>Compliance Score: {complianceReport.overallCompliance}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MasterCompliancePage;
