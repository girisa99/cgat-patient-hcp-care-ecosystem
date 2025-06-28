
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
  uiuxActive: number;
  databaseActive: number;
  codeQualityActive: number;
  securityFixed: number;
  uiuxFixed: number;
  databaseFixed: number;
  codeQualityFixed: number;
  criticalFixed: number;
  highFixed: number;
  mediumFixed: number;
  lowFixed: number;
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
    uiuxActive: 0,
    databaseActive: 0,
    codeQualityActive: 0,
    securityFixed: 0,
    uiuxFixed: 0,
    databaseFixed: 0,
    codeQualityFixed: 0,
    criticalFixed: 0,
    highFixed: 0,
    mediumFixed: 0,
    lowFixed: 0,
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
    const uiuxCount = currentIssues.filter(issue => issue.source === 'UI/UX Scanner').length;
    const databaseCount = currentIssues.filter(issue => issue.source === 'Database Scanner').length;
    const codeQualityCount = currentIssues.filter(issue => issue.source === 'Code Quality Scanner').length;
    
    // Calculate fixed counts by checking localStorage for implemented fixes
    const securityFixedCount = [
      'mfa_enforcement_implemented',
      'rbac_implementation_active',
      'log_sanitization_active',
      'debug_security_implemented',
      'api_authorization_implemented'
    ].filter(key => localStorage.getItem(key) === 'true').length;

    const uiuxFixedCount = [
      'uiux_improvements_applied'
    ].filter(key => localStorage.getItem(key) === 'true').length;

    const codeQualityFixedCount = [
      'code_quality_improved'
    ].filter(key => localStorage.getItem(key) === 'true').length;

    const databaseFixedCount = 0; // No database fixes implemented yet

    // Calculate fixed by severity (approximation based on fixed categories)
    const criticalFixedCount = Math.floor(securityFixedCount * 0.4); // Assume 40% of security fixes are critical
    const highFixedCount = Math.floor((securityFixedCount * 0.6) + (uiuxFixedCount * 0.5));
    const mediumFixedCount = Math.floor(codeQualityFixedCount + (uiuxFixedCount * 0.5));
    const lowFixedCount = 0;
    
    const totalFixed = Math.max(
      getTotalFixedCount(),
      processedData.totalRealFixesApplied,
      processedData.autoDetectedBackendFixes,
      securityFixedCount + uiuxFixedCount + codeQualityFixedCount + databaseFixedCount
    );
    
    const newMetrics: UnifiedMetrics = {
      totalActiveIssues: currentIssues.length,
      totalFixedIssues: totalFixed,
      criticalActive: criticalCount,
      highActive: highCount,
      mediumActive: mediumCount,
      lowActive: lowCount,
      securityActive: securityCount,
      uiuxActive: uiuxCount,
      databaseActive: databaseCount,
      codeQualityActive: codeQualityCount,
      securityFixed: securityFixedCount,
      uiuxFixed: uiuxFixedCount,
      databaseFixed: databaseFixedCount,
      codeQualityFixed: codeQualityFixedCount,
      criticalFixed: criticalFixedCount,
      highFixed: highFixedCount,
      mediumFixed: mediumFixedCount,
      lowFixed: lowFixedCount,
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
