
import React from 'react';
import CleanIssuesTab from '@/components/security/CleanIssuesTab';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface IssuesTabContentProps {
  verificationSummary?: VerificationSummary | null;
}

const IssuesTabContent: React.FC<IssuesTabContentProps> = ({ verificationSummary }) => {
  return <CleanIssuesTab />;
};

export default IssuesTabContent;
