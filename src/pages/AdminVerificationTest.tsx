
/**
 * Real System Verification Dashboard
 * Uses comprehensive verification including database health and sync checks
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

          <SystemStatusSummary verificationResult={verificationResult} error={error} />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
