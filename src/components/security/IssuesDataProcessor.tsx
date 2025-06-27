
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

export interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
}

interface ProcessedIssuesData {
  allIssues: Issue[];
  criticalIssues: Issue[];
  highIssues: Issue[];
  mediumIssues: Issue[];
  issuesByTopic: {
    'Security Issues': Issue[];
    'Database Issues': Issue[];
    'Code Quality': Issue[];
  };
}

export const useIssuesDataProcessor = (
  verificationSummary?: VerificationSummary | null,
  fixedIssues: any[] = []
): ProcessedIssuesData => {
  // Helper function to extract string message from various issue types
  const extractMessage = (issue: any): string => {
    if (typeof issue === 'string') {
      return issue;
    }
    if (issue && typeof issue === 'object') {
      return issue.description || issue.message || issue.violation || issue.issue || JSON.stringify(issue);
    }
    return String(issue);
  };

  // Collect all issues from different sources with proper severity mapping
  const allIssues: Issue[] = React.useMemo(() => {
    if (!verificationSummary) return [];

    return [
      // Security vulnerabilities (Critical)
      ...(verificationSummary?.securityScan?.vulnerabilities || []).map(vuln => ({
        type: 'Security Vulnerability',
        message: extractMessage(vuln),
        source: 'Security',
        severity: 'critical'
      })),
      
      // Database validation violations (High)
      ...(verificationSummary?.databaseValidation?.violations || []).map(violation => ({
        type: 'Database Violation',
        message: extractMessage(violation),
        source: 'Database',
        severity: 'high'
      })),
      
      // Schema validation violations (High)
      ...(verificationSummary?.schemaValidation?.violations || []).map(violation => ({
        type: 'Schema Violation',
        message: extractMessage(violation),
        source: 'Schema',
        severity: 'high'
      })),
      
      // Code quality issues (Medium)
      ...(verificationSummary?.codeQuality?.issues || []).map(issue => ({
        type: 'Code Quality Issue',
        message: extractMessage(issue),
        source: 'Code Quality',
        severity: 'medium'
      })),
      
      // Validation result issues (Medium)
      ...(verificationSummary?.validationResult?.issues || []).map(issue => ({
        type: 'Validation Issue',
        message: extractMessage(issue),
        source: 'Validation',
        severity: 'medium'
      }))
    ];
  }, [verificationSummary]);

  // Filter out fixed issues from active display
  const displayIssues = React.useMemo(() => {
    return allIssues.filter(issue => 
      !fixedIssues.some(fixed => 
        fixed.type === issue.type && fixed.message === issue.message
      )
    );
  }, [allIssues, fixedIssues]);

  // Group issues by topic/category
  const issuesByTopic = React.useMemo(() => ({
    'Security Issues': displayIssues.filter(issue => 
      issue.source === 'Security' || issue.type.includes('Security')
    ),
    'Database Issues': displayIssues.filter(issue => 
      issue.source === 'Database' || issue.source === 'Schema'
    ),
    'Code Quality': displayIssues.filter(issue => 
      issue.source === 'Code Quality' || issue.source === 'Validation'
    )
  }), [displayIssues]);

  // Count issues by severity (only active issues)
  const criticalIssues = displayIssues.filter(issue => issue.severity === 'critical');
  const highIssues = displayIssues.filter(issue => issue.severity === 'high');
  const mediumIssues = displayIssues.filter(issue => issue.severity === 'medium');

  return {
    allIssues: displayIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    issuesByTopic
  };
};
