import { useState, useEffect } from 'react';
import { UnifiedCoreVerificationService } from '@/utils/verification/core/UnifiedCoreVerificationService';
import { RealVerificationOrchestrator } from '@/utils/verification/RealVerificationOrchestrator';
import { useRealFacilities } from './useRealFacilities';
import { useRealDatabaseValidation } from './useRealDatabaseValidation';

/**
 * Unified Page Data Hook - REAL DATA ONLY, NO MOCK
 * Uses the comprehensive verification system with real database connections
 * Implements Verify, Validate, Update pattern - Single Source of Truth
 */
export const useUnifiedPageData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  
  // Use real verification service - NO MOCK DATA
  const verificationService = UnifiedCoreVerificationService.getInstance({
    enforceRealDataOnly: true,
    preventDuplicates: true,
    strictMode: true
  });

  // Real database hooks
  const realFacilities = useRealFacilities();
  const { validateNow, isValidating } = useRealDatabaseValidation();

  useEffect(() => {
    const initializeRealSystem = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 Initializing REAL verification system - NO MOCK DATA');
        
        // Start real-time monitoring
        verificationService.startBackgroundMonitoring();
        
        // Perform comprehensive real system validation
        const systemValidation = await RealVerificationOrchestrator.performRealSystemValidation();
        
        // Scan and register all real entities
        await verificationService.scanAndRegisterEntities();
        
        // Get real system status
        const systemStatus = await verificationService.getSystemStatus();
        
        setVerificationResults({
          systemValidation,
          systemStatus,
          timestamp: new Date().toISOString()
        });

        setIsLoading(false);
        console.log('✅ Real verification system initialized successfully');
        
      } catch (err) {
        console.error('❌ Real verification system initialization failed:', err);
        const error = err instanceof Error ? err : new Error('Verification system initialization failed');
        setError(error);
        setIsLoading(false);
      }
    };

    initializeRealSystem();
    
    // Cleanup on unmount
    return () => {
      verificationService.stopBackgroundMonitoring();
    };
  }, []);

  // Real facilities data with verification
  const facilities = {
    data: realFacilities.facilities,
    isLoading: realFacilities.isLoading,
    error: realFacilities.error,
    getFacilityStats: () => {
      const total = realFacilities.facilities.length;
      const active = realFacilities.facilities.filter(f => f.is_active).length;
      const inactive = total - active;
      const typeBreakdown = realFacilities.facilities.reduce((acc: any, facility) => {
        const type = facility.facility_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        active,
        inactive,
        typeBreakdown,
        byType: typeBreakdown
      };
    },
    searchFacilities: (query: string) => {
      if (!query.trim()) return realFacilities.facilities;
      return realFacilities.facilities.filter(facility => 
        facility.name.toLowerCase().includes(query.toLowerCase()) ||
        facility.address?.toLowerCase().includes(query.toLowerCase()) ||
        facility.facility_type.toLowerCase().includes(query.toLowerCase())
      );
    },
    meta: realFacilities.meta
  };

  // Real users data (from verification system registry)
  const users = {
    data: verificationResults?.systemStatus?.registry?.users ? 
          Array.from(verificationResults.systemStatus.registry.users.values()) : [],
    isLoading: isLoading || isValidating,
    error: error,
    getUserStats: () => {
      const userData = verificationResults?.systemStatus?.registry?.users ? 
                      Array.from(verificationResults.systemStatus.registry.users.values()) : [];
      return {
        total: userData.length,
        active: userData.filter((u: any) => u.metadata?.isActive).length,
        totalUsers: userData.length,
        activeUsers: userData.filter((u: any) => u.metadata?.lastSignIn).length,
        totalFacilities: facilities.data.length,
        totalModules: verificationResults?.systemStatus?.registry?.hooks?.size || 0,
        totalApis: verificationResults?.systemStatus?.registry?.apis?.size || 0,
        totalPermissions: 0
      };
    },
    getPatients: () => {
      const userData = verificationResults?.systemStatus?.registry?.users ? 
                      Array.from(verificationResults.systemStatus.registry.users.values()) : [];
      return userData.filter((u: any) => u.metadata?.role === 'patientCaregiver');
    },
    getStaff: () => {
      const userData = verificationResults?.systemStatus?.registry?.users ? 
                      Array.from(verificationResults.systemStatus.registry.users.values()) : [];
      return userData.filter((u: any) => ['doctor', 'nurse'].includes(u.metadata?.role));
    },
    getAdmins: () => {
      const userData = verificationResults?.systemStatus?.registry?.users ? 
                      Array.from(verificationResults.systemStatus.registry.users.values()) : [];
      return userData.filter((u: any) => u.metadata?.role === 'admin');
    },
    searchUsers: (query: string) => {
      const userData = verificationResults?.systemStatus?.registry?.users ? 
                      Array.from(verificationResults.systemStatus.registry.users.values()) : [];
      if (!query.trim()) return userData;
      return userData.filter((user: any) => 
        user.name?.toLowerCase().includes(query.toLowerCase()) ||
        user.metadata?.email?.toLowerCase().includes(query.toLowerCase())
      );
    },
    meta: {
      totalUsers: verificationResults?.systemStatus?.registry?.users?.size || 0,
      dataSource: 'verification-system-registry (real database)',
      lastUpdated: new Date().toISOString()
    }
  };

  // Real modules data (from verification system registry)
  const modules = {
    data: verificationResults?.systemStatus?.registry?.hooks ? 
          Array.from(verificationResults.systemStatus.registry.hooks.values()) : [],
    isLoading: isLoading || isValidating,
    error: error,
    getModuleStats: () => {
      const moduleData = verificationResults?.systemStatus?.registry?.hooks ? 
                        Array.from(verificationResults.systemStatus.registry.hooks.values()) : [];
      const total = moduleData.length;
      const active = moduleData.filter((m: any) => m.metadata?.isActive !== false).length;
      const inactive = total - active;
      const userAccessible = active;
      const byCategory = moduleData.reduce((acc: any, module: any) => {
        const category = module.metadata?.category || 'general';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        active,
        inactive,
        userAccessible,
        byCategory
      };
    },
    searchModules: (query: string) => {
      const moduleData = verificationResults?.systemStatus?.registry?.hooks ? 
                        Array.from(verificationResults.systemStatus.registry.hooks.values()) : [];
      if (!query.trim()) return moduleData;
      return moduleData.filter((module: any) => 
        module.name?.toLowerCase().includes(query.toLowerCase()) ||
        module.metadata?.description?.toLowerCase().includes(query.toLowerCase())
      );
    },
    meta: {
      totalModules: verificationResults?.systemStatus?.registry?.hooks?.size || 0,
      dataSource: 'verification-system-registry (real database)',
      lastUpdated: new Date().toISOString()
    }
  };

  // Real API services data (from verification system registry)
  const apiServices = {
    data: verificationResults?.systemStatus?.registry?.apis ? 
          Array.from(verificationResults.systemStatus.registry.apis.values()) : [],
    isLoading: isLoading || isValidating,
    error: error,
    getApiStats: () => {
      const apiData = verificationResults?.systemStatus?.registry?.apis ? 
                     Array.from(verificationResults.systemStatus.registry.apis.values()) : [];
      const total = apiData.length;
      const active = apiData.filter((api: any) => api.metadata?.status === 'active').length;
      const byType = apiData.reduce((acc: any, api: any) => {
        const type = api.metadata?.type || 'REST';
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
      const apiData = verificationResults?.systemStatus?.registry?.apis ? 
                     Array.from(verificationResults.systemStatus.registry.apis.values()) : [];
      if (!query.trim()) return apiData;
      return apiData.filter((api: any) => 
        api.name?.toLowerCase().includes(query.toLowerCase()) ||
        api.metadata?.description?.toLowerCase().includes(query.toLowerCase())
      );
    },
    meta: {
      totalApis: verificationResults?.systemStatus?.registry?.apis?.size || 0,
      dataSource: 'verification-system-registry (real database)',
      lastUpdated: new Date().toISOString()
    }
  };

  // Real-time refresh using verification system
  const refreshAllData = async () => {
    console.log('🔄 Refreshing all data from real verification system...');
    try {
      await verificationService.scanAndRegisterEntities();
      const systemStatus = await verificationService.getSystemStatus();
      const systemValidation = await RealVerificationOrchestrator.performRealSystemValidation();
      
      setVerificationResults({
        systemValidation,
        systemStatus,
        timestamp: new Date().toISOString()
      });
      
      await realFacilities.refetch();
      console.log('✅ All real data refreshed successfully');
    } catch (err) {
      console.error('❌ Real data refresh failed:', err);
    }
  };

  console.log('🎯 Unified Page Data - REAL VERIFICATION SYSTEM ACTIVE');
  console.log('📊 Real Data Sources:', {
    facilities: facilities.meta.dataSource,
    users: users.meta.dataSource,
    modules: modules.meta.dataSource,
    apiServices: apiServices.meta.dataSource
  });

  return {
    isLoading,
    error,
    hasError: !!error,
    
    // All real data - NO MOCK
    facilities,
    users,
    modules,
    apiServices,
    
    // Real-time stats from verification system
    realTimeStats: {
      totalUsers: users.data.length,
      activeUsers: users.data.filter((u: any) => u.metadata?.isActive).length,
      totalFacilities: facilities.data.length,
      totalModules: modules.data.length,
      totalApis: apiServices.data.length,
      totalPermissions: 0,
      total: users.data.length + facilities.data.length + modules.data.length
    },
    
    // Real verification system methods
    refreshAllData,
    validateNow,
    
    // Real verification results
    verificationResults,
    
    meta: {
      implementationLocked: true,
      version: 'unified-real-verification-v3.0.0',
      singleSourceValidated: true,
      dataSourcesCount: 4,
      lastUpdated: new Date().toISOString(),
      principle: 'Verify, Validate, Update - Single Source of Truth - REAL DATA ONLY'
    }
  };
};
