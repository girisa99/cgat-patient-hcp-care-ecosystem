
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import CleanIssuesTab from '@/components/security/CleanIssuesTab';

interface IssuesTabContentProps {
  verificationSummary: VerificationSummary | undefined;
}

const IssuesTabContent: React.FC<IssuesTabContentProps> = ({
  verificationSummary
}) => {
  // Use the new clean issues tab instead of the problematic old one
  return <CleanIssuesTab />;
};

export default IssuesTabContent;
