
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
  issuesFound?: number;
  autoFixesApplied?: number;
  databaseValidation?: {
    violations: any[];
    autoFixesApplied?: number;
    autoFixesAvailable?: any[];
  };
  codeQuality?: {
    issues: any[];
  };
  securityScan?: {
    vulnerabilities: any[];
  };
  schemaValidation?: {
    violations: any[];
    autoFixesAvailable?: any[];
  };
  securityScore?: number;
  qualityScore?: number;
  sqlAutoFixes?: any[];
  highIssues?: number;
  mediumIssues?: number;
  lowIssues?: number;
  realFixesApplied?: number;
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
  enableAutoSQLGeneration?: boolean;
}

// Template Generator Types
export interface TemplateGenerationRequest {
  templateType: 'component' | 'hook' | 'page' | 'utility' | 'module' | 'api_integration';
  name: string;
  specifications?: Record<string, any>;
  moduleName?: string;
  tableName?: string;
  generateTests?: boolean;
  generateDocumentation?: boolean;
}

export interface TemplateGenerationResult {
  success: boolean;
  generatedFiles: string[];
  errors: string[];
  filesGenerated?: string[];
  templateUsed?: string;
  codeGenerated?: string;
  testsGenerated?: boolean;
  documentationGenerated?: boolean;
}
