/**
 * Roles Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const rolesConfig = {
  tableName: 'roles',
  moduleName: 'Roles',
  requiredFields: ['name'],
  customValidation: (data: any) => {
    return data.name && data.name.length > 0;
  }
};

export const useRoles = () => {
  const templateResult = useTypeSafeModuleTemplate(rolesConfig);

  return {
    ...templateResult,
    // Add any role-specific methods here if needed
    meta: {
      ...templateResult.meta,
      moduleType: 'roles',
      description: 'Role management and permissions'
    }
  };
};