
/**
 * Module Data Fetching Hook
 * Focused on retrieving module information
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Module {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EffectiveModule {
  module_id: string;
  module_name: string;
  module_description: string;
  access_source: string; // Changed from 'source' to 'access_source' to match database function
  expires_at: string | null;
}

export const useModuleData = () => {
  // Get all available modules
  const {
    data: modules,
    isLoading: isLoadingModules,
    error: modulesError
  } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Module[];
    }
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
      return data as EffectiveModule[];
    }
  });

  return {
    modules,
    userModules,
    isLoadingModules,
    isLoadingUserModules,
    modulesError,
    userModulesError
  };
};
