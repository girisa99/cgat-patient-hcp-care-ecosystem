import { useMasterData } from './useMasterData';

export const useMasterUserManagement = () => {
  const masterData = useMasterData();

  const getUserStats = () => ({
    totalUsers: masterData.stats.totalUsers,
    activeUsers: masterData.users.filter(u => u.is_active).length,
    adminCount: masterData.stats.adminCount,
    patientCount: masterData.stats.patientCount,
  });

  const fetchUsers = () => {
    console.log('🔄 Refreshing users via MasterData');
    masterData.refreshData();
  };

  return {
    // Core data from master data source
    users: masterData.users,
    isLoading: masterData.isLoading,
    error: masterData.error,

    // Additional properties expected by components
    isCreatingUser: masterData.isLoading,
    
    // Actions
    createUser: masterData.createUser,
    deactivateUser: masterData.deactivateUser,
    refreshData: fetchUsers,
    assignRole: () => console.log('Assign role - to be implemented'),
    removeRole: () => console.log('Remove role - to be implemented'),
    assignFacility: () => console.log('Assign facility - to be implemented'),
    isDeactivating: false,
    isAssigningRole: false,
    isRemovingRole: false,
    isAssigningFacility: false,

    // Utilities
    getUserStats,
    fetchUsers,
    totalUsers: masterData.stats.totalUsers,
    adminCount: masterData.stats.adminCount,
    staffCount: masterData.stats.staffCount,
    patientCount: masterData.stats.patientCount,

    // Meta
    meta: {
      ...masterData.meta,
      hookVersion: 'master-user-management-v2.0.0',
    }
  };
};
