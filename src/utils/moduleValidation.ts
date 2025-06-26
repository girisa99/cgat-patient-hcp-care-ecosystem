
/**
 * Module Validation Types and Functions
 */

import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

export interface ModuleConfig {
  moduleName: string;
  tableName: string;
  requiredFields: string[];
  optionalFields?: string[];
  customValidation?: (data: any) => boolean;
}

export const validateModuleConfig = (config: ModuleConfig): boolean => {
  if (!config.moduleName || !config.tableName) return false;
  if (!config.requiredFields || !Array.isArray(config.requiredFields)) return false;
  return true;
};

/**
 * Validate if a table exists in the database schema
 */
export const validateTableExists = (tableName: string): boolean => {
  // List of known tables from the database schema
  const validTables: DatabaseTables[] = [
    'profiles',
    'facilities', 
    'modules',
    'roles',
    'user_roles',
    'permissions',
    'audit_logs',
    'role_permissions',
    'user_permissions',
    'module_permissions',
    'user_facility_access',
    'role_module_assignments',
    'user_module_assignments',
    'role_permission_overrides',
    'api_keys',
    'api_usage_logs',
    'api_usage_analytics',
    'api_consumption_logs',
    'api_integration_registry',
    'api_lifecycle_events',
    'external_api_registry',
    'external_api_endpoints',
    'external_api_change_logs',
    'marketplace_listings',
    'developer_applications',
    'developer_notifications',
    'developer_notification_preferences',
    'developer_portal_applications'
  ];

  return validTables.includes(tableName as DatabaseTables);
};

/**
 * Pre-module creation validation check
 */
export const preModuleCreationCheck = async (config: ModuleConfig): Promise<void> => {
  console.log('🔍 Running pre-module creation check...');
  
  // Validate module configuration
  if (!validateModuleConfig(config)) {
    throw new Error('Invalid module configuration');
  }

  // Validate table exists
  if (!validateTableExists(config.tableName)) {
    throw new Error(`Table '${config.tableName}' does not exist in database schema`);
  }

  // Validate module name format (PascalCase)
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(config.moduleName)) {
    throw new Error(`Module name '${config.moduleName}' must be PascalCase`);
  }

  // Validate required fields
  if (!config.requiredFields || config.requiredFields.length === 0) {
    console.warn(`⚠️ No required fields specified for ${config.moduleName}`);
  }

  console.log(`✅ Pre-module creation check passed for ${config.moduleName}`);
};

/**
 * Validate database table schema alignment
 */
export const validateTableSchema = (tableName: string, requiredColumns: string[]): boolean => {
  if (!validateTableExists(tableName)) {
    return false;
  }

  // For now, we'll assume all required columns exist
  // In a real implementation, this would query the database schema
  console.log(`📋 Validating table schema for ${tableName} with columns:`, requiredColumns);
  return true;
};

/**
 * Get available columns for a table (mock implementation)
 */
export const getTableColumns = (tableName: string): string[] => {
  const columnMappings: Record<string, string[]> = {
    profiles: ['id', 'first_name', 'last_name', 'email', 'phone', 'facility_id', 'created_at', 'updated_at'],
    facilities: ['id', 'name', 'facility_type', 'address', 'phone', 'email', 'is_active'],
    modules: ['id', 'name', 'description', 'is_active'],
    roles: ['id', 'name', 'description'],
    user_roles: ['id', 'user_id', 'role_id', 'created_at'],
    permissions: ['id', 'name', 'description'],
    audit_logs: ['id', 'user_id', 'action', 'table_name', 'record_id', 'created_at']
  };

  return columnMappings[tableName] || ['id'];
};
