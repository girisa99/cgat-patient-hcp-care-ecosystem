
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  user_id: string;
}

export const useApiKeys = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: apiKeys,
    isLoading,
    error
  } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async (): Promise<ApiKey[]> => {
      console.log('🔍 Fetching API keys...');
      
      // For now, return mock data since we don't have the table set up
      return [
        {
          id: '1',
          name: 'Production API Key',
          key_value: 'sk_live_1234567890abcdef1234567890abcdef12345678',
          is_active: true,
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
          user_id: 'current-user'
        }
      ];
    },
    staleTime: 60000
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (name: string): Promise<ApiKey> => {
      console.log('🔑 Creating new API key:', name);
      
      // Generate a mock API key
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name,
        key_value: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        is_active: true,
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      };
      
      return newKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create API key.",
        variant: "destructive",
      });
    }
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      console.log('🗑️ Deleting API key:', keyId);
      return keyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete API key.",
        variant: "destructive",
      });
    }
  });

  return {
    apiKeys,
    isLoading,
    error,
    createApiKey: createApiKeyMutation.mutate,
    deleteApiKey: deleteApiKeyMutation.mutate,
    isCreating: createApiKeyMutation.isPending,
    isDeleting: deleteApiKeyMutation.isPending
  };
};
