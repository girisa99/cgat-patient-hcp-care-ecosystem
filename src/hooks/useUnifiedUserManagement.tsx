
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import type { UserWithRoles } from '@/types/userManagement';
import { USER_MANAGEMENT_CONFIG, isVerifiedEmail } from '@/config/userManagement';
import { getPatientUsers, getHealthcareStaff, getAdminUsers } from '@/utils/userDataHelpers';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Unified User Management Hook - Single Source of Truth
 * Consolidates all user management functionality into one hook
 */
export const useUnifiedUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main data fetching query
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: USER_MANAGEMENT_CONFIG.QUERY_KEYS.CONSOLIDATED_USERS,
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching consolidated user data...');
      
      const { data: response, error } = await supabase.functions.invoke('manage-user-profiles', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('❌ Error from edge function:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!response?.success) {
        console.error('❌ Function returned error:', response?.error);
        throw new Error(response?.error || 'Failed to fetch users');
      }

      const users = response.data || [];
      console.log('✅ Users fetched:', users.length);
      
      return users;
    },
    retry: USER_MANAGEMENT_CONFIG.CACHE_SETTINGS.RETRY_COUNT,
    staleTime: USER_MANAGEMENT_CONFIG.CACHE_SETTINGS.STALE_TIME,
  });

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
      console.log('🔄 Creating user:', userData.email);
      
      const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
        body: {
          action: 'complete_user_setup',
          user_data: userData
        }
      });

      if (error) throw new Error(`User creation failed: ${error.message}`);
      if (!data?.success) throw new Error(data?.error || 'User creation failed');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_CONFIG.QUERY_KEYS.CONSOLIDATED_USERS });
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "User Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Role assignment mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning role:', roleName, 'to user:', userId);
      
      const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
        body: {
          action: 'assign_role',
          user_id: userId,
          role_name: roleName
        }
      });

      if (error) throw new Error(`Network error: ${error.message}`);
      if (!data?.success) throw new Error(data?.error || 'Role assignment failed');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_CONFIG.QUERY_KEYS.CONSOLIDATED_USERS });
      toast({
        title: "Role Assigned",
        description: data?.message || "Role assigned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Role Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Role removal mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Removing role:', roleName, 'from user:', userId);
      
      const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
        body: {
          action: 'remove_role',
          user_id: userId,
          role_name: roleName
        }
      });

      if (error) throw new Error(`Network error: ${error.message}`);
      if (!data?.success) throw new Error(data?.error || 'Role removal failed');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_CONFIG.QUERY_KEYS.CONSOLIDATED_USERS });
      toast({
        title: "Role Removed",
        description: data?.message || "Role removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Role Removal Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Facility assignment mutation
  const assignFacilityMutation = useMutation({
    mutationFn: async ({ userId, facilityId }: { userId: string; facilityId: string }) => {
      console.log('🔄 Assigning facility:', facilityId, 'to user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ facility_id: facilityId })
        .eq('id', userId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_CONFIG.QUERY_KEYS.CONSOLIDATED_USERS });
      toast({
        title: "Facility Assigned",
        description: "Facility assigned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Facility Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Utility functions
  const searchUsers = (query: string): UserWithRoles[] => {
    if (!query.trim()) return users;
    
    return users.filter((user: UserWithRoles) => 
      user.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

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

  // Check if user email is verified using centralized config
  const isUserEmailVerified = (user: UserWithRoles): boolean => {
    return Boolean(user.email_confirmed_at) || 
      (user.email ? isVerifiedEmail(user.email) : false);
  };

  return {
    // Data
    users,
    isLoading,
    error,
    refetch,
    
    // Mutations
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
    isUserEmailVerified,
    
    // Specialized filters
    getPatients: () => getPatientUsers(users),
    getStaff: () => getHealthcareStaff(users), 
    getAdmins: () => getAdminUsers(users),
    
    // Meta information
    meta: {
      totalUsers: users.length,
      patientCount: getPatientUsers(users).length,
      staffCount: getHealthcareStaff(users).length,
      adminCount: getAdminUsers(users).length,
      dataSource: 'auth.users table via edge function',
      lastFetched: new Date().toISOString(),
      version: 'unified-v1'
    }
  };
};
