
/**
 * Module Permissions Hook
 * Focused on module access control
 */

import { useAuthContext } from '@/components/auth/AuthProvider';
import { useModuleData } from './useModuleData';

export const useModulePermissions = () => {
  const { userRoles } = useAuthContext();
  const { userModules } = useModuleData();

  // Check if user has access to a specific module
  const hasModuleAccess = (moduleName: string): boolean => {
    // Super admins have access to all modules
    if (userRoles.includes('superAdmin')) {
      console.log('🔑 Super admin has access to all modules:', moduleName);
      return true;
    }

    const hasAccess = userModules?.some(module => module.module_name === moduleName) || false;
    console.log('🔍 Module access check:', moduleName, 'Access:', hasAccess);
    console.log('🔍 User modules:', userModules?.map(m => m.module_name));
    return hasAccess;
  };

  return {
    hasModuleAccess,
    userModules: userModules || []
  };
};
