
import { useApiServices } from './useApiServices';
import { useApiServiceDetails } from './useApiServiceDetails';

/**
 * Dedicated hook for API Services page - LOCKED IMPLEMENTATION
 * This hook ensures the API Services page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for API Services page
 */
export const useApiServicesPage = () => {
  console.log('🔒 API Services Page Hook - Locked implementation active');
  
  // Use the consolidated API services hook as single source of truth
  const apiServicesData = useApiServices();
  const apiDetailsData = useApiServiceDetails();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    integrations: apiServicesData.integrations || [],
    consolidatedApiData: apiDetailsData.consolidatedApiData,
    
    // Loading states - LOCKED
    isLoading: apiServicesData.isLoading || apiDetailsData.isLoading,
    
    // Actions - LOCKED
    createIntegration: apiServicesData.createIntegration,
    updateIntegration: apiServicesData.updateIntegration,
    generatePostmanCollection: apiDetailsData.generatePostmanCollection,
    
    // Status flags - LOCKED
    isCreating: apiServicesData.isCreating,
    isUpdating: apiServicesData.isUpdating,
    
    // Meta information - LOCKED
    meta: {
      totalIntegrations: apiServicesData.integrations?.length || 0,
      dataSource: 'api_integration_registry',
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};
