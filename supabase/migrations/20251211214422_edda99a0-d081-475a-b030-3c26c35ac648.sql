-- Fix the get_complete_schema_info function to use correct column names
-- The error was: column "hasrls" does not exist, hint: Perhaps you meant to reference the column "pg_tables.hasrules"

DROP FUNCTION IF EXISTS public.get_complete_schema_info();

CREATE OR REPLACE FUNCTION public.get_complete_schema_info()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(table_info)
    INTO result
    FROM (
        SELECT 
            t.table_name,
            t.table_schema,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'column_name', c.column_name,
                            'data_type', c.data_type,
                            'is_nullable', c.is_nullable = 'YES',
                            'is_primary_key', EXISTS (
                                SELECT 1 
                                FROM information_schema.key_column_usage kcu
                                JOIN information_schema.table_constraints tc 
                                    ON kcu.constraint_name = tc.constraint_name
                                WHERE tc.constraint_type = 'PRIMARY KEY'
                                    AND kcu.table_schema = c.table_schema
                                    AND kcu.table_name = c.table_name
                                    AND kcu.column_name = c.column_name
                            )
                        )
                    )
                    FROM information_schema.columns c
                    WHERE c.table_schema = t.table_schema
                        AND c.table_name = t.table_name
                ),
                '[]'::json
            ) as columns,
            -- Check RLS enabled using pg_class which has the correct column
            EXISTS (
                SELECT 1 
                FROM pg_catalog.pg_class pc
                JOIN pg_catalog.pg_namespace pn ON pc.relnamespace = pn.oid
                WHERE pn.nspname = t.table_schema
                    AND pc.relname = t.table_name
                    AND pc.relrowsecurity = true
            ) as rls_enabled
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name
    ) table_info;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;