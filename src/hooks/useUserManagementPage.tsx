
import { useMasterUserManagement } from './useMasterUserManagement';
import { useUserManagementDialogs } from './useUserManagementDialogs';

/**
 * Dedicated hook for User Management page - LOCKED IMPLEMENTATION
 * This hook ensures the User Management page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for User Management page
 */
export const useUserManagementPage = () => {
  console.log('🔒 User Management Page Hook - Locked implementation active');
  
  // Use consolidated user management as single source of truth
  const userData = useMasterUserManagement();
  const dialogsData = useUserManagementDialogs();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    users: userData.users || [],
    isLoading: userData.isLoading,
    error: userData.error,
    
    // Actions - LOCKED
    createUser: userData.createUser,
    assignRole: userData.assignRole,
    removeRole: userData.removeRole,
    assignFacility: userData.assignFacility,
    
    // Utilities - LOCKED
    searchUsers: userData.searchUsers,
    getUserStats: userData.getUserStats,
    isUserEmailVerified: userData.isUserEmailVerified,
    
    // Specialized filters - LOCKED
    getPatients: userData.getPatients,
    getStaff: userData.getStaff,
    getAdmins: userData.getAdmins,
    
    // Dialog states - LOCKED
    dialogStates: {
      createUserOpen: dialogsData.createUserOpen,
      editUserOpen: dialogsData.editUserOpen,
      assignRoleOpen: dialogsData.assignRoleOpen,
      removeRoleOpen: dialogsData.removeRoleOpen,
      assignFacilityOpen: dialogsData.assignFacilityOpen,
      selectedUserId: dialogsData.selectedUserId,
      selectedUser: dialogsData.selectedUser
    },
    
    // Status flags - LOCKED
    isCreatingUser: userData.isCreatingUser,
    isAssigningRole: userData.isAssigningRole,
    isRemovingRole: userData.isRemovingRole,
    isAssigningFacility: userData.isAssigningFacility,
    
    // Meta information - LOCKED
    meta: {
      totalUsers: userData.meta.totalUsers,
      patientCount: userData.meta.patientCount,
      staffCount: userData.meta.staffCount,
      adminCount: userData.meta.adminCount,
      dataSource: userData.meta.dataSource,
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};
