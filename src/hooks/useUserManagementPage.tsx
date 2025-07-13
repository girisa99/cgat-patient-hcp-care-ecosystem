
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';

/**
 * Dedicated hook for User Management page - MASTER DATA INTEGRATION
 */
export const useUserManagementPage = () => {
  console.log('🔒 User Management Page Hook - Master data integration active');
  
  const authData = useMasterAuth();
  const masterData = useMasterData();

  return {
    // Primary data sources - MASTER DATA
    users: masterData.users || [],
    isLoading: masterData.isLoading,
    error: masterData.error,
    
    // Actions - MASTER DATA
    createUser: masterData.createUser,
    assignRole: () => console.log('Assign role - to be implemented'),
    removeRole: () => console.log('Remove role - to be implemented'),
    assignFacility: () => console.log('Assign facility - to be implemented'),
    
    // Utilities - MASTER DATA
    searchUsers: masterData.searchUsers,
    getUserStats: () => masterData.stats,
    
    // Specialized filters - MASTER DATA
    getPatients: () => masterData.users.filter(u => 
      u.user_roles.some(ur => ur.roles.name === 'patientCaregiver')
    ),
    getStaff: () => masterData.users.filter(u => 
      u.user_roles.some(ur => ['staff', 'technicalServices'].includes(ur.roles.name))
    ),
    getAdmins: () => masterData.users.filter(u => 
      u.user_roles.some(ur => ['superAdmin', 'onboardingTeam'].includes(ur.roles.name))
    ),
    
    // Dialog states - simplified for now
    dialogStates: {
      createUserOpen: false,
      editUserOpen: false,
      assignRoleOpen: false,
      removeRoleOpen: false,
      assignFacilityOpen: false,
      selectedUserId: null,
      selectedUser: null
    },
    
    // Status flags - MASTER DATA
    isCreatingUser: masterData.isLoading,
    isAssigningRole: false,
    isRemovingRole: false,
    isAssigningFacility: false,
    
    // Meta information - MASTER DATA
    meta: {
      totalUsers: masterData.stats.totalUsers,
      patientCount: masterData.stats.patientCount,
      staffCount: 0, // To be calculated from roles
      adminCount: masterData.stats.adminCount,
      dataSource: masterData.meta.dataSource,
      hookVersion: 'master-user-management-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};
