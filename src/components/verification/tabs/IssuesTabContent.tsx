
import React from 'react';
import CleanIssuesTab from '@/components/security/CleanIssuesTab';

interface IssuesTabContentProps {
  // Simplified for database-first approach
}

const IssuesTabContent: React.FC<IssuesTabContentProps> = () => {
  return <CleanIssuesTab />;
};

export default IssuesTabContent;
