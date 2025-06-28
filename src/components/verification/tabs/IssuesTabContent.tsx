
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import IssuesTab from '@/components/security/IssuesTab';

interface IssuesTabContentProps {
  verificationSummary: VerificationSummary | undefined;
}

const IssuesTabContent: React.FC<IssuesTabContentProps> = ({
  verificationSummary
}) => {
  return (
    <IssuesTab 
      verificationSummary={verificationSummary}
    />
  );
};

export default IssuesTabContent;
