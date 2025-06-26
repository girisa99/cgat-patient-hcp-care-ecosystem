
/**
 * Pre-Implementation Verification System
 * Systematic checklist that ensures compliance with knowledge base guidelines
 */

import { validateTableExists, validateModuleConfig, ModuleConfig } from '@/utils/moduleValidation';
import { moduleRegistry, RegisteredModule } from '@/utils/moduleRegistry';
import { databaseSchemaAnalyzer } from '@/utils/api/DatabaseSchemaAnalyzer';
import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

export interface PreImplementationCheckResult {
  canProceed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  existingComponents: ComponentScanResult;
  typescriptValidation: TypeScriptValidationResult;
  databaseAlignment: DatabaseAlignmentResult;
}

export interface ComponentScanResult {
  existingHooks: string[];
  existingComponents: string[];
  existingTemplates: string[];
  reuseOpportunities: string[];
}

export interface TypeScriptValidationResult {
  isValid: boolean;
  missingTypes: string[];
  conflictingTypes: string[];
  schemaAlignment: boolean;
}

export interface DatabaseAlignmentResult {
  tablesExist: boolean;
  missingTables: string[];
  rlsPoliciesValid: boolean;
  foreignKeysValid: boolean;
}

/**
 * Pre-Implementation Checker Class
 * Runs comprehensive verification before any implementation
 */
export class PreImplementationChecker {
  /**
   * Main verification method - runs all checks before implementation
   */
  static async runPreFlightCheck(request: {
    tableName?: string;
    moduleName?: string;
    componentType: 'hook' | 'component' | 'module' | 'template';
    description: string;
  }): Promise<PreImplementationCheckResult> {
    console.log('🔍 Running Pre-Implementation Verification System...');
    console.log('📋 Request:', request);

    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 1. Component Registry Scanner
    console.log('📋 Step 1: Scanning existing components...');
    const existingComponents = await this.scanExistingComponents(request);

    // 2. TypeScript-Database Validator
    console.log('📋 Step 2: Validating TypeScript alignment...');
    const typescriptValidation = await this.validateTypeScriptAlignment(request);

    // 3. Database Alignment Check
    console.log('📋 Step 3: Checking database alignment...');
    const databaseAlignment = await this.validateDatabaseAlignment(request);

    // 4. Knowledge Base Guidelines Check
    console.log('📋 Step 4: Validating against knowledge base guidelines...');
    const guidelinesCheck = this.validateKnowledgeBaseGuidelines(request, existingComponents);

    // Compile results
    issues.push(...guidelinesCheck.issues);
    warnings.push(...guidelinesCheck.warnings);
    recommendations.push(...guidelinesCheck.recommendations);

    // Add TypeScript issues
    if (!typescriptValidation.isValid) {
      issues.push(...typescriptValidation.missingTypes.map(type => `Missing TypeScript type: ${type}`));
      issues.push(...typescriptValidation.conflictingTypes.map(type => `Conflicting TypeScript type: ${type}`));
    }

    // Add database issues
    if (!databaseAlignment.tablesExist) {
      issues.push(...databaseAlignment.missingTables.map(table => `Missing database table: ${table}`));
    }

    const canProceed = issues.length === 0;

    console.log(`✅ Pre-Implementation Check Complete:`, {
      canProceed,
      issuesCount: issues.length,
      warningsCount: warnings.length,
      recommendationsCount: recommendations.length
    });

    return {
      canProceed,
      issues,
      warnings,
      recommendations,
      existingComponents,
      typescriptValidation,
      databaseAlignment
    };
  }

  /**
   * Component Registry Scanner - Checks existing components before creating new ones
   */
  private static async scanExistingComponents(request: {
    tableName?: string;
    moduleName?: string;
    componentType: string;
    description: string;
  }): Promise<ComponentScanResult> {
    console.log('🔍 Scanning existing components for reuse opportunities...');

    const existingHooks: string[] = [];
    const existingComponents: string[] = [];
    const existingTemplates: string[] = [];
    const reuseOpportunities: string[] = [];

    // Check module registry
    const registeredModules = moduleRegistry.getAll();
    const existingModuleNames = registeredModules.map(m => m.moduleName);

    // Check for similar table names
    if (request.tableName) {
      const similarModules = registeredModules.filter(m => 
        m.tableName === request.tableName || 
        m.tableName.includes(request.tableName) ||
        request.tableName.includes(m.tableName)
      );

      if (similarModules.length > 0) {
        reuseOpportunities.push(`Found existing modules for similar tables: ${similarModules.map(m => m.moduleName).join(', ')}`);
        existingHooks.push(...similarModules.map(m => `use${m.moduleName}`));
      }
    }

    // Check for established patterns
    const unifiedDataHooks = ['useUnifiedUserData', 'useTypeSafeModuleTemplate'];
    const establishedTemplates = ['ExtensibleModuleTemplate', 'ModuleTemplate'];

    existingHooks.push(...unifiedDataHooks);
    existingTemplates.push(...establishedTemplates);

    // Check for reuse opportunities based on component type
    if (request.componentType === 'hook' && request.tableName) {
      reuseOpportunities.push('Consider using useTypeSafeModuleTemplate instead of creating a new hook');
    }

    if (request.componentType === 'component') {
      reuseOpportunities.push('Consider using ExtensibleModuleTemplate for consistent UI patterns');
    }

    return {
      existingHooks,
      existingComponents,
      existingTemplates,
      reuseOpportunities
    };
  }

  /**
   * TypeScript-Database Validator - Ensures alignment with schema
   */
  private static async validateTypeScriptAlignment(request: {
    tableName?: string;
    moduleName?: string;
    componentType: string;
  }): Promise<TypeScriptValidationResult> {
    console.log('🔍 Validating TypeScript-Database alignment...');

    const missingTypes: string[] = [];
    const conflictingTypes: string[] = [];
    let isValid = true;
    let schemaAlignment = true;

    // Check table existence in TypeScript schema
    if (request.tableName) {
      const tableExists = validateTableExists(request.tableName);
      if (!tableExists) {
        missingTypes.push(`Table '${request.tableName}' not found in TypeScript schema`);
        isValid = false;
        schemaAlignment = false;
      }
    }

    // Check module naming conventions
    if (request.moduleName) {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(request.moduleName)) {
        conflictingTypes.push(`Module name '${request.moduleName}' must be PascalCase`);
        isValid = false;
      }
    }

    return {
      isValid,
      missingTypes,
      conflictingTypes,
      schemaAlignment
    };
  }

  /**
   * Database Alignment Validator
   */
  private static async validateDatabaseAlignment(request: {
    tableName?: string;
    moduleName?: string;
  }): Promise<DatabaseAlignmentResult> {
    console.log('🔍 Validating database alignment...');

    const missingTables: string[] = [];
    let tablesExist = true;
    let rlsPoliciesValid = true;
    let foreignKeysValid = true;

    // Check if table exists
    if (request.tableName) {
      const tableExists = validateTableExists(request.tableName);
      if (!tableExists) {
        missingTables.push(request.tableName);
        tablesExist = false;
      }
    }

    // Validate core business tables exist
    const coreBusinessTables = ['profiles', 'facilities', 'modules', 'roles', 'user_roles'];
    for (const table of coreBusinessTables) {
      if (!validateTableExists(table)) {
        missingTables.push(table);
        tablesExist = false;
      }
    }

    return {
      tablesExist,
      missingTables,
      rlsPoliciesValid,
      foreignKeysValid
    };
  }

  /**
   * Knowledge Base Guidelines Validator
   */
  private static validateKnowledgeBaseGuidelines(
    request: { tableName?: string; moduleName?: string; componentType: string; description: string },
    existingComponents: ComponentScanResult
  ): { issues: string[]; warnings: string[]; recommendations: string[] } {
    console.log('🔍 Validating against knowledge base guidelines...');

    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 1. Component Reuse Check
    if (existingComponents.reuseOpportunities.length > 0) {
      recommendations.push('Component Reuse Opportunities Found:');
      recommendations.push(...existingComponents.reuseOpportunities);
    }

    // 2. Naming Convention Check
    if (request.moduleName && !/^[A-Z][a-zA-Z0-9]*$/.test(request.moduleName)) {
      issues.push(`Module name '${request.moduleName}' violates PascalCase naming convention`);
    }

    // 3. Template Usage Check
    if (request.componentType === 'component') {
      recommendations.push('Consider using ExtensibleModuleTemplate for consistent UI patterns');
      recommendations.push('Follow established patterns for centralized validation and filtering');
    }

    // 4. Hook Usage Check
    if (request.componentType === 'hook' && request.tableName) {
      recommendations.push('Consider using useTypeSafeModuleTemplate for type-safe database operations');
      recommendations.push('Use unified data hooks like useUnifiedUserData where applicable');
    }

    // 5. No Mock Data Policy Check
    if (request.description.toLowerCase().includes('mock') || request.description.toLowerCase().includes('fake')) {
      issues.push('No Mock Data Policy: Only work with real data and actual database tables');
    }

    // 6. Component Isolation Check
    recommendations.push('Ensure component isolation to prevent breaking tabs, sub-tabs, functionality, or navigation');
    recommendations.push('Validate that no incorrect props are being sent');

    return { issues, warnings, recommendations };
  }

  /**
   * Generate implementation recommendations based on check results
   */
  static generateImplementationPlan(checkResult: PreImplementationCheckResult): string[] {
    const plan: string[] = [];

    if (!checkResult.canProceed) {
      plan.push('🚫 IMPLEMENTATION BLOCKED - Issues must be resolved first:');
      plan.push(...checkResult.issues.map(issue => `   ❌ ${issue}`));
      return plan;
    }

    plan.push('✅ PRE-IMPLEMENTATION CHECK PASSED');
    
    if (checkResult.warnings.length > 0) {
      plan.push('⚠️ Warnings to consider:');
      plan.push(...checkResult.warnings.map(warning => `   ⚠️ ${warning}`));
    }

    if (checkResult.recommendations.length > 0) {
      plan.push('💡 Recommendations for implementation:');
      plan.push(...checkResult.recommendations.map(rec => `   💡 ${rec}`));
    }

    plan.push('🚀 READY TO PROCEED WITH IMPLEMENTATION');
    return plan;
  }
}

/**
 * Quick validation function for module creation
 */
export const validateModuleCreation = async (config: ModuleConfig): Promise<PreImplementationCheckResult> => {
  return await PreImplementationChecker.runPreFlightCheck({
    tableName: config.tableName,
    moduleName: config.moduleName,
    componentType: 'module',
    description: `Module for ${config.tableName} table`
  });
};

/**
 * Quick validation function for component creation
 */
export const validateComponentCreation = async (componentName: string, description: string): Promise<PreImplementationCheckResult> => {
  return await PreImplementationChecker.runPreFlightCheck({
    moduleName: componentName,
    componentType: 'component',
    description
  });
};

/**
 * Quick validation function for hook creation
 */
export const validateHookCreation = async (hookName: string, tableName: string): Promise<PreImplementationCheckResult> => {
  return await PreImplementationChecker.runPreFlightCheck({
    tableName,
    moduleName: hookName,
    componentType: 'hook',
    description: `Hook for ${tableName} table operations`
  });
};
