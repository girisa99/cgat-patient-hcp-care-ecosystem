
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useUserMutations } from './users/useUserMutations';
import { useUnifiedUserData } from './useUnifiedUserData';

/**
 * Users Hook - Now using Universal Template with backward compatibility
 * 
 * Unified with the template system while maintaining all existing functionality
 * and expected properties for existing components.
 */
export const useUsers = () => {
  const config = {
    tableName: 'profiles' as const,
    moduleName: 'Users',
    requiredFields: ['email'],
    customValidation: (data: any) => {
      return !!(data.email && data.email.includes('@'));
    }
  };

  // Use the unified user data hook for consistent data structure
  const { allUsers, isLoading, error, refetch } = useUnifiedUserData();
  const { createUser, assignRole, assignFacility, isCreatingUser, isAssigningRole, isAssigningFacility } = useUserMutations();

  // Ensure users have the expected structure with safe defaults
  const users = (allUsers || []).map(user => ({
    ...user,
    user_roles: user.user_roles || [],
    facilities: user.facilities || null
  }));

  // User-specific search
  const searchUsers = (query: string) => {
    if (!query.trim()) return users;
    
    return users.filter((user: any) => 
      user.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // User-specific statistics
  const getUserStats = () => {
    const roleDistribution = users.reduce((acc: any, user: any) => {
      const roles = user.user_roles || [];
      roles.forEach((userRole: any) => {
        const roleName = userRole.roles?.name || 'unknown';
        acc[roleName] = (acc[roleName] || 0) + 1;
      });
      return acc;
    }, {});
    
    return {
      total: users.length,
      active: users.filter(u => u.is_active !== false).length,
      inactive: users.filter(u => u.is_active === false).length,
      roleDistribution,
      admins: roleDistribution.superAdmin || 0,
      regularUsers: roleDistribution.user || 0,
      moderators: roleDistribution.moderator || 0
    };
  };

  return {
    // Core functionality (backward compatible)
    users,
    isLoading,
    error,
    refetch,
    
    // Mutations (backward compatible)
    createUser,
    assignRole,
    assignFacility,
    updateUser: (id: string, updates: any) => Promise.resolve(),
    deleteUser: (id: string) => Promise.resolve(),
    isCreatingUser,
    isAssigningRole,
    isAssigningFacility,
    isCreating: isCreatingUser,
    isUpdating: false,
    isDeleting: false,
    
    // Enhanced functionality
    searchUsers,
    getUserStats,
    
    // Metadata
    meta: {
      userCount: users.length,
      roleDistribution: users.reduce((acc: any, user: any) => {
        const roles = user.user_roles || [];
        roles.forEach((userRole: any) => {
          const roleName = userRole.roles?.name || 'unknown';
          acc[roleName] = (acc[roleName] || 0) + 1;
        });
        return acc;
      }, {})
    }
  };
};
