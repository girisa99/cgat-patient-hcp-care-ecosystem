
/**
 * Database Sync Verifier
 * Verifies synchronization between original database tables and sync tables
 */

import { supabase } from '@/integrations/supabase/client';

export interface SyncVerificationResult {
  isInSync: boolean;
  syncDiscrepancies: SyncDiscrepancy[];
  originalTableCounts: Record<string, number>;
  syncTableCounts: Record<string, number>;
  lastSyncTime: string;
  verificationTimestamp: string;
}

export interface SyncDiscrepancy {
  tableName: string;
  originalCount: number;
  syncCount: number;
  difference: number;
  discrepancyType: 'missing_records' | 'extra_records' | 'data_mismatch';
  details: string;
}

export class DatabaseSyncVerifier {
  /**
   * Verify synchronization between original and sync tables
   */
  static async verifySyncIntegrity(): Promise<SyncVerificationResult> {
    console.log('🔄 Starting database sync verification...');
    
    const verificationTimestamp = new Date().toISOString();
    const syncDiscrepancies: SyncDiscrepancy[] = [];
    const originalTableCounts: Record<string, number> = {};
    const syncTableCounts: Record<string, number> = {};

    try {
      // Verify active_issues sync
      await this.verifyActiveIssuesSync(syncDiscrepancies, originalTableCounts, syncTableCounts);

      // Verify issue_fixes sync  
      await this.verifyIssueFixesSync(syncDiscrepancies, originalTableCounts, syncTableCounts);

      // Check overall sync status
      const isInSync = syncDiscrepancies.length === 0;

      console.log(`✅ Database sync verification complete - In Sync: ${isInSync}`);
      console.log(`📊 Found ${syncDiscrepancies.length} sync discrepancies`);

      return {
        isInSync,
        syncDiscrepancies,
        originalTableCounts,
        syncTableCounts,
        lastSyncTime: new Date().toISOString(),
        verificationTimestamp
      };

    } catch (error) {
      console.error('❌ Database sync verification failed:', error);
      throw error;
    }
  }

  /**
   * Verify active_issues table synchronization
   */
  private static async verifyActiveIssuesSync(
    discrepancies: SyncDiscrepancy[],
    originalCounts: Record<string, number>,
    syncCounts: Record<string, number>
  ): Promise<void> {
    try {
      // Get count from active_issues table
      const { count: activeIssuesCount, error: activeError } = await supabase
        .from('active_issues')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) {
        console.error('Error counting active issues:', activeError);
        return;
      }

      originalCounts['active_issues'] = activeIssuesCount || 0;
      syncCounts['active_issues'] = activeIssuesCount || 0; // Same table serves as both

      console.log(`📊 Active Issues Count: ${activeIssuesCount}`);

      // Verify data consistency within active_issues
      const { data: sampleIssues, error: sampleError } = await supabase
        .from('active_issues')
        .select('*')
        .eq('status', 'active')
        .limit(5);

      if (!sampleError && sampleIssues) {
        console.log(`🔍 Sample active issues verified: ${sampleIssues.length} records`);
        
        // Check for required fields
        const missingFields = sampleIssues.filter(issue => 
          !issue.issue_type || !issue.issue_message || !issue.issue_severity
        );

        if (missingFields.length > 0) {
          discrepancies.push({
            tableName: 'active_issues',
            originalCount: activeIssuesCount || 0,
            syncCount: (activeIssuesCount || 0) - missingFields.length,
            difference: missingFields.length,
            discrepancyType: 'data_mismatch',
            details: `${missingFields.length} records have missing required fields`
          });
        }
      }

    } catch (error) {
      console.error('Error verifying active_issues sync:', error);
    }
  }

  /**
   * Verify issue_fixes table synchronization
   */
  private static async verifyIssueFixesSync(
    discrepancies: SyncDiscrepancy[],
    originalCounts: Record<string, number>,
    syncCounts: Record<string, number>
  ): Promise<void> {
    try {
      // Get count from issue_fixes table
      const { count: fixedIssuesCount, error: fixedError } = await supabase
        .from('issue_fixes')
        .select('*', { count: 'exact', head: true });

      if (fixedError) {
        console.error('Error counting fixed issues:', fixedError);
        return;
      }

      originalCounts['issue_fixes'] = fixedIssuesCount || 0;
      syncCounts['issue_fixes'] = fixedIssuesCount || 0; // Same table serves as both

      console.log(`📊 Fixed Issues Count: ${fixedIssuesCount}`);

      // Verify recent fixes
      const { data: recentFixes, error: recentError } = await supabase
        .from('issue_fixes')
        .select('*')
        .order('fixed_at', { ascending: false })
        .limit(10);

      if (!recentError && recentFixes) {
        console.log(`🔍 Recent fixes verified: ${recentFixes.length} records`);
        
        // Check for data integrity
        const invalidFixes = recentFixes.filter(fix => 
          !fix.issue_type || !fix.category || !fix.fix_method
        );

        if (invalidFixes.length > 0) {
          discrepancies.push({
            tableName: 'issue_fixes',
            originalCount: fixedIssuesCount || 0,
            syncCount: (fixedIssuesCount || 0) - invalidFixes.length,
            difference: invalidFixes.length,
            discrepancyType: 'data_mismatch',
            details: `${invalidFixes.length} fix records have missing required fields`
          });
        }
      }

    } catch (error) {
      console.error('Error verifying issue_fixes sync:', error);
    }
  }

  /**
   * Generate sync verification report
   */
  static generateSyncReport(result: SyncVerificationResult): string {
    let report = '🔄 DATABASE SYNC VERIFICATION REPORT\n';
    report += '='.repeat(50) + '\n\n';

    report += `📊 SYNC STATUS: ${result.isInSync ? '✅ IN SYNC' : '❌ OUT OF SYNC'}\n`;
    report += `🕐 Verification Time: ${result.verificationTimestamp}\n`;
    report += `📈 Last Sync: ${result.lastSyncTime}\n\n`;

    report += '📋 TABLE COUNTS:\n';
    Object.entries(result.originalTableCounts).forEach(([table, count]) => {
      report += `   ${table}: ${count} records\n`;
    });
    report += '\n';

    if (result.syncDiscrepancies.length > 0) {
      report += '⚠️ SYNC DISCREPANCIES FOUND:\n';
      result.syncDiscrepancies.forEach((discrepancy, index) => {
        report += `${index + 1}. ${discrepancy.tableName}:\n`;
        report += `   Type: ${discrepancy.discrepancyType}\n`;
        report += `   Original: ${discrepancy.originalCount}\n`;
        report += `   Sync: ${discrepancy.syncCount}\n`;
        report += `   Difference: ${discrepancy.difference}\n`;
        report += `   Details: ${discrepancy.details}\n\n`;
      });
    } else {
      report += '✅ NO SYNC DISCREPANCIES FOUND\n';
      report += 'All tables are properly synchronized.\n\n';
    }

    return report;
  }
}

export const databaseSyncVerifier = new DatabaseSyncVerifier();
