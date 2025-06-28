
import React from 'react';
import CleanIssuesTab from '@/components/security/CleanIssuesTab';

interface IssuesTabContentProps {
  // No longer needed - database-first approach
}

const IssuesTabContent: React.FC<IssuesTabContentProps> = () => {
  return <CleanIssuesTab />;
};

export default IssuesTabContent;
