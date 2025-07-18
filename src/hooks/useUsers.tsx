/**
 * Users Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const usersConfig = {
  tableName: 'profiles',
  moduleName: 'Users',
  requiredFields: ['first_name', 'email'],
  customValidation: (data: any) => {
    return data.first_name && data.email;
  }
};

export const useUsers = () => {
  const templateResult = useTypeSafeModuleTemplate(usersConfig);

  return {
    ...templateResult,
    // Add any user-specific methods here if needed
    meta: {
      ...templateResult.meta,
      moduleType: 'users',
      description: 'User management and profile administration'
    }
  };
};