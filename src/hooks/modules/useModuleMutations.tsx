
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

export const useModuleMutations = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: {
      name: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('modules')
        .insert(moduleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      showSuccess("Module Created", "New module has been created successfully.");
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to create module");
    }
  });

  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
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
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      showSuccess("Module Updated", "Module has been updated successfully.");
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to update module");
    }
  });

  return {
    createModule: createModuleMutation.mutate,
    updateModule: updateModuleMutation.mutate,
    isCreatingModule: createModuleMutation.isPending,
    isUpdatingModule: updateModuleMutation.isPending
  };
};
