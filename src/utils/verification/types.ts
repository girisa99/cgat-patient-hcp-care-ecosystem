
/**
 * Verification System Types
 * Shared type definitions for the verification system
 */

// Template and Pattern Types
export interface TemplateRecommendation {
  templateName: string;
  templatePath: string;
  reason: string;
  confidence: number;
  usage: string;
  example: string;
}

export interface PatternEnforcementResult {
  shouldUseTemplate: boolean;
  recommendedTemplate: TemplateRecommendation | null;
  alternatives: TemplateRecommendation[];
  violations: string[];
  enforcements: string[];
}

// Component Creation Request Types
export interface ComponentCreationRequest {
  componentType: 'hook' | 'component' | 'module' | 'template';
  tableName?: string;
  moduleName?: string;
  description: string;
  functionality?: string[];
  targetPath?: string;
}

// Validation Request Types
export interface ValidationRequest {
  tableName?: string;
  moduleName?: string;
  componentType: string;
  description: string;
  targetPath?: string;
  skipValidation?: boolean;
}

// Verification Results
export interface VerificationResult {
  isValid: boolean;
  score: number;
  violations: string[];
  warnings: string[];
  recommendations: string[];
  canProceed: boolean;
  requiresTemplate: boolean;
}

// Enhanced Verification Results
export interface EnhancedVerificationResult extends VerificationResult {
  templateEnforcement?: PatternEnforcementResult;
  designSystemValidation?: any;
  roleBasedValidation?: any;
  accessibilityScore?: number;
  timestamp: string;
}

// Merge and Duplicate Detection
export interface MergeVerificationResult {
  hasConflicts: boolean;
  duplicates: DuplicateDetection[];
  mergeRecommendations: string[];
  autoMergeble: boolean;
}

export interface DuplicateDetection {
  type: 'component' | 'hook' | 'function' | 'type';
  name: string;
  locations: string[];
  similarity: number;
  canMerge: boolean;
  mergeStrategy: string;
}

// System Assessment Types
export interface SystemAssessmentResult {
  overallHealth: number;
  componentHealth: number;
  architectureHealth: number;
  performanceHealth: number;
  securityHealth: number;
  maintainabilityHealth: number;
  recommendations: AssessmentRecommendation[];
  criticalIssues: CriticalIssue[];
}

export interface AssessmentRecommendation {
  category: 'performance' | 'security' | 'architecture' | 'maintenance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string[];
}

export interface CriticalIssue {
  type: 'security' | 'performance' | 'data_loss' | 'breaking_change';
  severity: 'critical' | 'high';
  title: string;
  description: string;
  impact: string;
  immediateAction: string;
  timeline: string;
}

// Database and Schema Types
export interface DatabaseValidationResult {
  schemaConsistency: number;
  dataIntegrity: number;
  performanceOptimization: number;
  securityCompliance: number;
  backupStrategy: number;
  issues: DatabaseIssue[];
  recommendations: string[];
}

export interface DatabaseIssue {
  type: 'schema' | 'data' | 'performance' | 'security';
  table?: string;
  column?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fix: string;
  impact: string;
}

// Code Quality Types
export interface CodeQualityResult {
  overallScore: number;
  maintainability: number;
  readability: number;
  testCoverage: number;
  complexity: number;
  duplication: number;
  issues: CodeQualityIssue[];
  improvements: string[];
}

export interface CodeQualityIssue {
  type: 'complexity' | 'duplication' | 'naming' | 'structure';
  file: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

// Performance Types
export interface PerformanceResult {
  overallScore: number;
  loadTime: number;
  bundleSize: number;
  renderTime: number;
  memoryUsage: number;
  bottlenecks: PerformanceBottleneck[];
  optimizations: string[];
}

export interface PerformanceBottleneck {
  type: 'bundle' | 'render' | 'network' | 'memory';
  component?: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  fix: string;
  estimatedImprovement: string;
}

// Security Types
export interface SecurityResult {
  overallScore: number;
  vulnerabilities: SecurityVulnerability[];
  compliance: SecurityCompliance;
  recommendations: string[];
}

export interface SecurityVulnerability {
  type: 'xss' | 'injection' | 'auth' | 'data_exposure' | 'dependency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  fix: string;
}

export interface SecurityCompliance {
  dataProtection: number;
  accessControl: number;
  encryption: number;
  auditTrail: number;
  compliance: string[];
}
