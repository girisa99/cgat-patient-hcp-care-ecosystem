
/**
 * MASTER ROLE MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all role and module management functionality
 * Version: master-role-management-v1.0.0
 */
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMasterRoleManagement = () => {
  const { userRoles, isAuthenticated } = useMasterAuth();
  const { modules, users, facilities, isLoading } = useMasterData(isAuthenticated);

  console.log('🔐 Master Role Management - Single source of truth active');

  // Active modules
  const activeModules = modules.filter(m => m.is_active);
  const activeFacilities = facilities.filter(f => f.is_active);
  
  // Fetch real roles from database
  const { data: rolesData = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const roles = rolesData;
  const permissions = []; // Permissions not implemented yet

  // Role-based access
  const hasRole = (role: string) => userRoles.includes(role);
  const isAdmin = hasRole('superAdmin') || hasRole('onboardingTeam');

  return {
    // Data - now includes all required fields
    modules,
    activeModules,
    users,
    facilities,
    activeFacilities,
    roles,
    activeRoles: roles,
    permissions,
    
    // Status
    isLoading,
    
    // Access control
    hasRole,
    isAdmin,
    userRoles,
    
    // Meta
    meta: {
      dataSource: 'master_data_consolidated',
      version: 'master-role-management-v1.0.0',
      moduleCount: modules.length,
      activeModuleCount: activeModules.length,
      facilityCount: facilities.length,
      activeFacilityCount: activeFacilities.length,
      roleCount: roles.length,
      activeRoleCount: roles.length,
      permissionCount: permissions.length
    }
  };
};
