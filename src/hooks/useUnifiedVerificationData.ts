
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issuesTypes';

interface DatabaseHealthMetrics {
  tablesWithoutRLS: number;
  tablesWithIncompleteRLS: number;
  usersWithoutRoles: number;
  inactiveUsers: number;
  orphanedRecords: number;
  missingPermissions: number;
}

interface UnifiedVerificationData {
  healthScore: number;
  isStable: boolean;
  criticalIssuesCount: number;
  totalActiveIssues: number;
  totalFixedIssues: number;
  lastCalculated: Date;
  activeIssues: Issue[];
  categorizedIssues: {
    critical: Issue[];
    high: Issue[];
    medium: Issue[];
    low: Issue[];
    byTopic: Record<string, Issue[]>;
    total: number;
  };
}

export const useUnifiedVerificationData = () => {
  const [verificationData, setVerificationData] = useState<UnifiedVerificationData>({
    healthScore: 0,
    isStable: false,
    criticalIssuesCount: 0,
    totalActiveIssues: 0,
    totalFixedIssues: 0,
    lastCalculated: new Date(),
    activeIssues: [],
    categorizedIssues: {
      critical: [],
      high: [],
      medium: [],
      low: [],
      byTopic: {},
      total: 0
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessDatabaseHealth = useCallback(async (): Promise<DatabaseHealthMetrics> => {
    console.log('🔍 Assessing database health from original sources');
    
    const metrics: DatabaseHealthMetrics = {
      tablesWithoutRLS: 0,
      tablesWithIncompleteRLS: 0,
      usersWithoutRoles: 0,
      inactiveUsers: 0,
      orphanedRecords: 0,
      missingPermissions: 0
    };

    try {
      // Check users without roles (critical security issue)
      const { data: usersWithoutRoles, error: rolesError } = await supabase
        .from('profiles')
        .select('id')
        .not('id', 'in', `(SELECT DISTINCT user_id FROM user_roles WHERE user_id IS NOT NULL)`);

      if (!rolesError && usersWithoutRoles) {
        metrics.usersWithoutRoles = usersWithoutRoles.length;
      }

      // Check inactive users (users who haven't logged in recently)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: inactiveUsers, error: inactiveError } = await supabase
        .from('profiles')
        .select('id')
        .or(`last_login.is.null,last_login.lt.${thirtyDaysAgo.toISOString()}`);

      if (!inactiveError && inactiveUsers) {
        metrics.inactiveUsers = inactiveUsers.length;
      }

      // Check orphaned user_roles (users assigned to roles but profile doesn't exist)
      const { data: orphanedRoles, error: orphanedError } = await supabase
        .from('user_roles')
        .select('user_id')
        .not('user_id', 'in', `(SELECT id FROM profiles WHERE id IS NOT NULL)`);

      if (!orphanedError && orphanedRoles) {
        metrics.orphanedRecords += orphanedRoles.length;
      }

      // Check users with profiles but no facility assignments
      const { data: usersWithoutFacilities, error: facilitiesError } = await supabase
        .from('profiles')
        .select('id')
        .is('facility_id', null);

      if (!facilitiesError && usersWithoutFacilities) {
        metrics.missingPermissions = usersWithoutFacilities.length;
      }

      console.log('📊 Database health metrics:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ Error assessing database health:', error);
      return metrics;
    }
  }, []);

  const convertMetricsToIssues = useCallback((metrics: DatabaseHealthMetrics): Issue[] => {
    const issues: Issue[] = [];

    // Convert each metric to an issue
    if (metrics.usersWithoutRoles > 0) {
      issues.push({
        type: 'Users Without Roles',
        message: `${metrics.usersWithoutRoles} users exist without assigned roles`,
        source: 'Security Scanner',
        severity: 'critical',
        issueId: 'users-without-roles',
        status: 'existing',
        details: 'Users without roles pose a critical security risk'
      });
    }

    if (metrics.orphanedRecords > 0) {
      issues.push({
        type: 'Orphaned Records',
        message: `${metrics.orphanedRecords} orphaned role assignments found`,
        source: 'Database Scanner',
        severity: 'high',
        issueId: 'orphaned-records',
        status: 'existing',
        details: 'Orphaned records indicate data integrity issues'
      });
    }

    if (metrics.inactiveUsers > 5) {
      issues.push({
        type: 'Inactive Users',
        message: `${metrics.inactiveUsers} users have been inactive for over 30 days`,
        source: 'Security Scanner',
        severity: 'medium',
        issueId: 'inactive-users',
        status: 'existing',
        details: 'Inactive user accounts may pose security risks'
      });
    }

    if (metrics.missingPermissions > 0) {
      issues.push({
        type: 'Missing Facility Assignments',
        message: `${metrics.missingPermissions} users lack facility assignments`,
        source: 'Database Scanner',
        severity: 'medium',
        issueId: 'missing-facility-assignments',
        status: 'existing',
        details: 'Users without facility assignments may have access issues'
      });
    }

    return issues;
  }, []);

  const calculateUnifiedData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🎯 Calculating unified verification data from original database state');
      
      // Get real database health metrics
      const dbMetrics = await assessDatabaseHealth();
      
      // Convert metrics to issues for consistent display
      const activeIssues = convertMetricsToIssues(dbMetrics);
      
      // Get fixed issues count from tracking table
      const { count: fixedCount, error: fixedError } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (fixedError) {
        console.error('Error fetching fixed issues count:', fixedError);
      }

      const totalFixed = fixedCount || 0;

      // Calculate health score based on the same data that generates issues
      let score = 100;
      let criticalIssues = 0;
      let totalActiveIssues = 0;

      // Process issues to calculate score
      activeIssues.forEach(issue => {
        if (issue.severity === 'critical') {
          criticalIssues++;
          score -= 30; // Major deduction for critical issues
        } else if (issue.severity === 'high') {
          totalActiveIssues++;
          score -= 20; // Significant deduction for high priority
        } else if (issue.severity === 'medium') {
          totalActiveIssues++;
          score -= 10; // Moderate deduction for medium priority
        } else if (issue.severity === 'low') {
          totalActiveIssues++;
          score -= 5; // Small deduction for low priority
        }
      });

      totalActiveIssues += criticalIssues;

      // Bonus for fixes applied
      const fixBonus = Math.min(totalFixed * 3, 25);
      score += fixBonus;
      
      // Stability bonus if no critical issues
      if (criticalIssues === 0) {
        score += 15;
      }
      
      // Performance bonus for well-maintained system
      if (activeIssues.length === 0) {
        score += 10;
      }
      
      // Ensure score is within bounds
      score = Math.max(0, Math.min(100, score));

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

      // Sync issues to database table for consistency
      if (activeIssues.length > 0) {
        const issuesData = activeIssues.map(issue => ({
          type: issue.type,
          message: issue.message,
          source: issue.source,
          severity: issue.severity
        }));

        await supabase.rpc('sync_active_issues', {
          issues_data: issuesData
        });
      } else {
        // Clear active issues if none found
        await supabase
          .from('active_issues')
          .delete()
          .eq('status', 'active');
      }

      const unifiedData: UnifiedVerificationData = {
        healthScore: Math.round(score),
        isStable: score >= 80 && criticalIssues === 0,
        criticalIssuesCount: criticalIssues,
        totalActiveIssues: totalActiveIssues,
        totalFixedIssues: totalFixed,
        lastCalculated: new Date(),
        activeIssues,
        categorizedIssues
      };

      setVerificationData(unifiedData);
      
      console.log('✅ Unified verification data calculated:', {
        healthScore: unifiedData.healthScore,
        isStable: unifiedData.isStable,
        activeIssuesCount: activeIssues.length,
        breakdown: {
          criticalIssues,
          totalActiveIssues,
          totalFixed,
          originalDbMetrics: dbMetrics
        }
      });

    } catch (error) {
      console.error('❌ Error calculating unified verification data:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate verification data');
    } finally {
      setIsLoading(false);
    }
  }, [assessDatabaseHealth, convertMetricsToIssues]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    calculateUnifiedData();
    const interval = setInterval(calculateUnifiedData, 30000);
    return () => clearInterval(interval);
  }, [calculateUnifiedData]);

  return {
    ...verificationData,
    isLoading,
    error,
    refresh: calculateUnifiedData
  };
};
