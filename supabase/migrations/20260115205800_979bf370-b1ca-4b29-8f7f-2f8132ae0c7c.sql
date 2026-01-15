-- Drop the existing constraint
ALTER TABLE public.universal_save_sessions 
DROP CONSTRAINT universal_save_sessions_session_type_check;

-- Add the new constraint with production_workflow included
ALTER TABLE public.universal_save_sessions 
ADD CONSTRAINT universal_save_sessions_session_type_check 
CHECK (session_type = ANY (ARRAY['patient_enrollment'::text, 'agent_session'::text, 'onboarding'::text, 'npi_verification'::text, 'production_workflow'::text]));