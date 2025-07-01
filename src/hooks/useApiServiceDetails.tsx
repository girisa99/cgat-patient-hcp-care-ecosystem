import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for fetching detailed API service information including endpoints, schemas, mappings
 */
export const useApiServiceDetails = () => {
  const { toast } = useToast();

  // Fetch API endpoints
  const { data: apiEndpoints, isLoading: isLoadingEndpoints } = useQuery({
    queryKey: ['api-endpoints'],
    queryFn: async () => {
      console.log('🔍 Fetching API endpoints...');
      
      const { data, error } = await supabase
        .from('external_api_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API endpoints:', error);
        throw error;
      }

      console.log('✅ API endpoints fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 30000
  });

  // Generate consolidated API service stats with real data
  const getDetailedApiStats = (apiServices: any[]) => {
    const stats = {
      totalEndpoints: apiEndpoints?.length || 0,
      totalSchemas: 0,
      totalMappings: 0,
      totalSecurityPolicies: 0,
      totalModules: 0,
      totalDocs: 0,
      apiBreakdown: {} as Record<string, any>
    };

    // Calculate detailed stats for each API service
    apiServices.forEach(service => {
      const serviceEndpoints = apiEndpoints?.filter(endpoint => 
        endpoint.external_api_id === service.id
      ) || [];
      
      stats.apiBreakdown[service.id] = {
        ...service,
        endpoints: serviceEndpoints,
        endpointCount: serviceEndpoints.length,
        hasDocumentation: !!service.documentation_url,
        hasSchemas: serviceEndpoints.some(e => e.request_schema || e.response_schema),
        securityCount: serviceEndpoints.filter(e => e.requires_authentication).length,
        publicEndpoints: serviceEndpoints.filter(e => e.is_public).length
      };

      // Update totals
      stats.totalSchemas += serviceEndpoints.filter(e => e.request_schema || e.response_schema).length;
      stats.totalSecurityPolicies += serviceEndpoints.filter(e => e.requires_authentication).length;
      stats.totalDocs += service.documentation_url ? 1 : 0;
    });

    return stats;
  };

  // Clean up duplicate APIs
  const consolidateApiServices = (apiServices: any[]) => {
    console.log('🔧 Consolidating API services to remove duplicates...');
    
    // Group by similar names to identify duplicates
    const grouped = apiServices.reduce((acc, service) => {
      const key = service.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(service);
      return acc;
    }, {} as Record<string, any[]>);

    // Keep the most recent/complete version of each service
    const consolidated = Object.values(grouped).map(group => {
      if (group.length === 1) return group[0];
      
      // Prefer services with more data/newer dates
      return group.reduce((best, current) => {
        const bestScore = (best.endpoints_count || 0) + (best.documentation_url ? 1 : 0);
        const currentScore = (current.endpoints_count || 0) + (current.documentation_url ? 1 : 0);
        
        if (currentScore > bestScore) return current;
        if (currentScore === bestScore && new Date(current.updated_at) > new Date(best.updated_at)) {
          return current;
        }
        return best;
      });
    });

    console.log(`📊 Consolidated ${apiServices.length} APIs down to ${consolidated.length}`);
    return consolidated;
  };

  return {
    apiEndpoints: apiEndpoints || [],
    isLoadingEndpoints,
    getDetailedApiStats,
    consolidateApiServices
  };
};
