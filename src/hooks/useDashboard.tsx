
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/DatabaseAuthProvider';
import { useMasterUserManagement } from './useMasterUserManagement';
import { useFacilities } from './useFacilities';
import { useModules } from './useModules';
import { useApiServices } from './useApiServices';

export const useDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, profile, userRoles, signOut } = useAuthContext();
  
  // Get real data from all consolidated sources
  const { users, meta: userMeta } = useMasterUserManagement();
  const { facilities, getFacilityStats } = useFacilities();
  const { modules, getModuleStats } = useModules();
  const { apiServices } = useApiServices();

  const facilityStats = getFacilityStats();
  const moduleStats = getModuleStats();
  
  const dashboardData = {
    // Real metrics from consolidated sources
    totalUsers: userMeta.totalUsers,
    totalFacilities: facilities.length,
    totalModules: modules.length,
    totalApiServices: apiServices.length,
    
    // Detailed stats
    userStats: {
      admins: userMeta.adminCount,
      staff: userMeta.staffCount,
      patients: userMeta.patientCount
    },
    facilityStats: facilityStats,
    moduleStats: moduleStats,
    apiServiceStats: {
      active: apiServices.filter(api => api.status === 'active').length,
      total: apiServices.length
    },
    
    // System health based on real data
    systemHealth: facilities.length > 0 && modules.length > 0 ? 'healthy' : 'warning',
    apiIntegrations: apiServices.length,
    
    // Welcome message with real data
    welcomeMessage: `Welcome back${profile?.first_name ? `, ${profile.first_name}` : ''}!`,
    summary: `Managing ${userMeta.totalUsers} users across ${facilities.length} facilities`,
    
    // Real data items
    items: [
      { id: 1, name: `${userMeta.totalUsers} Users`, type: 'users' },
      { id: 2, name: `${facilities.length} Facilities`, type: 'facilities' },
      { id: 3, name: `${modules.length} Modules`, type: 'modules' },
      { id: 4, name: `${apiServices.length} API Services`, type: 'api-services' }
    ]
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    loading,
    isLoading: loading,
    error,
    handleLogout,
    profile,
    userRoles: userRoles || [],
    // Consolidated data access
    users,
    facilities,
    modules,
    apiServices,
    // Meta information showing single source
    meta: {
      dataSources: {
        users: userMeta.dataSource,
        facilities: 'facilities table via direct query',
        modules: 'modules table via direct query',
        apiServices: 'api_integration_registry table via direct query'
      },
      version: 'unified-dashboard-v1',
      consolidated: true
    }
  };
};
