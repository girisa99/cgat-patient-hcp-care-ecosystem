
import { useState, useEffect, useCallback } from 'react';
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

  const calculateHealthScore = useCallback(async () => {
    try {
      console.log('🎯 Calculating health score from database data');
      
      // Get active issues count by severity from database
      const { data: activeIssues, error: activeError } = await supabase
        .from('active_issues')
        .select('issue_severity')
        .eq('status', 'active');

      if (activeError) {
        console.error('Error fetching active issues:', activeError);
        throw activeError;
      }

      // Get total fixed issues count from database
      const { count: fixedCount, error: fixedError } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (fixedError) {
        console.error('Error fetching fixed issues count:', fixedError);
        throw fixedError;
      }

      const activeIssuesList = activeIssues || [];
      const criticalCount = activeIssuesList.filter(i => i.issue_severity === 'critical').length;
      const highCount = activeIssuesList.filter(i => i.issue_severity === 'high').length;
      const mediumCount = activeIssuesList.filter(i => i.issue_severity === 'medium').length;
      const lowCount = activeIssuesList.filter(i => i.issue_severity === 'low').length;
      const totalActive = activeIssuesList.length;
      const totalFixed = fixedCount || 0;

      console.log('📊 Issues breakdown:', {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        totalActive,
        totalFixed
      });

      // Enhanced health score calculation
      let score = 100;
      
      // Deduct points based on severity
      score -= (criticalCount * 25);  // Critical issues heavily impact score
      score -= (highCount * 15);     // High severity issues
      score -= (mediumCount * 8);    // Medium severity issues
      score -= (lowCount * 3);       // Low severity issues
      
      // Bonus for fixes applied
      const fixBonus = Math.min(totalFixed * 2, 20);
      score += fixBonus;
      
      // Stability bonus if no critical issues
      if (criticalCount === 0) {
        score += 10;
      }
      
      // Performance bonus for low total issues
      if (totalActive < 3) {
        score += 15;
      } else if (totalActive < 6) {
        score += 5;
      }
      
      // Ensure score is within bounds
      score = Math.max(0, Math.min(100, score));

      const newHealthData: HealthData = {
        score: Math.round(score),
        isStable: score >= 80 && criticalCount === 0,
        criticalIssuesCount: criticalCount,
        totalActiveIssues: totalActive,
        totalFixedIssues: totalFixed,
        lastCalculated: new Date()
      };

      setHealthData(newHealthData);
      
      console.log('✅ Health Score Calculated:', {
        score: newHealthData.score,
        isStable: newHealthData.isStable,
        breakdown: {
          criticalIssues: criticalCount,
          totalActive: totalActive,
          totalFixed: totalFixed,
          calculationDetails: {
            baseScore: 100,
            criticalPenalty: criticalCount * 25,
            highPenalty: highCount * 15,
            mediumPenalty: mediumCount * 8,
            lowPenalty: lowCount * 3,
            fixBonus: fixBonus,
            finalScore: score
          }
        }
      });

    } catch (error) {
      console.error('❌ Error calculating health score:', error);
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
  }, []); // Empty dependency array since the function doesn't depend on external state

  useEffect(() => {
    console.log('🎯 Health score hook initialized - calculating initial score');
    calculateHealthScore();
  }, [calculateHealthScore]);

  return {
    ...healthData,
    recalculate: calculateHealthScore
  };
};
