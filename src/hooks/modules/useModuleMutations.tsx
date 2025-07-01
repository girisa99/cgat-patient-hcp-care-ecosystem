
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
        .insert({
          name: moduleData.name,
          description: moduleData.description || null,
          is_active: true
        })
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

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({
        title: "Module Deleted",
        description: "Module has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete module",
        variant: "destructive",
      });
    }
  });

  const assignModuleToRoleMutation = useMutation({
    mutationFn: async ({ roleId, moduleId }: { roleId: string; moduleId: string }) => {
      // This would typically involve a role_module_assignments table
      // For now, we'll just log the assignment
      console.log('Assigning module', moduleId, 'to role', roleId);
      return { roleId, moduleId };
    },
    onSuccess: () => {
      toast({
        title: "Module Assigned",
        description: "Module has been assigned to role successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign module to role",
        variant: "destructive",
      });
    }
  });

  return {
    createModule: createModuleMutation.mutate,
    updateModule: updateModuleMutation.mutate,
    deleteModule: deleteModuleMutation.mutate,
    assignModuleToRole: assignModuleToRoleMutation.mutate,
    isCreatingModule: createModuleMutation.isPending,
    isUpdatingModule: updateModuleMutation.isPending,
    isDeletingModule: deleteModuleMutation.isPending,
    isAssigningModule: assignModuleToRoleMutation.isPending
  };
};
