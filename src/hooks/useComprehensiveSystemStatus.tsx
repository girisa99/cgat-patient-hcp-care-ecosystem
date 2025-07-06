
import { useState, useEffect, useCallback } from 'react';
import { useMasterData } from '@/hooks/useMasterData';
import { ComprehensiveSystemStatus } from '@/types/systemStatus';

export function useComprehensiveSystemStatus() {
  const { users, facilities, modules, apiServices, stats, isLoading, error } = useMasterData();
  const [isChecking, setIsChecking] = useState(false);
  const [systemStatus, setSystemStatus] = useState<ComprehensiveSystemStatus | null>(null);

  const calculateSystemStatus = useCallback((): ComprehensiveSystemStatus => {
    const totalModules = modules.length;
    const activeModulesCount = modules.filter(m => m.is_active).length;
    const workingModules = activeModulesCount;

    let overallHealth = 'healthy';
    if (workingModules < totalModules * 0.5) {
      overallHealth = 'critical';
    } else if (workingModules < totalModules * 0.8) {
      overallHealth = 'warning';
    }

    const recommendations: string[] = [];
    if (users.length === 0) {
      recommendations.push('No users found - consider importing user data');
    }
    if (facilities.length === 0) {
      recommendations.push('No facilities configured - add healthcare facilities');
    }
    if (modules.length === 0) {
      recommendations.push('No modules available - configure system modules');
    }

    return {
      totalUsers: stats.totalUsers,
      totalFacilities: stats.totalFacilities,
      totalModules: totalModules,
      totalApiServices: stats.totalApiServices,
      activeUsers: stats.activeUsers,
      activeFacilities: stats.activeFacilities,
      activeModules: activeModulesCount,
      activeApiServices: stats.activeApiServices.length,
      patientCount: stats.patientCount,
      adminCount: stats.adminCount,
      staffCount: stats.staffCount,
      verifiedUsers: stats.verifiedUsers,
      unverifiedUsers: stats.unverifiedUsers,
      isLoading: isLoading,
      error: error,
      lastUpdated: new Date(),
      overallHealth: overallHealth,
      workingModules: workingModules,
      userManagement: {
        moduleName: 'User Management',
        isWorking: users.length > 0,
        dataCount: users.length,
        issues: users.length === 0 ? ['No users found'] : []
      },
      facilities: {
        moduleName: 'Facilities',
        isWorking: facilities.length > 0,
        dataCount: facilities.length,
        issues: facilities.length === 0 ? ['No facilities configured'] : []
      },
      modules: {
        moduleName: 'Modules',
        isWorking: modules.length > 0,
        dataCount: modules.length,
        issues: modules.length === 0 ? ['No modules available'] : []
      },
      apiIntegrations: {
        moduleName: 'API Integrations',
        isWorking: apiServices.length > 0,
        dataCount: apiServices.length,
        issues: apiServices.length === 0 ? ['No API services configured'] : []
      },
      adminVerification: {
        moduleName: 'Admin Verification',
        isWorking: stats.adminCount > 0,
        dataCount: stats.adminCount,
        issues: stats.adminCount === 0 ? ['No admin users found'] : []
      },
      recommendations: recommendations,
      totalIssues: recommendations.length
    };
  }, [users, facilities, modules, apiServices, stats, isLoading, error]);

  const recheckStatus = useCallback(async () => {
    setIsChecking(true);
    // Simulate some checking time
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newStatus = calculateSystemStatus();
    setSystemStatus(newStatus);
    setIsChecking(false);
  }, [calculateSystemStatus]);

  useEffect(() => {
    const status = calculateSystemStatus();
    setSystemStatus(status);
  }, [calculateSystemStatus]);

  return {
    systemStatus,
    isChecking,
    recheckStatus
  };
}
