
/**
 * Unified Verification Actions Hook
 * Single source of truth for all verification actions
 */

import { useState, useCallback } from 'react';
import { ComprehensiveSystemVerifier } from '@/utils/verification/ComprehensiveSystemVerifier';
import { automatedVerification, AutomatedVerificationConfig } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { ValidationRequest } from '@/utils/verification/SimplifiedValidator';
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
        description: "Running complete system validation including single source compliance...",
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
   * Trigger automation cycle manually
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
        title: "🤖 Automation Cycle Started",
        description: "Running complete automation cycle with single source validation...",
        variant: "default",
      });

      // Run comprehensive verification as part of automation
      const result = await ComprehensiveSystemVerifier.performComprehensiveVerification('automated');

      toast({
        title: "🤖 Automation Cycle Complete",
        description: `Health Score: ${result.overallHealthScore}/100 - Single Source Compliance: ${result.singleSourceCompliance.complianceScore}%`,
        variant: result.criticalIssuesFound > 0 ? "destructive" : "default",
      });

      console.log('✅ Automation cycle completed successfully');
      return { comprehensiveResults: result };

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

  /**
   * Verify before creation (unified approach)
   */
  const verifyBeforeCreation = useCallback(async (request: ValidationRequest) => {
    console.log('🔍 AUTOMATIC VERIFICATION TRIGGERED for:', request);
    
    try {
      const canProceed = await automatedVerification.verifyBeforeCreation(request);
      
      if (!canProceed) {
        console.log('🚫 CREATION AUTOMATICALLY BLOCKED by verification system');
      } else {
        console.log('✅ CREATION AUTOMATICALLY APPROVED by verification system');
      }
      
      return canProceed;
    } catch (error) {
      console.error('❌ AUTOMATIC VERIFICATION ERROR:', error);
      toast({
        title: "❌ Verification Error",
        description: "Automatic verification encountered an error but creation is allowed.",
        variant: "destructive",
      });
      return true;
    }
  }, [toast]);

  /**
   * Update automation configuration
   */
  const updateConfig = useCallback((newConfig: Partial<AutomatedVerificationConfig>) => {
    automatedVerification.updateConfig(newConfig);
    toast({
      title: "⚙️ Configuration Updated",
      description: "Automatic verification settings have been updated.",
      variant: "default",
    });
  }, [toast]);

  return {
    isVerifying,
    error,
    runComprehensiveVerification,
    triggerAutomationCycle,
    verifyBeforeCreation,
    updateConfig,
    clearError: () => setError(null)
  };
};
