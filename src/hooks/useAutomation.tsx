
/**
 * Universal Automation Hook
 * Provides access to all automation systems
 */

import { useState, useEffect } from 'react';
import { automationController, AutomationStatus } from '@/utils/automation/AutomationController';

export const useAutomation = () => {
  const [status, setStatus] = useState<AutomationStatus>(() => 
    automationController.getStatus()
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Update status when automation is ready
    const handleAutomationReady = (event: CustomEvent) => {
      setStatus(event.detail);
      setIsReady(true);
    };

    window.addEventListener('automation-ready', handleAutomationReady);
    
    // Check if already ready
    if (automationController.isReady()) {
      setStatus(automationController.getStatus());
      setIsReady(true);
    }

    return () => {
      window.removeEventListener('automation-ready', handleAutomationReady);
    };
  }, []);

  // Periodically update status
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = automationController.getStatus();
      setStatus(currentStatus);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getHealthReport = () => automationController.getHealthReport();
  
  const registerNewModule = (tableName: string, moduleName: string) => 
    automationController.registerNewModule(tableName, moduleName);

  const reset = () => automationController.reset();

  return {
    status,
    isReady,
    getHealthReport,
    registerNewModule,
    reset
  };
};
