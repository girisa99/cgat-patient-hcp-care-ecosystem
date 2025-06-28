
import { useState, useEffect, useCallback } from 'react';
import { Issue } from '@/types/issuesTypes';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useIssuesDataProcessor } from '@/components/security/IssuesDataProcessor';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';

export interface TabSyncData {
  activeIssues: Issue[];
  fixedIssues: any[];
  totalActiveCount: number;
  totalFixedCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  securityIssuesCount: number;
  backendFixedCount: number;
  realFixesApplied: number;
  lastUpdateTime: Date;
}

export const useTabSynchronization = (verificationSummary?: VerificationSummary | null) => {
  const [lastSync, setLastSync] = useState(new Date());
  const [forceRefresh, setForceRefresh] = useState(0);
  
  const { fixedIssues, getTotalFixedCount } = useFixedIssuesTracker();
  
  const processedData = useIssuesDataProcessor(verificationSummary, fixedIssues);
  
  const syncData: TabSyncData = {
    activeIssues: processedData.allIssues,
    fixedIssues: fixedIssues,
    totalActiveCount: processedData.allIssues.length,
    totalFixedCount: Math.max(getTotalFixedCount(), processedData.totalRealFixesApplied),
    criticalCount: processedData.criticalIssues.length,
    highCount: processedData.highIssues.length,
    mediumCount: processedData.mediumIssues.length,
    securityIssuesCount: processedData.issuesByTopic['Security Issues']?.length || 0,
    backendFixedCount: processedData.autoDetectedBackendFixes,
    realFixesApplied: processedData.totalRealFixesApplied,
    lastUpdateTime: lastSync
  };

  const triggerSync = useCallback(() => {
    setLastSync(new Date());
    setForceRefresh(prev => prev + 1);
    console.log('🔄 Tab synchronization triggered:', syncData);
  }, [syncData]);

  // Listen for storage changes to trigger sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('_implemented') || 
          e.key?.includes('_active') || 
          e.key?.includes('_applied') ||
          e.key === 'real-fixes-applied-count') {
        triggerSync();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [triggerSync]);

  return {
    syncData,
    triggerSync,
    processedData,
    forceRefresh
  };
};
