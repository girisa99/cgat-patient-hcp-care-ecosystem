
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import SecurityPerformanceTab from '../SecurityPerformanceTab';

interface SecurityPerformanceTabContentProps {
  verificationSummary: VerificationSummary | undefined;
}

const SecurityPerformanceTabContent: React.FC<SecurityPerformanceTabContentProps> = ({
  verificationSummary
}) => {
  return (
    <SecurityPerformanceTab 
      verificationSummary={verificationSummary}
    />
  );
};

export default SecurityPerformanceTabContent;
