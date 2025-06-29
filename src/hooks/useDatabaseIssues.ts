
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

export const useDatabaseIssues = (): DatabaseIssuesData & {
  refreshIssues: () => Promise<void>;
} => {
  const [activeIssues, setActiveIssues] = useState<Issue[]>([]);
  const [totalFixedCount, setTotalFixedCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIssuesFromDatabase = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading issues directly from database tables...');
      
      // Load active issues from database
      const { data: activeData, error: activeError } = await supabase
        .from('active_issues')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (activeError) {
        throw activeError;
      }

      // Convert database records to Issue format
      const issues: Issue[] = (activeData || []).map(record => ({
        type: record.issue_type,
        message: record.issue_message,
        source: record.issue_source,
        severity: record.issue_severity as 'critical' | 'high' | 'medium' | 'low',
        issueId: record.id,
        lastSeen: record.last_seen,
        firstDetected: record.first_detected,
        status: 'active' as const,
        details: `Category: ${record.category}`,
        backendFixed: false,
        autoDetectedFix: false
      }));

      setActiveIssues(issues);

      // Get fixed issues count
      const { count: fixedCount, error: fixedError } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (!fixedError && fixedCount !== null) {
        setTotalFixedCount(fixedCount);
      }

      setLastScanTime(new Date());
      
      console.log(`✅ Loaded ${issues.length} active issues from database`);
      console.log(`📈 Total fixed issues: ${fixedCount || 0}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load issues';
      setError(errorMessage);
      console.error('❌ Error loading issues from database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshIssues = async () => {
    console.log('🔄 Refreshing issues from database tables...');
    await loadIssuesFromDatabase();
  };

  // Load on mount
  useEffect(() => {
    loadIssuesFromDatabase();
  }, []);

  // Categorize issues
  const categorizeIssues = (issues: Issue[]) => {
    const critical = issues.filter(i => i.severity === 'critical');
    const high = issues.filter(i => i.severity === 'high');
    const medium = issues.filter(i => i.severity === 'medium');
    const low = issues.filter(i => i.severity === 'low');

    const byTopic: Record<string, Issue[]> = {
      'Security Issues': issues.filter(i => 
        i.source?.toLowerCase().includes('security') || 
        i.type?.includes('rls') || 
        i.type?.includes('security')
      ),
      'Database Issues': issues.filter(i => 
        i.source?.toLowerCase().includes('database') || 
        i.type?.includes('schema') || 
        i.type?.includes('constraint')
      ),
      'Code Quality': issues.filter(i => 
        i.source?.toLowerCase().includes('code') || 
        i.source?.toLowerCase().includes('quality')
      ),
      'System Issues': issues.filter(i => 
        !i.source?.toLowerCase().includes('security') &&
        !i.source?.toLowerCase().includes('database') &&
        !i.source?.toLowerCase().includes('code')
      )
    };

    return {
      critical,
      high,
      medium,
      low,
      byTopic,
      total: issues.length
    };
  };

  const categorizedIssues = categorizeIssues(activeIssues);

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
