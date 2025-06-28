
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

  const updateMetrics = useCallback((source: string = 'manual') => {
    console.log(`🔄 UPDATING UNIFIED METRICS FROM: ${source} - Manual trigger only`);
    
    setMetrics(prev => ({ ...prev, isUpdating: true }));
    
    // Get current issues without automatic detection
    const currentIssues = scanForActualSecurityIssues();
    
    const criticalCount = currentIssues.filter(issue => issue.severity === 'critical').length;
    const highCount = currentIssues.filter(issue => issue.severity === 'high').length;
    const mediumCount = currentIssues.filter(issue => issue.severity === 'medium').length;
    const lowCount = currentIssues.filter(issue => issue.severity === 'low').length;
    const securityCount = currentIssues.filter(issue => issue.source === 'Security Scanner').length;
    const uiuxCount = currentIssues.filter(issue => issue.source === 'UI/UX Scanner').length;
    const databaseCount = currentIssues.filter(issue => issue.source === 'Database Scanner').length;
    const codeQualityCount = currentIssues.filter(issue => issue.source === 'Code Quality Scanner').length;
    
    // Manual fixes only - no automatic detection
    const totalFixed = Math.max(
      getTotalFixedCount(),
      processedData.totalRealFixesApplied
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
      securityFixed: 0, // Manual tracking only
      uiuxFixed: 0,
      databaseFixed: 0,
      codeQualityFixed: 0,
      criticalFixed: 0,
      highFixed: 0,
      mediumFixed: 0,
      lowFixed: 0,
      backendFixedCount: 0, // Disabled automatic backend fixes
      realFixesApplied: processedData.totalRealFixesApplied,
      countsAligned: true,
      isUpdating: false,
      updateSource: source,
      lastUpdateTime: new Date()
    };

    console.log('📊 UNIFIED METRICS UPDATED (Manual Only):', {
      activeIssues: newMetrics.totalActiveIssues,
      fixedIssues: newMetrics.totalFixedIssues,
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

  return {
    metrics,
    updateMetrics,
    processedData
  };
};
