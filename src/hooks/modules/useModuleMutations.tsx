
/**
 * Module Mutations Hook
 * Focused on module CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useModuleMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create new module
  const createModuleMutation = useMutation({
    mutationFn: async ({ 
      name, 
      description, 
      is_active 
    }: { 
      name: string; 
      description: string | null; 
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from('modules')
        .insert({
          name,
          description,
          is_active
        });

      if (error) throw error;
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

  // Assign module to user
  const assignModuleMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      moduleId, 
      expiresAt 
    }: { 
      userId: string; 
      moduleId: string; 
      expiresAt?: string | null;
    }) => {
      const { error } = await supabase
        .from('user_module_assignments')
        .insert({
          user_id: userId,
          module_id: moduleId,
          expires_at: expiresAt
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-effective-modules'] });
      toast({
        title: "Module Access Granted",
        description: "Module has been assigned successfully.",
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

  // Assign module to role
  const assignModuleToRoleMutation = useMutation({
    mutationFn: async ({ 
      roleId, 
      moduleId 
    }: { 
      roleId: string; 
      moduleId: string; 
    }) => {
      const { error } = await supabase
        .from('role_module_assignments')
        .insert({
          role_id: roleId,
          module_id: moduleId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-effective-modules'] });
      toast({
        title: "Module Access Granted to Role",
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
    assignModule: assignModuleMutation.mutate,
    assignModuleToRole: assignModuleToRoleMutation.mutate,
    isCreating: createModuleMutation.isPending,
    isAssigning: assignModuleMutation.isPending,
    isAssigningToRole: assignModuleToRoleMutation.isPending
  };
};
