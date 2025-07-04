
/**
 * MASTER ROLE MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all role and module management functionality
 * Version: master-role-management-v1.0.0
 */
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';

export const useMasterRoleManagement = () => {
  const { modules, users, isLoading } = useMasterData();
  const { userRoles } = useMasterAuth();

  console.log('🔐 Master Role Management - Single source of truth active');

  // Active modules
  const activeModules = modules.filter(m => m.is_active);

  // Role-based access
  const hasRole = (role: string) => userRoles.includes(role);
  const isAdmin = hasRole('superAdmin') || hasRole('onboardingTeam');

  return {
    // Data
    modules,
    activeModules,
    users,
    
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
      activeModuleCount: activeModules.length
    }
  };
};
