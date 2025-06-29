
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

  // Load active issues from sync table only
  const loadActiveIssues = async () => {
    try {
      setError(null);
      console.log('📋 Loading verification issues from sync table (active_issues)');
      
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
        details: `Category: ${row.category} | Source: Sync Table`
      }));

      setActiveIssues(issues);
      setLastScanTime(new Date());
      console.log('✅ Sync table verification issues loaded:', issues.length);
    } catch (err) {
      console.error('❌ Error loading sync table issues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sync table issues');
    }
  };

  // Load fixed issues count from issue_fixes table
  const loadFixedCount = async () => {
    try {
      setError(null);
      console.log('📊 Loading fixed issues count from issue_fixes table');
      
      const { count, error } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalFixedCount(count || 0);
      console.log('✅ Fixed issues count loaded from issue_fixes:', count || 0);
    } catch (err) {
      console.error('❌ Error loading fixed count from issue_fixes:', err);
    }
  };

  // Manual refresh for sync table data only
  const refreshIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Manual refresh: Loading sync table verification data only');
      await Promise.all([loadActiveIssues(), loadFixedCount()]);
      console.log('✅ Sync table data refresh completed');
    } catch (err) {
      console.error('❌ Error during sync data refresh:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh sync table data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load sync table data on mount only
  useEffect(() => {
    console.log('🎯 DatabaseIssues hook: Initial sync table data load');
    refreshIssues();
  }, []);

  // Categorize sync table issues
  const categorizedIssues = {
    critical: activeIssues.filter(issue => issue.severity === 'critical'),
    high: activeIssues.filter(issue => issue.severity === 'high'),
    medium: activeIssues.filter(issue => issue.severity === 'medium'),
    low: activeIssues.filter(issue => issue.severity === 'low'),
    byTopic: activeIssues.reduce((acc, issue) => {
      const topic = issue.source || 'Sync Table Issues';
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
