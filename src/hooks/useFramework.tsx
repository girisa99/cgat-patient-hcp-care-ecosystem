/**
 * Framework Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const frameworkConfig = {
  tableName: 'framework_configuration',
  moduleName: 'Framework',
  requiredFields: ['config_name'],
  customValidation: (data: any) => {
    return data.config_name && data.config_name.length > 0;
  }
};

export const useFramework = () => {
  const templateResult = useTypeSafeModuleTemplate(frameworkConfig);

  return {
    ...templateResult,
    // Add any framework-specific methods here if needed
    meta: {
      ...templateResult.meta,
      moduleType: 'framework',
      description: 'Framework configuration and management'
    }
  };
};