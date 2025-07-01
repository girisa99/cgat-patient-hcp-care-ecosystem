
import { useQuery } from '@tanstack/react-query';

// Simplified version to avoid deep type instantiation issues
export interface SimpleModuleConfig {
  tableName: string;
  moduleName: string;
  requiredFields: string[];
}

export const useModuleData = (config: SimpleModuleConfig) => {
  return useQuery({
    queryKey: [config.tableName],
    queryFn: async () => {
      // Simple mock implementation
      console.log(`Fetching data for ${config.moduleName}`);
      return [];
    },
    enabled: !!config.tableName
  });
};
