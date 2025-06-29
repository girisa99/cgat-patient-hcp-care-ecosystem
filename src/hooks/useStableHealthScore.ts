
import { useUnifiedVerificationData } from './useUnifiedVerificationData';

// This hook now delegates to the unified verification system
// to ensure perfect consistency between health score and issues display
export const useStableHealthScore = () => {
  console.log('🎯 HealthScore hook: Using unified verification data for consistency');
  
  const {
    healthScore: score,
    isStable,
    criticalIssuesCount,
    totalActiveIssues,
    totalFixedIssues,
    lastCalculated,
    refresh: recalculate
  } = useUnifiedVerificationData();

  return {
    score,
    isStable,
    criticalIssuesCount,
    totalActiveIssues,
    totalFixedIssues,
    lastCalculated,
    recalculate
  };
};
