
/**
 * MASTER USER MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all user management functionality
 * Version: master-user-management-v1.0.0
 */
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';
import { useMasterToast } from './useMasterToast';

export const useMasterUserManagement = () => {
  const { users, createUser, isCreatingUser, searchUsers, stats } = useMasterData();
  const { userRoles } = useMasterAuth();
  const { showSuccess, showError } = useMasterToast();

  console.log('👥 Master User Management - Single source of truth active');

  // User statistics
  const totalUsers = users.length;
  const patientCount = users.filter(u => 
    u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
  ).length;
  const adminCount = users.filter(u => 
    u.user_roles.some(ur => ['superAdmin', 'onboardingTeam'].includes(ur.role.name))
  ).length;
  const staffCount = users.filter(u => 
    u.user_roles.some(ur => ['staff', 'technicalServices'].includes(ur.role.name))
  ).length;

  // User management actions
  const handleCreateUser = async (userData: { firstName: string; lastName: string; email: string; phone?: string }) => {
    try {
      await createUser(userData);
      showSuccess('User Created', 'User has been created successfully');
    } catch (error: any) {
      showError('Creation Failed', error.message || 'Failed to create user');
    }
  };

  return {
    // Data
    users,
    totalUsers,
    patientCount,
    adminCount,
    staffCount,
    
    // Actions
    createUser: handleCreateUser,
    searchUsers,
    
    // Status
    isCreatingUser,
    
    // Utilities
    getUsersByRole: (role: string) => users.filter(u => 
      u.user_roles.some(ur => ur.role.name === role)
    ),
    
    // Meta
    meta: {
      dataSource: 'master_data_consolidated',
      version: 'master-user-management-v1.0.0',
      totalUsers,
      userRoles
    }
  };
};
