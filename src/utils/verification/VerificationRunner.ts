/**
 * Verification Runner
 * Handles execution of individual verification systems
 */

import { ValidationRequest, ValidationResult, SimplifiedValidator } from './SimplifiedValidator';
import { ComponentAuditor, AuditResult } from './ComponentAuditor';
import { DuplicateDetector } from './DuplicateDetector';
import { DatabaseGuidelinesValidator, DatabaseValidationResult } from './DatabaseGuidelinesValidator';
import { DatabaseSchemaValidator, SchemaValidationResult } from './DatabaseSchemaValidator';
import { PerformanceMonitor, PerformanceMetrics, performanceMonitor } from './PerformanceMonitor';
import { SecurityScanner, SecurityScanResult } from './SecurityScanner';
import { CodeQualityAnalyzer, CodeQualityResult } from './CodeQualityAnalyzer';
import { VerificationConfig } from './AutomatedVerificationTypes';

export class VerificationRunner {
  constructor(private config: VerificationConfig) {}

  /**
   * Run validation automatically
   */
  async runValidation(request: ValidationRequest): Promise<ValidationResult> {
    return SimplifiedValidator.validate(request);
  }

  /**
   * Run component audit automatically
   */
  async runComponentAudit(): Promise<AuditResult[]> {
    const auditor = new ComponentAuditor();
    return await auditor.auditComponentUsage();
  }

  /**
   * Run duplicate detection automatically
   */
  async runDuplicateDetection() {
    const duplicateDetector = new DuplicateDetector();
    return await duplicateDetector.scanForDuplicates();
  }

  /**
   * Run database validation automatically
   */
  async runDatabaseValidation(request: ValidationRequest): Promise<DatabaseValidationResult | null> {
    if (!this.config.enableDatabaseValidation) return null;

    console.log('🗄️ RUNNING DATABASE GUIDELINES VALIDATION...');
    
    // Extract table names from request
    const tableNames = request.tableName ? [request.tableName] : [];
    
    return await DatabaseGuidelinesValidator.validateDatabase(tableNames);
  }

  /**
   * Run schema validation automatically
   */
  async runSchemaValidation(request: ValidationRequest): Promise<SchemaValidationResult | null> {
    if (!this.config.enableSchemaValidation) return null;

    console.log('🗄️ RUNNING DATABASE SCHEMA VALIDATION...');
    const tableNames = request.tableName ? [request.tableName] : [];
    return await DatabaseSchemaValidator.validateSchema(tableNames);
  }

  /**
   * Run performance analysis automatically
   */
  async runPerformanceAnalysis(): Promise<PerformanceMetrics | null> {
    if (!this.config.enablePerformanceMonitoring) return null;

    console.log('📊 RUNNING PERFORMANCE ANALYSIS...');
    return await performanceMonitor.getPerformanceMetrics();
  }

  /**
   * Run security scan automatically
   */
  async runSecurityScan(): Promise<SecurityScanResult | null> {
    if (!this.config.enableSecurityScanning) return null;

    console.log('🔒 RUNNING SECURITY SCAN...');
    return await SecurityScanner.performSecurityScan();
  }

  /**
   * Run code quality analysis automatically
   */
  async runCodeQualityAnalysis(): Promise<CodeQualityResult | null> {
    if (!this.config.enableCodeQualityAnalysis) return null;

    console.log('📊 RUNNING CODE QUALITY ANALYSIS...');
    return await CodeQualityAnalyzer.analyzeCodeQuality();
  }
}
