import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SchemaTable {
  table_name: string;
  columns: string[];
}

export const useDatabaseSchema = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['db-schema-info'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_complete_schema_info');
      if (error) throw error;
      const rows: any[] = Array.isArray(data) ? (data as any[]) : [];
      const tables: SchemaTable[] = rows.map((t: any) => ({
        table_name: t.table_name,
        columns: Array.isArray(t.columns) ? t.columns.map((c: any) => c.column_name) : []
      }));
      return tables;
    },
    staleTime: 5 * 60 * 1000,
  });

  const tables = (data || []).map((t) => t.table_name as string);
  const columnsByTable = Object.fromEntries(
    (data || []).map((t) => [t.table_name, t.columns])
  ) as Record<string, string[]>;

  return {
    tables,
    columnsByTable,
    isLoading,
    error,
  };
};
