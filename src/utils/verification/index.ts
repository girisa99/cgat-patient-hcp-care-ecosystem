
/**
 * Pre-Implementation Verification System - Main Export
 * 
 * This is the main entry point for the comprehensive verification system
 * that ensures compliance with knowledge base guidelines before any implementation.
 */

// Main pre-implementation checker
export { PreImplementationChecker, validateModuleCreation, validateComponentCreation, validateHookCreation } from './PreImplementationChecker';
export type { PreImplementationCheckResult, ComponentScanResult, TypeScriptValidationResult, DatabaseAlignmentResult } from './PreImplementationChecker';

// Component registry scanner
export { ComponentRegistryScanner } from './ComponentRegistryScanner';
export type { ComponentInventory, HookInventory, ComponentInventory as ComponentInventoryType, TemplateInventory, UtilityInventory } from './ComponentRegistryScanner';

// TypeScript-Database validator
export { TypeScriptDatabaseValidator, validateTableSchema, ensureTypescriptDatabaseAlignment } from './TypeScriptDatabaseValidator';
export type { TypeScriptDatabaseAlignment, TypeConflict } from './TypeScriptDatabaseValidator';

/**
 * Quick validation function - runs all pre-implementation checks
 */
export const runPreImplementationChecks = async (request: {
  tableName?: string;
  moduleName?: string;
  componentType: 'hook' | 'component' | 'module' | 'template';
  description: string;
}) => {
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
