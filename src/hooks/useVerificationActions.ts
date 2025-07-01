
/**
 * Verification Actions Hook
 * Handles manual verification and automation triggers
 */

import { useState, useCallback } from 'react';
import { ComprehensiveSystemVerifier } from '@/utils/verification/ComprehensiveSystemVerifier';
import { ComprehensiveAutomationCoordinator } from '@/utils/verification/ComprehensiveAutomationCoordinator';
import { useToast } from './use-toast';

export const useVerificationActions = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Run comprehensive verification manually
   */
  const runComprehensiveVerification = useCallback(async () => {
    if (isVerifying) {
      console.log('⏳ Verification already in progress');
      return null;
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

      toast({
        title: "✅ Verification Complete",
        description: `Health Score: ${result.overallHealthScore}/100 - ${result.criticalIssuesFound} critical issues found`,
        variant: result.criticalIssuesFound > 0 ? "destructive" : "default",
      });

      console.log('✅ Manual verification completed successfully');
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "❌ Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });

      console.error('❌ Manual verification failed:', error);
      return null;
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
      return null;
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

      toast({
        title: "🤖 Automation Cycle Complete",
        description: `Health Score: ${result.healthScoreCalculation.score}/100 - Results synced to database`,
        variant: result.automationStatus.allComponentsExecuted ? "default" : "destructive",
      });

      console.log('✅ Automation cycle completed successfully');
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "❌ Automation Cycle Failed",
        description: errorMessage,
        variant: "destructive",
      });

      console.error('❌ Automation cycle failed:', error);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, [isVerifying, toast]);

  return {
    isVerifying,
    error,
    runComprehensiveVerification,
    triggerAutomationCycle,
    clearError: () => setError(null)
  };
};
