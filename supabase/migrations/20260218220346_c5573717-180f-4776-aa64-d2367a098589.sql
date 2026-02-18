-- Fix session_type check constraint to allow sprint tracker sessions
ALTER TABLE public.universal_save_sessions 
  DROP CONSTRAINT IF EXISTS universal_save_sessions_session_type_check;

ALTER TABLE public.universal_save_sessions 
  ADD CONSTRAINT universal_save_sessions_session_type_check 
  CHECK (session_type = ANY (ARRAY[
    'patient_enrollment'::text,
    'agent_session'::text,
    'onboarding'::text,
    'npi_verification'::text,
    'production_workflow'::text,
    'sprint_tracker_live'::text
  ]));