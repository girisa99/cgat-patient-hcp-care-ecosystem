
/**
 * Automated Verification Hook
 * 
 * Integrates automated verification into React components and development workflow
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  automatedVerification, 
  VerificationSummary, 
  AutomatedVerificationConfig 
} from '@/utils/verification/AutomatedVerificationOrchestrator';
import { ValidationRequest } from '@/utils/verification/SimplifiedValidator';
import { useToast } from '@/hooks/use-toast';

export const useAutomatedVerification = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSummary, setLastSummary] = useState<VerificationSummary | null>(null);
  const [config, setConfig] = useState<AutomatedVerificationConfig | null>(null);
  const { toast } = useToast();

  // Initialize and get status
  useEffect(() => {
    const status = automatedVerification.getStatus();
    setIsRunning(status.isRunning);
    setConfig(status.config);
  }, []);

  /**
   * Verify before creating component/hook/module
   */
  const verifyBeforeCreation = useCallback(async (request: ValidationRequest) => {
    console.log('🔍 Triggering automated verification for:', request);
    
    try {
      const summary = await automatedVerification.verifyBeforeCreation(request);
      setLastSummary(summary);
      
      // Show toast notifications for issues
      if (summary.criticalIssues > 0) {
        toast({
          title: "🚨 Critical Issues Detected",
          description: `${summary.criticalIssues} critical issues found. Creation blocked.`,
          variant: "destructive",
        });
        return false; // Block creation
      } else if (summary.issuesFound > 0) {
        toast({
          title: "⚠️ Issues Found",
          description: `${summary.issuesFound} issues detected. Check recommendations.`,
          variant: "default",
        });
      } else {
        toast({
          title: "✅ Verification Passed",
          description: "No issues found. Safe to proceed.",
          variant: "default",
        });
      }
      
      return summary.validationResult.canProceed;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      toast({
        title: "❌ Verification Error",
        description: "Verification system encountered an error.",
        variant: "destructive",
      });
      return true; // Allow creation on verification failure
    }
  }, [toast]);

  /**
   * Start verification system
   */
  const startVerification = useCallback(() => {
    automatedVerification.start();
    setIsRunning(true);
    toast({
      title: "🚀 Verification Started",
      description: "Automated verification system is now running.",
      variant: "default",
    });
  }, [toast]);

  /**
   * Stop verification system
   */
  const stopVerification = useCallback(() => {
    automatedVerification.stop();
    setIsRunning(false);
    toast({
      title: "⏹️ Verification Stopped",
      description: "Automated verification system has been stopped.",
      variant: "default",
    });
  }, [toast]);

  /**
   * Update verification configuration
   */
  const updateConfig = useCallback((newConfig: Partial<AutomatedVerificationConfig>) => {
    automatedVerification.updateConfig(newConfig);
    setConfig(prev => prev ? { ...prev, ...newConfig } : null);
    toast({
      title: "⚙️ Configuration Updated",
      description: "Verification settings have been updated.",
      variant: "default",
    });
  }, [toast]);

  /**
   * Run manual verification scan
   */
  const runManualScan = useCallback(async () => {
    toast({
      title: "🔍 Running Manual Scan",
      description: "Comprehensive verification scan started...",
      variant: "default",
    });
    
    try {
      // Trigger a comprehensive scan by creating a dummy request
      const dummyRequest: ValidationRequest = {
        componentType: 'module',
        description: 'Manual comprehensive scan'
      };
      
      const summary = await automatedVerification.verifyBeforeCreation(dummyRequest);
      setLastSummary(summary);
      
      toast({
        title: "📊 Scan Complete",
        description: `Found ${summary.issuesFound} issues, ${summary.recommendations.length} recommendations.`,
        variant: summary.issuesFound > 0 ? "default" : "default",
      });
    } catch (error) {
      console.error('❌ Manual scan failed:', error);
      toast({
        title: "❌ Scan Failed",
        description: "Manual verification scan encountered an error.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    // Status
    isRunning,
    config,
    lastSummary,
    
    // Actions
    verifyBeforeCreation,
    startVerification,
    stopVerification,
    updateConfig,
    runManualScan,
    
    // Helper functions
    hasIssues: lastSummary ? lastSummary.issuesFound > 0 : false,
    hasCriticalIssues: lastSummary ? lastSummary.criticalIssues > 0 : false,
    getStatus: () => automatedVerification.getStatus()
  };
};

/**
 * Higher-order component that adds automated verification to module creation
 */
export const withAutomatedVerification = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function VerifiedComponent(props: P) {
    const { verifyBeforeCreation } = useAutomatedVerification();
    
    // Add verification prop to wrapped component
    const enhancedProps = {
      ...props,
      verifyBeforeCreation
    } as P & { verifyBeforeCreation: typeof verifyBeforeCreation };
    
    return <WrappedComponent {...enhancedProps} />;
  };
};
