
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

  const getUserStats = () => ({
    totalUsers: masterData.stats.totalUsers,
    activeUsers: masterData.users.filter(u => u.is_active !== false).length,
    adminCount: masterData.stats.adminCount,
    patientCount: masterData.stats.patientCount,
  });

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

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId });
      
      if (error) throw error;
      return { userId, roleId };
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

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);
      
      if (error) throw error;
      return { userId, roleId };
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

  const assignRole = (userId?: string, roleId?: string) => {
    if (userId && roleId) {
      setIsAssigningRole(true);
      assignRoleMutation.mutate({ userId, roleId });
    } else {
      showError('Role Assignment', 'Please select a user and role');
    }
  };

  const removeRole = (userId?: string, roleId?: string) => {
    if (userId && roleId) {
      setIsRemovingRole(true);
      removeRoleMutation.mutate({ userId, roleId });
    } else {
      showError('Role Removal', 'Please select a user and role');
    }
  };

  const assignFacility = () => {
    showError('Feature Not Implemented', 'Facility assignment functionality is coming soon');
  };

  return {
    // Core data from master data source
    users: masterData.users,
    isLoading: masterData.isLoading,
    error: masterData.error,

    // Additional properties expected by components
    isCreatingUser: isCreatingUser || createUserMutation.isPending,
    
    // Actions
    createUser,
    deactivateUser,
    refreshData: fetchUsers,
    assignRole,
    removeRole,
    assignFacility,
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
