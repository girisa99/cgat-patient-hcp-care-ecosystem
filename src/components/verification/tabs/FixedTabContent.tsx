
import React from 'react';
import { FixedIssue } from '@/hooks/useFixedIssuesTracker';
import FixedIssuesTracker from '@/components/security/FixedIssuesTracker';

interface FixedTabContentProps {
  fixedIssues: FixedIssue[];
  totalFixesApplied: number;
}

const FixedTabContent: React.FC<FixedTabContentProps> = ({
  fixedIssues,
  totalFixesApplied
}) => {
  return (
    <FixedIssuesTracker 
      fixedIssues={fixedIssues} 
      totalFixesApplied={totalFixesApplied}
    />
  );
};

export default FixedTabContent;
