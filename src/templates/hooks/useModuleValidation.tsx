
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { ModuleConfig } from '@/utils/moduleValidation';
import { SimplifiedValidator } from '@/utils/verification/SimplifiedValidator';
import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

/**
 * Simplified Module Validation Hook
 * Uses the simplified validation system for better performance
 */
export const useModuleValidation = <T extends DatabaseTables>(
  config: ModuleConfig & { tableName: T }
) => {
  const { toast } = useToast();

  // Validate configuration using simplified validator
  React.useEffect(() => {
    const validationResult = SimplifiedValidator.validateModule(config);
    
    if (!validationResult.canProceed) {
      console.error('❌ Module validation failed:', validationResult.issues);
      toast({
        title: "Module Validation Error",
        description: validationResult.issues.join(', '),
        variant: "destructive",
      });
    } else if (validationResult.warnings.length > 0) {
      console.warn('⚠️ Module validation warnings:', validationResult.warnings);
    }
  }, [config, toast]);

  // Run validation
  const validationResult = SimplifiedValidator.validateModule(config);

  return {
    isValid: validationResult.canProceed,
    issues: validationResult.issues,
    warnings: validationResult.warnings,
    recommendations: validationResult.recommendations,
    shouldUseTemplate: validationResult.shouldUseTemplate,
    recommendedTemplate: validationResult.recommendedTemplate,
    
    validateRequiredFields: (data: any) => {
      if (!config.requiredFields) return true;
      
      const missingFields = config.requiredFields.filter(field => !data[field]);
      return missingFields.length === 0;
    },
    
    validateCustomRules: (data: any) => {
      if (!config.customValidation) return true;
      return config.customValidation(data);
    },
    
    getMissingFields: (data: any) => {
      if (!config.requiredFields) return [];
      return config.requiredFields.filter(field => !data[field]);
    }
  };
};
