
/**
 * Simplified Validator
 * Mock implementation for validation
 */

export interface ValidationRequest {
  tableName?: string;
  moduleType?: string;
  moduleName?: string;
  componentType?: string;
  description?: string;
}

export interface ValidationResult {
  success: boolean;
  issues: string[];
  fixes: string[];
  recommendations?: string[];
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
  static validate(request: ValidationRequest): ValidationResult {
    return {
      success: true,
      issues: [],
      fixes: [],
      recommendations: []
    };
  }

  static validateModule(config: any): ModuleValidationResult {
    return {
      canProceed: true,
      issues: [],
      warnings: [],
      recommendations: [],
      shouldUseTemplate: true,
      recommendedTemplate: 'standard'
    };
  }
}
