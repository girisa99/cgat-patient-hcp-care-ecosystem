/**
 * ROLES HOOK - Real Data Implementation
 * Provides complete role management functionality
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface Role {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export const useRoles = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch roles from database
  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      console.log('🏷️ Fetching roles from database...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching roles:', error);
        throw error;
      }

      console.log('✅ Roles loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Assign role to user mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Role Assigned', 'Role assigned successfully');
    },
    onError: (error: any) => {
      showError('Assignment Failed', error.message);
    }
  });

  // Remove role from user mutation
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
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Role Removed', 'Role removed successfully');
    },
    onError: (error: any) => {
      showError('Removal Failed', error.message);
    }
  });

  // Get users with specific role
  const getUsersWithRole = async (roleName: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(
            roles!inner(name)
          )
        `);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users with role:', error);
      return [];
    }
  };

  const getRoleStats = () => ({
    total: roles.length,
    default: roles.filter(r => r.is_default).length,
    custom: roles.filter(r => !r.is_default).length,
  });

  return {
    // Core data
    roles,
    
    // Loading states
    isLoading,
    isAssigning: assignRoleMutation.isPending,
    isRemoving: removeRoleMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    assignRole: (userId: string, roleId: string) => 
      assignRoleMutation.mutate({ userId, roleId }),
    removeRole: (userId: string, roleId: string) => 
      removeRoleMutation.mutate({ userId, roleId }),
    
    // Utilities
    getRoleStats,
    getUsersWithRole,
    getRoleById: (id: string) => roles.find(r => r.id === id),
    getRoleByName: (name: string) => roles.find(r => r.name === name),
    
    // Meta
    meta: {
      dataSource: 'roles table',
      version: 'roles-v1.0.0',
      totalRoles: roles.length
    }
  };
};