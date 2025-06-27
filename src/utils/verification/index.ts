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

// Automated verification system
import { 
  AutomatedVerificationOrchestrator, 
  automatedVerification 
} from './AutomatedVerificationOrchestrator';

// Simplified types
import type { ValidationRequest, ValidationResult } from './SimplifiedValidator';
import type { VerificationSummary, AutomatedVerificationConfig } from './AutomatedVerificationOrchestrator';

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

// Export automated verification system (NEW)
export { 
  AutomatedVerificationOrchestrator,
  automatedVerification
};

// Export simplified types (RECOMMENDED)
export type { 
  ValidationRequest, 
  ValidationResult,
  VerificationSummary,
  AutomatedVerificationConfig
};

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
  console.log('🚀 Running automated pre-implementation validation...');
  
  // Use automated verification system
  const summary = await automatedVerification.verifyBeforeCreation(request);
  
  console.log('📋 Automated Validation Summary:');
  console.log(`   Issues: ${summary.issuesFound}`);
  console.log(`   Critical: ${summary.criticalIssues}`);
  console.log(`   Auto-fixes: ${summary.autoFixesApplied}`);
  console.log(`   Can Proceed: ${summary.validationResult.canProceed}`);
  
  return {
    validationSummary: summary,
    implementationPlan: summary.recommendations,
    canProceed: summary.validationResult.canProceed
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
      alignmentIssues: typescriptAlignment.missingTables.length + typescriptAlignment.typeConflicts.length,
      automatedVerificationActive: automatedVerification.getStatus().isRunning
    },
    componentInventory,
    typescriptAlignment,
    verificationStatus: automatedVerification.getStatus()
  };
};
