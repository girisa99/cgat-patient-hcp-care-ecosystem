
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
  syncActiveIssues: () => Promise<void>;
} => {
  const [activeIssues, setActiveIssues] = useState<Issue[]>([]);
  const [totalFixedCount, setTotalFixedCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active issues from database
  const loadActiveIssues = async () => {
    try {
      setError(null); // Clear any previous errors
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
      console.log('✅ Active issues loaded successfully from database:', issues.length);
    } catch (err) {
      console.error('❌ Error loading active issues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    }
  };

  // Load fixed issues count from database
  const loadFixedCount = async () => {
    try {
      setError(null); // Clear any previous errors
      const { count, error } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalFixedCount(count || 0);
      console.log('✅ Fixed issues count loaded successfully:', count || 0);
    } catch (err) {
      console.error('❌ Error loading fixed count:', err);
      // Don't set error for fixed count as it's not critical
    }
  };

  // Sync current system state to database with correct field names
  const syncActiveIssues = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Syncing active issues to database...');
      
      // Define current system issues with correct field names that match the database function expectations
      const currentIssues = [
        {
          type: 'Security Vulnerability',
          message: 'Multi-Factor Authentication is not implemented for admin users',
          source: 'Security Scanner',
          severity: 'critical'
        },
        {
          type: 'Security Vulnerability',
          message: 'Role-Based Access Control is not properly implemented',
          source: 'Security Scanner',
          severity: 'critical'
        },
        {
          type: 'Security Vulnerability',
          message: 'API keys and user data may be logged - logs are not sanitized',
          source: 'Security Scanner',
          severity: 'high'
        },
        {
          type: 'Security Vulnerability',
          message: 'API endpoints lack proper authorization checks',
          source: 'Security Scanner',
          severity: 'high'
        },
        {
          type: 'Code Quality Issue',
          message: 'Code lacks proper error handling and TypeScript type definitions',
          source: 'Code Quality Scanner',
          severity: 'medium'
        },
        {
          type: 'Database Issue',
          message: 'Database queries lack proper validation and sanitization',
          source: 'Database Scanner',
          severity: 'high'
        }
      ];

      console.log('📊 Syncing issues data:', currentIssues);

      // Use the updated sync function (field names now match the database function)
      const { error } = await supabase.rpc('sync_active_issues', {
        issues_data: currentIssues
      });

      if (error) {
        console.error('❌ Database sync error:', error);
        throw new Error(`Database sync failed: ${error.message}`);
      }

      console.log('✅ Active issues synced to database successfully');
      
      // Reload data after successful sync
      await loadActiveIssues();
      
    } catch (err) {
      console.error('❌ Error syncing active issues:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync issues with database');
      throw err; // Re-throw to let caller handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data from database
  const refreshIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([loadActiveIssues(), loadFixedCount()]);
      console.log('✅ All issues data refreshed from database');
    } catch (err) {
      console.error('❌ Error refreshing issues:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh issues');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount only (no automatic updates)
  useEffect(() => {
    console.log('🎯 DatabaseIssues hook: Initial data load');
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
    refreshIssues,
    syncActiveIssues
  };
};
