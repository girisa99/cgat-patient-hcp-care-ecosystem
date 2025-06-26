
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyConfig {
  name: string;
  type: 'development' | 'production' | 'sandbox';
  modules: string[];
  permissions: string[];
  rateLimit: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  expiresAt?: string;
  ipWhitelist?: string[];
}

interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only available immediately after creation
  key_prefix: string;
  type: 'development' | 'production' | 'sandbox';
  modules: string[];
  permissions: string[];
  rate_limit_requests: number;
  rate_limit_period: 'minute' | 'hour' | 'day';
  status: 'active' | 'inactive' | 'pending';
  expires_at?: string;
  ip_whitelist?: string[];
  last_used?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export const useApiKeys = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const {
    data: apiKeys,
    isLoading,
    error
  } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    }
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (config: ApiKeyConfig) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate the API key
      const { data: keyData, error: keyError } = await supabase.rpc(
        'generate_api_key',
        { key_type: config.type }
      );

      if (keyError) throw keyError;

      const apiKey = keyData as string;
      // Create a simple hash for the key (in production, use a proper crypto library)
      const keyHash = btoa(apiKey); // Base64 encoding as a simple hash
      const keyPrefix = apiKey.substring(0, 12) + '...';

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name: config.name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          type: config.type,
          modules: config.modules,
          permissions: config.permissions,
          rate_limit_requests: config.rateLimit.requests,
          rate_limit_period: config.rateLimit.period,
          expires_at: config.expiresAt || null,
          ip_whitelist: config.ipWhitelist || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return { ...data, key: apiKey };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API Key Created",
        description: `${data.name} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ApiKey> }) => {
      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API Key Updated",
        description: "API key has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API Key Deleted",
        description: "API key has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  return {
    apiKeys: apiKeys || [],
    isLoading,
    error,
    visibleKeys,
    createApiKey: createApiKeyMutation.mutate,
    isCreating: createApiKeyMutation.isPending,
    updateApiKey: updateApiKeyMutation.mutate,
    isUpdating: updateApiKeyMutation.isPending,
    deleteApiKey: deleteApiKeyMutation.mutate,
    isDeleting: deleteApiKeyMutation.isPending,
    toggleKeyVisibility,
    handleCopyKey
  };
};
