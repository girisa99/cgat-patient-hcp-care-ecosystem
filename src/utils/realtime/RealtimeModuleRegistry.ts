
/**
 * Centralized Real-time Module Registry
 * Ensures all admin modules have real-time capabilities
 */

import { realtimeManager } from './RealtimeManager';

export interface AdminModuleConfig {
  tableName: string;
  moduleName: string;
  dashboardImpact: boolean;
  userManagementImpact: boolean;
  facilityImpact: boolean;
  rbacImpact: boolean;
  apiIntegrationImpact: boolean;
}

export class RealtimeModuleRegistry {
  private adminModules: AdminModuleConfig[] = [
    {
      tableName: 'modules',
      moduleName: 'Modules',
      dashboardImpact: true,
      userManagementImpact: false,
      facilityImpact: false,
      rbacImpact: true,
      apiIntegrationImpact: true
    },
    {
      tableName: 'user_roles',
      moduleName: 'UserRoles',
      dashboardImpact: true,
      userManagementImpact: true,
      facilityImpact: false,
      rbacImpact: true,
      apiIntegrationImpact: false
    },
    {
      tableName: 'roles',
      moduleName: 'Roles',
      dashboardImpact: true,
      userManagementImpact: true,
      facilityImpact: false,
      rbacImpact: true,
      apiIntegrationImpact: false
    },
    {
      tableName: 'facilities',
      moduleName: 'Facilities',
      dashboardImpact: true,
      userManagementImpact: true,
      facilityImpact: true,
      rbacImpact: false,
      apiIntegrationImpact: true
    },
    {
      tableName: 'user_module_assignments',
      moduleName: 'UserModuleAssignments',
      dashboardImpact: true,
      userManagementImpact: true,
      facilityImpact: false,
      rbacImpact: true,
      apiIntegrationImpact: false
    },
    {
      tableName: 'role_module_assignments',
      moduleName: 'RoleModuleAssignments',
      dashboardImpact: true,
      userManagementImpact: true,
      facilityImpact: false,
      rbacImpact: true,
      apiIntegrationImpact: false
    },
    {
      tableName: 'user_facility_access',
      moduleName: 'UserFacilityAccess',
      dashboardImpact: true,
      userManagementImpact: true,
      facilityImpact: true,
      rbacImpact: true,
      apiIntegrationImpact: false
    },
    {
      tableName: 'permissions',
      moduleName: 'Permissions',
      dashboardImpact: false,
      userManagementImpact: true,
      facilityImpact: false,
      rbacImpact: true,
      apiIntegrationImpact: false
    },
    {
      tableName: 'user_permissions',
      moduleName: 'UserPermissions',
      dashboardImpact: true,
      userManagementImpact: true,
      facilityImpact: false,
      rbacImpact: true,
      apiIntegrationImpact: false
    },
    {
      tableName: 'role_permissions',
      moduleName: 'RolePermissions',
      dashboardImpact: true,
      userManagementImpact: true,
      facilityImpact: false,
      rbacImpact: true,
      apiIntegrationImpact: false
    },
    {
      tableName: 'api_integration_registry',
      moduleName: 'ApiIntegrations',
      dashboardImpact: true,
      userManagementImpact: false,
      facilityImpact: false,
      rbacImpact: false,
      apiIntegrationImpact: true
    }
  ];

  /**
   * Initialize all admin modules for real-time updates
   */
  async initializeAdminModules() {
    console.log('🔄 Initializing real-time for all admin modules...');
    
    for (const moduleConfig of this.adminModules) {
      await realtimeManager.registerModule({
        tableName: moduleConfig.tableName,
        moduleName: moduleConfig.moduleName,
        enableInsert: true,
        enableUpdate: true,
        enableDelete: true,
        enableBulkOperations: true
      });
    }

    console.log(`✅ Initialized real-time for ${this.adminModules.length} admin modules`);
  }

  /**
   * Get modules that impact a specific area
   */
  getModulesImpacting(area: keyof Omit<AdminModuleConfig, 'tableName' | 'moduleName'>): AdminModuleConfig[] {
    return this.adminModules.filter(module => module[area]);
  }

  /**
   * Get all registered admin modules
   */
  getAllAdminModules(): AdminModuleConfig[] {
    return [...this.adminModules];
  }

  /**
   * Check if a table is registered as an admin module
   */
  isAdminModule(tableName: string): boolean {
    return this.adminModules.some(module => module.tableName === tableName);
  }
}

export const realtimeModuleRegistry = new RealtimeModuleRegistry();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  setTimeout(() => {
    realtimeModuleRegistry.initializeAdminModules();
  }, 1500);
}
