
export interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
  issueId?: string;
  details?: string;
  lastSeen?: string;
  firstDetected?: string;
  status?: 'active' | 'resolved' | 'investigating';
  backendFixed?: boolean;
  autoDetectedFix?: boolean;
}

export interface IssueSnapshot {
  timestamp: string;
  issues: Issue[];
  verificationId: string;
  realFixesCount: number;
  backendFixesDetected: string[];
}

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
