/**
 * Simplified Verification System - Main Export
 * 
 * Streamlined verification system that maintains core functionality
 * while reducing complexity and improving maintainability.
 */

// Main simplified validator
import { 
  SimplifiedValidator, 
  validateModuleCreation, 
  validateComponentCreation, 
  validateHookCreation,
  runSimplifiedValidation
} from './SimplifiedValidator';

// Simplified types
import type { ValidationRequest, ValidationResult } from './SimplifiedValidator';

// Keep legacy components for backward compatibility but mark as deprecated
import { PreImplementationChecker } from './PreImplementationChecker';
import { ComponentScanner } from './ComponentScanner';
import { TypeScriptValidator } from './TypeScriptValidator';
import { DatabaseAlignmentValidator } from './DatabaseAlignmentValidator';
import { GuidelinesValidator } from './GuidelinesValidator';

// Component registry scanner (still useful)
import { ComponentRegistryScanner } from './ComponentRegistryScanner';
import type { ComponentInventory, HookInventory, ComponentInfo, TemplateInventory, UtilityInventory } from './ComponentRegistryScanner';

// TypeScript-Database validator (simplified version)
import { TypeScriptDatabaseValidator, validateTableSchema, ensureTypescriptDatabaseAlignment } from './TypeScriptDatabaseValidator';
import type { TypeScriptDatabaseAlignment, TypeConflict } from './TypeScriptDatabaseValidator';

// Template enforcement (simplified)
import { TemplateEnforcement, enforceTemplateUsage } from './TemplateEnforcement';

// Export main simplified validator (RECOMMENDED)
export { 
  SimplifiedValidator, 
  validateModuleCreation, 
  validateComponentCreation, 
  validateHookCreation,
  runSimplifiedValidation
};

// Export simplified types (RECOMMENDED)
export type { ValidationRequest, ValidationResult };

// Export component registry scanner (still useful)
export { ComponentRegistryScanner };
export type { ComponentInventory, HookInventory, ComponentInfo, TemplateInventory, UtilityInventory };

// Export essential utilities
export { validateTableSchema, ensureTypescriptDatabaseAlignment };
export type { TypeScriptDatabaseAlignment, TypeConflict };

// Export template enforcement
export { TemplateEnforcement, enforceTemplateUsage };

// Legacy exports (DEPRECATED - use SimplifiedValidator instead)
export { 
  PreImplementationChecker, 
  ComponentScanner, 
  TypeScriptValidator, 
  DatabaseAlignmentValidator, 
  GuidelinesValidator 
};

/**
 * Quick validation function - RECOMMENDED APPROACH
 */
export const validateBeforeImplementation = async (request: ValidationRequest) => {
  console.log('🚀 Running simplified pre-implementation validation...');
  
  const result = SimplifiedValidator.validate(request);
  const plan = SimplifiedValidator.generateImplementationPlan(result);
  
  console.log('📋 Validation Summary:');
  plan.forEach(item => console.log(item));
  
  return {
    validationResult: result,
    implementationPlan: plan,
    canProceed: result.canProceed
  };
};

/**
 * Simplified validation summary for developers
 */
export const getSimplifiedValidationSummary = async () => {
  const componentInventory = await ComponentRegistryScanner.scanAllComponents();
  const typescriptAlignment = await TypeScriptDatabaseValidator.validateCompleteAlignment();

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
