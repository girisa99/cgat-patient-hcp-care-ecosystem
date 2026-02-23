
import { useMasterUserManagement } from './useMasterUserManagement';
import { useMasterAuth } from './useMasterAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboard = () => {
  const { isAuthenticated, userRoles } = useMasterAuth();
  const userManagement = useMasterUserManagement();

  // Fetch facilities count from DB
  const { data: facilitiesCount = 0 } = useQuery({
    queryKey: ['dashboard-facilities-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true });
      if (error) { console.warn('Facilities count error:', error.message); return 0; }
      return count || 0;
    },
    staleTime: 60_000,
  });

  // Fetch modules count from DB
  const { data: modulesCount = 0 } = useQuery({
    queryKey: ['dashboard-modules-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true });
      if (error) { console.warn('Modules count error:', error.message); return 0; }
      return count || 0;
    },
    staleTime: 60_000,
  });

  // Fetch recent activity from user_activity_logs
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['dashboard-recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('id, action, details, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) { console.warn('Activity log error:', error.message); return []; }
      return data || [];
    },
    staleTime: 30_000,
  });

  const getDashboardStats = () => {
    const stats = userManagement.getUserStats();

    return {
      totalUsers: stats.totalUsers,
      totalFacilities: facilitiesCount,
      totalPatients: stats.patientCount,
      totalModules: modulesCount,
      activeUsers: stats.activeUsers,
      adminUsers: stats.adminCount,
      staffUsers: userManagement.staffCount,
      patientUsers: stats.patientCount,
    };
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
    recentActivity,
    systemHealth: getSystemHealth(),
    userPermissions: getUserPermissions(),
    isLoading: userManagement.isLoading,
    error: userManagement.error,
  };
};
