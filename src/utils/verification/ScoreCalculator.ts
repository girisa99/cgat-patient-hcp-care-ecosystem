
/**
 * Score Calculator
 * Utilities for calculating system health scores
 */

export class ScoreCalculator {
  /**
   * Calculate overall score
   */
  static calculateOverallScore(results: any): number {
    const singleSourceScore = results.singleSourceResult?.summary?.complianceScore || 0;
    const mockDataScore = results.mockDataResult?.databaseUsageScore || 0;
    const namingScore = results.codeQualityResult?.namingConsistency?.score || 0;
    
    // Weight the scores
    const weightedScore = (
      singleSourceScore * 0.4 +
      mockDataScore * 0.3 +
      namingScore * 0.3
    );
    
    return Math.round(weightedScore);
  }
  
  /**
   * Determine system status
   */
  static determineSystemStatus(score: number): 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL' {
    if (score >= 95) return 'EXCELLENT';
    if (score >= 85) return 'GOOD';
    if (score >= 70) return 'NEEDS_IMPROVEMENT';
    return 'CRITICAL';
  }
  
  /**
   * Identify critical issues
   */
  static identifyCriticalIssues(results: any): string[] {
    const criticalIssues: string[] = [];
    
    // High priority violations
    if (results.singleSourceResult?.violations?.length > 0) {
      criticalIssues.push(`${results.singleSourceResult.violations.length} single source violations found`);
    }
    
    // Mock data violations
    if (results.mockDataResult?.violations?.length > 0) {
      criticalIssues.push(`${results.mockDataResult.violations.length} mock data violations found`);
    }
    
    // Code quality issues
    const duplicateCount = Object.values(results.codeQualityResult?.duplicates || {}).flat().length;
    if (duplicateCount > 0) {
      criticalIssues.push(`${duplicateCount} code duplicates found`);
    }
    
    return criticalIssues;
  }
  
  /**
   * Generate action plan
   */
  static generateActionPlan(criticalIssues: string[]): string[] {
    const actionPlan: string[] = [];
    
    if (criticalIssues.length === 0) {
      actionPlan.push('✅ System is in excellent condition - maintain current standards');
      actionPlan.push('🔄 Continue regular validation checks');
      actionPlan.push('📚 Update documentation to reflect current state');
      return actionPlan;
    }
    
    actionPlan.push('🚀 Immediate Actions Required:');
    
    criticalIssues.forEach(issue => {
      if (issue.includes('single source')) {
        actionPlan.push('• Review and consolidate single source violations');
      }
      if (issue.includes('mock data')) {
        actionPlan.push('• Replace mock data with real database queries');
      }
      if (issue.includes('duplicates')) {
        actionPlan.push('• Consolidate duplicate code and components');
      }
    });
    
    actionPlan.push('📋 Follow-up Actions:');
    actionPlan.push('• Implement automated validation in CI/CD');
    actionPlan.push('• Create coding standards documentation');
    actionPlan.push('• Schedule regular system health checks');
    
    return actionPlan;
  }
  
  /**
   * Estimate cleanup time
   */
  static estimateCleanupTime(criticalIssueCount: number): string {
    if (criticalIssueCount === 0) return '0 hours - System is clean';
    if (criticalIssueCount <= 5) return '2-4 hours';
    if (criticalIssueCount <= 10) return '1-2 days';
    return '3-5 days';
  }
}
