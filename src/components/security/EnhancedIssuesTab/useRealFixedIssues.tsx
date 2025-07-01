
import React, { useState } from 'react';
import { Issue } from '@/types/issuesTypes';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import { useToast } from '@/hooks/use-toast';

export const useRealFixedIssues = () => {
  const { toast } = useToast();
  const [realFixedIssues, setRealFixedIssues] = useState<Array<{
    issue: Issue;
    fix: CodeFix;
    timestamp: string;
  }>>([]);

  const handleRealIssueFixed = (issue: Issue, fix: CodeFix) => {
    console.log('🔧 Real fix applied:', { issue: issue.type, fix: fix.description });
    
    setRealFixedIssues(prev => [...prev, {
      issue,
      fix,
      timestamp: new Date().toISOString()
    }]);
    
    toast({
      title: "🎯 Real Fix Applied",
      description: `${fix.description} - This should resolve the issue permanently`,
      variant: "default",
    });
  };

  return {
    realFixedIssues,
    handleRealIssueFixed,
    realFixedCount: realFixedIssues.length
  };
};
