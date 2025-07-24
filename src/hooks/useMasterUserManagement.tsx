
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterData } from './useMasterData';
import { useMasterToast } from './useMasterToast';

export const useMasterUserManagement = () => {
  const masterData = useMasterData(true); // Pass isAuthenticated = true
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [isRemovingRole, setIsRemovingRole] = useState(false);
  const [isAssigningFacility, setIsAssigningFacility] = useState(false);

  // Enhanced user statistics (merged from useUserStatistics)
  const getUserStats = () => {
    const users = masterData.users;
    const basicStats = {
      totalUsers: masterData.stats.totalUsers,
      activeUsers: users.filter(u => u.is_active !== false).length,
      verifiedUsers: users.filter(u => u.is_email_verified).length,
      pendingVerification: users.filter(u => !u.is_email_verified).length,
      pendingRoleAssignment: users.filter(u => !u.user_roles || u.user_roles.length === 0).length,
      completeUsers: users.filter(u => u.is_email_verified && u.user_roles && u.user_roles.length > 0).length,
      adminCount: masterData.stats.adminCount,
      patientCount: masterData.stats.patientCount,
    };

    // Enhanced statistics (merged functionality)
    const byRole = users.reduce((acc: Record<string, number>, user) => {
      if (user.user_roles) {
        user.user_roles.forEach(ur => {
          const roleName = ur.roles?.name || 'unknown';
          acc[roleName] = (acc[roleName] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const byStatus = {
      active: users.filter(u => u.is_active !== false).length,
      inactive: users.filter(u => u.is_active === false).length,
      verified: users.filter(u => u.is_email_verified).length,
      pending: users.filter(u => !u.is_email_verified).length,
    };

    const recent = users.filter(u => {
      if (!u.created_at) return false;
      const createdDate = new Date(u.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdDate > sevenDaysAgo;
    }).length;

    return { ...basicStats, byRole, byStatus, recent };
  };

  const fetchUsers = () => {
    // Force refresh both users and general data
    queryClient.invalidateQueries({ queryKey: ['master-users'] });
    queryClient.invalidateQueries({ queryKey: ['master-data'] });
    queryClient.refetchQueries({ queryKey: ['master-users'] });
    masterData.refreshData();
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { 
      email: string; 
      first_name: string; 
      last_name: string; 
      password?: string;
      roles?: string[];
    }) => {
      // Use regular sign-up instead of admin create to avoid permission issues
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || 'TempPassword123!',
        options: {
          data: {
            firstName: userData.first_name,
            lastName: userData.last_name
          }
        }
      });
      
      if (error) throw error;
      
      // If user is created successfully, assign roles
      if (userData.roles && userData.roles.length > 0 && data.user) {
        for (const roleId of userData.roles) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: data.user.id, 
              role_id: roleId
            });
          
          if (roleError) {
            console.warn('Role assignment failed:', roleError);
            // Don't throw here, as user creation succeeded
          }
        }
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate multiple query keys to ensure complete refresh
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      queryClient.invalidateQueries({ queryKey: ['master-data'] });
      queryClient.refetchQueries({ queryKey: ['master-users'] });
      showSuccess('User Created', 'User has been created successfully');
      setIsCreatingUser(false);
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message);
      setIsCreatingUser(false);
    }
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      // Invalidate multiple query keys to ensure complete refresh
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      queryClient.invalidateQueries({ queryKey: ['master-data'] });
      queryClient.refetchQueries({ queryKey: ['master-users'] });
      showSuccess('User Deactivated', 'User has been deactivated successfully');
      setIsDeactivating(false);
    },
    onError: (error: any) => {
      showError('Deactivation Failed', error.message);
      setIsDeactivating(false);
    }
  });

  // Assign role mutation (using secure function)
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: string }) => {
      const { data, error } = await supabase.rpc('secure_assign_user_role', {
        target_user_id: userId,
        target_role_name: roleName
      });
      
      if (error) throw error;
      
      // Check if the function returned an error
      const response = data as any;
      if (response && !response.success) {
        throw new Error(response.error || 'Role assignment failed');
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Role Assigned', 'Role has been assigned successfully');
      setIsAssigningRole(false);
    },
    onError: (error: any) => {
      showError('Role Assignment Failed', error.message);
      setIsAssigningRole(false);
    }
  });

  // Remove role mutation (using secure function)
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: string }) => {
      const { data, error } = await supabase.rpc('secure_remove_user_role', {
        target_user_id: userId,
        target_role_name: roleName
      });
      
      if (error) throw error;
      
      // Check if the function returned an error
      const response = data as any;
      if (response && !response.success) {
        throw new Error(response.error || 'Role removal failed');
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Role Removed', 'Role has been removed successfully');
      setIsRemovingRole(false);
    },
    onError: (error: any) => {
      showError('Role Removal Failed', error.message);
      setIsRemovingRole(false);
    }
  });

  const createUser = (userData?: any) => {
    if (userData) {
      setIsCreatingUser(true);
      createUserMutation.mutate(userData);
    } else {
      // For now, just show info that form should open
      showError('User Creation', 'Please provide user data');
    }
  };

  const deactivateUser = (userId?: string) => {
    if (userId) {
      setIsDeactivating(true);
      deactivateUserMutation.mutate(userId);
    } else {
      showError('Deactivation Failed', 'User ID is required');
    }
  };

  const assignRole = (userId?: string, roleName?: string) => {
    if (userId && roleName) {
      setIsAssigningRole(true);
      assignRoleMutation.mutate({ userId, roleName });
    } else {
      showError('Role Assignment', 'Please select a user and role');
    }
  };

  const removeRole = (userId?: string, roleName?: string) => {
    if (userId && roleName) {
      setIsRemovingRole(true);
      removeRoleMutation.mutate({ userId, roleName });
    } else {
      showError('Role Removal', 'Please select a user and role');
    }
  };

  const assignFacility = () => {
    showError('Feature Not Implemented', 'Facility assignment functionality is coming soon');
  };

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('User Updated', 'User has been updated successfully');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    }
  });

  // Module assignment mutations
  const assignModuleMutation = useMutation({
    mutationFn: async ({ userId, moduleId }: { userId: string; moduleId: string }) => {
      const { error } = await supabase
        .from('user_module_assignments')
        .insert({ user_id: userId, module_id: moduleId, is_active: true });
      
      if (error) throw error;
      return { userId, moduleId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Module Assigned', 'Module has been assigned successfully');
    },
    onError: (error: any) => {
      showError('Module Assignment Failed', error.message);
    }
  });

  const removeModuleMutation = useMutation({
    mutationFn: async ({ userId, moduleId }: { userId: string; moduleId: string }) => {
      const { error } = await supabase
        .from('user_module_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('module_id', moduleId);
      
      if (error) throw error;
      return { userId, moduleId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Module Removed', 'Module has been removed successfully');
    },
    onError: (error: any) => {
      showError('Module Removal Failed', error.message);
    }
  });

  const updateUser = (userId: string, updates: any) => {
    updateUserMutation.mutate({ userId, updates });
  };

  const assignModule = (userId: string, moduleId: string) => {
    assignModuleMutation.mutate({ userId, moduleId });
  };

  const removeModule = (userId: string, moduleId: string) => {
    removeModuleMutation.mutate({ userId, moduleId });
  };

  const createRole = (roleName: string, description: string, isDefault: boolean) => {
    // For now, show a message that this needs admin setup since roles use enum constraints
    showError('Role Creation', 'Role creation requires database admin privileges. Please contact system administrator to add new roles to the system.');
  };

  return {
    // Core data from master data source
    users: masterData.users,
    isLoading: masterData.isLoading,
    error: masterData.error,

    // Additional properties expected by components
    isCreatingUser: isCreatingUser || createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isAssigningModule: assignModuleMutation.isPending,
    
    // Actions
    createUser,
    updateUser,
    deactivateUser,
    refreshData: fetchUsers,
    assignRole,
    removeRole,
    assignModule,
    removeModule,
    assignFacility,
    createRole,
    isDeactivating: isDeactivating || deactivateUserMutation.isPending,
    isAssigningRole: isAssigningRole || assignRoleMutation.isPending,
    isRemovingRole: isRemovingRole || removeRoleMutation.isPending,
    isAssigningFacility,

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
      hookVersion: 'master-user-management-v3.0.0-functional',
    }
  };
};
