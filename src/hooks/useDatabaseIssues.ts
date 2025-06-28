
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issuesTypes';

interface DatabaseIssuesData {
  activeIssues: Issue[];
  totalFixedCount: number;
  lastScanTime: Date | null;
  isLoading: boolean;
  error: string | null;
  categorizedIssues: {
    critical: Issue[];
    high: Issue[];
    medium: Issue[];
    low: Issue[];
    byTopic: Record<string, Issue[]>;
    total: number;
  };
}

const isValidSeverity = (severity: string): severity is 'critical' | 'high' | 'medium' | 'low' => {
  return ['critical', 'high', 'medium', 'low'].includes(severity);
};

export const useDatabaseIssues = (): DatabaseIssuesData & {
  refreshIssues: () => Promise<void>;
} => {
  const [activeIssues, setActiveIssues] = useState<Issue[]>([]);
  const [totalFixedCount, setTotalFixedCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active issues from database only
  const loadActiveIssues = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('active_issues')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const issues: Issue[] = (data || []).map(row => ({
        type: row.issue_type,
        message: row.issue_message,
        source: row.issue_source,
        severity: isValidSeverity(row.issue_severity) ? row.issue_severity : 'medium' as const,
        issueId: row.id,
        lastSeen: row.last_seen,
        firstDetected: row.first_detected,
        status: 'existing' as const,
        details: `Category: ${row.category}`
      }));

      setActiveIssues(issues);
      setLastScanTime(new Date());
      console.log('✅ Active issues loaded from database:', issues.length);
    } catch (err) {
      console.error('❌ Error loading active issues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    }
  };

  // Load fixed issues count from database only
  const loadFixedCount = async () => {
    try {
      setError(null);
      const { count, error } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalFixedCount(count || 0);
      console.log('✅ Fixed issues count loaded:', count || 0);
    } catch (err) {
      console.error('❌ Error loading fixed count:', err);
    }
  };

  // Manual refresh only - no automatic syncing
  const refreshIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Manual refresh: Loading data from database only');
      await Promise.all([loadActiveIssues(), loadFixedCount()]);
      console.log('✅ Manual refresh completed');
    } catch (err) {
      console.error('❌ Error during manual refresh:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount only - no automatic updates
  useEffect(() => {
    console.log('🎯 DatabaseIssues hook: Initial data load (manual only)');
    refreshIssues();
  }, []);

  // Categorize issues
  const categorizedIssues = {
    critical: activeIssues.filter(issue => issue.severity === 'critical'),
    high: activeIssues.filter(issue => issue.severity === 'high'),
    medium: activeIssues.filter(issue => issue.severity === 'medium'),
    low: activeIssues.filter(issue => issue.severity === 'low'),
    byTopic: activeIssues.reduce((acc, issue) => {
      const topic = issue.source || 'System Issues';
      acc[topic] = acc[topic] || [];
      acc[topic].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>),
    total: activeIssues.length
  };

  return {
    activeIssues,
    totalFixedCount,
    lastScanTime,
    isLoading,
    error,
    categorizedIssues,
    refreshIssues
  };
};
