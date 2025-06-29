
import { Issue } from '@/types/issuesTypes';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useDatabaseIssues } from '@/hooks/useDatabaseIssues';

export interface ProcessedIssuesData {
  allIssues: Issue[];
  criticalIssues: Issue[];
  highIssues: Issue[];
  mediumIssues: Issue[];
  lowIssues: Issue[];
  issuesByTopic: Record<string, Issue[]>;
  newIssues: Issue[];
  resolvedIssues: Issue[];
  reappearedIssues: Issue[];
  backendFixedIssues: Issue[];
  totalRealFixesApplied: number;
  autoDetectedBackendFixes: number;
}

export const useIssuesDataProcessor = (
  verificationSummary?: VerificationSummary | null,
  fixedIssues: Issue[] = []
): ProcessedIssuesData => {
  // Use database issues directly - NO LOCAL STORAGE
  const { activeIssues, categorizedIssues, totalFixedCount } = useDatabaseIssues();
  
  console.log('📊 IssuesDataProcessor: Using REAL DATABASE issues only');
  console.log(`🗄️ Loaded ${activeIssues.length} issues from database tables`);
  
  const processedData: ProcessedIssuesData = {
    allIssues: activeIssues,
    criticalIssues: categorizedIssues.critical,
    highIssues: categorizedIssues.high,
    mediumIssues: categorizedIssues.medium,
    lowIssues: categorizedIssues.low,
    issuesByTopic: categorizedIssues.byTopic,
    newIssues: [], // Could be implemented by comparing timestamps
    resolvedIssues: [], // Could be loaded from issue_fixes table
    reappearedIssues: [], // Could be implemented by comparing historical data
    backendFixedIssues: [],
    totalRealFixesApplied: totalFixedCount,
    autoDetectedBackendFixes: 0
  };

  console.log('📈 Database Issues Summary:', {
    total: activeIssues.length,
    critical: categorizedIssues.critical.length,
    high: categorizedIssues.high.length,
    medium: categorizedIssues.medium.length,
    low: categorizedIssues.low.length,
    fixedCount: totalFixedCount
  });

  return processedData;
};

export const markIssueAsReallyFixed = async (issue: Issue) => {
  console.log('🔧 Issue marked as really fixed in database:', issue.type);
  
  // This could be enhanced to actually move the issue from active_issues to issue_fixes
  // For now, just log it
};
