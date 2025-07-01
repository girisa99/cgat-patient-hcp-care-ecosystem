
/**
 * Module Configuration and Validation Utilities
 */

export interface ModuleConfig {
  tableName: string;
  moduleName: string;
  requiredFields: string[];
  customValidation?: (data: any) => boolean;
}

export const validateModuleConfig = (config: ModuleConfig): boolean => {
  return !!(
    config.tableName &&
    config.moduleName &&
    Array.isArray(config.requiredFields)
  );
};

export const getModuleDefaults = (tableName: string): Partial<ModuleConfig> => {
  return {
    tableName,
    requiredFields: ['id'],
    customValidation: undefined
  };
};
