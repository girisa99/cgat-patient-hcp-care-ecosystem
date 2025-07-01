
/**
 * Module Permissions Hook
 * Focused on module access control
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useModuleData } from './useModuleData';

export const useModulePermissions = () => {
  const { userRoles } = useAuthContext();
  const { data: modules } = useModuleData();

  // Mock user modules for now - would be fetched from user_module_assignments table
  const { data: userModules } = useQuery({
    queryKey: ['user-modules', userRoles],
    queryFn: async () => {
      console.log('🔍 Fetching user modules for roles:', userRoles);
      
      // Mock data based on user roles
      const mockUserModules = [
        {
          module_id: '1',
          module_name: 'Users',
          module_description: 'User management module',
          access_source: 'role'
        },
        {
          module_id: '2', 
          module_name: 'Patients',
          module_description: 'Patient management module',
          access_source: 'role'
        },
        {
          module_id: '3',
          module_name: 'Facilities',
          module_description: 'Facility management module', 
          access_source: 'role'
        }
      ];

      return mockUserModules;
    },
    enabled: userRoles.length > 0
  });

  // Check if user has access to a specific module
  const hasModuleAccess = (moduleName: string): boolean => {
    // Super admins have access to all modules
    if (userRoles.includes('superAdmin')) {
      console.log('🔑 Super admin has access to all modules:', moduleName);
      return true;
    }

    const hasAccess = userModules?.some(module => 
      module.module_name.toLowerCase() === moduleName.toLowerCase()
    ) || false;
    
    console.log('🔍 Module access check:', moduleName, 'Access:', hasAccess);
    return hasAccess;
  };

  return {
    hasModuleAccess,
    userModules: userModules || []
  };
};
