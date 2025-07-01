import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiService {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  direction: string;
  purpose: string;
  status: string;
  endpoints_count?: number;
  documentation_url?: string;
  created_at: string;
  updated_at: string;
}

interface ApiEndpoint {
  id: string;
  external_api_id: string;
  method: string;
  external_path: string;
  request_schema?: any;
  response_schema?: any;
  requires_authentication: boolean;
  is_public: boolean;
  summary?: string;
}

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
  const getDetailedApiStats = (apiServices: ApiService[]) => {
    // Ensure apiServices is an array
    const services = Array.isArray(apiServices) ? apiServices : [];
    const endpoints = Array.isArray(apiEndpoints) ? apiEndpoints : [];
    
    console.log('📊 Calculating detailed stats for:', {
      servicesCount: services.length,
      endpointsCount: endpoints.length
    });
    
    const stats = {
      totalEndpoints: endpoints.length,
      totalSchemas: 0,
      totalMappings: 0,
      totalSecurityPolicies: 0,
      totalModules: 0,
      totalDocs: 0,
      apiBreakdown: {} as Record<string, any>
    };

    // Calculate detailed stats for each API service
    services.forEach(service => {
      if (!service || !service.id) return;
      
      const serviceEndpoints = endpoints.filter(endpoint => 
        endpoint.external_api_id === service.id
      );
      
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

    console.log('📊 Final detailed stats:', stats);
    return stats;
  };

  // Clean up duplicate APIs and consolidate to single source of truth
  const consolidateApiServices = (apiServices: ApiService[]) => {
    console.log('🔧 Consolidating API services to remove duplicates...');
    
    // Ensure we have an array
    const services = Array.isArray(apiServices) ? apiServices : [];
    
    if (services.length === 0) {
      console.log('⚠️ No services to consolidate');
      return [];
    }
    
    // Group by similar names to identify duplicates
    const grouped = services.reduce((acc, service) => {
      if (!service || !service.name) return acc;
      
      const key = service.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(service);
      return acc;
    }, {} as Record<string, ApiService[]>);

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

    console.log(`📊 Consolidated ${services.length} APIs down to ${consolidated.length}`);
    
    // Log any duplicates found for verification
    const duplicates = Object.entries(grouped).filter(([_, group]) => group.length > 1);
    if (duplicates.length > 0) {
      console.log('🔍 Found duplicate APIs:', duplicates.map(([key, group]) => ({
        key,
        apis: group.map(api => ({ id: api.id, name: api.name }))
      })));
    }
    
    return consolidated;
  };

  // Detect and analyze duplicate core APIs
  const analyzeCoreApis = (apiServices: ApiService[]) => {
    const services = Array.isArray(apiServices) ? apiServices : [];
    
    const coreApis = services.filter(api => 
      api.name.toLowerCase().includes('core') || 
      api.name.toLowerCase().includes('healthcare') ||
      api.name.toLowerCase().includes('internal_healthcare') ||
      api.name === 'core_healthcare_api' ||
      api.name === 'internal_healthcare_api'
    );

    const analysis = {
      coreApis,
      hasDuplicates: coreApis.length > 1,
      duplicateGroups: [] as any[],
      recommendations: [] as string[]
    };

    if (analysis.hasDuplicates) {
      // Check for specific duplicates
      const coreHealthcare = coreApis.find(api => api.name === 'core_healthcare_api');
      const internalHealthcare = coreApis.find(api => api.name === 'internal_healthcare_api');
      
      if (coreHealthcare && internalHealthcare) {
        analysis.duplicateGroups.push({
          type: 'core_vs_internal',
          apis: [coreHealthcare, internalHealthcare],
          recommendation: 'Consolidate to single healthcare API'
        });
        
        analysis.recommendations.push(
          'Deprecate one of core_healthcare_api or internal_healthcare_api',
          'Migrate all endpoints to the preferred API',
          'Update all references to use single source of truth'
        );
      }
    }

    console.log('🔍 Core API Analysis:', analysis);
    return analysis;
  };

  return {
    apiEndpoints: (apiEndpoints as ApiEndpoint[]) || [],
    isLoadingEndpoints,
    getDetailedApiStats,
    consolidateApiServices,
    analyzeCoreApis
  };
};
