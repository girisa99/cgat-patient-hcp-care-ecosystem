-- Fix cron_job_status view - add security_invoker option
-- This ensures the view uses the permissions of the querying user, not the view creator

DROP VIEW IF EXISTS public.cron_job_status;

CREATE VIEW public.cron_job_status 
WITH (security_invoker = on) AS
SELECT 
    job.jobid,
    job.schedule,
    job.command,
    job.nodename,
    job.nodeport,
    job.database,
    job.username,
    job.active,
    job.jobname
FROM cron.job
WHERE job.jobname = ANY (ARRAY['weekly-re3data-sync'::text, 'daily-embedding-generation'::text])
ORDER BY job.jobname;

-- Grant appropriate permissions
GRANT SELECT ON public.cron_job_status TO authenticated;
GRANT SELECT ON public.cron_job_status TO anon;