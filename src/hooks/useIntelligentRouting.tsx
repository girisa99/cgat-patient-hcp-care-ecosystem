
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';

/**
 * Intelligent routing hook - MASTER DATA INTEGRATION
 */
export const useIntelligentRouting = () => {
  console.log('🚀 Intelligent Routing - Master data integration active');
  
  const authData = useMasterAuth();
  const masterData = useMasterData();

  const moduleProgress = masterData.modules.reduce((acc, module) => {
    acc[module.name] = {
      completed: module.is_active ? 100 : 0,
      total: 100,
      status: module.is_active ? 'completed' : 'pending'
    };
    return acc;
  }, {} as Record<string, any>);

  return {
    // Module progress based on actual data
    moduleProgress,
    
    // Navigation recommendations based on user roles
    recommendedRoutes: authData.userRoles.includes('superAdmin') 
      ? ['/users', '/modules', '/facilities', '/api-services']
      : ['/dashboard', '/patients'],
    
    // Meta information
    meta: {
      dataSource: 'master_data_intelligent_routing',
      hookVersion: 'master-routing-v1.0.0',
      userRoles: authData.userRoles,
      totalModules: masterData.stats.totalModules
    }
  };
};
