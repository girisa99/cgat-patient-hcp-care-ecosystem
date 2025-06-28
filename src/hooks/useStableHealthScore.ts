
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
      // Get active issues count by severity
      const { data: activeIssues, error: activeError } = await supabase
        .from('active_issues')
        .select('issue_severity')
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get total fixed issues count
      const { count: fixedCount, error: fixedError } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (fixedError) throw fixedError;

      const criticalCount = activeIssues?.filter(i => i.issue_severity === 'critical').length || 0;
      const highCount = activeIssues?.filter(i => i.issue_severity === 'high').length || 0;
      const mediumCount = activeIssues?.filter(i => i.issue_severity === 'medium').length || 0;
      const totalActive = activeIssues?.length || 0;
      const totalFixed = fixedCount || 0;

      // Calculate stable score (0-100)
      let score = 100;
      
      // Deduct points for active issues
      score -= (criticalCount * 25); // Critical issues heavily impact score
      score -= (highCount * 10);     // High issues moderately impact score
      score -= (mediumCount * 5);    // Medium issues lightly impact score
      
      // Add bonus for fixes (but cap the total score at 100)
      const fixBonus = Math.min(totalFixed * 2, 20); // Max 20 points from fixes
      score = Math.min(score + fixBonus, 100);
      
      // Ensure score doesn't go below 0
      score = Math.max(score, 0);

      const newHealthData: HealthData = {
        score: Math.round(score),
        isStable: score >= 75,
        criticalIssuesCount: criticalCount,
        totalActiveIssues: totalActive,
        totalFixedIssues: totalFixed,
        lastCalculated: new Date()
      };

      setHealthData(newHealthData);
      console.log('🎯 Health Score Calculated:', newHealthData);

    } catch (error) {
      console.error('Error calculating health score:', error);
    }
  };

  useEffect(() => {
    calculateHealthScore();
  }, []);

  return {
    ...healthData,
    recalculate: calculateHealthScore
  };
};
