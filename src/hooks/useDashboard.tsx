import { useMasterUserManagement } from './useMasterUserManagement';
import { useMasterAuth } from './useMasterAuth';
import { useMasterData } from './useMasterData';

export const useDashboard = () => {
  const { isAuthenticated, userRoles } = useMasterAuth();
  const userManagement = useMasterUserManagement();
  const { stats: masterStats } = useMasterData();

  const getDashboardStats = () => {
    const stats = userManagement.getUserStats();
    
    return {
      totalUsers: stats.totalUsers,
      totalFacilities: masterStats.totalFacilities,
      totalPatients: stats.patientCount,
      totalModules: masterStats.totalModules,
      activeUsers: stats.activeUsers,
      adminUsers: stats.adminCount,
      staffUsers: userManagement.staffCount,
      patientUsers: stats.patientCount,
    };
  };

  const getRecentActivity = () => {
    // TODO: implement real activity tracking
    return [];
  };

  const getSystemHealth = () => {
    return {
      status: 'healthy',
      uptime: '99.9%',
      lastUpdate: new Date(),
      totalUsers: userManagement.totalUsers,
    };
  };

  const getUserPermissions = () => {
    if (!isAuthenticated) return [];
    
    const permissions = [];
    if (userRoles.includes('superAdmin')) {
      permissions.push('admin', 'manage_users', 'manage_facilities');
    }
    if (userRoles.includes('onboardingTeam')) {
      permissions.push('onboarding', 'manage_applications');
    }
    
    return permissions;
  };

  return {
    isAuthenticated,
    userRoles,
    dashboardStats: getDashboardStats(),
    recentActivity: getRecentActivity(),
    systemHealth: getSystemHealth(),
    userPermissions: getUserPermissions(),
    isLoading: userManagement.isLoading,
    error: userManagement.error,
  };
};
