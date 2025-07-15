/**
 * STABILITY FRAMEWORK INTEGRATION
 * Integrates compliance monitor with existing stability system
 * Ensures continuous enforcement of framework rules
 */
import React, { useEffect, useState } from 'react';
import { FrameworkComplianceMonitor } from '../utils/stability/FrameworkComplianceMonitor';
import { useStability } from '../components/stability/StabilityHooks';

// Global compliance monitor instance
let globalComplianceMonitor: FrameworkComplianceMonitor | null = null;

export const useComplianceMonitoring = (config = {}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [complianceScore, setComplianceScore] = useState(100);
  const [violations, setViolations] = useState([]);
  const stability = useStability();

  useEffect(() => {
    // Initialize compliance monitor if not already done
    if (!globalComplianceMonitor) {
      globalComplianceMonitor = new FrameworkComplianceMonitor({
        strictMode: true,
        complexityThreshold: 300,
        ...config
      });

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

    // Auto-start monitoring in development
    if (process.env.NODE_ENV === 'development' && !isMonitoring) {
      globalComplianceMonitor?.startMonitoring();
    }

    return () => {
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

  return {
    isMonitoring,
    complianceScore,
    violations,
    startMonitoring,
    stopMonitoring,
    getComplianceReport,
    monitor: globalComplianceMonitor
  };
};

export default useComplianceMonitoring;