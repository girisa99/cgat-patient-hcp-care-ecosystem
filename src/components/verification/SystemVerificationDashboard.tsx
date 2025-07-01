
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Database, 
  Code, 
  Navigation, 
  Users,
  Settings,
  Shield,
  Activity,
  FileText,
  Download
} from 'lucide-react';
import { ComprehensiveSystemVerifier, ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';
import { useToast } from '@/hooks/use-toast';

export const SystemVerificationDashboard: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<ComprehensiveVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    // Run initial verification on mount
    runVerification();
  }, []);

  const runVerification = async () => {
    setIsVerifying(true);
    try {
      console.log('🔍 Running comprehensive system verification...');
      const result = await ComprehensiveSystemVerifier.performComprehensiveVerification('manual');
      setVerificationResult(result);
      
      toast({
        title: "✅ Verification Complete",
        description: `System Health: ${result.overallHealthScore}% - ${result.criticalIssuesFound} critical issues found`,
        variant: result.overallStatus === 'healthy' ? "default" : "destructive",
      });
    } catch (error) {
      console.error('❌ Verification failed:', error);
      toast({
        title: "❌ Verification Failed",
        description: "Failed to run system verification",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadReport = () => {
    if (!verificationResult) return;
    
    const report = ComprehensiveSystemVerifier.generateComprehensiveReport(verificationResult);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-verification-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isVerifying) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Running Comprehensive System Verification...
            </CardTitle>
            <CardDescription>
              Checking all modules, database integrity, hook consistency, and navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={50} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">
              Verifying: Patients, Users, Facilities, Modules, Onboarding, API Services...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verificationResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Verification Dashboard</CardTitle>
            <CardDescription>
              Comprehensive check of all system components after consolidation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runVerification} disabled={isVerifying}>
              <Shield className="h-4 w-4 mr-2" />
              Run System Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Overall Status */}
      <Card className={`border-2 ${getStatusColor(verificationResult.overallStatus)}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(verificationResult.overallStatus)}
              <span className="ml-2">System Health: {verificationResult.overallHealthScore}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={runVerification} disabled={isVerifying} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant={verificationResult.overallStatus === 'healthy' ? 'default' : 'destructive'}>
                {verificationResult.overallStatus.toUpperCase()}
              </Badge>
              <span>Critical Issues: {verificationResult.criticalIssuesFound}</span>
              <span>Total Issues: {verificationResult.totalActiveIssues}</span>
              <span>Sync: {verificationResult.syncStatus.replace('_', ' ').toUpperCase()}</span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{verificationResult.overallHealthScore}%</div>
                <Progress value={verificationResult.overallHealthScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{verificationResult.criticalIssuesFound}</div>
                <p className="text-xs text-muted-foreground">Issues requiring attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Stability</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {verificationResult.systemHealth.isSystemStable ? '✅' : '❌'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {verificationResult.systemHealth.isSystemStable ? 'Stable' : 'Unstable'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                <Database className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {verificationResult.syncStatus === 'fully_synced' ? '✅' : '⚠️'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {verificationResult.syncStatus.replace('_', ' ')}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(verificationResult.moduleVerification).map(([name, module]) => (
              <Card key={name} className={`border ${module.isWorking ? 'border-green-200' : 'border-red-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{name}</span>
                    {module.isWorking ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> : 
                      <XCircle className="h-5 w-5 text-red-600" />
                    }
                  </CardTitle>
                  <CardDescription>
                    Data Source: {module.dataSource}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hook Consistency</span>
                      {module.hookConsistency ? '✅' : '❌'}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Component Integrity</span>
                      {module.componentIntegrity ? '✅' : '❌'}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Connection</span>
                      {module.databaseConnection ? '✅' : '❌'}
                    </div>
                    {module.issues.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-600">Issues:</p>
                        <ul className="text-xs text-red-500 space-y-1">
                          {module.issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Database Integrity Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {verificationResult.databaseIntegrity.tablesVerified}
                  </div>
                  <p className="text-sm text-gray-600">Tables Verified</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {verificationResult.databaseIntegrity.foreignKeysValid ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">Foreign Keys</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {verificationResult.databaseIntegrity.rlsPoliciesActive ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">RLS Policies</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {verificationResult.databaseIntegrity.schemaConsistency ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">Schema Consistency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Hook Consistency Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Template Adoption</h3>
                  <Progress value={verificationResult.hookConsistency.templateAdoption} className="mt-2" />
                  <p className="text-sm text-gray-600 mt-1">
                    {verificationResult.hookConsistency.templateAdoption}% of hooks use the unified template
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Consolidated Hooks</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {verificationResult.hookConsistency.consolidatedHooks.map((hook, idx) => (
                      <Badge key={idx} variant="outline">{hook}</Badge>
                    ))}
                  </div>
                </div>

                {verificationResult.hookConsistency.duplicateHooks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-red-600">Duplicate Hooks</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {verificationResult.hookConsistency.duplicateHooks.map((hook, idx) => (
                        <Badge key={idx} variant="destructive">{hook}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="h-5 w-5 mr-2" />
                Navigation Integrity Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {verificationResult.navigationIntegrity.routesValid ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">Routes Valid</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {verificationResult.navigationIntegrity.tabsWorking ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">Tabs Working</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {verificationResult.navigationIntegrity.subTabsWorking ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">Sub-tabs Working</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {verificationResult.navigationIntegrity.breadcrumbsValid ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">Breadcrumbs Valid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Phase 2 Readiness */}
      <Card className={`border-2 ${verificationResult.overallStatus === 'healthy' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            {verificationResult.overallStatus === 'healthy' ? 
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" /> :
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            }
            Phase 2 Readiness Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verificationResult.overallStatus === 'healthy' ? (
            <div className="text-green-700">
              <p className="font-medium">🎉 System is ready for Phase 2!</p>
              <p className="text-sm mt-1">
                All modules are working correctly, database integrity is maintained, 
                hooks are consolidated, and navigation is functional.
              </p>
            </div>
          ) : (
            <div className="text-yellow-700">
              <p className="font-medium">⚠️ Issues found that should be addressed before Phase 2</p>
              <p className="text-sm mt-1">
                {verificationResult.criticalIssuesFound} critical issues and {verificationResult.totalActiveIssues} total issues detected.
                Please review the detailed reports above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
