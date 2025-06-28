
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import EnhancedIssuesTab from '@/components/security/EnhancedIssuesTab';

interface EnhancedIssuesTabContentProps {
  verificationSummary: VerificationSummary | undefined;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const EnhancedIssuesTabContent: React.FC<EnhancedIssuesTabContentProps> = ({
  verificationSummary,
  onReRunVerification,
  isReRunning = false
}) => {
  return (
    <EnhancedIssuesTab 
      verificationSummary={verificationSummary}
      onReRunVerification={onReRunVerification}
      isReRunning={isReRunning}
    />
  );
};

export default EnhancedIssuesTabContent;
