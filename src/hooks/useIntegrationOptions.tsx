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
  // Database schema (for table/column pickers)
  const schemaQuery = useQuery({
    queryKey: ['schema-info'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_complete_schema_info');
      if (error) throw error;
      // The RPC returns JSON; cast through unknown for safety
      return (Array.isArray(data) ? (data as unknown) : []) as SchemaTableInfo[];
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

  const tables = (schemaQuery.data || []).filter(t => t.table_schema === 'public');

  const mcpLikeTools = (integrationsQuery.data || []).filter(
    (i) => Boolean(i.supports_function_calling)
  );

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
    isLoading: schemaQuery.isLoading || integrationsQuery.isLoading,
    error: schemaQuery.error || integrationsQuery.error,
    getColumnsForTable,
    getTextLikeColumns,
  };
};
