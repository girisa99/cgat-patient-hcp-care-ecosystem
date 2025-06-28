import { useState, useCallback } from 'react';

export interface FixedIssue {
  id: string;
  type: string;
  message: string;
  source: string;
  severity: string;
  fixedAt: string;
  fixMethod: 'automatic' | 'manual';
}

interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
}

export const useFixedIssuesTracker = () => {
  const [fixedIssues, setFixedIssues] = useState<FixedIssue[]>([]);
  const [activeIssues, setActiveIssues] = useState<Issue[]>([]);

  const moveToFixed = useCallback((issues: Issue[], fixMethod: 'automatic' | 'manual' = 'automatic') => {
    const timestamp = new Date().toISOString();
    
    const newFixedIssues = issues.map((issue, index) => ({
      id: `fixed_${Date.now()}_${index}`,
      ...issue,
      fixedAt: timestamp,
      fixMethod
    }));

    setFixedIssues(prev => [...newFixedIssues, ...prev]);
    
    // Remove from active issues
    setActiveIssues(prev => 
      prev.filter(activeIssue => 
        !issues.some(fixedIssue => 
          activeIssue.type === fixedIssue.type && 
          activeIssue.message === fixedIssue.message
        )
      )
    );

    return newFixedIssues.length;
  }, []);

  const updateActiveIssues = useCallback((issues: Issue[]) => {
    setActiveIssues(issues);
  }, []);

  const getFixedIssuesBySource = useCallback((source: string) => {
    return fixedIssues.filter(issue => issue.source === source);
  }, [fixedIssues]);

  const getTotalFixedCount = useCallback(() => {
    return fixedIssues.length;
  }, [fixedIssues]);

  const clearFixedIssues = useCallback(() => {
    setFixedIssues([]);
  }, []);

  return {
    fixedIssues,
    activeIssues,
    moveToFixed,
    updateActiveIssues,
    getFixedIssuesBySource,
    getTotalFixedCount,
    clearFixedIssues
  };
};
