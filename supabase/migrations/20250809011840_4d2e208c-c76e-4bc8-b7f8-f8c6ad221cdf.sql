-- Enable realtime with full row data for demo read-only syncing
-- Safely set REPLICA IDENTITY FULL where needed
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='facilities') THEN
    EXECUTE 'ALTER TABLE public.facilities REPLICA IDENTITY FULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='treatment_center_onboarding') THEN
    EXECUTE 'ALTER TABLE public.treatment_center_onboarding REPLICA IDENTITY FULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='modules') THEN
    EXECUTE 'ALTER TABLE public.modules REPLICA IDENTITY FULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='api_endpoints') THEN
    EXECUTE 'ALTER TABLE public.api_endpoints REPLICA IDENTITY FULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='api_integration_registry') THEN
    EXECUTE 'ALTER TABLE public.api_integration_registry REPLICA IDENTITY FULL';
  END IF;
END $$;

-- Add tables to supabase_realtime publication only if not already present
DO $$ BEGIN
  PERFORM 1 FROM pg_publication WHERE pubname = 'supabase_realtime';
  IF FOUND THEN
    -- facilities
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='facilities'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities';
    END IF;
    -- treatment_center_onboarding
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='treatment_center_onboarding') AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='treatment_center_onboarding'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.treatment_center_onboarding';
    END IF;
    -- modules
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='modules'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.modules';
    END IF;
    -- api_endpoints
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='api_endpoints'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.api_endpoints';
    END IF;
    -- api_integration_registry
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='api_integration_registry'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.api_integration_registry';
    END IF;
  END IF;
END $$;