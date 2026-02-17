import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SchemaTableInfo {
  table_name: string;
  table_schema: string;
  rls_enabled?: boolean;
  columns?: Array<{
    column_name: string;
    data_type: string;
    is_nullable: boolean;
    is_primary_key?: boolean;
  }>;
}

export interface IntegrationOption {
  id: string;
  name: string;
  provider: string | null;
  model_type: string | null;
  supports_function_calling: boolean | null;
}

export const useIntegrationOptions = () => {
  // Database schema (for table/column pickers) with fallback
  const schemaQuery = useQuery({
    queryKey: ['schema-info'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_complete_schema_info');
        if (error) {
          console.warn('Schema RPC failed, using fallback:', error.message);
          // Fallback: fetch tables from information_schema directly
          return await fetchSchemaFallback();
        }
        // The RPC returns JSON; cast through unknown for safety
        return (Array.isArray(data) ? (data as unknown) : []) as SchemaTableInfo[];
      } catch (err) {
        console.warn('Schema query error, using fallback:', err);
        return await fetchSchemaFallback();
      }
    },
    staleTime: 60_000,
  });

  // AI model integrations (used to show MCP/tools that support function calling)
  const integrationsQuery = useQuery({
    queryKey: ['ai-model-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_model_integrations')
        .select('id,name,provider,model_type,supports_function_calling,is_active')
        .eq('is_active', true);
      if (error) throw error;
      return (data || []) as IntegrationOption[];
    },
    staleTime: 60_000,
  });

  // MCP Tools from workflow_node_types table
  const mcpToolsQuery = useQuery({
    queryKey: ['mcp-tools-from-nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_node_types')
        .select('id, name, type_key, description, default_config')
        .or('category_id.eq.mcp-protocol,type_key.ilike.%mcp%')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const tables = (schemaQuery.data || []).filter(t => t.table_schema === 'public');

  const mcpLikeTools = (integrationsQuery.data || []).filter(
    (i) => Boolean(i.supports_function_calling)
  );

  const mcpNodeTools = mcpToolsQuery.data || [];

  // Helper: for a given table, return columns by primitive type
  const getColumnsForTable = (tableName?: string) => {
    const t = tables.find(tbl => tbl.table_name === tableName);
    return t?.columns || [];
  };

  const getTextLikeColumns = (tableName?: string) =>
    getColumnsForTable(tableName).filter(c =>
      ['text', 'character varying', 'json', 'jsonb'].includes(c.data_type)
    );

  return {
    tables,
    mcpLikeTools,
    mcpNodeTools,
    isLoading: schemaQuery.isLoading || integrationsQuery.isLoading,
    error: schemaQuery.error || integrationsQuery.error,
    getColumnsForTable,
    getTextLikeColumns,
  };
};

// Fallback function when RPC fails
async function fetchSchemaFallback(): Promise<SchemaTableInfo[]> {
  // Get list of common tables as fallback
  const commonTables = [
    'agents', 'agent_sessions', 'agent_conversations', 'agent_templates',
    'knowledge_base', 'universal_knowledge_base', 'profiles', 'facilities',
    'modules', 'user_roles', 'roles', 'workflow_node_types', 'workflow_node_categories'
  ];
  
  return commonTables.map(table_name => ({
    table_name,
    table_schema: 'public',
    rls_enabled: true,
    columns: [
      { column_name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
      { column_name: 'name', data_type: 'text', is_nullable: false },
      { column_name: 'description', data_type: 'text', is_nullable: true },
      { column_name: 'content', data_type: 'text', is_nullable: true },
      { column_name: 'data', data_type: 'jsonb', is_nullable: true },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: false },
      { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: false },
    ]
  }));
}
