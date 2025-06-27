/**
 * Enhanced Automated Verification System - Main Export 
 * 
 * NOW INCLUDES: Database Guidelines, Schema Validation, Performance Monitoring,
 * Security Scanning, Code Quality Analysis, and Template-based Generation
 * 
 * Zero manual intervention required - all verification is automatic and comprehensive
 */

// Main enhanced automated verification system (RECOMMENDED)
import { 
  AutomatedVerificationOrchestrator, 
  automatedVerification,
  TemplateGenerationRequest,
  TemplateGenerationResult
} from './AutomatedVerificationOrchestrator';

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

// Component registry scanner (still useful for analysis)
import { ComponentRegistryScanner } from './ComponentRegistryScanner';
import type { ComponentInventory, HookInventory, ComponentInfo, TemplateInventory, UtilityInventory } from './ComponentRegistryScanner';

// Utility functions
import { TypeScriptDatabaseValidator, validateTableSchema, ensureTypescriptDatabaseAlignment } from './TypeScriptDatabaseValidator';
import type { TypeScriptDatabaseAlignment, TypeConflict } from './TypeScriptDatabaseValidator';

// Template enforcement
import { TemplateEnforcement, enforceTemplateUsage } from './TemplateEnforcement';

// Legacy components (DEPRECATED - kept for backward compatibility)
import { PreImplementationChecker } from './PreImplementationChecker';
import { ComponentScanner } from './ComponentScanner';
import { TypeScriptValidator } from './TypeScriptValidator';
import { DatabaseAlignmentValidator } from './DatabaseAlignmentValidator';
import { GuidelinesValidator } from './GuidelinesValidator';

// ===== MAIN EXPORTS (ENHANCED AUTOMATIC WITH ALL FEATURES) =====

/**
 * ENHANCED AUTOMATIC verification system - NO MANUAL INTERVENTION REQUIRED
 * Now includes: Database, Schema, Performance, Security, Quality, and Template Generation
 */
export { 
  AutomatedVerificationOrchestrator,
  automatedVerification,
  DatabaseGuidelinesValidator,
  DatabaseSchemaValidator,
  PerformanceMonitor,
  performanceMonitor,
  SecurityScanner,
  CodeQualityAnalyzer
};

/**
 * ENHANCED AUTOMATIC validation function - COMPREHENSIVE CHECKS
 */
export const validateBeforeImplementation = async (request: ValidationRequest) => {
  console.log('🚀 ENHANCED AUTOMATIC PRE-IMPLEMENTATION VALIDATION...');
  console.log('🔍 Running: Database + Schema + Performance + Security + Quality checks');
  
  // Enhanced verification system with all capabilities
  const canProceed = await automatedVerification.verifyBeforeCreation(request);
  const summary = JSON.parse(localStorage.getItem('verification-results') || '[]')[0];
  
  console.log('📋 COMPREHENSIVE AUTOMATIC VALIDATION SUMMARY:');
  console.log(`   Status: ${canProceed ? 'APPROVED' : 'BLOCKED'}`);
  console.log(`   Overall Health Score: ${summary?.overallHealthScore || 'N/A'}/100`);
  console.log(`   Security Score: ${summary?.securityScore || 'N/A'}/100`);
  console.log(`   Quality Score: ${summary?.qualityScore || 'N/A'}/100`);
  console.log(`   Performance Score: ${summary?.performanceScore || 'N/A'}/100`);
  console.log(`   Issues: ${summary?.issuesFound || 0}`);
  console.log(`   Critical: ${summary?.criticalIssues || 0}`);
  console.log(`   Auto-fixes: ${summary?.autoFixesApplied || 0}`);
  console.log(`   SQL Auto-fixes: ${summary?.sqlAutoFixes?.length || 0}`);
  console.log(`   Workflow Suggestions: ${summary?.workflowSuggestions?.length || 0}`);
  
  return {
    validationSummary: summary || null,
    implementationPlan: summary?.recommendations || [],
    databaseGuidelines: summary?.databaseValidation || null,
    schemaValidation: summary?.schemaValidation || null,
    performanceMetrics: summary?.performanceMetrics || null,
    securityScan: summary?.securityScan || null,
    codeQuality: summary?.codeQuality || null,
    sqlAutoFixes: summary?.sqlAutoFixes || [],
    workflowSuggestions: summary?.workflowSuggestions || [],
    overallHealthScore: summary?.overallHealthScore || 0,
    canProceed,
    automatic: true,
    enhanced: true,
    comprehensive: true // NEW indicator
  };
};

/**
 * NEW: Enhanced template-based code generation
 */
export const generateCodeFromTemplate = async (request: TemplateGenerationRequest): Promise<TemplateGenerationResult> => {
  console.log('🎯 GENERATING CODE FROM TEMPLATE:', request.templateType);
  return await automatedVerification.generateFromTemplate(request);
};

/**
 * Get comprehensive automatic verification summary with all metrics
 */
export const getAutomaticVerificationSummary = async () => {
  const componentInventory = await ComponentRegistryScanner.scanAllComponents();
  const typescriptAlignment = await TypeScriptDatabaseValidator.validateCompleteAlignment();
  const verificationStatus = automatedVerification.getStatus();
  
  // Run comprehensive validation
  const databaseValidation = await DatabaseGuidelinesValidator.validateDatabase();
  const schemaValidation = await DatabaseSchemaValidator.validateSchema();
  const securityScan = await SecurityScanner.performSecurityScan();
  const codeQuality = await CodeQualityAnalyzer.analyzeCodeQuality();
  const performanceMetrics = await performanceMonitor.getPerformanceMetrics();

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
      securityVulnerabilities: securityScan.vulnerabilities.length,
      qualityScore: codeQuality.overallScore,
      qualityIssues: codeQuality.issues.length,
      performanceMonitoring: performanceMonitor.getStatus().isMonitoring,
      
      workflowSuggestions: databaseValidation.workflowSuggestions.length,
      isFullyAutomatic: true,
      isEnhanced: true,
      isComprehensive: true, // NEW
      lastScan: verificationStatus.lastScanTimestamp,
      
      // Overall health calculation
      overallHealthScore: Math.round((
        (databaseValidation.isValid ? 25 : 0) +
        (schemaValidation.isValid ? 25 : 0) +
        (securityScan.securityScore * 0.25) +
        (codeQuality.overallScore * 0.25)
      ))
    },
    componentInventory,
    typescriptAlignment,
    databaseValidation,
    schemaValidation,
    securityScan,
    codeQuality,
    performanceMetrics,
    verificationStatus,
    isAutomatic: true,
    isEnhanced: true,
    isComprehensive: true
  };
};

/**
 * ENHANCED AUTOMATIC module validation with comprehensive checks
 */
export const createModuleWithAutomaticValidation = async (config: any) => {
  console.log('🔍 COMPREHENSIVE AUTOMATIC MODULE VALIDATION for:', config.moduleName);
  
  const request: ValidationRequest = {
    tableName: config.tableName,
    moduleName: config.moduleName,
    componentType: 'module',
    description: `Enhanced module validation for ${config.tableName} table with comprehensive checks`
  };
  
  const canProceed = await automatedVerification.verifyBeforeCreation(request);
  
  if (!canProceed) {
    throw new Error('Module creation blocked by comprehensive automatic verification system');
  }
  
  console.log('✅ Module creation approved by comprehensive automatic verification');
  return { approved: true, automatic: true, enhanced: true, comprehensive: true };
};

// Export enhanced types
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
  TemplateGenerationResult
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
  TemplateEnforcement, 
  enforceTemplateUsage
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

// ===== ENHANCED GLOBAL INITIALIZATION =====

if (typeof window !== 'undefined') {
  console.log('🚀 COMPREHENSIVE AUTOMATIC VERIFICATION SYSTEM INITIALIZING...');
  console.log('🔍 INCLUDING: Database + Schema + Performance + Security + Quality + Templates');
  
  // Enhanced global verification functions
  (window as any).automaticVerification = {
    validate: validateBeforeImplementation,
    getSummary: getAutomaticVerificationSummary,
    createModule: createModuleWithAutomaticValidation,
    generateTemplate: generateCodeFromTemplate,
    validateDatabase: DatabaseGuidelinesValidator.validateDatabase,
    validateSchema: DatabaseSchemaValidator.validateSchema,
    scanSecurity: SecurityScanner.performSecurityScan,
    analyzeQuality: CodeQualityAnalyzer.analyzeCodeQuality,
    monitorPerformance: () => performanceMonitor.getPerformanceMetrics(),
    isAutomatic: true,
    isEnhanced: true,
    isComprehensive: true,
    includesAllFeatures: true
  };
  
  console.log('✅ COMPREHENSIVE AUTOMATIC VERIFICATION SYSTEM READY');
  console.log('ℹ️  NO MANUAL INTERVENTION REQUIRED - ALL VERIFICATION IS AUTOMATIC AND COMPREHENSIVE');
  console.log('🎯 INCLUDES: Database Guidelines + Schema Validation + Performance Monitoring + Security Scanning + Code Quality Analysis + Template Generation');
}
