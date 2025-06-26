
/**
 * Module Validation Types and Functions
 */

export interface ModuleConfig {
  moduleName: string;
  tableName: string;
  requiredFields: string[];
  optionalFields?: string[];
}

export const validateModuleConfig = (config: ModuleConfig): boolean => {
  if (!config.moduleName || !config.tableName) return false;
  if (!config.requiredFields || !Array.isArray(config.requiredFields)) return false;
  return true;
};
