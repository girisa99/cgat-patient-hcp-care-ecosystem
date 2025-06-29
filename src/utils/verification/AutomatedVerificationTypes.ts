
/**
 * Automated Verification Types
 * Type definitions for the verification system
 */

export interface VerificationRequest {
  componentType: 'hook' | 'component' | 'module' | 'template';
  moduleName?: string;
  description?: string;
}

export interface ValidationResult {
  success: boolean;
  issues: string[];
  fixes: string[];
  recommendations: string[];
}

export interface AuditResult {
  component: string;
  issues: string[];
  recommendations: string[];
}

export interface ComponentAuditResult extends AuditResult {
  // Additional properties for component audits
}

export interface VerificationSummary {
  totalIssues: number;
  criticalIssues: number;
  fixedIssues: number;
  recommendations: string[];
  timestamp: string;
  validationResult?: ValidationResult;
  auditResults?: AuditResult[];
}

export interface VerificationConfig {
  enableDatabaseValidation: boolean;
  enableSchemaValidation: boolean;
  enablePerformanceMonitoring: boolean;
  enableSecurityScanning: boolean;
  enableCodeQualityAnalysis: boolean;
}

export interface VerificationResult {
  success: boolean;
  issues: string[];
  fixes: string[];
  timestamp: string;
}

export interface AutomatedVerificationConfig {
  interval: number;
  enableAutoFix: boolean;
  criticalThreshold: number;
}
