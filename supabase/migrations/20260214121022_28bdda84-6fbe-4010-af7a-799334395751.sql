
-- =============================================
-- FIX 1: Security Definer View - cron_job_status
-- Recreate as SECURITY INVOKER (safe) instead of SECURITY DEFINER
-- =============================================
DROP VIEW IF EXISTS public.cron_job_status;
CREATE VIEW public.cron_job_status
WITH (security_invoker = true)
AS
SELECT job.jobid,
    job.schedule,
    job.command,
    job.nodename,
    job.nodeport,
    job.database,
    job.username,
    job.active,
    job.jobname
FROM cron.job
WHERE (job.jobname = ANY (ARRAY['weekly-re3data-sync'::text, 'daily-embedding-generation'::text]))
ORDER BY job.jobname;

-- Grant access to authenticated only (not anon - cron jobs are admin data)
GRANT SELECT ON public.cron_job_status TO authenticated;
GRANT SELECT ON public.cron_job_status TO service_role;

-- =============================================
-- FIX 2: Function Search Path Mutable - 4 functions
-- Add SET search_path = public to each
-- =============================================

-- Fix: update_regional_landing_content_updated_at
CREATE OR REPLACE FUNCTION public.update_regional_landing_content_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix: update_regional_pricing_timestamp
CREATE OR REPLACE FUNCTION public.update_regional_pricing_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix: update_template_avg_rating (also SECURITY DEFINER - keep it but add search_path)
CREATE OR REPLACE FUNCTION public.update_template_avg_rating(p_template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE video_blueprints
  SET avg_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM video_blueprint_ratings
    WHERE template_id = p_template_id
  ),
  ratings_count = (
    SELECT COUNT(*)
    FROM video_blueprint_ratings
    WHERE template_id = p_template_id
  )
  WHERE id = p_template_id;
END;
$$;

-- Fix: update_tts_jobs_updated_at
CREATE OR REPLACE FUNCTION public.update_tts_jobs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
