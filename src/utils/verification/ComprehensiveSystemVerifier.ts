
/**
 * Comprehensive System Verifier
 * Integrates with automation coordinator for complete system verification
 */

import { RealVerificationOrchestrator, RealSystemHealthResult } from './RealVerificationOrchestrator';
import { DatabaseSyncVerifier, SyncVerificationResult } from './DatabaseSyncVerifier';
import { performDatabaseSync } from '../dailyProgressTracker';

export interface ComprehensiveVerificationResult {
  verificationId: string;
  timestamp: string;
  systemHealth: RealSystemHealthResult;
  syncVerification: SyncVerificationResult;
  overallHealthScore: number;
  syncStatus: 'in_sync' | 'partial_sync' | 'out_of_sync';
  criticalIssuesFound: number;
  totalActiveIssues: number;
  recommendations: string[];
  quickFixes: string[];
  automationMetadata: {
    triggeredBy: 'manual' | 'scheduled';
    executionTime: number;
    dataSource: 'original_database';
    syncCompleted: boolean;
  };
}

export class ComprehensiveSystemVerifier {
  /**
   * Perform comprehensive verification - integrated with automation
   */
  static async performComprehensiveVerification(
    triggeredBy: 'manual' | 'scheduled' = 'manual'
  ): Promise<ComprehensiveVerificationResult> {
    const startTime = Date.now();
    const verificationId = `comprehensive_${startTime}`;
    
    console.log(`🔍 COMPREHENSIVE SYSTEM VERIFICATION STARTED: ${verificationId}`);
    console.log(`🎯 Triggered by: ${triggeredBy}`);
    console.log(`📊 Data source: ORIGINAL DATABASE ONLY`);

    try {
      // Step 1: Real system health validation
      console.log('📊 Step 1: Real system health validation...');
      const systemHealth = await RealVerificationOrchestrator.performRealSystemValidation();

      // Step 2: Database synchronization verification
      console.log('🔄 Step 2: Database synchronization verification...');
      const syncVerification = await DatabaseSyncVerifier.verifySyncIntegrity();

      // Step 3: Calculate comprehensive health score (ORIGINAL DB ONLY)
      const overallHealthScore = this.calculateComprehensiveHealthScore(systemHealth);

      // Step 4: Determine sync status
      const syncStatus = this.determineSyncStatus(syncVerification);

      // Step 5: Generate comprehensive recommendations
      const recommendations = this.generateComprehensiveRecommendations(
        systemHealth,
        syncVerification
      );

      // Step 6: Generate quick fixes
      const quickFixes = this.generateQuickFixes(systemHealth, syncVerification);

      // Step 7: Sync to database tables if this is automated
      let syncCompleted = false;
      if (triggeredBy === 'scheduled') {
        console.log('💾 Syncing results to database tables (automated cycle)...');
        const allIssues = systemHealth.databaseHealth.issues.map(issue => ({
          type: issue.type,
          message: issue.description,
          source: `Database - ${issue.table}`,
          severity: issue.severity
        }));
        syncCompleted = await performDatabaseSync(allIssues);
      }

      const executionTime = Date.now() - startTime;

      const result: ComprehensiveVerificationResult = {
        verificationId,
        timestamp: new Date().toISOString(),
        systemHealth,
        syncVerification,
        overallHealthScore,
        syncStatus,
        criticalIssuesFound: systemHealth.criticalIssuesCount,
        totalActiveIssues: systemHealth.totalActiveIssues,
        recommendations,
        quickFixes,
        automationMetadata: {
          triggeredBy,
          executionTime,
          dataSource: 'original_database',
          syncCompleted
        }
      };

      console.log('✅ COMPREHENSIVE VERIFICATION COMPLETED');
      console.log(`📊 Overall Health Score: ${overallHealthScore}/100`);
      console.log(`🔄 Sync Status: ${syncStatus}`);
      console.log(`⏱️ Execution Time: ${executionTime}ms`);
      console.log(`💾 Database Sync: ${syncCompleted ? 'COMPLETED' : 'SKIPPED'}`);

      return result;

    } catch (error) {
      console.error('❌ COMPREHENSIVE VERIFICATION FAILED:', error);
      throw new Error(`Comprehensive verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate health score based on original database data only
   */
  private static calculateComprehensiveHealthScore(systemHealth: RealSystemHealthResult): number {
    // Use the same calculation as the automation coordinator
    let score = systemHealth.overallHealthScore;
    
    // Additional comprehensive factors
    if (systemHealth.isSystemStable) {
      score += 5;
    }
    
    if (systemHealth.quickFixes.length > 0) {
      score += Math.min(10, systemHealth.quickFixes.length * 2);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Determine sync status from verification results
   */
  private static determineSyncStatus(syncVerification: SyncVerificationResult): 'in_sync' | 'partial_sync' | 'out_of_sync' {
    if (syncVerification.isInSync) {
      return 'in_sync';
    }
    
    if (syncVerification.syncDiscrepancies.length <= 2) {
      return 'partial_sync';
    }
    
    return 'out_of_sync';
  }

  /**
   * Generate comprehensive recommendations
   */
  private static generateComprehensiveRecommendations(
    systemHealth: RealSystemHealthResult,
    syncVerification: SyncVerificationResult
  ): string[] {
    const recommendations: string[] = [];

    // Include system health recommendations
    recommendations.push(...systemHealth.systemRecommendations);

    // Add sync-specific recommendations
    if (!syncVerification.isInSync) {
      recommendations.push('🔄 SYNC: Address database synchronization discrepancies immediately');
      recommendations.push('📊 MONITORING: Implement real-time sync monitoring and alerting');
    }

    // Add automation-specific recommendations
    recommendations.push('🤖 AUTOMATION: Ensure 30-minute automation cycle runs consistently');
    recommendations.push('📈 METRICS: Monitor health score trends and set up alerting for drops');
    recommendations.push('🔍 VALIDATION: Regular manual verification to supplement automation');

    return recommendations;
  }

  /**
   * Generate quick fixes
   */
  private static generateQuickFixes(
    systemHealth: RealSystemHealthResult,
    syncVerification: SyncVerificationResult
  ): string[] {
    const quickFixes: string[] = [];

    // Include system health quick fixes
    quickFixes.push(...systemHealth.quickFixes);

    // Add sync quick fixes
    if (syncVerification.syncDiscrepancies.length > 0) {
      quickFixes.push(`Fix ${syncVerification.syncDiscrepancies.length} sync discrepancies`);
    }

    return quickFixes;
  }

  /**
   * Generate comprehensive report
   */
  static generateComprehensiveReport(result: ComprehensiveVerificationResult): string {
    let report = '🏥 COMPREHENSIVE SYSTEM VERIFICATION REPORT\n';
    report += '='.repeat(70) + '\n\n';

    report += `📋 VERIFICATION DETAILS:\n`;
    report += `   Verification ID: ${result.verificationId}\n`;
    report += `   Timestamp: ${result.timestamp}\n`;
    report += `   Triggered By: ${result.automationMetadata.triggeredBy.toUpperCase()}\n`;
    report += `   Data Source: ${result.automationMetadata.dataSource.toUpperCase()}\n`;
    report += `   Execution Time: ${result.automationMetadata.executionTime}ms\n`;
    report += `   Database Sync: ${result.automationMetadata.syncCompleted ? 'COMPLETED' : 'SKIPPED'}\n\n`;

    report += `📊 SYSTEM HEALTH SUMMARY:\n`;
    report += `   Overall Health Score: ${result.overallHealthScore}/100\n`;
    report += `   System Stability: ${result.systemHealth.isSystemStable ? '✅ STABLE' : '⚠️ UNSTABLE'}\n`;
    report += `   Total Active Issues: ${result.totalActiveIssues}\n`;
    report += `   Critical Issues: ${result.criticalIssuesFound}\n`;
    report += `   Sync Status: ${result.syncStatus.toUpperCase()}\n\n`;

    // Include detailed system health report
    report += RealVerificationOrchestrator.generateSystemReport(result.systemHealth);

    // Include sync report
    report += '\n' + DatabaseSyncVerifier.generateSyncReport(result.syncVerification);

    if (result.recommendations.length > 0) {
      report += '\n💡 COMPREHENSIVE RECOMMENDATIONS:\n';
      result.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    }

    return report;
  }
}

export const comprehensiveSystemVerifier = new ComprehensiveSystemVerifier();
