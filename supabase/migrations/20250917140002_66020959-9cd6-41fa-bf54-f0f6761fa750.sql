-- Add submission method tracking columns to enrollment tables
-- These columns will track the source/channel/agent used for enrollment completion

-- Add columns to patient_enrollments table
ALTER TABLE public.patient_enrollments ADD COLUMN IF NOT EXISTS enrollment_source TEXT;
ALTER TABLE public.patient_enrollments ADD COLUMN IF NOT EXISTS submission_method TEXT;
ALTER TABLE public.patient_enrollments ADD COLUMN IF NOT EXISTS verification_method TEXT;
ALTER TABLE public.patient_enrollments ADD COLUMN IF NOT EXISTS agent_channel TEXT;

-- Add comments to describe the columns
COMMENT ON COLUMN public.patient_enrollments.enrollment_source IS 'Source system or method that initiated the enrollment (e.g., mcp, web_form, api, import)';
COMMENT ON COLUMN public.patient_enrollments.submission_method IS 'Method used to submit the enrollment (e.g., conversational_agent, manual_form, bulk_upload)';
COMMENT ON COLUMN public.patient_enrollments.verification_method IS 'Verification method used during enrollment (e.g., npi_agent, manual_review, automated)';
COMMENT ON COLUMN public.patient_enrollments.agent_channel IS 'Specific agent or channel identifier used for enrollment';

-- Check if provider_enrollments table exists and add similar columns if it does
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'provider_enrollments') THEN
        ALTER TABLE public.provider_enrollments ADD COLUMN IF NOT EXISTS enrollment_source TEXT;
        ALTER TABLE public.provider_enrollments ADD COLUMN IF NOT EXISTS submission_method TEXT;
        ALTER TABLE public.provider_enrollments ADD COLUMN IF NOT EXISTS verification_method TEXT;
        ALTER TABLE public.provider_enrollments ADD COLUMN IF NOT EXISTS agent_channel TEXT;
        
        COMMENT ON COLUMN public.provider_enrollments.enrollment_source IS 'Source system or method that initiated the enrollment';
        COMMENT ON COLUMN public.provider_enrollments.submission_method IS 'Method used to submit the enrollment';
        COMMENT ON COLUMN public.provider_enrollments.verification_method IS 'Verification method used during enrollment (e.g., npi_agent)';
        COMMENT ON COLUMN public.provider_enrollments.agent_channel IS 'Specific agent or channel identifier used for enrollment';
    END IF;
END
$$;