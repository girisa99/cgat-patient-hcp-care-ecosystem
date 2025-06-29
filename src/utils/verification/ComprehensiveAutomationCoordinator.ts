
/**
 * Comprehensive Automation Coordinator
 * Ensures all verification systems run together every 30 minutes
 * Prevents missing any components and maintains consistency
 */

import { supabase } from '@/integrations/supabase/client';
import { RealVerificationOrchestrator, RealSystemHealthResult } from './RealVerificationOrchestrator';
import { DatabaseSyncVerifier, SyncVerificationResult } from './DatabaseSyncVerifier';
import { ComprehensiveSystemVerifier, ComprehensiveVerificationResult } from './ComprehensiveSystemVerifier';
import { performDatabaseSync } from '../dailyProgressTracker';

export interface AutomationExecutionResult {
  timestamp: string;
  executionId: string;
  realSystemHealth: RealSystemHealthResult;
  syncVerification: SyncVerificationResult;
  comprehensiveResults: ComprehensiveVerificationResult;
  healthScoreCalculation: {
    score: number;
    basedOnOriginalDB: boolean;
    calculationMethod: string;
    factors: Record<string, number>;
  };
  automationStatus: {
    allComponentsExecuted: boolean;
    missedComponents: string[];
    syncToTablesCompleted: boolean;
    resultsPublished: boolean;
  };
}

export class ComprehensiveAutomationCoordinator {
  private static isRunning = false;
  private static lastExecution: string | null = null;

  /**
   * Execute complete 30-minute automation cycle
   * This is the main function called every 30 minutes
   */
  static async execute30MinuteAutomationCycle(): Promise<AutomationExecutionResult> {
    if (this.isRunning) {
      console.log('⏳ Automation cycle already in progress, skipping...');
      throw new Error('Automation cycle already in progress');
    }

    this.isRunning = true;
    const executionId = `auto_${Date.now()}`;
    const timestamp = new Date().toISOString();

    console.log(`🚀 STARTING 30-MINUTE COMPREHENSIVE AUTOMATION CYCLE: ${executionId}`);
    console.log(`📅 Execution Time: ${timestamp}`);

    try {
      // Step 1: Execute Real System Validation (ORIGINAL DATABASE ONLY)
      console.log('📊 Step 1: Real System Validation from Original Database...');
      const realSystemHealth = await RealVerificationOrchestrator.performRealSystemValidation();

      // Step 2: Execute Database Sync Verification
      console.log('🔄 Step 2: Database Sync Verification...');
      const syncVerification = await DatabaseSyncVerifier.verifySyncIntegrity();

      // Step 3: Execute Comprehensive System Verification
      console.log('🔍 Step 3: Comprehensive System Verification...');
      const comprehensiveResults = await ComprehensiveSystemVerifier.performComprehensiveVerification();

      // Step 4: Calculate Health Score (BASED ON ORIGINAL DATABASE ONLY)
      console.log('🎯 Step 4: Health Score Calculation (Original DB Only)...');
      const healthScoreCalculation = this.calculateHealthScoreFromOriginalDB(
        realSystemHealth,
        comprehensiveResults
      );

      // Step 5: Sync Results to Database Tables
      console.log('💾 Step 5: Syncing Results to Database Tables...');
      const syncToTablesCompleted = await this.syncResultsToTables(
        realSystemHealth,
        syncVerification,
        comprehensiveResults,
        healthScoreCalculation
      );

      // Step 6: Publish Results
      console.log('📢 Step 6: Publishing Results...');
      const resultsPublished = await this.publishResults(executionId, {
        realSystemHealth,
        syncVerification,
        comprehensiveResults,
        healthScoreCalculation
      });

      const automationResult: AutomationExecutionResult = {
        timestamp,
        executionId,
        realSystemHealth,
        syncVerification,
        comprehensiveResults,
        healthScoreCalculation,
        automationStatus: {
          allComponentsExecuted: true,
          missedComponents: [],
          syncToTablesCompleted,
          resultsPublished
        }
      };

      this.lastExecution = timestamp;
      console.log('✅ 30-MINUTE AUTOMATION CYCLE COMPLETED SUCCESSFULLY');
      console.log(`📊 Health Score: ${healthScoreCalculation.score}/100 (Based on Original DB)`);
      console.log(`🔄 Sync Status: ${syncVerification.isInSync ? 'IN SYNC' : 'OUT OF SYNC'}`);
      console.log(`💾 Results Synced: ${syncToTablesCompleted ? 'YES' : 'NO'}`);

      return automationResult;

    } catch (error) {
      console.error('❌ 30-MINUTE AUTOMATION CYCLE FAILED:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Calculate health score based ONLY on original database findings
   * This ensures consistency and prevents confusion
   */
  private static calculateHealthScoreFromOriginalDB(
    realSystemHealth: RealSystemHealthResult,
    comprehensiveResults: ComprehensiveVerificationResult
  ) {
    console.log('🧮 Calculating health score from ORIGINAL DATABASE data only...');

    let baseScore = 100;
    const factors: Record<string, number> = {};

    // Factor 1: Critical issues from real database validation
    const criticalPenalty = realSystemHealth.criticalIssuesCount * 20;
    factors['critical_issues_penalty'] = criticalPenalty;
    baseScore -= criticalPenalty;

    // Factor 2: Total active issues from real database
    const activePenalty = Math.min(30, realSystemHealth.totalActiveIssues * 3);
    factors['active_issues_penalty'] = activePenalty;
    baseScore -= activePenalty;

    // Factor 3: Database health from comprehensive results
    const dbHealthBonus = comprehensiveResults.systemHealth.databaseHealth.isHealthy ? 10 : -10;
    factors['database_health_bonus'] = dbHealthBonus;
    baseScore += dbHealthBonus;

    // Factor 4: System stability bonus
    const stabilityBonus = realSystemHealth.isSystemStable ? 5 : -5;
    factors['stability_bonus'] = stabilityBonus;
    baseScore += stabilityBonus;

    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore)));

    console.log('📊 Health Score Calculation Details:');
    console.log(`   Base Score: 100`);
    console.log(`   Critical Issues Penalty: -${criticalPenalty}`);
    console.log(`   Active Issues Penalty: -${activePenalty}`);
    console.log(`   Database Health Bonus: ${dbHealthBonus > 0 ? '+' : ''}${dbHealthBonus}`);
    console.log(`   Stability Bonus: ${stabilityBonus > 0 ? '+' : ''}${stabilityBonus}`);
    console.log(`   Final Score: ${finalScore}/100`);

    return {
      score: finalScore,
      basedOnOriginalDB: true,
      calculationMethod: 'original_database_only',
      factors
    };
  }

  /**
   * Sync all results to database tables for display
   */
  private static async syncResultsToTables(
    realSystemHealth: RealSystemHealthResult,
    syncVerification: SyncVerificationResult,
    comprehensiveResults: ComprehensiveVerificationResult,
    healthScore: any
  ): Promise<boolean> {
    try {
      console.log('💾 Syncing comprehensive results to database tables...');

      // Clear and sync active issues from real verification
      const allIssues = [
        ...realSystemHealth.databaseHealth.issues.map(issue => ({
          type: issue.type,
          message: issue.description,
          source: `Database - ${issue.table}`,
          severity: issue.severity
        })),
        ...comprehensiveResults.systemHealth.databaseHealth.issues.map(issue => ({
          type: issue.type,
          message: issue.description,
          source: `System - ${issue.table}`,
          severity: issue.severity
        }))
      ];

      // Use existing sync function
      await performDatabaseSync(allIssues);

      // Record automation execution metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('issue_fixes')
          .insert({
            user_id: user.id,
            issue_type: 'AUTOMATION_CYCLE',
            issue_message: `30-minute automation completed: ${allIssues.length} issues found, health score: ${healthScore.score}`,
            issue_source: 'Automated System',
            issue_severity: 'low',
            category: 'System',
            fix_method: 'automatic',
            metadata: {
              execution_timestamp: new Date().toISOString(),
              health_score: healthScore.score,
              based_on_original_db: true,
              total_issues: allIssues.length,
              critical_issues: realSystemHealth.criticalIssuesCount,
              sync_status: syncVerification.isInSync ? 'in_sync' : 'out_of_sync'
            }
          });
      }

      console.log('✅ Results successfully synced to database tables');
      return true;

    } catch (error) {
      console.error('❌ Failed to sync results to database tables:', error);
      return false;
    }
  }

  /**
   * Publish results for frontend consumption
   */
  private static async publishResults(executionId: string, results: any): Promise<boolean> {
    try {
      // Store results in localStorage for immediate frontend access
      localStorage.setItem('latest_automation_results', JSON.stringify({
        executionId,
        timestamp: new Date().toISOString(),
        ...results
      }));

      // Emit event for real-time updates
      window.dispatchEvent(new CustomEvent('automation-cycle-complete', {
        detail: { executionId, results }
      }));

      console.log('📢 Results published successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to publish results:', error);
      return false;
    }
  }

  /**
   * Get the status of automation components
   */
  static getAutomationStatus() {
    return {
      isRunning: this.isRunning,
      lastExecution: this.lastExecution,
      components: {
        realSystemValidation: true,
        databaseSyncVerification: true,
        comprehensiveVerification: true,
        healthScoreCalculation: true,
        resultsSyncing: true,
        resultsPublishing: true
      }
    };
  }

  /**
   * Manual trigger for testing
   */
  static async triggerManualExecution(): Promise<AutomationExecutionResult> {
    console.log('🔧 Manual trigger requested for automation cycle');
    return await this.execute30MinuteAutomationCycle();
  }
}

export const comprehensiveAutomationCoordinator = new ComprehensiveAutomationCoordinator();
