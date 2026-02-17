-- Create comprehensive patient enrollment system with sequential form structure

-- Main enrollment tracking table
CREATE TABLE public.patient_enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    tenant_id TEXT,
    enrollment_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (enrollment_status IN ('in_progress', 'completed', 'cancelled', 'on_hold')),
    current_section TEXT NOT NULL DEFAULT 'consent',
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    signature_data JSONB,
    pdf_generated BOOLEAN DEFAULT false,
    pdf_file_path TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Consent section
CREATE TABLE public.enrollment_consent (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL REFERENCES public.patient_enrollments(id) ON DELETE CASCADE,
    consent_to_treatment BOOLEAN DEFAULT false,
    hipaa_authorization BOOLEAN DEFAULT false,
    financial_responsibility BOOLEAN DEFAULT false,
    communication_consent BOOLEAN DEFAULT false,
    telehealth_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    consent_date TIMESTAMPTZ,
    patient_signature TEXT,
    witness_signature TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patient information section
CREATE TABLE public.enrollment_patient_info (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL REFERENCES public.patient_enrollments(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    middle_name TEXT,
    date_of_birth DATE,
    ssn TEXT,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    preferred_language TEXT DEFAULT 'English',
    marital_status TEXT,
    occupation TEXT,
    employer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Provider and treatment section
CREATE TABLE public.enrollment_provider_info (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL REFERENCES public.patient_enrollments(id) ON DELETE CASCADE,
    referring_provider_name TEXT,
    referring_provider_npi TEXT,
    referring_provider_phone TEXT,
    primary_care_physician TEXT,
    pcp_npi TEXT,
    pcp_phone TEXT,
    treatment_facility TEXT,
    facility_npi TEXT,
    facility_address TEXT,
    treatment_type TEXT,
    treatment_start_date DATE,
    diagnosis_codes JSONB DEFAULT '[]',
    treatment_plan JSONB DEFAULT '{}',
    npi_verification_status TEXT DEFAULT 'pending',
    credentialing_status TEXT DEFAULT 'pending',
    credentialing_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insurance information section
CREATE TABLE public.enrollment_insurance_info (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL REFERENCES public.patient_enrollments(id) ON DELETE CASCADE,
    primary_insurance_name TEXT,
    primary_policy_number TEXT,
    primary_group_number TEXT,
    primary_subscriber_name TEXT,
    primary_subscriber_dob DATE,
    primary_subscriber_relationship TEXT,
    primary_effective_date DATE,
    secondary_insurance_name TEXT,
    secondary_policy_number TEXT,
    secondary_group_number TEXT,
    secondary_subscriber_name TEXT,
    secondary_subscriber_dob DATE,
    secondary_subscriber_relationship TEXT,
    secondary_effective_date DATE,
    insurance_verification_status TEXT DEFAULT 'pending',
    copay_amount DECIMAL(10,2),
    deductible_amount DECIMAL(10,2),
    out_of_pocket_max DECIMAL(10,2),
    prior_authorization_required BOOLEAN DEFAULT false,
    prior_auth_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clinical information section
CREATE TABLE public.enrollment_clinical_info (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL REFERENCES public.patient_enrollments(id) ON DELETE CASCADE,
    chief_complaint TEXT,
    current_medications JSONB DEFAULT '[]',
    medical_history JSONB DEFAULT '[]',
    surgical_history JSONB DEFAULT '[]',
    family_history JSONB DEFAULT '[]',
    social_history JSONB DEFAULT '{}',
    allergies JSONB DEFAULT '[]',
    vital_signs JSONB DEFAULT '{}',
    lab_results JSONB DEFAULT '[]',
    imaging_results JSONB DEFAULT '[]',
    risk_factors JSONB DEFAULT '[]',
    treatment_goals JSONB DEFAULT '[]',
    clinical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Treatment plan details
CREATE TABLE public.enrollment_treatment_plan (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL REFERENCES public.patient_enrollments(id) ON DELETE CASCADE,
    treatment_modality TEXT,
    frequency TEXT,
    duration TEXT,
    location TEXT,
    provider_assignments JSONB DEFAULT '[]',
    therapy_goals JSONB DEFAULT '[]',
    medication_management JSONB DEFAULT '{}',
    monitoring_plan JSONB DEFAULT '{}',
    discharge_criteria JSONB DEFAULT '[]',
    estimated_cost DECIMAL(10,2),
    authorization_status TEXT DEFAULT 'pending',
    treatment_schedule JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies for all tables
ALTER TABLE public.patient_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_patient_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_provider_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_insurance_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_clinical_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_treatment_plan ENABLE ROW LEVEL SECURITY;

-- Policies for patient_enrollments
CREATE POLICY "Users can view their own enrollments" ON public.patient_enrollments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own enrollments" ON public.patient_enrollments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own enrollments" ON public.patient_enrollments
    FOR UPDATE USING (user_id = auth.uid());

-- Policies for enrollment_consent
CREATE POLICY "Users can manage consent for their enrollments" ON public.enrollment_consent
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patient_enrollments 
            WHERE id = enrollment_consent.enrollment_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for enrollment_patient_info
CREATE POLICY "Users can manage patient info for their enrollments" ON public.enrollment_patient_info
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patient_enrollments 
            WHERE id = enrollment_patient_info.enrollment_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for enrollment_provider_info
CREATE POLICY "Users can manage provider info for their enrollments" ON public.enrollment_provider_info
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patient_enrollments 
            WHERE id = enrollment_provider_info.enrollment_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for enrollment_insurance_info
CREATE POLICY "Users can manage insurance info for their enrollments" ON public.enrollment_insurance_info
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patient_enrollments 
            WHERE id = enrollment_insurance_info.enrollment_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for enrollment_clinical_info
CREATE POLICY "Users can manage clinical info for their enrollments" ON public.enrollment_clinical_info
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patient_enrollments 
            WHERE id = enrollment_clinical_info.enrollment_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for enrollment_treatment_plan
CREATE POLICY "Users can manage treatment plan for their enrollments" ON public.enrollment_treatment_plan
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patient_enrollments 
            WHERE id = enrollment_treatment_plan.enrollment_id 
            AND user_id = auth.uid()
        )
    );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_patient_enrollments_updated_at
    BEFORE UPDATE ON public.patient_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollment_consent_updated_at
    BEFORE UPDATE ON public.enrollment_consent
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollment_patient_info_updated_at
    BEFORE UPDATE ON public.enrollment_patient_info
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollment_provider_info_updated_at
    BEFORE UPDATE ON public.enrollment_provider_info
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollment_insurance_info_updated_at
    BEFORE UPDATE ON public.enrollment_insurance_info
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollment_clinical_info_updated_at
    BEFORE UPDATE ON public.enrollment_clinical_info
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollment_treatment_plan_updated_at
    BEFORE UPDATE ON public.enrollment_treatment_plan
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_patient_enrollments_session_id ON public.patient_enrollments(session_id);
CREATE INDEX idx_patient_enrollments_user_id ON public.patient_enrollments(user_id);
CREATE INDEX idx_patient_enrollments_status ON public.patient_enrollments(enrollment_status);
CREATE INDEX idx_patient_enrollments_current_section ON public.patient_enrollments(current_section);

-- Create function to calculate progress percentage
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to prepopulate data from previous enrollments
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
$$ LANGUAGE plpgsql SECURITY DEFINER;