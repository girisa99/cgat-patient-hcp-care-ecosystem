
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
      is_active?: boolean;
    }) => {
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
    mutationFn: async ({ userId, moduleId }: { userId: string; moduleId: string }) => {
      console.log('🔄 Assigning module:', moduleId, 'to user:', userId);
      
      const { data, error } = await supabase
        .from('user_module_assignments')
        .insert({
          user_id: userId,
          module_id: moduleId,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
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

  const assignModuleToRoleMutation = useMutation({
    mutationFn: async ({ roleId, moduleId }: { roleId: string; moduleId: string }) => {
      console.log('🔄 Assigning module:', moduleId, 'to role:', roleId);
      
      const { data, error } = await supabase
        .from('role_module_assignments')
        .insert({
          role_id: roleId,
          module_id: moduleId,
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
        title: "Module Assigned to Role",
        description: "Module has been assigned to role successfully",
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
    assignModule: assignModuleMutation.mutate,
    assignModuleToRole: assignModuleToRoleMutation.mutate,
    isCreating: createModuleMutation.isPending,
    isAssigning: assignModuleMutation.isPending,
    isAssigningToRole: assignModuleToRoleMutation.isPending
  };
};
