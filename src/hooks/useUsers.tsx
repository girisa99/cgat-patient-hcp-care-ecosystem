
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

/**
 * Users Hook - Now using Universal Template
 * 
 * Unified with the template system while maintaining all existing functionality.
 */
export const useUsers = () => {
  const config = {
    tableName: 'profiles' as const,
    moduleName: 'Users',
    requiredFields: ['email', 'role'],
    customValidation: (data: any) => {
      // Validate user roles
      const validRoles = ['admin', 'user', 'moderator', 'patient', 'patientCaregiver'];
      return validRoles.includes(data.role);
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);

  // User-specific filtering (exclude system accounts)
  const users = templateResult.items.filter((item: any) => 
    item.email && item.role && item.role !== 'system'
  );

  // User-specific search
  const searchUsers = (query: string) => {
    if (!query.trim()) return users;
    
    return users.filter((user: any) => 
      user.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase()) ||
      user.role?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // User-specific statistics
  const getUserStats = () => {
    const stats = templateResult.getStatistics();
    const roleDistribution = users.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    return {
      ...stats,
      total: users.length,
      roleDistribution,
      admins: roleDistribution.admin || 0,
      regularUsers: roleDistribution.user || 0,
      moderators: roleDistribution.moderator || 0
    };
  };

  return {
    // Core functionality (backward compatible)
    users,
    isLoading: templateResult.isLoading,
    error: templateResult.error,
    refetch: templateResult.refetch,
    
    // Mutations (backward compatible)
    createUser: templateResult.createItem,
    updateUser: templateResult.updateItem,
    deleteUser: templateResult.deleteItem,
    isCreating: templateResult.isCreating,
    isUpdating: templateResult.isUpdating,
    isDeleting: templateResult.isDeleting,
    
    // Enhanced functionality
    searchUsers,
    getUserStats,
    
    // Universal template access
    template: templateResult,
    
    // Metadata
    meta: {
      ...templateResult.meta,
      userCount: users.length,
      roleDistribution: users.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    }
  };
};
