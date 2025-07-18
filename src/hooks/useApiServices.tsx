
/**
 * API Services Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const apiServicesConfig = {
  tableName: 'api_integration_registry',
  moduleName: 'API Services',
  requiredFields: ['name', 'type', 'status'],
  customValidation: (data: any) => {
    return data.name && data.name.length > 0;
  }
};

export const useApiServices = () => {
  const templateResult = useTypeSafeModuleTemplate(apiServicesConfig);

  return {
    ...templateResult,
    // Legacy compatibility
    apiServices: templateResult.items,
    isLoading: templateResult.isLoading,
    // Specific API service methods
    activateService: async (serviceId: string) => {
      return templateResult.updateItem(serviceId, { status: 'active' });
    },
    deactivateService: async (serviceId: string) => {
      return templateResult.updateItem(serviceId, { status: 'inactive' });
    }
  };
};
