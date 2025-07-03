import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useApiServices = () => {
  const [loading, setLoading] = useState(false);
  const [apiServices, setApiServices] = useState([]);

  useEffect(() => {
    console.log('🔗 API Services hook loaded - minimal version');
  }, []);

  return {
    loading,
    isLoading: loading,
    apiServices,
    internalApis: [],
    externalApis: [],
    totalCount: 0,
    refresh: () => {},
    createApiService: async () => ({ success: false }),
    updateApiService: async () => ({ success: false }),
    deleteApiService: async () => ({ success: false })
  };
};