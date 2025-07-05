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
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  phone?: string;
  isActive: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  facility_id?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  email_confirmed?: boolean;
  facilities?: any;
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
          id,
          first_name,
          last_name,
          email,
          created_at,
          user_roles(
            role:roles(name, description)
          ),
          facilities(id, name, facility_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Clean and validate the data, transforming to MasterUser format
      const cleanedData = (data || []).map(user => ({
        id: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        isActive: true, // Default to active
        is_active: true,
        created_at: user.created_at || new Date().toISOString(),
        user_roles: Array.isArray(user.user_roles) ? user.user_roles : [],
        facilities: user.facilities,
        role: Array.isArray(user.user_roles) && user.user_roles.length > 0 
          ? user.user_roles[0].role.name 
          : undefined
      }));
      
      return cleanedData;
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

  // ====================== CREATE USER MUTATION (Fixed) ======================
  const createUserMutation = useMutation({
    mutationFn: async (userData: { firstName: string; lastName: string; email: string; phone?: string }) => {
      console.log('🔄 Creating user via MASTER DATA hook:', userData);
      
      // Generate a unique ID for the new user
      const newUserId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
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

  // ====================== CREATE FACILITY MUTATION ======================
  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: { name: string; facilityType: string; address?: string; phone?: string; email?: string }) => {
      console.log('🏗️ Creating facility via MASTER DATA hook:', facilityData);

      const { data, error } = await supabase
        .from('facilities')
        .insert({
          ...( {
            id: crypto.randomUUID(),
            name: facilityData.name,
            facility_type: (facilityData.facilityType as any) || 'treatmentFacility',
            address: facilityData.address || '',
            phone: facilityData.phone || '',
            email: facilityData.email || '',
            is_active: true
          } as any ),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      showSuccess('Facility Created', 'Facility has been created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message || 'Failed to create facility');
    }
  });

  // ====================== CREATE MODULE MUTATION ======================
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: { name: string; description?: string }) => {
      console.log('🧩 Creating module via MASTER DATA hook:', moduleData);

      const { data, error } = await supabase
        .from('modules')
        .insert({
          id: crypto.randomUUID(),
          name: moduleData.name,
          description: moduleData.description || '',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      showSuccess('Module Created', 'Module has been created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message || 'Failed to create module');
    }
  });

  // ====================== CREATE API SERVICE MUTATION ======================
  const createApiServiceMutation = useMutation({
    mutationFn: async (serviceData: { name: string; type: string; description?: string }) => {
      console.log('🔌 Creating API service via MASTER DATA hook:', serviceData);

      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert({
          ...( {
            id: crypto.randomUUID(),
            name: serviceData.name,
            type: serviceData.type,
            description: serviceData.description || '',
            status: 'active'
          } as any )
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      showSuccess('API Service Created', 'Service has been created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message || 'Failed to create service');
    }
  });

  // ====================== CREATE PATIENT MUTATION ======================
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: { firstName: string; lastName: string; email: string }) => {
      console.log('❤️ Creating patient via MASTER DATA hook:', patientData);

      const newUserId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          email: patientData.email
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      showSuccess('Patient Created', 'Patient has been created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message || 'Failed to create patient');
    }
  });

  // ====================== STATISTICS ======================
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.length; // Assuming all are active for now
    const patientCount = users.filter(u => 
      Array.isArray(u.user_roles) && u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
    ).length;
    const adminCount = users.filter(u => 
      Array.isArray(u.user_roles) && u.user_roles.some(ur => ['superAdmin', 'onboardingTeam'].includes(ur.role.name))
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
    isCreatingFacility: createFacilityMutation.isPending,
    isCreatingModule: createModuleMutation.isPending,
    isCreatingApiService: createApiServiceMutation.isPending,
    isCreatingPatient: createPatientMutation.isPending,
    
    // ===== ERROR STATES =====
    error: usersError || facilitiesError || modulesError || apiServicesError,
    
    // ===== ACTIONS =====
    createUser: createUserMutation.mutate,
    createFacility: createFacilityMutation.mutate,
    createModule: createModuleMutation.mutate,
    createApiService: createApiServiceMutation.mutate,
    createPatient: createPatientMutation.mutate,
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
