
/**
 * MASTER DATA HOOK - SINGLE SOURCE OF TRUTH FOR ALL DATA
 * Consolidates users, facilities, modules, and API services
 * Version: master-data-v1.0.0
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
  created_at: string;
  user_roles: Array<{ role: { name: string; description?: string } }>;
  facilities?: any;
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
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role:roles(name, description)
          ),
          facilities(id, name, facility_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
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
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
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
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
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
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // ====================== CREATE USER MUTATION ======================
  const createUserMutation = useMutation({
    mutationFn: async (userData: { firstName: string; lastName: string; email: string; phone?: string }) => {
      console.log('🔄 Creating user via MASTER DATA hook:', userData);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone: userData.phone || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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

  // ====================== STATISTICS ======================
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.length; // Assuming all are active for now
    const patientCount = users.filter(u => 
      u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
    ).length;
    const adminCount = users.filter(u => 
      u.user_roles.some(ur => ['superAdmin', 'onboardingTeam'].includes(ur.role.name))
    ).length;
    
    const totalFacilities = facilities.length;
    const activeFacilities = facilities.filter(f => f.is_active).length;
    
    const totalModules = modules.length;
    const activeModules = modules.filter(m => m.is_active).length;
    
    const totalApiServices = apiServices.length;
    const activeApiServices = apiServices.filter(api => api.status === 'active').length;
    
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
      activeApiServices
    };
  }, [users, facilities, modules, apiServices]);

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

  return {
    // ===== SINGLE DATA SOURCES =====
    users,
    facilities,
    modules,
    apiServices,
    
    // ===== LOADING STATES =====
    isLoading: usersLoading || facilitiesLoading || modulesLoading || apiServicesLoading,
    isCreatingUser: createUserMutation.isPending,
    
    // ===== ERROR STATES =====
    error: usersError || facilitiesError || modulesError || apiServicesError,
    
    // ===== ACTIONS =====
    createUser: createUserMutation.mutate,
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
      version: 'master-data-v1.0.0',
      singleSourceOfTruth: true,
      consolidatedOperations: true,
      cacheKey: MASTER_DATA_CACHE_KEY.join('-'),
      hookCount: 1,
      architecturePrinciple: 'single-source-of-truth',
      userRoles,
      isAuthenticated
    }
  };
};
