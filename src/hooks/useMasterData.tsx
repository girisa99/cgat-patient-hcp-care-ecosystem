
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
  is_active: boolean;
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
          is_active,
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
    activeUsers: users.filter(u => u.is_active).length,
    totalApiServices: apiServices.length,
    activeApiServices: apiServices.filter(s => s.status === 'active'),
    patientUsers: users.filter(u => 
      u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
    ).length,
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['master-users'] });
    queryClient.invalidateQueries({ queryKey: ['master-api-services'] });
  };

  return {
    // Core data
    users,
    apiServices,
    stats,
    
    // Loading states
    isLoading: usersLoading || apiServicesLoading,
    usersLoading,
    apiServicesLoading,
    
    // Error states
    error: usersError || apiServicesError,
    usersError,
    apiServicesError,
    
    // Actions
    createApiService: (data: any) => createApiServiceMutation.mutate(data),
    refreshData,
    
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
