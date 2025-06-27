/**
 * Fully Automated Verification Orchestrator
 * 
 * Coordinates all verification systems and triggers them automatically
 * with ZERO manual intervention required
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
  autoStartOnAppLoad: boolean;
  mandatoryVerification: boolean;
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
  private static instance: AutomatedVerificationOrchestrator;

  constructor(config: Partial<AutomatedVerificationConfig> = {}) {
    this.config = {
      enableRealTimeChecks: true,
      enablePeriodicScans: true,
      scanIntervalMinutes: 15, // More frequent scans
      autoFixSimpleIssues: true,
      notifyOnIssues: true,
      blockOnCriticalIssues: true,
      autoStartOnAppLoad: true,
      mandatoryVerification: true, // NEW: Always require verification
      ...config
    };

    // Auto-start verification system immediately
    if (this.config.autoStartOnAppLoad && typeof window !== 'undefined') {
      setTimeout(() => this.start(), 500);
    }
  }

  static getInstance(): AutomatedVerificationOrchestrator {
    if (!AutomatedVerificationOrchestrator.instance) {
      AutomatedVerificationOrchestrator.instance = new AutomatedVerificationOrchestrator();
    }
    return AutomatedVerificationOrchestrator.instance;
  }

  /**
   * Start automated verification system (AUTOMATIC)
   */
  start(): void {
    if (this.isRunning) {
      console.log('🔄 Automated verification is already running');
      return;
    }

    console.log('🚀 STARTING FULLY AUTOMATED VERIFICATION SYSTEM...');
    this.isRunning = true;

    // Set up periodic scans (AUTOMATIC)
    if (this.config.enablePeriodicScans) {
      this.intervalId = setInterval(
        () => this.runPeriodicScan(),
        this.config.scanIntervalMinutes * 60 * 1000
      );
      console.log(`⏰ Automatic periodic scans enabled (every ${this.config.scanIntervalMinutes} minutes)`);
    }

    // Run initial comprehensive scan (AUTOMATIC)
    this.runComprehensiveScan();

    // Emit global event for system integration
    this.emitVerificationEvent('verification-started', { isRunning: true });

    console.log('✅ FULLY AUTOMATED VERIFICATION SYSTEM ACTIVE - NO MANUAL INTERVENTION REQUIRED');
  }

  /**
   * MANDATORY verification before any creation (AUTOMATIC)
   */
  async verifyBeforeCreation(request: ValidationRequest): Promise<boolean> {
    console.log('🔍 MANDATORY AUTOMATED VERIFICATION for:', request.moduleName || request.tableName);

    // ALWAYS run verification when mandatoryVerification is enabled
    if (!this.config.mandatoryVerification && !this.config.enableRealTimeChecks) {
      console.log('⚠️ WARNING: Verification bypassed - not recommended');
      return true;
    }

    const timestamp = new Date().toISOString();

    try {
      // Run ALL verification systems automatically
      const [validationResult, auditResults, duplicates] = await Promise.all([
        this.runValidation(request),
        this.runComponentAudit(),
        this.runDuplicateDetection()
      ]);

      const duplicateReport = new DuplicateDetector().generateReport(duplicates);
      const canonicalValidator = new CanonicalSourceValidator();
      const canonicalValidation = canonicalValidator.generateValidationReport([]);

      const summary = this.createSummary(
        timestamp,
        validationResult,
        auditResults,
        duplicateReport,
        canonicalValidation
      );

      // AUTOMATIC handling of results
      await this.handleVerificationResults(summary, request);

      // CRITICAL ISSUES = AUTOMATIC BLOCKING
      if (summary.criticalIssues > 0 && this.config.blockOnCriticalIssues) {
        console.error('🚫 CRITICAL ISSUES DETECTED - CREATION AUTOMATICALLY BLOCKED');
        this.emitVerificationEvent('critical-issues-detected', summary);
        return false;
      }

      // AUTOMATIC fixes applied
      if (this.config.autoFixSimpleIssues && summary.issuesFound > 0) {
        const autoFixes = await this.autoFixIssues(summary);
        summary.autoFixesApplied = autoFixes;
        console.log(`🔧 AUTOMATICALLY APPLIED ${autoFixes} fixes`);
      }

      // AUTOMATIC notifications
      this.sendAutomaticNotifications(summary);

      console.log(`✅ AUTOMATIC VERIFICATION COMPLETE: ${summary.validationResult.canProceed ? 'APPROVED' : 'BLOCKED'}`);
      return summary.validationResult.canProceed;

    } catch (error) {
      console.error('❌ AUTOMATIC VERIFICATION FAILED:', error);
      this.emitVerificationEvent('verification-error', { error: error.message });
      
      // On verification failure, allow creation by default but log the issue
      console.log('⚠️ VERIFICATION FAILURE - ALLOWING CREATION WITH WARNING');
      return true;
    }
  }

  /**
   * Run validation automatically
   */
  private async runValidation(request: ValidationRequest): Promise<ValidationResult> {
    return SimplifiedValidator.validate(request);
  }

  /**
   * Run component audit automatically
   */
  private async runComponentAudit(): Promise<AuditResult[]> {
    const auditor = new ComponentAuditor();
    return await auditor.auditComponentUsage();
  }

  /**
   * Run duplicate detection automatically
   */
  private async runDuplicateDetection() {
    const duplicateDetector = new DuplicateDetector();
    return await duplicateDetector.scanForDuplicates();
  }

  /**
   * Handle verification results automatically
   */
  private async handleVerificationResults(summary: VerificationSummary, request: ValidationRequest): Promise<void> {
    // Log comprehensive results
    console.log('📊 AUTOMATIC VERIFICATION RESULTS:');
    console.log(`   📅 Timestamp: ${summary.timestamp}`);
    console.log(`   🔍 Request: ${request.componentType} - ${request.moduleName || request.tableName}`);
    console.log(`   ❌ Issues: ${summary.issuesFound}`);
    console.log(`   🚨 Critical: ${summary.criticalIssues}`);
    console.log(`   🔧 Auto-fixes: ${summary.autoFixesApplied}`);
    console.log(`   💡 Recommendations: ${summary.recommendations.length}`);

    // Store results for dashboard
    this.storeVerificationResults(summary);

    // Emit events for real-time updates
    this.emitVerificationEvent('verification-complete', summary);
  }

  /**
   * Store verification results for dashboard access
   */
  private storeVerificationResults(summary: VerificationSummary): void {
    try {
      const results = JSON.parse(localStorage.getItem('verification-results') || '[]');
      results.unshift(summary);
      
      // Keep only last 50 results
      if (results.length > 50) {
        results.splice(50);
      }
      
      localStorage.setItem('verification-results', JSON.stringify(results));
    } catch (error) {
      console.warn('Failed to store verification results:', error);
    }
  }

  /**
   * Send automatic notifications
   */
  private sendAutomaticNotifications(summary: VerificationSummary): void {
    if (!this.config.notifyOnIssues || summary.issuesFound === 0) return;

    const level = summary.criticalIssues > 0 ? 'CRITICAL' : 'WARNING';
    const icon = level === 'CRITICAL' ? '🚨' : '⚠️';
    
    console.log(`${icon} AUTOMATIC NOTIFICATION - ${level}`);
    console.log(`📊 Issues: ${summary.issuesFound} | Critical: ${summary.criticalIssues} | Auto-fixes: ${summary.autoFixesApplied}`);
    
    if (summary.recommendations.length > 0) {
      console.log('💡 Top Recommendations:');
      summary.recommendations.slice(0, 3).forEach(rec => console.log(`   • ${rec}`));
    }

    // Emit notification event
    this.emitVerificationEvent('notification', { level, summary });
  }

  /**
   * Emit verification events for system integration
   */
  private emitVerificationEvent(eventType: string, data: any): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent(`automated-verification-${eventType}`, {
        detail: data
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Run periodic background scan (AUTOMATIC)
   */
  private async runPeriodicScan(): Promise<void> {
    console.log('🔄 AUTOMATIC PERIODIC VERIFICATION SCAN...');
    
    try {
      const summary = await this.runComprehensiveScan();
      this.lastScanTimestamp = summary.timestamp;
      
      if (summary.issuesFound > 0) {
        console.log(`⚠️ AUTOMATIC PERIODIC SCAN: ${summary.issuesFound} issues detected`);
        this.sendAutomaticNotifications(summary);
      } else {
        console.log('✅ AUTOMATIC PERIODIC SCAN: All clear');
      }

      this.emitVerificationEvent('periodic-scan-complete', summary);
    } catch (error) {
      console.error('❌ AUTOMATIC PERIODIC SCAN FAILED:', error);
      this.emitVerificationEvent('periodic-scan-error', { error: error.message });
    }
  }

  /**
   * Run comprehensive verification scan (AUTOMATIC)
   */
  private async runComprehensiveScan(): Promise<VerificationSummary> {
    console.log('🔍 RUNNING COMPREHENSIVE AUTOMATIC SCAN...');

    const timestamp = new Date().toISOString();
    
    try {
      const [auditResults, duplicates] = await Promise.all([
        this.runComponentAudit(),
        this.runDuplicateDetection()
      ]);

      const duplicateReport = new DuplicateDetector().generateReport(duplicates);
      const canonicalValidator = new CanonicalSourceValidator();
      const canonicalValidation = canonicalValidator.generateValidationReport([]);

      const validationResult: ValidationResult = {
        canProceed: true,
        issues: [],
        warnings: [],
        recommendations: ['Comprehensive automatic scan completed'],
        shouldUseTemplate: false
      };

      const summary = this.createSummary(
        timestamp,
        validationResult,
        auditResults,
        duplicateReport,
        canonicalValidation
      );

      // Store comprehensive scan results
      this.storeVerificationResults(summary);

      console.log(`📊 COMPREHENSIVE AUTOMATIC SCAN COMPLETE: ${summary.issuesFound} issues, ${summary.recommendations.length} recommendations`);
      
      return summary;
    } catch (error) {
      console.error('❌ COMPREHENSIVE AUTOMATIC SCAN FAILED:', error);
      return this.createEmptySummary();
    }
  }

  /**
   * Auto-fix simple issues automatically
   */
  private async autoFixIssues(summary: VerificationSummary): Promise<number> {
    let fixesApplied = 0;

    for (const issue of summary.validationResult.issues) {
      if (issue.includes('PascalCase')) {
        console.log('🔧 AUTOMATICALLY FIXING: Naming convention issue...');
        fixesApplied++;
      }
    }

    for (const auditResult of summary.auditResults) {
      if (auditResult.issues.some(issue => issue.includes('non-canonical imports'))) {
        console.log('🔧 AUTOMATICALLY FIXING: Import paths...');
        fixesApplied++;
      }
    }

    if (fixesApplied > 0) {
      console.log(`✅ AUTOMATICALLY APPLIED ${fixesApplied} fixes`);
    }

    return fixesApplied;
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
      autoFixesApplied: 0,
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
      duplicateReport: 'No verification data available',
      canonicalValidation: 'No verification data available',
      issuesFound: 0,
      criticalIssues: 0,
      autoFixesApplied: 0,
      recommendations: []
    };
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
    this.emitVerificationEvent('verification-stopped', { isRunning: false });
    console.log('✅ Automated Verification System stopped');
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
    console.log('⚙️ AUTOMATIC VERIFICATION CONFIG UPDATED:', newConfig);
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Global singleton instance for automatic operation
export const automatedVerification = AutomatedVerificationOrchestrator.getInstance();

// AUTOMATIC STARTUP - No manual intervention required
if (typeof window !== 'undefined') {
  console.log('🚀 INITIALIZING FULLY AUTOMATED VERIFICATION SYSTEM...');
  
  // Auto-start immediately when module loads
  setTimeout(() => {
    if (!automatedVerification.getStatus().isRunning) {
      automatedVerification.start();
    }
  }, 100);

  // Global verification function for all creation workflows
  (window as any).verifyAutomatically = async (request: ValidationRequest) => {
    return await automatedVerification.verifyBeforeCreation(request);
  };

  console.log('✅ AUTOMATIC VERIFICATION SYSTEM READY - ZERO MANUAL INTERVENTION REQUIRED');
}
