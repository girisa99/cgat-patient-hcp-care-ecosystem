/**
 * Fully Automated Verification System - Main Export (Enhanced with Database Guidelines)
 * 
 * Zero manual intervention required - all verification is automatic
 */

// Main automated verification system (RECOMMENDED)
import { 
  AutomatedVerificationOrchestrator, 
  automatedVerification 
} from './AutomatedVerificationOrchestrator';

// Enhanced database guidelines validator
import { 
  DatabaseGuidelinesValidator,
  DatabaseValidationResult,
  DatabaseGuideline,
  DatabaseViolation,
  WorkflowSuggestion
} from './DatabaseGuidelinesValidator';

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

// ===== MAIN EXPORTS (FULLY AUTOMATIC WITH DATABASE VALIDATION) =====

/**
 * AUTOMATIC verification system - NO MANUAL INTERVENTION REQUIRED
 * Now includes comprehensive database guidelines validation
 */
export { 
  AutomatedVerificationOrchestrator,
  automatedVerification,
  DatabaseGuidelinesValidator // NEW
};

/**
 * AUTOMATIC validation function with database guidelines - ALWAYS RUNS
 */
export const validateBeforeImplementation = async (request: ValidationRequest) => {
  console.log('🚀 AUTOMATIC PRE-IMPLEMENTATION VALIDATION (with Database Guidelines)...');
  
  // Enhanced verification system with database validation
  const canProceed = await automatedVerification.verifyBeforeCreation(request);
  const summary = JSON.parse(localStorage.getItem('verification-results') || '[]')[0];
  
  console.log('📋 ENHANCED AUTOMATIC VALIDATION SUMMARY:');
  console.log(`   Status: ${canProceed ? 'APPROVED' : 'BLOCKED'}`);
  console.log(`   Issues: ${summary?.issuesFound || 0}`);
  console.log(`   Critical: ${summary?.criticalIssues || 0}`);
  console.log(`   Auto-fixes: ${summary?.autoFixesApplied || 0}`);
  console.log(`   Database Issues: ${summary?.databaseValidation?.violations?.length || 0}`);
  console.log(`   SQL Auto-fixes: ${summary?.sqlAutoFixes?.length || 0}`);
  console.log(`   Workflow Suggestions: ${summary?.workflowSuggestions?.length || 0}`);
  
  return {
    validationSummary: summary || null,
    implementationPlan: summary?.recommendations || [],
    databaseGuidelines: summary?.databaseValidation || null,
    sqlAutoFixes: summary?.sqlAutoFixes || [],
    workflowSuggestions: summary?.workflowSuggestions || [],
    canProceed,
    automatic: true,
    enhanced: true // Indicates enhanced validation with database guidelines
  };
};

/**
 * Get enhanced automatic verification summary with database info
 */
export const getAutomaticVerificationSummary = async () => {
  const componentInventory = await ComponentRegistryScanner.scanAllComponents();
  const typescriptAlignment = await TypeScriptDatabaseValidator.validateCompleteAlignment();
  const verificationStatus = automatedVerification.getStatus();
  
  // Run database validation
  const databaseValidation = await DatabaseGuidelinesValidator.validateDatabase();

  return {
    summary: {
      totalComponents: componentInventory.hooks.length + componentInventory.components.length + componentInventory.templates.length,
      reusableHooks: componentInventory.hooks.filter(h => h.reusable).length,
      reusableComponents: componentInventory.components.filter(c => c.reusable).length,
      availableTemplates: componentInventory.templates.length,
      typescriptAlignment: typescriptAlignment.isAligned,
      alignmentIssues: typescriptAlignment.missingTables.length + typescriptAlignment.typeConflicts.length,
      automatedVerificationActive: verificationStatus.isRunning,
      databaseValidation: databaseValidation.isValid,
      databaseIssues: databaseValidation.violations.length,
      workflowSuggestions: databaseValidation.workflowSuggestions.length,
      isFullyAutomatic: true,
      lastScan: verificationStatus.lastScanTimestamp,
      enhanced: true
    },
    componentInventory,
    typescriptAlignment,
    databaseValidation,
    verificationStatus,
    isAutomatic: true,
    isEnhanced: true
  };
};

/**
 * AUTOMATIC module validation with database guidelines (ALWAYS RUNS)
 */
export const createModuleWithAutomaticValidation = async (config: any) => {
  console.log('🔍 ENHANCED AUTOMATIC MODULE VALIDATION (with Database Guidelines) for:', config.moduleName);
  
  const request: ValidationRequest = {
    tableName: config.tableName,
    moduleName: config.moduleName,
    componentType: 'module',
    description: `Module for ${config.tableName} table with database validation`
  };
  
  const canProceed = await automatedVerification.verifyBeforeCreation(request);
  
  if (!canProceed) {
    throw new Error('Module creation blocked by enhanced automatic verification system (including database guidelines)');
  }
  
  console.log('✅ Module creation approved by enhanced automatic verification (including database guidelines)');
  return { approved: true, automatic: true, enhanced: true };
};

// Export enhanced types
export type { 
  DatabaseValidationResult,
  DatabaseGuideline,
  DatabaseViolation,
  WorkflowSuggestion
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

// ===== GLOBAL INITIALIZATION (ENHANCED AUTOMATIC) =====

if (typeof window !== 'undefined') {
  console.log('🚀 ENHANCED AUTOMATIC VERIFICATION SYSTEM INITIALIZING (with Database Guidelines)...');
  
  // Enhanced global verification function
  (window as any).automaticVerification = {
    validate: validateBeforeImplementation,
    getSummary: getAutomaticVerificationSummary,
    createModule: createModuleWithAutomaticValidation,
    validateDatabase: DatabaseGuidelinesValidator.validateDatabase,
    isAutomatic: true,
    isEnhanced: true,
    includesDatabaseGuidelines: true
  };
  
  console.log('✅ ENHANCED AUTOMATIC VERIFICATION SYSTEM READY');
  console.log('ℹ️  NO MANUAL INTERVENTION REQUIRED - ALL VERIFICATION IS AUTOMATIC');
  console.log('🗄️  INCLUDES DATABASE GUIDELINES, RLS VALIDATION, AND WORKFLOW SUGGESTIONS');
}
