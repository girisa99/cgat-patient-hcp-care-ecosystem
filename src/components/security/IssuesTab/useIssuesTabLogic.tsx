
import React, { useState } from 'react';
import { Issue } from '@/types/issuesTypes';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import { useToast } from '@/hooks/use-toast';
import { markIssueAsReallyFixed } from '../IssuesDataProcessor';

export const useIssuesTabLogic = () => {
  const { toast } = useToast();
  const [realFixedIssues, setRealFixedIssues] = useState<Array<{
    issue: Issue;
    fix: CodeFix;
    timestamp: string;
  }>>([]);
  const [lastScanTime, setLastScanTime] = useState(new Date());

  const handleRealIssueFixed = (issue: Issue, fix: CodeFix) => {
    console.log('🔧 Manual fix applied:', { 
      issue: issue.type, 
      fix: fix.description 
    });
    
    setRealFixedIssues(prev => [...prev, {
      issue,
      fix,
      timestamp: new Date().toISOString()
    }]);
    
    markIssueAsReallyFixed(issue);
    setLastScanTime(new Date());
    
    toast({
      title: "🛡️ Manual Fix Applied",
      description: `${fix.description} - Fix recorded successfully`,
      variant: "default",
    });
  };

  return {
    realFixedIssues,
    lastScanTime,
    handleRealIssueFixed,
    setLastScanTime
  };
};
