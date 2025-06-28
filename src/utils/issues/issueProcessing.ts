
import { Issue } from '@/types/issuesTypes';
import { 
  generateIssueId, 
  markIssueAsResolved, 
  recordBackendDetectedFix,
  getIssueHistory,
  getResolvedIssues
} from './issueStorageUtils';
import { detectBackendAppliedFixes } from './backendFixDetection';

export const handleBackendFixedIssues = (currentIssues: Issue[]): { 
  activeIssues: Issue[], 
  backendFixedIssues: Issue[], 
  autoMovedCount: number 
} => {
  console.log('🔄 ENHANCED CHECKING FOR BACKEND-APPLIED FIXES (ALL ISSUE TYPES)...');
  
  const backendDetections = detectBackendAppliedFixes();
  const backendFixedIssues: Issue[] = [];
  const activeIssues: Issue[] = [];
  let autoMovedCount = 0;

  currentIssues.forEach(issue => {
    let isFixedInBackend = false;
    
    for (const detection of backendDetections) {
      if (detection.implemented) {
        const issueMatchesPattern = detection.issuePatterns.some(pattern => {
          const patternLower = pattern.toLowerCase();
          const messageLower = issue.message.toLowerCase();
          const typeLower = issue.type.toLowerCase();
          const sourceLower = issue.source.toLowerCase();
          
          return messageLower.includes(patternLower) || 
                 typeLower.includes(patternLower) ||
                 sourceLower.includes(patternLower) ||
                 (messageLower.includes('api keys') && messageLower.includes('logged')) ||
                 (messageLower.includes('user data') && messageLower.includes('logged')) ||
                 (messageLower.includes('security issues component') && messageLower.includes('not being used')) ||
                 (messageLower.includes('user interface validation') && messageLower.includes('needs improvement')) ||
                 (messageLower.includes('accessibility standards') && messageLower.includes('not fully implemented'));
        });
        
        if (issueMatchesPattern) {
          console.log('✅ ENHANCED BACKEND FIX DETECTED:', {
            issue: issue.type,
            message: issue.message.substring(0, 50) + '...',
            fixType: detection.fixType,
            detectionMethod: detection.detectionMethod,
            matchedPattern: detection.issuePatterns.find(p => 
              issue.message.toLowerCase().includes(p.toLowerCase()) || 
              issue.type.toLowerCase().includes(p.toLowerCase())
            )
          });
          
          const backendFixedIssue = {
            ...issue,
            status: 'backend_fixed' as const,
            backendFixed: true,
            autoDetectedFix: true
          };
          
          backendFixedIssues.push(backendFixedIssue);
          recordBackendDetectedFix(detection.fixType, generateIssueId(issue));
          markIssueAsResolved(issue);
          autoMovedCount++;
          isFixedInBackend = true;
          break;
        }
      }
    }
    
    if (!isFixedInBackend) {
      activeIssues.push(issue);
    }
  });

  console.log('🎯 ENHANCED BACKEND FIX PROCESSING COMPLETE (ALL TYPES):', {
    totalIssues: currentIssues.length,
    backendFixed: backendFixedIssues.length,
    stillActive: activeIssues.length,
    autoMovedCount,
    fixedByType: backendFixedIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  return { activeIssues, backendFixedIssues, autoMovedCount };
};

export const compareIssuesWithHistory = (currentIssues: Issue[]): {
  newIssues: Issue[];
  resolvedIssues: Issue[];
  reappearedIssues: Issue[];
  enhancedIssues: Issue[];
} => {
  const history = getIssueHistory();
  const resolvedIssues = getResolvedIssues();
  
  if (history.length === 0) {
    return {
      newIssues: currentIssues.map(issue => ({ ...issue, status: 'new' as const })),
      resolvedIssues: [],
      reappearedIssues: [],
      enhancedIssues: currentIssues.map(issue => ({ ...issue, status: 'new' as const }))
    };
  }

  const lastSnapshot = history[0];
  const lastIssueIds = new Set(lastSnapshot.issues.map(issue => generateIssueId(issue)));
  const currentIssueIds = new Set(currentIssues.map(issue => generateIssueId(issue)));

  const newIssues = currentIssues.filter(issue => {
    const issueId = generateIssueId(issue);
    return !lastIssueIds.has(issueId) && !resolvedIssues.has(issueId);
  }).map(issue => ({ ...issue, status: 'new' as const, firstDetected: new Date().toISOString() }));

  const resolvedIssuesList = lastSnapshot.issues.filter(issue => {
    const issueId = generateIssueId(issue);
    return !currentIssueIds.has(issueId);
  }).map(issue => ({ ...issue, status: 'resolved' as const }));

  const reappearedIssues = currentIssues.filter(issue => {
    const issueId = generateIssueId(issue);
    return resolvedIssues.has(issueId);
  }).map(issue => ({ ...issue, status: 'reappeared' as const }));

  const existingIssues = currentIssues.filter(issue => {
    const issueId = generateIssueId(issue);
    return lastIssueIds.has(issueId) && !resolvedIssues.has(issueId);
  }).map(issue => ({ ...issue, status: 'existing' as const }));

  const enhancedIssues = [...newIssues, ...existingIssues, ...reappearedIssues];

  console.log('🔍 ENHANCED COMPARISON with ALL TYPES backend fix detection:');
  console.log(`   📊 Total current issues: ${currentIssues.length}`);
  console.log(`   🆕 New issues: ${newIssues.length}`);
  console.log(`   ✅ Resolved issues: ${resolvedIssuesList.length}`);
  console.log(`   🔄 Reappeared issues: ${reappearedIssues.length}`);
  console.log(`   📋 Existing issues: ${existingIssues.length}`);

  return {
    newIssues,
    resolvedIssues: resolvedIssuesList,
    reappearedIssues,
    enhancedIssues
  };
};
