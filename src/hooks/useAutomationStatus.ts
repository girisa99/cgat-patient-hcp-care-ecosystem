
/**
 * Automation Status Hook
 * Handles automation status and coordination
 */

import { useState, useEffect } from 'react';
import { ComprehensiveAutomationCoordinator } from '@/utils/verification/ComprehensiveAutomationCoordinator';

export const useAutomationStatus = () => {
  const [automationStatus, setAutomationStatus] = useState<any>(null);

  useEffect(() => {
    setAutomationStatus(ComprehensiveAutomationCoordinator.getAutomationStatus());

    // Listen for automation cycle completions
    const handleAutomationComplete = (event: CustomEvent) => {
      console.log('🔄 Automation cycle completed, updating status...');
      setAutomationStatus(ComprehensiveAutomationCoordinator.getAutomationStatus());
    };

    window.addEventListener('automation-cycle-complete', handleAutomationComplete as EventListener);

    return () => {
      window.removeEventListener('automation-cycle-complete', handleAutomationComplete as EventListener);
    };
  }, []);

  return {
    automationStatus,
    refreshStatus: () => setAutomationStatus(ComprehensiveAutomationCoordinator.getAutomationStatus())
  };
};
