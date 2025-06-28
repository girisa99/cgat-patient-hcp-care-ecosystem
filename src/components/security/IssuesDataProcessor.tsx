
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

    console.log('🔍 Processing verification summary:', verificationSummary);

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

    // Add validation warnings as medium severity issues
    if (verificationSummary.validationResult?.warnings) {
      verificationSummary.validationResult.warnings.forEach(warning => {
        allIssues.push({
          type: 'Validation Warning',
          message: warning,
          source: 'Validation System',
          severity: 'medium'
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

    // Add performance issues - check if recommendations exist and process them
    if (verificationSummary.performanceMetrics?.recommendations) {
      verificationSummary.performanceMetrics.recommendations.forEach((recommendation) => {
        allIssues.push({
          type: 'Performance Issue',
          message: recommendation.description || 'Performance optimization needed',
          source: 'Performance Monitor',
          severity: recommendation.priority === 'high' ? 'high' : 'medium'
        });
      });
    }

    // Add database validation issues - use description instead of message
    if (verificationSummary.databaseValidation?.violations) {
      verificationSummary.databaseValidation.violations.forEach(violation => {
        allIssues.push({
          type: 'Database Issue',
          message: violation.description || 'Database validation issue',
          source: 'Database Validator',
          severity: violation.severity === 'error' ? 'critical' : 'high'
        });
      });
    }

    // Add schema validation issues - use description instead of message
    if (verificationSummary.schemaValidation?.violations) {
      verificationSummary.schemaValidation.violations.forEach(violation => {
        allIssues.push({
          type: 'Schema Issue',
          message: violation.description || 'Schema validation issue',
          source: 'Schema Validator',
          severity: violation.severity === 'error' ? 'critical' : 'high'
        });
      });
    }

    // Add security scan vulnerabilities - THIS WAS MISSING!
    if (verificationSummary.securityScan?.vulnerabilities) {
      console.log('🔒 Processing security vulnerabilities:', verificationSummary.securityScan.vulnerabilities);
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

    console.log('📊 Total issues found before filtering:', allIssues.length);

    // Filter out fixed issues
    const activeIssues = allIssues.filter(issue => 
      !fixedIssues.some(fixed => 
        fixed.type === issue.type && fixed.message === issue.message
      )
    );

    console.log('📊 Active issues after filtering fixed:', activeIssues.length);

    // Categorize by severity
    const criticalIssues = activeIssues.filter(issue => issue.severity === 'critical');
    const highIssues = activeIssues.filter(issue => issue.severity === 'high');
    const mediumIssues = activeIssues.filter(issue => issue.severity === 'medium');

    console.log('📊 Issues by severity - Critical:', criticalIssues.length, 'High:', highIssues.length, 'Medium:', mediumIssues.length);

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

    console.log('📋 Issues by topic:', Object.entries(issuesByTopic).map(([topic, issues]) => `${topic}: ${issues.length}`));

    return {
      allIssues: activeIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      issuesByTopic
    };
  }, [verificationSummary, fixedIssues]);
};
