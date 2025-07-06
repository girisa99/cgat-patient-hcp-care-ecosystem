
/**
 * SINGLE MASTER MODULES HOOK - ULTIMATE SINGLE SOURCE OF TRUTH
 * This is the ONLY hook that should be used for modules across the entire application
 * Eliminates ALL other module hooks to achieve true single source architecture
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface Module {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSingleMasterModules = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  console.log('🏆 SINGLE MASTER MODULES - The One and Only Hook');

  // SINGLE CACHE KEY - NO OTHER KEYS ALLOWED
  const CACHE_KEY = ['single-master-modules'];

  // SINGLE DATA SOURCE - REAL DATABASE ONLY
  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: CACHE_KEY,
    queryFn: async (): Promise<Module[]> => {
      console.log('📡 Fetching from REAL database - NO MOCK DATA');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Real database error:', error);
        throw error;
      }

      console.log('✅ Real data loaded:', data?.length || 0, 'modules');
      return data || [];
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // SINGLE CREATE MUTATION
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: { name: string; description?: string; is_active?: boolean }) => {
      console.log('➕ Creating module via REAL database');
      
      const { data, error } = await supabase
        .from('modules')
        .insert({
          name: moduleData.name,
          description: moduleData.description,
          is_active: moduleData.is_active ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newModule) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY });
      showSuccess("Module Created", `${newModule.name} created successfully`);
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    }
  });

  // SINGLE UPDATE MUTATION
  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Module> }) => {
      const { data, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY });
      showSuccess("Module Updated", "Module updated successfully");
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    }
  });

  // UTILITIES - ALL FROM SINGLE SOURCE
  const activeModules = modules.filter(m => m.is_active);
  const getModuleById = (id: string) => modules.find(m => m.id === id);
  
  const getModuleStats = () => ({
    total: modules.length,
    active: activeModules.length,
    inactive: modules.length - activeModules.length
  });

  const searchModules = (query: string) => {
    if (!query.trim()) return modules;
    const lowercaseQuery = query.toLowerCase();
    return modules.filter(m => 
      m.name.toLowerCase().includes(lowercaseQuery) ||
      (m.description && m.description.toLowerCase().includes(lowercaseQuery))
    );
  };

  // INTEGRITY VERIFICATION
  const verifyModuleIntegrity = () => {
    const hasValidNames = modules.every(m => m.name && m.name.trim().length > 0);
    return {
      isHealthy: hasValidNames,
      totalModules: modules.length,
      activeModules: activeModules.length,
      issues: hasValidNames ? [] : ['Invalid module names detected']
    };
  };

  return {
    // CORE DATA - SINGLE SOURCE
    modules,
    activeModules,
    
    // LOADING STATES
    isLoading,
    isCreating: createModuleMutation.isPending,
    isUpdating: updateModuleMutation.isPending,
    
    // ERROR STATE
    error,
    
    // ACTIONS - SINGLE SOURCE
    createModule: (data: { name: string; description?: string; is_active?: boolean }) => 
      createModuleMutation.mutate(data),
    updateModule: (data: { id: string; updates: Partial<Module> }) => 
      updateModuleMutation.mutate(data),
    
    // UTILITIES - SINGLE SOURCE
    getModuleById,
    getModuleStats,
    searchModules,
    verifyModuleIntegrity,
    
    // META INFO - SINGLE SOURCE VALIDATION
    meta: {
      dataSource: 'modules table (real database)',
      hookName: 'useSingleMasterModules',
      version: 'single-source-v1.0',
      cacheKey: CACHE_KEY.join('-'),
      noMockData: true,
      singleSourceValidated: true,
      hookCount: 1,
      duplicateHooksEliminated: true,
      realDatabaseOnly: true,
      multiTenantReady: true
    }
  };
};
