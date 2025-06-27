
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { validateTableExists, preModuleCreationCheck, ModuleConfig } from '@/utils/moduleValidation';
import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

/**
 * Module Validation Hook
 * Handles configuration validation and pre-creation checks
 */
export const useModuleValidation = <T extends DatabaseTables>(
  config: ModuleConfig & { tableName: T }
) => {
  const { toast } = useToast();

  // Validate configuration on hook initialization
  React.useEffect(() => {
    preModuleCreationCheck(config).catch((error) => {
      console.error('❌ Module configuration error:', error);
      toast({
        title: "Module Configuration Error",
        description: error.message,
        variant: "destructive",
      });
    });
  }, [config, toast]);

  const isTableValid = validateTableExists(config.tableName);

  return {
    isTableValid,
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
