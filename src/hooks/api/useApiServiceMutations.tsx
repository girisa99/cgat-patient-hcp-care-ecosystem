
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useApiServiceMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createApiServiceMutation = useMutation({
    mutationFn: async (serviceData: {
      name: string;
      description?: string;
      base_url?: string;
      category: string;
      type: string;
      direction: string;
      purpose: string;
    }) => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert({
          ...serviceData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-services'] });
      toast({
        title: "API Service Created",
        description: "New API service has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API service",
        variant: "destructive",
      });
    }
  });

  const updateApiServiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-services'] });
      toast({
        title: "API Service Updated",
        description: "API service has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API service",
        variant: "destructive",
      });
    }
  });

  return {
    createApiService: createApiServiceMutation.mutate,
    updateApiService: updateApiServiceMutation.mutate,
    isCreatingApiService: createApiServiceMutation.isPending,
    isUpdatingApiService: updateApiServiceMutation.isPending
  };
};
