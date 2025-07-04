
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  type: string;
  status: string;
  permissions: string[];
  modules: string[];
  created_at: string;
  last_used?: string;
  usage_count: number;
  user_id: string;
  key_hash: string;
}

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  console.log('🎯 API Keys Hook - Real Database Integration');

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setApiKeys(data || []);
      showSuccess('API keys loaded from database');
    } catch (err) {
      const errorMessage = 'Failed to fetch API keys from database';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (keyData: Omit<ApiKey, 'id' | 'created_at' | 'usage_count' | 'last_used'>) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .insert([keyData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchApiKeys();
      showSuccess('API key created successfully');
      return data;
    } catch (err) {
      showError('Failed to create API key');
      throw err;
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchApiKeys();
      showSuccess('API key deleted successfully');
    } catch (err) {
      showError('Failed to delete API key');
      throw err;
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return {
    apiKeys,
    isLoading,
    error,
    fetchApiKeys,
    createApiKey,
    deleteApiKey,
    meta: {
      version: 'api-keys-v2.0.0',
      realDataOnly: true,
      dataSource: 'supabase-api-keys-table'
    }
  };
};
