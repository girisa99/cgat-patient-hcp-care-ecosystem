import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface Role {
  id: string;
  name: 'superAdmin' | 'healthcareProvider' | 'nurse' | 'caseManager' | 'onboardingTeam' | 'patientCaregiver' | 'financeTeam' | 'contractTeam' | 'workflowManager' | 'demoUser';
  description?: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
  resource_type?: string;
  action?: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  role?: Role;
}

interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
  permission?: Permission;
}

export const useAccessManager = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch all roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all permissions
  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user roles
  const { data: userRoles = [], isLoading: isLoadingUserRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch role permissions
  const { data: rolePermissions = [], isLoading: isLoadingRolePermissions } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permission:permissions(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create role
  const createRole = useMutation({
    mutationFn: async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('roles')
        .insert(roleData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSuccess('Role created successfully');
    },
    onError: (error) => {
      showError('Failed to create role: ' + error.message);
    }
  });

  // Update role
  const updateRole = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Role>) => {
      const { data, error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSuccess('Role updated successfully');
    },
    onError: (error) => {
      showError('Failed to update role: ' + error.message);
    }
  });

  // Assign role to user
  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      showSuccess('Role assigned successfully');
    },
    onError: (error) => {
      showError('Failed to assign role: ' + error.message);
    }
  });

  // Remove role from user
  const removeRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      showSuccess('Role removed successfully');
    },
    onError: (error) => {
      showError('Failed to remove role: ' + error.message);
    }
  });

  // Assign permission to role
  const assignPermission = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const { data, error } = await supabase
        .from('role_permissions')
        .insert({
          role_id: roleId,
          permission_id: permissionId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      showSuccess('Permission assigned successfully');
    },
    onError: (error) => {
      showError('Failed to assign permission: ' + error.message);
    }
  });

  // Remove permission from role
  const removePermission = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permissionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      showSuccess('Permission removed successfully');
    },
    onError: (error) => {
      showError('Failed to remove permission: ' + error.message);
    }
  });

  return {
    // Data
    roles,
    permissions,
    userRoles,
    rolePermissions,
    
    // Loading states
    isLoading: isLoadingRoles || isLoadingPermissions || isLoadingUserRoles || isLoadingRolePermissions,
    isLoadingRoles,
    isLoadingPermissions,
    isLoadingUserRoles,
    isLoadingRolePermissions,
    
    // Mutations
    createRole: createRole.mutate,
    updateRole: updateRole.mutate,
    assignRole: assignRole.mutate,
    removeRole: removeRole.mutate,
    assignPermission: assignPermission.mutate,
    removePermission: removePermission.mutate,
    
    // Mutation states
    isCreatingRole: createRole.isPending,
    isUpdatingRole: updateRole.isPending,
    isAssigningRole: assignRole.isPending,
    isRemovingRole: removeRole.isPending,
    isAssigningPermission: assignPermission.isPending,
    isRemovingPermission: removePermission.isPending,
  };
};