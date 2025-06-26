/**
 * Module Validation Utilities
 * 
 * This file provides TypeScript validation and verification before creating
 * new modules, ensuring database schema compatibility and code safety.
 */

import type { Database } from '@/integrations/supabase/types';

// Extract all table names from the database schema
type DatabaseTables = keyof Database['public']['Tables'];

// Define allowed operations for each table
export const ALLOWED_TABLE_OPERATIONS = {
  SELECT: ['*', 'id', 'created_at', 'updated_at'] as const,
  INSERT: ['required_fields_validation'] as const,
  UPDATE: ['id_and_updates_validation'] as const,
  DELETE: ['id_validation'] as const,
} as const;

/**
 * Validates if a table exists in the database schema
 */
export const validateTableExists = (tableName: string): tableName is DatabaseTables => {
  const validTables: DatabaseTables[] = [
    'audit_logs',
    'facilities', 
    'module_permissions',
    'modules',
    'permissions',
    'profiles',
    'role_module_assignments',
    'role_permission_overrides',
    'role_permissions',
    'roles',
    'user_facility_access',
    'user_module_assignments',
    'user_permissions',
    'user_roles',
    'api_integration_registry',
    'api_keys',
    'external_api_registry',
    'external_api_endpoints',
    'developer_portal_applications',
    'api_usage_analytics',
    'marketplace_listings',
    'external_api_change_logs',
    'api_consumption_logs',
    'api_lifecycle_events',
    'api_usage_logs',
    'developer_applications',
    'developer_notification_preferences',
    'developer_notifications'
  ];
  
  return validTables.includes(tableName as DatabaseTables);
};

/**
 * Gets the TypeScript interface for a specific table
 */
export const getTableInterface = <T extends DatabaseTables>(tableName: T) => {
  // This function returns the type structure, not actual data
  return {} as Database['public']['Tables'][T]['Row'];
};

/**
 * Validates module configuration before creation
 */
export interface ModuleConfig {
  tableName: string;
  moduleName: string;
  requiredFields: string[];
  optionalFields?: string[];
  customValidation?: (data: any) => boolean;
}

export const validateModuleConfig = (config: ModuleConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate table exists
  if (!validateTableExists(config.tableName)) {
    errors.push(`Table '${config.tableName}' does not exist in database schema`);
  }

  // Validate module name format
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(config.moduleName)) {
    errors.push(`Module name '${config.moduleName}' must be PascalCase`);
  }

  // Validate required fields
  if (!config.requiredFields || config.requiredFields.length === 0) {
    warnings.push('No required fields specified - consider adding validation');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Pre-creation checks for new modules
 */
export const preModuleCreationCheck = async (config: ModuleConfig) => {
  console.log(`🔍 Running pre-creation checks for ${config.moduleName}...`);
  
  const validation = validateModuleConfig(config);
  
  if (!validation.isValid) {
    console.error('❌ Module validation failed:', validation.errors);
    throw new Error(`Module validation failed: ${validation.errors.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Module warnings:', validation.warnings);
  }

  console.log('✅ Pre-creation checks passed');
  return validation;
};

/**
 * Runtime type checking for database operations
 */
export const createTypeSafeSupabaseClient = (tableName: DatabaseTables) => {
  return {
    tableName,
    validateOperation: (operation: keyof typeof ALLOWED_TABLE_OPERATIONS) => {
      console.log(`🔒 Validating ${operation} operation on ${tableName}`);
      return true; // Add actual validation logic here
    }
  };
};
