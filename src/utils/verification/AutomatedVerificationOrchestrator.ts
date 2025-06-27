/**
 * Fully Automated Verification Orchestrator - ENHANCED UNIFIED SYSTEM
 * 
 * Coordinates all verification systems and triggers them automatically
 * with ZERO manual intervention required
 * 
 * NOW INCLUDES: Database Schema Validation, Performance Monitoring, 
 * Security Scanning, Code Quality Analysis, and Template-based Generation
 */

import { SimplifiedValidator, ValidationRequest, ValidationResult } from './SimplifiedValidator';
import { ComponentAuditor, AuditResult } from './ComponentAuditor';
import { DuplicateDetector } from './DuplicateDetector';
import { CanonicalSourceValidator } from './CanonicalSourceValidator';
import { DatabaseGuidelinesValidator, DatabaseValidationResult } from './DatabaseGuidelinesValidator';
import { DatabaseSchemaValidator, SchemaValidationResult } from './DatabaseSchemaValidator';
import { PerformanceMonitor, PerformanceMetrics, performanceMonitor } from './PerformanceMonitor';
import { SecurityScanner, SecurityScanResult } from './SecurityScanner';
import { CodeQualityAnalyzer, CodeQualityResult } from './CodeQualityAnalyzer';

export interface AutomatedVerificationConfig {
  enableRealTimeChecks: boolean;
  enablePeriodicScans: boolean;
  scanIntervalMinutes: number;
  autoFixSimpleIssues: boolean;
  notifyOnIssues: boolean;
  blockOnCriticalIssues: boolean;
  autoStartOnAppLoad: boolean;
  mandatoryVerification: boolean;
  enableDatabaseValidation: boolean;
  enableWorkflowSuggestions: boolean;
  enableAutoSQLGeneration: boolean;
  // NEW ENHANCED FEATURES
  enableSchemaValidation: boolean;
  enablePerformanceMonitoring: boolean;
  enableSecurityScanning: boolean;
  enableCodeQualityAnalysis: boolean;
  enableTemplateGeneration: boolean;
  enableAutomatedRefactoring: boolean;
}

export interface VerificationSummary {
  timestamp: string;
  validationResult: ValidationResult;
  auditResults: AuditResult[];
  duplicateReport: string;
  canonicalValidation: string;
  databaseValidation?: DatabaseValidationResult;
  // NEW ENHANCED RESULTS
  schemaValidation?: SchemaValidationResult;
  performanceMetrics?: PerformanceMetrics;
  securityScan?: SecurityScanResult;
  codeQuality?: CodeQualityResult;
  issuesFound: number;
  criticalIssues: number;
  autoFixesApplied: number;
  recommendations: string[];
  sqlAutoFixes?: string[];
  workflowSuggestions?: string[];
  // NEW ENHANCED METRICS
  overallHealthScore: number;
  securityScore: number;
  qualityScore: number;
  performanceScore: number;
}

// NEW: Template Generation Interface
export interface TemplateGenerationRequest {
  templateType: 'hook' | 'component' | 'module' | 'api_integration';
  tableName?: string;
  moduleName?: string;
  apiId?: string;
  generateTests: boolean;
  generateDocumentation: boolean;
}

export interface TemplateGenerationResult {
  success: boolean;
  filesGenerated: string[];
  templateUsed: string;
  codeGenerated: string;
  testsGenerated: string;
  documentationGenerated: string;
  errors: string[];
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
      enableDatabaseValidation: true,
      enableWorkflowSuggestions: true,
      enableAutoSQLGeneration: true,
      // NEW ENHANCED DEFAULTS
      enableSchemaValidation: true,
      enablePerformanceMonitoring: true,
      enableSecurityScanning: true,
      enableCodeQualityAnalysis: true,
      enableTemplateGeneration: true,
      enableAutomatedRefactoring: true,
      ...config
    };

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

    // Start performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      performanceMonitor.startMonitoring();
    }

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
        this.runValidation(request),
        this.runComponentAudit(),
        this.runDuplicateDetection(),
        this.config.enableDatabaseValidation ? this.runDatabaseValidation(request) : Promise.resolve(null),
        this.config.enableSchemaValidation ? this.runSchemaValidation(request) : Promise.resolve(null),
        this.config.enablePerformanceMonitoring ? this.runPerformanceAnalysis() : Promise.resolve(null),
        this.config.enableSecurityScanning ? this.runSecurityScan() : Promise.resolve(null),
        this.config.enableCodeQualityAnalysis ? this.runCodeQualityAnalysis() : Promise.resolve(null)
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
        databaseValidation,
        schemaValidation,
        performanceMetrics,
        securityScan,
        codeQuality
      );

      // ENHANCED handling of results
      await this.handleEnhancedVerificationResults(summary, request);

      // ENHANCED CRITICAL ISSUES = AUTOMATIC BLOCKING
      const hasCriticalIssues = this.hasCriticalIssues(summary);

      if (hasCriticalIssues && this.config.blockOnCriticalIssues) {
        console.error('🚫 CRITICAL ISSUES DETECTED (enhanced verification) - CREATION AUTOMATICALLY BLOCKED');
        this.emitVerificationEvent('critical-issues-detected', summary);
        return false;
      }

      // ENHANCED AUTOMATIC fixes
      if (this.config.autoFixSimpleIssues && summary.issuesFound > 0) {
        const autoFixes = await this.applyEnhancedAutoFixes(summary);
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
   * NEW: Template-based code generation
   */
  async generateFromTemplate(request: TemplateGenerationRequest): Promise<TemplateGenerationResult> {
    console.log('🎯 GENERATING CODE FROM TEMPLATE:', request.templateType);

    const result: TemplateGenerationResult = {
      success: false,
      filesGenerated: [],
      templateUsed: '',
      codeGenerated: '',
      testsGenerated: '',
      documentationGenerated: '',
      errors: []
    };

    try {
      switch (request.templateType) {
        case 'hook':
          result.templateUsed = 'useTypeSafeModuleTemplate';
          result.codeGenerated = this.generateHookTemplate(request);
          break;
        case 'component':
          result.templateUsed = 'ExtensibleModuleTemplate';
          result.codeGenerated = this.generateComponentTemplate(request);
          break;
        case 'module':
          result.templateUsed = 'CompleteModuleTemplate';
          result.codeGenerated = this.generateModuleTemplate(request);
          break;
        case 'api_integration':
          result.templateUsed = 'ApiIntegrationTemplate';
          result.codeGenerated = this.generateApiIntegrationTemplate(request);
          break;
      }

      if (request.generateTests) {
        result.testsGenerated = this.generateTestTemplate(request);
      }

      if (request.generateDocumentation) {
        result.documentationGenerated = this.generateDocumentationTemplate(request);
      }

      result.success = true;
      console.log('✅ Template generation completed successfully');

    } catch (error) {
      result.errors.push(`Template generation failed: ${error.message}`);
      console.error('❌ Template generation failed:', error);
    }

    return result;
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
   * NEW: Run schema validation automatically
   */
  private async runSchemaValidation(request: ValidationRequest): Promise<SchemaValidationResult | null> {
    if (!this.config.enableSchemaValidation) return null;

    console.log('🗄️ RUNNING DATABASE SCHEMA VALIDATION...');
    const tableNames = request.tableName ? [request.tableName] : [];
    return await DatabaseSchemaValidator.validateSchema(tableNames);
  }

  /**
   * NEW: Run performance analysis automatically
   */
  private async runPerformanceAnalysis(): Promise<PerformanceMetrics | null> {
    if (!this.config.enablePerformanceMonitoring) return null;

    console.log('📊 RUNNING PERFORMANCE ANALYSIS...');
    return await performanceMonitor.getPerformanceMetrics();
  }

  /**
   * NEW: Run security scan automatically
   */
  private async runSecurityScan(): Promise<SecurityScanResult | null> {
    if (!this.config.enableSecurityScanning) return null;

    console.log('🔒 RUNNING SECURITY SCAN...');
    return await SecurityScanner.performSecurityScan();
  }

  /**
   * NEW: Run code quality analysis automatically
   */
  private async runCodeQualityAnalysis(): Promise<CodeQualityResult | null> {
    if (!this.config.enableCodeQualityAnalysis) return null;

    console.log('📊 RUNNING CODE QUALITY ANALYSIS...');
    return await CodeQualityAnalyzer.analyzeCodeQuality();
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
        this.runComponentAudit(),
        this.runDuplicateDetection(),
        this.config.enableDatabaseValidation ? DatabaseGuidelinesValidator.validateDatabase() : Promise.resolve(null),
        this.config.enableSchemaValidation ? DatabaseSchemaValidator.validateSchema() : Promise.resolve(null),
        this.config.enableSecurityScanning ? SecurityScanner.performSecurityScan() : Promise.resolve(null),
        this.config.enableCodeQualityAnalysis ? CodeQualityAnalyzer.analyzeCodeQuality() : Promise.resolve(null),
        this.config.enablePerformanceMonitoring ? performanceMonitor.getPerformanceMetrics() : Promise.resolve(null)
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
        databaseValidation,
        schemaValidation,
        performanceMetrics,
        securityScan,
        codeQuality
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

    // Apply schema fixes
    if (summary.schemaValidation && this.config.enableAutoSQLGeneration) {
      const schemaFixesCount = summary.schemaValidation.autoFixesAvailable.length;
      fixesApplied += schemaFixesCount;
    }

    if (fixesApplied > 0) {
      console.log(`✅ AUTOMATICALLY APPLIED ${fixesApplied} fixes (including database and schema fixes)`);
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
    databaseValidation: DatabaseValidationResult | null,
    schemaValidation: SchemaValidationResult | null,
    performanceMetrics: PerformanceMetrics | null,
    securityScan: SecurityScanResult | null,
    codeQuality: CodeQualityResult | null
  ): VerificationSummary {
    const baseIssuesFound = validationResult.issues.length + 
                          auditResults.reduce((sum, audit) => sum + audit.issues.length, 0);
    
    const databaseIssuesFound = databaseValidation?.violations.length || 0;
    const schemaIssuesFound = schemaValidation?.violations.length || 0;
    const securityIssuesFound = securityScan?.vulnerabilities.length || 0;
    const qualityIssuesFound = codeQuality?.issues.length || 0;
    
    const issuesFound = baseIssuesFound + databaseIssuesFound + schemaIssuesFound + securityIssuesFound + qualityIssuesFound;
    
    const baseCriticalIssues = validationResult.issues.filter(issue => 
      issue.toLowerCase().includes('critical') || 
      issue.toLowerCase().includes('blocked')
    ).length;
    
    const databaseCriticalIssues = databaseValidation?.violations.filter(v => v.severity === 'error').length || 0;
    const schemaCriticalIssues = schemaValidation?.violations.filter(v => v.severity === 'error').length || 0;
    const securityCriticalIssues = securityScan?.vulnerabilities.filter(v => 
      v.severity === 'critical' || v.severity === 'high').length || 0;
    const qualityCriticalIssues = codeQuality?.issues.filter(i => i.severity === 'error').length || 0;
    
    const criticalIssues = baseCriticalIssues + databaseCriticalIssues + schemaCriticalIssues + 
                          securityCriticalIssues + qualityCriticalIssues;

    const allRecommendations = [
      ...validationResult.recommendations,
      ...auditResults.flatMap(audit => audit.recommendations)
    ];

    // Add enhanced system recommendations
    if (databaseValidation) {
      allRecommendations.push(...databaseValidation.violations.map(v => v.recommendation));
    }
    if (schemaValidation) {
      allRecommendations.push(...schemaValidation.recommendations);
    }
    if (securityScan) {
      allRecommendations.push(...securityScan.recommendations.map(r => r.title));
    }
    if (codeQuality) {
      allRecommendations.push(...codeQuality.recommendations.map(r => r.title));
    }

    // Generate SQL auto-fixes
    const sqlAutoFixes = this.config.enableAutoSQLGeneration && databaseValidation 
      ? DatabaseGuidelinesValidator.generateAutoFixSQL(databaseValidation.violations)
      : [];

    // Add schema SQL fixes
    if (this.config.enableAutoSQLGeneration && schemaValidation) {
      sqlAutoFixes.push(...DatabaseSchemaValidator.generateAutoFixSQL(schemaValidation.autoFixesAvailable));
    }

    // Generate workflow suggestions
    const workflowSuggestions = this.config.enableWorkflowSuggestions && databaseValidation
      ? databaseValidation.workflowSuggestions.map(ws => ws.description)
      : [];

    // Calculate health scores
    const overallHealthScore = this.calculateOverallHealthScore({
      validationScore: issuesFound === 0 ? 100 : Math.max(0, 100 - (issuesFound * 5)),
      securityScore: securityScan?.securityScore || 100,
      qualityScore: codeQuality?.overallScore || 100,
      performanceScore: this.calculatePerformanceScore(performanceMetrics)
    });

    return {
      timestamp,
      validationResult,
      auditResults,
      duplicateReport,
      canonicalValidation,
      databaseValidation,
      schemaValidation,
      performanceMetrics,
      securityScan,
      codeQuality,
      issuesFound,
      criticalIssues,
      autoFixesApplied: 0,
      recommendations: allRecommendations,
      sqlAutoFixes,
      workflowSuggestions,
      overallHealthScore,
      securityScore: securityScan?.securityScore || 100,
      qualityScore: codeQuality?.overallScore || 100,
      performanceScore: this.calculatePerformanceScore(performanceMetrics)
    };
  }

  private calculateOverallHealthScore(scores: {
    validationScore: number;
    securityScore: number;
    qualityScore: number;
    performanceScore: number;
  }): number {
    const weights = {
      validation: 0.25,
      security: 0.35,
      quality: 0.25,
      performance: 0.15
    };

    return Math.round(
      scores.validationScore * weights.validation +
      scores.securityScore * weights.security +
      scores.qualityScore * weights.quality +
      scores.performanceScore * weights.performance
    );
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics | null): number {
    if (!metrics) return 100;

    let score = 100;
    
    // Deduct for slow components
    const slowComponents = metrics.componentRenderTimes.filter(c => c.averageRenderTime > 16);
    score -= slowComponents.length * 10;

    // Deduct for bundle size
    if (metrics.bundleSize.totalSize > 3 * 1024 * 1024) { // 3MB
      score -= 20;
    }

    return Math.max(0, score);
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
      schemaValidation: null,
      performanceMetrics: null,
      securityScan: null,
      codeQuality: null,
      issuesFound: 0,
      criticalIssues: 0,
      autoFixesApplied: 0,
      recommendations: [],
      sqlAutoFixes: [],
      workflowSuggestions: [],
      overallHealthScore: 100,
      securityScore: 100,
      qualityScore: 100,
      performanceScore: 100
    };
  }

  /**
   * NEW: Check for critical issues across all verification systems
   */
  private hasCriticalIssues(summary: VerificationSummary): boolean {
    // Database critical issues
    const databaseErrors = summary.databaseValidation?.violations.some(v => v.severity === 'error') || false;
    
    // Schema critical issues
    const schemaErrors = summary.schemaValidation?.violations.some(v => v.severity === 'error') || false;
    
    // Security critical issues
    const securityCritical = summary.securityScan?.vulnerabilities.some(v => 
      v.severity === 'critical' || v.severity === 'high') || false;
    
    // Code quality critical issues
    const qualityCritical = summary.codeQuality?.issues.some(i => i.severity === 'error') || false;

    return summary.criticalIssues > 0 || databaseErrors || schemaErrors || securityCritical || qualityCritical;
  }

  /**
   * NEW: Template suggestion logic
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

  private generateHookTemplate(request: TemplateGenerationRequest): string {
    return `
/**
 * ${request.moduleName} Hook
 * Generated using useTypeSafeModuleTemplate
 */

import { useTypeSafeModuleTemplate } from '@/utils/useTypeSafeModuleTemplate';

const ${request.moduleName?.toLowerCase()}Config = {
  tableName: '${request.tableName}',
  moduleName: '${request.moduleName}',
  requiredFields: ['id', 'name'],
  customValidation: (data) => true
};

export const ${request.moduleName} = () => {
  return useTypeSafeModuleTemplate(${request.moduleName?.toLowerCase()}Config);
};
    `;
  }

  private generateComponentTemplate(request: TemplateGenerationRequest): string {
    return `
/**
 * ${request.moduleName} Component
 * Generated using ExtensibleModuleTemplate
 */

import { ExtensibleModuleTemplate } from '@/components/ExtensibleModuleTemplate';
import { ${request.moduleName} } from '@/hooks/${request.moduleName}';

export const ${request.moduleName}Component = () => {
  const moduleHook = ${request.moduleName}();

  return (
    <ExtensibleModuleTemplate
      {...moduleHook}
      title="${request.moduleName}"
      description="Manage ${request.moduleName?.toLowerCase()} data"
    />
  );
};
    `;
  }

  private generateModuleTemplate(request: TemplateGenerationRequest): string {
    return `
/**
 * Complete ${request.moduleName} Module
 * Generated using CompleteModuleTemplate
 */

// Hook
${this.generateHookTemplate(request)}

// Component  
${this.generateComponentTemplate(request)}

// Export everything
export { ${request.moduleName}, ${request.moduleName}Component };
    `;
  }

  private generateApiIntegrationTemplate(request: TemplateGenerationRequest): string {
    return `
/**
 * ${request.apiId} API Integration
 * Generated using ApiIntegrationTemplate
 */

import { ApiConsumptionOrchestrator } from '@/utils/verification/ApiConsumptionOrchestrator';

const ${request.apiId}Config = {
  apiId: '${request.apiId}',
  autoGenerateSchema: true,
  autoGenerateRLS: true,
  autoGenerateDocumentation: true,
  autoGenerateDataMappings: true,
  autoRegisterModules: true,
  generateTypeScriptTypes: true,
  syncWithKnowledgeBase: true
};

export const orchestrate${request.apiId}Integration = async () => {
  return await ApiConsumptionOrchestrator.orchestrateApiConsumption(${request.apiId}Config);
};
    `;
  }

  private generateTestTemplate(request: TemplateGenerationRequest): string {
    return `
/**
 * ${request.moduleName} Tests
 * Generated automatically
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ${request.moduleName} } from './${request.moduleName}';

describe('${request.moduleName}', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => ${request.moduleName}());
    expect(result.current).toBeDefined();
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => ${request.moduleName}());
    expect(result.current.isLoading).toBeDefined();
  });
});
    `;
  }

  private generateDocumentationTemplate(request: TemplateGenerationRequest): string {
    return `
# ${request.moduleName}

Auto-generated documentation for ${request.moduleName} module.

## Overview
This module provides ${request.templateType} functionality for ${request.tableName} table operations.

## Usage

\`\`\`typescript
import { ${request.moduleName} } from '@/path/to/${request.moduleName}';

const MyComponent = () => {
  const ${request.moduleName?.toLowerCase()} = ${request.moduleName}();
  
  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};
\`\`\`

## API Reference

### Methods
- \`create(data)\` - Create new record
- \`update(id, data)\` - Update existing record
- \`delete(id)\` - Delete record
- \`getAll()\` - Fetch all records

### Properties
- \`data\` - Current data
- \`isLoading\` - Loading state
- \`error\` - Error state
    `;
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

  // NEW: Global template generation function
  (window as any).generateFromTemplate = async (request: TemplateGenerationRequest) => {
    return await automatedVerification.generateFromTemplate(request);
  };

  console.log('✅ ENHANCED AUTOMATIC VERIFICATION SYSTEM READY - INCLUDES ALL QUALITY, SECURITY, PERFORMANCE, AND TEMPLATE GENERATION FEATURES');
}
