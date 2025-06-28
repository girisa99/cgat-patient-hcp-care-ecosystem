
export interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
  details?: string; // Add optional details property
  issueId?: string;
  firstDetected?: string;
  lastSeen?: string;
  status?: 'new' | 'existing' | 'resolved' | 'reappeared' | 'backend_fixed';
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

export interface IssueSnapshot {
  timestamp: string;
  issues: Issue[];
  verificationId: string;
  realFixesCount?: number;
  backendFixesDetected?: string[];
}

export interface BackendFixDetection {
  fixType: string;
  implemented: boolean;
  detectionMethod: string;
  issuePatterns: string[];
}
