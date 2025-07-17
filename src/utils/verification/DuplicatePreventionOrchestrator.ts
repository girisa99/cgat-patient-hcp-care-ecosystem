/**
 * Duplicate Prevention Orchestrator
 * Coordinates all three duplicate prevention systems
 */

import { DatabaseMigrationSafetyChecker, type MigrationSafetyResult } from './DatabaseMigrationSafetyChecker';
import { RealtimeFileMonitor, type DuplicateCodeAlert } from './RealtimeFileMonitor';
import { DatabaseSchemaDuplicatePrevention, type DuplicatePreventionResult } from './DatabaseSchemaDuplicatePrevention';

export interface ComprehensiveDuplicateReport {
  timestamp: Date;
  migrationSafety: MigrationSafetyResult;
  schemaPrevention: DuplicatePreventionResult[];
  realtimeAlerts: DuplicateCodeAlert[];
  overallScore: number;
  criticalIssues: string[];
  recommendations: string[];
}

export class DuplicatePreventionOrchestrator {
  private fileMonitor: RealtimeFileMonitor;
  private schemaPrevention: DatabaseSchemaDuplicatePrevention;
  private isActive: boolean = false;

  constructor() {
    this.fileMonitor = new RealtimeFileMonitor();
    this.schemaPrevention = new DatabaseSchemaDuplicatePrevention();
    this.setupEventListeners();
  }

  /**
   * Start comprehensive duplicate prevention
   */
  async startDuplicatePrevention(config: {
    watchPaths?: string[];
    migrationScript?: string;
    realtimeMonitoring?: boolean;
  }): Promise<ComprehensiveDuplicateReport> {
    console.log('🚀 Starting comprehensive duplicate prevention...');
    
    this.isActive = true;
    const report: ComprehensiveDuplicateReport = {
      timestamp: new Date(),
      migrationSafety: await this.runMigrationSafety(config.migrationScript),
      schemaPrevention: await this.runSchemaPrevention(config.migrationScript),
      realtimeAlerts: [],
      overallScore: 0,
      criticalIssues: [],
      recommendations: []
    };

    // Start real-time monitoring if requested
    if (config.realtimeMonitoring && config.watchPaths) {
      this.fileMonitor.startMonitoring(config.watchPaths);
    }

    // Calculate overall metrics
    report.overallScore = this.calculateOverallScore(report);
    report.criticalIssues = this.extractCriticalIssues(report);
    report.recommendations = this.generateComprehensiveRecommendations(report);

    console.log(`✅ Duplicate prevention analysis complete - Score: ${report.overallScore}/100`);
    return report;
  }

  /**
   * Stop all duplicate prevention systems
   */
  stopDuplicatePrevention(): void {
    console.log('⏹️ Stopping duplicate prevention systems...');
    this.isActive = false;
    this.fileMonitor.stopMonitoring();
    this.schemaPrevention.clearCache();
  }

  /**
   * Run migration safety analysis
   */
  private async runMigrationSafety(migrationScript?: string): Promise<MigrationSafetyResult> {
    if (!migrationScript) {
      return {
        safetyScore: 100,
        dataLossRisks: [],
        performanceImpacts: [],
        compatibilityIssues: [],
        safetyRecommendations: ['No migration script provided for analysis']
      };
    }

    return await DatabaseMigrationSafetyChecker.analyzeMigrationSafety(migrationScript);
  }

  /**
   * Run schema prevention analysis
   */
  private async runSchemaPrevention(migrationScript?: string): Promise<DuplicatePreventionResult[]> {
    if (!migrationScript) {
      return [];
    }

    return await this.schemaPrevention.analyzeMigrationScript(migrationScript);
  }

  /**
   * Setup event listeners for real-time monitoring
   */
  private setupEventListeners(): void {
    this.fileMonitor.onDuplicateDetected((alert: DuplicateCodeAlert) => {
      console.log(`🚨 Real-time duplicate detected: ${alert.severity} - ${alert.files.join(', ')}`);
      // Could emit events here for UI updates
    });

    this.fileMonitor.onFileChanged((event) => {
      console.log(`📁 File ${event.type}: ${event.path}`);
    });
  }

  /**
   * Calculate overall score from all systems
   */
  private calculateOverallScore(report: ComprehensiveDuplicateReport): number {
    let score = 100;
    
    // Migration safety score (weight: 40%)
    score = score * 0.6 + (report.migrationSafety.safetyScore * 0.4);
    
    // Schema prevention score (weight: 40%)
    const criticalSchemaIssues = report.schemaPrevention.filter(r => r.severity === 'critical').length;
    const highSchemaIssues = report.schemaPrevention.filter(r => r.severity === 'high').length;
    const mediumSchemaIssues = report.schemaPrevention.filter(r => r.severity === 'medium').length;
    
    score -= (criticalSchemaIssues * 30) + (highSchemaIssues * 15) + (mediumSchemaIssues * 5);
    
    // Real-time alerts score (weight: 20%)
    const highAlerts = report.realtimeAlerts.filter(a => a.severity === 'high').length;
    const mediumAlerts = report.realtimeAlerts.filter(a => a.severity === 'medium').length;
    
    score -= (highAlerts * 10) + (mediumAlerts * 5);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Extract critical issues from all systems
   */
  private extractCriticalIssues(report: ComprehensiveDuplicateReport): string[] {
    const issues: string[] = [];
    
    // Migration safety critical issues
    report.migrationSafety.dataLossRisks
      .filter(risk => risk.severity === 'critical')
      .forEach(risk => issues.push(`Migration: ${risk.description}`));
    
    // Schema prevention critical issues
    report.schemaPrevention
      .filter(result => result.severity === 'critical')
      .forEach(result => issues.push(`Schema: Duplicate ${result.duplicates[0]?.type} ${result.duplicates[0]?.name}`));
    
    // Real-time high severity alerts
    report.realtimeAlerts
      .filter(alert => alert.severity === 'high')
      .forEach(alert => issues.push(`Code: ${alert.duplicateType} duplicate in ${alert.files.join(', ')}`));
    
    return issues;
  }

  /**
   * Generate comprehensive recommendations
   */
  private generateComprehensiveRecommendations(report: ComprehensiveDuplicateReport): string[] {
    const recommendations: string[] = [];
    
    // Always include best practices
    recommendations.push('Enable real-time monitoring for continuous duplicate detection');
    recommendations.push('Run migration safety checks before all database changes');
    recommendations.push('Implement code review process focusing on duplicate prevention');
    
    // Add specific recommendations from each system
    recommendations.push(...report.migrationSafety.safetyRecommendations.slice(0, 2));
    
    const schemaRecommendations = report.schemaPrevention
      .flatMap(r => r.recommendations)
      .slice(0, 3);
    recommendations.push(...schemaRecommendations);
    
    const codeRecommendations = report.realtimeAlerts
      .flatMap(a => a.suggestions)
      .slice(0, 2);
    recommendations.push(...codeRecommendations);
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Get current status of all systems
   */
  getSystemStatus() {
    return {
      isActive: this.isActive,
      fileMonitoring: this.fileMonitor.getMonitoringStats(),
      schemaPrevention: this.schemaPrevention.getPreventionStats(),
      timestamp: new Date()
    };
  }

  /**
   * Quick check for specific migration script
   */
  async quickMigrationCheck(migrationScript: string): Promise<{
    safe: boolean;
    issues: number;
    criticalIssues: number;
    recommendations: string[];
  }> {
    const safetyResult = await DatabaseMigrationSafetyChecker.analyzeMigrationSafety(migrationScript);
    const schemaResults = await this.schemaPrevention.analyzeMigrationScript(migrationScript);
    
    const criticalIssues = 
      safetyResult.dataLossRisks.filter(r => r.severity === 'critical').length +
      schemaResults.filter(r => r.severity === 'critical').length;
    
    const totalIssues = 
      safetyResult.dataLossRisks.length + 
      schemaResults.length;
    
    return {
      safe: criticalIssues === 0 && safetyResult.safetyScore > 70,
      issues: totalIssues,
      criticalIssues,
      recommendations: [
        ...safetyResult.safetyRecommendations.slice(0, 2),
        ...schemaResults.flatMap(r => r.recommendations).slice(0, 2)
      ]
    };
  }
}

export const duplicatePreventionOrchestrator = new DuplicatePreventionOrchestrator();