
/**
 * Consolidated Data Management Utilities
 * 
 * Single source of truth for all data validation and management patterns
 * Following the proven user management system architecture
 */

/**
 * Standardized error messages for all data operations
 */
export const CONSOLIDATED_ERROR_MESSAGES = {
  FETCH_FAILED: (entity: string) => `Failed to fetch ${entity} data from database`,
  VALIDATION_FAILED: (entity: string) => `${entity} data validation failed`,
  UNAUTHORIZED_ACCESS: (entity: string) => `Unauthorized access to ${entity} data`,
  CREATE_FAILED: (entity: string) => `Failed to create ${entity}`,
  UPDATE_FAILED: (entity: string) => `Failed to update ${entity}`,
  DELETE_FAILED: (entity: string) => `Failed to delete ${entity}`
} as const;

/**
 * Creates standardized query keys for consistent cache management
 */
export const createConsolidatedQueryKey = (entity: string, operation: string, filters?: Record<string, any>) => {
  const baseKey = [entity, operation];
  return filters ? [...baseKey, filters] : baseKey;
};

/**
 * Validates data structure to ensure consistency across all entities
 */
export const validateConsolidatedData = (data: any, requiredFields: string[], entityName: string) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    console.error(`❌ ${entityName} data validation failed. Missing fields:`, missingFields, data);
    throw new Error(`Invalid ${entityName} data: missing ${missingFields.join(', ')}`);
  }
  
  return true;
};

/**
 * Standardized statistics calculation for all entities
 */
export const calculateEntityStats = (items: any[], statusField: string = 'is_active') => {
  return {
    total: items.length,
    active: items.filter(item => item[statusField] !== false).length,
    inactive: items.filter(item => item[statusField] === false).length
  };
};

/**
 * Universal search function for all entities
 */
export const searchEntities = (items: any[], query: string, searchFields: string[]) => {
  if (!query.trim()) return items;
  
  return items.filter(item => 
    searchFields.some(field => 
      item[field]?.toLowerCase().includes(query.toLowerCase())
    )
  );
};

/**
 * CONSOLIDATION GUIDELINES:
 * 
 * All data management across the application should:
 * 1. Use these standardized utilities
 * 2. Follow the unified user management pattern
 * 3. Use consistent error handling and messaging
 * 4. Implement proper validation before processing
 * 5. Use standardized cache management
 * 6. Provide meta information for debugging
 * 
 * Entities covered:
 * - Users (✅ Complete single source of truth)
 * - Patients (✅ Uses consolidated approach)
 * - Facilities (✅ Now consolidated)
 * - Modules (✅ Now consolidated)
 * - API Services (✅ Now consolidated)
 * - Data Import (Next to consolidate)
 */
