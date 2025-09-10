-- ENHANCEMENT 1: Expand profiles table to support comprehensive patient data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'english';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS other_language TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS other_gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ssn_encrypted TEXT; -- Encrypted SSN
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cell_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS apartment TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS do_not_contact_patient BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'not_started';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_progress INTEGER DEFAULT 0;

-- ENHANCEMENT 2: Expand enrollment_instances to support comprehensive workflow
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id);
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'patient';
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'standard';
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS estimated_completion_date DATE;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS collaboration_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS consent_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS provider_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS insurance_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS treatment_assessment_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS workflow_metadata JSONB DEFAULT '{}'::jsonb;

-- ENHANCEMENT 3: Create provider_profiles table for comprehensive provider data
CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES public.facilities(id),
  
  -- Basic Demographics
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  credentials TEXT,
  npi TEXT UNIQUE,
  taxonomy_codes TEXT[],
  primary_specialty TEXT,
  board_certifications TEXT[],
  medical_school TEXT,
  graduation_year TEXT,
  residency_details TEXT,
  fellowship_details TEXT,
  
  -- Contact Information
  primary_address TEXT,
  mailing_address TEXT,
  office_phone TEXT,
  mobile_phone TEXT,
  fax_number TEXT,
  email TEXT,
  preferred_contact_method TEXT,
  
  -- Licensing & Regulatory
  medical_license_numbers JSONB DEFAULT '[]'::jsonb, -- Array of {state, number, expirationDate}
  dea_number TEXT,
  controlled_substance_status TEXT,
  pdmp_registration TEXT,
  disciplinary_actions BOOLEAN DEFAULT false,
  disciplinary_details TEXT,
  
  -- Professional Experience
  years_in_practice TEXT,
  practice_type TEXT,
  hospital_affiliations TEXT[],
  advanced_therapy_experience BOOLEAN DEFAULT false,
  advanced_therapy_details TEXT,
  
  -- Insurance & Liability
  malpractice_carrier TEXT,
  policy_number TEXT,
  coverage_limits TEXT,
  insurance_expiration_date DATE,
  
  -- Advanced Therapy Certifications
  rems TEXT[],
  cart_certification BOOLEAN DEFAULT false,
  gene_therapy_training BOOLEAN DEFAULT false,
  radioligand_certification BOOLEAN DEFAULT false,
  crs_management_training BOOLEAN DEFAULT false,
  radiation_safety_cert BOOLEAN DEFAULT false,
  biomarker_training BOOLEAN DEFAULT false,
  companion_dx_experience BOOLEAN DEFAULT false,
  fda_training_certs TEXT[],
  continuing_education_status TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ENHANCEMENT 4: Expand facilities table for comprehensive facility data  
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS dba_names TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS accreditation_bodies TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS accreditation_status TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS joint_commission_id TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cms_certification_number TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS state_license_numbers JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS specialty_designations TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS service_capabilities TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS advanced_therapy_certified BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cart_center_designation BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS gene_therapy_capability BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS radioligand_therapy_capability BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS apheresis_capability BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS infusion_center_beds INTEGER;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS icu_beds INTEGER;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS emergency_department BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS operating_rooms INTEGER;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS isolation_rooms INTEGER;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS pharmacy_services BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS laboratory_services BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS radiology_services BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS pathology_services BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS quality_metrics JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS insurance_contracts TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS referral_network_partners TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS patient_volume_data JSONB DEFAULT '{}'::jsonb;

-- ENHANCEMENT 5: Create insurance_coverages table for multiple insurance management
CREATE TABLE IF NOT EXISTS public.insurance_coverages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_instance_id UUID REFERENCES public.enrollment_instances(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Basic Information
  priority TEXT NOT NULL CHECK (priority IN ('primary', 'secondary', 'tertiary')),
  category TEXT NOT NULL,
  company_name TEXT NOT NULL,
  plan_name TEXT,
  plan_type TEXT,
  policy_id TEXT NOT NULL,
  group_number TEXT,
  bin_number TEXT,
  pcn_number TEXT,
  policy_holder_name TEXT,
  policy_holder_dob DATE,
  policy_holder_ssn_encrypted TEXT,
  relationship_to_patient TEXT,
  policy_effective_date DATE,
  policy_expiration_date DATE,
  policy_status TEXT DEFAULT 'active',
  
  -- Contact Information
  member_services_phone TEXT,
  provider_services_phone TEXT,
  claims_phone TEXT,
  prior_auth_phone TEXT,
  pharmacy_services_phone TEXT,
  customer_service_hours TEXT,
  website_url TEXT,
  mobile_app_available BOOLEAN DEFAULT false,
  
  -- Coverage Details
  coverage_details JSONB DEFAULT '{}'::jsonb, -- Medical, pharmacy, mental health details
  pharmacy_benefits JSONB DEFAULT '{}'::jsonb, -- PBM, formulary, copays
  advanced_therapy_coverage JSONB DEFAULT '{}'::jsonb, -- Specialty drug coverage
  government_insurance_details JSONB DEFAULT '{}'::jsonb, -- Medicare, Medicaid, Tricare specific
  
  -- Card Images
  card_images JSONB DEFAULT '[]'::jsonb, -- Array of {type: 'front'|'back', url: string}
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(patient_id, priority) -- Ensure only one insurance per priority level per patient
);

-- ENHANCEMENT 6: Create treatment_assessments table for comprehensive clinical data
CREATE TABLE IF NOT EXISTS public.treatment_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_instance_id UUID REFERENCES public.enrollment_instances(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.provider_profiles(id),
  facility_id UUID REFERENCES public.facilities(id),
  
  -- Identity Verification
  identity_verification JSONB DEFAULT '{}'::jsonb,
  
  -- Clinical Readiness
  clinical_readiness JSONB DEFAULT '{}'::jsonb,
  
  -- Care Coordination
  care_coordination JSONB DEFAULT '{}'::jsonb,
  
  -- Financial Counseling
  financial_counseling JSONB DEFAULT '{}'::jsonb,
  
  -- Medical Review
  medical_review JSONB DEFAULT '{}'::jsonb,
  
  -- Laboratory & Diagnostics
  laboratory_diagnostics JSONB DEFAULT '{}'::jsonb,
  
  -- Technology & Monitoring
  technology_monitoring JSONB DEFAULT '{}'::jsonb,
  
  -- Risk Assessment & Management
  risk_assessment JSONB DEFAULT '{}'::jsonb,
  
  -- Assessment Status
  assessment_status TEXT DEFAULT 'in_progress',
  assessment_completion_date TIMESTAMP WITH TIME ZONE,
  medical_reviewer_id UUID REFERENCES public.profiles(id),
  medical_review_date TIMESTAMP WITH TIME ZONE,
  clinical_decision TEXT,
  clinical_decision_rationale TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ENHANCEMENT 7: Create therapy_selections table (enhance existing onboarding_therapy_selections)
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS enrollment_instance_id UUID REFERENCES public.enrollment_instances(id);
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.provider_profiles(id);
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS ndc_codes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS distribution_method TEXT;
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS date_of_apheresis DATE;
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS patient_id_internal TEXT;
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS date_of_infusion DATE;
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS order_id_internal TEXT;
ALTER TABLE public.onboarding_therapy_selections ADD COLUMN IF NOT EXISTS icd_codes JSONB DEFAULT '[]'::jsonb;

-- ENHANCEMENT 8: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollment_instances_patient_id ON public.enrollment_instances(patient_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_instances_provider_id ON public.enrollment_instances(provider_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_instances_facility_id ON public.enrollment_instances(facility_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_instances_status ON public.enrollment_instances(status);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_npi ON public.provider_profiles(npi);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON public.provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_patient_id ON public.insurance_coverages(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_priority ON public.insurance_coverages(patient_id, priority);
CREATE INDEX IF NOT EXISTS idx_treatment_assessments_patient_id ON public.treatment_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_assessments_enrollment_id ON public.treatment_assessments(enrollment_instance_id);

-- ENHANCEMENT 9: Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_profiles_updated_at
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_coverages_updated_at
  BEFORE UPDATE ON public.insurance_coverages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_assessments_updated_at
  BEFORE UPDATE ON public.treatment_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();