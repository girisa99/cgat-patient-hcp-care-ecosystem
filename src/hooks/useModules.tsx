
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/components/auth/AuthProvider';

export const useModules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRoles } = useAuthContext();

  const {
    data: modules,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      console.log('🔧 Fetching modules...');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching modules:', error);
        throw error;
      }

      console.log('✅ Modules fetched:', data?.length || 0);
      return data || [];
    },
    retry: 1,
    staleTime: 60000
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
      return data || [];
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
    return hasAccess;
  };

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: {
      name: string;
      description?: string;
      is_active?: boolean;
    }) => {
      console.log('🔄 Creating module:', moduleData);
      
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({
        title: "Module Created",
        description: "New module has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Create module error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create module",
        variant: "destructive",
      });
    }
  });

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
      console.log('🔄 Assigning module to user:', { userId, moduleId, expiresAt });
      
      const { error } = await supabase
        .from('user_module_assignments')
        .insert({
          user_id: userId,
          module_id: moduleId,
          expires_at: expiresAt,
          is_active: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-effective-modules'] });
      toast({
        title: "Module Access Granted",
        description: "Module has been assigned to user successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Assign module to user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign module to user",
        variant: "destructive",
      });
    }
  });

  const assignModuleToRoleMutation = useMutation({
    mutationFn: async ({ 
      roleId, 
      moduleId 
    }: { 
      roleId: string; 
      moduleId: string; 
    }) => {
      console.log('🔄 Assigning module to role:', { roleId, moduleId });
      
      const { error } = await supabase
        .from('role_module_assignments')
        .insert({
          role_id: roleId,
          module_id: moduleId,
          is_active: true
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
      console.error('❌ Assign module to role error:', error);
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
    isLoading,
    isLoadingModules: isLoading, // Alias for backward compatibility
    isLoadingUserModules,
    error,
    refetch,
    hasModuleAccess,
    createModule: createModuleMutation.mutate,
    assignModule: assignModuleMutation.mutate,
    assignModuleToRole: assignModuleToRoleMutation.mutate,
    isCreatingModule: createModuleMutation.isPending,
    isCreating: createModuleMutation.isPending, // Alias for backward compatibility
    isAssigning: assignModuleMutation.isPending,
    isAssigningToRole: assignModuleToRoleMutation.isPending
  };
};
