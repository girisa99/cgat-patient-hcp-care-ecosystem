-- Add UUID foreign key fields to enrollment tables for proper referential integrity

-- Add facility_id to enrollment_consent table (treatment center reference)
ALTER TABLE public.enrollment_consent 
ADD COLUMN facility_id UUID REFERENCES public.facilities(id),
ADD COLUMN provider_id UUID REFERENCES public.service_providers(id);

-- Add facility_id to enrollment_provider_info table  
ALTER TABLE public.enrollment_provider_info
ADD COLUMN facility_id UUID REFERENCES public.facilities(id),
ADD COLUMN referring_provider_id UUID REFERENCES public.service_providers(id),
ADD COLUMN pcp_provider_id UUID REFERENCES public.service_providers(id);

-- Add facility_id to patient_enrollments table (primary treatment location)
ALTER TABLE public.patient_enrollments
ADD COLUMN facility_id UUID REFERENCES public.facilities(id),
ADD COLUMN primary_provider_id UUID REFERENCES public.service_providers(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollment_consent_facility_id ON public.enrollment_consent(facility_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_consent_provider_id ON public.enrollment_consent(provider_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_provider_info_facility_id ON public.enrollment_provider_info(facility_id);
CREATE INDEX IF NOT EXISTS idx_patient_enrollments_facility_id ON public.patient_enrollments(facility_id);
CREATE INDEX IF NOT EXISTS idx_patient_enrollments_provider_id ON public.patient_enrollments(primary_provider_id);