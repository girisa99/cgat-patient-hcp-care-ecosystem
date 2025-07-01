
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import type { UserWithRoles } from '@/types/userManagement';
import { getPatientUsers, getHealthcareStaff, getAdminUsers } from '@/utils/userDataHelpers';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Consolidated Users Hook - Single source of truth for all user data
 * Combines functionality from useUsers and useUnifiedUserData
 */
export const useConsolidatedUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main data fetching query
  const usersQuery = useQuery({
    queryKey: ['consolidated-users'],
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching consolidated user data via edge function...');
      
      try {
        const { data: response, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('❌ Error from edge function:', error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (!response?.success) {
          console.error('❌ Function returned error:', response?.error);
          throw new Error(response?.error || 'Failed to fetch users from edge function');
        }

        const users = response.data || [];
        console.log('✅ Consolidated users fetched:', users.length);
        
        return users;
      } catch (error) {
        console.error('❌ Error in consolidated user data fetch:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  const users = usersQuery.data || [];

  // User creation mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      department?: string;
      role: UserRole;
      facility_id?: string;
    }) => {
      console.log('🔄 Creating new user:', userData);
      
      const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
        body: {
          action: 'complete_user_setup',
          user_data: userData
        }
      });

      if (error) {
        console.error('❌ Error creating user:', error);
        throw new Error(`User creation failed: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ User creation failed:', data?.error);
        throw new Error(data?.error || 'User creation failed');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consolidated-users'] });
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Create user error:', error);
      toast({
        title: "User Creation Failed",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  // Role assignment mutation - Simplified with better error handling
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning role via onboarding-workflow:', roleName, 'to user:', userId);
      
      try {
        const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
          body: {
            action: 'assign_role',
            user_id: userId,
            role_name: roleName
          }
        });

        if (error) {
          console.error('❌ Edge function invoke error:', error);
          throw new Error(`Network error: ${error.message}`);
        }

        if (!data || !data.success) {
          console.error('❌ Role assignment failed:', data?.error || 'Unknown error');
          throw new Error(data?.error || 'Role assignment failed');
        }

        console.log('✅ Role assigned successfully:', data.message);
        return data;
      } catch (error: any) {
        console.error('❌ Role assignment exception:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating cache after role assignment...');
      queryClient.invalidateQueries({ queryKey: ['consolidated-users'] });
      toast({
        title: "Role Assigned",
        description: data?.message || "Role has been assigned successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Role assignment error:', error);
      toast({
        title: "Role Assignment Failed",
        description: error.message || "Failed to assign role. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Role removal mutation - Simplified with better error handling
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Removing role via onboarding-workflow:', roleName, 'from user:', userId);
      
      try {
        const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
          body: {
            action: 'remove_role',
            user_id: userId,
            role_name: roleName
          }
        });

        if (error) {
          console.error('❌ Edge function invoke error:', error);
          throw new Error(`Network error: ${error.message}`);
        }

        if (!data || !data.success) {
          console.error('❌ Role removal failed:', data?.error || 'Unknown error');
          throw new Error(data?.error || 'Role removal failed');
        }

        console.log('✅ Role removed successfully:', data.message);
        return data;
      } catch (error: any) {
        console.error('❌ Role removal exception:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating cache after role removal...');
      queryClient.invalidateQueries({ queryKey: ['consolidated-users'] });
      toast({
        title: "Role Removed",
        description: data?.message || "Role has been removed successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Role removal error:', error);
      toast({
        title: "Role Removal Failed",
        description: error.message || "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Facility assignment mutation - Direct database update, no RLS issues
  const assignFacilityMutation = useMutation({
    mutationFn: async ({ userId, facilityId }: { userId: string; facilityId: string }) => {
      console.log('🔄 Assigning facility:', facilityId, 'to user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ facility_id: facilityId })
        .eq('id', userId);
        
      if (error) {
        console.error('❌ Facility assignment error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('🔄 Invalidating cache after facility assignment...');
      queryClient.invalidateQueries({ queryKey: ['consolidated-users'] });
      toast({
        title: "Facility Assigned",
        description: "Facility has been assigned successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Facility assignment error:', error);
      toast({
        title: "Facility Assignment Failed",
        description: error.message || "Failed to assign facility",
        variant: "destructive",
      });
    }
  });

  // Search functionality
  const searchUsers = (query: string): UserWithRoles[] => {
    if (!query.trim()) return users;
    
    return users.filter((user: UserWithRoles) => 
      user.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Statistics
  const getUserStats = () => {
    const roleDistribution = users.reduce((acc: any, user: UserWithRoles) => {
      const roles = user.user_roles || [];
      roles.forEach((userRole: any) => {
        const roleName = userRole.roles?.name || 'unknown';
        acc[roleName] = (acc[roleName] || 0) + 1;
      });
      return acc;
    }, {});
    
    return {
      total: users.length,
      active: users.filter(u => u.created_at).length,
      withRoles: users.filter(u => u.user_roles && u.user_roles.length > 0).length,
      withFacilities: users.filter(u => u.facilities).length,
      roleDistribution,
      admins: roleDistribution.superAdmin || 0,
      regularUsers: roleDistribution.user || 0,
      moderators: roleDistribution.moderator || 0
    };
  };

  // Specialized user filtering
  const getPatients = () => getPatientUsers(users);
  const getStaff = () => getHealthcareStaff(users);
  const getAdmins = () => getAdminUsers(users);

  return {
    // Data
    users,
    allUsers: users, // Alias for compatibility
    
    // Loading states
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    
    // Refetch
    refetch: usersQuery.refetch,
    
    // Mutations - Simplified interface
    createUser: createUserMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    assignFacility: assignFacilityMutation.mutate,
    
    // Mutation states
    isCreatingUser: createUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
    isAssigningFacility: assignFacilityMutation.isPending,
    
    // Utilities
    searchUsers,
    getUserStats,
    
    // Specialized filters
    getPatients,
    getStaff, 
    getAdmins,
    
    // Meta information
    meta: {
      totalUsers: users.length,
      patientCount: getPatientUsers(users).length,
      staffCount: getHealthcareStaff(users).length,
      adminCount: getAdminUsers(users).length,
      dataSource: 'auth.users table via edge function',
      lastFetched: new Date().toISOString(),
      consolidatedVersion: true
    }
  };
};
