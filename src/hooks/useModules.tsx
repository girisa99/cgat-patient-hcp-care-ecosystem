/**
 * Modules Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const modulesConfig = {
  tableName: 'modules',
  moduleName: 'Modules',
  requiredFields: ['name'],
  customValidation: (data: any) => {
    return data.name && data.name.length > 0;
  }
};

export const useModules = () => {
  const templateResult = useTypeSafeModuleTemplate(modulesConfig);

  return {
    ...templateResult,
    // Add any module-specific methods here if needed
    meta: {
      ...templateResult.meta,
      moduleType: 'modules',
      description: 'System modules and configuration management'
    }
  };
};