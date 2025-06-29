/**
 * Comprehensive Verification Hook
 * Integrates with automation coordinator for consistent results
 */

import { useState, useEffect, useCallback } from 'react';
import { ComprehensiveSystemVerifier, ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';
import { ComprehensiveAutomationCoordinator, AutomationExecutionResult } from '@/utils/verification/ComprehensiveAutomationCoordinator';
import { useToast } from './use-toast';

export const useComprehensiveVerification = () => {
  const [verificationResult, setVerificationResult] = useState<ComprehensiveVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [automationStatus, setAutomationStatus] = useState<any>(null);
  const { toast } = useToast();

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
    setAutomationStatus(ComprehensiveAutomationCoordinator.getAutomationStatus());

    // Listen for automation cycle completions
    const handleAutomationComplete = (event: CustomEvent) => {
      console.log('🔄 Automation cycle completed, updating results...');
      const { results } = event.detail;
      if (results.comprehensiveResults) {
        setVerificationResult(results.comprehensiveResults);
      }
      setAutomationStatus(ComprehensiveAutomationCoordinator.getAutomationStatus());
      
      toast({
        title: "🤖 Automated Verification Complete",
        description: `Health Score: ${results.healthScoreCalculation.score}/100 - Based on Original Database`,
        variant: "default",
      });
    };

    window.addEventListener('automation-cycle-complete', handleAutomationComplete as EventListener);

    return () => {
      window.removeEventListener('automation-cycle-complete', handleAutomationComplete as EventListener);
    };
  }, [toast]);

  /**
   * Run comprehensive verification manually
   */
  const runComprehensiveVerification = useCallback(async () => {
    if (isVerifying) {
      console.log('⏳ Verification already in progress');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      console.log('🚀 Running manual comprehensive verification...');
      
      toast({
        title: "🔍 Comprehensive Verification Started",
        description: "Running complete system validation based on original database...",
        variant: "default",
      });

      const result = await ComprehensiveSystemVerifier.performComprehensiveVerification('manual');
      setVerificationResult(result);

      toast({
        title: "✅ Verification Complete",
        description: `Health Score: ${result.overallHealthScore}/100 - ${result.criticalIssuesFound} critical issues found`,
        variant: result.criticalIssuesFound > 0 ? "destructive" : "default",
      });

      console.log('✅ Manual verification completed successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "❌ Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });

      console.error('❌ Manual verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  }, [isVerifying, toast]);

  /**
   * Trigger full automation cycle manually
   */
  const triggerAutomationCycle = useCallback(async () => {
    if (isVerifying) {
      console.log('⏳ Automation already in progress');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      console.log('🤖 Triggering manual automation cycle...');
      
      toast({
        title: "🤖 30-Minute Automation Cycle Started",
        description: "Running complete automation cycle with database sync...",
        variant: "default",
      });

      const result = await ComprehensiveAutomationCoordinator.triggerManualExecution();
      setVerificationResult(result.comprehensiveResults);
      setAutomationStatus(ComprehensiveAutomationCoordinator.getAutomationStatus());

      toast({
        title: "🤖 Automation Cycle Complete",
        description: `Health Score: ${result.healthScoreCalculation.score}/100 - Results synced to database`,
        variant: result.automationStatus.allComponentsExecuted ? "default" : "destructive",
      });

      console.log('✅ Automation cycle completed successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "❌ Automation Cycle Failed",
        description: errorMessage,
        variant: "destructive",
      });

      console.error('❌ Automation cycle failed:', error);
    } finally {
      setIsVerifying(false);
    }
  }, [isVerifying, toast]);

  /**
   * Download comprehensive report
   */
  const downloadComprehensiveReport = useCallback(() => {
    if (!verificationResult) {
      toast({
        title: "⚠️ No Results Available",
        description: "Please run a verification first",
        variant: "destructive",
      });
      return;
    }

    try {
      const report = ComprehensiveSystemVerifier.generateComprehensiveReport(verificationResult);
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprehensive-verification-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📄 Report Downloaded",
        description: "Comprehensive verification report saved successfully",
        variant: "default",
      });

    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "❌ Download Failed",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  }, [verificationResult, toast]);

  return {
    // Results
    verificationResult,
    automationStatus,
    isVerifying,
    error,

    // Actions
    runComprehensiveVerification,
    triggerAutomationCycle,
    downloadComprehensiveReport,

    // Status helpers
    hasResults: !!verificationResult,
    healthScore: verificationResult?.overallHealthScore || 0,
    criticalIssues: verificationResult?.criticalIssuesFound || 0,
    totalIssues: verificationResult?.totalActiveIssues || 0,
    isSystemStable: verificationResult?.systemHealth.isSystemStable || false,
    syncStatus: verificationResult?.syncStatus || 'unknown',
    lastVerification: verificationResult?.timestamp || null,
    basedOnOriginalDB: verificationResult?.automationMetadata.dataSource === 'original_database'
  };
};
