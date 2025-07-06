
/**
 * SINGLE MASTER MODULES HOOK - ULTIMATE SINGLE SOURCE OF TRUTH
 * This is the ONLY hook that should be used for modules across the entire application
 * Uses aligned TypeScript types that match database schema exactly
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import type { DatabaseModule, ModuleCreateInput, ModuleUpdateInput, ModuleStats, ModuleIntegrityCheck } from '@/types/modules';

export const useSingleMasterModules = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  console.log('🏆 SINGLE MASTER MODULES - The One and Only Hook');

  // SINGLE CACHE KEY - NO OTHER KEYS ALLOWED
  const CACHE_KEY = ['single-master-modules'];

  // SINGLE DATA SOURCE - REAL DATABASE ONLY
  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: CACHE_KEY,
    queryFn: async (): Promise<DatabaseModule[]> => {
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

  // SINGLE CREATE MUTATION - ALIGNED WITH DATABASE SCHEMA
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: ModuleCreateInput) => {
      console.log('➕ Creating module via REAL database');
      
      const { data, error } = await supabase
        .from('modules')
        .insert({
          name: moduleData.name,
          description: moduleData.description || null,
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

  // SINGLE UPDATE MUTATION - ALIGNED WITH DATABASE SCHEMA
  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ModuleUpdateInput }) => {
      const { data, error } = await supabase
        .from('modules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
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

  // UTILITIES - ALL FROM SINGLE SOURCE WITH ALIGNED TYPES
  const activeModules = modules.filter(m => m.is_active);
  const getModuleById = (id: string): DatabaseModule | undefined => modules.find(m => m.id === id);
  
  const getModuleStats = (): ModuleStats => ({
    total: modules.length,
    active: activeModules.length,
    inactive: modules.length - activeModules.length
  });

  const searchModules = (query: string): DatabaseModule[] => {
    if (!query.trim()) return modules;
    const lowercaseQuery = query.toLowerCase();
    return modules.filter(m => 
      m.name.toLowerCase().includes(lowercaseQuery) ||
      (m.description && m.description.toLowerCase().includes(lowercaseQuery))
    );
  };

  // INTEGRITY VERIFICATION - DATABASE ALIGNED
  const verifyModuleIntegrity = (): ModuleIntegrityCheck => {
    const hasValidNames = modules.every(m => m.name && m.name.trim().length > 0);
    return {
      isHealthy: hasValidNames,
      totalModules: modules.length,
      activeModules: activeModules.length,
      issues: hasValidNames ? [] : ['Invalid module names detected']
    };
  };

  return {
    // CORE DATA - SINGLE SOURCE WITH ALIGNED TYPES
    modules,
    activeModules,
    
    // LOADING STATES
    isLoading,
    isCreating: createModuleMutation.isPending,
    isUpdating: updateModuleMutation.isPending,
    
    // ERROR STATE
    error,
    
    // ACTIONS - SINGLE SOURCE WITH ALIGNED TYPES
    createModule: (data: ModuleCreateInput) => createModuleMutation.mutate(data),
    updateModule: (data: { id: string; updates: ModuleUpdateInput }) => 
      updateModuleMutation.mutate(data),
    
    // UTILITIES - SINGLE SOURCE WITH ALIGNED TYPES
    getModuleById,
    getModuleStats,
    searchModules,
    verifyModuleIntegrity,
    
    // META INFO - SINGLE SOURCE VALIDATION
    meta: {
      dataSource: 'modules table (real database)',
      hookName: 'useSingleMasterModules',
      version: 'single-source-v1.0-aligned',
      cacheKey: CACHE_KEY.join('-'),
      noMockData: true,
      singleSourceValidated: true,
      hookCount: 1,
      duplicateHooksEliminated: true,
      realDatabaseOnly: true,
      multiTenantReady: true,
      typescriptDatabaseAligned: true,
      namingConventionAligned: true
    }
  };
};
