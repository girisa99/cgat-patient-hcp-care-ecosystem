
/**
 * Executive Summary Generator
 * Generates executive summaries for system assessments
 */

import { ComprehensiveAssessment } from '../SystemAssessment';

export class ExecutiveSummaryGenerator {
  static generate(assessment: ComprehensiveAssessment): string {
    const mockDataSeverity = assessment.mockDataAssessment.severity;
    const unnecessaryTablesCount = assessment.tableUtilization.unnecessaryTables.length;
    const emptyTablesCount = assessment.tableUtilization.emptyTables.length;
    const realTimeSyncIssues = this.countRealTimeSyncIssues(assessment.realTimeSyncStatus);

    return `
SYSTEM ASSESSMENT EXECUTIVE SUMMARY

Current State: The healthcare API system is functional but requires optimization and cleanup.

Key Findings:
• Mock Data Usage: ${mockDataSeverity.toUpperCase()} severity - Found ${assessment.mockDataAssessment.filesWithMockData.length} files with potential mock data
• Database Optimization: ${unnecessaryTablesCount} potentially unnecessary tables identified, ${emptyTablesCount} empty tables require review
• Real-time Sync: ${realTimeSyncIssues} areas need improvement for better real-time functionality
• API Documentation: Core tables are well-structured, but ${assessment.publishedApiImpact.tablesToRemove.length} tables can be removed from API schemas

Recommendation Priority:
1. IMMEDIATE: Remove mock data and clean up debug components
2. SHORT-TERM: Optimize database structure and improve real-time sync
3. LONG-TERM: Implement advanced monitoring and caching strategies

Impact: These improvements will enhance performance, security, and maintainability while providing cleaner API documentation.
    `.trim();
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
