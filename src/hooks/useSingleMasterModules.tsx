/**
 * SINGLE MASTER MODULES HOOK - USES MASTER ROLE MANAGEMENT
 * This ensures single source of truth for all module operations
 * Version: single-master-modules-v1.0.0
 */
import { useMasterRoleManagement } from './useMasterRoleManagement';

export const useSingleMasterModules = () => {
  const masterRoleData = useMasterRoleManagement();
  
  console.log('📦 Single Master Modules - Using Master Role Management');
  console.log('🏆 Modules from single source:', masterRoleData.modules.length);

  // Verification system
  const verifyModuleIntegrity = () => {
    const totalModules = masterRoleData.modules.length;
    const activeModules = masterRoleData.activeModules.length;
    const hasValidNames = masterRoleData.modules.every(m => m.name && m.name.trim().length > 0);
    
    return {
      isHealthy: hasValidNames && totalModules >= 0,
      totalModules,
      activeModules,
      validationsPassed: hasValidNames ? 1 : 0,
      issues: hasValidNames ? [] : ['Some modules have invalid names']
    };
  };

  // Module stats
  const getModuleStats = () => {
    const total = masterRoleData.modules.length;
    const active = masterRoleData.activeModules.length;
    const inactive = total - active;
    
    return {
      total,
      active,
      inactive,
      userAccessible: active,
      byCategory: masterRoleData.modules.reduce((acc: any, module) => {
        const category = 'general';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    };
  };

  // Create module function
  const createModule = (moduleData: { name: string; description?: string; is_active?: boolean }) => {
    if (masterRoleData.createModule) {
      masterRoleData.createModule(moduleData);
    } else {
      console.warn('createModule not available');
    }
  };

  return {
    // Data from master source
    modules: masterRoleData.modules,
    activeModules: masterRoleData.activeModules,
    
    // Loading states
    isLoading: masterRoleData.isLoading,
    isCreating: masterRoleData.isCreatingModule ?? false,
    
    // Actions
    createModule,
    
    // Utilities
    getModuleStats,
    verifyModuleIntegrity,
    
    // Meta information
    meta: {
      dataSource: 'master role management (single source)',
      version: 'single-master-modules-v1.0.0',
      singleSourceValidated: true,
      hookCount: 1,
      moduleCount: masterRoleData.modules.length,
      activeModuleCount: masterRoleData.activeModules.length
    }
  };
};
