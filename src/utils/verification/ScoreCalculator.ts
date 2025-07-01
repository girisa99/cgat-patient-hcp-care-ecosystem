
/**
 * Score Calculator
 * Calculates overall system health scores and generates action plans
 */

export class ScoreCalculator {
  /**
   * Calculate overall system score
   */
  static calculateOverallScore(results: {
    singleSourceResult: any;
    mockDataResult: any;
    codeQualityResult: any;
    databaseResult: any;
    moduleRegistryResult: any;
    typescriptResult: any;
  }): number {
    const weights = {
      singleSource: 0.25,
      mockData: 0.15,
      codeQuality: 0.20,
      database: 0.20,
      moduleRegistry: 0.10,
      typescript: 0.10
    };

    const scores = {
      singleSource: results.singleSourceResult?.summary?.complianceScore || 0,
      mockData: results.mockDataResult?.databaseUsageScore || 0,
      codeQuality: results.codeQualityResult?.duplicates?.severityScore || 0,
      database: results.databaseResult?.overallScore || 0,
      moduleRegistry: results.moduleRegistryResult?.healthScore || 0,
      typescript: results.typescriptResult?.typeConsistencyScore || 0
    };

    const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);

    return Math.round(weightedScore);
  }

  /**
   * Determine system status based on score
   */
  static determineSystemStatus(score: number): 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL' {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'NEEDS_IMPROVEMENT';
    return 'CRITICAL';
  }

  /**
   * Identify critical issues across all systems
   */
  static identifyCriticalIssues(results: any): string[] {
    const criticalIssues: string[] = [];

    // Check single source violations
    if (results.singleSourceResult?.violations?.length > 0) {
      criticalIssues.push('Single source of truth violations detected');
    }

    // Check mock data usage
    if (results.mockDataResult?.violations?.length > 0) {
      criticalIssues.push('Mock data usage in production code');
    }

    // Check database issues
    if (results.databaseResult?.overallScore < 70) {
      criticalIssues.push('Database integrity and performance issues');
    }

    // Check code quality
    if (results.codeQualityResult?.duplicates?.totalDuplicates > 10) {
      criticalIssues.push('High code duplication detected');
    }

    return criticalIssues;
  }

  /**
   * Generate action plan based on critical issues
   */
  static generateActionPlan(criticalIssues: string[]): string[] {
    const actionPlan: string[] = [];

    if (criticalIssues.includes('Single source of truth violations detected')) {
      actionPlan.push('1. Consolidate duplicate data sources and create unified interfaces');
    }

    if (criticalIssues.includes('Mock data usage in production code')) {
      actionPlan.push('2. Replace all mock data with real database connections');
    }

    if (criticalIssues.includes('Database integrity and performance issues')) {
      actionPlan.push('3. Optimize database schema and add missing indexes');
    }

    if (criticalIssues.includes('High code duplication detected')) {
      actionPlan.push('4. Refactor duplicate code into reusable components');
    }

    // Add general recommendations
    if (actionPlan.length === 0) {
      actionPlan.push('1. Continue regular system maintenance and monitoring');
      actionPlan.push('2. Implement automated quality checks');
    }

    actionPlan.push(`${actionPlan.length + 1}. Schedule regular system health reviews`);
    actionPlan.push(`${actionPlan.length + 1}. Set up automated alerts for system degradation`);

    return actionPlan;
  }

  /**
   * Estimate cleanup time based on issue count
   */
  static estimateCleanupTime(issueCount: number): string {
    if (issueCount === 0) return '0 hours';
    if (issueCount <= 5) return '2-4 hours';
    if (issueCount <= 10) return '1-2 days';
    if (issueCount <= 20) return '3-5 days';
    return '1-2 weeks';
  }
}
