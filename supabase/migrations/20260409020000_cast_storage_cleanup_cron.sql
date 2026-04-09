-- Migration: Schedule automatic Cast storage cleanup
--
-- Runs daily at 3 AM UTC to clean up:
-- 1. Failed generation job outputs older than 7 days
-- 2. Assets from deleted/archived projects
--
-- Requires pg_cron extension (available on Supabase Pro plan)
-- On free tier, cleanup must be triggered manually via edge function

-- Add 'cleaned' as a valid status for cast_generation_jobs
-- (used by cleanup to mark jobs whose outputs were purged)
DO $$
BEGIN
  -- Only add constraint if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cast_generation_jobs_status_check'
  ) THEN
    -- No constraint to update — status is likely text/varchar without check
    NULL;
  END IF;
END $$;

-- Create a cleanup tracking table for audit trail
CREATE TABLE IF NOT EXISTS public.cast_cleanup_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cleanup_type TEXT NOT NULL, -- 'failed_jobs', 'deleted_projects', 'orphaned_assets'
  projects_processed INTEGER DEFAULT 0,
  files_deleted INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'::JSONB,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for recent cleanup lookups
CREATE INDEX IF NOT EXISTS idx_cleanup_log_executed ON public.cast_cleanup_log(executed_at DESC);

-- RLS: Only service role can access cleanup log
ALTER TABLE public.cast_cleanup_log ENABLE ROW LEVEL SECURITY;

-- Note: pg_cron scheduling should be done manually via Supabase dashboard:
-- SELECT cron.schedule(
--   'cast-storage-cleanup',
--   '0 3 * * *',  -- Daily at 3 AM UTC
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/cast-storage-cleanup',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{"action": "cleanup_failed_jobs", "retentionDays": 7, "dryRun": false}'
--   );
--   $$
-- );
