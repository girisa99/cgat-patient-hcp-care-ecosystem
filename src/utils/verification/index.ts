
/**
 * Pre-Implementation Verification System - Main Export
 * 
 * This is the main entry point for the comprehensive verification system
 * that ensures compliance with knowledge base guidelines before any implementation.
 */

// Main pre-implementation checker
import { PreImplementationChecker } from './PreImplementationChecker';
import { validateModuleCreation, validateComponentCreation, validateHookCreation } from './PreImplementationChecker';

// Component scanners
import { ComponentScanner } from './ComponentScanner';
import { TypeScriptValidator } from './TypeScriptValidator';
import { DatabaseAlignmentValidator } from './DatabaseAlignmentValidator';
import { GuidelinesValidator } from './GuidelinesValidator';

// Types
import type { 
  PreImplementationCheckResult, 
  ComponentScanResult, 
  TypeScriptValidationResult, 
  DatabaseAlignmentResult,
  PatternEnforcementResult,
  TemplateRecommendation,
  VerificationRequest
} from './types';

// Component registry scanner
import { ComponentRegistryScanner } from './ComponentRegistryScanner';
import type { ComponentInventory, HookInventory, ComponentInfo, TemplateInventory, UtilityInventory } from './ComponentRegistryScanner';

// TypeScript-Database validator
import { TypeScriptDatabaseValidator, validateTableSchema, ensureTypescriptDatabaseAlignment } from './TypeScriptDatabaseValidator';
import type { TypeScriptDatabaseAlignment, TypeConflict } from './TypeScriptDatabaseValidator';

// Template enforcement
import { TemplateEnforcement, enforceTemplateUsage } from './TemplateEnforcement';

// Export main pre-implementation checker
export { PreImplementationChecker, validateModuleCreation, validateComponentCreation, validateHookCreation };

// Export component scanners
export { ComponentScanner, TypeScriptValidator, DatabaseAlignmentValidator, GuidelinesValidator };

// Export types
export type { 
  PreImplementationCheckResult, 
  ComponentScanResult, 
  TypeScriptValidationResult, 
  DatabaseAlignmentResult,
  PatternEnforcementResult,
  TemplateRecommendation,
  VerificationRequest
};

// Export component registry scanner
export { ComponentRegistryScanner };
export type { ComponentInventory, HookInventory, ComponentInfo, TemplateInventory, UtilityInventory };

// Export TypeScript-Database validator
export { TypeScriptDatabaseValidator, validateTableSchema, ensureTypescriptDatabaseAlignment };
export type { TypeScriptDatabaseAlignment, TypeConflict };

// Export template enforcement
export { TemplateEnforcement, enforceTemplateUsage };

/**
 * Quick validation function - runs all pre-implementation checks
 */
export const runPreImplementationChecks = async (request: VerificationRequest) => {
  console.log('🚀 Running complete pre-implementation verification...');
  
  const result = await PreImplementationChecker.runPreFlightCheck(request);
  const plan = PreImplementationChecker.generateImplementationPlan(result);
  
  console.log('📋 Implementation Plan:');
  plan.forEach(item => console.log(item));
  
  return {
    checkResult: result,
    implementationPlan: plan,
    canProceed: result.canProceed
  };
};

/**
 * Verification summary for developers
 */
export const getVerificationSummary = async () => {
  const [
    componentInventory,
    typescriptAlignment
  ] = await Promise.all([
    ComponentRegistryScanner.scanAllComponents(),
    TypeScriptDatabaseValidator.validateCompleteAlignment()
  ]);

  return {
    summary: {
      totalComponents: componentInventory.hooks.length + componentInventory.components.length + componentInventory.templates.length,
      reusableHooks: componentInventory.hooks.filter(h => h.reusable).length,
      reusableComponents: componentInventory.components.filter(c => c.reusable).length,
      availableTemplates: componentInventory.templates.length,
      typescriptAlignment: typescriptAlignment.isAligned,
      alignmentIssues: typescriptAlignment.missingTables.length + typescriptAlignment.typeConflicts.length
    },
    componentInventory,
    typescriptAlignment
  };
};
