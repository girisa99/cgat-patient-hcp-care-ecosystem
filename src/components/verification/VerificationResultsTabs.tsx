
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import UnifiedVerificationTabs from './UnifiedVerificationTabs';

interface VerificationResultsTabsProps {
  verificationResult: AdminModuleVerificationResult;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const VerificationResultsTabs: React.FC<VerificationResultsTabsProps> = ({
  verificationResult,
  onReRunVerification,
  isReRunning = false
}) => {
  return (
    <UnifiedVerificationTabs 
      verificationResult={verificationResult}
      onReRunVerification={onReRunVerification}
      isReRunning={isReRunning}
    />
  );
};

export default VerificationResultsTabs;
