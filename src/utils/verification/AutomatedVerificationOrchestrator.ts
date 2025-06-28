/**
 * Automated Verification Orchestrator - Backend Protection System
 * 
 * Coordinates all verification systems with continuous backend protection
 * Results are kept separate from display interface
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
      notifyOnIssues: false, // Disable notifications to prevent display interference
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

    // Auto-start backend protection system immediately
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
   * Start backend protection system (continues independently of display)
   */
  start(): void {
    if (this.isRunning) {
      console.log('🛡️ Backend verification protection already active');
      return;
    }

    console.log('🚀 STARTING BACKEND VERIFICATION PROTECTION SYSTEM...');
    this.isRunning = true;

    // Set up periodic scans for system protection (separate from display)
    if (this.config.enablePeriodicScans) {
      this.intervalId = setInterval(
        () => this.runBackgroundProtectionScan(),
        this.config.scanIntervalMinutes * 60 * 1000
      );
      console.log(`⏰ Backend protection scans active (every ${this.config.scanIntervalMinutes} minutes) - display interface separate`);
    }

    // Run initial protection scan
    this.runBackgroundProtectionScan();

    // Emit system protection event (not display event)
    this.emitBackendProtectionEvent('backend-protection-started', { isRunning: true, displaySeparate: true });

    console.log('✅ BACKEND VERIFICATION PROTECTION ACTIVE - DISPLAY INTERFACE OPERATES INDEPENDENTLY');
  }

  /**
   * Backend verification for system protection (separate from display)
   */
  async verifyBeforeCreation(request: ValidationRequest): Promise<boolean> {
    // Check if this is a display-only request
    const isDisplayRequest = request.description?.includes('display') || request.description?.includes('manual');
    
    if (isDisplayRequest) {
      console.log('🖥️ Processing display verification request...');
    } else {
      console.log('🛡️ Processing backend protection verification...');
    }

    if (!this.config.mandatoryVerification && !this.config.enableRealTimeChecks) {
      console.log('⚠️ WARNING: Backend protection bypassed - not recommended');
      return true;
    }

    const timestamp = new Date().toISOString();

    try {
      // Run all verification systems
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

      // Handle results based on request type
      if (isDisplayRequest) {
        await this.handleDisplayVerificationResults(summary, request);
      } else {
        await this.handleBackendProtectionResults(summary, request);
      }

      // Critical issues handling for system protection
      const hasCriticalIssues = this.autoFixHandler.hasCriticalIssues(summary);

      if (hasCriticalIssues && this.config.blockOnCriticalIssues) {
        console.error('🚫 CRITICAL ISSUES DETECTED (backend protection) - CREATION BLOCKED');
        if (!isDisplayRequest) {
          this.emitBackendProtectionEvent('critical-issues-detected', summary);
        }
        return false;
      }

      // Auto-fixes for system protection
      if (this.config.autoFixSimpleIssues && summary.issuesFound > 0 && !isDisplayRequest) {
        const autoFixes = await this.autoFixHandler.applyEnhancedAutoFixes(summary);
        summary.autoFixesApplied = autoFixes;
        console.log(`🔧 BACKEND PROTECTION: Applied ${autoFixes} automatic fixes`);
      }

      // Template generation for display requests
      if (this.config.enableTemplateGeneration && this.shouldGenerateTemplate(request) && isDisplayRequest) {
        const templateSuggestion = this.suggestTemplate(request);
        summary.recommendations.unshift(`🎯 RECOMMENDED: Use ${templateSuggestion} for optimal implementation`);
      }

      const logPrefix = isDisplayRequest ? '🖥️ DISPLAY VERIFICATION' : '🛡️ BACKEND PROTECTION';
      console.log(`✅ ${logPrefix} COMPLETE: ${summary.validationResult.canProceed ? 'APPROVED' : 'BLOCKED'}`);
      
      return summary.validationResult.canProceed && !hasCriticalIssues;

    } catch (error) {
      console.error('❌ Verification failed:', error);
      const eventType = isDisplayRequest ? 'display-verification-error' : 'backend-protection-error';
      this.emitBackendProtectionEvent(eventType, { error: error.message });
      
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
   * Handle display verification results (for admin page)
   */
  private async handleDisplayVerificationResults(summary: VerificationSummary, request: ValidationRequest): Promise<void> {
    console.log('🖥️ DISPLAY VERIFICATION RESULTS:');
    console.log(`   📅 Timestamp: ${summary.timestamp}`);
    console.log(`   🔍 Request: ${request.componentType} - ${request.moduleName || request.tableName}`);
    console.log(`   ❌ Issues: ${summary.issuesFound}`);
    console.log(`   🚨 Critical: ${summary.criticalIssues}`);

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

    // Store results for display interface
    this.storeVerificationResults(summary);
    this.emitVerificationEvent('verification-complete', summary);
  }

  /**
   * Handle backend protection results (separate from display)
   */
  private async handleBackendProtectionResults(summary: VerificationSummary, request: ValidationRequest): Promise<void> {
    console.log('🛡️ BACKEND PROTECTION RESULTS:');
    console.log(`   📅 Timestamp: ${summary.timestamp}`);
    console.log(`   🔍 System Protection Scan`);
    console.log(`   ❌ Issues: ${summary.issuesFound}`);
    console.log(`   🚨 Critical: ${summary.criticalIssues}`);
    console.log(`   🔧 Auto-fixes: ${summary.autoFixesApplied}`);

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

    // Store separate protection results (not for display)
    this.storeBackendProtectionResults(summary);
    this.emitBackendProtectionEvent('protection-scan-complete', summary);
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
   * Store backend protection results separately
   */
  private storeBackendProtectionResults(summary: VerificationSummary): void {
    try {
      const results = JSON.parse(localStorage.getItem('backend-protection-results') || '[]');
      results.unshift(summary);
      
      // Keep only last 20 protection results
      if (results.length > 20) {
        results.splice(20);
      }
      
      localStorage.setItem('backend-protection-results', JSON.stringify(results));
      console.log('🛡️ Backend protection results stored separately from display');
    } catch (error) {
      console.warn('Failed to store backend protection results:', error);
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
   * Emit events for backend protection system
   */
  private emitBackendProtectionEvent(eventType: string, data: any): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent(`backend-protection-${eventType}`, {
        detail: data
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Emit events for display interface
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
   * Run background protection scan (separate from display)
   */
  private async runBackgroundProtectionScan(): Promise<void> {
    console.log('🛡️ BACKGROUND SYSTEM PROTECTION SCAN...');
    
    try {
      const summary = await this.runComprehensiveProtectionScan();
      this.lastScanTimestamp = summary.timestamp;
      
      if (summary.issuesFound > 0) {
        console.log(`🛡️ BACKGROUND PROTECTION: ${summary.issuesFound} issues detected and handled`);
      } else {
        console.log('✅ BACKGROUND PROTECTION: System secure');
      }

      this.emitBackendProtectionEvent('background-scan-complete', summary);
    } catch (error) {
      console.error('❌ BACKGROUND PROTECTION SCAN FAILED:', error);
      this.emitBackendProtectionEvent('background-scan-error', { error: error.message });
    }
  }

  /**
   * Run comprehensive protection scan for backend
   */
  private async runComprehensiveProtectionScan(): Promise<VerificationSummary> {
    console.log('🛡️ RUNNING COMPREHENSIVE BACKGROUND PROTECTION SCAN...');

    const timestamp = new Date().toISOString();
    
    try {
      const [auditResults, duplicates, databaseValidation, schemaValidation, securityScan, codeQuality, performanceMetrics] = await Promise.all([
        this.verificationRunner.runComponentAudit(),
        this.verificationRunner.runDuplicateDetection(),
        this.verificationRunner.runDatabaseValidation({ componentType: 'module', moduleName: 'background_protection', description: 'Background system protection scan' }),
        this.verificationRunner.runSchemaValidation({ componentType: 'module', moduleName: 'background_protection', description: 'Background schema protection' }),
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
        recommendations: ['Background system protection scan completed'],
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

      // Apply automatic fixes for system protection
      if (this.config.autoFixSimpleIssues && summary.issuesFound > 0) {
        const autoFixes = await this.autoFixHandler.applyEnhancedAutoFixes(summary);
        summary.autoFixesApplied = autoFixes;
        console.log(`🔧 BACKGROUND PROTECTION: Applied ${autoFixes} automatic fixes`);
      }

      this.storeBackendProtectionResults(summary);

      console.log(`🛡️ BACKGROUND PROTECTION SCAN COMPLETE: ${summary.issuesFound} issues handled, system protected`);
      
      return summary;
    } catch (error) {
      console.error('❌ BACKGROUND PROTECTION SCAN FAILED:', error);
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

    console.log('⏹️ Stopping Backend Protection System...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isRunning = false;
    this.emitBackendProtectionEvent('backend-protection-stopped', { isRunning: false });
    console.log('✅ Backend Protection System stopped');
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastScanTimestamp: this.lastScanTimestamp,
      protectionActive: this.isRunning,
      displaySeparate: true
    };
  }

  /**
   * Update configuration with database validation options
   */
  updateConfig(newConfig: Partial<AutomatedVerificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ BACKEND PROTECTION CONFIG UPDATED:', newConfig);
    
    // Update service class configurations
    this.verificationRunner = new VerificationRunner(this.config);
    this.autoFixHandler = new AutoFixHandler(this.config);
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Global singleton instance for backend protection
export const automatedVerification = AutomatedVerificationOrchestrator.getInstance();

if (typeof window !== 'undefined') {
  console.log('🛡️ INITIALIZING BACKEND PROTECTION SYSTEM...');
  
  // Auto-start backend protection immediately
  setTimeout(() => {
    if (!automatedVerification.getStatus().isRunning) {
      automatedVerification.start();
    }
  }, 100);

  // Global verification function (handles both display and protection)
  (window as any).verifyAutomatically = async (request: ValidationRequest) => {
    return await automatedVerification.verifyBeforeCreation(request);
  };

  // Global template generation function
  (window as any).generateFromTemplate = async (request: TemplateGenerationRequest) => {
    return await automatedVerification.generateFromTemplate(request);
  };

  console.log('✅ BACKEND PROTECTION SYSTEM READY - CONTINUOUS SYSTEM MONITORING ACTIVE (DISPLAY INTERFACE SEPARATE)');
}

// Export types for external usage
export type { 
  AutomatedVerificationConfig,
  VerificationSummary,
  TemplateGenerationRequest,
  TemplateGenerationResult
} from './AutomatedVerificationTypes';
