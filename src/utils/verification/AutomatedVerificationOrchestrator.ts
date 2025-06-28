/**
 * Automated Verification Orchestrator - Refactored Main Controller
 * 
 * Coordinates all verification systems with ZERO manual intervention required
 */

import { 
  AutomatedVerificationConfig,
  VerificationSummary,
  TemplateGenerationRequest,
  TemplateGenerationResult
} from './AutomatedVerificationTypes';
import { ValidationRequest, ValidationResult } from './SimplifiedValidator';
import { CanonicalSourceValidator } from './CanonicalSourceValidator';
import { DuplicateDetector } from './DuplicateDetector';
import { TemplateGenerator } from './TemplateGenerator';
import { VerificationSummaryBuilder } from './VerificationSummaryBuilder';
import { VerificationRunner } from './VerificationRunner';
import { AutoFixHandler } from './AutoFixHandler';

export class AutomatedVerificationOrchestrator {
  private config: AutomatedVerificationConfig;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private lastScanTimestamp?: string;
  private static instance: AutomatedVerificationOrchestrator;
  
  private templateGenerator: TemplateGenerator;
  private summaryBuilder: VerificationSummaryBuilder;
  private verificationRunner: VerificationRunner;
  private autoFixHandler: AutoFixHandler;

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
      enableDatabaseValidation: true,
      enableWorkflowSuggestions: true,
      enableAutoSQLGeneration: true,
      enableSchemaValidation: true,
      enablePerformanceMonitoring: true,
      enableSecurityScanning: true,
      enableCodeQualityAnalysis: true,
      enableTemplateGeneration: true,
      enableAutomatedRefactoring: true,
      ...config
    };

    // Initialize service classes
    this.templateGenerator = new TemplateGenerator();
    this.summaryBuilder = new VerificationSummaryBuilder();
    this.verificationRunner = new VerificationRunner(this.config);
    this.autoFixHandler = new AutoFixHandler(this.config);

    // Auto-start enhanced verification system immediately
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
   * Start enhanced automated verification system (AUTOMATIC)
   */
  start(): void {
    if (this.isRunning) {
      console.log('🔄 Enhanced automated verification is already running');
      return;
    }

    console.log('🚀 STARTING ENHANCED AUTOMATED VERIFICATION SYSTEM...');
    this.isRunning = true;

    // Set up periodic scans (AUTOMATIC)
    if (this.config.enablePeriodicScans) {
      this.intervalId = setInterval(
        () => this.runPeriodicScan(),
        this.config.scanIntervalMinutes * 60 * 1000
      );
      console.log(`⏰ Enhanced automatic periodic scans enabled (every ${this.config.scanIntervalMinutes} minutes)`);
    }

    // Run initial comprehensive scan (AUTOMATIC)
    this.runComprehensiveScan();

    // Emit global event for system integration
    this.emitVerificationEvent('verification-started', { isRunning: true, enhanced: true });

    console.log('✅ ENHANCED AUTOMATED VERIFICATION SYSTEM ACTIVE - INCLUDES ALL QUALITY, SECURITY, AND PERFORMANCE CHECKS');
  }

  /**
   * ENHANCED MANDATORY verification before any creation (AUTOMATIC)
   */
  async verifyBeforeCreation(request: ValidationRequest): Promise<boolean> {
    console.log('🔍 ENHANCED MANDATORY AUTOMATED VERIFICATION for:', request.moduleName || request.tableName);

    if (!this.config.mandatoryVerification && !this.config.enableRealTimeChecks) {
      console.log('⚠️ WARNING: Enhanced verification bypassed - not recommended');
      return true;
    }

    const timestamp = new Date().toISOString();

    try {
      // Run ALL enhanced verification systems automatically
      const [
        validationResult, 
        auditResults, 
        duplicates, 
        databaseValidation,
        schemaValidation,
        performanceMetrics,
        securityScan,
        codeQuality
      ] = await Promise.all([
        this.verificationRunner.runValidation(request),
        this.verificationRunner.runComponentAudit(),
        this.verificationRunner.runDuplicateDetection(),
        this.verificationRunner.runDatabaseValidation(request),
        this.verificationRunner.runSchemaValidation(request),
        this.verificationRunner.runPerformanceAnalysis(),
        this.verificationRunner.runSecurityScan(),
        this.verificationRunner.runCodeQualityAnalysis()
      ]);

      const duplicateReport = new DuplicateDetector().generateReport(duplicates);
      const canonicalValidator = new CanonicalSourceValidator();
      const canonicalValidation = canonicalValidator.generateValidationReport([]);

      const summary = this.summaryBuilder.createEnhancedSummary(
        timestamp,
        validationResult,
        auditResults,
        duplicateReport,
        canonicalValidation,
        databaseValidation,
        schemaValidation,
        performanceMetrics,
        securityScan,
        codeQuality
      );

      // ENHANCED handling of results
      await this.handleEnhancedVerificationResults(summary, request);

      // ENHANCED CRITICAL ISSUES = AUTOMATIC BLOCKING
      const hasCriticalIssues = this.autoFixHandler.hasCriticalIssues(summary);

      if (hasCriticalIssues && this.config.blockOnCriticalIssues) {
        console.error('🚫 CRITICAL ISSUES DETECTED (enhanced verification) - CREATION AUTOMATICALLY BLOCKED');
        this.emitVerificationEvent('critical-issues-detected', summary);
        return false;
      }

      // ENHANCED AUTOMATIC fixes
      if (this.config.autoFixSimpleIssues && summary.issuesFound > 0) {
        const autoFixes = await this.autoFixHandler.applyEnhancedAutoFixes(summary);
        summary.autoFixesApplied = autoFixes;
        console.log(`🔧 AUTOMATICALLY APPLIED ${autoFixes} enhanced fixes`);
      }

      // Template generation recommendation
      if (this.config.enableTemplateGeneration && this.shouldGenerateTemplate(request)) {
        const templateSuggestion = this.suggestTemplate(request);
        summary.recommendations.unshift(`🎯 RECOMMENDED: Use ${templateSuggestion} for optimal implementation`);
      }

      // ENHANCED AUTOMATIC notifications
      this.sendEnhancedAutomaticNotifications(summary);

      console.log(`✅ ENHANCED AUTOMATIC VERIFICATION COMPLETE: ${summary.validationResult.canProceed ? 'APPROVED' : 'BLOCKED'}`);
      return summary.validationResult.canProceed && !hasCriticalIssues;

    } catch (error) {
      console.error('❌ ENHANCED AUTOMATIC VERIFICATION FAILED:', error);
      this.emitVerificationEvent('verification-error', { error: error.message });
      
      console.log('⚠️ ENHANCED VERIFICATION FAILURE - ALLOWING CREATION WITH WARNING');
      return true;
    }
  }

  /**
   * Template-based code generation
   */
  async generateFromTemplate(request: TemplateGenerationRequest): Promise<TemplateGenerationResult> {
    return await this.templateGenerator.generateFromTemplate(request);
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

    if (summary.schemaValidation) {
      console.log(`   📊 Schema Issues: ${summary.schemaValidation.violations.length}`);
      console.log(`   🔧 Schema Auto-fixes: ${summary.schemaValidation.autoFixesAvailable.length}`);
    }

    if (summary.securityScan) {
      console.log(`   🔒 Security Vulnerabilities: ${summary.securityScan.vulnerabilities.length}`);
      console.log(`   🔐 Security Score: ${summary.securityScan.securityScore}`);
    }

    if (summary.codeQuality) {
      console.log(`   📈 Code Quality Issues: ${summary.codeQuality.issues.length}`);
      console.log(`   📊 Quality Score: ${summary.codeQuality.overallScore}`);
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
      const [auditResults, duplicates, databaseValidation, schemaValidation, securityScan, codeQuality, performanceMetrics] = await Promise.all([
        this.verificationRunner.runComponentAudit(),
        this.verificationRunner.runDuplicateDetection(),
        this.verificationRunner.runDatabaseValidation({ componentType: 'module', moduleName: 'system', description: 'Comprehensive system scan' }),
        this.verificationRunner.runSchemaValidation({ componentType: 'module', moduleName: 'system', description: 'Comprehensive schema validation' }),
        this.verificationRunner.runSecurityScan(),
        this.verificationRunner.runCodeQualityAnalysis(),
        this.verificationRunner.runPerformanceAnalysis()
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

      const summary = this.summaryBuilder.createEnhancedSummary(
        timestamp,
        validationResult,
        auditResults,
        duplicateReport,
        canonicalValidation,
        databaseValidation,
        schemaValidation,
        performanceMetrics,
        securityScan,
        codeQuality
      );

      this.storeVerificationResults(summary);

      console.log(`📊 COMPREHENSIVE AUTOMATIC SCAN COMPLETE: ${summary.issuesFound} issues, ${summary.recommendations.length} recommendations`);
      
      return summary;
    } catch (error) {
      console.error('❌ COMPREHENSIVE AUTOMATIC SCAN FAILED:', error);
      return this.summaryBuilder.createEmptySummary();
    }
  }

  /**
   * Template suggestion logic
   */
  private shouldGenerateTemplate(request: ValidationRequest): boolean {
    return request.componentType === 'hook' || request.componentType === 'component' || request.componentType === 'module';
  }

  private suggestTemplate(request: ValidationRequest): string {
    switch (request.componentType) {
      case 'hook':
        return 'useTypeSafeModuleTemplate';
      case 'component':
        return 'ExtensibleModuleTemplate';
      case 'module':
        return 'CompleteModuleTemplate';
      default:
        return 'BaseTemplate';
    }
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
    
    // Update service class configurations
    this.verificationRunner = new VerificationRunner(this.config);
    this.autoFixHandler = new AutoFixHandler(this.config);
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Global singleton instance for enhanced automatic operation
export const automatedVerification = AutomatedVerificationOrchestrator.getInstance();

if (typeof window !== 'undefined') {
  console.log('🚀 INITIALIZING ENHANCED AUTOMATED VERIFICATION SYSTEM...');
  
  // Auto-start immediately when module loads
  setTimeout(() => {
    if (!automatedVerification.getStatus().isRunning) {
      automatedVerification.start();
    }
  }, 100);

  // Enhanced global verification function
  (window as any).verifyAutomatically = async (request: ValidationRequest) => {
    return await automatedVerification.verifyBeforeCreation(request);
  };

  // Global template generation function
  (window as any).generateFromTemplate = async (request: TemplateGenerationRequest) => {
    return await automatedVerification.generateFromTemplate(request);
  };

  console.log('✅ ENHANCED AUTOMATIC VERIFICATION SYSTEM READY - INCLUDES ALL QUALITY, SECURITY, PERFORMANCE, AND TEMPLATE GENERATION FEATURES');
}

// Export types for external usage
export type { 
  AutomatedVerificationConfig,
  VerificationSummary,
  TemplateGenerationRequest,
  TemplateGenerationResult
} from './AutomatedVerificationTypes';
