import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useComprehensiveVerification } from '@/hooks/useComprehensiveVerification';
import ComprehensiveVerificationHeader from './ComprehensiveVerificationHeader';
import { Shield, Database, CheckCircle, AlertTriangle, Clock, Zap, Code, Navigation } from 'lucide-react';

export const SystemVerificationDashboard: React.FC = () => {
  const {
    verificationResult,
    isVerifying,
    runComprehensiveVerification,
    downloadComprehensiveReport,
    healthScore,
    criticalIssues,
    totalIssues,
    isSystemStable,
    syncStatus,
    lastVerification
  } = useComprehensiveVerification();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-50 border-green-200';
      case 'good': return 'bg-blue-50 border-blue-200';
      case 'needs_improvement': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-500';
      case 'pending_sync': return 'bg-yellow-500';
      case 'sync_failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <ComprehensiveVerificationHeader
        verificationResult={verificationResult}
        isVerifying={isVerifying}
        onRunVerification={runComprehensiveVerification}
        onDownloadReport={downloadComprehensiveReport}
        getStatusColor={getStatusColor}
        getSyncStatusColor={getSyncStatusColor}
      />

      {verificationResult && (
        <>
          {/* Health Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>
                  {healthScore}/100
                </div>
                <p className="text-xs text-muted-foreground">
                  System overall health
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {criticalIssues}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalIssues > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {totalIssues}
                </div>
                <p className="text-xs text-muted-foreground">
                  All detected issues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isSystemStable ? 'text-green-600' : 'text-red-600'}`}>
                  {isSystemStable ? 'Stable' : 'Unstable'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current stability
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Single Source Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Single Source of Truth Compliance
              </CardTitle>
              <CardDescription>
                Verification of single source architecture implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Compliance Score</span>
                    <Badge variant="outline">
                      {verificationResult.singleSourceCompliance.complianceScore}/100
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Systems Verified</span>
                    <Badge variant="outline">
                      {verificationResult.singleSourceCompliance.systemsVerified.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Violations Found</span>
                    <Badge variant={verificationResult.singleSourceCompliance.violations.length > 0 ? "destructive" : "default"}>
                      {verificationResult.singleSourceCompliance.violations.length}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Verified Systems</h4>
                  <div className="space-y-1">
                    {verificationResult.singleSourceCompliance.systemsVerified.slice(0, 3).map((system, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{system}</span>
                      </div>
                    ))}
                    {verificationResult.singleSourceCompliance.systemsVerified.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{verificationResult.singleSourceCompliance.systemsVerified.length - 3} more systems
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Module System Verification
              </CardTitle>
              <CardDescription>
                Verification of module system integrity and consistency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Module Status</span>
                    <Badge variant={verificationResult.moduleVerification?.isWorking ? "default" : "destructive"}>
                      {verificationResult.moduleVerification?.isWorking ? 'Working' : 'Issues Found'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Source</span>
                    <Badge variant="outline">
                      {verificationResult.moduleVerification?.dataSource === 'consolidated_sources' ? 'Unified' : 'Mixed'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Hook Consistency</span>
                    <Badge variant="outline">
                      {verificationResult.moduleVerification?.hookConsistency?.score || 0}/100
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Component Integrity</span>
                    <Badge variant="outline">
                      {verificationResult.moduleVerification?.componentIntegrity?.score || 0}/100
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">DB Connection</span>
                    <Badge variant="outline">
                      {verificationResult.moduleVerification?.databaseConnection?.score || 0}/100
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Issues</span>
                    <Badge variant={verificationResult.moduleVerification?.hookConsistency?.issues?.length > 0 ? "destructive" : "default"}>
                      {(verificationResult.moduleVerification?.hookConsistency?.issues?.length || 0) +
                       (verificationResult.moduleVerification?.componentIntegrity?.issues?.length || 0) +
                       (verificationResult.moduleVerification?.databaseConnection?.issues?.length || 0)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Integrity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Integrity
              </CardTitle>
              <CardDescription>
                Database structure and relationship validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className={`h-6 w-6 ${verificationResult.databaseIntegrity?.tablesConsistent ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <p className="text-sm font-medium">Tables</p>
                  <p className="text-xs text-gray-500">Consistent</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className={`h-6 w-6 ${verificationResult.databaseIntegrity?.rlsPoliciesValid ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <p className="text-sm font-medium">RLS Policies</p>
                  <p className="text-xs text-gray-500">Valid</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className={`h-6 w-6 ${verificationResult.databaseIntegrity?.foreignKeysValid ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <p className="text-sm font-medium">Foreign Keys</p>
                  <p className="text-xs text-gray-500">Valid</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className={`h-6 w-6 ${verificationResult.databaseIntegrity?.indexesOptimized ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <p className="text-sm font-medium">Indexes</p>
                  <p className="text-xs text-gray-500">Optimized</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hook Consistency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Hook Consistency Analysis
              </CardTitle>
              <CardDescription>
                Analysis of hook patterns and consistency across the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Consistency Score</span>
                  <Badge variant="outline">
                    {verificationResult.hookConsistency?.score || 0}/100
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Duplicate Hooks</span>
                  <Badge variant={verificationResult.hookConsistency?.duplicateHooks?.length > 0 ? "destructive" : "default"}>
                    {verificationResult.hookConsistency?.duplicateHooks?.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inconsistent Patterns</span>
                  <Badge variant={verificationResult.hookConsistency?.inconsistentPatterns?.length > 0 ? "destructive" : "default"}>
                    {verificationResult.hookConsistency?.inconsistentPatterns?.length || 0}
                  </Badge>
                </div>
                {verificationResult.hookConsistency?.recommendations && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {verificationResult.hookConsistency.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Integrity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Navigation Integrity
              </CardTitle>
              <CardDescription>
                Verification of navigation structure and routing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className={`h-6 w-6 ${verificationResult.navigationIntegrity?.routesValid ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <p className="text-sm font-medium">Routes</p>
                  <p className="text-xs text-gray-500">Valid</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className={`h-6 w-6 ${verificationResult.navigationIntegrity?.componentsLinked ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <p className="text-sm font-medium">Components</p>
                  <p className="text-xs text-gray-500">Linked</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className={`h-6 w-6 ${verificationResult.navigationIntegrity?.breadcrumbsWorking ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <p className="text-sm font-medium">Breadcrumbs</p>
                  <p className="text-xs text-gray-500">Working</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className={`h-6 w-6 ${verificationResult.navigationIntegrity?.menuStructureValid ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <p className="text-sm font-medium">Menu</p>
                  <p className="text-xs text-gray-500">Valid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Status */}
          {syncStatus !== 'synced' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Sync Status
                </CardTitle>
                <CardDescription>
                  Data synchronization status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Status</span>
                    <Badge className={getSyncStatusColor(syncStatus)}>
                      {syncStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  {verificationResult.syncVerification && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pending Changes</span>
                        <Badge variant="outline">
                          {verificationResult.syncVerification.pendingChanges?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Sync</span>
                        <span className="text-sm text-gray-500">
                          {verificationResult.syncVerification.lastSyncTime ? 
                            new Date(verificationResult.syncVerification.lastSyncTime).toLocaleString() : 
                            'Never'
                          }
                        </span>
                      </div>
                      {verificationResult.syncVerification.syncErrors?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-600 mb-2">Sync Errors</h4>
                          <ul className="space-y-1">
                            {verificationResult.syncVerification.syncErrors.map((error, index) => (
                              <li key={index} className="text-sm text-red-600">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last Verification Info */}
          {lastVerification && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Last Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Last comprehensive verification completed on {new Date(lastVerification).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
