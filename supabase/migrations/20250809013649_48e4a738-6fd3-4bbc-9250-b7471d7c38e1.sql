-- Block writes for demo users across all current and future public tables
-- 1) Create a SECURITY DEFINER trigger function that raises on writes by demo users
CREATE OR REPLACE FUNCTION public.block_demo_user_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF public.is_demo_user(auth.uid()) THEN
    RAISE EXCEPTION 'Demo users are read-only';
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Helper to attach the trigger to all existing public tables (idempotent)
CREATE OR REPLACE FUNCTION public.ensure_demo_block_triggers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    -- Attach trigger if missing
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND c.relname = rec.tablename
        AND t.tgname = 'block_demo_writes'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER block_demo_writes
           BEFORE INSERT OR UPDATE OR DELETE ON public.%I
           FOR EACH ROW
           EXECUTE FUNCTION public.block_demo_user_writes();',
        rec.tablename
      );
    END IF;
  END LOOP;
END;
$$;

-- 3) Event trigger to auto-attach on future table creates/alters
CREATE OR REPLACE FUNCTION public.on_ddl_ensure_demo_block()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.ensure_demo_block_triggers();
END;
$$;

DROP EVENT TRIGGER IF EXISTS et_on_ddl_demo_block;
CREATE EVENT TRIGGER et_on_ddl_demo_block
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'ALTER TABLE')
  EXECUTE PROCEDURE public.on_ddl_ensure_demo_block();

-- 4) Run once now to cover all existing tables
SELECT public.ensure_demo_block_triggers();