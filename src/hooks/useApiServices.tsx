
/**
 * API SERVICES HOOK - Real data management
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useApiServices = () => {
  const { data: apiServices = [], isLoading } = useQuery({
    queryKey: ['api-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select(`
          *,
          contact_email,
          contact_phone,
          contact_name,
          rate_limit_requests_per_hour,
          rate_limit_requests_per_minute,
          requires_approval,
          requires_authentication,
          webhook_url,
          sla_response_time_ms,
          sla_uptime_percentage
        `)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  return {
    apiServices,
    isLoading
  };
};
