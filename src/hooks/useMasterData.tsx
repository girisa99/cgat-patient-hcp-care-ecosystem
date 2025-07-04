/**
 * MASTER DATA HOOK - SINGLE SOURCE OF TRUTH FOR ALL DATA
 * Consolidates users, facilities, modules, and API services
 * Version: master-data-v1.0.1 - Fixed infinite loading issues
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { useMasterAuth } from './useMasterAuth';
import { useCallback, useMemo } from 'react';

// SINGLE CACHE KEY for all data operations
const MASTER_DATA_CACHE_KEY = ['master-data'];

export interface MasterUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  user_roles: Array<{ role: { name: string; description?: string } }>;
}

export interface MasterFacility {
  id: string;
  name: string;
  facility_type: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

export interface MasterModule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface MasterApiService {
  id: string;
  name: string;
  status: string;
  type: string;
  description?: string;
  created_at: string;
}

export interface MasterRole {
  id: string;
  name: string;
  description?: string;
}

export const useMasterData = () => {
  const { showSuccess, showError } = useMasterToast();
  const { userRoles, isAuthenticated } = useMasterAuth();
  const queryClient = useQueryClient();
  
  console.log('🏆 MASTER DATA - Single Source of Truth Active');

  // ====================== SINGLE CACHE INVALIDATION ======================
  const invalidateCache = useCallback(() => {
    console.log('🔄 Invalidating master data cache...');
    queryClient.invalidateQueries({ queryKey: MASTER_DATA_CACHE_KEY });
  }, [queryClient]);

  // ====================== FETCH ALL USERS ======================
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: [...MASTER_DATA_CACHE_KEY, 'users'],
    queryFn: async (): Promise<MasterUser[]> => {
      console.log('🔍 Fetching users from master data source...');
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at,
            user_roles(
              role:roles(name, description)
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Users query error:', error);
          throw error;
        }
        
        // Clean and validate the data
        const cleanedData = (data || []).map(user => ({
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          created_at: user.created_at || new Date().toISOString(),
          user_roles: Array.isArray(user.user_roles) ? user.user_roles : []
        }));
        
        console.log('✅ Users loaded successfully:', cleanedData.length);
        return cleanedData;
      } catch (error) {
        console.error('💥 Users fetch exception:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  // ====================== FETCH ALL FACILITIES ======================
  const {
    data: facilities = [],
    isLoading: facilitiesLoading,
    error: facilitiesError,
  } = useQuery({
    queryKey: [...MASTER_DATA_CACHE_KEY, 'facilities'],
    queryFn: async (): Promise<MasterFacility[]> => {
      console.log('🔍 Fetching facilities from master data source...');
      
      try {
        const { data, error } = await supabase
          .from('facilities')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Facilities query error:', error);
          throw error;
        }
        
        console.log('✅ Facilities loaded successfully:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('💥 Facilities fetch exception:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  // ====================== FETCH ALL MODULES ======================
  const {
    data: modules = [],
    isLoading: modulesLoading,
    error: modulesError,
  } = useQuery({
    queryKey: [...MASTER_DATA_CACHE_KEY, 'modules'],
    queryFn: async (): Promise<MasterModule[]> => {
      console.log('🔍 Fetching modules from master data source...');
      
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Modules query error:', error);
          throw error;
        }
        
        console.log('✅ Modules loaded successfully:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('💥 Modules fetch exception:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  // ====================== FETCH ALL API SERVICES ======================
  const {
    data: apiServices = [],
    isLoading: apiServicesLoading,
    error: apiServicesError,
  } = useQuery({
    queryKey: [...MASTER_DATA_CACHE_KEY, 'api-services'],
    queryFn: async (): Promise<MasterApiService[]> => {
      console.log('🔍 Fetching API services from master data source...');
      
      try {
        const { data, error } = await supabase
          .from('api_integration_registry')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ API services query error:', error);
          throw error;
        }
        
        console.log('✅ API services loaded successfully:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('💥 API services fetch exception:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  // ====================== FETCH ALL ROLES ======================
  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: [...MASTER_DATA_CACHE_KEY, 'roles'],
    queryFn: async (): Promise<MasterRole[]> => {
      console.log('🔍 Fetching roles from master data source...');
      
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('id, name, description')
          .order('name');

        if (error) {
          console.error('❌ Roles query error:', error);
          throw error;
        }
        
        console.log('✅ Roles loaded successfully:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('💥 Roles fetch exception:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  // ====================== CREATE USER MUTATION ======================
  const createUserMutation = useMutation({
    mutationFn: async (userData: { firstName: string; lastName: string; email: string; phone?: string }) => {
      console.log('🔄 Creating user via MASTER DATA hook:', userData);
      
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: 'TempPass123!',
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone
          }
        });

        if (error) throw error;

        // Also create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            phone: userData.phone || ''
          });

        if (profileError) throw profileError;

        return data;
      } catch (error) {
        console.error('💥 User creation exception:', error);
        throw error;
      }
    },
    onSuccess: () => {
      invalidateCache();
      showSuccess("User Created", "User has been created successfully");
      console.log('✅ User created via MASTER DATA hook');
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message || "Failed to create user");
      console.error('❌ User creation failed in MASTER DATA hook:', error);
    }
  });

  // ====================== ASSIGN ROLE MUTATION ======================
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔄 Assigning role via MASTER DATA hook:', { userId, roleId });
      
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateCache();
      showSuccess("Role Assigned", "Role has been assigned successfully");
      console.log('✅ Role assigned via MASTER DATA hook');
    },
    onError: (error: any) => {
      showError("Assignment Failed", error.message || "Failed to assign role");
      console.error('❌ Role assignment failed in MASTER DATA hook:', error);
    }
  });

  // ====================== STATISTICS ======================
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.length; // All users are considered active
    const patientCount = users.filter(u => 
      Array.isArray(u.user_roles) && u.user_roles.some(ur => ['patientCaregiver', 'user'].includes(ur.role?.name))
    ).length;
    const adminCount = users.filter(u => 
      Array.isArray(u.user_roles) && u.user_roles.some(ur => ['superAdmin', 'admin', 'onboardingTeam'].includes(ur.role?.name))
    ).length;
    
    const totalFacilities = facilities.length;
    const activeFacilities = facilities.filter(f => f.is_active).length;
    
    const totalModules = modules.length;
    const activeModules = modules.filter(m => m.is_active).length;
    
    const totalApiServices = apiServices.length;
    const activeApiServices = apiServices.filter(api => api.status === 'active').length;
    
    const totalRoles = roles.length;
    
    return {
      totalUsers,
      activeUsers,
      patientCount,
      adminCount,
      totalFacilities,
      activeFacilities,
      totalModules,
      activeModules,
      totalApiServices,
      activeApiServices,
      totalRoles
    };
  }, [users, facilities, modules, apiServices, roles]);

  // ====================== UTILITY FUNCTIONS ======================
  const searchUsers = useCallback((query: string = '') => {
    if (!query.trim()) return users;
    
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.first_name.toLowerCase().includes(lowercaseQuery) ||
      user.last_name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  }, [users]);

  const searchFacilities = useCallback((query: string = '') => {
    if (!query.trim()) return facilities;
    
    const lowercaseQuery = query.toLowerCase();
    return facilities.filter(facility => 
      facility.name.toLowerCase().includes(lowercaseQuery) ||
      (facility.address && facility.address.toLowerCase().includes(lowercaseQuery))
    );
  }, [facilities]);

  const getPatientUsers = useCallback(() => {
    return users.filter(user => 
      Array.isArray(user.user_roles) && user.user_roles.some(ur => ['patientCaregiver', 'user'].includes(ur.role?.name))
    );
  }, [users]);

  const getAllUsers = useCallback(() => {
    return users; // Return all users for user management
  }, [users]);

  // ====================== COMBINED LOADING AND ERROR STATES ======================
  const isLoading = usersLoading || facilitiesLoading || modulesLoading || apiServicesLoading || rolesLoading;
  const error = usersError || facilitiesError || modulesError || apiServicesError || rolesError;

  return {
    // ===== SINGLE DATA SOURCES =====
    users: getAllUsers(),
    patients: getPatientUsers(),
    facilities,
    modules,
    apiServices,
    roles,
    
    // ===== LOADING STATES =====
    isLoading,
    isCreatingUser: createUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    
    // ===== ERROR STATES =====
    error,
    
    // ===== ACTIONS =====
    createUser: createUserMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    refreshData: invalidateCache,
    
    // ===== UTILITIES =====
    searchUsers,
    searchFacilities,
    
    // ===== STATISTICS =====
    stats,
    
    // ===== META INFORMATION =====
    meta: {
      dataSource: 'SINGLE master data management system',
      lastUpdated: new Date().toISOString(),
      version: 'master-data-v1.0.1',
      singleSourceOfTruth: true,
      consolidatedOperations: true,
      cacheKey: MASTER_DATA_CACHE_KEY.join('-'),
      hookCount: 1,
      architecturePrinciple: 'single-source-of-truth',
      userRoles,
      isAuthenticated,
      queryOptimization: 'enabled',
      errorHandling: 'improved',
      retryLogic: 'enabled'
    }
  };
};
