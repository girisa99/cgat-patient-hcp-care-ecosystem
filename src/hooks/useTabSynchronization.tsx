
import { useState, useEffect } from 'react';

export interface TabSyncData {
  activeIssues: any[];
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

// Simplified tab synchronization for database-first approach
export const useTabSynchronization = () => {
  const [activeTab, setActiveTab] = useState('active');

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    switchTab
  };
};
