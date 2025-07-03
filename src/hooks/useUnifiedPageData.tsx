
import { useConsolidatedData } from './useConsolidatedData';

/**
 * Unified Page Data Hook - Now uses consolidated data with working functionality
 * This hook provides a single source of truth for all page data
 */
export const useUnifiedPageData = () => {
  console.log('🎯 Unified Page Data - Using Consolidated Data Source');
  
  // Use the consolidated data hook which has all working functionality
  const consolidatedData = useConsolidatedData();
  
  console.log('📊 Data Sources with Working Data:', {
    facilities: consolidatedData.facilities.meta.dataSource,
    users: consolidatedData.users.meta.dataSource,
    modules: consolidatedData.modules.meta.dataSource,
    apiServices: consolidatedData.apiServices.meta.dataSource
  });

  return {
    ...consolidatedData,
    
    // Maintain compatibility with existing components
    meta: {
      implementationLocked: true,
      version: 'unified-page-v2.0.0-consolidated',
      singleSourceValidated: true,
      dataSourcesCount: 4,
      lastUpdated: new Date().toISOString(),
      principle: 'Consolidated Single Source with Working Data'
    }
  };
};
