
/**
 * Fully Automated Verification System - Main Export
 * 
 * Zero manual intervention required - all verification is automatic
 */

// Main automated verification system (RECOMMENDED)
import { 
  AutomatedVerificationOrchestrator, 
  automatedVerification 
} from './AutomatedVerificationOrchestrator';

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

// ===== MAIN EXPORTS (FULLY AUTOMATIC) =====

/**
 * AUTOMATIC verification system - NO MANUAL INTERVENTION REQUIRED
 */
export { 
  AutomatedVerificationOrchestrator,
  automatedVerification // Global singleton - auto-starts
};

/**
 * AUTOMATIC validation function - ALWAYS RUNS
 * This is the ONLY function you need for validation
 */
export const validateBeforeImplementation = async (request: ValidationRequest) => {
  console.log('🚀 AUTOMATIC PRE-IMPLEMENTATION VALIDATION...');
  
  // Uses fully automated verification system
  const canProceed = await automatedVerification.verifyBeforeCreation(request);
  const summary = JSON.parse(localStorage.getItem('verification-results') || '[]')[0];
  
  console.log('📋 AUTOMATIC VALIDATION SUMMARY:');
  console.log(`   Status: ${canProceed ? 'APPROVED' : 'BLOCKED'}`);
  console.log(`   Issues: ${summary?.issuesFound || 0}`);
  console.log(`   Critical: ${summary?.criticalIssues || 0}`);
  console.log(`   Auto-fixes: ${summary?.autoFixesApplied || 0}`);
  
  return {
    validationSummary: summary || null,
    implementationPlan: summary?.recommendations || [],
    canProceed,
    automatic: true // Indicates this was fully automatic
  };
};

/**
 * Get automatic verification summary (ALWAYS AVAILABLE)
 */
export const getAutomaticVerificationSummary = async () => {
  const componentInventory = await ComponentRegistryScanner.scanAllComponents();
  const typescriptAlignment = await TypeScriptDatabaseValidator.validateCompleteAlignment();
  const verificationStatus = automatedVerification.getStatus();

  return {
    summary: {
      totalComponents: componentInventory.hooks.length + componentInventory.components.length + componentInventory.templates.length,
      reusableHooks: componentInventory.hooks.filter(h => h.reusable).length,
      reusableComponents: componentInventory.components.filter(c => c.reusable).length,
      availableTemplates: componentInventory.templates.length,
      typescriptAlignment: typescriptAlignment.isAligned,
      alignmentIssues: typescriptAlignment.missingTables.length + typescriptAlignment.typeConflicts.length,
      automatedVerificationActive: verificationStatus.isRunning,
      isFullyAutomatic: true,
      lastScan: verificationStatus.lastScanTimestamp
    },
    componentInventory,
    typescriptAlignment,
    verificationStatus,
    isAutomatic: true
  };
};

/**
 * AUTOMATIC module validation (ALWAYS RUNS)
 */
export const createModuleWithAutomaticValidation = async (config: any) => {
  console.log('🔍 AUTOMATIC MODULE VALIDATION for:', config.moduleName);
  
  const request: ValidationRequest = {
    tableName: config.tableName,
    moduleName: config.moduleName,
    componentType: 'module',
    description: `Module for ${config.tableName} table`
  };
  
  const canProceed = await automatedVerification.verifyBeforeCreation(request);
  
  if (!canProceed) {
    throw new Error('Module creation blocked by automatic verification system');
  }
  
  console.log('✅ Module creation approved by automatic verification');
  return { approved: true, automatic: true };
};

// ===== SUPPORTING EXPORTS =====

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

// ===== GLOBAL INITIALIZATION (AUTOMATIC) =====

// Ensure the automatic system is initialized
if (typeof window !== 'undefined') {
  console.log('🚀 AUTOMATIC VERIFICATION SYSTEM INITIALIZING...');
  
  // Global verification function available everywhere
  (window as any).automaticVerification = {
    validate: validateBeforeImplementation,
    getSummary: getAutomaticVerificationSummary,
    createModule: createModuleWithAutomaticValidation,
    isAutomatic: true
  };
  
  console.log('✅ AUTOMATIC VERIFICATION SYSTEM READY');
  console.log('ℹ️  NO MANUAL INTERVENTION REQUIRED - ALL VERIFICATION IS AUTOMATIC');
}
