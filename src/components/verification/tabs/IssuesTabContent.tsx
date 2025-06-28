
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import IssuesTab from '@/components/security/IssuesTab';

interface IssuesTabContentProps {
  verificationSummary: VerificationSummary | undefined;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const IssuesTabContent: React.FC<IssuesTabContentProps> = ({
  verificationSummary,
  onReRunVerification,
  isReRunning = false
}) => {
  return (
    <IssuesTab 
      verificationSummary={verificationSummary}
      onReRunVerification={onReRunVerification}
      isReRunning={isReRunning}
    />
  );
};

export default IssuesTabContent;
