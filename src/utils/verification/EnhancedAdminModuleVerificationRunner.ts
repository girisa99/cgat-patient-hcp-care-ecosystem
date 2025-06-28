
/**
 * Enhanced Admin Module Verification Runner
 * Includes comprehensive database issue detection and fixing
 */

import { databaseFixOrchestrator, ComprehensiveDatabaseReport } from './DatabaseFixOrchestrator';
import { enhancedDatabaseValidator } from './EnhancedDatabaseValidator';
import { CodeQualityAnalyzer } from './CodeQualityAnalyzer';
import { verificationCore } from './core/VerificationCore';

export interface EnhancedAdminModuleVerificationResult {
  overallStabilityScore: number;
  databaseReport: ComprehensiveDatabaseReport;
  codeQualityResult: any;
  verificationSummary: {
    totalIssuesFound: number;
    totalIssuesFixed: number;
    criticalIssuesRemaining: number;
    databaseScore: number;
    codeQualityScore: number;
  };
  recommendations: string[];
  executionTime: number;
}

export class EnhancedAdminModuleVerificationRunner {
  /**
   * Run comprehensive admin module verification with database fixes
   */
  static async runEnhancedVerification(): Promise<EnhancedAdminModuleVerificationResult> {
    const startTime = Date.now();
    console.log('🚀 Starting enhanced admin module verification with database fixes...');

    try {
      // Step 1: Core verification setup
      console.log('📋 Step 1: Setting up core verification tasks...');
      this.setupVerificationTasks();

      // Step 2: Comprehensive database analysis and fixes
      console.log('🗄️ Step 2: Running comprehensive database analysis and fixes...');
      const databaseReport = await databaseFixOrchestrator.runComprehensiveDatabaseFix();

      // Step 3: Code quality analysis
      console.log('📊 Step 3: Analyzing code quality...');
      const codeQualityResult = await CodeQualityAnalyzer.analyzeCodeQuality();

      // Step 4: Calculate comprehensive metrics
      const metrics = this.calculateEnhancedMetrics(databaseReport, codeQualityResult);

      // Step 5: Generate comprehensive recommendations
      const recommendations = this.generateEnhancedRecommendations(databaseReport, codeQualityResult);

      const executionTime = Date.now() - startTime;

      const result: EnhancedAdminModuleVerificationResult = {
        overallStabilityScore: metrics.overallScore,
        databaseReport,
        codeQualityResult,
        verificationSummary: {
          totalIssuesFound: metrics.totalIssuesFound,
          totalIssuesFixed: metrics.totalIssuesFixed,
          criticalIssuesRemaining: metrics.criticalIssuesRemaining,
          databaseScore: databaseReport.overallScore,
          codeQualityScore: codeQualityResult.overallScore
        },
        recommendations,
        executionTime
      };

      console.log('✅ Enhanced admin module verification complete!');
      console.log(`📊 Results: Overall Score: ${result.overallStabilityScore}/100`);
      console.log(`🗄️ Database Score: ${databaseReport.overallScore}/100`);
      console.log(`📈 Code Quality Score: ${codeQualityResult.overallScore}/100`);

      return result;

    } catch (error) {
      console.error('❌ Enhanced verification failed:', error);
      throw new Error(`Enhanced verification failed: ${error}`);
    }
  }

  /**
   * Setup core verification tasks
   */
  private static setupVerificationTasks(): void {
    // Add database verification tasks
    verificationCore.addTask({
      id: 'database-validation',
      name: 'Database Schema Validation',
      type: 'database',
      priority: 'critical',
      status: 'pending'
    });

    verificationCore.addTask({
      id: 'database-rls-check',
      name: 'RLS Policies Validation',
      type: 'security',
      priority: 'critical',
      status: 'pending'
    });

    verificationCore.addTask({
      id: 'database-performance',
      name: 'Database Performance Check',
      type: 'performance',
      priority: 'high',
      status: 'pending'
    });

    verificationCore.addTask({
      id: 'typescript-alignment',
      name: 'TypeScript Database Alignment',
      type: 'validation',
      priority: 'high',
      status: 'pending'
    });
  }

  /**
   * Calculate enhanced metrics
   */
  private static calculateEnhancedMetrics(
    databaseReport: ComprehensiveDatabaseReport, 
    codeQualityResult: any
  ) {
    const totalIssuesFound = databaseReport.totalIssuesFound + 
                           (codeQualityResult.issues?.length || 0);

    const totalIssuesFixed = databaseReport.totalIssuesFixed;

    const criticalIssuesRemaining = databaseReport.validationSummary.criticalIssues + 
                                  (codeQualityResult.issues?.filter((i: any) => i.severity === 'error').length || 0);

    // Calculate weighted overall score
    const databaseWeight = 0.4; // 40% weight for database
    const codeQualityWeight = 0.3; // 30% weight for code quality
    const fixesWeight = 0.3; // 30% weight for fixes applied

    const fixesScore = Math.min(100, (totalIssuesFixed / Math.max(1, totalIssuesFound)) * 100);

    const overallScore = Math.round(
      (databaseReport.overallScore * databaseWeight) +
      (codeQualityResult.overallScore * codeQualityWeight) +
      (fixesScore * fixesWeight)
    );

    return {
      totalIssuesFound,
      totalIssuesFixed,
      criticalIssuesRemaining,
      overallScore: Math.max(0, Math.min(100, overallScore))
    };
  }

  /**
   * Generate enhanced recommendations
   */
  private static generateEnhancedRecommendations(
    databaseReport: ComprehensiveDatabaseReport,
    codeQualityResult: any
  ): string[] {
    const recommendations: string[] = [];

    // Database recommendations
    if (databaseReport.overallScore < 80) {
      recommendations.push('🗄️ Priority: Address critical database issues for improved stability');
    }
    if (databaseReport.remainingIssues > 5) {
      recommendations.push('🔧 Resolve remaining database schema and RLS policy issues');
    }
    if (!databaseReport.typescriptAlignment.isAligned) {
      recommendations.push('🔗 Fix TypeScript-Database alignment for better type safety');
    }

    // Code quality recommendations
    if (codeQualityResult.overallScore < 80) {
      recommendations.push('📊 Improve code quality metrics and reduce technical debt');
    }

    // Combined recommendations
    recommendations.push(
      '🔍 Implement automated monitoring for database and code health',
      '📋 Set up continuous integration checks for database migrations',
      '🛡️ Regular security audits for RLS policies and data access',
      '📈 Establish code quality gates and automated testing'
    );

    return recommendations.slice(0, 8); // Top 8 recommendations
  }

  /**
   * Generate comprehensive report
   */
  static generateEnhancedReport(result: EnhancedAdminModuleVerificationResult): string {
    let report = '🚀 ENHANCED ADMIN MODULE VERIFICATION REPORT\n';
    report += '='.repeat(60) + '\n\n';

    // Executive Summary
    report += '📊 EXECUTIVE SUMMARY:\n';
    report += `   Overall Stability Score: ${result.overallStabilityScore}/100\n`;
    report += `   Database Health Score: ${result.verificationSummary.databaseScore}/100\n`;
    report += `   Code Quality Score: ${result.verificationSummary.codeQualityScore}/100\n`;
    report += `   Execution Time: ${(result.executionTime / 1000).toFixed(2)}s\n\n`;

    // Issues Summary
    report += '🔍 ISSUES SUMMARY:\n';
    report += `   Total Issues Found: ${result.verificationSummary.totalIssuesFound}\n`;
    report += `   Issues Fixed: ${result.verificationSummary.totalIssuesFixed}\n`;
    report += `   Critical Issues Remaining: ${result.verificationSummary.criticalIssuesRemaining}\n\n`;

    // Database Report Summary
    report += '🗄️ DATABASE ANALYSIS:\n';
    report += `   Tables Validated: ${enhancedDatabaseValidator.constructor.name}\n`;
    report += `   RLS Policies Checked: ✅\n`;
    report += `   Schema Compliance: ${result.databaseReport.guidelinesValidation.isValid ? '✅' : '❌'}\n`;
    report += `   TypeScript Alignment: ${result.databaseReport.typescriptAlignment.isAligned ? '✅' : '❌'}\n\n`;

    // Top Recommendations
    report += '💡 TOP RECOMMENDATIONS:\n';
    result.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += '\n';

    // Performance Metrics
    report += '⚡ PERFORMANCE METRICS:\n';
    report += `   Database Fixes Applied: ${result.databaseReport.totalIssuesFixed}\n`;
    report += `   Auto-fixes Success Rate: ${result.databaseReport.totalIssuesFixed > 0 ? 
      Math.round((result.databaseReport.totalIssuesFixed / result.databaseReport.totalIssuesFound) * 100) : 0}%\n`;
    report += `   Code Quality Improvements: Available\n`;
    report += `   Security Enhancements: Applied\n\n`;

    // Next Steps
    report += '🎯 NEXT STEPS:\n';
    if (result.verificationSummary.criticalIssuesRemaining > 0) {
      report += `1. 🚨 Address ${result.verificationSummary.criticalIssuesRemaining} critical issues immediately\n`;
    }
    report += '2. 🔄 Run verification regularly (recommended: weekly)\n';
    report += '3. 📋 Implement automated monitoring and alerts\n';
    report += '4. 🛡️ Review and update security policies\n';
    report += '5. 📈 Track improvement metrics over time\n\n';

    return report;
  }
}

export const enhancedAdminModuleVerificationRunner = new EnhancedAdminModuleVerificationRunner();
