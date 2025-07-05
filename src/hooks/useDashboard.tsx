
import { useMasterUserManagement } from './useMasterUserManagement';
import { useMasterAuth } from './useMasterAuth';

export const useDashboard = () => {
  const { isAuthenticated, userRoles } = useMasterAuth();
  const userManagement = useMasterUserManagement();

  const getDashboardStats = () => {
    const stats = userManagement.getUserStats();
    
    return {
      totalUsers: stats.totalUsers,
      totalFacilities: 0, // TODO: implement facilities count
      totalPatients: stats.patientCount,
      totalModules: 0, // TODO: implement modules count
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
