
import { useQuery } from '@tanstack/react-query';

export interface ModuleConfig {
  tableName: string;
  moduleName: string;
  requiredFields: string[];
  customValidation?: (data: any) => boolean;
}

export const useTypeSafeModuleTemplate = (config: ModuleConfig) => {
  const templateQuery = useQuery({
    queryKey: ['module-template', config.tableName],
    queryFn: async () => {
      console.log('🔍 Validating module template for:', config.moduleName);
      
      // Basic validation
      const isValid = config.requiredFields.length > 0 && 
                     config.tableName && 
                     config.moduleName;

      return {
        isValid,
        config,
        validatedAt: new Date().toISOString()
      };
    },
    staleTime: 300000, // 5 minutes
    retry: 1
  });

  return {
    isValid: templateQuery.data?.isValid || false,
    isLoading: templateQuery.isLoading,
    error: templateQuery.error,
    refetch: templateQuery.refetch,
    meta: {
      templateVersion: '1.0',
      moduleName: config.moduleName,
      tableName: config.tableName,
      validatedAt: templateQuery.data?.validatedAt
    }
  };
};
