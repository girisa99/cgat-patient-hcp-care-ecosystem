/**
 * Stability Manager - Core stability orchestration
 * Manages overall system stability, monitoring, and recovery
 */

import { DuplicateAnalyzer } from './duplicate-analyzer.js';
import { Framework } from './framework.js';

export class StabilityManager {
  constructor(config = {}) {
    this.config = {
      monitoringInterval: 30000, // 30 seconds
      autoFix: true,
      logLevel: 'info',
      ...config
    };
    
    this.duplicateAnalyzer = new DuplicateAnalyzer();
    this.framework = new Framework();
    this.isMonitoring = false;
    this.stabilityMetrics = {
      duplicateCount: 0,
      fixesApplied: 0,
      lastCheck: null,
      healthScore: 100
    };
  }

  /**
   * Start stability monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Stability monitoring started');
    
    this.monitoringInterval = setInterval(async () => {
      await this.performStabilityCheck();
    }, this.config.monitoringInterval);
    
    // Initial check
    await this.performStabilityCheck();
  }

  /**
   * Stop stability monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('⏹️ Stability monitoring stopped');
  }

  /**
   * Perform comprehensive stability check
   */
  async performStabilityCheck() {
    try {
      console.log('🔍 Performing stability check...');
      
      // Analyze duplicates
      const duplicateResults = await this.duplicateAnalyzer.analyze();
      
      // Update metrics
      this.stabilityMetrics.duplicateCount = duplicateResults.totalDuplicates;
      this.stabilityMetrics.lastCheck = new Date();
      
      // Calculate health score
      this.calculateHealthScore(duplicateResults);
      
      // Auto-fix if enabled
      if (this.config.autoFix && duplicateResults.totalDuplicates > 0) {
        const fixResults = await this.applyFixes(duplicateResults);
        this.stabilityMetrics.fixesApplied += fixResults.applied;
      }
      
      // Log results
      this.logStabilityStatus();
      
      return {
        success: true,
        metrics: this.stabilityMetrics,
        duplicates: duplicateResults
      };
    } catch (error) {
      console.error('❌ Stability check failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply automatic fixes for detected issues
   */
  async applyFixes(duplicateResults) {
    const fixes = {
      applied: 0,
      failed: 0,
      details: []
    };

    for (const duplicate of duplicateResults.duplicates) {
      try {
        if (duplicate.canAutoFix) {
          await this.duplicateAnalyzer.fixDuplicate(duplicate);
          fixes.applied++;
          fixes.details.push(`Fixed: ${duplicate.type} - ${duplicate.path}`);
        }
      } catch (error) {
        fixes.failed++;
        fixes.details.push(`Failed to fix: ${duplicate.path} - ${error.message}`);
      }
    }

    return fixes;
  }

  /**
   * Calculate overall system health score
   */
  calculateHealthScore(duplicateResults) {
    let score = 100;
    
    // Deduct points for duplicates
    score -= duplicateResults.totalDuplicates * 5;
    
    // Deduct points for critical issues
    score -= duplicateResults.criticalIssues * 10;
    
    // Ensure score doesn't go below 0
    this.stabilityMetrics.healthScore = Math.max(0, score);
  }

  /**
   * Log current stability status
   */
  logStabilityStatus() {
    const { healthScore, duplicateCount, fixesApplied } = this.stabilityMetrics;
    const status = healthScore >= 90 ? '✅' : healthScore >= 70 ? '⚠️' : '❌';
    
    console.log(`${status} Stability Score: ${healthScore}/100`);
    console.log(`📊 Duplicates: ${duplicateCount}, Fixes Applied: ${fixesApplied}`);
  }

  /**
   * Get current stability metrics
   */
  getMetrics() {
    return { ...this.stabilityMetrics };
  }

  /**
   * Generate stability report
   */
  async generateReport() {
    const duplicateAnalysis = await this.duplicateAnalyzer.getDetailedReport();
    
    return {
      timestamp: new Date(),
      metrics: this.stabilityMetrics,
      duplicateAnalysis,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate recommendations based on current state
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.stabilityMetrics.duplicateCount > 10) {
      recommendations.push('Consider refactoring to reduce duplicate code');
    }
    
    if (this.stabilityMetrics.healthScore < 70) {
      recommendations.push('Immediate attention required for system stability');
    }
    
    return recommendations;
  }
}

export default StabilityManager;