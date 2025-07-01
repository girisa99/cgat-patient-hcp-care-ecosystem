
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, CheckCircle, AlertTriangle, Shield, Database, Code } from 'lucide-react';
import { useComprehensiveVerification } from '@/hooks/useComprehensiveVerification';
import SystemStatusSummary from '@/components/verification/SystemStatusSummary';
import VerificationMetricsGrid from '@/components/verification/VerificationMetricsGrid';
import DatabaseIssuesDisplay from '@/components/verification/DatabaseIssuesDisplay';
import DatabaseSyncResults from '@/components/verification/DatabaseSyncResults';

const AdminVerificationTest: React.FC = () => {
  const {
    verificationResult,
    hasResults,
    isVerifying,
    error,
    runComprehensiveVerification,
    triggerAutomationCycle,
    downloadComprehensiveReport,
    clearError
  } = useComprehensiveVerification();

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pending_sync':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'sync_failed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Verification Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive system validation with single source of truth compliance
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={runComprehensiveVerification}
            disabled={isVerifying}
            variant="outline"
            className="flex items-center"
          >
            <Activity className="h-4 w-4 mr-2" />
            {isVerifying ? 'Running...' : 'Run Verification'}
          </Button>
          
          <Button
            onClick={triggerAutomationCycle}
            disabled={isVerifying}
            className="flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isVerifying ? 'Processing...' : 'Run Automation'}
          </Button>
          
          {hasResults && (
            <Button
              onClick={downloadComprehensiveReport}
              variant="secondary"
              className="flex items-center"
            >
              Download Report
            </Button>
          )}
        </div>
      </div>

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
          <CardContent>
            <Button onClick={clearError} variant="outline" size="sm">
              Clear Error
            </Button>
          </CardContent>
        </Card>
      )}

      <SystemStatusSummary verificationResult={verificationResult} error={error} />

      {hasResults && verificationResult && (
        <>
          <VerificationMetricsGrid 
            verificationResult={verificationResult}
            getSyncStatusColor={getSyncStatusColor}
          />

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="single-source">Single Source</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="sync">Sync Status</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      Single Source Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-700">
                      {verificationResult.singleSourceCompliance.complianceScore}%
                    </div>
                    <div className="text-xs text-green-600">
                      {verificationResult.singleSourceCompliance.systemsVerified.length} systems verified
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Database className="h-4 w-4 mr-2 text-blue-600" />
                      Database Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700">
                      {verificationResult.systemHealth.databaseHealth.score}/100
                    </div>
                    <div className="text-xs text-blue-600">
                      System health score
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Code className="h-4 w-4 mr-2 text-purple-600" />
                      Verification Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">
                        Source: {verificationResult.automationMetadata.dataSource}
                      </div>
                      <div className="text-xs text-gray-600">
                        Method: {verificationResult.automationMetadata.verificationMethod}
                      </div>
                      <div className="text-xs text-gray-600">
                        Last run: {new Date(verificationResult.automationMetadata.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="single-source" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Single Source of Truth Compliance
                  </CardTitle>
                  <CardDescription>
                    Verification that all systems use consolidated data sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Verified Systems</h4>
                      <div className="space-y-1">
                        {verificationResult.singleSourceCompliance.systemsVerified.map((system, index) => (
                          <div key={index} className="text-sm text-green-700 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-2" />
                            {system}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
                      <div className="space-y-1">
                        {verificationResult.singleSourceCompliance.recommendations.map((rec, index) => (
                          <div key={index} className="text-sm text-blue-700">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <DatabaseIssuesDisplay verificationResult={verificationResult} />
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <DatabaseSyncResults 
                verificationResult={verificationResult}
                getSyncStatusColor={getSyncStatusColor}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {!hasResults && !isVerifying && !error && (
        <Card className="text-center p-8">
          <CardContent>
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Verification Results
            </h3>
            <p className="text-gray-600 mb-4">
              Run a comprehensive verification to see system health and compliance status
            </p>
            <Button onClick={runComprehensiveVerification} className="mx-auto">
              Start Verification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminVerificationTest;
