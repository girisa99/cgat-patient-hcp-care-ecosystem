
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
      // Get active issues count by severity from original database
      const { data: activeIssues, error: activeError } = await supabase
        .from('active_issues')
        .select('issue_severity')
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get total fixed issues count from original database
      const { count: fixedCount, error: fixedError } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (fixedError) throw fixedError;

      const criticalCount = activeIssues?.filter(i => i.issue_severity === 'critical').length || 0;
      const highCount = activeIssues?.filter(i => i.issue_severity === 'high').length || 0;
      const mediumCount = activeIssues?.filter(i => i.issue_severity === 'medium').length || 0;
      const totalActive = activeIssues?.length || 0;
      const totalFixed = fixedCount || 0;

      // Enhanced health score calculation considering overall system health
      let score = 100;
      
      // Base system health factors (not just issues)
      const baseSystemHealth = 85; // Starting point for a functional system
      
      // Deduct points for active issues (more aggressive scoring)
      score = baseSystemHealth;
      score -= (criticalCount * 30); // Critical issues heavily impact score
      score -= (highCount * 15);     // High issues significantly impact score
      score -= (mediumCount * 8);    // Medium issues moderately impact score
      
      // Add bonus for fixes and system improvements
      const fixBonus = Math.min(totalFixed * 3, 25); // Max 25 points from fixes
      score = Math.min(score + fixBonus, 100);
      
      // Additional system health factors
      const codeHealthBonus = criticalCount === 0 ? 10 : 0; // Bonus for no critical issues
      const stabilityBonus = totalActive < 5 ? 5 : 0; // Bonus for low issue count
      
      score = Math.min(score + codeHealthBonus + stabilityBonus, 100);
      
      // Ensure score doesn't go below 0
      score = Math.max(score, 0);

      const newHealthData: HealthData = {
        score: Math.round(score),
        isStable: score >= 80, // Higher threshold for stability
        criticalIssuesCount: criticalCount,
        totalActiveIssues: totalActive,
        totalFixedIssues: totalFixed,
        lastCalculated: new Date()
      };

      setHealthData(newHealthData);
      console.log('🎯 Enhanced Health Score Calculated:', {
        ...newHealthData,
        breakdown: {
          baseHealth: baseSystemHealth,
          criticalPenalty: criticalCount * 30,
          highPenalty: highCount * 15,
          mediumPenalty: mediumCount * 8,
          fixBonus,
          codeHealthBonus,
          stabilityBonus
        }
      });

    } catch (error) {
      console.error('Error calculating enhanced health score:', error);
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
