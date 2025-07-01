
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Focused hook for module mutations
 */
export const useModuleMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: any) => {
      console.log('🔄 Creating module:', moduleData);
      
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
        description: "Module has been created successfully",
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

  const assignModuleMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      console.log('🔄 Assigning module:', assignmentData);
      // TODO: Implement actual assignment logic
      return assignmentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({
        title: "Module Assigned",
        description: "Module has been assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign module",
        variant: "destructive",
      });
    }
  });

  return {
    createModule: createModuleMutation.mutate,
    assignModule: assignModuleMutation.mutate,
    assignModuleToRole: assignModuleMutation.mutate,
    isCreating: createModuleMutation.isPending,
    isAssigning: assignModuleMutation.isPending,
    isAssigningToRole: assignModuleMutation.isPending
  };
};
