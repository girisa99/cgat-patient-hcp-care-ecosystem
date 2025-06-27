
/**
 * Critical Findings Extractor
 * Extracts and formats critical findings from system assessment
 */

import { ComprehensiveAssessment } from '../SystemAssessment';

export class CriticalFindingsExtractor {
  static extract(assessment: ComprehensiveAssessment): string[] {
    const findings: string[] = [];

    // Mock data findings
    if (assessment.mockDataAssessment.severity === 'high' || assessment.mockDataAssessment.severity === 'medium') {
      findings.push(`🚨 CRITICAL: Mock data found in ${assessment.mockDataAssessment.filesWithMockData.length} files - security and data integrity risk`);
    }

    // Database findings
    const unnecessaryTables = assessment.tableUtilization.unnecessaryTables.filter(t => t.canDelete);
    if (unnecessaryTables.length > 0) {
      findings.push(`📊 Database cleanup needed: ${unnecessaryTables.length} tables can be safely removed`);
    }

    // Real-time sync findings
    const syncIssues = this.countRealTimeSyncIssues(assessment.realTimeSyncStatus);
    if (syncIssues > 3) {
      findings.push(`⚡ Real-time sync issues: ${syncIssues} areas need improvement for better user experience`);
    }

    // Performance findings
    const performanceIssues = assessment.adminPortalOptimization.performanceIssues.length;
    if (performanceIssues > 2) {
      findings.push(`🚀 Performance optimization needed: ${performanceIssues} issues identified in admin portal`);
    }

    // API documentation impact
    if (assessment.publishedApiImpact.schemaChangesNeeded.length > 0) {
      findings.push(`📋 API schema optimization: ${assessment.publishedApiImpact.schemaChangesNeeded.length} improvements needed for published APIs`);
    }

    return findings;
  }

  private static countRealTimeSyncIssues(syncStatus: any): number {
    let issueCount = 0;
    
    Object.values(syncStatus).forEach((module: any) => {
      if (module.issues && Array.isArray(module.issues)) {
        issueCount += module.issues.length;
      }
    });
    
    return issueCount;
  }
}
