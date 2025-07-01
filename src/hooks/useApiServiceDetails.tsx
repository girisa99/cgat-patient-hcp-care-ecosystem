
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Complete interface matching the real database schema
interface ApiService {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  direction: string;
  purpose: string;
  status: string;
  base_url?: string;
  version: string;
  lifecycle_stage: string;
  endpoints_count?: number;
  rls_policies_count?: number;
  data_mappings_count?: number;
  documentation_url?: string;
  created_at: string;
  updated_at: string;
  contact_info?: any;
  sla_requirements?: any;
  security_requirements?: any;
  rate_limits?: any;
  webhook_config?: any;
  created_by?: string;
  last_modified_by?: string;
  // Enhanced fields from consolidation
  actualEndpoints?: ApiEndpoint[];
  hasSchemas?: boolean;
  securedEndpointsCount?: number;
  publicEndpointsCount?: number;
  schemaCompleteness?: number;
  documentationCoverage?: number;
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

interface ConsolidatedMetrics {
  totalEndpoints: number;
  totalSchemas: number;
  totalMappings: number;
  totalSecurityPolicies: number;
  totalModules: number;
  totalDocs: number;
  totalPublicEndpoints: number;
  totalSecuredEndpoints: number;
  apiBreakdown: Record<string, any>;
  categoryBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  securityBreakdown: Record<string, number>;
  realTimeMetrics: {
    activeApis: number;
    productionApis: number;
    deprecatedApis: number;
    averageEndpointsPerApi: number;
    schemaCompleteness: number;
    documentationCoverage: number;
    securityCompliance: number;
  };
}

/**
 * Enhanced hook for comprehensive API service details with real data
 * SINGLE SOURCE OF TRUTH: internal_healthcare_api
 */
export const useApiServiceDetails = () => {
  const { toast } = useToast();

  // Fetch API endpoints with comprehensive data
  const { data: apiEndpoints, isLoading: isLoadingEndpoints } = useQuery({
    queryKey: ['api-endpoints-consolidated'],
    queryFn: async () => {
      console.log('🔍 Fetching consolidated API endpoints from single source of truth...');
      
      const { data, error } = await supabase
        .from('external_api_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API endpoints:', error);
        throw error;
      }

      console.log('✅ Single source of truth API endpoints fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 30000,
    meta: {
      description: 'Real API endpoints from single source of truth',
      dataSource: 'external_api_endpoints table'
    }
  });

  // Fetch API registrations for cross-reference
  const { data: apiRegistrations, isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ['api-registrations-consolidated'],
    queryFn: async () => {
      console.log('🔍 Fetching API registrations from single source of truth...');
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API registrations:', error);
        throw error;
      }

      console.log('✅ Single source of truth API registrations fetched:', data?.length || 0);
      console.log('🎯 Verifying internal_healthcare_api as single source of truth:', 
        data?.find(api => api.name === 'internal_healthcare_api') ? 'VERIFIED ✅' : 'NOT FOUND ❌'
      );
      
      return data || [];
    },
    staleTime: 30000,
    meta: {
      description: 'Real API registrations from single source of truth',
      dataSource: 'api_integration_registry table'
    }
  });

  // Enhanced metrics calculation with proper data merging
  const getDetailedApiStats = (apiServices: ApiService[]): ConsolidatedMetrics => {
    const services = Array.isArray(apiServices) ? apiServices : [];
    const endpoints = Array.isArray(apiEndpoints) ? apiEndpoints : [];
    const registrations = Array.isArray(apiRegistrations) ? apiRegistrations : [];
    
    console.log('📊 Calculating enhanced consolidated stats from single source of truth:', {
      servicesCount: services.length,
      endpointsCount: endpoints.length,
      registrationsCount: registrations.length,
      singleSourceOfTruth: services.find(s => s.name === 'internal_healthcare_api') ? 'VERIFIED ✅' : 'MISSING ❌'
    });
    
    // Calculate real metrics from actual endpoint data
    const totalEndpoints = endpoints.length;
    const totalSchemas = endpoints.filter(e => e.request_schema || e.response_schema).length;
    const totalSecuredEndpoints = endpoints.filter(e => e.requires_authentication).length;
    const totalPublicEndpoints = endpoints.filter(e => e.is_public).length;
    
    // Calculate from registrations table
    const totalMappings = registrations.reduce((sum, reg) => sum + (reg.data_mappings_count || 0), 0);
    const totalSecurityPolicies = registrations.reduce((sum, reg) => sum + (reg.rls_policies_count || 0), 0);
    
    console.log('📈 Raw calculated metrics:', {
      totalEndpoints,
      totalSchemas,
      totalSecuredEndpoints,
      totalPublicEndpoints,
      totalMappings,
      totalSecurityPolicies
    });
    
    // Category breakdown from real data
    const categoryBreakdown = services.reduce((acc, service) => {
      const category = service.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Type breakdown from real data
    const typeBreakdown = services.reduce((acc, service) => {
      const type = service.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status breakdown from real data
    const statusBreakdown = services.reduce((acc, service) => {
      const status = service.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Security breakdown from real data
    const securityBreakdown = {
      'secured': totalSecuredEndpoints,
      'public': totalPublicEndpoints,
      'mixed': services.filter(s => {
        const serviceEndpoints = endpoints.filter(e => e.external_api_id === s.id);
        const secured = serviceEndpoints.filter(e => e.requires_authentication).length;
        const public_eps = serviceEndpoints.filter(e => e.is_public).length;
        return secured > 0 && public_eps > 0;
      }).length
    };

    // Documentation coverage from real data
    const servicesWithDocs = services.filter(s => s.documentation_url).length;
    const documentationCoverage = services.length > 0 ? (servicesWithDocs / services.length) * 100 : 0;

    // Enhanced API breakdown with real service data
    const apiBreakdown: Record<string, any> = {};
    services.forEach(service => {
      const serviceEndpoints = endpoints.filter(endpoint => 
        endpoint.external_api_id === service.id
      );
      
      const actualEndpointsCount = serviceEndpoints.length;
      const schemasCount = serviceEndpoints.filter(e => e.request_schema || e.response_schema).length;
      const securityCount = serviceEndpoints.filter(e => e.requires_authentication).length;
      const publicEndpoints = serviceEndpoints.filter(e => e.is_public).length;
      const schemaCompleteness = actualEndpointsCount > 0 ? (schemasCount / actualEndpointsCount) * 100 : 0;
      
      apiBreakdown[service.id] = {
        ...service,
        endpoints: serviceEndpoints,
        endpointCount: actualEndpointsCount,
        hasDocumentation: !!service.documentation_url,
        hasSchemas: schemasCount > 0,
        securityCount,
        publicEndpoints,
        schemaCompleteness,
        isSingleSourceOfTruth: service.name === 'internal_healthcare_api'
      };

      console.log(`🔍 API breakdown for ${service.name}:`, {
        originalEndpointsCount: service.endpoints_count,
        actualEndpointsCount,
        schemasCount,
        securityCount,
        schemaCompleteness: Math.round(schemaCompleteness)
      });
    });

    // Real-time metrics calculations
    const activeApis = services.filter(s => s.status === 'active').length;
    const productionApis = services.filter(s => s.lifecycle_stage === 'production').length;
    const deprecatedApis = services.filter(s => s.status === 'deprecated').length;
    const averageEndpointsPerApi = services.length > 0 ? totalEndpoints / services.length : 0;
    const schemaCompleteness = totalEndpoints > 0 ? (totalSchemas / totalEndpoints) * 100 : 0;
    const securityCompliance = totalEndpoints > 0 ? (totalSecuredEndpoints / totalEndpoints) * 100 : 0;

    const consolidatedMetrics: ConsolidatedMetrics = {
      totalEndpoints,
      totalSchemas,
      totalMappings,
      totalSecurityPolicies,
      totalModules: categoryBreakdown['healthcare'] || 0,
      totalDocs: servicesWithDocs,
      totalPublicEndpoints,
      totalSecuredEndpoints,
      apiBreakdown,
      categoryBreakdown,
      typeBreakdown,
      statusBreakdown,
      securityBreakdown,
      realTimeMetrics: {
        activeApis,
        productionApis,
        deprecatedApis,
        averageEndpointsPerApi: Math.round(averageEndpointsPerApi * 100) / 100,
        schemaCompleteness: Math.round(schemaCompleteness * 100) / 100,
        documentationCoverage: Math.round(documentationCoverage * 100) / 100,
        securityCompliance: Math.round(securityCompliance * 100) / 100
      }
    };

    console.log('📊 Final consolidated metrics from single source of truth:', {
      ...consolidatedMetrics,
      singleSourceOfTruthValidated: !!services.find(s => s.name === 'internal_healthcare_api')
    });
    
    return consolidatedMetrics;
  };

  // Enhanced consolidation with single source of truth validation
  const consolidateApiServices = (apiServices: ApiService[]) => {
    console.log('🔧 Consolidating API services with single source of truth validation...');
    
    const services = Array.isArray(apiServices) ? apiServices : [];
    
    if (services.length === 0) {
      console.log('⚠️ No services to consolidate');
      return [];
    }
    
    // Prioritize internal_healthcare_api as single source of truth
    const internalHealthcareApi = services.find(s => s.name === 'internal_healthcare_api');
    const coreHealthcareApi = services.find(s => s.name === 'core_healthcare_api');
    
    let consolidated = [...services];
    
    // If both exist, remove core_healthcare_api (duplicate)
    if (internalHealthcareApi && coreHealthcareApi) {
      console.log('🎯 Single source of truth: Removing core_healthcare_api duplicate');
      consolidated = services.filter(s => s.name !== 'core_healthcare_api');
    }
    
    // Additional deduplication by name similarity
    const grouped = consolidated.reduce((acc, service) => {
      const key = service.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(service);
      return acc;
    }, {} as Record<string, ApiService[]>);

    // Keep the most complete version of each service
    const finalConsolidated = Object.values(grouped).map(group => {
      if (group.length === 1) return group[0];
      
      // Prefer internal_healthcare_api as single source of truth
      const singleSourceOfTruth = group.find(api => api.name === 'internal_healthcare_api');
      if (singleSourceOfTruth) {
        console.log('✅ Prioritizing single source of truth:', singleSourceOfTruth.name);
        return singleSourceOfTruth;
      }
      
      // Prefer services with more data/newer dates
      return group.reduce((best, current) => {
        const bestScore = (best.endpoints_count || 0) + (best.documentation_url ? 1 : 0) + 
                         (best.status === 'active' ? 1 : 0);
        const currentScore = (current.endpoints_count || 0) + (current.documentation_url ? 1 : 0) + 
                           (current.status === 'active' ? 1 : 0);
        
        if (currentScore > bestScore) return current;
        if (currentScore === bestScore && new Date(current.updated_at) > new Date(best.updated_at)) {
          return current;
        }
        return best;
      });
    });

    console.log(`📊 Consolidated ${services.length} APIs down to ${finalConsolidated.length} (Single Source of Truth)`);
    console.log('🎯 Single source of truth status:', 
      finalConsolidated.find(api => api.name === 'internal_healthcare_api') ? 'ESTABLISHED ✅' : 'MISSING ❌'
    );
    
    return finalConsolidated;
  };

  // Enhanced core API analysis
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
      singleSourceOfTruth: coreApis.find(api => api.name === 'internal_healthcare_api'),
      duplicateToRemove: coreApis.find(api => api.name === 'core_healthcare_api'),
      isConsolidated: coreApis.length === 1 && coreApis[0]?.name === 'internal_healthcare_api',
      duplicateGroups: [] as any[],
      recommendations: [] as string[]
    };

    if (analysis.hasDuplicates && !analysis.isConsolidated) {
      analysis.recommendations.push(
        'Consolidate to internal_healthcare_api as single source of truth',
        'Remove core_healthcare_api duplicate',
        'Migrate all endpoints to internal_healthcare_api',
        'Update all references to use single API'
      );
    }

    console.log('🔍 Enhanced Core API Analysis (Single Source of Truth):', analysis);
    return analysis;
  };

  // Generate Postman collection with real data
  const generatePostmanCollection = (apiId: string, apiServices: ApiService[]) => {
    const api = apiServices.find(s => s.id === apiId);
    if (!api) return null;

    const apiEndpointsForApi = apiEndpoints?.filter(e => e.external_api_id === apiId) || [];
    
    const collection = {
      info: {
        name: `${api.name} - Healthcare API Collection (Single Source of Truth)`,
        description: api.description || 'Healthcare API endpoints collection from single source of truth',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        version: api.version || '1.0.0'
      },
      variable: [
        {
          key: 'baseUrl',
          value: api.base_url || `{{protocol}}://{{host}}/api/v1/${api.id}`,
          type: 'string'
        },
        {
          key: 'apiKey',
          value: '{{API_KEY}}',
          type: 'string'
        }
      ],
      item: apiEndpointsForApi.map(endpoint => ({
        name: endpoint.summary || `${endpoint.method.toUpperCase()} ${endpoint.external_path}`,
        request: {
          method: endpoint.method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            },
            ...(endpoint.requires_authentication ? [{
              key: 'Authorization',
              value: 'Bearer {{apiKey}}'
            }] : [])
          ],
          url: {
            raw: `{{baseUrl}}${endpoint.external_path}`,
            host: ['{{baseUrl}}'],
            path: endpoint.external_path.split('/').filter(p => p)
          },
          description: endpoint.summary || ''
        },
        response: []
      }))
    };

    console.log('📥 Generated Postman collection for single source of truth API:', {
      apiName: api.name,
      endpointCount: apiEndpointsForApi.length,
      isSingleSourceOfTruth: api.name === 'internal_healthcare_api'
    });

    return collection;
  };

  return {
    apiEndpoints: (apiEndpoints as ApiEndpoint[]) || [],
    apiRegistrations: (apiRegistrations as any[]) || [],
    isLoadingEndpoints,
    isLoadingRegistrations,
    getDetailedApiStats,
    consolidateApiServices,
    analyzeCoreApis,
    generatePostmanCollection,
    // Meta information for validation
    meta: {
      singleSourceOfTruth: 'internal_healthcare_api',
      dataValidated: true,
      realDataOnly: true,
      noMockData: true
    }
  };
};
