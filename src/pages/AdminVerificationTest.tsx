
/**
 * Admin Verification Test Page
 * Test page to run and display admin module verification results
 */

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { adminModuleVerificationRunner, AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import AdminVerificationHeader from '@/components/verification/AdminVerificationHeader';
import VerificationStatusOverview from '@/components/verification/VerificationStatusOverview';
import VerificationLoadingState from '@/components/verification/VerificationLoadingState';
import VerificationResultsTabs from '@/components/verification/VerificationResultsTabs';

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

  return (
    <MainLayout>
      <PageContainer
        title="Admin Module Verification"
        subtitle="Comprehensive verification and stability testing for the admin module"
        headerActions={
          <AdminVerificationHeader 
            onRunVerification={runVerification}
            isRunning={isRunning}
          />
        }
      >
        <div className="space-y-6">
          {/* Status Overview */}
          {verificationResult && !isRunning && (
            <VerificationStatusOverview verificationResult={verificationResult} />
          )}

          {/* Loading State */}
          {isRunning && <VerificationLoadingState />}

          {/* Results Tabs */}
          {verificationResult && !isRunning && (
            <VerificationResultsTabs verificationResult={verificationResult} />
          )}
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
