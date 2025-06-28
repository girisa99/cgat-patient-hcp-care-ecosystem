
import { useState, useEffect, useCallback } from 'react';
import { Issue } from '@/types/issuesTypes';
import { ComprehensiveIssueScanner } from '@/utils/verification/ComprehensiveIssueScanner';
import { performDatabaseSync } from '@/utils/dailyProgressTracker';

export const useAccurateIssuesProcessor = () => {
  const [activeIssues, setActiveIssues] = useState<Issue[]>([]);
  const [totalFixedCount, setTotalFixedCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  /**
   * Perform comprehensive scan and update database
   */
  const performComprehensiveScan = useCallback(async () => {
    console.log('🔄 STARTING COMPREHENSIVE SCAN AND DATABASE SYNC...');
    setIsScanning(true);

    try {
      // Clear cached data for fresh scan
      ComprehensiveIssueScanner.clearAllCachedData();
      
      // Perform fresh comprehensive scan
      const freshIssues = ComprehensiveIssueScanner.performCompleteScan();
      const fixedCount = ComprehensiveIssueScanner.getAccurateFixCount();
      
      // Update state with accurate data
      setActiveIssues(freshIssues);
      setTotalFixedCount(fixedCount);
      setLastScanTime(new Date());
      
      // Sync with database
      const syncSuccess = await performDatabaseSync(freshIssues);
      
      if (syncSuccess) {
        console.log('✅ COMPREHENSIVE SCAN AND DATABASE SYNC COMPLETED');
        console.log(`📊 Final Results: ${freshIssues.length} active issues, ${fixedCount} fixes applied`);
      } else {
        console.error('❌ Database sync failed during comprehensive scan');
      }
      
      return {
        activeIssues: freshIssues,
        fixedCount,
        syncSuccess
      };
      
    } catch (error) {
      console.error('❌ Comprehensive scan failed:', error);
      return {
        activeIssues: [],
        fixedCount: 0,
        syncSuccess: false
      };
    } finally {
      setIsScanning(false);
    }
  }, []);

  /**
   * Get categorized issues
   */
  const getCategorizedIssues = useCallback(() => {
    const critical = activeIssues.filter(issue => issue.severity === 'critical');
    const high = activeIssues.filter(issue => issue.severity === 'high');
    const medium = activeIssues.filter(issue => issue.severity === 'medium');
    const low = activeIssues.filter(issue => issue.severity === 'low');

    const byTopic = activeIssues.reduce((acc: { [topic: string]: Issue[] }, issue) => {
      const topic = issue.source || 'System Issues';
      acc[topic] = acc[topic] || [];
      acc[topic].push(issue);
      return acc;
    }, {});

    return {
      critical,
      high,
      medium,
      low,
      byTopic,
      total: activeIssues.length
    };
  }, [activeIssues]);

  /**
   * Initial scan on mount
   */
  useEffect(() => {
    console.log('🚀 INITIALIZING ACCURATE ISSUES PROCESSOR...');
    performComprehensiveScan();
  }, [performComprehensiveScan]);

  return {
    activeIssues,
    totalFixedCount,
    isScanning,
    lastScanTime,
    performComprehensiveScan,
    getCategorizedIssues,
    // Remove all the problematic tracking functions that were causing inconsistencies
    newIssues: [], // Reset - no more tracking of "new" issues
    resolvedIssues: [], // Reset - no more tracking of "resolved" issues  
    reappearedIssues: [], // Reset - no more tracking of "reappeared" issues
    backendFixedIssues: [] // Reset - no more automatic backend detection
  };
};
