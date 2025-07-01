
/**
 * Verification Results Hook
 * Manages verification result state and loading from storage
 */

import { useState, useEffect } from 'react';
import { ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';

export const useVerificationResults = () => {
  const [verificationResult, setVerificationResult] = useState<ComprehensiveVerificationResult | null>(null);

  // Load latest automation results on mount
  useEffect(() => {
    const loadLatestResults = () => {
      try {
        const stored = localStorage.getItem('latest_automation_results');
        if (stored) {
          const results = JSON.parse(stored);
          // Convert automation results to verification result format
          if (results.comprehensiveResults) {
            setVerificationResult(results.comprehensiveResults);
          }
        }
      } catch (error) {
        console.error('Error loading latest automation results:', error);
      }
    };

    loadLatestResults();
  }, []);

  // Listen for automation cycle completions
  useEffect(() => {
    const handleAutomationComplete = (event: CustomEvent) => {
      console.log('🔄 Automation cycle completed, updating results...');
      const { results } = event.detail;
      if (results.comprehensiveResults) {
        setVerificationResult(results.comprehensiveResults);
      }
    };

    window.addEventListener('automation-cycle-complete', handleAutomationComplete as EventListener);

    return () => {
      window.removeEventListener('automation-cycle-complete', handleAutomationComplete as EventListener);
    };
  }, []);

  return {
    verificationResult,
    setVerificationResult,
    hasResults: !!verificationResult,
    healthScore: verificationResult?.overallHealthScore || 0,
    criticalIssues: verificationResult?.criticalIssuesFound || 0,
    totalIssues: verificationResult?.totalActiveIssues || 0,
    isSystemStable: verificationResult?.systemHealth.isSystemStable || false,
    syncStatus: verificationResult?.syncStatus || 'unknown',
    lastVerification: verificationResult?.verificationTimestamp || null,
    basedOnOriginalDB: verificationResult?.automationMetadata?.dataSource === 'original_database' || false
  };
};
