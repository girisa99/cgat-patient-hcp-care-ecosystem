
/**
 * Types and interfaces for the Automated Verification System
 */

import { ValidationRequest, ValidationResult } from './SimplifiedValidator';
import { AuditResult } from './ComponentAuditor';
import { DatabaseValidationResult } from './DatabaseGuidelinesValidator';
import { SchemaValidationResult } from './DatabaseSchemaValidator';
import { SecurityScanResult } from './SecurityScanner';
import { CodeQualityResult } from './CodeQualityAnalyzer';

// Export PerformanceMetrics interface
export interface PerformanceMetrics {
  timestamp: string;
  componentRenderTimes: Array<{
    componentName: string;
    averageRenderTime: number;
    renderCount: number;
  }>;
  bundleSize: {
    totalSize: number;
    chunkSizes: Record<string, number>;
  };
  memoryUsage: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  networkMetrics: {
    apiCallCount: number;
    averageResponseTime: number;
    failedRequests: number;
  };
}

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
  // Enhanced features
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
  overallHealthScore: number;
  securityScore: number;
  qualityScore: number;
  performanceScore: number;
}

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
