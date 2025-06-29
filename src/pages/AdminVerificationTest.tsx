
/**
 * Real System Verification Dashboard
 * Uses real database validation instead of mock implementations
 */

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Database, RefreshCw, Activity, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealDatabaseValidation } from '@/hooks/useRealDatabaseValidation';
import { RealVerificationOrchestrator } from '@/utils/verification/RealVerificationOrchestrator';

const AdminVerificationTest = () => {
  const {
    healthScore,
    isSystemStable,
    criticalIssuesCount,
    totalActiveIssues,
    lastValidationTime,
    databaseIssues,
    isValidating,
    error,
    validateNow,
    validationResult
  } = useRealDatabaseValidation();

  const getHealthScoreColor = () => {
    if (healthScore >= 80) return "text-green-800";
    if (healthScore >= 60) return "text-yellow-800";
    return "text-red-800";
  };

  const getHealthScoreBgColor = () => {
    if (healthScore >= 80) return "bg-green-50 border-green-200";
    if (healthScore >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const handleDownloadReport = () => {
    if (!validationResult) return;

    const report = RealVerificationOrchestrator.generateSystemReport(validationResult);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-health-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <PageContainer
        title="Real System Verification Dashboard"
        subtitle="Live database validation and system health monitoring - NO MOCK DATA"
      >
        <div className="space-y-6">
          {/* Real System Health Status */}
          <Card className={getHealthScoreBgColor()}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${getHealthScoreColor()}`}>
                <div className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Real Database Health: {healthScore}/100
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={validateNow} 
                    disabled={isValidating}
                    variant="outline"
                    size="sm"
                  >
                    {isValidating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    {isValidating ? 'Validating...' : 'Re-validate Database'}
                  </Button>
                  <Button 
                    onClick={handleDownloadReport} 
                    disabled={!validationResult}
                    variant="outline"
                    size="sm"
                  >
                    📄 Download Report
                  </Button>
                </div>
              </CardTitle>
              <CardDescription className={isSystemStable ? 'text-green-700' : 'text-red-700'}>
                <strong>🗄️ REAL DATABASE VALIDATION ACTIVE</strong>
                <br />
                Direct connection to Supabase database - Real validation results
                <br />
                Last validated: {lastValidationTime ? lastValidationTime.toLocaleString() : 'Never'}
                <br />
                Critical Issues: {criticalIssuesCount} | Total Issues: {totalActiveIssues}
                <br />
                Database Status: {isSystemStable ? '✅ Database is healthy and secure' : '⚠️ Database requires attention'}
                {validationResult && (
                  <>
                    <br />
                    Tables Scanned: {validationResult.databaseHealth.tablesScanned.length} | 
                    Validation Time: {validationResult.databaseHealth.validationTimestamp}
                  </>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Real Metrics Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-800 flex items-center text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-red-800">{criticalIssuesCount}</div>
                <div className="text-xs text-red-600">From live database</div>
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
                <div className="text-2xl font-bold text-orange-800">{totalActiveIssues}</div>
                <div className="text-xs text-orange-600">Real validation results</div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center text-sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Tables Scanned
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-blue-800">
                  {validationResult?.databaseHealth.tablesScanned.length || 0}
                </div>
                <div className="text-xs text-blue-600">Live database tables</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-800">{healthScore}%</div>
                <div className="text-xs text-green-600">Real-time calculation</div>
              </CardContent>
            </Card>
          </div>

          {/* Real Database Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Real Database Issues Found
              </CardTitle>
              <CardDescription>
                Issues detected from live Supabase database validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {databaseIssues.length > 0 ? (
                  databaseIssues.map((issue, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    {isValidating ? (
                      <div className="flex items-center justify-center text-blue-600">
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Validating live database...
                      </div>
                    ) : (
                      <div className="text-green-600">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">No Database Issues Found</p>
                        <p className="text-sm">Your database passed all validation checks</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real Validation Status */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Real Validation System Status
              </CardTitle>
              <CardDescription className="text-blue-700">
                ✅ Connected to live Supabase database: ithspbabhmdntioslfqe.supabase.co
                <br />
                ✅ Real-time table structure validation
                <br />
                ✅ Live RLS policy verification
                <br />
                ✅ Actual data integrity checks
                <br />
                ✅ No mock data - All results from live database
                {validationResult && (
                  <>
                    <br />
                    📊 Scanned Tables: {validationResult.databaseHealth.tablesScanned.join(', ')}
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
                  Validation Error
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
