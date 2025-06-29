
/**
 * Real Verification Orchestrator
 * Coordinates real database validation and system health checks
 */

import { RealDatabaseValidator, RealDatabaseValidationResult } from './RealDatabaseValidator';
import { supabase } from '@/integrations/supabase/client';

export interface RealSystemHealthResult {
  overallHealthScore: number;
  databaseHealth: RealDatabaseValidationResult;
  isSystemStable: boolean;
  criticalIssuesCount: number;
  totalActiveIssues: number;
  lastValidationTime: string;
  systemRecommendations: string[];
  quickFixes: string[];
}

export class RealVerificationOrchestrator {
  /**
   * Perform comprehensive real system validation
   */
  static async performRealSystemValidation(): Promise<RealSystemHealthResult> {
    console.log('🚀 REAL SYSTEM VALIDATION STARTING...');
    console.log('🔍 Validating live database and system health');

    const validationStart = new Date().toISOString();

    try {
      // Perform real database validation
      console.log('📊 Step 1: Real database validation...');
      const databaseHealth = await RealDatabaseValidator.validateRealDatabase();

      // Calculate overall health score based on real issues
      const overallHealthScore = this.calculateRealHealthScore(databaseHealth);

      // Determine system stability
      const isSystemStable = databaseHealth.criticalIssues === 0 && overallHealthScore >= 70;

      // Count issues
      const criticalIssuesCount = databaseHealth.criticalIssues;
      const totalActiveIssues = databaseHealth.totalIssues;

      // Generate system-wide recommendations
      const systemRecommendations = this.generateSystemRecommendations(databaseHealth);

      // Generate quick fixes
      const quickFixes = this.generateQuickFixes(databaseHealth);

      // Store validation results in database
      await this.storeValidationResults(databaseHealth);

      const result: RealSystemHealthResult = {
        overallHealthScore,
        databaseHealth,
        isSystemStable,
        criticalIssuesCount,
        totalActiveIssues,
        lastValidationTime: validationStart,
        systemRecommendations,
        quickFixes
      };

      console.log('✅ REAL SYSTEM VALIDATION COMPLETE!');
      console.log(`📊 Overall Health Score: ${overallHealthScore}/100`);
      console.log(`🗄️ Database Issues: ${totalActiveIssues} (${criticalIssuesCount} critical)`);
      console.log(`🎯 System Status: ${isSystemStable ? 'STABLE' : 'NEEDS ATTENTION'}`);

      return result;

    } catch (error) {
      console.error('❌ Real system validation failed:', error);
      throw new Error(`Real system validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate real health score based on actual issues found
   */
  private static calculateRealHealthScore(databaseHealth: RealDatabaseValidationResult): number {
    let score = 100;

    // Deduct points for issues based on severity
    const criticalPenalty = databaseHealth.issues.filter(i => i.severity === 'critical').length * 25;
    const highPenalty = databaseHealth.issues.filter(i => i.severity === 'high').length * 15;
    const mediumPenalty = databaseHealth.issues.filter(i => i.severity === 'medium').length * 8;
    const lowPenalty = databaseHealth.issues.filter(i => i.severity === 'low').length * 3;

    score -= (criticalPenalty + highPenalty + mediumPenalty + lowPenalty);

    // Bonus points for having tables and successful scans
    const tableBonus = Math.min(20, databaseHealth.tablesScanned.length * 2);
    score += tableBonus;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate system-wide recommendations
   */
  private static generateSystemRecommendations(databaseHealth: RealDatabaseValidationResult): string[] {
    const recommendations: string[] = [];

    // Add database-specific recommendations
    recommendations.push(...databaseHealth.recommendations);

    // Add system-wide recommendations
    if (databaseHealth.criticalIssues > 0) {
      recommendations.push('🚨 IMMEDIATE ACTION: Address all critical database issues before proceeding');
    }

    if (databaseHealth.tablesScanned.length < 5) {
      recommendations.push('📊 DATABASE: Verify database schema is properly deployed');
    }

    recommendations.push('🔄 MONITORING: Implement automated health checks and alerting');
    recommendations.push('📈 METRICS: Set up database performance monitoring');
    recommendations.push('🔐 SECURITY: Regular security audits and penetration testing');

    return recommendations;
  }

  /**
   * Generate quick fixes for common issues
   */
  private static generateQuickFixes(databaseHealth: RealDatabaseValidationResult): string[] {
    const quickFixes: string[] = [];

    const rlsIssues = databaseHealth.issues.filter(i => i.type === 'missing_rls');
    const schemaIssues = databaseHealth.issues.filter(i => i.type === 'schema_inconsistency');

    if (rlsIssues.length > 0) {
      quickFixes.push(`Enable RLS on ${rlsIssues.length} tables missing security policies`);
    }

    if (schemaIssues.length > 0) {
      quickFixes.push(`Fix ${schemaIssues.length} database schema inconsistencies`);
    }

    const autoFixableIssues = databaseHealth.issues.filter(i => i.autoFixable);
    if (autoFixableIssues.length > 0) {
      quickFixes.push(`Apply ${autoFixableIssues.length} automatic database fixes`);
    }

    return quickFixes;
  }

  /**
   * Store validation results in the database
   */
  private static async storeValidationResults(databaseHealth: RealDatabaseValidationResult): Promise<void> {
    try {
      // Clear existing active issues
      await supabase
        .from('active_issues')
        .delete()
        .eq('status', 'active');

      // Insert new issues from real validation
      if (databaseHealth.issues.length > 0) {
        const issuesData = databaseHealth.issues.map(issue => ({
          issue_type: issue.type,
          issue_message: issue.description,
          issue_source: `Database - ${issue.table}`,
          issue_severity: issue.severity,
          category: 'Database',
          status: 'active'
        }));

        const { error } = await supabase
          .from('active_issues')
          .insert(issuesData);

        if (error) {
          console.error('Error storing validation results:', error);
        } else {
          console.log(`✅ Stored ${issuesData.length} real issues in database`);
        }
      }
    } catch (error) {
      console.error('Error storing validation results:', error);
    }
  }

  /**
   * Generate comprehensive validation report
   */
  static generateSystemReport(result: RealSystemHealthResult): string {
    let report = '🏥 REAL SYSTEM HEALTH REPORT\n';
    report += '='.repeat(60) + '\n\n';

    report += `📊 SYSTEM OVERVIEW:\n`;
    report += `   Overall Health Score: ${result.overallHealthScore}/100\n`;
    report += `   System Status: ${result.isSystemStable ? '✅ STABLE' : '⚠️ NEEDS ATTENTION'}\n`;
    report += `   Total Active Issues: ${result.totalActiveIssues}\n`;
    report += `   Critical Issues: ${result.criticalIssuesCount}\n`;
    report += `   Last Validation: ${result.lastValidationTime}\n\n`;

    // Include database validation report
    report += RealDatabaseValidator.generateValidationReport(result.databaseHealth);

    if (result.quickFixes.length > 0) {
      report += '⚡ QUICK FIXES AVAILABLE:\n';
      result.quickFixes.forEach((fix, index) => {
        report += `${index + 1}. ${fix}\n`;
      });
      report += '\n';
    }

    if (result.systemRecommendations.length > 0) {
      report += '💡 SYSTEM RECOMMENDATIONS:\n';
      result.systemRecommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    }

    return report;
  }
}

export const realVerificationOrchestrator = new RealVerificationOrchestrator();
