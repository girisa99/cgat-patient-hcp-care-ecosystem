
/**
 * Admin Verification Test Page
 * Enhanced with comprehensive database fixes
 */

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { EnhancedAdminModuleVerificationRunner, EnhancedAdminModuleVerificationResult } from '@/utils/verification/EnhancedAdminModuleVerificationRunner';
import AdminVerificationHeader from '@/components/verification/AdminVerificationHeader';
import VerificationStatusOverview from '@/components/verification/VerificationStatusOverview';
import VerificationLoadingState from '@/components/verification/VerificationLoadingState';
import VerificationResultsTabs from '@/components/verification/VerificationResultsTabs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Code, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminVerificationTest = () => {
  const [verificationResult, setVerificationResult] = useState<EnhancedAdminModuleVerificationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const { toast } = useToast();

  // Transform enhanced result to expected format for VerificationResultsTabs
  const transformToLegacyFormat = (enhancedResult: EnhancedAdminModuleVerificationResult) => {
    // Extract critical issues from database report
    const criticalIssues = enhancedResult.databaseReport.validationSummary.issues
      .filter(issue => issue.severity === 'critical')
      .map(issue => issue.description);

    // Extract failed checks from all issues
    const failedChecks = enhancedResult.databaseReport.validationSummary.issues
      .filter(issue => issue.severity !== 'info')
      .map(issue => issue.description);

    return {
      isStable: enhancedResult.overallStabilityScore >= 80,
      isLockedForCurrentState: enhancedResult.overallStabilityScore >= 95,
      criticalIssues,
      failedChecks,
      comprehensiveResults: enhancedResult.verificationSummary,
      overallStabilityScore: enhancedResult.overallStabilityScore,
      databaseReport: enhancedResult.databaseReport,
      recommendations: enhancedResult.recommendations
    };
  };

  const runEnhancedVerification = async () => {
    setIsRunning(true);
    setHasRun(false); // Reset to allow fresh run
    console.log('🚀 Starting Enhanced Admin Module Verification with Database Fixes...');

    try {
      toast({
        title: "🔍 Enhanced Verification Started",
        description: "Running comprehensive verification with database fixes...",
        variant: "default",
      });

      // Clear previous results to ensure fresh scan
      setVerificationResult(null);

      const result = await EnhancedAdminModuleVerificationRunner.runEnhancedVerification();
      setVerificationResult(result);
      setHasRun(true);
      
      toast({
        title: "✅ Enhanced Verification Complete",
        description: `Overall Score: ${result.overallStabilityScore}/100 | Database Fixes: ${result.databaseReport.totalIssuesFixed}`,
        variant: "default",
      });
      
      console.log('✅ Enhanced Admin Module Verification Complete:', result);
      
      // Show database fixes applied
      if (result.databaseReport.totalIssuesFixed > 0) {
        toast({
          title: "🗄️ Database Fixes Applied",
          description: `${result.databaseReport.totalIssuesFixed} database issues were automatically resolved`,
          variant: "default",
        });
      }
      
    } catch (error) {
      console.error('❌ Enhanced verification failed:', error);
      toast({
        title: "❌ Enhanced Verification Failed",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run verification on component mount
  useEffect(() => {
    if (!hasRun && !isRunning) {
      runEnhancedVerification();
    }
  }, [hasRun, isRunning]);

  return (
    <MainLayout>
      <PageContainer
        title="Enhanced Admin Module Verification"
        subtitle="Comprehensive verification with automated database fixes"
        headerActions={
          <AdminVerificationHeader 
            onRunVerification={runEnhancedVerification}
            isRunning={isRunning}
          />
        }
      >
        <div className="space-y-6">
          {/* Enhanced Status Overview */}
          {verificationResult && !isRunning && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Overall Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{verificationResult.overallStabilityScore}/100</div>
                  <Badge 
                    variant={verificationResult.overallStabilityScore >= 80 ? "default" : "destructive"}
                    className="mt-2"
                  >
                    {verificationResult.overallStabilityScore >= 80 ? "Excellent" : "Needs Improvement"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Database Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{verificationResult.verificationSummary.databaseScore}/100</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {verificationResult.databaseReport.totalIssuesFixed} fixes applied
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Code Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{verificationResult.verificationSummary.codeQualityScore}/100</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Improved metrics
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Database Fixes Summary */}
          {verificationResult && !isRunning && verificationResult.databaseReport.totalIssuesFixed > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Fixes Applied
                </CardTitle>
                <CardDescription className="text-green-700">
                  Automatic database improvements have been applied to enhance system stability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-800">
                      {verificationResult.databaseReport.totalIssuesFixed}
                    </div>
                    <div className="text-sm text-green-600">Issues Fixed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-800">
                      {verificationResult.databaseReport.validationSummary.autoFixableIssues || 0}
                    </div>
                    <div className="text-sm text-green-600">Auto-fixable</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-800">
                      {verificationResult.databaseReport.remainingIssues}
                    </div>
                    <div className="text-sm text-green-600">Remaining</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-800">
                      {verificationResult.databaseReport.totalIssuesFound > 0 ? 
                        Math.round((verificationResult.databaseReport.totalIssuesFixed / verificationResult.databaseReport.totalIssuesFound) * 100) : 
                        100
                      }%
                    </div>
                    <div className="text-sm text-green-600">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Critical Issues Alert */}
          {verificationResult && !isRunning && verificationResult.verificationSummary.criticalIssuesRemaining > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Critical Issues Require Attention
                </CardTitle>
                <CardDescription className="text-red-700">
                  {verificationResult.verificationSummary.criticalIssuesRemaining} critical issues need manual review
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Loading State */}
          {isRunning && <VerificationLoadingState />}

          {/* Results Tabs */}
          {verificationResult && !isRunning && (
            <VerificationResultsTabs 
              verificationResult={transformToLegacyFormat(verificationResult)}
              onReRunVerification={runEnhancedVerification}
              isReRunning={isRunning}
            />
          )}
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
