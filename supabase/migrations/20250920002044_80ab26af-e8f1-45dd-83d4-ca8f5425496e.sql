-- Create Provider Enrollment Data Tables with Individual UUID Fields
-- These tables store provider, treatment center, and referral network data separately

-- Provider Information Table
CREATE TABLE public.provider_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Provider Basic Information
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('individual', 'organization', 'facility')),
  npi_number TEXT,
  tax_id TEXT,
  specialty TEXT,
  license_number TEXT,
  license_state TEXT,
  license_expiry DATE,
  board_certification TEXT,
  provider_status TEXT DEFAULT 'active' CHECK (provider_status IN ('active', 'inactive', 'suspended')),
  
  -- Contact Information
  provider_phone TEXT,
  provider_email TEXT,
  provider_address TEXT,
  provider_city TEXT,
  provider_state TEXT,
  provider_zip TEXT,
  
  -- Credentialing Information
  medical_license_number TEXT,
  dea_number TEXT,
  taxonomy_code TEXT,
  
  -- Verification Status Fields
  provider_verification_status TEXT DEFAULT 'not_verified' CHECK (provider_verification_status IN ('pending', 'verified', 'failed', 'not_verified')),
  credentialing_status TEXT DEFAULT 'pending' CHECK (credentialing_status IN ('pending', 'in_progress', 'completed', 'failed')),
  verification_source TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_confidence NUMERIC DEFAULT 0,
  verification_issues JSONB DEFAULT '[]'::jsonb,
  
  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Treatment Center Information Table
CREATE TABLE public.treatment_center_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Treatment Center Basic Information
  facility_name TEXT NOT NULL,
  facility_type TEXT CHECK (facility_type IN ('inpatient', 'outpatient', 'residential', 'detox')),
  facility_npi TEXT,
  facility_address TEXT,
  facility_city TEXT,
  facility_state TEXT,
  facility_zip TEXT,
  facility_phone TEXT,
  facility_email TEXT,
  
  -- Licensing Information
  facility_license_number TEXT,
  facility_license_expiry DATE,
  facility_status TEXT DEFAULT 'active' CHECK (facility_status IN ('active', 'inactive', 'suspended')),
  
  -- Verification Status Fields
  treatment_center_verification_status TEXT DEFAULT 'not_verified' CHECK (treatment_center_verification_status IN ('pending', 'verified', 'failed', 'not_verified')),
  verification_source TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_confidence NUMERIC DEFAULT 0,
  verification_issues JSONB DEFAULT '[]'::jsonb,
  
  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral Network Information Table
CREATE TABLE public.referral_network_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Referral Network Information
  referral_network_name TEXT NOT NULL,
  referral_network_type TEXT CHECK (referral_network_type IN ('preferred', 'hmo', 'ppo', 'ace', 'independent')),
  referral_network_id TEXT,
  network_contact_person TEXT,
  network_phone TEXT,
  network_email TEXT,
  
  -- Verification Status Fields
  referral_network_verification_status TEXT DEFAULT 'not_verified' CHECK (referral_network_verification_status IN ('pending', 'verified', 'failed', 'not_verified')),
  verification_source TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_confidence NUMERIC DEFAULT 0,
  verification_issues JSONB DEFAULT '[]'::jsonb,
  
  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.provider_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_center_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_network_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Provider Enrollments
CREATE POLICY "Users can view their own provider enrollments" 
ON public.provider_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own provider enrollments" 
ON public.provider_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider enrollments" 
ON public.provider_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider enrollments" 
ON public.provider_enrollments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for Treatment Center Enrollments
CREATE POLICY "Users can view their own treatment center enrollments" 
ON public.treatment_center_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own treatment center enrollments" 
ON public.treatment_center_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own treatment center enrollments" 
ON public.treatment_center_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treatment center enrollments" 
ON public.treatment_center_enrollments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for Referral Network Enrollments
CREATE POLICY "Users can view their own referral network enrollments" 
ON public.referral_network_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral network enrollments" 
ON public.referral_network_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral network enrollments" 
ON public.referral_network_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own referral network enrollments" 
ON public.referral_network_enrollments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_provider_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_treatment_center_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_referral_network_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_enrollments_updated_at
  BEFORE UPDATE ON public.provider_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_enrollments_updated_at();

CREATE TRIGGER update_treatment_center_enrollments_updated_at
  BEFORE UPDATE ON public.treatment_center_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_treatment_center_enrollments_updated_at();

CREATE TRIGGER update_referral_network_enrollments_updated_at
  BEFORE UPDATE ON public.referral_network_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_network_enrollments_updated_at();

-- Add indexes for performance
CREATE INDEX idx_provider_enrollments_enrollment_id ON public.provider_enrollments(enrollment_id);
CREATE INDEX idx_provider_enrollments_user_id ON public.provider_enrollments(user_id);
CREATE INDEX idx_provider_enrollments_npi ON public.provider_enrollments(npi_number);

CREATE INDEX idx_treatment_center_enrollments_enrollment_id ON public.treatment_center_enrollments(enrollment_id);
CREATE INDEX idx_treatment_center_enrollments_user_id ON public.treatment_center_enrollments(user_id);
CREATE INDEX idx_treatment_center_enrollments_npi ON public.treatment_center_enrollments(facility_npi);

CREATE INDEX idx_referral_network_enrollments_enrollment_id ON public.referral_network_enrollments(enrollment_id);
CREATE INDEX idx_referral_network_enrollments_user_id ON public.referral_network_enrollments(user_id);