/**
 * Admin Verification Test Page
 * Test page to run and display admin module verification results
 */

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RefreshCw,
  Settings,
  BarChart3,
  FileCheck,
  Lock
} from 'lucide-react';
import { adminModuleVerificationRunner, AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import ImplementationTracker from '@/components/verification/ImplementationTracker';

const AdminVerificationTest = () => {
  const [verificationResult, setVerificationResult] = useState<AdminModuleVerificationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runVerification = async () => {
    setIsRunning(true);
    console.log('🚀 Starting Admin Module Verification...');

    try {
      const result = await adminModuleVerificationRunner.runAdminModuleVerification();
      setVerificationResult(result);
      setHasRun(true);
      console.log('✅ Admin Module Verification Complete:', result);
    } catch (error) {
      console.error('❌ Verification failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run verification on component mount
  useEffect(() => {
    if (!hasRun) {
      runVerification();
    }
  }, [hasRun]);

  const getStatusBadge = () => {
    if (!verificationResult) return null;

    if (verificationResult.isLockedForCurrentState) {
      return <Badge variant="default" className="bg-green-600"><Lock className="h-3 w-3 mr-1" />Production Ready</Badge>;
    } else if (verificationResult.isStable) {
      return <Badge variant="default" className="bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Stable</Badge>;
    } else {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Needs Improvement</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <MainLayout>
      <PageContainer
        title="Admin Module Verification"
        subtitle="Comprehensive verification and stability testing for the admin module"
        headerActions={
          <Button onClick={runVerification} disabled={isRunning}>
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Verification...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Re-run Verification
              </>
            )}
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Status Overview */}
          {verificationResult && !isRunning && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className={`h-8 w-8 ${getScoreColor(verificationResult.overallStabilityScore)}`} />
                    <div>
                      <p className={`text-2xl font-bold ${getScoreColor(verificationResult.overallStabilityScore)}`}>
                        {verificationResult.overallStabilityScore}
                      </p>
                      <p className="text-xs text-muted-foreground">Stability Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{verificationResult.passedChecks.length}</p>
                      <p className="text-xs text-muted-foreground">Passed Checks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{verificationResult.failedChecks.length}</p>
                      <p className="text-xs text-muted-foreground">Failed Checks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{verificationResult.criticalIssues.length}</p>
                      <p className="text-xs text-muted-foreground">Critical Issues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {isRunning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Running Comprehensive Verification...
                </CardTitle>
                <CardDescription>
                  Testing admin module stability, UI/UX patterns, security, and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={75} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing: Core verification, UI/UX validation, database health, security compliance...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Tabs */}
          {verificationResult && !isRunning && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Verification Results
                    </CardTitle>
                    <CardDescription>
                      Comprehensive analysis of the admin module
                    </CardDescription>
                  </div>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="implementation" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="implementation">Implementation</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="checks">Checks</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="issues">Issues</TabsTrigger>
                    <TabsTrigger value="plan">Plan</TabsTrigger>
                  </TabsList>

                  <TabsContent value="implementation" className="space-y-4">
                    <ImplementationTracker />
                  </TabsContent>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-2">Stability Report</h4>
                        <div className="space-y-1 text-sm">
                          {verificationResult.stabilityReport.map((line, index) => (
                            <p key={index} className={line.startsWith('🎯') || line.startsWith('📈') || line.startsWith('🔒') ? 'font-medium' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Key Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Overall Score:</span>
                            <span className={`font-bold ${getScoreColor(verificationResult.overallStabilityScore)}`}>
                              {verificationResult.overallStabilityScore}/100
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>UI/UX Score:</span>
                            <span className="font-medium">{verificationResult.uiuxValidationResults?.overallScore || 'N/A'}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={verificationResult.isStable ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {verificationResult.isStable ? 'Stable' : 'Unstable'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="checks" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">✅ Passed Checks</h4>
                        <div className="space-y-1">
                          {verificationResult.passedChecks.map((check, index) => (
                            <p key={index} className="text-sm">{check}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">❌ Failed Checks</h4>
                        <div className="space-y-1">
                          {verificationResult.failedChecks.map((check, index) => (
                            <p key={index} className="text-sm">{check}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4">
                    <div className="space-y-2">
                      {verificationResult.recommendations.map((rec, index) => (
                        <p key={index} className={rec.startsWith('🔧') || rec.startsWith('📋') || rec.startsWith('🎨') || rec.startsWith('👥') ? 'font-semibold text-blue-600' : 'text-sm pl-4'}>
                          {rec}
                        </p>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="issues" className="space-y-4">
                    {verificationResult.criticalIssues.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-red-600">🚨 Critical Issues</h4>
                        {verificationResult.criticalIssues.map((issue, index) => (
                          <p key={index} className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-500">
                            {issue}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h4 className="font-semibold text-green-600">No Critical Issues Detected</h4>
                        <p className="text-muted-foreground">The admin module is free of critical issues.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="plan" className="space-y-4">
                    <div className="space-y-2">
                      {verificationResult.improvementPlan.map((item, index) => (
                        <p key={index} className={item.startsWith('📋') || item.startsWith('🚨') || item.startsWith('⚡') || item.startsWith('🔧') ? 'font-semibold text-blue-600' : 'text-sm pl-4'}>
                          {item}
                        </p>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
