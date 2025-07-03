
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useModules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: modules, isLoading, error } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('modules')
        .insert([{ ...moduleData, is_active: true }])
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
        title: "Module Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; is_active?: boolean }) => {
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
        title: "Module Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Assign module to role mutation
  const assignModuleToRoleMutation = useMutation({
    mutationFn: async ({ moduleId, roleId }: { moduleId: string; roleId: string }) => {
      const { data, error } = await supabase
        .from('role_module_assignments')
        .insert([{ module_id: moduleId, role_id: roleId, is_active: true }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({
        title: "Module Assigned",
        description: "Module has been assigned to role successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Calculate module statistics
  const getModuleStats = () => {
    const total = modules?.length || 0;
    const active = modules?.filter(m => m.is_active !== false).length || 0;
    const inactive = total - active;
    const userAccessible = active; // For now, assume all active modules are user accessible
    const byCategory = modules?.reduce((acc: any, module) => {
      const category = 'general'; // Default category since modules table doesn't have category
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      total,
      active,
      inactive,
      userAccessible,
      byCategory
    };
  };

  // Search modules function
  const searchModules = (query: string) => {
    if (!query.trim()) return modules || [];
    
    return modules?.filter(module => 
      module.name?.toLowerCase().includes(query.toLowerCase()) ||
      module.description?.toLowerCase().includes(query.toLowerCase())
    ) || [];
  };

  // Mock user modules (would be replaced with actual user module query)
  const userModules = modules || [];

  // Mock module access check
  const hasModuleAccess = (moduleId: string) => {
    return userModules.some(module => module.id === moduleId);
  };

  return {
    // Data
    modules: modules || [],
    userModules,
    isLoading,
    isLoadingModules: isLoading,
    isLoadingUserModules: isLoading,
    error,
    
    // Actions
    createModule: createModuleMutation.mutate,
    updateModule: updateModuleMutation.mutate,
    assignModuleToRole: assignModuleToRoleMutation.mutate,
    
    // Utilities
    getModuleStats,
    searchModules,
    hasModuleAccess,
    
    // Status flags
    isCreatingModule: createModuleMutation.isPending,
    isUpdatingModule: updateModuleMutation.isPending,
    isAssigningToRole: assignModuleToRoleMutation.isPending,
    
    // Meta information
    meta: {
      totalModules: modules?.length || 0,
      dataSource: 'modules table',
      lastUpdated: new Date().toISOString()
    }
  };
};
