
/**
 * Comprehensive Verification Hook (Refactored)
 * Main coordinator hook that uses smaller, focused hooks
 */

import { useVerificationResults } from './useVerificationResults';
import { useAutomationStatus } from './useAutomationStatus';
import { useVerificationActions } from './useVerificationActions';
import { useVerificationReports } from './useVerificationReports';
import { useToast } from './use-toast';

export const useComprehensiveVerification = () => {
  const { toast } = useToast();
  
  // Use smaller, focused hooks
  const verificationResults = useVerificationResults();
  const automationStatus = useAutomationStatus();
  const verificationActions = useVerificationActions();
  const verificationReports = useVerificationReports();

  // Enhanced actions that update results state
  const runComprehensiveVerification = async () => {
    const result = await verificationActions.runComprehensiveVerification();
    if (result) {
      verificationResults.setVerificationResult(result);
    }
    return result;
  };

  const triggerAutomationCycle = async () => {
    const result = await verificationActions.triggerAutomationCycle();
    if (result && result.comprehensiveResults) {
      verificationResults.setVerificationResult(result.comprehensiveResults);
      automationStatus.refreshStatus();
    }
    return result;
  };

  const downloadComprehensiveReport = () => {
    verificationReports.downloadComprehensiveReport(verificationResults.verificationResult);
  };

  return {
    // Results from verification results hook
    verificationResult: verificationResults.verificationResult,
    hasResults: verificationResults.hasResults,
    healthScore: verificationResults.healthScore,
    criticalIssues: verificationResults.criticalIssues,
    totalIssues: verificationResults.totalIssues,
    isSystemStable: verificationResults.isSystemStable,
    syncStatus: verificationResults.syncStatus,
    lastVerification: verificationResults.lastVerification,
    basedOnOriginalDB: verificationResults.basedOnOriginalDB,

    // Status from automation status hook
    automationStatus: automationStatus.automationStatus,

    // State from verification actions hook
    isVerifying: verificationActions.isVerifying,
    error: verificationActions.error,

    // Enhanced actions
    runComprehensiveVerification,
    triggerAutomationCycle,
    downloadComprehensiveReport,

    // Additional utilities
    clearError: verificationActions.clearError
  };
};
