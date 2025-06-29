
/**
 * Simplified Validator
 * Mock implementation for basic validation
 */

export interface ValidationRequest {
  componentType: 'hook' | 'component' | 'module' | 'template';
  moduleName?: string;
  description?: string;
}

export interface ModuleValidationResult {
  canProceed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  shouldUseTemplate: boolean;
  recommendedTemplate?: string;
}

export class SimplifiedValidator {
  static validate(data: any) {
    return {
      success: true,
      issues: [],
      fixes: [],
      recommendations: ['Regular validation recommended']
    };
  }

  static validateModule(config: any): ModuleValidationResult {
    console.log('🔍 Validating module configuration:', config);
    
    return {
      canProceed: true,
      issues: [],
      warnings: [],
      recommendations: ['Consider using templates for consistency'],
      shouldUseTemplate: true,
      recommendedTemplate: 'ExtensibleModuleTemplate'
    };
  }
}
