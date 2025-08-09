-- Fix linter: set stable search_path on helper function
CREATE OR REPLACE FUNCTION public._table_exists(p_table text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name = p_table
  );
$fn$;