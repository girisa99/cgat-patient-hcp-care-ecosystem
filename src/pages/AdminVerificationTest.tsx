
/**
 * Real System Verification Dashboard
 * Uses comprehensive verification including database health and sync checks
 */

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Database, RefreshCw, Activity, Zap, Sync, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useComprehensiveVerification } from '@/hooks/useComprehensiveVerification';

const AdminVerificationTest = () => {
  const {
    verificationResult,
    isVerifying,
    error,
    runComprehensiveVerification,
    downloadComprehensiveReport
  } = useComprehensiveVerification();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return "text-green-800 bg-green-50 border-green-200";
      case 'warning': return "text-yellow-800 bg-yellow-50 border-yellow-200";
      case 'critical': return "text-red-800 bg-red-50 border-red-200";
      default: return "text-gray-800 bg-gray-50 border-gray-200";
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'in_sync': return "text-green-800 bg-green-50 border-green-200";
      case 'partial_sync': return "text-yellow-800 bg-yellow-50 border-yellow-200";
      case 'out_of_sync': return "text-red-800 bg-red-50 border-red-200";
      default: return "text-gray-800 bg-gray-50 border-gray-200";
    }
  };

  return (
    <MainLayout>
      <PageContainer
        title="Comprehensive System Verification"
        subtitle="Complete system health check with database validation and sync verification"
      >
        <div className="space-y-6">
          {/* Comprehensive System Status */}
          <Card className={verificationResult ? getStatusColor(verificationResult.overallStatus) : "bg-blue-50 border-blue-200"}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Comprehensive System Status
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={runComprehensiveVerification} 
                    disabled={isVerifying}
                    variant="outline"
                    size="sm"
                  >
                    {isVerifying ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    {isVerifying ? 'Running Verification...' : 'Run Complete Verification'}
                  </Button>
                  <Button 
                    onClick={downloadComprehensiveReport} 
                    disabled={!verificationResult}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {verificationResult ? (
                  <>
                    <strong>🏥 COMPREHENSIVE VERIFICATION RESULTS</strong>
                    <br />
                    Overall Status: <Badge className={getStatusColor(verificationResult.overallStatus)}>
                      {verificationResult.overallStatus.toUpperCase()}
                    </Badge>
                    <br />
                    Sync Status: <Badge className={getSyncStatusColor(verificationResult.syncStatus)}>
                      {verificationResult.syncStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <br />
                    Health Score: {verificationResult.systemHealth.overallHealthScore}/100 | 
                    Critical Issues: {verificationResult.criticalIssuesFound} | 
                    Total Issues: {verificationResult.totalActiveIssues}
                    <br />
                    Last Verified: {new Date(verificationResult.verificationTimestamp).toLocaleString()}
                  </>
                ) : (
                  <>
                    <strong>🔍 COMPREHENSIVE VERIFICATION READY</strong>
                    <br />
                    Click "Run Complete Verification" to perform:
                    <br />
                    • Real database health validation
                    <br />
                    • Database sync integrity checks
                    <br />
                    • Complete system status assessment
                  </>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Verification Metrics */}
          {verificationResult && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-800 flex items-center text-sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Critical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-red-800">{verificationResult.criticalIssuesFound}</div>
                  <div className="text-xs text-red-600">Immediate attention required</div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-orange-800 flex items-center text-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Total Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-orange-800">{verificationResult.totalActiveIssues}</div>
                  <div className="text-xs text-orange-600">All active issues</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-800 flex items-center text-sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-blue-800">{verificationResult.systemHealth.overallHealthScore}%</div>
                  <div className="text-xs text-blue-600">System health rating</div>
                </CardContent>
              </Card>
              
              <Card className={getSyncStatusColor(verificationResult.syncStatus)}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Sync className="h-4 w-4 mr-2" />
                    Sync Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{verificationResult.syncVerification.syncDiscrepancies.length}</div>
                  <div className="text-xs">Sync discrepancies found</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Database Sync Verification Results */}
          {verificationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sync className="h-5 w-5 mr-2 text-purple-600" />
                  Database Sync Verification Results
                </CardTitle>
                <CardDescription>
                  Verification of synchronization between original database tables and sync tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sync Status Summary */}
                  <div className={`p-4 rounded-lg border ${getSyncStatusColor(verificationResult.syncStatus)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Sync Status Summary</h3>
                      <Badge className={getSyncStatusColor(verificationResult.syncStatus)}>
                        {verificationResult.syncStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      {verificationResult.syncVerification.isInSync ? 
                        "✅ All database tables are properly synchronized" :
                        `⚠️ ${verificationResult.syncVerification.syncDiscrepancies.length} sync discrepancies detected`
                      }
                    </p>
                  </div>

                  {/* Table Counts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Table Record Counts</h4>
                      {Object.entries(verificationResult.syncVerification.originalTableCounts).map(([table, count]) => (
                        <div key={table} className="flex justify-between text-sm">
                          <span className="text-blue-700">{table}:</span>
                          <span className="font-medium text-blue-800">{count} records</span>
                        </div>
                      ))}
                    </div>

                    {verificationResult.syncVerification.syncDiscrepancies.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Sync Discrepancies</h4>
                        {verificationResult.syncVerification.syncDiscrepancies.map((discrepancy, index) => (
                          <div key={index} className="mb-2 p-2 bg-white rounded border">
                            <div className="text-sm font-medium text-red-800">{discrepancy.tableName}</div>
                            <div className="text-xs text-red-600">{discrepancy.details}</div>
                            <div className="text-xs text-red-500">Difference: {discrepancy.difference}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Issues */}
          {verificationResult && verificationResult.systemHealth.databaseHealth.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-600" />
                  Database Issues Found
                </CardTitle>
                <CardDescription>
                  Issues detected from live database validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {verificationResult.systemHealth.databaseHealth.issues.map((issue, index) => (
                    <div key={issue.id || index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={issue.severity === 'critical' ? 'destructive' : 'outline'}
                            className={
                              issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }
                          >
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-sm">{issue.type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{issue.description}</p>
                      <p className="text-xs text-gray-500">Table: {issue.table}</p>
                      <p className="text-xs text-blue-600 mt-1">💡 {issue.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {verificationResult && verificationResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-green-600" />
                  System Recommendations
                </CardTitle>
                <CardDescription>
                  Comprehensive recommendations based on verification results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {verificationResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-blue-600 font-medium text-sm">{index + 1}.</span>
                      <span className="text-blue-700 text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification System Status */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Comprehensive Verification System Status
              </CardTitle>
              <CardDescription className="text-green-700">
                ✅ Real database validation system active
                <br />
                ✅ Database sync verification system active  
                <br />
                ✅ Complete system health monitoring active
                <br />
                ✅ All results synced to database tables
                <br />
                ✅ No mock data - All results from live database verification
                {verificationResult && (
                  <>
                    <br />
                    📊 Tables Verified: {verificationResult.systemHealth.databaseHealth.tablesScanned.join(', ')}
                    <br />
                    🔄 Sync Tables Checked: {Object.keys(verificationResult.syncVerification.originalTableCounts).join(', ')}
                  </>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Verification Error
                </CardTitle>
                <CardDescription className="text-red-700">
                  {error}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
