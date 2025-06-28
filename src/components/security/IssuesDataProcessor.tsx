
import { useMemo } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { FixedIssue } from '@/hooks/useFixedIssuesTracker';

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
  issuesByTopic: Record<string, Issue[]>;
}

export const useIssuesDataProcessor = (
  verificationSummary?: VerificationSummary | null,
  fixedIssues: FixedIssue[] = []
): ProcessedIssuesData => {
  return useMemo(() => {
    if (!verificationSummary) {
      return {
        allIssues: [],
        criticalIssues: [],
        highIssues: [],
        mediumIssues: [],
        issuesByTopic: {}
      };
    }

    // Convert verification summary to issues format
    const allIssues: Issue[] = [];

    // Add validation issues
    if (verificationSummary.validationResult?.issues) {
      verificationSummary.validationResult.issues.forEach(issue => {
        allIssues.push({
          type: 'Validation Error',
          message: issue,
          source: 'Validation System',
          severity: 'high'
        });
      });
    }

    // Add audit issues
    if (verificationSummary.auditResults) {
      verificationSummary.auditResults.forEach(audit => {
        audit.issues.forEach(issue => {
          allIssues.push({
            type: 'Security Issue',
            message: issue,
            source: audit.componentName,
            severity: 'critical'
          });
        });
      });
    }

    // Add issues from comprehensive results if available
    if (verificationSummary.comprehensiveResults) {
      // Check if comprehensive results has performance data
      if (verificationSummary.comprehensiveResults.performanceMetrics?.issues) {
        verificationSummary.comprehensiveResults.performanceMetrics.issues.forEach((issue: string) => {
          allIssues.push({
            type: 'Performance Issue',
            message: issue,
            source: 'Performance Monitor',
            severity: 'medium'
          });
        });
      }

      // Check if comprehensive results has database validation data
      if (verificationSummary.comprehensiveResults.databaseValidation?.issues) {
        verificationSummary.comprehensiveResults.databaseValidation.issues.forEach((issue: string) => {
          allIssues.push({
            type: 'Database Issue',
            message: issue,
            source: 'Database Validator',
            severity: 'high'
          });
        });
      }
    }

    // Add general issues if available
    if (verificationSummary.issues && verificationSummary.issues.length > 0) {
      verificationSummary.issues.forEach(issue => {
        allIssues.push({
          type: 'System Issue',
          message: issue,
          source: 'Verification System',
          severity: 'medium'
        });
      });
    }

    // Filter out fixed issues
    const activeIssues = allIssues.filter(issue => 
      !fixedIssues.some(fixed => 
        fixed.type === issue.type && fixed.message === issue.message
      )
    );

    // Categorize by severity
    const criticalIssues = activeIssues.filter(issue => issue.severity === 'critical');
    const highIssues = activeIssues.filter(issue => issue.severity === 'high');
    const mediumIssues = activeIssues.filter(issue => issue.severity === 'medium');

    // Group by topic
    const issuesByTopic: Record<string, Issue[]> = {
      'Security Issues': activeIssues.filter(issue => issue.type.includes('Security')),
      'Database Issues': activeIssues.filter(issue => issue.type.includes('Database')),
      'Code Quality': activeIssues.filter(issue => 
        issue.type.includes('Validation') || issue.type.includes('Performance')
      ),
      'System Issues': activeIssues.filter(issue => issue.type.includes('System'))
    };

    return {
      allIssues: activeIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      issuesByTopic
    };
  }, [verificationSummary, fixedIssues]);
};
