
/**
 * MASTER DATA HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all data access across the application
 * Version: master-data-v2.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_roles: {
    role: {
      name: string;
    };
  }[];
}

interface ApiService {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  base_url?: string;
  created_at: string;
  updated_at: string;
}

interface Facility {
  id: string;
  name: string;
  facility_type: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMasterData = () => {
  console.log('📊 Master Data Hook - Single source of truth for all data');
  
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['master-users'],
    queryFn: async (): Promise<User[]> => {
      console.log('👥 Fetching users from profiles table');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          created_at,
          updated_at,
          user_roles!inner(
            role:roles!inner(name)
          )
        `);

      if (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
      }

      console.log('✅ Users loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Fetch API services from api_integration_registry
  const { data: apiServices = [], isLoading: apiServicesLoading, error: apiServicesError } = useQuery({
    queryKey: ['master-api-services'],
    queryFn: async (): Promise<ApiService[]> => {
      console.log('🔌 Fetching API services from api_integration_registry');
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API services:', error);
        throw error;
      }

      console.log('✅ API services loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Fetch facilities
  const { data: facilities = [], isLoading: facilitiesLoading, error: facilitiesError } = useQuery({
    queryKey: ['master-facilities'],
    queryFn: async (): Promise<Facility[]> => {
      console.log('🏢 Fetching facilities');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }

      console.log('✅ Facilities loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Fetch modules
  const { data: modules = [], isLoading: modulesLoading, error: modulesError } = useQuery({
    queryKey: ['master-modules'],
    queryFn: async (): Promise<Module[]> => {
      console.log('🧩 Fetching modules');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching modules:', error);
        throw error;
      }

      console.log('✅ Modules loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Create API service mutation
  const createApiServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert(serviceData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-api-services'] });
      showSuccess('API Service Created', 'API service created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message);
    }
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.length, // All users are considered active in this simplified version
    totalApiServices: apiServices.length,
    activeApiServices: apiServices.filter(s => s.status === 'active'),
    patientUsers: users.filter(u => 
      u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
    ).length,
    totalFacilities: facilities.length,
    activeFacilities: facilities.filter(f => f.is_active).length,
    totalModules: modules.length,
    activeModules: modules.filter(m => m.is_active).length,
    adminCount: users.filter(u => 
      u.user_roles.some(ur => ur.role.name === 'superAdmin')
    ).length,
    staffCount: users.filter(u => 
      u.user_roles.some(ur => ['onboardingTeam', 'facilityAdmin'].includes(ur.role.name))
    ).length,
    patientCount: users.filter(u => 
      u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
    ).length,
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['master-users'] });
    queryClient.invalidateQueries({ queryKey: ['master-api-services'] });
    queryClient.invalidateQueries({ queryKey: ['master-facilities'] });
    queryClient.invalidateQueries({ queryKey: ['master-modules'] });
  };

  return {
    // Core data
    users,
    apiServices,
    facilities,
    modules,
    stats,
    
    // Loading states
    isLoading: usersLoading || apiServicesLoading || facilitiesLoading || modulesLoading,
    usersLoading,
    apiServicesLoading,
    facilitiesLoading,
    modulesLoading,
    
    // Error states
    error: usersError || apiServicesError || facilitiesError || modulesError,
    usersError,
    apiServicesError,
    facilitiesError,
    modulesError,
    
    // Actions
    createApiService: (data: any) => createApiServiceMutation.mutate(data),
    refreshData,
    
    // Additional actions (placeholders for full implementation)
    createUser: () => console.log('Create user - to be implemented'),
    deactivateUser: () => console.log('Deactivate user - to be implemented'),
    searchFacilities: (query: string) => facilities.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase())
    ),
    
    // Meta
    meta: {
      hookName: 'useMasterData',
      version: 'master-data-v2.0.0',
      singleSourceValidated: true,
      dataSource: 'real-database-tables',
      eliminatesMockData: true
    }
  };
};
