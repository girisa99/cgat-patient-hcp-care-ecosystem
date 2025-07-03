/**
 * MASTER MODULES MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates ALL modules functionality into ONE hook
 * Version: master-modules-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// SINGLE CACHE KEY for all modules operations
const MASTER_MODULES_CACHE_KEY = ['master-modules'];

export interface Module {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * MASTER Modules Management Hook - Everything in ONE place
 */
export const useMasterModules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log('📦 Master Modules - Single Source of Truth Active');

  // ====================== DATA FETCHING ======================
  const {
    data: modules = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: MASTER_MODULES_CACHE_KEY,
    queryFn: async (): Promise<Module[]> => {
      console.log('🔍 Fetching modules from single source...');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching modules:', error);
        throw error;
      }
      
      console.log('✅ Modules fetched from master source:', data?.length || 0);
      return data || [];
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ====================== CACHE INVALIDATION HELPER ======================
  const invalidateCache = () => {
    console.log('🔄 Invalidating master modules cache...');
    queryClient.invalidateQueries({ queryKey: MASTER_MODULES_CACHE_KEY });
  };

  // ====================== MODULE CREATION ======================
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: {
      name: string;
      description?: string;
    }) => {
      console.log('🔄 Creating module in master hook:', moduleData.name);
      
      const { data, error } = await supabase
        .from('modules')
        .insert({
          ...moduleData,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      toast({
        title: "Module Created",
        description: "New module has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Module Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== MODULE UPDATE ======================
  const updateModuleMutation = useMutation({
    mutationFn: async ({ moduleId, updates }: { moduleId: string; updates: Partial<Module> }) => {
      console.log('🔄 Updating module in master hook:', moduleId);
      
      const { data, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', moduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      toast({
        title: "Module Updated",
        description: "Module has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Module Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== MODULE DEACTIVATION ======================
  const deactivateModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      console.log('🔄 Deactivating module in master hook:', moduleId);
      
      const { data, error } = await supabase
        .from('modules')
        .update({ is_active: false })
        .eq('id', moduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      toast({
        title: "Module Deactivated",
        description: "Module has been deactivated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Module Deactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== UTILITY FUNCTIONS ======================
  const searchModules = (query: string): Module[] => {
    if (!query.trim()) return modules;
    
    return modules.filter((module: Module) => 
      module.name?.toLowerCase().includes(query.toLowerCase()) ||
      module.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getModuleStats = () => {
    return {
      total: modules.length,
      active: modules.filter(m => m.is_active).length,
      inactive: modules.filter(m => !m.is_active).length,
    };
  };

  // ====================== RETURN CONSOLIDATED API ======================
  return {
    // Data
    modules,
    isLoading,
    error,
    refetch,
    
    // Module Management
    createModule: createModuleMutation.mutate,
    isCreatingModule: createModuleMutation.isPending,
    
    updateModule: updateModuleMutation.mutate,
    isUpdatingModule: updateModuleMutation.isPending,
    
    deactivateModule: deactivateModuleMutation.mutate,
    isDeactivatingModule: deactivateModuleMutation.isPending,
    
    // Utilities
    searchModules,
    getModuleStats,
    
    // Aliases for backward compatibility
    data: modules,
    loading: isLoading,
    
    // Meta Information
    meta: {
      totalModules: modules.length,
      activeModules: modules.filter(m => m.is_active).length,
      dataSource: 'modules table (master hook)',
      lastFetched: new Date().toISOString(),
      version: 'master-modules-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'consolidated',
      cacheKey: MASTER_MODULES_CACHE_KEY.join('-'),
      stabilityGuarantee: true
    }
  };
};