
/**
 * Pre-Implementation Verification System
 * Main orchestrator that coordinates all validation checks
 */

import { TemplateEnforcement } from './TemplateEnforcement';
import { ComponentScanner } from './ComponentScanner';
import { TypeScriptValidator } from './TypeScriptValidator';
import { DatabaseAlignmentValidator } from './DatabaseAlignmentValidator';
import { GuidelinesValidator } from './GuidelinesValidator';
import type { 
  PreImplementationCheckResult, 
  VerificationRequest,
  PatternEnforcementResult 
} from './types';
import { ModuleConfig } from '@/utils/moduleValidation';

/**
 * Pre-Implementation Checker Class
 * Runs comprehensive verification before any implementation
 */
export class PreImplementationChecker {
  /**
   * Main verification method - runs all checks before implementation
   */
  static async runPreFlightCheck(request: VerificationRequest): Promise<PreImplementationCheckResult> {
    console.log('🔍 Running Pre-Implementation Verification System...');
    console.log('📋 Request:', request);

    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 1. Component Registry Scanner
    console.log('📋 Step 1: Scanning existing components...');
    const existingComponents = await ComponentScanner.scanExistingComponents(request);

    // 2. TypeScript-Database Validator
    console.log('📋 Step 2: Validating TypeScript alignment...');
    const typescriptValidation = await TypeScriptValidator.validateTypeScriptAlignment(request);

    // 3. Database Alignment Check
    console.log('📋 Step 3: Checking database alignment...');
    const databaseAlignment = await DatabaseAlignmentValidator.validateDatabaseAlignment(request);

    // 4. Template Enforcement
    console.log('📋 Step 4: Enforcing template usage...');
    const templateEnforcement = TemplateEnforcement.analyzeAndEnforce(request);

    // 5. Knowledge Base Guidelines Check
    console.log('📋 Step 5: Validating against knowledge base guidelines...');
    const guidelinesCheck = GuidelinesValidator.validateKnowledgeBaseGuidelines(request, existingComponents);

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

    // Add template enforcement violations as issues
    if (templateEnforcement.violations.length > 0) {
      issues.push(...templateEnforcement.violations);
    }

    // Add template enforcement recommendations
    if (templateEnforcement.shouldUseTemplate && templateEnforcement.recommendedTemplate) {
      recommendations.unshift(`TEMPLATE REQUIRED: Use ${templateEnforcement.recommendedTemplate.templateName}`);
      recommendations.push(`Template Location: ${templateEnforcement.recommendedTemplate.templatePath}`);
      recommendations.push(`Template Reason: ${templateEnforcement.recommendedTemplate.reason}`);
    }

    recommendations.push(...templateEnforcement.enforcements);

    const canProceed = issues.length === 0;

    console.log(`✅ Pre-Implementation Check Complete:`, {
      canProceed,
      issuesCount: issues.length,
      warningsCount: warnings.length,
      recommendationsCount: recommendations.length,
      templateEnforced: templateEnforcement.shouldUseTemplate
    });

    return {
      canProceed,
      issues,
      warnings,
      recommendations,
      existingComponents,
      typescriptValidation,
      databaseAlignment,
      templateEnforcement
    };
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
    
    // Add template enforcement summary
    if (checkResult.templateEnforcement.shouldUseTemplate) {
      plan.push('🎯 TEMPLATE ENFORCEMENT ACTIVE:');
      const enforcementSummary = TemplateEnforcement.generateEnforcementSummary(checkResult.templateEnforcement);
      plan.push(...enforcementSummary.map(item => `   ${item}`));
    }
    
    if (checkResult.warnings.length > 0) {
      plan.push('⚠️ Warnings to consider:');
      plan.push(...checkResult.warnings.map(warning => `   ⚠️ ${warning}`));
    }

    if (checkResult.recommendations.length > 0) {
      plan.push('💡 Implementation requirements:');
      plan.push(...checkResult.recommendations.map(rec => `   💡 ${rec}`));
    }

    plan.push('🚀 READY TO PROCEED WITH TEMPLATE-ENFORCED IMPLEMENTATION');
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
