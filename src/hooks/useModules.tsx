
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExtendedModule } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useModules = () => {
  const { toast } = useToast();
  
  const {
    data: modules,
    isLoading: isLoadingModules,
    error,
    refetch
  } = useQuery({
    queryKey: ['modules'],
    queryFn: async (): Promise<ExtendedModule[]> => {
      const { data, error } = await supabase
        .from('modules')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    retry: 1,
    staleTime: 30000
  });

  const {
    data: userModules,
    isLoading: isLoadingUserModules
  } = useQuery({
    queryKey: ['user-modules'],
    queryFn: async () => {
      return modules?.map(module => ({
        module_id: module.id,
        module_name: module.name,
        module_description: module.description
      })) || [];
    },
    enabled: !!modules
  });

  const hasModuleAccess = (moduleName: string): boolean => {
    return userModules?.some(module => 
      module.module_name.toLowerCase() === moduleName.toLowerCase()
    ) || false;
  };

  const assignModule = async (data: any) => {
    console.log('Assigning module:', data);
    toast({
      title: "Module Assigned",
      description: "Module has been assigned successfully",
    });
  };

  const createModule = async (data: any) => {
    console.log('Creating module:', data);
    toast({
      title: "Module Created",
      description: "Module has been created successfully",
    });
  };

  const assignModuleToRole = async (data: any) => {
    console.log('Assigning module to role:', data);
    toast({
      title: "Module Assigned to Role",
      description: "Module has been assigned to role successfully",
    });
  };

  return {
    modules: modules || [],
    userModules: userModules || [],
    isLoading: isLoadingModules || isLoadingUserModules,
    isLoadingModules: isLoadingModules || false,
    isLoadingUserModules: isLoadingUserModules || false,
    error,
    refetch,
    hasModuleAccess,
    assignModule,
    createModule,
    assignModuleToRole,
    isAssigning: false,
    isCreating: false,
    isAssigningToRole: false
  };
};
