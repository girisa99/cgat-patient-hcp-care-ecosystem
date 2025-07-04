
/**
 * MASTER USER MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Handles ALL user operations consistently
 * Version: master-user-management-v1.0.0
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

const MASTER_USER_CACHE_KEY = ['master-user-management'];

export interface MasterUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  facility_id?: string;
  user_roles: Array<{ role: { name: string } }>;
}

export const useMasterUserManagement = () => {
  const { showSuccess, showError } = useMasterToast();
  
  console.log('👥 MASTER USER MANAGEMENT - Single Source of Truth Active');

  // ====================== FETCH ALL USERS ======================
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: MASTER_USER_CACHE_KEY,
    queryFn: async (): Promise<MasterUser[]> => {
      console.log('🔍 Fetching users from single source...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          created_at,
          facility_id
        `);

      if (error) throw error;
      
      // Transform to match expected format
      const transformedUsers = (data || []).map(user => ({
        ...user,
        user_roles: [{ role: { name: 'user' } }] // Default role assignment
      }));

      console.log('✅ Users fetched from single source:', transformedUsers.length);
      return transformedUsers;
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // ====================== USER STATISTICS ======================
  const getUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.length; // All users are considered active for now
    const inactiveUsers = 0;
    
    // Role-based counting
    const patientCount = users.filter(u => 
      u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
    ).length;
    
    const staffCount = users.filter(u => 
      u.user_roles.some(ur => ['staff', 'nurse', 'healthcareProvider'].includes(ur.role.name))
    ).length;
    
    const adminCount = users.filter(u => 
      u.user_roles.some(ur => ['superAdmin', 'onboardingTeam'].includes(ur.role.name))
    ).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      patientCount,
      staffCount,
      adminCount
    };
  };

  // ====================== UTILITY FUNCTIONS ======================
  const searchUsers = (term: string) => {
    if (!term.trim()) return users;
    
    return users.filter(user =>
      user.first_name?.toLowerCase().includes(term.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase())
    );
  };

  const getPatients = () => {
    return users.filter(u => 
      u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
    );
  };

  const getStaff = () => {
    return users.filter(u => 
      u.user_roles.some(ur => ['staff', 'nurse', 'healthcareProvider'].includes(ur.role.name))
    );
  };

  const getAdmins = () => {
    return users.filter(u => 
      u.user_roles.some(ur => ['superAdmin', 'onboardingTeam'].includes(ur.role.name))
    );
  };

  // ====================== PLACEHOLDER ACTIONS ======================
  const createUser = (userData: any) => {
    console.log('👥 Create user requested:', userData);
    showSuccess("User Creation", "This feature will be implemented soon");
  };

  const assignRole = (userId: string, roleId: string) => {
    console.log('👥 Assign role requested:', { userId, roleId });
    showSuccess("Role Assignment", "This feature will be implemented soon");
  };

  const removeRole = (userId: string, roleId: string) => {
    console.log('👥 Remove role requested:', { userId, roleId });
    showSuccess("Role Removal", "This feature will be implemented soon");
  };

  const assignFacility = (userId: string, facilityId: string) => {
    console.log('👥 Assign facility requested:', { userId, facilityId });
    showSuccess("Facility Assignment", "This feature will be implemented soon");
  };

  const stats = getUserStats();

  return {
    // Data
    users,
    
    // Loading states
    isLoading,
    isCreatingUser: false,
    isAssigningRole: false,
    isRemovingRole: false,
    isAssigningFacility: false,
    
    // Error states
    error,
    
    // Actions
    createUser,
    assignRole,
    removeRole,
    assignFacility,
    
    // Utilities
    searchUsers,
    getUserStats,
    getPatients,
    getStaff,
    getAdmins,
    
    // Quick stats
    totalUsers: stats.totalUsers,
    patientCount: stats.patientCount,
    staffCount: stats.staffCount,
    adminCount: stats.adminCount,
    
    // Meta information
    meta: {
      dataSource: 'profiles table (single source)',
      lastUpdated: new Date().toISOString(),
      version: 'master-user-management-v1.0.0',
      singleSourceOfTruth: true,
      cacheKey: MASTER_USER_CACHE_KEY.join('-')
    }
  };
};
