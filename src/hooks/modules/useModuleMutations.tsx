
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useModuleMutations = () => {
  const { toast } = useToast();
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
      toast({
        title: "Module Created",
        description: "New module has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create module",
        variant: "destructive",
      });
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
      toast({
        title: "Module Updated",
        description: "Module has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update module",
        variant: "destructive",
      });
    }
  });

  return {
    createModule: createModuleMutation.mutate,
    updateModule: updateModuleMutation.mutate,
    isCreatingModule: createModuleMutation.isPending,
    isUpdatingModule: updateModuleMutation.isPending
  };
};
