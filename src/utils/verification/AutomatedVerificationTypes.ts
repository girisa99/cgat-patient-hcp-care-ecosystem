
/**
 * Automated Verification Types
 * Common types for verification system
 */

export interface VerificationConfig {
  enabled: boolean;
  interval: number;
  autoFix: boolean;
}

export interface AutomatedVerificationConfig {
  enableDatabaseValidation: boolean;
  enableSchemaValidation: boolean;
  enablePerformanceMonitoring: boolean;
  enableSecurityScanning: boolean;
  enableCodeQualityAnalysis: boolean;
  autoFix: boolean;
  interval: number;
}

export interface VerificationResult {
  success: boolean;
  issues: string[];
  fixes: string[];
  timestamp: string;
}

export interface VerificationSummary {
  totalIssues: number;
  criticalIssues: number;
  fixedIssues: number;
  recommendations: string[];
  timestamp: string;
}

export interface ComponentAuditResult {
  componentName: string;
  issues: string[];
  suggestions: string[];
  score: number;
}

export interface TemplateGenerationRequest {
  templateType: 'hook' | 'component' | 'module' | 'api_integration';
  moduleName?: string;
  tableName?: string;
  apiId?: string;
  generateTests?: boolean;
  generateDocumentation?: boolean;
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
