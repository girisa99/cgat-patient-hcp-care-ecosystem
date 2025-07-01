
import { useConsolidatedDataImport } from './useConsolidatedDataImport';

/**
 * Dedicated hook for Data Import page - LOCKED IMPLEMENTATION
 * This hook ensures the Data Import page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for Data Import page
 */
export const useDataImportPage = () => {
  console.log('🔒 Data Import Page Hook - Locked implementation active');
  
  // Use consolidated data import as single source of truth
  const importData = useConsolidatedDataImport();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    importUsers: importData.importUsers,
    importFacilities: importData.importFacilities,
    parseCSV: importData.parseCSV,
    validateData: importData.validateData,
    
    // Status flags - LOCKED
    isImporting: importData.isImporting,
    importProgress: importData.importProgress,
    
    // Meta information - LOCKED
    meta: {
      dataSource: importData.meta.dataSource,
      version: importData.meta.version,
      supportedTypes: importData.meta.supportedTypes,
      usesConsolidatedHooks: importData.meta.usesConsolidatedHooks,
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};
