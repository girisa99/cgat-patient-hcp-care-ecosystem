
/**
 * Enhanced Automated Verification Hook
 * 
 * Fully automatic integration with zero manual intervention required
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
  const [verificationHistory, setVerificationHistory] = useState<VerificationSummary[]>([]);
  const { toast } = useToast();

  // Auto-initialize and listen for events
  useEffect(() => {
    const status = automatedVerification.getStatus();
    setIsRunning(status.isRunning);
    setConfig(status.config);

    // Load verification history
    loadVerificationHistory();

    // Listen for automatic verification events
    const handleVerificationComplete = (event: CustomEvent) => {
      const summary = event.detail as VerificationSummary;
      setLastSummary(summary);
      updateVerificationHistory(summary);
      
      // Show automatic notifications
      showAutomaticNotification(summary);
    };

    const handleVerificationStarted = () => {
      setIsRunning(true);
    };

    const handleVerificationStopped = () => {
      setIsRunning(false);
    };

    const handleCriticalIssues = (event: CustomEvent) => {
      const summary = event.detail as VerificationSummary;
      toast({
        title: "🚨 Critical Issues Detected",
        description: `${summary.criticalIssues} critical issues found. Creation blocked automatically.`,
        variant: "destructive",
      });
    };

    const handlePeriodicScanComplete = (event: CustomEvent) => {
      const summary = event.detail as VerificationSummary;
      if (summary.issuesFound > 0) {
        toast({
          title: "📊 Periodic Scan Alert",
          description: `Background scan found ${summary.issuesFound} issues.`,
          variant: "default",
        });
      }
    };

    // Add event listeners
    window.addEventListener('automated-verification-verification-complete', handleVerificationComplete);
    window.addEventListener('automated-verification-verification-started', handleVerificationStarted);
    window.addEventListener('automated-verification-verification-stopped', handleVerificationStopped);
    window.addEventListener('automated-verification-critical-issues-detected', handleCriticalIssues);
    window.addEventListener('automated-verification-periodic-scan-complete', handlePeriodicScanComplete);

    return () => {
      window.removeEventListener('automated-verification-verification-complete', handleVerificationComplete);
      window.removeEventListener('automated-verification-verification-started', handleVerificationStarted);
      window.removeEventListener('automated-verification-verification-stopped', handleVerificationStopped);
      window.removeEventListener('automated-verification-critical-issues-detected', handleCriticalIssues);
      window.removeEventListener('automated-verification-periodic-scan-complete', handlePeriodicScanComplete);
    };
  }, [toast]);

  const loadVerificationHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('verification-results') || '[]');
      setVerificationHistory(history);
      if (history.length > 0) {
        setLastSummary(history[0]);
      }
    } catch (error) {
      console.warn('Failed to load verification history:', error);
    }
  };

  const updateVerificationHistory = (summary: VerificationSummary) => {
    setVerificationHistory(prev => [summary, ...prev.slice(0, 49)]);
  };

  const showAutomaticNotification = (summary: VerificationSummary) => {
    if (summary.criticalIssues > 0) {
      toast({
        title: "🚨 Critical Issues",
        description: `${summary.criticalIssues} critical issues detected and blocked automatically.`,
        variant: "destructive",
      });
    } else if (summary.issuesFound > 0) {
      toast({
        title: "⚠️ Issues Detected",
        description: `${summary.issuesFound} issues found. ${summary.autoFixesApplied} automatically fixed.`,
        variant: "default",
      });
    } else if (summary.autoFixesApplied > 0) {
      toast({
        title: "🔧 Auto-fixes Applied",
        description: `${summary.autoFixesApplied} issues automatically resolved.`,
        variant: "default",
      });
    }
  };

  /**
   * AUTOMATIC verification before creation - ALWAYS RUNS
   */
  const verifyBeforeCreation = useCallback(async (request: ValidationRequest) => {
    console.log('🔍 AUTOMATIC VERIFICATION TRIGGERED for:', request);
    
    try {
      // This now ALWAYS runs automatically
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
      return true; // Allow creation on verification failure
    }
  }, [toast]);

  /**
   * Manual start (rarely needed since system auto-starts)
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
   * Manual stop (rarely needed)
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
   * Update configuration
   */
  const updateConfig = useCallback((newConfig: Partial<AutomatedVerificationConfig>) => {
    automatedVerification.updateConfig(newConfig);
    setConfig(prev => prev ? { ...prev, ...newConfig } : null);
    toast({
      title: "⚙️ Configuration Updated",
      description: "Automatic verification settings have been updated.",
      variant: "default",
    });
  }, [toast]);

  /**
   * Force manual scan (for testing purposes)
   */
  const runManualScan = useCallback(async () => {
    toast({
      title: "🔍 Manual Scan Started",
      description: "Running comprehensive verification scan...",
      variant: "default",
    });
    
    try {
      const dummyRequest: ValidationRequest = {
        componentType: 'module',
        description: 'Manual comprehensive scan trigger'
      };
      
      await automatedVerification.verifyBeforeCreation(dummyRequest);
      
      toast({
        title: "📊 Manual Scan Complete",
        description: "Comprehensive verification scan finished.",
        variant: "default",
      });
    } catch (error) {
      console.error('❌ Manual scan failed:', error);
      toast({
        title: "❌ Manual Scan Failed",
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
    verificationHistory,
    
    // Actions
    verifyBeforeCreation, // ALWAYS AUTOMATIC
    startVerification,    // Rarely needed
    stopVerification,     // Rarely needed
    updateConfig,
    runManualScan,        // For testing only
    
    // Helper functions
    hasIssues: lastSummary ? lastSummary.issuesFound > 0 : false,
    hasCriticalIssues: lastSummary ? lastSummary.criticalIssues > 0 : false,
    getStatus: () => automatedVerification.getStatus(),
    isAutomatic: true // Indicator that this is fully automatic
  };
};

/**
 * HOC for automatic verification integration
 */
export const withAutoVerification = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function AutoVerifiedComponent(props: P) {
    const { verifyBeforeCreation } = useAutomatedVerification();
    
    const enhancedProps = {
      ...props,
      verifyBeforeCreation,
      autoVerificationEnabled: true
    } as P & { 
      verifyBeforeCreation: typeof verifyBeforeCreation;
      autoVerificationEnabled: boolean;
    };
    
    return <WrappedComponent {...enhancedProps} />;
  };
};

/**
 * Hook for components that need to know about automatic verification status
 */
export const useAutoVerificationStatus = () => {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [lastActivity, setLastActivity] = useState<string>('');

  useEffect(() => {
    const status = automatedVerification.getStatus();
    setIsSystemActive(status.isRunning);
    setLastActivity(status.lastScanTimestamp || 'Never');

    const handleActivity = () => {
      setLastActivity(new Date().toISOString());
    };

    window.addEventListener('automated-verification-verification-complete', handleActivity);
    window.addEventListener('automated-verification-periodic-scan-complete', handleActivity);

    return () => {
      window.removeEventListener('automated-verification-verification-complete', handleActivity);
      window.removeEventListener('automated-verification-periodic-scan-complete', handleActivity);
    };
  }, []);

  return {
    isSystemActive,
    lastActivity,
    isFullyAutomatic: true
  };
};
