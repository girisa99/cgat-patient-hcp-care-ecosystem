
import { supabase } from '@/integrations/supabase/client';

interface ConsolidationPlan {
  keepApiId: string;
  removeApiIds: string[];
  endpointsToMigrate: any[];
  validationResults: {
    schemasVerified: boolean;
    endpointsVerified: boolean;
    safeToRemove: boolean;
    missingData: string[];
  };
}

/**
 * Utility class for safely consolidating duplicate APIs to a single source of truth
 */
export class ApiConsolidationUtility {
  
  /**
   * Validate data integrity before consolidation
   */
  static async validateConsolidation(keepApiId: string, removeApiIds: string[]) {
    console.log('🔍 Validating consolidation plan...', { keepApiId, removeApiIds });
    
    try {
      // Get all APIs involved
      const { data: apis, error: apisError } = await supabase
        .from('api_integration_registry')
        .select('*')
        .in('id', [keepApiId, ...removeApiIds]);

      if (apisError) throw apisError;

      // Get all endpoints for these APIs
      const { data: endpoints, error: endpointsError } = await supabase
        .from('external_api_endpoints')
        .select('*')
        .in('external_api_id', [keepApiId, ...removeApiIds]);

      if (endpointsError) throw endpointsError;

      const keepApi = apis?.find(api => api.id === keepApiId);
      const removeApis = apis?.filter(api => removeApiIds.includes(api.id)) || [];
      
      const keepEndpoints = endpoints?.filter(ep => ep.external_api_id === keepApiId) || [];
      const removeEndpoints = endpoints?.filter(ep => removeApiIds.includes(ep.external_api_id)) || [];

      // Validation checks
      const validationResults = {
        schemasVerified: true,
        endpointsVerified: true,
        safeToRemove: true,
        missingData: [] as string[]
      };

      // Check for unique endpoints that would be lost
      const keepEndpointPaths = keepEndpoints.map(ep => `${ep.method}:${ep.external_path}`);
      const uniqueEndpointsToLose = [];

      for (const endpoint of removeEndpoints) {
        const endpointPath = `${endpoint.method}:${endpoint.external_path}`;
        if (!keepEndpointPaths.includes(endpointPath)) {
          uniqueEndpointsToLose.push(endpointPath);
        }
      }

      if (uniqueEndpointsToLose.length > 0) {
        validationResults.safeToRemove = false;
        validationResults.missingData.push(`${uniqueEndpointsToLose.length} unique endpoints would be lost`);
      }

      // Check schemas
      const keepSchemas = keepEndpoints.filter(ep => ep.request_schema || ep.response_schema).length;
      const removeSchemas = removeEndpoints.filter(ep => ep.request_schema || ep.response_schema).length;
      
      if (removeSchemas > keepSchemas) {
        validationResults.missingData.push(`${removeSchemas - keepSchemas} schemas might be lost`);
      }

      console.log('✅ Validation complete:', validationResults);
      
      return {
        validationResults,
        keepApi,
        removeApis,
        keepEndpoints,
        removeEndpoints,
        uniqueEndpointsToLose
      };

    } catch (error) {
      console.error('❌ Validation error:', error);
      throw error;
    }
  }

  /**
   * Safely consolidate APIs to single source of truth
   */
  static async consolidateToSingleSource(keepApiId: string, removeApiIds: string[], forceConsolidation = false) {
    console.log('🔄 Starting API consolidation...', { keepApiId, removeApiIds, forceConsolidation });

    try {
      // Validate first
      const validation = await this.validateConsolidation(keepApiId, removeApiIds);
      
      if (!validation.validationResults.safeToRemove && !forceConsolidation) {
        throw new Error(`Consolidation not safe: ${validation.validationResults.missingData.join(', ')}. Use forceConsolidation=true to proceed anyway.`);
      }

      // Start transaction-like process
      const results = {
        endpointsMigrated: 0,
        apisRemoved: 0,
        errors: [] as string[]
      };

      // Step 1: Update endpoint counts for the keep API
      const totalEndpoints = validation.keepEndpoints.length + validation.removeEndpoints.length;
      const totalSchemas = [...validation.keepEndpoints, ...validation.removeEndpoints]
        .filter(ep => ep.request_schema || ep.response_schema).length;

      const { error: updateError } = await supabase
        .from('api_integration_registry')
        .update({
          endpoints_count: totalEndpoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', keepApiId);

      if (updateError) {
        results.errors.push(`Failed to update keep API: ${updateError.message}`);
      }

      // Step 2: Migrate endpoints (update their external_api_id to point to keep API)
      if (validation.removeEndpoints.length > 0) {
        const { error: migrateError } = await supabase
          .from('external_api_endpoints')
          .update({ external_api_id: keepApiId })
          .in('external_api_id', removeApiIds);

        if (migrateError) {
          results.errors.push(`Failed to migrate endpoints: ${migrateError.message}`);
        } else {
          results.endpointsMigrated = validation.removeEndpoints.length;
        }
      }

      // Step 3: Remove duplicate APIs
      const { error: removeError } = await supabase
        .from('api_integration_registry')
        .delete()
        .in('id', removeApiIds);

      if (removeError) {
        results.errors.push(`Failed to remove APIs: ${removeError.message}`);
      } else {
        results.apisRemoved = removeApiIds.length;
      }

      console.log('✅ Consolidation complete:', results);
      return results;

    } catch (error) {
      console.error('❌ Consolidation error:', error);
      throw error;
    }
  }

  /**
   * Execute consolidation for core healthcare APIs specifically
   */
  static async consolidateCoreHealthcareApis() {
    console.log('🏥 Starting core healthcare API consolidation...');

    try {
      // Get core healthcare APIs
      const { data: apis, error: apisError } = await supabase
        .from('api_integration_registry')
        .select('*')
        .or('name.ilike.%core_healthcare_api%,name.ilike.%internal_healthcare_api%');

      if (apisError) throw apisError;

      if (!apis || apis.length < 2) {
        throw new Error('Could not find both core_healthcare_api and internal_healthcare_api');
      }

      // Find the specific APIs
      const internalApi = apis.find(api => api.name === 'internal_healthcare_api');
      const coreApi = apis.find(api => api.name === 'core_healthcare_api');

      if (!internalApi) {
        throw new Error('internal_healthcare_api not found');
      }

      if (!coreApi) {
        throw new Error('core_healthcare_api not found');
      }

      console.log('🎯 Found APIs to consolidate:', {
        keep: internalApi.name,
        remove: coreApi.name
      });

      // Execute consolidation
      const result = await this.consolidateToSingleSource(
        internalApi.id, 
        [coreApi.id], 
        true // Force consolidation since this is intentional
      );

      console.log('✅ Core healthcare API consolidation complete:', result);
      return result;

    } catch (error) {
      console.error('❌ Core healthcare API consolidation failed:', error);
      throw error;
    }
  }

  /**
   * Get consolidation recommendation based on scoring
   */
  static async getConsolidationRecommendation() {
    console.log('🤖 Getting AI consolidation recommendation...');

    try {
      // Get all core/healthcare APIs
      const { data: apis, error: apisError } = await supabase
        .from('api_integration_registry')
        .select('*')
        .or('name.ilike.%core%,name.ilike.%healthcare%');

      if (apisError) throw apisError;

      if (!apis || apis.length < 2) {
        return { hasDuplicates: false, recommendation: null };
      }

      // Get endpoints for scoring
      const { data: endpoints, error: endpointsError } = await supabase
        .from('external_api_endpoints')
        .select('*')
        .in('external_api_id', apis.map(api => api.id));

      if (endpointsError) throw endpointsError;

      // Score each API
      const scoredApis = apis.map(api => {
        const apiEndpoints = endpoints?.filter(ep => ep.external_api_id === api.id) || [];
        const hasSchemas = apiEndpoints.filter(ep => ep.request_schema || ep.response_schema).length;
        
        let score = 0;
        score += apiEndpoints.length * 3; // Endpoint count weight
        score += hasSchemas * 2.5; // Schema weight
        score += api.documentation_url ? 15 : 0; // Documentation weight
        score += api.status === 'active' ? 10 : 0; // Status weight
        score += api.base_url ? 5 : 0; // Configuration weight
        
        // Prefer internal_healthcare_api naming
        if (api.name === 'internal_healthcare_api') {
          score += 5;
        }

        return {
          ...api,
          score,
          endpointCount: apiEndpoints.length,
          schemaCount: hasSchemas
        };
      });

      // Sort by score
      scoredApis.sort((a, b) => b.score - a.score);

      const recommendation = {
        hasDuplicates: true,
        keepApi: scoredApis[0],
        removeApis: scoredApis.slice(1),
        totalScore: scoredApis[0].score,
        confidence: scoredApis[0].score > (scoredApis[1]?.score || 0) * 1.2 ? 'high' : 'medium'
      };

      console.log('🎯 Recommendation:', recommendation);
      return recommendation;

    } catch (error) {
      console.error('❌ Recommendation error:', error);
      throw error;
    }
  }
}
