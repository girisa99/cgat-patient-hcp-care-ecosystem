
import { Database } from '@/integrations/supabase/types';
import { ModuleConfig } from '@/utils/moduleValidation';

type DatabaseTables = keyof Database['public']['Tables'];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields: string[];
}

/**
 * Module Validation Hook
 * Provides validation functionality for module data
 */
export const useModuleValidation = (config: ModuleConfig & { tableName: DatabaseTables }) => {
  
  const validateRequiredFields = (data: any): ValidationResult => {
    const errors: string[] = [];
    const missingFields: string[] = [];

    if (!config.requiredFields || config.requiredFields.length === 0) {
      return { isValid: true, errors: [], missingFields: [] };
    }

    config.requiredFields.forEach(field => {
      if (!data || !data[field] || data[field] === '') {
        errors.push(`${field} is required`);
        missingFields.push(field);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      missingFields
    };
  };

  const validateCustomRules = (data: any): ValidationResult => {
    if (!config.customValidation) {
      return { isValid: true, errors: [], missingFields: [] };
    }

    try {
      const isValid = config.customValidation(data);
      return {
        isValid,
        errors: isValid ? [] : ['Custom validation failed'],
        missingFields: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Custom validation error: ${error}`],
        missingFields: []
      };
    }
  };

  const getMissingFields = (data: any): string[] => {
    const validation = validateRequiredFields(data);
    return validation.missingFields;
  };

  // Validate table exists (simplified check)
  const isValid = true; // In a real implementation, this would check if the table exists

  return {
    isValid,
    validateRequiredFields,
    validateCustomRules,
    getMissingFields
  };
};
