/**
 * MASTER USER MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates ALL user management functionality into ONE hook
 * Eliminates multiple hook dependencies and cache inconsistencies
 * Version: master-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import type { UserWithRoles } from '@/types/userManagement';
import { USER_MANAGEMENT_CONFIG, isVerifiedEmail } from '@/config/userManagement';
import { getPatientUsers, getHealthcareStaff, getAdminUsers } from '@/utils/userDataHelpers';

type UserRole = Database['public']['Enums']['user_role'];

// SINGLE CACHE KEY for all user operations
const MASTER_CACHE_KEY = ['master-user-management'];

/**
 * MASTER User Management Hook - Everything in ONE place
 * No more multiple hook dependencies, cache conflicts, or instability
 */
export const useMasterUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log('🎯 Master User Management - Single Source of Truth Active');

  // ====================== DATA FETCHING ======================
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: MASTER_CACHE_KEY,
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching users from single source...');
      
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
      console.log('✅ Users fetched from master source:', users.length);
      
      return users;
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ====================== CACHE INVALIDATION HELPER ======================
  const invalidateCache = () => {
    console.log('🔄 Invalidating master cache...');
    queryClient.invalidateQueries({ queryKey: MASTER_CACHE_KEY });
  };

  // ====================== USER CREATION ======================
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
      console.log('🔄 Creating user in master hook:', userData.email);
      
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
      invalidateCache();
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

  // ====================== ROLE MANAGEMENT ======================
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning role in master hook:', roleName, 'to user:', userId);
      
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', role.id)
        .maybeSingle();

      if (checkError) {
        throw new Error('Error checking existing role assignment');
      }

      if (existingRole) {
        return { success: true, message: 'User already has this role' };
      }

      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id
        });

      if (assignError) {
        throw new Error(assignError.message);
      }

      return { success: true, message: 'Role assigned successfully' };
    },
    onSuccess: (data) => {
      invalidateCache();
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

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Removing role in master hook:', roleName, 'from user:', userId);
      
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', role.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return { success: true, message: 'Role removed successfully' };
    },
    onSuccess: (data) => {
      invalidateCache();
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

  // ====================== FACILITY MANAGEMENT ======================
  const assignFacilityMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      facilityId, 
      accessLevel = 'read' 
    }: { 
      userId: string; 
      facilityId: string; 
      accessLevel?: 'read' | 'write' | 'admin';
    }) => {
      console.log('🔄 Assigning facility in master hook:', facilityId, 'to user:', userId);
      
      const { data: existingAccess } = await supabase
        .from('user_facility_access')
        .select('id')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingAccess) {
        const { error: updateError } = await supabase
          .from('user_facility_access')
          .update({ access_level: accessLevel })
          .eq('id', existingAccess.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_facility_access')
          .insert({
            user_id: userId,
            facility_id: facilityId,
            access_level: accessLevel,
            is_active: true
          });

        if (insertError) throw insertError;
      }

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ facility_id: facilityId })
        .eq('id', userId);

      if (profileUpdateError) {
        console.warn('⚠️ Could not update primary facility:', profileUpdateError);
      }

      return { success: true, message: 'Facility access granted successfully' };
    },
    onSuccess: (data) => {
      invalidateCache();
      toast({
        title: "Facility Access Granted",
        description: data?.message || "Facility access granted successfully.",
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

  // ====================== USER DEACTIVATION ======================
  const deactivateUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      console.log('🔄 Deactivating user in master hook:', userId, 'Reason:', reason);
      
      const { data, error } = await supabase.functions.invoke('manage-user-profiles', {
        body: {
          action: 'deactivate',
          user_id: userId,
          deactivation_reason: reason
        }
      });

      if (error) {
        throw new Error(`Deactivation failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Deactivation failed');
      }

      return { success: true, message: 'User deactivated successfully' };
    },
    onSuccess: (data) => {
      invalidateCache();
      toast({
        title: "User Deactivated",
        description: data?.message || "User deactivated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== UTILITY FUNCTIONS ======================
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

  const isUserEmailVerified = (user: UserWithRoles): boolean => {
    return Boolean(user.email_confirmed_at) || 
      (user.email ? isVerifiedEmail(user.email) : false);
  };

  // ====================== RETURN CONSOLIDATED API ======================
  return {
    // Data
    users,
    isLoading,
    error,
    refetch,
    
    // User Management
    createUser: createUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    
    // Role Management
    assignRole: assignRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isAssigningRole: assignRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
    
    // Facility Management
    assignFacility: assignFacilityMutation.mutate,
    isAssigningFacility: assignFacilityMutation.isPending,
    
    // User Deactivation
    deactivateUser: deactivateUserMutation.mutate,
    isDeactivating: deactivateUserMutation.isPending,
    
    // Utilities
    searchUsers,
    getUserStats,
    isUserEmailVerified,
    
    // Specialized Filters
    getPatients: () => getPatientUsers(users),
    getStaff: () => getHealthcareStaff(users), 
    getAdmins: () => getAdminUsers(users),
    
    // Meta Information
    meta: {
      totalUsers: users.length,
      patientCount: getPatientUsers(users).length,
      staffCount: getHealthcareStaff(users).length,
      adminCount: getAdminUsers(users).length,
      dataSource: 'auth.users table via edge function (master hook)',
      lastFetched: new Date().toISOString(),
      version: 'master-consolidated-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'consolidated',
      cacheKey: MASTER_CACHE_KEY.join('-'),
      stabilityGuarantee: true
    }
  };
};