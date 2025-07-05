/**
 * MASTER ROLE MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all role and module management functionality
 * Version: master-role-management-v1.0.0
 */
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';

export const useMasterRoleManagement = () => {
  const { modules, users, facilities, roles, isLoading, createModule, isCreatingModule } = useMasterData();
  const { userRoles } = useMasterAuth();

  console.log('🔐 Master Role Management - Single source of truth active');

  // Active modules
  const activeModules = modules.filter(m => m.is_active);
  const activeFacilities = facilities.filter(f => f.is_active);
  
  // Mock permissions data
  const permissions = [
    { id: '1', name: 'user_management', description: 'Manage users' },
    { id: '2', name: 'facility_management', description: 'Manage facilities' },
    { id: '3', name: 'module_management', description: 'Manage modules' },
    { id: '4', name: 'role_management', description: 'Manage roles' }
  ];

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
    },

    // Module operations
    createModule,
    isCreatingModule
  };
};
