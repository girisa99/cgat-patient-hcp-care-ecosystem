
/**
 * Tab Synchronization Hook
 * Provides synchronized data across verification tabs
 */

import { useState, useCallback } from 'react';
import { Issue } from '@/types/issuesTypes';

export interface TabSyncData {
  totalActiveCount: number;
  totalFixedCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  securityIssuesCount: number;
  realFixesApplied: number;
  backendFixedCount: number;
  lastUpdateTime: Date;
  activeIssues: Issue[];
  fixedIssues: any[];
}

export const useTabSynchronization = () => {
  const [syncData, setSyncData] = useState<TabSyncData>({
    totalActiveCount: 0,
    totalFixedCount: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    securityIssuesCount: 0,
    realFixesApplied: 0,
    backendFixedCount: 0,
    lastUpdateTime: new Date(),
    activeIssues: [],
    fixedIssues: []
  });

  const updateSyncData = useCallback((newData: Partial<TabSyncData>) => {
    setSyncData(prev => ({
      ...prev,
      ...newData,
      lastUpdateTime: new Date()
    }));
  }, []);

  return {
    syncData,
    updateSyncData
  };
};
