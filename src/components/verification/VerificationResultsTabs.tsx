
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import UnifiedVerificationTabs from './UnifiedVerificationTabs';

interface VerificationResultsTabsProps {
  verificationResult: AdminModuleVerificationResult;
}

const VerificationResultsTabs: React.FC<VerificationResultsTabsProps> = ({
  verificationResult
}) => {
  return (
    <UnifiedVerificationTabs 
      verificationResult={verificationResult}
    />
  );
};

export default VerificationResultsTabs;
