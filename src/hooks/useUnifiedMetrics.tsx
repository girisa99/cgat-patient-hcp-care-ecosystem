
import { useState, useEffect, useCallback } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useIssuesDataProcessor } from '@/components/security/IssuesDataProcessor';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';
import { scanForActualSecurityIssues } from '@/utils/issues/issueScanner';

export interface UnifiedMetrics {
  totalActiveIssues: number;
  totalFixedIssues: number;
  criticalActive: number;
  highActive: number;
  mediumActive: number;
  lowActive: number;
  securityActive: number;
  backendFixedCount: number;
  realFixesApplied: number;
  countsAligned: boolean;
  isUpdating: boolean;
  updateSource: string;
  lastUpdateTime: Date;
}

export const useUnifiedMetrics = (verificationSummary?: VerificationSummary) => {
  const [metrics, setMetrics] = useState<UnifiedMetrics>({
    totalActiveIssues: 0,
    totalFixedIssues: 0,
    criticalActive: 0,
    highActive: 0,
    mediumActive: 0,
    lowActive: 0,
    securityActive: 0,
    backendFixedCount: 0,
    realFixesApplied: 0,
    countsAligned: false,
    isUpdating: false,
    updateSource: 'initial',
    lastUpdateTime: new Date()
  });

  const { fixedIssues, getTotalFixedCount } = useFixedIssuesTracker();
  const processedData = useIssuesDataProcessor(verificationSummary, fixedIssues);

  const updateMetrics = useCallback((source: string = 'auto') => {
    console.log(`🔄 UPDATING UNIFIED METRICS FROM: ${source}`);
    
    setMetrics(prev => ({ ...prev, isUpdating: true }));
    
    // Force fresh scan for real issues
    const currentIssues = scanForActualSecurityIssues();
    
    const criticalCount = currentIssues.filter(issue => issue.severity === 'critical').length;
    const highCount = currentIssues.filter(issue => issue.severity === 'high').length;
    const mediumCount = currentIssues.filter(issue => issue.severity === 'medium').length;
    const lowCount = currentIssues.filter(issue => issue.severity === 'low').length;
    const securityCount = currentIssues.filter(issue => issue.source === 'Security Scanner').length;
    
    const totalFixed = Math.max(
      getTotalFixedCount(),
      processedData.totalRealFixesApplied,
      processedData.autoDetectedBackendFixes
    );
    
    const newMetrics: UnifiedMetrics = {
      totalActiveIssues: currentIssues.length,
      totalFixedIssues: totalFixed,
      criticalActive: criticalCount,
      highActive: highCount,
      mediumActive: mediumCount,
      lowActive: lowCount,
      securityActive: securityCount,
      backendFixedCount: processedData.autoDetectedBackendFixes,
      realFixesApplied: processedData.totalRealFixesApplied,
      countsAligned: true,
      isUpdating: false,
      updateSource: source,
      lastUpdateTime: new Date()
    };

    console.log('📊 UNIFIED METRICS UPDATED:', {
      activeIssues: newMetrics.totalActiveIssues,
      fixedIssues: newMetrics.totalFixedIssues,
      critical: newMetrics.criticalActive,
      high: newMetrics.highActive,
      medium: newMetrics.mediumActive,
      security: newMetrics.securityActive,
      source: newMetrics.updateSource
    });

    setMetrics(newMetrics);
  }, [getTotalFixedCount, processedData]);

  // Update metrics when verification summary changes
  useEffect(() => {
    updateMetrics('verification-summary-change');
  }, [verificationSummary, updateMetrics]);

  // Update metrics when processed data changes
  useEffect(() => {
    updateMetrics('processed-data-change');
  }, [processedData.allIssues.length, processedData.totalRealFixesApplied, updateMetrics]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('_implemented') || 
          e.key?.includes('_active') || 
          e.key?.includes('_applied') ||
          e.key === 'real-fixes-applied-count') {
        console.log('🔄 Storage change detected, updating metrics:', e.key);
        updateMetrics('storage-change');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateMetrics]);

  // Auto-refresh every 30 seconds to ensure fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      updateMetrics('auto-refresh');
    }, 30000);

    return () => clearInterval(interval);
  }, [updateMetrics]);

  return {
    metrics,
    updateMetrics,
    processedData
  };
};
