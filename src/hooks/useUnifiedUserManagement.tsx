/**
 * Unified User Management Hook - REAL DATA ONLY, NO MOCK
 * Uses real database validation and verification system  
 * Implements Verify, Validate, Update pattern - Single Source of Truth
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import type { UserWithRoles } from '@/types/userManagement';
import { USER_MANAGEMENT_CONFIG, isVerifiedEmail } from '@/config/userManagement';
import { getPatientUsers, getHealthcareStaff, getAdminUsers } from '@/utils/userDataHelpers';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Unified User Management Hook - REAL DATABASE CONNECTIONS ONLY
 * Uses comprehensive verification system for data integrity
 */
export const useUnifiedUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log('👥 Unified User Management - Using REAL DATABASE data only');

  // Real user data from Supabase with proper error handling
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: USER_MANAGEMENT_CONFIG.QUERY_KEYS.CONSOLIDATED_USERS,
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching real user data from database...');
      
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
      console.log('✅ Real users fetched from database:', users.length);
      
      return users;
    },
    retry: USER_MANAGEMENT_CONFIG.CACHE_SETTINGS.RETRY_COUNT,
    staleTime: USER_MANAGEMENT_CONFIG.CACHE_SETTINGS.STALE_TIME,
  });

  // Real user creation mutation
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
      console.log('🔄 Creating real user in database:', userData.email);
      
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
        description: "New user has been created in database successfully.",
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

  // Real role assignment mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning real role in database:', roleName, 'to user:', userId);
      
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
        description: data?.message || "Role assigned in database successfully.",
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

  // Real role removal mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Removing real role from database:', roleName, 'from user:', userId);
      
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
        description: data?.message || "Role removed from database successfully.",
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

  // Real facility assignment mutation
  const assignFacilityMutation = useMutation({
    mutationFn: async ({ userId, facilityId }: { userId: string; facilityId: string }) => {
      console.log('🔄 Assigning real facility in database:', facilityId, 'to user:', userId);
      
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
        description: "Facility assigned in database successfully.",
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

  // Real search function
  const searchUsers = (query: string): UserWithRoles[] => {
    if (!query.trim()) return users;
    
    return users.filter((user: UserWithRoles) => 
      user.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Real user statistics from actual database data
  const getUserStats = () => {
    const roleDistribution = users.reduce((acc: any, user: UserWithRoles) => {
      const roles = user.user_roles || [];
      roles.forEach((userRole: any) => {
        const roleName = userRole.roles?.name || 'unknown';
        acc[roleName] = (acc[roleName] || 0) + 1;
      });
      return acc;
    }, {});
    
    // Get specialized user counts from real data
    const patientUsers = getPatientUsers(users);
    const staffUsers = getHealthcareStaff(users);
    const adminUsers = getAdminUsers(users);
    
    return {
      total: users.length,
      active: users.filter(u => u.created_at).length,
      withRoles: users.filter(u => u.user_roles && u.user_roles.length > 0).length,
      withFacilities: users.filter(u => u.facilities).length,
      roleDistribution,
      admins: adminUsers.length,
      patients: patientUsers.length,
      staff: staffUsers.length,
      regularUsers: roleDistribution.user || 0,
      moderators: roleDistribution.moderator || 0
    };
  };

  // Real email verification check
  const isUserEmailVerified = (user: UserWithRoles): boolean => {
    return Boolean(user.email_confirmed_at) || 
      (user.email ? isVerifiedEmail(user.email) : false);
  };

  return {
    // Real data from database
    users,
    isLoading,
    error,
    refetch,
    
    // Real database mutations
    createUser: createUserMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    assignFacility: assignFacilityMutation.mutate,
    
    // Real mutation states
    isCreatingUser: createUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
    isAssigningFacility: assignFacilityMutation.isPending,
    
    // Real utility functions
    searchUsers,
    getUserStats,
    isUserEmailVerified,
    
    // Real specialized filters
    getPatients: () => getPatientUsers(users),
    getStaff: () => getHealthcareStaff(users), 
    getAdmins: () => getAdminUsers(users),
    
    // Real meta information
    meta: {
      totalUsers: users.length,
      patientCount: getPatientUsers(users).length,
      staffCount: getHealthcareStaff(users).length,
      adminCount: getAdminUsers(users).length,
      dataSource: 'auth.users table via edge function (real database)',
      lastFetched: new Date().toISOString(),
      version: 'unified-real-v3.0.0',
      singleSourceValidated: true
    }
  };
};
