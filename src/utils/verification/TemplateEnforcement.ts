
/**
 * Template Enforcement System
 * Ensures new components default to established patterns and templates
 */

import { moduleRegistry } from '@/utils/moduleRegistry';
import { ModuleConfig } from '@/utils/moduleValidation';
import type { TemplateRecommendation, PatternEnforcementResult } from './types';

/**
 * Template Enforcement Class
 * Analyzes requests and enforces established patterns
 */
export class TemplateEnforcement {
  /**
   * Validate template usage for a specific component type and path
   */
  async validateTemplateUsage(componentType: string, targetPath: string): Promise<any> {
    console.log(`🎯 Validating template usage for ${componentType} at ${targetPath}`);
    
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check if component follows template patterns
    if (componentType === 'hook' && !targetPath.includes('useTypeSafeModuleTemplate')) {
      violations.push('Hook should use useTypeSafeModuleTemplate pattern');
      recommendations.push('Use useTypeSafeModuleTemplate for consistent database operations');
    }
    
    if (componentType === 'component' && !targetPath.includes('ExtensibleModuleTemplate')) {
      warnings.push('Component should consider using ExtensibleModuleTemplate pattern');
      recommendations.push('Use ExtensibleModuleTemplate for consistent UI patterns');
    }
    
    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      recommendations,
      shouldUseTemplate: violations.length > 0 || warnings.length > 0,
      enforceable: violations.length === 0
    };
  }

  /**
   * Analyze request and enforce template usage
   */
  static analyzeAndEnforce(request: {
    componentType: 'hook' | 'component' | 'module' | 'template';
    tableName?: string;
    moduleName?: string;
    description: string;
    functionality?: string[];
  }): PatternEnforcementResult {
    console.log('🎯 Analyzing request for template enforcement...');
    
    const violations: string[] = [];
    const enforcements: string[] = [];
    let shouldUseTemplate = false;
    let recommendedTemplate: TemplateRecommendation | null = null;
    const alternatives: TemplateRecommendation[] = [];

    // Analyze component type and recommend templates
    switch (request.componentType) {
      case 'hook':
        const hookAnalysis = this.analyzeHookRequest(request);
        shouldUseTemplate = hookAnalysis.shouldUseTemplate;
        recommendedTemplate = hookAnalysis.recommendedTemplate;
        alternatives.push(...hookAnalysis.alternatives);
        enforcements.push(...hookAnalysis.enforcements);
        break;

      case 'component':
      case 'module':
        const componentAnalysis = this.analyzeComponentRequest(request);
        shouldUseTemplate = componentAnalysis.shouldUseTemplate;
        recommendedTemplate = componentAnalysis.recommendedTemplate;
        alternatives.push(...componentAnalysis.alternatives);
        enforcements.push(...componentAnalysis.enforcements);
        break;

      case 'template':
        enforcements.push('Creating custom templates should be rare - ensure existing templates cannot be extended first');
        break;
    }

    // Check for anti-patterns
    const antiPatternViolations = this.checkAntiPatterns(request);
    violations.push(...antiPatternViolations);

    // Add universal enforcements
    enforcements.push(...this.getUniversalEnforcements(request));

    console.log('📋 Template enforcement analysis complete:', {
      shouldUseTemplate,
      recommendedTemplate: recommendedTemplate?.templateName,
      alternativesCount: alternatives.length,
      violationsCount: violations.length,
      enforcementsCount: enforcements.length
    });

    return {
      shouldUseTemplate,
      recommendedTemplate,
      alternatives,
      violations,
      enforcements
    };
  }

  /**
   * Analyze hook creation requests
   */
  private static analyzeHookRequest(request: {
    componentType: string;
    tableName?: string;
    moduleName?: string;
    description: string;
  }): {
    shouldUseTemplate: boolean;
    recommendedTemplate: TemplateRecommendation | null;
    alternatives: TemplateRecommendation[];
    enforcements: string[];
  } {
    const enforcements: string[] = [];
    const alternatives: TemplateRecommendation[] = [];
    
    // Primary recommendation: useTypeSafeModuleTemplate
    const recommendedTemplate: TemplateRecommendation = {
      templateName: 'useTypeSafeModuleTemplate',
      templatePath: 'src/templates/hooks/useTypeSafeModuleTemplate.tsx',
      reason: 'Provides type-safe database operations with built-in validation and error handling',
      confidence: 0.95,
      usage: `const config = { tableName: '${request.tableName || 'your_table'}', moduleName: '${request.moduleName || 'YourModule'}', requiredFields: ['field1', 'field2'] };\nconst { items, isLoading, createItem, updateItem, deleteItem } = useTypeSafeModuleTemplate(config);`,
      example: 'Used by all existing modules for consistent database operations'
    };

    // Add alternatives for specific cases
    if (request.description.toLowerCase().includes('user') || request.tableName === 'profiles') {
      alternatives.push({
        templateName: 'useUnifiedUserData',
        templatePath: 'src/hooks/useUnifiedUserData.tsx',
        reason: 'Specialized hook for user data operations with role management',
        confidence: 0.8,
        usage: 'const { users, isLoading, createUser, updateUser } = useUnifiedUserData();',
        example: 'Used for all user-related data operations'
      });
    }

    enforcements.push('MANDATORY: Use useTypeSafeModuleTemplate for all database operations');
    enforcements.push('Do not create custom database hooks - extend existing templates instead');
    
    if (request.tableName) {
      enforcements.push(`Table '${request.tableName}' operations must use the unified template pattern`);
    }

    return {
      shouldUseTemplate: true,
      recommendedTemplate,
      alternatives,
      enforcements
    };
  }

  /**
   * Analyze component creation requests
   */
  private static analyzeComponentRequest(request: {
    componentType: string;
    tableName?: string;
    moduleName?: string;
    description: string;
    functionality?: string[];
  }): {
    shouldUseTemplate: boolean;
    recommendedTemplate: TemplateRecommendation | null;
    alternatives: TemplateRecommendation[];
    enforcements: string[];
  } {
    const enforcements: string[] = [];
    const alternatives: TemplateRecommendation[] = [];

    // Primary recommendation: ExtensibleModuleTemplate
    const recommendedTemplate: TemplateRecommendation = {
      templateName: 'ExtensibleModuleTemplate',
      templatePath: 'src/templates/components/ExtensibleModuleTemplate.tsx',
      reason: 'Provides consistent UI patterns with automatic adaptation to different data structures',
      confidence: 0.9,
      usage: `<ExtensibleModuleTemplate
  config={{ tableName: '${request.tableName || 'your_table'}', moduleName: '${request.moduleName || 'YourModule'}', requiredFields: ['field1'] }}
  data={items}
  isLoading={isLoading}
  onAdd={() => console.log('Add item')}
  customColumns={customColumns}
/>`,
      example: 'Used by UserManagement, FacilityManagement, and all admin modules'
    };

    // Add alternatives for specific cases
    if (request.description.toLowerCase().includes('dialog') || request.description.toLowerCase().includes('modal')) {
      alternatives.push({
        templateName: 'Dialog Components Pattern',
        templatePath: 'src/components/*/Create*Dialog.tsx',
        reason: 'Follow established dialog patterns for consistent user experience',
        confidence: 0.85,
        usage: 'Follow the pattern: CreateUserDialog, CreateFacilityDialog, etc.',
        example: 'All create/edit dialogs follow the same structure and validation patterns'
      });
    }

    if (request.description.toLowerCase().includes('list') || request.description.toLowerCase().includes('table')) {
      alternatives.push({
        templateName: 'DataTable Component',
        templatePath: 'src/components/shared/DataTable.tsx',
        reason: 'Reusable data table with consistent styling and functionality',
        confidence: 0.8,
        usage: '<DataTable data={items} columns={columns} onAdd={handleAdd} />',
        example: 'Used across all list views for consistent table presentation'
      });
    }

    enforcements.push('MANDATORY: Use ExtensibleModuleTemplate for all module interfaces');
    enforcements.push('Follow established component patterns - do not create one-off components');
    enforcements.push('Reuse existing shared components (DataTable, StatusBadge, etc.)');
    
    if (request.tableName) {
      enforcements.push(`Module for '${request.tableName}' must use ExtensibleModuleTemplate pattern`);
    }

    return {
      shouldUseTemplate: true,
      recommendedTemplate,
      alternatives,
      enforcements
    };
  }

  /**
   * Check for anti-patterns that violate established guidelines
   */
  private static checkAntiPatterns(request: {
    componentType: string;
    tableName?: string;
    moduleName?: string;
    description: string;
  }): string[] {
    const violations: string[] = [];

    // Check for custom database operations
    if (request.description.toLowerCase().includes('custom database') || 
        request.description.toLowerCase().includes('direct sql') ||
        request.description.toLowerCase().includes('raw query')) {
      violations.push('VIOLATION: Custom database operations are not allowed - use templates');
    }

    // Check for mock data usage
    if (request.description.toLowerCase().includes('mock') || 
        request.description.toLowerCase().includes('fake') ||
        request.description.toLowerCase().includes('dummy')) {
      violations.push('VIOLATION: Mock data is not allowed - work with real data only');
    }

    // Check for one-off components instead of templates
    if (request.componentType === 'component' && 
        request.description.toLowerCase().includes('simple') &&
        !request.description.toLowerCase().includes('template')) {
      violations.push('VIOLATION: Simple components should use established templates');
    }

    // Check for inconsistent naming
    if (request.moduleName && !/^[A-Z][a-zA-Z0-9]*$/.test(request.moduleName)) {
      violations.push(`VIOLATION: Module name '${request.moduleName}' must be PascalCase`);
    }

    return violations;
  }

  /**
   * Get universal enforcements that apply to all requests
   */
  private static getUniversalEnforcements(request: {
    componentType: string;
    tableName?: string;
    moduleName?: string;
    description: string;
  }): string[] {
    const enforcements: string[] = [];

    enforcements.push('Follow established naming conventions (PascalCase for modules, camelCase for variables)');
    enforcements.push('Ensure component isolation to prevent breaking existing functionality');
    enforcements.push('Use TypeScript validation from @/integrations/supabase/types');
    enforcements.push('Implement proper error handling using established patterns');
    
    if (request.tableName) {
      enforcements.push(`Validate table '${request.tableName}' exists before implementation`);
    }

    return enforcements;
  }

  /**
   * Generate template enforcement summary
   */
  static generateEnforcementSummary(result: PatternEnforcementResult): string[] {
    const summary: string[] = [];

    if (result.shouldUseTemplate && result.recommendedTemplate) {
      summary.push('🎯 TEMPLATE ENFORCEMENT ACTIVE');
      summary.push(`📋 REQUIRED: Use ${result.recommendedTemplate.templateName}`);
      summary.push(`📍 Location: ${result.recommendedTemplate.templatePath}`);
      summary.push(`💡 Reason: ${result.recommendedTemplate.reason}`);
      summary.push(`📊 Confidence: ${(result.recommendedTemplate.confidence * 100).toFixed(0)}%`);
    }

    if (result.alternatives.length > 0) {
      summary.push('🔄 ALTERNATIVE TEMPLATES:');
      result.alternatives.forEach(alt => {
        summary.push(`   • ${alt.templateName} - ${alt.reason}`);
      });
    }

    if (result.violations.length > 0) {
      summary.push('❌ PATTERN VIOLATIONS:');
      result.violations.forEach(violation => {
        summary.push(`   • ${violation}`);
      });
    }

    if (result.enforcements.length > 0) {
      summary.push('✅ ENFORCED PATTERNS:');
      result.enforcements.forEach(enforcement => {
        summary.push(`   • ${enforcement}`);
      });
    }

    return summary;
  }

  /**
   * Check if existing module can be extended instead of creating new one
   */
  static checkModuleExtensibility(request: {
    tableName?: string;
    moduleName?: string;
    functionality?: string[];
  }): {
    canExtendExisting: boolean;
    existingModule?: string;
    extensionRecommendation?: string;
  } {
    if (!request.tableName) {
      return { canExtendExisting: false };
    }

    const registeredModules = moduleRegistry.getAll();
    const similarModule = registeredModules.find(m => 
      m.tableName === request.tableName ||
      m.moduleName.toLowerCase() === request.moduleName?.toLowerCase()
    );

    if (similarModule) {
      return {
        canExtendExisting: true,
        existingModule: similarModule.moduleName,
        extensionRecommendation: `Extend existing ${similarModule.moduleName} module instead of creating new one`
      };
    }

    return { canExtendExisting: false };
  }
}

/**
 * Quick template enforcement check
 */
export const enforceTemplateUsage = (request: {
  componentType: 'hook' | 'component' | 'module' | 'template';
  tableName?: string;
  moduleName?: string;
  description: string;
  functionality?: string[];
}): PatternEnforcementResult => {
  return TemplateEnforcement.analyzeAndEnforce(request);
};
