
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthData {
  score: number;
  isStable: boolean;
  criticalIssuesCount: number;
  totalActiveIssues: number;
  totalFixedIssues: number;
  lastCalculated: Date;
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

  const calculateHealthScore = async () => {
    try {
      console.log('🎯 Calculating health score from database only - no syncing');
      
      // Get active issues count by severity from database only
      const { data: activeIssues, error: activeError } = await supabase
        .from('active_issues')
        .select('issue_severity')
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get total fixed issues count from database only
      const { count: fixedCount, error: fixedError } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (fixedError) throw fixedError;

      const criticalCount = activeIssues?.filter(i => i.issue_severity === 'critical').length || 0;
      const highCount = activeIssues?.filter(i => i.issue_severity === 'high').length || 0;
      const mediumCount = activeIssues?.filter(i => i.issue_severity === 'medium').length || 0;
      const totalActive = activeIssues?.length || 0;
      const totalFixed = fixedCount || 0;

      // Health score calculation based on database data only
      let score = 100;
      
      const baseSystemHealth = 85;
      
      score = baseSystemHealth;
      score -= (criticalCount * 30);
      score -= (highCount * 15);
      score -= (mediumCount * 8);
      
      const fixBonus = Math.min(totalFixed * 3, 25);
      score = Math.min(score + fixBonus, 100);
      
      const codeHealthBonus = criticalCount === 0 ? 10 : 0;
      const stabilityBonus = totalActive < 5 ? 5 : 0;
      
      score = Math.min(score + codeHealthBonus + stabilityBonus, 100);
      score = Math.max(score, 0);

      const newHealthData: HealthData = {
        score: Math.round(score),
        isStable: score >= 80,
        criticalIssuesCount: criticalCount,
        totalActiveIssues: totalActive,
        totalFixedIssues: totalFixed,
        lastCalculated: new Date()
      };

      setHealthData(newHealthData);
      console.log('🎯 Health Score Calculated from Database Only:', {
        ...newHealthData,
        note: 'No automatic syncing - manual refresh only'
      });

    } catch (error) {
      console.error('Error calculating health score from database:', error);
    }
  };

  useEffect(() => {
    console.log('🎯 Health score hook: Initial calculation (manual only)');
    calculateHealthScore();
  }, []);

  return {
    ...healthData,
    recalculate: calculateHealthScore
  };
};
