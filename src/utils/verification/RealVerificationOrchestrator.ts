/**
 * Real Verification Orchestrator
 * Coordinates real database validation and system health checks
 * STORES ALL RESULTS IN DATABASE - NO LOCAL STORAGE
 * NOW WITH INTEGRATED AUDIT LOGGING
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
   * Log verification activity to audit logs
   */
  private static async logVerificationActivity(
    activityType: string,
    description: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_verification_activity', {
        activity_type: activityType,
        activity_description: description,
        metadata_info: metadata
      });

      if (error) {
        console.error('❌ Failed to log verification activity:', error);
      } else {
        console.log('✅ Verification activity logged:', activityType);
      }
    } catch (error) {
      console.error('❌ Error logging verification activity:', error);
    }
  }

  /**
   * Perform comprehensive real system validation
   * ALL RESULTS ARE SYNCED TO DATABASE TABLES WITH AUDIT LOGGING
   */
  static async performRealSystemValidation(): Promise<RealSystemHealthResult> {
    console.log('🚀 REAL SYSTEM VALIDATION STARTING...');
    console.log('🔍 Validating live database and syncing to database tables');

    const validationStart = new Date().toISOString();

    // Log validation start
    await this.logVerificationActivity(
      'VALIDATION_STARTED',
      'Real system validation initiated',
      { timestamp: validationStart }
    );

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

      // CRITICAL: Store ALL validation results in database tables
      console.log('💾 Step 2: Syncing ALL results to database tables...');
      await this.syncAllResultsToDatabase(databaseHealth);

      // Log validation completion
      await this.logVerificationActivity(
        'VALIDATION_COMPLETED',
        `System validation completed with ${totalActiveIssues} issues found`,
        {
          healthScore: overallHealthScore,
          criticalIssues: criticalIssuesCount,
          totalIssues: totalActiveIssues,
          isStable: isSystemStable
        }
      );

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
      console.log(`💾 ALL RESULTS SYNCED TO DATABASE TABLES WITH AUDIT LOGGING`);

      return result;

    } catch (error) {
      console.error('❌ Real system validation failed:', error);
      
      // Log validation failure
      await this.logVerificationActivity(
        'VALIDATION_FAILED',
        `System validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

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
   * Sync ALL validation results to database tables with enhanced audit logging
   * This replaces local storage completely
   */
  private static async syncAllResultsToDatabase(databaseHealth: RealDatabaseValidationResult): Promise<void> {
    try {
      console.log('🔄 Clearing existing active issues from database...');
      
      // Log clearing action
      await this.logVerificationActivity(
        'ISSUES_CLEARING',
        'Clearing existing active issues from database',
        { issuesBeingCleared: 'all_active' }
      );

      // Clear existing active issues
      const { error: deleteError } = await supabase
        .from('active_issues')
        .delete()
        .eq('status', 'active');

      if (deleteError) {
        console.error('Error clearing active issues:', deleteError);
        throw deleteError;
      }

      console.log('✅ Cleared existing active issues');

      // Insert ALL new issues from real validation with proper categorization
      if (databaseHealth.issues.length > 0) {
        console.log(`📝 Inserting ${databaseHealth.issues.length} real issues into database...`);
        
        const issuesData = databaseHealth.issues.map(issue => ({
          issue_type: issue.type,
          issue_message: issue.description,
          issue_source: `Database - ${issue.table}${issue.column ? ` (${issue.column})` : ''}`,
          issue_severity: issue.severity,
          category: this.categorizeIssue(issue),
          status: 'active'
        }));

        const { error: insertError } = await supabase
          .from('active_issues')
          .insert(issuesData);

        if (insertError) {
          console.error('Error inserting validation results:', insertError);
          throw insertError;
        }

        // Log issues insertion
        await this.logVerificationActivity(
          'ISSUES_INSERTED',
          `Successfully inserted ${issuesData.length} issues into active_issues table`,
          {
            issuesCount: issuesData.length,
            categorySummary: this.getIssueCategorySummary(issuesData)
          }
        );

        console.log(`✅ Successfully synced ${issuesData.length} real issues to database`);
        console.log('📊 Issue categories:', this.getIssueCategorySummary(issuesData));
      } else {
        console.log('✅ No issues found - database is healthy');
        
        // Log healthy state
        await this.logVerificationActivity(
          'HEALTHY_STATE',
          'No issues found - database is in healthy state',
          { issuesFound: 0 }
        );
      }

    } catch (error) {
      console.error('❌ Error syncing validation results to database:', error);
      
      // Log sync failure
      await this.logVerificationActivity(
        'SYNC_FAILED',
        `Failed to sync validation results to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      throw error;
    }
  }

  /**
   * Categorize issues based on type and source
   */
  private static categorizeIssue(issue: any): string {
    if (issue.type === 'missing_rls' || issue.type === 'security_gap') {
      return 'Security';
    }
    if (issue.type === 'schema_inconsistency' || issue.type === 'constraint_violation') {
      return 'Database';
    }
    if (issue.type === 'missing_index') {
      return 'Performance';
    }
    return 'System';
  }

  /**
   * Get summary of issue categories for logging
   */
  private static getIssueCategorySummary(issues: any[]): Record<string, number> {
    const summary: Record<string, number> = {};
    issues.forEach(issue => {
      summary[issue.category] = (summary[issue.category] || 0) + 1;
    });
    return summary;
  }

  /**
   * Generate comprehensive validation report
   */
  static generateSystemReport(result: RealSystemHealthResult): string {
    let report = '🏥 REAL SYSTEM HEALTH REPORT (DATABASE SYNCED WITH AUDIT LOGGING)\n';
    report += '='.repeat(70) + '\n\n';

    report += `📊 SYSTEM OVERVIEW:\n`;
    report += `   Overall Health Score: ${result.overallHealthScore}/100\n`;
    report += `   System Status: ${result.isSystemStable ? '✅ STABLE' : '⚠️ NEEDS ATTENTION'}\n`;
    report += `   Total Active Issues: ${result.totalActiveIssues}\n`;
    report += `   Critical Issues: ${result.criticalIssuesCount}\n`;
    report += `   Last Validation: ${result.lastValidationTime}\n`;
    report += `   Data Source: 🗄️ REAL DATABASE TABLES (NO MOCK DATA)\n`;
    report += `   Audit Logging: ✅ ENABLED AND ACTIVE\n\n`;

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
