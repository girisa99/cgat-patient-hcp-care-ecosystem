/**
 * Enhanced Automated Verification System - Main Export 
 * 
 * NOW FULLY INTEGRATED: Merge Detection, Duplicate Integration, Template Enforcement,
 * Database Guidelines, Schema Validation, Performance Monitoring, Security Scanning,
 * Code Quality Analysis, Template-based Generation, and API CONTRACT VALIDATION
 * 
 * Zero manual intervention required - all verification is automatic and comprehensive
 */

// ENHANCED MAIN SYSTEM - Now includes merge detection and full integration
import { 
  AutomatedVerificationOrchestrator, 
  automatedVerification,
  TemplateGenerationRequest,
  TemplateGenerationResult
} from './AutomatedVerificationOrchestrator';

// NEW: Enhanced Integration System with merge detection
import { 
  EnhancedIntegrationOrchestrator,
  enhancedIntegrationOrchestrator,
  EnhancedIntegrationResult
} from './EnhancedIntegrationOrchestrator';

// NEW: Merge Verification (previously missing)
import {
  MergeVerificationHandler,
  MergeConflict,
  MergeVerificationResult,
  MergeAutoResolution
} from './MergeVerificationHandler';

// NEW: API Contract Validation (FIXED IMPORTS)
import {
  ApiContractValidator,
  apiContractValidator,
  ContractValidationResult,
  ContractViolation,
  ContractWarning,
  ApiContract
} from './ApiContractValidator';

import {
  ApiContractIntegration,
  apiContractIntegration,
  ContractIntegrationResult
} from './ApiContractIntegration';

// Enhanced comprehensive validators
import { 
  DatabaseGuidelinesValidator,
  DatabaseValidationResult,
  DatabaseGuideline,
  DatabaseViolation,
  WorkflowSuggestion
} from './DatabaseGuidelinesValidator';

import {
  DatabaseSchemaValidator,
  SchemaValidationResult,
  SchemaViolation,
  SchemaAutoFix
} from './DatabaseSchemaValidator';

import {
  PerformanceMonitor,
  PerformanceMetrics,
  PerformanceRecommendation,
  performanceMonitor
} from './PerformanceMonitor';

import {
  SecurityScanner,
  SecurityScanResult,
  SecurityVulnerability,
  SecurityRecommendation
} from './SecurityScanner';

import {
  CodeQualityAnalyzer,
  CodeQualityResult,
  CodeQualityMetrics,
  CodeQualityRecommendation
} from './CodeQualityAnalyzer';

// ENHANCED INTEGRATION: Duplicate Detection (now fully integrated)
import { DuplicateDetector, detectDuplicates } from './DuplicateDetector';

// ENHANCED INTEGRATION: Template Enforcement (now fully integrated) - FIXED: Single import
import { TemplateEnforcement, enforceTemplateUsage } from './TemplateEnforcement';

// Simplified validator (used internally by automation)
import { 
  SimplifiedValidator, 
  validateModuleCreation, 
  validateComponentCreation, 
  validateHookCreation,
  runSimplifiedValidation
} from './SimplifiedValidator';

// Types
import type { ValidationRequest, ValidationResult } from './SimplifiedValidator';
import type { VerificationSummary, AutomatedVerificationConfig } from './AutomatedVerificationOrchestrator';

// Component registry scanner
import { ComponentRegistryScanner } from './ComponentRegistryScanner';
import type { ComponentInventory, HookInventory, ComponentInfo, TemplateInventory, UtilityInventory } from './ComponentRegistryScanner';

// Utility functions
import { TypeScriptDatabaseValidator, validateTableSchema, ensureTypescriptDatabaseAlignment } from './TypeScriptDatabaseValidator';
import type { TypeScriptDatabaseAlignment, TypeConflict } from './TypeScriptDatabaseValidator';

// Legacy components (DEPRECATED - kept for backward compatibility)
import { PreImplementationChecker } from './PreImplementationChecker';
import { ComponentScanner } from './ComponentScanner';
import { TypeScriptValidator } from './TypeScriptValidator';
import { DatabaseAlignmentValidator } from './DatabaseAlignmentValidator';
import { GuidelinesValidator } from './GuidelinesValidator';

// ===== MAIN EXPORTS (FULLY INTEGRATED AUTOMATIC SYSTEM + API CONTRACT VALIDATION) =====

/**
 * FULLY INTEGRATED AUTOMATIC verification system - INCLUDES API CONTRACT VALIDATION
 */
export { 
  AutomatedVerificationOrchestrator,
  automatedVerification,
  EnhancedIntegrationOrchestrator,
  enhancedIntegrationOrchestrator,
  MergeVerificationHandler,
  DatabaseGuidelinesValidator,
  DatabaseSchemaValidator,
  PerformanceMonitor,
  performanceMonitor,
  SecurityScanner,
  CodeQualityAnalyzer,
  DuplicateDetector,
  TemplateEnforcement,
  // NEW: API Contract Validation
  ApiContractValidator,
  apiContractValidator,
  ApiContractIntegration,
  apiContractIntegration
};

/**
 * ENHANCED AUTOMATIC validation function - WITH API CONTRACT VALIDATION
 */
export const validateBeforeImplementation = async (request: ValidationRequest) => {
  console.log('🚀 ENHANCED AUTOMATIC PRE-IMPLEMENTATION VALIDATION...');
  console.log('🔍 Running: API Contract Validation + Merge Detection + Duplicate Integration + Template Enforcement + Database + Security + Quality');
  
  // Initialize API contract validation if needed
  await apiContractIntegration.initializeContractValidation();
  
  // Use enhanced integration orchestrator for complete verification
  const result = await enhancedIntegrationOrchestrator.performIntegratedVerification(request);
  
  // Add API contract validation results
  const contractResults = await apiContractIntegration.performContractValidation();
  
  console.log('📋 ENHANCED AUTOMATIC VALIDATION SUMMARY:');
  console.log(`   Status: ${result.overallStatus.toUpperCase()}`);
  console.log(`   Contract Status: ${contractResults.integrationStatus.toUpperCase()}`);
  console.log(`   Merge Conflicts: ${result.mergeVerification.conflicts.length}`);
  console.log(`   Duplicates: ${result.duplicateDetection.length}`);
  console.log(`   Contract Issues: ${contractResults.actionItems.length}`);
  console.log(`   Auto-fixes: ${result.autoFixesApplied}`);
  console.log(`   Critical Issues: ${result.criticalIssues.length}`);
  
  return {
    validationSummary: result,
    contractValidation: contractResults,
    implementationPlan: result.recommendations,
    mergeVerification: result.mergeVerification,
    duplicateDetection: result.duplicateDetection,
    templateEnforcement: result.templateEnforcement,
    overallStatus: result.overallStatus,
    canProceed: result.overallStatus !== 'blocked' && contractResults.integrationStatus !== 'critical',
    automatic: true,
    enhanced: true,
    fullyIntegrated: true,
    hasApiContractValidation: true // NEW indicator
  };
};

/**
 * NEW: Enhanced merge-aware validation with full integration
 */
export const validateWithMergeDetection = async (request: ValidationRequest) => {
  console.log('🔀 MERGE-AWARE VALIDATION WITH FULL INTEGRATION...');
  
  const mergeHandler = new MergeVerificationHandler();
  const targetPath = request.componentType === 'hook' ? 
    `src/hooks/${request.moduleName}.tsx` : 
    `src/components/${request.moduleName}.tsx`;
    
  const mergeResult = await mergeHandler.detectMergeConflicts(
    request.moduleName || request.tableName, 
    targetPath
  );
  
  console.log(`🔀 Merge conflicts detected: ${mergeResult.conflicts.length}`);
  console.log(`🔧 Auto-resolutions available: ${mergeResult.autoResolutions.length}`);
  
  return {
    mergeResult,
    canProceed: !mergeResult.hasConflicts || mergeResult.autoResolutions.length > 0,
    report: mergeHandler.generateMergeReport(mergeResult)
  };
};

/**
 * Enhanced template-based code generation with merge detection
 */
export const generateCodeFromTemplate = async (request: TemplateGenerationRequest): Promise<TemplateGenerationResult> => {
  console.log('🎯 GENERATING CODE FROM TEMPLATE WITH MERGE DETECTION...');
  
  // Pre-check for merge conflicts
  if (request.moduleName) {
    const mergeValidation = await validateWithMergeDetection({
      tableName: request.tableName || '',
      moduleName: request.moduleName,
      componentType: request.templateType === 'api_integration' ? 'template' : request.templateType, // FIXED: Map api_integration to template
      description: `Template generation for ${request.moduleName}`
    });
    
    if (!mergeValidation.canProceed) {
      console.warn('⚠️ Merge conflicts detected, proceeding with caution...');
    }
  }
  
  return await automatedVerification.generateFromTemplate(request);
};

/**
 * Get comprehensive automatic verification summary with API contract validation
 */
export const getAutomaticVerificationSummary = async () => {
  const componentInventory = await ComponentRegistryScanner.scanAllComponents();
  const typescriptAlignment = await TypeScriptDatabaseValidator.validateCompleteAlignment();
  const verificationStatus = automatedVerification.getStatus();
  
  // Run comprehensive validation with new integrations
  const databaseValidation = await DatabaseGuidelinesValidator.validateDatabase();
  const schemaValidation = await DatabaseSchemaValidator.validateSchema();
  const securityScan = await SecurityScanner.performSecurityScan();
  const codeQuality = await CodeQualityAnalyzer.analyzeCodeQuality();
  const performanceMetrics = await performanceMonitor.getPerformanceMetrics();
  
  // API contract validation stats
  const contractResults = await apiContractIntegration.performContractValidation();
  
  // Duplicate integration stats
  const duplicateDetector = new DuplicateDetector();
  const duplicateStats = await duplicateDetector.getDuplicateStats();
  
  return {
    summary: {
      totalComponents: componentInventory.hooks.length + componentInventory.components.length + componentInventory.templates.length,
      reusableHooks: componentInventory.hooks.filter(h => h.reusable).length,
      reusableComponents: componentInventory.components.filter(c => c.reusable).length,
      availableTemplates: componentInventory.templates.length,
      typescriptAlignment: typescriptAlignment.isAligned,
      alignmentIssues: typescriptAlignment.missingTables.length + typescriptAlignment.typeConflicts.length,
      automatedVerificationActive: verificationStatus.isRunning,
      
      // Enhanced metrics
      databaseValidation: databaseValidation.isValid,
      databaseIssues: databaseValidation.violations.length,
      schemaValidation: schemaValidation.isValid,
      schemaIssues: schemaValidation.violations.length,
      securityScore: securityScan.securityScore,
      securityVulnerabilities: securityScan.vulnerabilities.length, // FIXED: Added securityScan prefix
      qualityScore: codeQuality.overallScore,
      qualityIssues: codeQuality.issues.length,
      performanceMonitoring: performanceMonitor.getStatus().isMonitoring,
      
      // Integration-specific metrics
      duplicateDetectionActive: true,
      totalDuplicates: duplicateStats.totalDuplicates,
      highRiskDuplicates: duplicateStats.highRiskDuplicates,
      templateEnforcementActive: true,
      mergeDetectionActive: true,
      
      // NEW: API Contract Validation metrics
      apiContractValidationActive: true,
      contractsValidated: contractResults.contractValidations.length,
      contractIssues: contractResults.actionItems.length,
      contractStatus: contractResults.integrationStatus,
      averageCompatibilityScore: contractResults.contractValidations.reduce((sum, v) => 
        sum + v.compatibilityScore, 0) / Math.max(contractResults.contractValidations.length, 1),
      
      workflowSuggestions: databaseValidation.workflowSuggestions.length,
      isFullyAutomatic: true,
      isEnhanced: true,
      isFullyIntegrated: true,
      hasMergeDetection: true,
      hasApiContractValidation: true, // NEW
      lastScan: verificationStatus.lastScanTimestamp,
      
      // Overall health calculation (enhanced with contract validation)
      overallHealthScore: Math.round((
        (databaseValidation.isValid ? 15 : 0) +
        (schemaValidation.isValid ? 15 : 0) +
        (securityScan.securityScore * 0.15) +
        (codeQuality.overallScore * 0.15) +
        (duplicateStats.totalDuplicates === 0 ? 15 : Math.max(0, 15 - duplicateStats.totalDuplicates * 2)) +
        (contractResults.integrationStatus === 'healthy' ? 25 : contractResults.integrationStatus === 'degraded' ? 15 : 0)
      ))
    },
    componentInventory,
    typescriptAlignment,
    databaseValidation,
    schemaValidation,
    securityScan,
    codeQuality,
    performanceMetrics,
    duplicateStats,
    contractResults, // NEW
    verificationStatus,
    isAutomatic: true,
    isEnhanced: true,
    isFullyIntegrated: true,
    hasApiContractValidation: true // NEW
  };
};

/**
 * FULLY INTEGRATED AUTOMATIC module validation with merge detection
 */
export const createModuleWithAutomaticValidation = async (config: any) => {
  console.log('🔍 FULLY INTEGRATED AUTOMATIC MODULE VALIDATION for:', config.moduleName);
  
  const request: ValidationRequest = {
    tableName: config.tableName,
    moduleName: config.moduleName,
    componentType: 'module',
    description: `Fully integrated module validation for ${config.tableName} table with merge detection`
  };
  
  const result = await enhancedIntegrationOrchestrator.performIntegratedVerification(request);
  
  if (result.overallStatus === 'blocked') {
    throw new Error('Module creation blocked by integrated verification system (including merge conflicts)');
  }
  
  console.log('✅ Module creation approved by fully integrated automatic verification');
  return { 
    approved: true, 
    automatic: true, 
    enhanced: true, 
    fullyIntegrated: true,
    mergeVerified: true,
    result 
  };
};

// Export enhanced types including API contract validation
export type { 
  DatabaseValidationResult,
  DatabaseGuideline,
  DatabaseViolation,
  WorkflowSuggestion,
  SchemaValidationResult,
  SchemaViolation,
  SchemaAutoFix,
  PerformanceMetrics,
  PerformanceRecommendation,
  SecurityScanResult,
  SecurityVulnerability,
  SecurityRecommendation,
  CodeQualityResult,
  CodeQualityMetrics,
  CodeQualityRecommendation,
  TemplateGenerationRequest,
  TemplateGenerationResult,
  EnhancedIntegrationResult,
  MergeConflict,
  MergeVerificationResult,
  MergeAutoResolution,
  // NEW: API Contract Validation types
  ContractValidationResult,
  ContractViolation,
  ContractWarning,
  ApiContract,
  ContractIntegrationResult
};

// Export types
export type { 
  ValidationRequest, 
  ValidationResult,
  VerificationSummary,
  AutomatedVerificationConfig,
  ComponentInventory, 
  HookInventory, 
  ComponentInfo, 
  TemplateInventory, 
  UtilityInventory,
  TypeScriptDatabaseAlignment, 
  TypeConflict
};

// Export utility functions (used internally)
export { 
  SimplifiedValidator,
  ComponentRegistryScanner,
  validateTableSchema, 
  ensureTypescriptDatabaseAlignment,
  enforceTemplateUsage // FIXED: Single export
};

// Export individual validation functions (for specific use cases)
export { 
  validateModuleCreation, 
  validateComponentCreation, 
  validateHookCreation,
  runSimplifiedValidation
};

// Legacy exports (DEPRECATED - use automatic system instead)
export { 
  PreImplementationChecker, 
  ComponentScanner, 
  TypeScriptValidator, 
  DatabaseAlignmentValidator, 
  GuidelinesValidator 
};

// ===== ENHANCED GLOBAL INITIALIZATION WITH API CONTRACT VALIDATION =====

if (typeof window !== 'undefined') {
  console.log('🚀 ENHANCED AUTOMATIC VERIFICATION SYSTEM INITIALIZING...');
  console.log('🔍 INCLUDING: API Contract Validation + Merge Detection + Duplicate Integration + Template Enforcement + Database + Security + Quality');
  
  // Enhanced global verification functions
  (window as any).automaticVerification = {
    validate: validateBeforeImplementation,
    validateWithMergeDetection,
    getSummary: getAutomaticVerificationSummary,
    createModule: createModuleWithAutomaticValidation,
    generateTemplate: generateCodeFromTemplate,
    detectDuplicates,
    enforceTemplates: enforceTemplateUsage,
    validateDatabase: DatabaseGuidelinesValidator.validateDatabase,
    validateSchema: DatabaseSchemaValidator.validateSchema,
    scanSecurity: SecurityScanner.performSecurityScan,
    analyzeQuality: CodeQualityAnalyzer.analyzeCodeQuality,
    monitorPerformance: () => performanceMonitor.getPerformanceMetrics(),
    // NEW: API Contract Validation functions
    validateContracts: () => apiContractIntegration.performContractValidation(),
    initializeContracts: () => apiContractIntegration.initializeContractValidation(),
    getContractReport: (result: ContractIntegrationResult) => apiContractIntegration.generateIntegrationReport(result),
    isAutomatic: true,
    isEnhanced: true,
    isFullyIntegrated: true,
    hasMergeDetection: true,
    hasApiContractValidation: true, // NEW
    includesAllFeatures: true
  };
  
  console.log('✅ ENHANCED AUTOMATIC VERIFICATION SYSTEM READY');
  console.log('ℹ️  NO MANUAL INTERVENTION REQUIRED - ALL VERIFICATION IS AUTOMATIC AND COMPREHENSIVE');
  console.log('🎯 INCLUDES: API Contract Validation + Merge Detection + Duplicate Integration + Template Enforcement + Database + Security + Quality + Template Generation');
}
