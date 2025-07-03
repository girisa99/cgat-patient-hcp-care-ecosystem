import { useState, useEffect } from 'react';
import { UnifiedCoreVerificationService } from '@/utils/verification/core/UnifiedCoreVerificationService';
import { RealVerificationOrchestrator } from '@/utils/verification/RealVerificationOrchestrator';
import { useRealDatabaseValidation } from './useRealDatabaseValidation';

/**
 * Unified Page Data Hook - REGISTRY AS SINGLE SOURCE OF TRUTH
 * Uses the comprehensive verification system with registry-based data
 * Implements Verify, Validate, Update pattern - Registry-driven architecture
 */
export const useUnifiedPageData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  
  // Use verification service with proper registry population
  const verificationService = UnifiedCoreVerificationService.getInstance({
    enforceRealDataOnly: true,
    preventDuplicates: true,
    strictMode: true,
    enableRealtimeMonitoring: true,
    securityScanEnabled: true
  });

  const { validateNow, isValidating } = useRealDatabaseValidation();

  useEffect(() => {
    const initializeRegistrySystem = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 Initializing REGISTRY SYSTEM as single source of truth...');
        
        // Start real-time monitoring
        verificationService.startBackgroundMonitoring();
        
        // CRITICAL: Scan and populate the registry first
        console.log('📊 Scanning and registering all entities...');
        await verificationService.scanAndRegisterEntities();
        
        // Perform comprehensive real system validation
        console.log('✅ Running comprehensive validation...');
        const systemValidation = await RealVerificationOrchestrator.performRealSystemValidation();
        
        // Get populated registry and system status
        console.log('📋 Getting populated registry and system status...');
        const systemStatus = await verificationService.getSystemStatus();
        
        setVerificationResults({
          systemValidation,
          systemStatus,
          timestamp: new Date().toISOString()
        });

        setIsLoading(false);
        console.log('✅ Registry system initialized successfully');
        console.log('📊 Registry populated with:', {
          hooks: systemStatus.registry.hooks.size,
          components: systemStatus.registry.components.size,
          types: systemStatus.registry.types.size,
          tables: systemStatus.registry.tables.size,
          apis: systemStatus.registry.apis.size,
          routes: systemStatus.registry.routes.size,
          services: systemStatus.registry.services.size
        });
        
      } catch (err) {
        console.error('❌ Registry system initialization failed:', err);
        const error = err instanceof Error ? err : new Error('Registry system initialization failed');
        setError(error);
        setIsLoading(false);
      }
    };

    initializeRegistrySystem();
    
    // Cleanup on unmount
    return () => {
      verificationService.stopBackgroundMonitoring();
    };
  }, []);

  // Facilities data FROM REGISTRY - single source of truth
  const facilities = {
    data: verificationResults?.systemStatus?.registry?.tables ? 
          Array.from(verificationResults.systemStatus.registry.tables.values())
            .filter(entity => entity.name === 'facilities')
            .map(entity => ({
              id: entity.id,
              name: entity.metadata.displayName || entity.name,
              facility_type: entity.metadata.type || 'healthcare',
              is_active: entity.metadata.isActive !== false,
              metadata: entity.metadata
            })) : [],
    isLoading: isLoading || isValidating,
    error: error,
    getFacilityStats: () => {
      const facilityEntities = verificationResults?.systemStatus?.registry?.tables ? 
        Array.from(verificationResults.systemStatus.registry.tables.values())
          .filter(entity => entity.name === 'facilities') : [];
      
      const total = facilityEntities.length;
      const active = facilityEntities.filter(f => f.metadata?.isActive !== false).length;
      const inactive = total - active;
      
      return {
        total,
        active,
        inactive,
        typeBreakdown: { healthcare: active },
        byType: { healthcare: active }
      };
    },
    searchFacilities: (query: string) => {
      const facilityData = facilities.data;
      if (!query.trim()) return facilityData;
      return facilityData.filter(facility => 
        facility.name.toLowerCase().includes(query.toLowerCase())
      );
    },
    meta: {
      dataSource: 'registry-facilities-table (single source of truth)',
      lastUpdated: new Date().toISOString()
    }
  };

  // Users data FROM REGISTRY - single source of truth
  const users = {
    data: verificationResults?.systemStatus?.registry?.hooks ? 
          Array.from(verificationResults.systemStatus.registry.hooks.values())
            .filter(entity => entity.metadata?.category === 'user-management')
            .map(entity => ({
              id: entity.id,
              name: entity.name,
              metadata: entity.metadata,
              isRealData: entity.metadata?.isRealData || false,
              category: entity.metadata?.category
            })) : [],
    isLoading: isLoading || isValidating,
    error: error,
    getUserStats: () => {
      const userHooks = verificationResults?.systemStatus?.registry?.hooks ? 
        Array.from(verificationResults.systemStatus.registry.hooks.values())
          .filter(entity => entity.metadata?.category === 'user-management') : [];
      
      const realDataHooks = userHooks.filter(hook => hook.metadata?.isRealData);
      
      return {
        total: userHooks.length,
        active: realDataHooks.length,
        totalUsers: userHooks.length,
        activeUsers: realDataHooks.length,
        totalFacilities: facilities.data.length,
        totalModules: modules.data.length,
        totalApis: apiServices.data.length,
        totalPermissions: 0
      };
    },
    getPatients: () => {
      return users.data.filter(u => u.metadata?.category === 'patient-management');
    },
    getStaff: () => {
      return users.data.filter(u => u.metadata?.category === 'staff-management');
    },
    getAdmins: () => {
      return users.data.filter(u => u.metadata?.category === 'admin-management');
    },
    searchUsers: (query: string) => {
      if (!query.trim()) return users.data;
      return users.data.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase())
      );
    },
    meta: {
      totalUsers: users.data.length,
      dataSource: 'registry-user-hooks (single source of truth)',
      lastUpdated: new Date().toISOString()
    }
  };

  // Modules data FROM REGISTRY - single source of truth
  const modules = {
    data: verificationResults?.systemStatus?.registry?.hooks ? 
          Array.from(verificationResults.systemStatus.registry.hooks.values())
            .filter(entity => entity.metadata?.category === 'modules')
            .concat(
              Array.from(verificationResults.systemStatus.registry.tables.values())
                .filter(entity => entity.name === 'modules')
            )
            .map(entity => ({
              id: entity.id,
              name: entity.name,
              description: entity.metadata?.description || `${entity.name} module`,
              is_active: entity.metadata?.isActive !== false,
              metadata: entity.metadata
            })) : [],
    isLoading: isLoading || isValidating,
    error: error,
    getModuleStats: () => {
      const moduleEntities = modules.data;
      const total = moduleEntities.length;
      const active = moduleEntities.filter(m => m.is_active).length;
      const inactive = total - active;
      
      return {
        total,
        active,
        inactive,
        userAccessible: active,
        byCategory: { general: active }
      };
    },
    searchModules: (query: string) => {
      if (!query.trim()) return modules.data;
      return modules.data.filter(module => 
        module.name.toLowerCase().includes(query.toLowerCase()) ||
        module.description.toLowerCase().includes(query.toLowerCase())
      );
    },
    meta: {
      totalModules: modules.data.length,
      dataSource: 'registry-modules-entities (single source of truth)',
      lastUpdated: new Date().toISOString()
    }
  };

  // API services data FROM REGISTRY - single source of truth
  const apiServices = {
    data: verificationResults?.systemStatus?.registry?.apis ? 
          Array.from(verificationResults.systemStatus.registry.apis.values())
            .map(entity => ({
              id: entity.id,
              name: entity.name,
              description: entity.metadata?.description || '',
              status: entity.metadata?.isActive ? 'active' : 'inactive',
              type: entity.metadata?.type || 'REST',
              endpoints_count: entity.metadata?.endpointCount || 0,
              documentation_url: `/docs/${entity.id}`,
              created_at: entity.lastModified,
              updated_at: entity.lastModified,
              metadata: entity.metadata
            })) : [],
    isLoading: isLoading || isValidating,
    error: error,
    getApiStats: () => {
      const apiData = apiServices.data;
      const total = apiData.length;
      const active = apiData.filter(api => api.status === 'active').length;
      const byType = apiData.reduce((acc: any, api) => {
        const type = api.type || 'REST';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        active,
        byType
      };
    },
    searchApis: (query: string) => {
      if (!query.trim()) return apiServices.data;
      return apiServices.data.filter(api => 
        api.name.toLowerCase().includes(query.toLowerCase()) ||
        api.description.toLowerCase().includes(query.toLowerCase())
      );
    },
    meta: {
      totalApis: apiServices.data.length,
      dataSource: 'registry-apis (single source of truth)',
      lastUpdated: new Date().toISOString()
    }
  };

  // Real-time refresh using registry system
  const refreshAllData = async () => {
    console.log('🔄 Refreshing all data from registry system...');
    try {
      // Re-scan and populate registry
      await verificationService.scanAndRegisterEntities();
      
      // Re-validate system
      const systemStatus = await verificationService.getSystemStatus();
      const systemValidation = await RealVerificationOrchestrator.performRealSystemValidation();
      
      setVerificationResults({
        systemValidation,
        systemStatus,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ All registry data refreshed successfully');
    } catch (err) {
      console.error('❌ Registry data refresh failed:', err);
    }
  };

  console.log('🎯 Unified Page Data - REGISTRY SYSTEM AS SINGLE SOURCE OF TRUTH');
  console.log('📊 Registry Data Sources:', {
    facilities: facilities.meta.dataSource,
    users: users.meta.dataSource,
    modules: modules.meta.dataSource,
    apiServices: apiServices.meta.dataSource
  });

  // Log registry data counts
  console.log('📈 Registry Data Counts:', {
    users: users.data.length,
    facilities: facilities.data.length,
    modules: modules.data.length,
    apiServices: apiServices.data.length,
    registryStatus: verificationResults?.systemStatus ? 'populated' : 'loading'
  });

  return {
    isLoading: isLoading || isValidating,
    error: error,
    hasError: !!error,
    
    // All data from registry - SINGLE SOURCE OF TRUTH
    facilities,
    users,
    modules,
    apiServices,
    
    // Real-time stats from registry
    realTimeStats: {
      totalUsers: users.data.length,
      activeUsers: users.data.filter((u: any) => u.isRealData).length,
      totalFacilities: facilities.data.length,
      totalModules: modules.data.length,
      totalApis: apiServices.data.length,
      totalPermissions: 0,
      total: users.data.length + facilities.data.length + modules.data.length
    },
    
    // Registry system methods
    refreshAllData,
    validateNow,
    
    // Full registry access
    verificationResults,
    
    meta: {
      implementationLocked: true,
      version: 'unified-registry-verification-v4.0.0',
      singleSourceValidated: true,
      dataSourcesCount: 4,
      lastUpdated: new Date().toISOString(),
      principle: 'Verify, Validate, Update - Registry as Single Source of Truth',
      registrySystemActive: true,
      comprehensiveVerificationActive: true
    }
  };
};
