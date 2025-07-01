
/**
 * Comprehensive Verification Hook (Single Source of Truth)
 * Main coordinator hook that consolidates all verification functionality
 */

import { useVerificationResults } from './useVerificationResults';
import { useAutomationStatus } from './useAutomationStatus';
import { useVerificationActions } from './useVerificationActions';
import { useVerificationReports } from './useVerificationReports';
import { useToast } from './use-toast';

export const useComprehensiveVerification = () => {
  const { toast } = useToast();
  
  // Use single source focused hooks
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
    // Single source results
    verificationResult: verificationResults.verificationResult,
    hasResults: verificationResults.hasResults,
    healthScore: verificationResults.healthScore,
    criticalIssues: verificationResults.criticalIssues,
    totalIssues: verificationResults.totalIssues,
    isSystemStable: verificationResults.isSystemStable,
    syncStatus: verificationResults.syncStatus,
    lastVerification: verificationResults.lastVerification,
    basedOnOriginalDB: verificationResults.basedOnOriginalDB,

    // Single source status
    automationStatus: automationStatus.automationStatus,

    // Single source actions
    isVerifying: verificationActions.isVerifying,
    error: verificationActions.error,

    // Consolidated actions
    runComprehensiveVerification,
    triggerAutomationCycle,
    downloadComprehensiveReport,
    verifyBeforeCreation: verificationActions.verifyBeforeCreation,
    updateConfig: verificationActions.updateConfig,

    // Utilities
    clearError: verificationActions.clearError
  };
};
