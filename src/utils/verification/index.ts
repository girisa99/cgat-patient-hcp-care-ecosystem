/**
 * Enhanced Automated Verification System - Main Export 
 * 
 * REFACTORED: Now includes comprehensive security and performance monitoring
 */

// Core orchestrators
export { CoreVerificationOrchestrator, coreVerificationOrchestrator } from './CoreVerificationOrchestrator';
export { VerificationSummaryGenerator } from './VerificationSummaryGenerator';
export { ModuleValidationOrchestrator } from './ModuleValidationOrchestrator';

// UI/UX Validation System - NEW COMPREHENSIVE FEATURES
export { 
  UIUXOrchestrator,
  uiuxOrchestrator
} from './UIUXOrchestrator';

export {
  DesignSystemValidator,
  designSystemValidator
} from './DesignSystemValidator';

export {
  RoleBasedUIValidator,
  roleBasedUIValidator
} from './RoleBasedUIValidator';

// Main verification systems
export { 
  AutomatedVerificationOrchestrator,
  automatedVerification
} from './AutomatedVerificationOrchestrator';

export { 
  EnhancedIntegrationOrchestrator,
  enhancedIntegrationOrchestrator
} from './EnhancedIntegrationOrchestrator';

// NEW: Comprehensive Security & Performance Monitoring
export { 
  RuntimeSecurityMonitor,
  runtimeSecurityMonitor
} from './RuntimeSecurityMonitor';

export {
  RealUserMonitor,
  realUserMonitor
} from './RealUserMonitor';

export {
  AutomatedAlertingSystem,
  automatedAlertingSystem
} from './AutomatedAlertingSystem';

export {
  EnhancedSecurityPerformanceOrchestrator,
  enhancedSecurityPerformanceOrchestrator
} from './EnhancedSecurityPerformanceOrchestrator';

// Individual verification components
export { UnusedCodeDetector, unusedCodeDetector } from './UnusedCodeDetector';
export { DependencyManager, dependencyManager } from './DependencyManager';
export { DocumentationConsistencyChecker, documentationConsistencyChecker } from './DocumentationConsistencyChecker';
export { DatabaseMigrationSafetyChecker, databaseMigrationSafetyChecker } from './DatabaseMigrationSafetyChecker';
export { EnvironmentConfigValidator, environmentConfigValidator } from './EnvironmentConfigValidator';
export { ComponentPropValidator, componentPropValidator } from './ComponentPropValidator';
export { BundleSizeAnalyzer, bundleSizeAnalyzer } from './BundleSizeAnalyzer';
export { AccessibilityComplianceChecker, accessibilityComplianceChecker } from './AccessibilityComplianceChecker';

// API Contract validation
export { ApiContractValidator, apiContractValidator } from './ApiContractValidator';
export { ApiContractIntegration, apiContractIntegration } from './ApiContractIntegration';

// Merge and duplicate handling
export { MergeVerificationHandler } from './MergeVerificationHandler';
export { DuplicateDetector, detectDuplicates } from './DuplicateDetector';
export { TemplateEnforcement, enforceTemplateUsage } from './TemplateEnforcement';

// Database and schema validation
export { DatabaseGuidelinesValidator } from './DatabaseGuidelinesValidator';
export { DatabaseSchemaValidator } from './DatabaseSchemaValidator';
export { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor';
export { SecurityScanner } from './SecurityScanner';
export { CodeQualityAnalyzer } from './CodeQualityAnalyzer';

// Utility systems
export { ComponentRegistryScanner } from './ComponentRegistryScanner';
export { TypeScriptDatabaseValidator, validateTableSchema, ensureTypescriptDatabaseAlignment } from './TypeScriptDatabaseValidator';
export { 
  SimplifiedValidator,
  validateModuleCreation, 
  validateComponentCreation, 
  validateHookCreation,
  runSimplifiedValidation
} from './SimplifiedValidator';

// NEW: Pre-implementation validation components
export { PreImplementationChecker } from './PreImplementationChecker';
export { ComponentScanner } from './ComponentScanner';
export { TypeScriptValidator } from './TypeScriptValidator';
export { DatabaseAlignmentValidator } from './DatabaseAlignmentValidator';
export { GuidelinesValidator } from './GuidelinesValidator';

// Import instances for the main validation functions
import { coreVerificationOrchestrator } from './CoreVerificationOrchestrator';
import { VerificationSummaryGenerator } from './VerificationSummaryGenerator';
import { ModuleValidationOrchestrator } from './ModuleValidationOrchestrator';
import { uiuxOrchestrator } from './UIUXOrchestrator';

// NEW: Enhanced main validation functions with comprehensive monitoring
import { enhancedSecurityPerformanceOrchestrator } from './EnhancedSecurityPerformanceOrchestrator';

export const startComprehensiveMonitoring = async () => {
  console.log('🚀 Starting comprehensive security and performance monitoring...');
  await enhancedSecurityPerformanceOrchestrator.startComprehensiveMonitoring();
};

export const getComprehensiveSystemSummary = async () => {
  console.log('📊 Getting comprehensive system summary...');
  return await enhancedSecurityPerformanceOrchestrator.getComprehensiveSummary();
};

export const executeAutomatedSystemFixes = async (fixIds: string[]) => {
  console.log('🔧 Executing automated system fixes...');
  return await enhancedSecurityPerformanceOrchestrator.executeAutomatedFixes(fixIds);
};

// Main validation functions
export const validateBeforeImplementation = async (request: any) => {
  return await coreVerificationOrchestrator.validateBeforeImplementation(request);
};

export const getCompleteVerificationSummary = async () => {
  return await VerificationSummaryGenerator.getCompleteVerificationSummary();
};

export const validateWithMergeDetection = async (request: any) => {
  return await ModuleValidationOrchestrator.validateWithMergeDetection(request);
};

export const generateCodeFromTemplate = async (request: any) => {
  return await ModuleValidationOrchestrator.generateCodeFromTemplate(request);
};

export const createModuleWithAutomaticValidation = async (config: any) => {
  return await ModuleValidationOrchestrator.createModuleWithAutomaticValidation(config);
};

// NEW UI/UX VALIDATION FUNCTIONS
export const validateUIUXDesign = async () => {
  console.log('🎨 Starting comprehensive UI/UX validation...');
  return await uiuxOrchestrator.performComprehensiveUIUXValidation();
};

export const validateComponentDesign = async (components: string[]) => {
  console.log('⚡ Starting quick UI validation for specific components...');
  return await uiuxOrchestrator.performQuickUIValidation(components);
};

// Export types - being selective to avoid conflicts
export type * from './CoreVerificationOrchestrator';
export type * from './VerificationSummaryGenerator';
export type * from './UnusedCodeDetector';
export type { 
  DependencyManagementResult, 
  OutdatedPackage, 
  DependencyConflict 
} from './DependencyManager';
export type * from './DocumentationConsistencyChecker';
export type * from './DatabaseMigrationSafetyChecker';
export type * from './EnvironmentConfigValidator';
export type * from './ComponentPropValidator';
export type * from './BundleSizeAnalyzer';
export type * from './AccessibilityComplianceChecker';
export type * from './ApiContractValidator';
export type * from './ApiContractIntegration';
export type * from './MergeVerificationHandler';
export type * from './DatabaseSchemaValidator';
export type * from './PerformanceMonitor';
export type * from './ComponentRegistryScanner';
export type * from './TypeScriptDatabaseValidator';
export type * from './AutomatedVerificationOrchestrator';
export type * from './EnhancedIntegrationOrchestrator';

// NEW UI/UX VALIDATION TYPES
export type * from './DesignSystemValidator';
export type * from './RoleBasedUIValidator';
export type * from './UIUXOrchestrator';

// Import specific types to avoid conflicts, exclude overlapped ones
export type {
  TemplateRecommendation,
  PatternEnforcementResult,
  ComponentCreationRequest,
  ValidationRequest,
  VerificationRequest,
  VerificationResult,
  EnhancedVerificationResult,
  ComponentScanResult,
  DatabaseAlignmentResult,
  TypeScriptValidationResult,
  PreImplementationCheckResult,
  DuplicateDetection,
  SystemAssessmentResult,
  AssessmentRecommendation,
  CriticalIssue,
  DatabaseIssue,
  PerformanceBottleneck,
  SecurityCompliance,
  AccessibilityComplianceResult
} from './types';

// Global initialization with UI/UX capabilities
if (typeof window !== 'undefined') {
  console.log('🚀 ENHANCED VERIFICATION SYSTEM WITH COMPREHENSIVE MONITORING INITIALIZING...');
  
  (window as any).automaticVerification = {
    // Existing functions
    validate: validateBeforeImplementation,
    validateWithMergeDetection,
    getSummary: getCompleteVerificationSummary,
    createModule: createModuleWithAutomaticValidation,
    generateTemplate: generateCodeFromTemplate,
    
    // NEW UI/UX validation functions
    validateUIUX: validateUIUXDesign,
    validateComponents: validateComponentDesign,
    
    // NEW: Comprehensive monitoring functions
    startComprehensiveMonitoring,
    getComprehensiveSystemSummary,
    executeAutomatedSystemFixes,
    
    // NEW: Individual monitoring system access
    runtimeSecurity: () => runtimeSecurityMonitor.getRuntimeSecurityAnalysis(),
    realUserMetrics: () => realUserMonitor.getRUMMetrics(),
    alertingStatus: () => automatedAlertingSystem.getAlertingStatus(),
    
    // Enhanced metadata
    hasComprehensiveMonitoring: true,
    hasRuntimeSecurity: true,
    hasRealUserMonitoring: true, 
    hasAutomatedAlerting: true,
    hasPerformanceOptimization: true,
    hasSecurityThreatDetection: true,
    hasMemoryLeakDetection: true,
    hasDependencyScanning: true,
    hasComplianceTracking: true,
    isAutomatic: true,
    isRefactored: true,
    isModular: true,
    hasUIUXValidation: true,
    supportsRichDesign: true,
    validatesTabs: true,
    validatesButtons: true,
    validatesLayouts: true,
    validatesRoleBasedUI: true
  };
  
  console.log('✅ ENHANCED VERIFICATION SYSTEM WITH COMPREHENSIVE MONITORING READY');
  console.log('🛡️ Security Features: Runtime monitoring, threat detection, vulnerability scanning');
  console.log('📊 Performance Features: RUM, Core Web Vitals, memory leak detection');
  console.log('🚨 Alerting Features: Real-time alerts, automated responses, incident management');
  console.log('🔧 Automation Features: Automated fixes, dependency updates, optimization');
}
