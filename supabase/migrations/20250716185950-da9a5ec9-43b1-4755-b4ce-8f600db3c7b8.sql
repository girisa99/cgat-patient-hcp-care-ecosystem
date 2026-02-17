-- Create comprehensive schema analysis function for advanced import system

-- Function to get complete schema information including tables, columns, relationships, RLS policies
CREATE OR REPLACE FUNCTION public.get_complete_schema_info()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '[]'::jsonb;
  table_rec RECORD;
  column_rec RECORD;
  fk_rec RECORD;
  index_rec RECORD;
  constraint_rec RECORD;
  policy_rec RECORD;
  table_obj JSONB;
  columns_array JSONB := '[]'::jsonb;
  fks_array JSONB := '[]'::jsonb;
  indexes_array JSONB := '[]'::jsonb;
  constraints_array JSONB := '[]'::jsonb;
  policies_array JSONB := '[]'::jsonb;
BEGIN
  -- Get all tables in public schema
  FOR table_rec IN 
    SELECT schemaname, tablename, hasrls
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename
  LOOP
    -- Reset arrays for each table
    columns_array := '[]'::jsonb;
    fks_array := '[]'::jsonb;
    indexes_array := '[]'::jsonb;
    constraints_array := '[]'::jsonb;
    policies_array := '[]'::jsonb;
    
    -- Get columns for this table
    FOR column_rec IN
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable::boolean,
        c.column_default,
        c.character_maximum_length,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
        fk.foreign_table_name,
        fk.foreign_column_name
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku 
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.table_name = table_rec.tablename 
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      LEFT JOIN (
        SELECT 
          ku.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku 
          ON tc.constraint_name = ku.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = table_rec.tablename 
          AND tc.constraint_type = 'FOREIGN KEY'
      ) fk ON c.column_name = fk.column_name
      WHERE c.table_name = table_rec.tablename 
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position
    LOOP
      columns_array := columns_array || jsonb_build_object(
        'column_name', column_rec.column_name,
        'data_type', column_rec.data_type,
        'is_nullable', CASE WHEN column_rec.is_nullable = 'YES' THEN true ELSE false END,
        'column_default', column_rec.column_default,
        'character_maximum_length', column_rec.character_maximum_length,
        'is_primary_key', column_rec.is_primary_key,
        'is_foreign_key', column_rec.is_foreign_key,
        'foreign_key_table', column_rec.foreign_table_name,
        'foreign_key_column', column_rec.foreign_column_name
      );
    END LOOP;
    
    -- Get foreign key constraints
    FOR fk_rec IN
      SELECT 
        tc.constraint_name,
        tc.table_name as source_table,
        ku.column_name as source_column,
        ccu.table_name as target_table,
        ccu.column_name as target_column,
        rc.delete_rule as on_delete,
        rc.update_rule as on_update
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage ku 
        ON tc.constraint_name = ku.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints rc 
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.table_name = table_rec.tablename 
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
      fks_array := fks_array || jsonb_build_object(
        'constraint_name', fk_rec.constraint_name,
        'source_table', fk_rec.source_table,
        'source_column', fk_rec.source_column,
        'target_table', fk_rec.target_table,
        'target_column', fk_rec.target_column,
        'on_delete', fk_rec.on_delete,
        'on_update', fk_rec.on_update
      );
    END LOOP;
    
    -- Get indexes
    FOR index_rec IN
      SELECT 
        i.indexname,
        i.tablename,
        i.indexdef,
        CASE WHEN i.indexdef LIKE '%UNIQUE%' THEN true ELSE false END as is_unique
      FROM pg_indexes i
      WHERE i.tablename = table_rec.tablename 
        AND i.schemaname = 'public'
    LOOP
      indexes_array := indexes_array || jsonb_build_object(
        'index_name', index_rec.indexname,
        'table_name', index_rec.tablename,
        'is_unique', index_rec.is_unique,
        'index_type', 'btree'
      );
    END LOOP;
    
    -- Get table constraints
    FOR constraint_rec IN
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        tc.table_name,
        array_agg(ku.column_name) as column_names
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage ku 
        ON tc.constraint_name = ku.constraint_name
      WHERE tc.table_name = table_rec.tablename 
        AND tc.table_schema = 'public'
      GROUP BY tc.constraint_name, tc.constraint_type, tc.table_name
    LOOP
      constraints_array := constraints_array || jsonb_build_object(
        'constraint_name', constraint_rec.constraint_name,
        'constraint_type', constraint_rec.constraint_type,
        'table_name', constraint_rec.table_name,
        'column_names', to_jsonb(constraint_rec.column_names)
      );
    END LOOP;
    
    -- Get RLS policies if RLS is enabled
    IF table_rec.hasrls THEN
      FOR policy_rec IN
        SELECT 
          pol.policyname,
          pol.tablename,
          pol.cmd,
          pol.permissive,
          pol.qual,
          pol.with_check
        FROM pg_policies pol
        WHERE pol.tablename = table_rec.tablename 
          AND pol.schemaname = 'public'
      LOOP
        policies_array := policies_array || jsonb_build_object(
          'policy_name', policy_rec.policyname,
          'table_name', policy_rec.tablename,
          'command', policy_rec.cmd,
          'permissive', policy_rec.permissive,
          'using_expression', policy_rec.qual,
          'check_expression', policy_rec.with_check
        );
      END LOOP;
    END IF;
    
    -- Build table object
    table_obj := jsonb_build_object(
      'table_name', table_rec.tablename,
      'table_schema', table_rec.schemaname,
      'table_type', 'BASE TABLE',
      'columns', columns_array,
      'foreign_keys', fks_array,
      'indexes', indexes_array,
      'constraints', constraints_array,
      'rls_enabled', table_rec.hasrls,
      'rls_policies', policies_array
    );
    
    -- Add to result array
    result := result || table_obj;
  END LOOP;
  
  RETURN result;
END;
$$;