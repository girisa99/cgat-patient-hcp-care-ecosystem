-- Fix security issues by setting proper search_path for all functions

-- Update the update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update calculate_enrollment_progress function with proper search_path  
CREATE OR REPLACE FUNCTION public.calculate_enrollment_progress(enrollment_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_sections INTEGER := 6; -- consent, patient, provider, insurance, clinical, treatment
    completed_sections INTEGER := 0;
BEGIN
    -- Check if each section has data
    IF EXISTS (SELECT 1 FROM public.enrollment_consent WHERE enrollment_id = enrollment_uuid) THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.enrollment_patient_info WHERE enrollment_id = enrollment_uuid) THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.enrollment_provider_info WHERE enrollment_id = enrollment_uuid) THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.enrollment_insurance_info WHERE enrollment_id = enrollment_uuid) THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.enrollment_clinical_info WHERE enrollment_id = enrollment_uuid) THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.enrollment_treatment_plan WHERE enrollment_id = enrollment_uuid) THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    RETURN ROUND((completed_sections::DECIMAL / total_sections::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update get_prepopulate_data function with proper search_path
CREATE OR REPLACE FUNCTION public.get_prepopulate_data(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    latest_patient_info JSONB;
    latest_insurance JSONB;
BEGIN
    -- Get latest patient info
    SELECT to_jsonb(epi.*) INTO latest_patient_info
    FROM public.enrollment_patient_info epi
    JOIN public.patient_enrollments pe ON pe.id = epi.enrollment_id
    WHERE pe.user_id = user_uuid
    ORDER BY epi.created_at DESC
    LIMIT 1;
    
    -- Get latest insurance info
    SELECT to_jsonb(eii.*) INTO latest_insurance
    FROM public.enrollment_insurance_info eii
    JOIN public.patient_enrollments pe ON pe.id = eii.enrollment_id
    WHERE pe.user_id = user_uuid
    ORDER BY eii.created_at DESC
    LIMIT 1;
    
    -- Build result object
    result := jsonb_build_object(
        'patient_info', COALESCE(latest_patient_info, '{}'),
        'insurance_info', COALESCE(latest_insurance, '{}')
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;