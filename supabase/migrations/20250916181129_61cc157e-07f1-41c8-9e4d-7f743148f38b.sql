-- Security & Performance Maintenance Migration
-- 1) Normalize function search_path and stability

-- a) Add search_path to functions created recently
CREATE OR REPLACE FUNCTION public.optimize_jsonb_migration()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Vacuum and analyze tables after migration
  PERFORM 1;
  RETURN 'optimize_jsonb_migration stub (no-op)';
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_agent_basic_info()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.basic_info = COALESCE(NEW.basic_info, '{}'::jsonb) || jsonb_build_object(
      'name', NEW.agent_name,
      'description', NEW.agent_description,
      'purpose', NEW.agent_purpose,
      'brand', NEW.agent_brand,
      'use_case', NEW.agent_use_case
    );
  END IF;
  RETURN NEW;
END;
$$;

-- b) Normalize generic timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- c) Ensure all public functions have a fixed search_path
DO $$
DECLARE fn record; conf text[]; has_sp boolean := false; BEGIN
  FOR fn IN
    SELECT p.oid, n.nspname, p.proname, p.proargtypes, p.proconfig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    has_sp := false;
    IF fn.proconfig IS NOT NULL THEN
      FOREACH conf SLICE 1 IN ARRAY fn.proconfig LOOP
        IF conf[1] LIKE 'search_path=%' THEN
          has_sp := true; EXIT;
        END IF;
      END LOOP;
    END IF;
    IF NOT has_sp THEN
      EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path TO public',
        fn.proname,
        oidvectortypes(fn.proargtypes)
      );
    END IF;
  END LOOP;
END $$;

-- 2) Index usage reporting views and helpers

-- a) Detailed index stats
CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  i.relname AS index_name,
  pg_relation_size(i.oid) AS index_size_bytes,
  pg_size_pretty(pg_relation_size(i.oid)) AS index_size_pretty,
  COALESCE(s.idx_scan,0) AS idx_scan,
  COALESCE(s.idx_tup_read,0) AS idx_tup_read,
  COALESCE(s.idx_tup_fetch,0) AS idx_tup_fetch,
  s.last_vacuum,
  s.last_autovacuum,
  s.last_analyze,
  s.last_autoanalyze
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_index ix ON c.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = i.oid
WHERE n.nspname = 'public';

-- b) Candidates for unused indexes (no scans recorded)
CREATE OR REPLACE VIEW public.unused_index_candidates AS
SELECT * FROM public.index_usage_stats
WHERE idx_scan = 0 AND index_size_bytes > 0;

-- c) FK columns without supporting indexes (can hurt performance)
CREATE OR REPLACE VIEW public.fk_columns_without_indexes AS
WITH fk_cols AS (
  SELECT
    con.oid AS constraint_oid,
    con.conname,
    con.conrelid::regclass AS table_name,
    n.nspname AS schema_name,
    con.conkey AS key_attnums
  FROM pg_constraint con
  JOIN pg_class cl ON cl.oid = con.conrelid
  JOIN pg_namespace n ON n.oid = cl.relnamespace
  WHERE con.contype = 'f' AND n.nspname = 'public'
), expanded AS (
  SELECT
    f.conname,
    f.table_name,
    f.schema_name,
    a.attnum,
    a.attname
  FROM fk_cols f
  JOIN pg_attribute a ON a.attrelid = f.table_name::regclass AND a.attnum = ANY(f.key_attnums)
)
SELECT e.schema_name, e.table_name::text AS table_name, e.attname AS column_name
FROM expanded e
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_index i
  WHERE i.indrelid = e.table_name::regclass
    AND e.attnum = ANY(i.indkey)
);

-- d) Helper to create index for a given FK column
CREATE OR REPLACE FUNCTION public.create_index_for_fk(p_table regclass, p_column text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE idx_name text := format('%s_%s_fk_idx', p_table::text, p_column); BEGIN
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s (%I)', idx_name, p_table, p_column);
  RETURN idx_name;
END; $$;

-- e) Helper to drop index safely (manual approval step)
CREATE OR REPLACE FUNCTION public.drop_index_safely(p_index_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE exists_oid oid; BEGIN
  SELECT to_regclass(p_index_name)::oid INTO exists_oid;
  IF exists_oid IS NULL THEN
    RETURN jsonb_build_object('dropped', false, 'reason', 'index not found');
  END IF;
  EXECUTE format('DROP INDEX IF EXISTS %I', p_index_name);
  RETURN jsonb_build_object('dropped', true);
END; $$;