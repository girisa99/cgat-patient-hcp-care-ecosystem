
import { useEffect, useState, useMemo } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { Issue, ProcessedIssuesData } from '@/types/issuesTypes';
import { FixedIssue } from '@/hooks/useFixedIssuesTracker';
import { saveIssueSnapshot, markIssueAsResolved, generateIssueId } from '@/utils/issues/issueStorageUtils';
import { recordFixedIssue, performDatabaseSync } from '@/utils/dailyProgressTracker';
import { scanForActualSecurityIssues } from '@/utils/issues/issueScanner';

export const useIssuesDataProcessor = (
  verificationSummary?: VerificationSummary | null,
  fixedIssues: FixedIssue[] = []
): ProcessedIssuesData => {
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<Issue[]>([]);
  const [highIssues, setHighIssues] = useState<Issue[]>([]);
  const [mediumIssues, setMediumIssues] = useState<Issue[]>([]);
  const [lowIssues, setLowIssues] = useState<Issue[]>([]);
  const [issuesByTopic, setIssuesByTopic] = useState<{ [topic: string]: Issue[] }>({});
  const [newIssues, setNewIssues] = useState<Issue[]>([]);
  const [resolvedIssues, setResolvedIssues] = useState<Issue[]>([]);
  const [reappearedIssues, setReappearedIssues] = useState<Issue[]>([]);
  const [backendFixedIssues, setBackendFixedIssues] = useState<Issue[]>([]);
  const [totalRealFixesApplied, setTotalRealFixesApplied] = useState(0);
  const [autoDetectedBackendFixes, setAutoDetectedBackendFixes] = useState(0);

  useEffect(() => {
    if (verificationSummary) {
      setTotalRealFixesApplied(verificationSummary.realFixesApplied || 0);
    }
  }, [verificationSummary]);

  useEffect(() => {
    // Enhanced scanning for actual security issues with database sync
    console.log('🔍 SCANNING ISSUES AND SYNCING WITH DATABASE...');
    const securityIssues = scanForActualSecurityIssues();
    setAllIssues(securityIssues);
    
    // CRITICAL: Sync active issues with database whenever issues are scanned
    performDatabaseSync(securityIssues).then(success => {
      if (success) {
        console.log('✅ DATABASE SYNC COMPLETED - Issues synchronized with Supabase');
      } else {
        console.error('❌ DATABASE SYNC FAILED - Please check connection');
      }
    }).catch(error => {
      console.error('❌ Database sync error:', error);
    });
  }, []);

  useEffect(() => {
    if (allIssues.length > 0) {
      const critical = allIssues.filter(issue => issue.severity === 'critical');
      const high = allIssues.filter(issue => issue.severity === 'high');
      const medium = allIssues.filter(issue => issue.severity === 'medium');
      const low = allIssues.filter(issue => issue.severity === 'low');

      setCriticalIssues(critical);
      setHighIssues(high);
      setMediumIssues(medium);
      setLowIssues(low);

      // Group issues by topic
      const groupedByTopic: { [topic: string]: Issue[] } = allIssues.reduce((acc: { [topic: string]: Issue[] }, issue) => {
        const topic = issue.source || 'System Issues';
        acc[topic] = acc[topic] || [];
        acc[topic].push(issue);
        return acc;
      }, {});
      setIssuesByTopic(groupedByTopic);
    }
  }, [allIssues]);

  useEffect(() => {
    if (verificationSummary) {
      saveIssueSnapshot(allIssues, verificationSummary.backendFixesDetected ? Object.keys(verificationSummary.backendFixesDetected) : []);
    }
  }, [allIssues, verificationSummary]);

  useEffect(() => {
    // Track backend-detected fixes
    const backendFixes: string[] = [];
    let detectedFixesCount = 0;

    if (verificationSummary?.backendFixesDetected) {
      Object.keys(verificationSummary.backendFixesDetected).forEach(issueId => {
        const issue = allIssues.find(issue => generateIssueId(issue) === issueId);
        if (issue) {
          backendFixes.push(issueId);
          detectedFixesCount++;
        }
      });
    }

    setBackendFixedIssues(allIssues.filter(issue => backendFixes.includes(generateIssueId(issue))));
    setAutoDetectedBackendFixes(detectedFixesCount);
  }, [verificationSummary, allIssues]);

  useEffect(() => {
    // Track new, resolved, and reappeared issues
    const previousSnapshot = localStorage.getItem('issue-tracking-history') ? JSON.parse(localStorage.getItem('issue-tracking-history') || '[]')[0] : null;
    let newDetected: Issue[] = [];
    let resolvedDetected: Issue[] = [];
    let reappearedDetected: Issue[] = [];

    if (previousSnapshot) {
      // Get issues from the previous snapshot
      const previousIssues = previousSnapshot.issues || [];

      // Identify new issues
      newDetected = allIssues.filter(issue => !previousIssues.find(pi => pi.issueId === generateIssueId(issue)));

      // Identify resolved issues
      resolvedDetected = previousIssues.filter(issue => !allIssues.find(ai => generateIssueId(ai) === issue.issueId));

      // Identify reappeared issues
      const currentIssueIds = allIssues.map(ai => generateIssueId(ai));
      reappearedDetected = previousIssues.filter(pi => currentIssueIds.includes(pi.issueId) && !fixedIssues.find(fi => generateIssueId(fi) === pi.issueId));
    } else {
      newDetected = allIssues;
    }

    setNewIssues(newDetected);
    setResolvedIssues(resolvedDetected);
    setReappearedIssues(reappearedDetected);
  }, [allIssues, fixedIssues]);

  const processedData = useMemo(() => ({
    allIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues,
    issuesByTopic,
    newIssues,
    resolvedIssues,
    reappearedIssues,
    backendFixedIssues,
    totalRealFixesApplied,
    autoDetectedBackendFixes
  }), [allIssues, criticalIssues, highIssues, mediumIssues, lowIssues, issuesByTopic, newIssues, resolvedIssues, reappearedIssues, backendFixedIssues, totalRealFixesApplied, autoDetectedBackendFixes]);

  return processedData;
};

// Enhanced mark as really fixed function with database integration
export const markIssueAsReallyFixed = async (issue: Issue) => {
  console.log('🔧 MARKING ISSUE AS REALLY FIXED AND SYNCING TO DATABASE...');
  
  // Mark in local storage
  markIssueAsResolved(issue);
  
  // Record in database via daily progress tracker
  const success = await recordFixedIssue({
    type: issue.type,
    message: issue.message,
    severity: issue.severity || 'medium',
    category: issue.source || 'System',
    description: `${issue.type}: ${issue.message}`
  }, 'manual');
  
  if (success) {
    console.log('✅ Issue marked as really fixed and recorded in Supabase database:', issue.type);
  } else {
    console.error('❌ Failed to record fixed issue in database:', issue.type);
  }
  
  return success;
};
