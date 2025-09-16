-- Fix: recreate index usage view without unavailable columns
CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  i.relname AS index_name,
  pg_relation_size(i.oid) AS index_size_bytes,
  pg_size_pretty(pg_relation_size(i.oid)) AS index_size_pretty,
  COALESCE(s.idx_scan,0) AS idx_scan,
  COALESCE(s.idx_tup_read,0) AS idx_tup_read,
  COALESCE(s.idx_tup_fetch,0) AS idx_tup_fetch
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_index ix ON c.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = i.oid
WHERE n.nspname = 'public';

CREATE OR REPLACE VIEW public.unused_index_candidates AS
SELECT * FROM public.index_usage_stats
WHERE idx_scan = 0 AND index_size_bytes > 0;