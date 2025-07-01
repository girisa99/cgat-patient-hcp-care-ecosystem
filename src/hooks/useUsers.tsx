
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useUserMutations } from './users/useUserMutations';
import { useUnifiedUserData } from './useUnifiedUserData';
import type { ExtendedProfile } from '@/types/database';

export const useUsers = () => {
  const config = {
    tableName: 'profiles' as const,
    moduleName: 'Users',
    requiredFields: ['email'],
    customValidation: (data: any) => {
      return !!(data.email && data.email.includes('@'));
    }
  };

  const { allUsers, isLoading, error, refetch } = useUnifiedUserData();
  const { createUser, assignRole, assignFacility, isCreatingUser, isAssigningRole, isAssigningFacility } = useUserMutations();

  // Ensure users have the expected structure with safe defaults and proper typing
  const users: ExtendedProfile[] = (allUsers || []).map(user => ({
    ...user,
    is_active: user.is_active ?? true,
    user_roles: user.user_roles || [],
    facilities: user.facilities || null,
    // Add missing properties from ExtendedProfile
    avatar_url: user.avatar_url || null,
    department: user.department || null,
    has_mfa_enabled: user.has_mfa_enabled || false,
    is_email_verified: user.is_email_verified || false,
    last_login: user.last_login || null,
    timezone: user.timezone || null
  }));

  const searchUsers = (query: string) => {
    if (!query.trim()) return users;
    
    return users.filter((user: ExtendedProfile) => 
      user.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getUserStats = () => {
    const roleDistribution = users.reduce((acc: any, user: ExtendedProfile) => {
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
    users,
    isLoading,
    error,
    refetch,
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
    searchUsers,
    getUserStats,
    meta: {
      userCount: users.length,
      roleDistribution: users.reduce((acc: any, user: ExtendedProfile) => {
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
