
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';

type Module = Database['public']['Tables']['modules']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

interface UserModule {
  id: string;
  moduleName: string;
  description?: string;
}

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
    queryFn: async (): Promise<Module[]> => {
      console.log('⚙️ Fetching modules...');
      
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Error fetching modules:', error);
          throw error;
        }

        console.log('✅ Modules loaded:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('❌ Exception fetching modules:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
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
      
      return (data || []).map(item => ({
        id: item.module_id,
        moduleName: item.module_name,
        description: item.module_description
      })) as UserModule[];
    }
  });

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
      roleId: UserRole; 
      moduleId: string; 
    }) => {
      console.log('🔄 Assigning module to role - looking up role ID for:', roleId);
      
      // First, get the actual UUID for the role by name  
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleId)
        .single();

      if (roleError || !role) {
        console.error('❌ Role not found:', roleId, roleError);
        throw new Error(`Role '${roleId}' not found`);
      }

      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from('role_module_assignments')
        .select('id')
        .eq('role_id', role.id)
        .eq('module_id', moduleId)
        .eq('is_active', true)
        .single();

      if (existingAssignment) {
        console.log('ℹ️ Role already has access to this module');
        return { success: true };
      }

      // Create the assignment with the actual role UUID
      const { error } = await supabase
        .from('role_module_assignments')
        .insert({
          role_id: role.id,
          module_id: moduleId,
          is_active: true
        });

      if (error) {
        console.error('❌ Error creating role module assignment:', error);
        throw error;
      }

      console.log('✅ Successfully assigned module to role');
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

  // Check if user has access to a specific module
  const hasModuleAccess = (moduleName: string): boolean => {
    // Super admins have access to all modules
    if (userRoles.includes('superAdmin')) {
      console.log('🔑 Super admin has access to all modules:', moduleName);
      return true;
    }

    const hasAccess = userModules?.some(module => module.moduleName === moduleName) || false;
    console.log('🔍 Module access check:', moduleName, 'Access:', hasAccess);
    return hasAccess;
  };

  return {
    modules: modules || [],
    userModules: userModules || [],
    isLoading,
    isLoadingModules: isLoading,
    isLoadingUserModules,
    error,
    errorAllModules: error,
    isLoadingAllModules: isLoading,
    userModulesError,
    refetch,
    createModule: createModuleMutation.mutate,
    assignModule: assignModuleMutation.mutate,
    assignModuleToRole: assignModuleToRoleMutation.mutate,
    isCreating: createModuleMutation.isPending,
    isAssigning: assignModuleMutation.isPending,
    isAssigningToRole: assignModuleToRoleMutation.isPending,
    hasModuleAccess
  };
};
