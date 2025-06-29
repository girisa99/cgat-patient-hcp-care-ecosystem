
/**
 * Comprehensive System Verifier
 * Orchestrates complete system verification including database validation and sync checks
 */

import { RealVerificationOrchestrator, RealSystemHealthResult } from './RealVerificationOrchestrator';
import { DatabaseSyncVerifier, SyncVerificationResult } from './DatabaseSyncVerifier';

export interface ComprehensiveVerificationResult {
  systemHealth: RealSystemHealthResult;
  syncVerification: SyncVerificationResult;
  overallStatus: 'healthy' | 'warning' | 'critical';
  criticalIssuesFound: number;
  totalActiveIssues: number;
  syncStatus: 'in_sync' | 'out_of_sync' | 'partial_sync';
  recommendations: string[];
  verificationTimestamp: string;
}

export class ComprehensiveSystemVerifier {
  /**
   * Run complete system verification including database health and sync checks
   */
  static async runCompleteVerification(): Promise<ComprehensiveVerificationResult> {
    console.log('🚀 Starting comprehensive system verification...');
    console.log('📋 This includes: Database Health + Sync Verification + System Status');
    
    const verificationTimestamp = new Date().toISOString();

    try {
      // Step 1: Run system health verification
      console.log('🔍 Step 1: Running system health verification...');
      const systemHealth = await RealVerificationOrchestrator.performRealSystemValidation();

      // Step 2: Run database sync verification
      console.log('🔄 Step 2: Running database sync verification...');
      const syncVerification = await DatabaseSyncVerifier.verifySyncIntegrity();

      // Step 3: Determine overall status
      const overallStatus = this.determineOverallStatus(systemHealth, syncVerification);
      const syncStatus = this.determineSyncStatus(syncVerification);

      // Step 4: Generate comprehensive recommendations
      const recommendations = this.generateComprehensiveRecommendations(systemHealth, syncVerification);

      const result: ComprehensiveVerificationResult = {
        systemHealth,
        syncVerification,
        overallStatus,
        criticalIssuesFound: systemHealth.criticalIssuesCount,
        totalActiveIssues: systemHealth.totalActiveIssues,
        syncStatus,
        recommendations,
        verificationTimestamp
      };

      console.log('✅ Comprehensive system verification completed');
      console.log(`📊 Overall Status: ${overallStatus.toUpperCase()}`);
      console.log(`🔄 Sync Status: ${syncStatus.toUpperCase()}`);
      console.log(`🚨 Critical Issues: ${result.criticalIssuesFound}`);
      console.log(`📈 Total Active Issues: ${result.totalActiveIssues}`);

      return result;

    } catch (error) {
      console.error('❌ Comprehensive system verification failed:', error);
      throw error;
    }
  }

  /**
   * Determine overall system status
   */
  private static determineOverallStatus(
    systemHealth: RealSystemHealthResult,
    syncVerification: SyncVerificationResult
  ): 'healthy' | 'warning' | 'critical' {
    // Critical if there are critical issues or major sync problems
    if (systemHealth.criticalIssuesCount > 0 || !syncVerification.isInSync) {
      return 'critical';
    }

    // Warning if health score is low or there are multiple issues
    if (systemHealth.overallHealthScore < 70 || systemHealth.totalActiveIssues > 5) {
      return 'warning';
    }

    // Healthy otherwise
    return 'healthy';
  }

  /**
   * Determine sync status
   */
  private static determineSyncStatus(syncVerification: SyncVerificationResult): 'in_sync' | 'out_of_sync' | 'partial_sync' {
    if (syncVerification.isInSync) {
      return 'in_sync';
    }

    // Check if issues are minor
    const minorDiscrepancies = syncVerification.syncDiscrepancies.filter(d => 
      d.discrepancyType === 'data_mismatch' && d.difference < 5
    );

    if (minorDiscrepancies.length === syncVerification.syncDiscrepancies.length) {
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

    // Add system health recommendations
    recommendations.push(...systemHealth.systemRecommendations);

    // Add sync-specific recommendations
    if (!syncVerification.isInSync) {
      recommendations.push('🔄 DATABASE SYNC: Resolve sync discrepancies between original and sync tables');
      
      syncVerification.syncDiscrepancies.forEach(discrepancy => {
        recommendations.push(`📋 ${discrepancy.tableName.toUpperCase()}: ${discrepancy.details}`);
      });
    }

    // Add priority recommendations based on status
    if (systemHealth.criticalIssuesCount > 0) {
      recommendations.unshift('🚨 IMMEDIATE ACTION: Address all critical issues before proceeding with other tasks');
    }

    if (systemHealth.overallHealthScore < 50) {
      recommendations.unshift('⚠️ SYSTEM HEALTH: Overall system health is below acceptable levels - comprehensive review needed');
    }

    return recommendations;
  }

  /**
   * Generate comprehensive verification report
   */
  static generateComprehensiveReport(result: ComprehensiveVerificationResult): string {
    let report = '🏥 COMPREHENSIVE SYSTEM VERIFICATION REPORT\n';
    report += '='.repeat(60) + '\n\n';

    // Overall Status
    report += `📊 OVERALL SYSTEM STATUS: ${result.overallStatus.toUpperCase()}\n`;
    report += `🔄 DATABASE SYNC STATUS: ${result.syncStatus.replace('_', ' ').toUpperCase()}\n`;
    report += `🕐 Verification Time: ${result.verificationTimestamp}\n\n`;

    // Key Metrics
    report += '📈 KEY METRICS:\n';
    report += `   System Health Score: ${result.systemHealth.overallHealthScore}/100\n`;
    report += `   Critical Issues: ${result.criticalIssuesFound}\n`;
    report += `   Total Active Issues: ${result.totalActiveIssues}\n`;
    report += `   Database Tables Scanned: ${result.systemHealth.databaseHealth.tablesScanned.length}\n`;
    report += `   Sync Discrepancies: ${result.syncVerification.syncDiscrepancies.length}\n\n`;

    // Include detailed system health report
    report += RealVerificationOrchestrator.generateSystemReport(result.systemHealth);
    report += '\n';

    // Include sync verification report
    report += DatabaseSyncVerifier.generateSyncReport(result.syncVerification);

    // Comprehensive recommendations
    if (result.recommendations.length > 0) {
      report += '💡 COMPREHENSIVE RECOMMENDATIONS:\n';
      result.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    }

    return report;
  }
}

export const comprehensiveSystemVerifier = new ComprehensiveSystemVerifier();
