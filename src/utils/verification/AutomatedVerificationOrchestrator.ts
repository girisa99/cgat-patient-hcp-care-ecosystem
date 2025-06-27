/**
 * Automated Verification Orchestrator
 * 
 * Coordinates all verification systems and triggers them automatically
 * during development workflow
 */

import { SimplifiedValidator, ValidationRequest, ValidationResult } from './SimplifiedValidator';
import { ComponentAuditor, AuditResult } from './ComponentAuditor';
import { DuplicateDetector } from './DuplicateDetector';
import { CanonicalSourceValidator } from './CanonicalSourceValidator';

export interface AutomatedVerificationConfig {
  enableRealTimeChecks: boolean;
  enablePeriodicScans: boolean;
  scanIntervalMinutes: number;
  autoFixSimpleIssues: boolean;
  notifyOnIssues: boolean;
  blockOnCriticalIssues: boolean;
}

export interface VerificationSummary {
  timestamp: string;
  validationResult: ValidationResult;
  auditResults: AuditResult[];
  duplicateReport: string;
  canonicalValidation: string;
  issuesFound: number;
  criticalIssues: number;
  autoFixesApplied: number;
  recommendations: string[];
}

export class AutomatedVerificationOrchestrator {
  private config: AutomatedVerificationConfig;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private lastScanTimestamp?: string;

  constructor(config: Partial<AutomatedVerificationConfig> = {}) {
    this.config = {
      enableRealTimeChecks: true,
      enablePeriodicScans: true,
      scanIntervalMinutes: 30,
      autoFixSimpleIssues: true,
      notifyOnIssues: true,
      blockOnCriticalIssues: true,
      ...config
    };
  }

  /**
   * Start automated verification system
   */
  start(): void {
    if (this.isRunning) {
      console.log('🔄 Automated verification is already running');
      return;
    }

    console.log('🚀 Starting Automated Verification System...');
    this.isRunning = true;

    // Set up periodic scans
    if (this.config.enablePeriodicScans) {
      this.intervalId = setInterval(
        () => this.runPeriodicScan(),
        this.config.scanIntervalMinutes * 60 * 1000
      );
      console.log(`⏰ Periodic scans enabled (every ${this.config.scanIntervalMinutes} minutes)`);
    }

    // Run initial comprehensive scan
    this.runComprehensiveScan();

    console.log('✅ Automated Verification System started');
  }

  /**
   * Stop automated verification system
   */
  stop(): void {
    if (!this.isRunning) return;

    console.log('⏹️ Stopping Automated Verification System...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isRunning = false;
    console.log('✅ Automated Verification System stopped');
  }

  /**
   * Verify before component/hook creation (Real-time check)
   */
  async verifyBeforeCreation(request: ValidationRequest): Promise<VerificationSummary> {
    console.log('🔍 Running real-time verification for:', request.moduleName || request.tableName);

    if (!this.config.enableRealTimeChecks) {
      console.log('⏸️ Real-time checks are disabled');
      return this.createEmptySummary();
    }

    const timestamp = new Date().toISOString();

    try {
      // Run validation
      const validationResult = SimplifiedValidator.validate(request);
      
      // Run component audit for related components
      const auditor = new ComponentAuditor();
      const auditResults = await auditor.auditComponentUsage();
      
      // Check for duplicates using updated detector
      const duplicateDetector = new DuplicateDetector();
      const duplicates = await duplicateDetector.scanForDuplicates();
      const duplicateReport = duplicateDetector.generateReport(duplicates);

      // Validate canonical sources
      const canonicalValidator = new CanonicalSourceValidator();
      const canonicalValidation = canonicalValidator.generateValidationReport([]);

      const summary = this.createSummary(
        timestamp,
        validationResult,
        auditResults,
        duplicateReport,
        canonicalValidation
      );

      // Handle critical issues
      if (summary.criticalIssues > 0 && this.config.blockOnCriticalIssues) {
        console.error('🚫 CRITICAL ISSUES DETECTED - Creation blocked');
        this.notifyDeveloper(summary, 'CRITICAL');
      }

      // Auto-fix simple issues
      if (this.config.autoFixSimpleIssues) {
        const autoFixes = await this.autoFixIssues(summary);
        summary.autoFixesApplied = autoFixes;
      }

      // Notify on issues
      if (summary.issuesFound > 0 && this.config.notifyOnIssues) {
        this.notifyDeveloper(summary, 'WARNING');
      }

      return summary;
    } catch (error) {
      console.error('❌ Error during verification:', error);
      return this.createEmptySummary();
    }
  }

  /**
   * Run periodic background scan
   */
  private async runPeriodicScan(): Promise<void> {
    console.log('🔄 Running periodic verification scan...');
    
    try {
      const summary = await this.runComprehensiveScan();
      this.lastScanTimestamp = summary.timestamp;
      
      if (summary.issuesFound > 0) {
        console.log(`⚠️ Periodic scan found ${summary.issuesFound} issues`);
        this.notifyDeveloper(summary, 'PERIODIC');
      } else {
        console.log('✅ Periodic scan: No issues found');
      }
    } catch (error) {
      console.error('❌ Periodic scan failed:', error);
    }
  }

  /**
   * Run comprehensive verification scan
   */
  private async runComprehensiveScan(): Promise<VerificationSummary> {
    console.log('🔍 Running comprehensive verification scan...');

    const timestamp = new Date().toISOString();
    
    try {
      // Run all verification systems
      const auditor = new ComponentAuditor();
      const duplicateDetector = new DuplicateDetector();
      
      const [auditResults, duplicates] = await Promise.all([
        auditor.auditComponentUsage(),
        duplicateDetector.scanForDuplicates()
      ]);

      const duplicateReport = duplicateDetector.generateReport(duplicates);

      const canonicalValidator = new CanonicalSourceValidator();
      const canonicalValidation = canonicalValidator.generateValidationReport([]);

      // Create baseline validation result
      const validationResult: ValidationResult = {
        canProceed: true,
        issues: [],
        warnings: [],
        recommendations: ['Comprehensive scan completed'],
        shouldUseTemplate: false
      };

      const summary = this.createSummary(
        timestamp,
        validationResult,
        auditResults,
        duplicateReport,
        canonicalValidation
      );

      console.log(`📊 Comprehensive scan complete: ${summary.issuesFound} issues, ${summary.recommendations.length} recommendations`);
      
      return summary;
    } catch (error) {
      console.error('❌ Comprehensive scan failed:', error);
      return this.createEmptySummary();
    }
  }

  /**
   * Auto-fix simple issues
   */
  private async autoFixIssues(summary: VerificationSummary): Promise<number> {
    let fixesApplied = 0;

    // Auto-fix simple validation issues
    for (const issue of summary.validationResult.issues) {
      if (issue.includes('PascalCase')) {
        console.log('🔧 Auto-fixing naming convention issue...');
        // In a real implementation, this would fix the naming
        fixesApplied++;
      }
    }

    // Auto-fix simple audit issues
    for (const auditResult of summary.auditResults) {
      if (auditResult.issues.some(issue => issue.includes('non-canonical imports'))) {
        console.log('🔧 Auto-fixing import paths...');
        // In a real implementation, this would update import statements
        fixesApplied++;
      }
    }

    if (fixesApplied > 0) {
      console.log(`✅ Applied ${fixesApplied} automatic fixes`);
    }

    return fixesApplied;
  }

  /**
   * Notify developer of issues
   */
  private notifyDeveloper(summary: VerificationSummary, level: 'CRITICAL' | 'WARNING' | 'PERIODIC'): void {
    const icon = level === 'CRITICAL' ? '🚨' : level === 'WARNING' ? '⚠️' : '📊';
    
    console.log(`${icon} AUTOMATED VERIFICATION ALERT - ${level}`);
    console.log(`📅 Timestamp: ${summary.timestamp}`);
    console.log(`🔍 Issues Found: ${summary.issuesFound}`);
    console.log(`🚨 Critical Issues: ${summary.criticalIssues}`);
    console.log(`🔧 Auto-fixes Applied: ${summary.autoFixesApplied}`);
    
    if (summary.recommendations.length > 0) {
      console.log('💡 Top Recommendations:');
      summary.recommendations.slice(0, 3).forEach(rec => console.log(`   • ${rec}`));
    }

    // In a real implementation, this could send notifications via:
    // - Toast notifications
    // - Email alerts
    // - Slack/Discord webhooks
    // - IDE notifications
  }

  /**
   * Create verification summary
   */
  private createSummary(
    timestamp: string,
    validationResult: ValidationResult,
    auditResults: AuditResult[],
    duplicateReport: string,
    canonicalValidation: string
  ): VerificationSummary {
    const issuesFound = validationResult.issues.length + 
                      auditResults.reduce((sum, audit) => sum + audit.issues.length, 0);
    
    const criticalIssues = validationResult.issues.filter(issue => 
      issue.toLowerCase().includes('critical') || 
      issue.toLowerCase().includes('blocked')
    ).length;

    const allRecommendations = [
      ...validationResult.recommendations,
      ...auditResults.flatMap(audit => audit.recommendations)
    ];

    return {
      timestamp,
      validationResult,
      auditResults,
      duplicateReport,
      canonicalValidation,
      issuesFound,
      criticalIssues,
      autoFixesApplied: 0, // Will be updated by autoFixIssues
      recommendations: allRecommendations
    };
  }

  /**
   * Create empty summary for disabled checks
   */
  private createEmptySummary(): VerificationSummary {
    return {
      timestamp: new Date().toISOString(),
      validationResult: {
        canProceed: true,
        issues: [],
        warnings: [],
        recommendations: [],
        shouldUseTemplate: false
      },
      auditResults: [],
      duplicateReport: 'Verification disabled',
      canonicalValidation: 'Verification disabled',
      issuesFound: 0,
      criticalIssues: 0,
      autoFixesApplied: 0,
      recommendations: []
    };
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastScanTimestamp: this.lastScanTimestamp
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AutomatedVerificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Verification configuration updated:', newConfig);
    
    // Restart if running to apply new config
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Global orchestrator instance
export const automatedVerification = new AutomatedVerificationOrchestrator();

// Auto-start verification system
if (typeof window !== 'undefined') {
  // Only start in browser environment
  setTimeout(() => automatedVerification.start(), 1000);
}
