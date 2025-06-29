
/**
 * Unified Verification Data Hook
 * Mock implementation for unified verification data management
 */

import { useState, useEffect } from 'react';
import { Issue } from '@/types/issuesTypes';

interface CategorizedIssues {
  critical: Issue[];
  high: Issue[];
  medium: Issue[];
  low: Issue[];
  byTopic: Record<string, Issue[]>;
  total: number;
}

export const useUnifiedVerificationData = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCalculated, setLastCalculated] = useState(new Date());

  useEffect(() => {
    // Mock data loading
    const mockIssues: Issue[] = [
      {
        type: 'Security Issue',
        message: 'Sample security issue',
        source: 'Security Scanner',
        severity: 'high',
        issueId: 'sec_001'
      },
      {
        type: 'Database Issue',
        message: 'Sample database issue',
        source: 'Database Scanner',
        severity: 'medium',
        issueId: 'db_001'
      },
      {
        type: 'Code Quality',
        message: 'Sample code quality issue',
        source: 'Code Scanner',
        severity: 'low',
        issueId: 'code_001'
      },
      {
        type: 'UI/UX Issue',
        message: 'Sample UI/UX issue',
        source: 'UI Scanner',
        severity: 'medium',
        issueId: 'ui_001'
      }
    ];

    setIssues(mockIssues);
    setLastCalculated(new Date());
  }, []);

  // Calculate categorized issues
  const categorizedIssues: CategorizedIssues = {
    critical: issues.filter(issue => issue.severity === 'critical'),
    high: issues.filter(issue => issue.severity === 'high'),
    medium: issues.filter(issue => issue.severity === 'medium'),
    low: issues.filter(issue => issue.severity === 'low'),
    byTopic: issues.reduce((acc, issue) => {
      const topic = issue.source || 'Unknown';
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>),
    total: issues.length
  };

  // Calculate health score based on issues
  const criticalIssuesCount = categorizedIssues.critical.length;
  const totalActiveIssues = issues.length;
  const healthScore = Math.max(0, 100 - (criticalIssuesCount * 20) - (totalActiveIssues * 5));
  const isStable = healthScore >= 80 && criticalIssuesCount === 0;

  const refresh = async () => {
    setIsLoading(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastCalculated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Original properties
    issues,
    isLoading,
    refreshData: refresh,
    
    // Extended properties needed by other hooks
    healthScore,
    isStable,
    criticalIssuesCount,
    totalActiveIssues,
    totalFixedIssues: 0, // Mock value
    lastCalculated,
    activeIssues: issues,
    categorizedIssues,
    error,
    refresh
  };
};
