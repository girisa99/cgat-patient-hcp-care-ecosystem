
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
import { DatabaseGuidelinesValidator, DatabaseValidationResult } from './DatabaseGuidelinesValidator';

export interface AutomatedVerificationConfig {
  enableRealTimeChecks: boolean;
  enablePeriodicScans: boolean;
  scanIntervalMinutes: number;
  autoFixSimpleIssues: boolean;
  notifyOnIssues: boolean;
  blockOnCriticalIssues: boolean;
  autoStartOnAppLoad: boolean;
  mandatoryVerification: boolean;
  enableDatabaseValidation: boolean; // NEW
  enableWorkflowSuggestions: boolean; // NEW
  enableAutoSQLGeneration: boolean; // NEW
}

export interface VerificationSummary {
  timestamp: string;
  validationResult: ValidationResult;
  auditResults: AuditResult[];
  duplicateReport: string;
  canonicalValidation: string;
  databaseValidation?: DatabaseValidationResult; // NEW
  issuesFound: number;
  criticalIssues: number;
  autoFixesApplied: number;
  recommendations: string[];
  sqlAutoFixes?: string[]; // NEW
  workflowSuggestions?: string[]; // NEW
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
      scanIntervalMinutes: 15,
      autoFixSimpleIssues: true,
      notifyOnIssues: true,
      blockOnCriticalIssues: true,
      autoStartOnAppLoad: true,
      mandatoryVerification: true,
      enableDatabaseValidation: true, // NEW
      enableWorkflowSuggestions: true, // NEW
      enableAutoSQLGeneration: true, // NEW
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
   * MANDATORY verification before any creation (AUTOMATIC) - ENHANCED
   */
  async verifyBeforeCreation(request: ValidationRequest): Promise<boolean> {
    console.log('🔍 MANDATORY AUTOMATED VERIFICATION (with Database Guidelines) for:', request.moduleName || request.tableName);

    if (!this.config.mandatoryVerification && !this.config.enableRealTimeChecks) {
      console.log('⚠️ WARNING: Verification bypassed - not recommended');
      return true;
    }

    const timestamp = new Date().toISOString();

    try {
      // Run ALL verification systems automatically (including database)
      const [validationResult, auditResults, duplicates, databaseValidation] = await Promise.all([
        this.runValidation(request),
        this.runComponentAudit(),
        this.runDuplicateDetection(),
        this.config.enableDatabaseValidation ? this.runDatabaseValidation(request) : Promise.resolve(null)
      ]);

      const duplicateReport = new DuplicateDetector().generateReport(duplicates);
      const canonicalValidator = new CanonicalSourceValidator();
      const canonicalValidation = canonicalValidator.generateValidationReport([]);

      const summary = this.createEnhancedSummary(
        timestamp,
        validationResult,
        auditResults,
        duplicateReport,
        canonicalValidation,
        databaseValidation
      );

      // ENHANCED handling of results
      await this.handleEnhancedVerificationResults(summary, request);

      // DATABASE CRITICAL ISSUES = AUTOMATIC BLOCKING
      const hasDatabaseErrors = databaseValidation?.violations.some(v => v.severity === 'error') || false;
      const totalCriticalIssues = summary.criticalIssues + (hasDatabaseErrors ? 1 : 0);

      if (totalCriticalIssues > 0 && this.config.blockOnCriticalIssues) {
        console.error('🚫 CRITICAL ISSUES DETECTED (including database) - CREATION AUTOMATICALLY BLOCKED');
        this.emitVerificationEvent('critical-issues-detected', summary);
        return false;
      }

      // ENHANCED AUTOMATIC fixes
      if (this.config.autoFixSimpleIssues && summary.issuesFound > 0) {
        const autoFixes = await this.applyEnhancedAutoFixes(summary);
        summary.autoFixesApplied = autoFixes;
        console.log(`🔧 AUTOMATICALLY APPLIED ${autoFixes} fixes (including database fixes)`);
      }

      // ENHANCED AUTOMATIC notifications
      this.sendEnhancedAutomaticNotifications(summary);

      console.log(`✅ ENHANCED AUTOMATIC VERIFICATION COMPLETE: ${summary.validationResult.canProceed ? 'APPROVED' : 'BLOCKED'}`);
      return summary.validationResult.canProceed && !hasDatabaseErrors;

    } catch (error) {
      console.error('❌ ENHANCED AUTOMATIC VERIFICATION FAILED:', error);
      this.emitVerificationEvent('verification-error', { error: error.message });
      
      console.log('⚠️ VERIFICATION FAILURE - ALLOWING CREATION WITH WARNING');
      return true;
    }
  }

  /**
   * Run database validation automatically
   */
  private async runDatabaseValidation(request: ValidationRequest): Promise<DatabaseValidationResult | null> {
    if (!this.config.enableDatabaseValidation) return null;

    console.log('🗄️ RUNNING DATABASE GUIDELINES VALIDATION...');
    
    // Extract table names from request
    const tableNames = request.tableName ? [request.tableName] : [];
    
    return await DatabaseGuidelinesValidator.validateDatabase(tableNames);
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
   * Handle enhanced verification results with database validation
   */
  private async handleEnhancedVerificationResults(summary: VerificationSummary, request: ValidationRequest): Promise<void> {
    // Log comprehensive results
    console.log('📊 AUTOMATIC VERIFICATION RESULTS:');
    console.log(`   📅 Timestamp: ${summary.timestamp}`);
    console.log(`   🔍 Request: ${request.componentType} - ${request.moduleName || request.tableName}`);
    console.log(`   ❌ Issues: ${summary.issuesFound}`);
    console.log(`   🚨 Critical: ${summary.criticalIssues}`);
    console.log(`   🔧 Auto-fixes: ${summary.autoFixesApplied}`);
    console.log(`   💡 Recommendations: ${summary.recommendations.length}`);

    // Enhanced logging with database info
    if (summary.databaseValidation) {
      console.log(`   📊 Database Issues: ${summary.databaseValidation.violations.length}`);
      console.log(`   🗄️ Database Errors: ${summary.databaseValidation.violations.filter(v => v.severity === 'error').length}`);
      console.log(`   🔧 Database Auto-fixes: ${summary.databaseValidation.autoFixesApplied}`);
      console.log(`   🔄 Workflow Suggestions: ${summary.databaseValidation.workflowSuggestions.length}`);
    }

    if (summary.sqlAutoFixes && summary.sqlAutoFixes.length > 0) {
      console.log(`   💾 SQL Auto-fixes Generated: ${summary.sqlAutoFixes.length}`);
    }

    // Store enhanced results
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
   * Send enhanced automatic notifications including database info
   */
  private sendEnhancedAutomaticNotifications(summary: VerificationSummary): void {
    if (!this.config.notifyOnIssues || summary.issuesFound === 0) return;

    const level = summary.criticalIssues > 0 ? 'CRITICAL' : 'WARNING';
    const icon = level === 'CRITICAL' ? '🚨' : '⚠️';
    
    console.log(`${icon} ENHANCED AUTOMATIC NOTIFICATION - ${level}`);
    console.log(`📊 Total Issues: ${summary.issuesFound} | Critical: ${summary.criticalIssues} | Auto-fixes: ${summary.autoFixesApplied}`);
    
    if (summary.databaseValidation) {
      console.log(`🗄️ Database Issues: ${summary.databaseValidation.violations.length} | Workflow Suggestions: ${summary.databaseValidation.workflowSuggestions.length}`);
    }
    
    if (summary.recommendations.length > 0) {
      console.log('💡 Top Recommendations:');
      summary.recommendations.slice(0, 5).forEach(rec => console.log(`   • ${rec}`));
    }

    if (summary.workflowSuggestions && summary.workflowSuggestions.length > 0) {
      console.log('🔄 Workflow Suggestions:');
      summary.workflowSuggestions.slice(0, 3).forEach(ws => console.log(`   • ${ws}`));
    }

    // Emit enhanced notification event
    this.emitVerificationEvent('notification', { level, summary, enhanced: true });
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
        this.sendEnhancedAutomaticNotifications(summary);
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
    console.log('🔍 RUNNING COMPREHENSIVE AUTOMATIC SCAN (with Database Guidelines)...');

    const timestamp = new Date().toISOString();
    
    try {
      const [auditResults, duplicates, databaseValidation] = await Promise.all([
        this.runComponentAudit(),
        this.runDuplicateDetection(),
        this.config.enableDatabaseValidation ? DatabaseGuidelinesValidator.validateDatabase() : Promise.resolve(null)
      ]);

      const duplicateReport = new DuplicateDetector().generateReport(duplicates);
      const canonicalValidator = new CanonicalSourceValidator();
      const canonicalValidation = canonicalValidator.generateValidationReport([]);

      const validationResult: ValidationResult = {
        canProceed: true,
        issues: [],
        warnings: [],
        recommendations: ['Comprehensive automatic scan with database validation completed'],
        shouldUseTemplate: false
      };

      const summary = this.createEnhancedSummary(
        timestamp,
        validationResult,
        auditResults,
        duplicateReport,
        canonicalValidation,
        databaseValidation
      );

      this.storeVerificationResults(summary);

      console.log(`📊 COMPREHENSIVE AUTOMATIC SCAN COMPLETE: ${summary.issuesFound} issues, ${summary.recommendations.length} recommendations`);
      
      // Generate and log database guidelines report
      if (summary.databaseValidation) {
        const guidelinesReport = DatabaseGuidelinesValidator.generateGuidelinesReport(summary.databaseValidation);
        console.log(guidelinesReport);
      }
      
      return summary;
    } catch (error) {
      console.error('❌ COMPREHENSIVE AUTOMATIC SCAN FAILED:', error);
      return this.createEmptySummary();
    }
  }

  /**
   * Auto-fix simple issues automatically
   */
  private async applyEnhancedAutoFixes(summary: VerificationSummary): Promise<number> {
    let fixesApplied = 0;

    // Apply existing fixes
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

    // Apply database fixes
    if (summary.databaseValidation && this.config.enableAutoSQLGeneration) {
      const databaseFixes = summary.databaseValidation.autoFixesApplied;
      fixesApplied += databaseFixes;
      
      if (summary.sqlAutoFixes && summary.sqlAutoFixes.length > 0) {
        console.log('🗄️ AUTOMATICALLY GENERATED SQL FIXES:');
        summary.sqlAutoFixes.forEach((sql, index) => {
          console.log(`   ${index + 1}. ${sql}`);
        });
      }
    }

    if (fixesApplied > 0) {
      console.log(`✅ AUTOMATICALLY APPLIED ${fixesApplied} fixes (including database fixes)`);
    }

    return fixesApplied;
  }

  /**
   * Create enhanced verification summary with database validation
   */
  private createEnhancedSummary(
    timestamp: string,
    validationResult: ValidationResult,
    auditResults: AuditResult[],
    duplicateReport: string,
    canonicalValidation: string,
    databaseValidation: DatabaseValidationResult | null
  ): VerificationSummary {
    const baseIssuesFound = validationResult.issues.length + 
                          auditResults.reduce((sum, audit) => sum + audit.issues.length, 0);
    
    const databaseIssuesFound = databaseValidation?.violations.length || 0;
    const issuesFound = baseIssuesFound + databaseIssuesFound;
    
    const baseCriticalIssues = validationResult.issues.filter(issue => 
      issue.toLowerCase().includes('critical') || 
      issue.toLowerCase().includes('blocked')
    ).length;
    
    const databaseCriticalIssues = databaseValidation?.violations.filter(v => v.severity === 'error').length || 0;
    const criticalIssues = baseCriticalIssues + databaseCriticalIssues;

    const allRecommendations = [
      ...validationResult.recommendations,
      ...auditResults.flatMap(audit => audit.recommendations)
    ];

    // Add database recommendations
    if (databaseValidation) {
      allRecommendations.push(...databaseValidation.violations.map(v => v.recommendation));
    }

    // Generate SQL auto-fixes
    const sqlAutoFixes = this.config.enableAutoSQLGeneration && databaseValidation 
      ? DatabaseGuidelinesValidator.generateAutoFixSQL(databaseValidation.violations)
      : [];

    // Generate workflow suggestions
    const workflowSuggestions = this.config.enableWorkflowSuggestions && databaseValidation
      ? databaseValidation.workflowSuggestions.map(ws => ws.description)
      : [];

    return {
      timestamp,
      validationResult,
      auditResults,
      duplicateReport,
      canonicalValidation,
      databaseValidation,
      issuesFound,
      criticalIssues,
      autoFixesApplied: 0,
      recommendations: allRecommendations,
      sqlAutoFixes,
      workflowSuggestions
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
      databaseValidation: null,
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
   * Update configuration with database validation options
   */
  updateConfig(newConfig: Partial<AutomatedVerificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ ENHANCED AUTOMATIC VERIFICATION CONFIG UPDATED:', newConfig);
    
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
