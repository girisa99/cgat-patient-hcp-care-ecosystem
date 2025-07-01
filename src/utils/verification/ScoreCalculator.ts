
/**
 * Score Calculator
 * Utility for calculating overall system health scores
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
    moduleRegistryResult?: any;
    typescriptResult?: any;
  }): number {
    console.log('📊 Calculating overall system score...');

    // Weight different aspects of the system
    const weights = {
      singleSource: 0.25,
      mockData: 0.15,
      codeQuality: 0.25,
      database: 0.20,
      modules: 0.10,
      typescript: 0.05
    };

    let score = 0;
    
    // Single source compliance (0-100)
    score += (results.singleSourceResult?.summary?.complianceScore || 80) * weights.singleSource;
    
    // Mock data usage (0-100)
    score += (results.mockDataResult?.databaseUsageScore || 85) * weights.mockData;
    
    // Code quality (based on issues found)
    const codeQualityScore = this.calculateCodeQualityScore(results.codeQualityResult);
    score += codeQualityScore * weights.codeQuality;
    
    // Database health (0-100)
    const databaseScore = this.calculateDatabaseScore(results.databaseResult);
    score += databaseScore * weights.database;
    
    // Module registry health (0-100)
    const moduleScore = this.calculateModuleScore(results.moduleRegistryResult);
    score += moduleScore * weights.modules;
    
    // TypeScript health (0-100)
    const typescriptScore = this.calculateTypescriptScore(results.typescriptResult);
    score += typescriptScore * weights.typescript;

    return Math.round(Math.max(0, Math.min(100, score)));
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
   * Identify critical issues
   */
  static identifyCriticalIssues(results: {
    singleSourceResult: any;
    mockDataResult: any;
    codeQualityResult: any;
    databaseResult: any;
  }): string[] {
    const criticalIssues: string[] = [];

    // Check for critical violations
    if (results.singleSourceResult?.violations?.length > 5) {
      criticalIssues.push('Multiple single source violations detected');
    }

    if (results.mockDataResult?.violations?.length > 3) {
      criticalIssues.push('Excessive mock data usage in production code');
    }

    if (results.codeQualityResult?.duplicates?.components?.length > 5) {
      criticalIssues.push('High number of duplicate components detected');
    }

    if (results.databaseResult?.schemas?.inconsistencies?.length > 0) {
      criticalIssues.push('Database schema inconsistencies found');
    }

    return criticalIssues;
  }

  /**
   * Generate action plan
   */
  static generateActionPlan(criticalIssues: string[]): string[] {
    const actionPlan: string[] = [];

    criticalIssues.forEach(issue => {
      if (issue.includes('single source')) {
        actionPlan.push('Refactor duplicate code to follow single source principle');
      }
      if (issue.includes('mock data')) {
        actionPlan.push('Replace mock data with real database connections');
      }
      if (issue.includes('duplicate components')) {
        actionPlan.push('Consolidate duplicate components into reusable modules');
      }
      if (issue.includes('schema inconsistencies')) {
        actionPlan.push('Review and fix database schema inconsistencies');
      }
    });

    // Add general improvements
    actionPlan.push('Implement automated code quality checks');
    actionPlan.push('Set up continuous integration for code analysis');

    return actionPlan;
  }

  /**
   * Estimate cleanup time
   */
  static estimateCleanupTime(criticalIssuesCount: number): string {
    if (criticalIssuesCount === 0) return '0-1 hours';
    if (criticalIssuesCount <= 2) return '2-4 hours';
    if (criticalIssuesCount <= 5) return '1-2 days';
    return '3-5 days';
  }

  private static calculateCodeQualityScore(codeQualityResult: any): number {
    if (!codeQualityResult) return 80;

    let score = 100;
    
    // Deduct points for duplicates
    const duplicatesCount = (codeQualityResult.duplicates?.components?.length || 0) +
                           (codeQualityResult.duplicates?.hooks?.length || 0) +
                           (codeQualityResult.duplicates?.utilities?.length || 0);
    score -= duplicatesCount * 5;

    // Deduct points for dead code
    const deadCodeCount = (codeQualityResult.deadCode?.unusedFiles?.length || 0) +
                         (codeQualityResult.deadCode?.unusedFunctions?.length || 0);
    score -= deadCodeCount * 3;

    return Math.max(0, score);
  }

  private static calculateDatabaseScore(databaseResult: any): number {
    if (!databaseResult) return 85;

    let score = 100;
    score -= (databaseResult.tables?.missingIndexes?.length || 0) * 5;
    score -= (databaseResult.relationships?.broken?.length || 0) * 10;
    score -= (databaseResult.schemas?.inconsistencies?.length || 0) * 15;

    return Math.max(0, score);
  }

  private static calculateModuleScore(moduleResult: any): number {
    if (!moduleResult) return 90;

    let score = 100;
    score -= (moduleResult.duplicateModules?.length || 0) * 10;
    score -= (moduleResult.orphanedComponents?.length || 0) * 5;

    return Math.max(0, score);
  }

  private static calculateTypescriptScore(typescriptResult: any): number {
    if (!typescriptResult) return 85;

    let score = 100;
    score -= (typescriptResult.duplicateTypes?.length || 0) * 5;
    score -= (typescriptResult.missingTypes?.length || 0) * 3;

    return Math.max(0, score);
  }
}
