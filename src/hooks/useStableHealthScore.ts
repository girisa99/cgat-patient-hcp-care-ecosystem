
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthData {
  score: number;
  isStable: boolean;
  criticalIssuesCount: number;
  totalActiveIssues: number;
  totalFixedIssues: number;
  lastCalculated: Date;
}

interface DatabaseHealthMetrics {
  tablesWithoutRLS: number;
  tablesWithIncompleteRLS: number;
  usersWithoutRoles: number;
  inactiveUsers: number;
  orphanedRecords: number;
  missingPermissions: number;
}

export const useStableHealthScore = () => {
  const [healthData, setHealthData] = useState<HealthData>({
    score: 0,
    isStable: false,
    criticalIssuesCount: 0,
    totalActiveIssues: 0,
    totalFixedIssues: 0,
    lastCalculated: new Date()
  });

  const assessDatabaseHealth = useCallback(async (): Promise<DatabaseHealthMetrics> => {
    console.log('🔍 Assessing actual database health from original sources');
    
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

  const calculateHealthScore = useCallback(async () => {
    try {
      console.log('🎯 Calculating health score from ORIGINAL database state');
      
      // Get real database health metrics
      const dbMetrics = await assessDatabaseHealth();
      
      // Get fixed issues count from our tracking
      const { count: fixedCount, error: fixedError } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (fixedError) {
        console.error('Error fetching fixed issues count:', fixedError);
      }

      const totalFixed = fixedCount || 0;

      // Calculate health score based on ACTUAL database state
      let score = 100;
      let criticalIssues = 0;
      let totalActiveIssues = 0;

      // Critical issues (severe security/data integrity problems)
      if (dbMetrics.usersWithoutRoles > 0) {
        criticalIssues += dbMetrics.usersWithoutRoles;
        score -= dbMetrics.usersWithoutRoles * 30; // Major security risk
      }

      if (dbMetrics.orphanedRecords > 0) {
        criticalIssues += Math.ceil(dbMetrics.orphanedRecords / 2); // Group orphaned records
        score -= dbMetrics.orphanedRecords * 10; // Data integrity issues
      }

      // High priority issues
      if (dbMetrics.inactiveUsers > 5) {
        totalActiveIssues += 1;
        score -= 15; // Potential security risk from inactive accounts
      }

      // Medium priority issues
      if (dbMetrics.missingPermissions > 0) {
        totalActiveIssues += 1;
        score -= Math.min(dbMetrics.missingPermissions * 5, 20); // Cap the deduction
      }

      // Bonus for fixes applied
      const fixBonus = Math.min(totalFixed * 3, 25);
      score += fixBonus;
      
      // Stability bonus if no critical issues
      if (criticalIssues === 0) {
        score += 15;
      }
      
      // Performance bonus for well-maintained system
      if (dbMetrics.inactiveUsers < 3 && dbMetrics.orphanedRecords === 0) {
        score += 10;
      }
      
      // Ensure score is within bounds
      score = Math.max(0, Math.min(100, score));

      totalActiveIssues += criticalIssues;

      const newHealthData: HealthData = {
        score: Math.round(score),
        isStable: score >= 80 && criticalIssues === 0,
        criticalIssuesCount: criticalIssues,
        totalActiveIssues: totalActiveIssues,
        totalFixedIssues: totalFixed,
        lastCalculated: new Date()
      };

      setHealthData(newHealthData);
      
      console.log('✅ Health Score Calculated from ORIGINAL database state:', {
        score: newHealthData.score,
        isStable: newHealthData.isStable,
        originalDbMetrics: dbMetrics,
        breakdown: {
          criticalIssues,
          totalActiveIssues,
          totalFixed,
          calculationDetails: {
            baseScore: 100,
            usersWithoutRolesPenalty: dbMetrics.usersWithoutRoles * 30,
            orphanedRecordsPenalty: dbMetrics.orphanedRecords * 10,
            inactiveUsersPenalty: dbMetrics.inactiveUsers > 5 ? 15 : 0,
            missingPermissionsPenalty: Math.min(dbMetrics.missingPermissions * 5, 20),
            fixBonus: fixBonus,
            finalScore: score
          }
        }
      });

    } catch (error) {
      console.error('❌ Error calculating health score from original database:', error);
      // Set default values on error
      setHealthData({
        score: 0,
        isStable: false,
        criticalIssuesCount: 0,
        totalActiveIssues: 0,
        totalFixedIssues: 0,
        lastCalculated: new Date()
      });
    }
  }, [assessDatabaseHealth]);

  return {
    ...healthData,
    recalculate: calculateHealthScore
  };
};
