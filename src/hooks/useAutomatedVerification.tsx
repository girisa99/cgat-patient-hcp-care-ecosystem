
import { useState, useEffect } from 'react';
import { 
  automatedVerification, 
  VerificationSummary, 
  AutomatedVerificationConfig 
} from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useVerificationEventHandlers } from './useVerificationEventHandlers';
import { useVerificationHistory } from './useVerificationHistory';
import { useVerificationActions } from './useVerificationActions';

export const useAutomatedVerification = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSummary, setLastSummary] = useState<VerificationSummary | null>(null);
  const [config, setConfig] = useState<AutomatedVerificationConfig | null>(null);

  const { 
    verificationHistory, 
    loadVerificationHistory, 
    updateVerificationHistory 
  } = useVerificationHistory();

  const {
    verifyBeforeCreation,
    startVerification,
    stopVerification,
    updateConfig,
    runManualScan
  } = useVerificationActions();

  // Event handlers
  const handleVerificationComplete = (summary: VerificationSummary) => {
    setLastSummary(summary);
    updateVerificationHistory(summary);
  };

  const handleVerificationStarted = () => {
    setIsRunning(true);
  };

  const handleVerificationStopped = () => {
    setIsRunning(false);
  };

  const handleCriticalIssues = (summary: VerificationSummary) => {
    // Critical issues are handled in the event handlers hook
  };

  const handlePeriodicScanComplete = (summary: VerificationSummary) => {
    // Periodic scan alerts are handled in the event handlers hook
  };

  // Set up event listeners
  useVerificationEventHandlers({
    onVerificationComplete: handleVerificationComplete,
    onVerificationStarted: handleVerificationStarted,
    onVerificationStopped: handleVerificationStopped,
    onCriticalIssues: handleCriticalIssues,
    onPeriodicScanComplete: handlePeriodicScanComplete
  });

  // Auto-initialize and load history
  useEffect(() => {
    const status = automatedVerification.getStatus();
    setIsRunning(status.isRunning);
    setConfig(status.config);

    const lastResult = loadVerificationHistory();
    if (lastResult) {
      setLastSummary(lastResult);
    }
  }, [loadVerificationHistory]);

  return {
    // Status
    isRunning,
    config,
    lastSummary,
    verificationHistory,
    
    // Actions
    verifyBeforeCreation,
    startVerification,
    stopVerification,
    updateConfig,
    runManualScan,
    
    // Helper functions
    hasIssues: lastSummary ? lastSummary.issuesFound > 0 : false,
    hasCriticalIssues: lastSummary ? lastSummary.criticalIssues > 0 : false,
    getStatus: () => automatedVerification.getStatus(),
    isAutomatic: true
  };
};

// HOC for automatic verification integration
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

// Hook for components that need to know about automatic verification status
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
