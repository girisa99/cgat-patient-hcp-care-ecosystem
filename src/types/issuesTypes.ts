
export interface Issue {
  type: string;
  message: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issueId?: string;
  lastSeen?: string;
  firstDetected?: string;
  status?: 'new' | 'existing' | 'resolved';
  details?: string;
  backendFixed?: boolean;
  autoDetectedFix?: boolean;
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
