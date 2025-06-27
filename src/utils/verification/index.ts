
/**
 * Enhanced Automated Verification System - Main Export 
 * 
 * REFACTORED: Simplified main exports with focused modules
 */

// Core orchestrators
export { CoreVerificationOrchestrator, coreVerificationOrchestrator } from './CoreVerificationOrchestrator';
export { VerificationSummaryGenerator } from './VerificationSummaryGenerator';
export { ModuleValidationOrchestrator } from './ModuleValidationOrchestrator';

// Main verification systems
export { 
  AutomatedVerificationOrchestrator,
  automatedVerification
} from './AutomatedVerificationOrchestrator';

export { 
  EnhancedIntegrationOrchestrator,
  enhancedIntegrationOrchestrator
} from './EnhancedIntegrationOrchestrator';

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

// Export all types
export type * from './CoreVerificationOrchestrator';
export type * from './VerificationSummaryGenerator';
export type * from './UnusedCodeDetector';
export type * from './DependencyManager';
export type * from './DocumentationConsistencyChecker';
export type * from './DatabaseMigrationSafetyChecker';
export type * from './EnvironmentConfigValidator';
export type * from './ComponentPropValidator';
export type * from './BundleSizeAnalyzer';
export type * from './AccessibilityComplianceChecker';
export type * from './ApiContractValidator';
export type * from './ApiContractIntegration';
export type * from './MergeVerificationHandler';
export type * from './DatabaseGuidelinesValidator';
export type * from './DatabaseSchemaValidator';
export type * from './PerformanceMonitor';
export type * from './SecurityScanner';
export type * from './CodeQualityAnalyzer';
export type * from './ComponentRegistryScanner';
export type * from './TypeScriptDatabaseValidator';
export type * from './SimplifiedValidator';
export type * from './AutomatedVerificationOrchestrator';
export type * from './EnhancedIntegrationOrchestrator';

// Global initialization
if (typeof window !== 'undefined') {
  console.log('🚀 REFACTORED VERIFICATION SYSTEM INITIALIZING...');
  
  (window as any).automaticVerification = {
    validate: validateBeforeImplementation,
    validateWithMergeDetection,
    getSummary: getCompleteVerificationSummary,
    createModule: createModuleWithAutomaticValidation,
    generateTemplate: generateCodeFromTemplate,
    isAutomatic: true,
    isRefactored: true,
    isModular: true
  };
  
  console.log('✅ REFACTORED VERIFICATION SYSTEM READY');
}
