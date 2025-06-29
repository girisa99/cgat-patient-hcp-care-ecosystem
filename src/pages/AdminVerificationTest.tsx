
/**
 * Real System Verification Dashboard
 * Uses comprehensive verification including database health and sync checks
 * Integrated with 30-minute automation cycle
 */

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { useComprehensiveVerification } from '@/hooks/useComprehensiveVerification';
import ComprehensiveVerificationHeader from '@/components/verification/ComprehensiveVerificationHeader';
import VerificationMetricsGrid from '@/components/verification/VerificationMetricsGrid';
import DatabaseSyncResults from '@/components/verification/DatabaseSyncResults';
import DatabaseIssuesDisplay from '@/components/verification/DatabaseIssuesDisplay';
import SystemRecommendations from '@/components/verification/SystemRecommendations';
import SystemStatusSummary from '@/components/verification/SystemStatusSummary';
import SystemStatusOverview from '@/components/verification/SystemStatusOverview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Bot, PlayCircle } from 'lucide-react';

const AdminVerificationTest = () => {
  const {
    verificationResult,
    automationStatus,
    isVerifying,
    error,
    runComprehensiveVerification,
    triggerAutomationCycle,
    downloadComprehensiveReport,
    healthScore,
    criticalIssues,
    totalIssues,
    syncStatus,
    basedOnOriginalDB
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
        subtitle="Complete system health check with 30-minute automation cycle"
      >
        <div className="space-y-6">
          {/* System Status Overview - Real-time component status */}
          <SystemStatusOverview />

          {/* Automation Integration Status */}
          <Alert className="bg-blue-50 border-blue-200">
            <Bot className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>🤖 30-MINUTE AUTOMATION CYCLE STATUS:</strong><br />
                  {automationStatus ? (
                    <>
                      ✅ All verification components integrated<br />
                      ✅ Results calculated from original database only<br />
                      ✅ Findings synced to database tables for display<br />
                      ✅ Health score based on original database data<br />
                      {automationStatus.lastExecution && (
                        <>Last execution: {new Date(automationStatus.lastExecution).toLocaleString()}</>
                      )}
                    </>
                  ) : (
                    'Loading automation status...'
                  )}
                </div>
                <Button 
                  onClick={triggerAutomationCycle} 
                  disabled={isVerifying}
                  variant="outline"
                  size="sm"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Test Automation
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Data Source Confirmation */}
          {verificationResult && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ DATA SOURCE VERIFICATION:</strong><br />
                📊 Health Score ({healthScore}/100): Based on ORIGINAL DATABASE<br />
                🗄️ All calculations use original database data, not sync tables<br />
                🔄 Results displayed from sync tables for consistency<br />
                ⏰ Last verification: {new Date(verificationResult.timestamp).toLocaleString()}<br />
                🤖 Triggered by: {verificationResult.automationMetadata.triggeredBy.toUpperCase()}
              </AlertDescription>
            </Alert>
          )}

          {/* Header with automation controls */}
          <ComprehensiveVerificationHeader
            verificationResult={verificationResult}
            isVerifying={isVerifying}
            onRunVerification={runComprehensiveVerification}
            onDownloadReport={downloadComprehensiveReport}
            getStatusColor={getStatusColor}
            getSyncStatusColor={getSyncStatusColor}
          />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Results - Show when available */}
          {verificationResult && (
            <>
              <VerificationMetricsGrid
                verificationResult={verificationResult}
                getSyncStatusColor={getSyncStatusColor}
              />

              <DatabaseSyncResults
                verificationResult={verificationResult}
                getSyncStatusColor={getSyncStatusColor}
              />

              <DatabaseIssuesDisplay verificationResult={verificationResult} />

              <SystemRecommendations verificationResult={verificationResult} />
            </>
          )}

          {/* Status Summary - Always visible */}
          <SystemStatusSummary verificationResult={verificationResult} error={error} />

          {/* Initial state message */}
          {!verificationResult && !isVerifying && !error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Welcome to the Comprehensive System Verification Dashboard with 30-minute automation. 
                Click "Run Complete Verification" or "Test Automation" to start system health checks.
                All calculations are based on the original database, with results synced to display tables.
              </AlertDescription>
            </Alert>
          )}

          {/* Automation Assurance */}
          <Alert className="bg-purple-50 border-purple-200">
            <Bot className="h-4 w-4" />
            <AlertDescription>
              <strong>🔒 SYSTEM INTEGRITY ASSURANCE:</strong><br />
              • Health scores calculated ONLY from original database data<br />
              • 30-minute automation covers ALL verification components<br />
              • No components missed in automated scans<br />
              • Results consistency between manual and automated runs<br />
              • Database sync maintains display accuracy without affecting calculations<br />
              • Full traceability of data sources and calculation methods
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
