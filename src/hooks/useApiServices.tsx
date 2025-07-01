
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useApiServicesData } from './apiServices/useApiServicesData';

/**
 * Consolidated API Services Hook - Using Universal Template
 */
export const useApiServices = () => {
  const config = {
    tableName: 'api_integration_registry' as const,
    moduleName: 'ApiServices',
    requiredFields: ['name', 'type'],
    customValidation: (data: any) => {
      return !!(data.name && data.type);
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);
  const { data: apiServices, isLoading, error, refetch } = useApiServicesData();

  // API Services statistics
  const getApiStats = () => {
    const services = apiServices || [];
    const active = services.filter(s => s.status === 'active').length;
    const inactive = services.length - active;
    
    const typeBreakdown = services.reduce((acc: any, service: any) => {
      const type = service.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: services.length,
      active,
      inactive,
      typeBreakdown
    };
  };

  return {
    // Core data
    apiServices: apiServices || [],
    isLoading,
    error,
    refetch,
    
    // Enhanced functionality
    getApiStats,
    
    // Template access
    template: templateResult,
    
    // Metadata
    meta: {
      ...templateResult.meta,
      serviceCount: apiServices?.length || 0,
      dataSource: 'api_integration_registry table',
      consolidationStatus: 'CONSOLIDATED',
      templateVersion: '2.0'
    }
  };
};
