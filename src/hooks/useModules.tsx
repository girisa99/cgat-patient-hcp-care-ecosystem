
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExtendedModule } from '@/types/database';

export const useModules = () => {
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

  // Mock user modules for now - this would come from a proper query
  const {
    data: userModules,
    isLoading: isLoadingUserModules
  } = useQuery({
    queryKey: ['user-modules'],
    queryFn: async () => {
      // This should be replaced with actual user module query
      return modules?.map(module => ({
        module_id: module.id,
        module_name: module.name,
        module_description: module.description
      })) || [];
    },
    enabled: !!modules
  });

  return {
    modules: modules || [],
    userModules: userModules || [],
    isLoadingModules: isLoadingModules || isLoadingUserModules,
    error,
    refetch,
    assignModule: async (data: any) => {
      // Mock implementation for now
      console.log('Assigning module:', data);
    },
    isAssigning: false
  };
};
