
/**
 * Simplified Validation System
 * Consolidates all validation logic into a single, streamlined validator
 */

import { validateTableExists, ModuleConfig } from '@/utils/moduleValidation';
import { moduleRegistry } from '@/utils/moduleRegistry';

export interface ValidationRequest {
  tableName?: string;
  moduleName?: string;
  componentType: 'hook' | 'component' | 'module' | 'template';
  description: string;
}

export interface ValidationResult {
  canProceed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  shouldUseTemplate: boolean;
  recommendedTemplate?: string;
}

/**
 * Simplified Validator Class
 * Single class that handles all validation concerns
 */
export class SimplifiedValidator {
  /**
   * Main validation method - runs all essential checks
   */
  static validate(request: ValidationRequest): ValidationResult {
    console.log('🔍 Running simplified validation check...');

    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let shouldUseTemplate = false;
    let recommendedTemplate: string | undefined;

    // 1. Table Validation
    if (request.tableName) {
      if (!validateTableExists(request.tableName)) {
        issues.push(`Table '${request.tableName}' does not exist in database schema`);
      }
    }

    // 2. Naming Convention Check
    if (request.moduleName && !/^[A-Z][a-zA-Z0-9]*$/.test(request.moduleName)) {
      issues.push(`Module name '${request.moduleName}' must be PascalCase`);
    }

    // 3. Component Reuse Check
    const existingModules = moduleRegistry.getAll();
    if (request.tableName) {
      const similarModules = existingModules.filter(m => 
        m.tableName === request.tableName || 
        m.tableName?.includes(request.tableName) ||
        request.tableName.includes(m.tableName || '')
      );

      if (similarModules.length > 0) {
        warnings.push(`Found existing modules for similar tables: ${similarModules.map(m => m.moduleName).join(', ')}`);
      }
    }

    // 4. Template Recommendations
    if (request.componentType === 'hook' && request.tableName) {
      shouldUseTemplate = true;
      recommendedTemplate = 'useTypeSafeModuleTemplate';
      recommendations.push('Use useTypeSafeModuleTemplate for type-safe database operations');
    }

    if (request.componentType === 'component') {
      shouldUseTemplate = true;
      recommendedTemplate = 'ExtensibleModuleTemplate';
      recommendations.push('Use ExtensibleModuleTemplate for consistent UI patterns');
    }

    // 5. Best Practices Check
    if (request.description.toLowerCase().includes('mock') || request.description.toLowerCase().includes('fake')) {
      issues.push('No Mock Data Policy: Only work with real data and actual database tables');
    }

    // 6. Core Business Table Validation
    const coreBusinessTables = ['profiles', 'facilities', 'modules', 'roles', 'user_roles'];
    const missingCoreTables = coreBusinessTables.filter(table => !validateTableExists(table));
    if (missingCoreTables.length > 0) {
      issues.push(`Missing core business tables: ${missingCoreTables.join(', ')}`);
    }

    // 7. Component Isolation Reminder
    recommendations.push('Ensure component isolation to prevent breaking existing functionality');

    const canProceed = issues.length === 0;

    console.log(`✅ Simplified validation complete:`, {
      canProceed,
      issuesCount: issues.length,
      warningsCount: warnings.length,
      recommendationsCount: recommendations.length,
      templateRecommended: shouldUseTemplate
    });

    return {
      canProceed,
      issues,
      warnings,
      recommendations,
      shouldUseTemplate,
      recommendedTemplate
    };
  }

  /**
   * Quick module validation
   */
  static validateModule(config: ModuleConfig): ValidationResult {
    return this.validate({
      tableName: config.tableName,
      moduleName: config.moduleName,
      componentType: 'module',
      description: `Module for ${config.tableName} table`
    });
  }

  /**
   * Generate implementation plan from validation result
   */
  static generateImplementationPlan(result: ValidationResult): string[] {
    const plan: string[] = [];

    if (!result.canProceed) {
      plan.push('🚫 IMPLEMENTATION BLOCKED - Issues must be resolved first:');
      plan.push(...result.issues.map(issue => `   ❌ ${issue}`));
      return plan;
    }

    plan.push('✅ VALIDATION PASSED - READY TO PROCEED');
    
    if (result.shouldUseTemplate && result.recommendedTemplate) {
      plan.push(`🎯 RECOMMENDED TEMPLATE: ${result.recommendedTemplate}`);
    }
    
    if (result.warnings.length > 0) {
      plan.push('⚠️ Warnings to consider:');
      plan.push(...result.warnings.map(warning => `   ⚠️ ${warning}`));
    }

    if (result.recommendations.length > 0) {
      plan.push('💡 Recommendations:');
      plan.push(...result.recommendations.map(rec => `   💡 ${rec}`));
    }

    return plan;
  }
}

/**
 * Utility functions for common validations
 */
export const validateModuleCreation = (config: ModuleConfig): ValidationResult => {
  return SimplifiedValidator.validateModule(config);
};

export const validateComponentCreation = (componentName: string, description: string): ValidationResult => {
  return SimplifiedValidator.validate({
    moduleName: componentName,
    componentType: 'component',
    description
  });
};

export const validateHookCreation = (hookName: string, tableName: string): ValidationResult => {
  return SimplifiedValidator.validate({
    tableName,
    moduleName: hookName,
    componentType: 'hook',
    description: `Hook for ${tableName} table operations`
  });
};

/**
 * Quick validation function - runs essential checks only
 */
export const runSimplifiedValidation = (request: ValidationRequest) => {
  console.log('🚀 Running simplified validation...');
  
  const result = SimplifiedValidator.validate(request);
  const plan = SimplifiedValidator.generateImplementationPlan(result);
  
  console.log('📋 Implementation Plan:');
  plan.forEach(item => console.log(item));
  
  return {
    validationResult: result,
    implementationPlan: plan,
    canProceed: result.canProceed
  };
};
