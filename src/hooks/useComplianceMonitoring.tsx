/**
 * STABILITY FRAMEWORK INTEGRATION
 * Integrates compliance monitor with existing stability system
 * Ensures continuous enforcement of framework rules
 */
import React, { useEffect, useState } from 'react';
import { FrameworkComplianceMonitor } from '../utils/stability/FrameworkComplianceMonitor';
import { PromptGovernanceInterceptor } from '../utils/stability/PromptGovernanceInterceptor';
import { useStability } from '../components/stability/StabilityHooks';

// Global compliance monitor instance
let globalComplianceMonitor: FrameworkComplianceMonitor | null = null;
let globalPromptInterceptor: PromptGovernanceInterceptor | null = null;

export const useComplianceMonitoring = (config = {}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [complianceScore, setComplianceScore] = useState(100);
  const [violations, setViolations] = useState([]);
  const [promptStats, setPromptStats] = useState({ totalPrompts: 0, violationsFound: 0, averageComplianceScore: 100 });
  const stability = useStability();

  useEffect(() => {
    // Initialize compliance monitor if not already done
    if (!globalComplianceMonitor) {
      globalComplianceMonitor = new FrameworkComplianceMonitor({
        strictMode: true,
        complexityThreshold: 300,
        ...config
      });
    }

    // Initialize prompt interceptor if not already done
    if (!globalPromptInterceptor) {
      globalPromptInterceptor = new PromptGovernanceInterceptor();

      // Connect compliance monitor to stability system
      globalComplianceMonitor.on('violations_detected', (event) => {
        setViolations(prev => [...prev, ...event.violations].slice(-50)); // Keep last 50
        
        // Report to stability system
        stability.addProtectionAlert(
          `Compliance violation in ${event.filePath}: ${event.violations.length} issues`
        );
      });

      globalComplianceMonitor.on('compliance_audit', (results) => {
        setComplianceScore(results.complianceScore);
      });

      globalComplianceMonitor.on('monitoring_started', () => {
        setIsMonitoring(true);
      });

      globalComplianceMonitor.on('monitoring_stopped', () => {
        setIsMonitoring(false);
      });
    }

    // Update prompt stats periodically
    const updatePromptStats = () => {
      if (globalPromptInterceptor) {
        setPromptStats(globalPromptInterceptor.getViolationStats());
      }
    };

    updatePromptStats();
    const interval = setInterval(updatePromptStats, 5000); // Update every 5 seconds

    // Auto-start monitoring in development
    if (process.env.NODE_ENV === 'development' && !isMonitoring) {
      globalComplianceMonitor?.startMonitoring();
    }

    return () => {
      clearInterval(interval);
      // Cleanup on unmount
      if (globalComplianceMonitor && isMonitoring) {
        globalComplianceMonitor.stopMonitoring();
      }
    };
  }, [config, isMonitoring, stability]);

  const startMonitoring = () => {
    globalComplianceMonitor?.startMonitoring();
  };

  const stopMonitoring = () => {
    globalComplianceMonitor?.stopMonitoring();
  };

  const getComplianceReport = () => {
    return globalComplianceMonitor?.generateComplianceReport();
  };

  const interceptPrompt = async (promptData: any) => {
    return globalPromptInterceptor?.interceptPrompt(promptData) || promptData;
  };

  const getPromptHistory = () => {
    return globalPromptInterceptor?.getPromptHistory() || [];
  };

  return {
    isMonitoring,
    complianceScore,
    violations,
    promptStats,
    startMonitoring,
    stopMonitoring,
    getComplianceReport,
    interceptPrompt,
    getPromptHistory,
    monitor: globalComplianceMonitor,
    interceptor: globalPromptInterceptor
  };
};

export default useComplianceMonitoring;