
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useModules = () => {
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

  return {
    modules: modules || [],
    isLoading,
    error,
    getModuleStats,
    meta: {
      totalModules: modules?.length || 0,
      dataSource: 'modules table',
      lastUpdated: new Date().toISOString()
    }
  };
};
