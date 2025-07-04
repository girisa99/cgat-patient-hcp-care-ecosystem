
/**
 * MODULES HOOK - Real data management with proper interface
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface Module {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export const useModules = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: ['modules'],
    queryFn: async (): Promise<Module[]> => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('modules')
        .insert({
          name: moduleData.name,
          description: moduleData.description,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      showSuccess("Module Created", "Module has been created successfully");
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message || "Failed to create module");
    }
  });

  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; name?: string; description?: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('modules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      showSuccess("Module Updated", "Module has been updated successfully");
    },
    onError: (error: any) => {
      showError("Update Failed", error.message || "Failed to update module");
    }
  });

  const searchModules = (query: string) => {
    if (!query.trim()) return modules;
    
    const lowercaseQuery = query.toLowerCase();
    return modules.filter(module => 
      module.name.toLowerCase().includes(lowercaseQuery) ||
      (module.description && module.description.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getModuleStats = () => {
    const total = modules.length;
    const active = modules.filter(m => m.is_active).length;
    
    return {
      total,
      active,
      inactive: total - active
    };
  };

  return {
    modules,
    isLoading,
    error,
    createModule: createModuleMutation.mutate,
    updateModule: updateModuleMutation.mutate,
    isCreatingModule: createModuleMutation.isPending,
    isUpdatingModule: updateModuleMutation.isPending,
    searchModules,
    getModuleStats
  };
};
