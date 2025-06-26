import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface Module {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserModuleAssignment {
  id: string;
  user_id: string;
  module_id: string;
  assigned_by: string | null;
  assigned_at: string;
  expires_at: string | null;
  is_active: boolean;
  modules: Module;
}

interface EffectiveModule {
  module_id: string;
  module_name: string;
  module_description: string;
  source: string;
  expires_at: string | null;
}

export const useModules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRoles } = useAuthContext();

  // Get all available modules
  const {
    data: modules,
    isLoading: isLoadingModules,
    error: modulesError
  } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Module[];
    }
  });

  // Get current user's effective modules
  const {
    data: userModules,
    isLoading: isLoadingUserModules,
    error: userModulesError
  } = useQuery({
    queryKey: ['user-effective-modules'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .rpc('get_user_effective_modules', { check_user_id: user.id });

      if (error) throw error;
      return data as EffectiveModule[];
    }
  });

  // Check if user has access to a specific module
  const hasModuleAccess = (moduleName: string): boolean => {
    // Super admins have access to all modules
    if (userRoles.includes('superAdmin')) {
      console.log('🔑 Super admin has access to all modules:', moduleName);
      return true;
    }

    const hasAccess = userModules?.some(module => module.module_name === moduleName) || false;
    console.log('🔍 Module access check:', moduleName, 'Access:', hasAccess);
    console.log('🔍 User modules:', userModules?.map(m => m.module_name));
    return hasAccess;
  };

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
    modules,
    userModules,
    isLoadingModules,
    isLoadingUserModules,
    modulesError,
    userModulesError,
    hasModuleAccess,
    createModule: createModuleMutation.mutate,
    assignModule: assignModuleMutation.mutate,
    assignModuleToRole: assignModuleToRoleMutation.mutate,
    isCreating: createModuleMutation.isPending,
    isAssigning: assignModuleMutation.isPending,
    isAssigningToRole: assignModuleToRoleMutation.isPending
  };
};
