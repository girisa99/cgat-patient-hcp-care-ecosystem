
/**
 * Automated Verification Types
 * Type definitions for the verification system
 */

// Import types from the main types file
import type { 
  CodeQualityIssue, 
  SecurityVulnerability 
} from './types';

// Additional types for automated verification
export interface DatabaseViolation {
  type: 'schema' | 'constraint' | 'policy' | 'data';
  table: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface SchemaViolation {
  type: 'missing_table' | 'wrong_type' | 'missing_column' | 'constraint_violation';
  table: string;
  column?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface AutoFixSuggestion {
  type: 'sql' | 'code' | 'config';
  description: string;
  fix: string;
  impact: 'low' | 'medium' | 'high';
  requiresManualReview: boolean;
}

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
    violations: DatabaseViolation[];
    autoFixesApplied?: number;
    autoFixesAvailable?: AutoFixSuggestion[];
  };
  codeQuality?: {
    issues: CodeQualityIssue[];
  };
  securityScan?: {
    vulnerabilities: SecurityVulnerability[];
  };
  schemaValidation?: {
    violations: SchemaViolation[];
    autoFixesAvailable?: AutoFixSuggestion[];
  };
  securityScore?: number;
  qualityScore?: number;
  sqlAutoFixes?: AutoFixSuggestion[];
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
  specifications?: Record<string, unknown>;
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
