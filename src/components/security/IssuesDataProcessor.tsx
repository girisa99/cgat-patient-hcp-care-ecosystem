
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

    // Add performance issues from performanceMetrics
    if (verificationSummary.performanceMetrics?.issues) {
      verificationSummary.performanceMetrics.issues.forEach((issue: string) => {
        allIssues.push({
          type: 'Performance Issue',
          message: issue,
          source: 'Performance Monitor',
          severity: 'medium'
        });
      });
    }

    // Add database validation issues
    if (verificationSummary.databaseValidation?.violations) {
      verificationSummary.databaseValidation.violations.forEach(violation => {
        allIssues.push({
          type: 'Database Issue',
          message: violation.message || violation.description || 'Database validation issue',
          source: 'Database Validator',
          severity: violation.severity === 'error' ? 'critical' : 'high'
        });
      });
    }

    // Add schema validation issues
    if (verificationSummary.schemaValidation?.violations) {
      verificationSummary.schemaValidation.violations.forEach(violation => {
        allIssues.push({
          type: 'Schema Issue',
          message: violation.message || violation.description || 'Schema validation issue',
          source: 'Schema Validator',
          severity: violation.severity === 'error' ? 'critical' : 'high'
        });
      });
    }

    // Add security scan issues
    if (verificationSummary.securityScan?.vulnerabilities) {
      verificationSummary.securityScan.vulnerabilities.forEach(vulnerability => {
        allIssues.push({
          type: 'Security Vulnerability',
          message: vulnerability.description || 'Security vulnerability detected',
          source: 'Security Scanner',
          severity: vulnerability.severity
        });
      });
    }

    // Add code quality issues
    if (verificationSummary.codeQuality?.issues) {
      verificationSummary.codeQuality.issues.forEach(issue => {
        allIssues.push({
          type: 'Code Quality Issue',
          message: issue.description || 'Code quality issue',
          source: 'Code Quality Analyzer',
          severity: issue.severity
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
      'Security Issues': activeIssues.filter(issue => 
        issue.type.includes('Security') || issue.type.includes('Vulnerability')
      ),
      'Database Issues': activeIssues.filter(issue => 
        issue.type.includes('Database') || issue.type.includes('Schema')
      ),
      'Code Quality': activeIssues.filter(issue => 
        issue.type.includes('Validation') || issue.type.includes('Performance') || issue.type.includes('Code Quality')
      ),
      'System Issues': activeIssues.filter(issue => 
        !issue.type.includes('Security') && 
        !issue.type.includes('Database') && 
        !issue.type.includes('Schema') &&
        !issue.type.includes('Validation') && 
        !issue.type.includes('Performance') &&
        !issue.type.includes('Code Quality') &&
        !issue.type.includes('Vulnerability')
      )
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
