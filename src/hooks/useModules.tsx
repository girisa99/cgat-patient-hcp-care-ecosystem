
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useModules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: {
      name: string;
      description?: string;
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

  return {
    modules,
    isLoading,
    error,
    refetch,
    createModule: createModuleMutation.mutate,
    isCreatingModule: createModuleMutation.isPending
  };
};
