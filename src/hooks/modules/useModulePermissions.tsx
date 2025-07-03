/**
 * Module Permissions Hook - REAL DATA ONLY, NO MOCK
 * Focused on module access control using real database connections
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useModuleData } from './useModuleData';

export const useModulePermissions = () => {
  const { userRoles, user } = useAuthContext();
  const { data: modules } = useModuleData();

  // Real user modules from database - NO MOCK DATA
  const { data: userModules } = useQuery({
    queryKey: ['user-modules-real', user?.id, userRoles],
    queryFn: async () => {
      console.log('🔍 Fetching REAL user modules from database for user:', user?.id);
      
      if (!user?.id) {
        console.log('❌ No user ID available');
        return [];
      }

      try {
        // Query real user module assignments from database
        const { data: moduleAssignments, error } = await supabase
          .from('user_module_assignments')
          .select(`
            module_id,
            is_active,
            modules (
              id,
              name,
              description,
              is_active
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('❌ Error fetching user modules:', error);
          // Fall back to role-based module access if direct assignments fail
          return await fetchModulesByRole();
        }

        const realUserModules = (moduleAssignments || [])
          .filter(assignment => assignment.modules && assignment.modules.is_active)
          .map(assignment => ({
            module_id: assignment.modules.id,
            module_name: assignment.modules.name,
            module_description: assignment.modules.description,
            access_source: 'direct_assignment'
          }));

        console.log('✅ Real user modules fetched:', realUserModules.length);
        
        // If no direct assignments, check role-based access
        if (realUserModules.length === 0) {
          return await fetchModulesByRole();
        }

        return realUserModules;

      } catch (error) {
        console.error('❌ Failed to fetch user modules:', error);
        return await fetchModulesByRole();
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 60000
  });

  // Fetch modules by user roles from real database
  const fetchModulesByRole = async () => {
    if (!user?.id || userRoles.length === 0) return [];

    try {
      console.log('🔍 Fetching modules by roles:', userRoles);

      // Query role module assignments from database
      const { data: roleModules, error } = await supabase
        .from('role_module_assignments')
        .select(`
          module_id,
          role_id,
          is_active,
          modules (
            id,
            name,
            description,
            is_active
          ),
          roles (
            id,
            name
          )
        `)
        .in('role_id', userRoles.map(role => role.id || role))
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error fetching role modules:', error);
        return [];
      }

      const roleBasedModules = (roleModules || [])
        .filter(assignment => assignment.modules && assignment.modules.is_active)
        .map(assignment => ({
          module_id: assignment.modules.id,
          module_name: assignment.modules.name,
          module_description: assignment.modules.description,
          access_source: `role_${assignment.roles?.name || 'unknown'}`
        }));

      console.log('✅ Role-based modules fetched:', roleBasedModules.length);
      return roleBasedModules;

    } catch (error) {
      console.error('❌ Failed to fetch role modules:', error);
      return [];
    }
  };

  // Check if user has access to a specific module - REAL DATABASE CHECK
  const hasModuleAccess = (moduleName: string): boolean => {
    // Super admins have access to all modules
    if (userRoles.some(role => 
      typeof role === 'string' ? role === 'superAdmin' : role.name === 'superAdmin'
    )) {
      console.log('🔑 Super admin has access to all modules:', moduleName);
      return true;
    }

    const hasAccess = userModules?.some(module => 
      module.module_name.toLowerCase() === moduleName.toLowerCase()
    ) || false;
    
    console.log('🔍 Real module access check:', moduleName, 'Access:', hasAccess);
    return hasAccess;
  };

  // Get accessible modules with real data
  const getAccessibleModules = () => {
    return userModules || [];
  };

  // Check specific module access by ID
  const hasModuleAccessById = (moduleId: string): boolean => {
    return userModules?.some(module => module.module_id === moduleId) || false;
  };

  return {
    // Real data functions - NO MOCK
    hasModuleAccess,
    hasModuleAccessById,
    getAccessibleModules,
    userModules: userModules || [],
    
    // Loading and error states
    isLoading: !userModules && !!user?.id,
    
    // Meta information
    meta: {
      totalModules: userModules?.length || 0,
      dataSource: 'user_module_assignments & role_module_assignments tables (real database)',
      lastFetched: new Date().toISOString(),
      version: 'real-data-v1',
      userId: user?.id
    }
  };
};
