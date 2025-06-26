
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApiIntegrationDetails {
  id: string;
  name: string;
  description?: string;
  base_url?: string;
  version: string;
  category: string;
  endpoints: Array<{
    id: string;
    name: string;
    method: string;
    url: string;
    description: string;
    is_public: boolean;
    authentication?: any;
  }>;
  rls_policies: Array<{
    id: string;
    policy_name: string;
    table_name: string;
    operation: string;
    condition: string;
    description?: string;
  }>;
  data_mappings: Array<{
    id: string;
    source_field: string;
    target_field: string;
    target_table: string;
    transformation?: string;
    validation?: string;
  }>;
  database_schema: {
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        description?: string;
      }>;
      foreign_keys: Array<{
        column: string;
        references_table: string;
        references_column: string;
      }>;
    }>;
  };
}

export const usePublishedApiDetails = () => {
  const getApiDetails = async (apiId: string): Promise<ApiIntegrationDetails | null> => {
    console.log('🔍 Fetching detailed API information for:', apiId);

    // First, get the external API registry entry
    const { data: externalApi, error: externalError } = await supabase
      .from('external_api_registry')
      .select('*, external_api_endpoints(*)')
      .eq('id', apiId)
      .single();

    if (externalError) {
      console.error('❌ Error fetching external API:', externalError);
      return null;
    }

    // Get the internal API details
    const { data: internalApi, error: internalError } = await supabase
      .from('api_integration_registry')
      .select('*')
      .eq('id', externalApi.internal_api_id)
      .maybeSingle();

    if (internalError) {
      console.error('❌ Error fetching internal API:', internalError);
    }

    // Mock comprehensive data since we don't have all the detailed tables yet
    const mockEndpoints = externalApi.external_api_endpoints?.map((endpoint: any) => ({
      id: endpoint.id,
      name: endpoint.summary,
      method: endpoint.method,
      url: endpoint.external_path,
      description: endpoint.description || endpoint.summary,
      is_public: endpoint.is_public,
      authentication: endpoint.requires_authentication ? {
        type: 'bearer',
        required: true,
        description: 'Bearer token authentication required'
      } : null
    })) || [];

    // Mock RLS policies based on the API category
    const mockRLSPolicies = [
      {
        id: `${apiId}-policy-1`,
        policy_name: `${externalApi.external_name}_user_access`,
        table_name: 'user_data',
        operation: 'SELECT',
        condition: 'auth.uid() = user_id',
        description: 'Users can only access their own data'
      },
      {
        id: `${apiId}-policy-2`,
        policy_name: `${externalApi.external_name}_insert_policy`,
        table_name: 'user_data',
        operation: 'INSERT',
        condition: 'auth.uid() = user_id',
        description: 'Users can only insert data for themselves'
      }
    ];

    // Mock data mappings
    const mockDataMappings = [
      {
        id: `${apiId}-mapping-1`,
        source_field: 'user_id',
        target_field: 'patient_id',
        target_table: 'patients',
        transformation: 'UUID validation and mapping',
        validation: 'NOT NULL, UUID format'
      },
      {
        id: `${apiId}-mapping-2`,
        source_field: 'medical_record_number',
        target_field: 'mrn',
        target_table: 'medical_records',
        transformation: 'Format standardization',
        validation: 'Alphanumeric, 8-12 characters'
      }
    ];

    // Mock database schema
    const mockDatabaseSchema = {
      tables: [
        {
          name: 'patients',
          columns: [
            { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
            { name: 'user_id', type: 'uuid', nullable: false, description: 'Reference to auth user' },
            { name: 'first_name', type: 'varchar', nullable: false, description: 'Patient first name' },
            { name: 'last_name', type: 'varchar', nullable: false, description: 'Patient last name' },
            { name: 'date_of_birth', type: 'date', nullable: true, description: 'Patient date of birth' },
            { name: 'created_at', type: 'timestamp', nullable: false, description: 'Record creation time' }
          ],
          foreign_keys: [
            { column: 'user_id', references_table: 'auth.users', references_column: 'id' }
          ]
        },
        {
          name: 'medical_records',
          columns: [
            { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
            { name: 'patient_id', type: 'uuid', nullable: false, description: 'Reference to patient' },
            { name: 'mrn', type: 'varchar', nullable: false, description: 'Medical record number' },
            { name: 'diagnosis', type: 'text', nullable: true, description: 'Primary diagnosis' },
            { name: 'created_at', type: 'timestamp', nullable: false, description: 'Record creation time' }
          ],
          foreign_keys: [
            { column: 'patient_id', references_table: 'patients', references_column: 'id' }
          ]
        }
      ]
    };

    return {
      id: externalApi.id,
      name: externalApi.external_name,
      description: externalApi.external_description,
      base_url: externalApi.base_url,
      version: externalApi.version,
      category: externalApi.category || 'healthcare',
      endpoints: mockEndpoints,
      rls_policies: mockRLSPolicies,
      data_mappings: mockDataMappings,
      database_schema: mockDatabaseSchema
    };
  };

  return { getApiDetails };
};
