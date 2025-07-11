
-- Create enum types for the onboarding system
CREATE TYPE business_type AS ENUM (
  'acute_care',
  'primary_care', 
  'specialty',
  'home_health',
  'extended_long_term',
  'pharmacy',
  'closed_door',
  'internet',
  'mail_order',
  'supplier',
  'government',
  'other'
);

CREATE TYPE ownership_type AS ENUM (
  'proprietorship',
  'partnership',
  'limited_partnership',
  'llc',
  's_corp',
  'c_corp',
  'professional_corp',
  'non_profit_corp'
);

CREATE TYPE onboarding_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected'
);

CREATE TYPE onboarding_step AS ENUM (
  'company_info',
  'business_classification',
  'contacts',
  'ownership',
  'references',
  'payment_banking',
  'licenses',
  'documents',
  'authorizations',
  'review',
  'complete'
);

CREATE TYPE distributor_type AS ENUM (
  'amerisource_bergen',
  'cardinal_health',
  'mckesson'
);

-- Main onboarding applications table
CREATE TABLE treatment_center_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status onboarding_status DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  submitted_at TIMESTAMPTZ,
  
  -- Distributor selection
  selected_distributors distributor_type[] DEFAULT '{}',
  
  -- Company information
  legal_name TEXT,
  dba_name TEXT,
  website TEXT,
  federal_tax_id TEXT,
  same_as_legal_address BOOLEAN DEFAULT false,
  
  -- Business classification
  business_types business_type[] DEFAULT '{}',
  years_in_business INTEGER,
  ownership_type ownership_type,
  state_org_charter_id TEXT,
  number_of_employees INTEGER,
  estimated_monthly_purchases DECIMAL,
  initial_order_amount DECIMAL,
  
  -- Banking information
  ach_preference TEXT CHECK (ach_preference IN ('direct_debit', 'online_payment')),
  bank_name TEXT,
  bank_account_number TEXT,
  bank_routing_number TEXT,
  bank_phone TEXT,
  statement_delivery_preference TEXT CHECK (statement_delivery_preference IN ('email', 'fax', 'mail')),
  payment_terms_requested TEXT,
  
  -- Licenses
  dea_number TEXT,
  hin_number TEXT,
  medical_license TEXT,
  state_pharmacy_license TEXT,
  resale_tax_exemption TEXT,
  
  -- Documents checklist
  voided_check_uploaded BOOLEAN DEFAULT false,
  resale_tax_exemption_cert_uploaded BOOLEAN DEFAULT false,
  dea_registration_copy_uploaded BOOLEAN DEFAULT false,
  state_pharmacy_license_copy_uploaded BOOLEAN DEFAULT false,
  medical_license_copy_uploaded BOOLEAN DEFAULT false,
  financial_statements_uploaded BOOLEAN DEFAULT false,
  supplier_statements_uploaded BOOLEAN DEFAULT false,
  
  -- Authorizations
  terms_accepted BOOLEAN DEFAULT false,
  date_signed TIMESTAMPTZ,
  authorized_signatory_name TEXT,
  authorized_signatory_title TEXT,
  authorized_signatory_ssn TEXT,
  guarantor_name TEXT,
  guarantor_ssn TEXT,
  guarantor_date TIMESTAMPTZ,
  
  -- Workflow tracking
  current_step onboarding_step DEFAULT 'company_info',
  completed_steps onboarding_step[] DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Bankruptcy history
  bankruptcy_history BOOLEAN DEFAULT false,
  bankruptcy_explanation TEXT
);

-- Addresses table (for multiple address types)
CREATE TABLE onboarding_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES treatment_center_onboarding(id) ON DELETE CASCADE NOT NULL,
  address_type TEXT NOT NULL CHECK (address_type IN ('legal', 'billing', 'shipping', 'bank')),
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts table
CREATE TABLE onboarding_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES treatment_center_onboarding(id) ON DELETE CASCADE NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('primary', 'accounts_payable', 'shipping', 'alternate')),
  name TEXT NOT NULL,
  title TEXT,
  phone TEXT NOT NULL,
  fax TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Principal owners table
CREATE TABLE onboarding_principal_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES treatment_center_onboarding(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  ownership_percentage DECIMAL NOT NULL CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  ssn TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Controlling entities table
CREATE TABLE onboarding_controlling_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES treatment_center_onboarding(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- References table (banks, suppliers, etc.)
CREATE TABLE onboarding_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES treatment_center_onboarding(id) ON DELETE CASCADE NOT NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('primary_bank', 'primary_supplier', 'technology_provider', 'additional')),
  name TEXT NOT NULL,
  account_number TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Additional licenses table
CREATE TABLE onboarding_additional_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES treatment_center_onboarding(id) ON DELETE CASCADE NOT NULL,
  license_type TEXT NOT NULL,
  license_number TEXT NOT NULL,
  state TEXT NOT NULL,
  expiration_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Document uploads table
CREATE TABLE onboarding_document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES treatment_center_onboarding(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  file_size INTEGER,
  mime_type TEXT
);

-- Workflow notes table
CREATE TABLE onboarding_workflow_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES treatment_center_onboarding(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'note' CHECK (note_type IN ('note', 'status_change', 'document_upload')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE treatment_center_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_principal_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_controlling_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_additional_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_workflow_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for treatment_center_onboarding
CREATE POLICY "Users can view their own onboarding applications"
  ON treatment_center_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding applications"
  ON treatment_center_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding applications"
  ON treatment_center_onboarding FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Onboarding team can view all applications"
  ON treatment_center_onboarding FOR SELECT
  USING (public.has_role(auth.uid(), 'onboardingTeam'));

CREATE POLICY "Onboarding team can update all applications"
  ON treatment_center_onboarding FOR UPDATE
  USING (public.has_role(auth.uid(), 'onboardingTeam'));

-- RLS Policies for related tables (addresses, contacts, etc.)
CREATE POLICY "Users can manage their onboarding addresses"
  ON onboarding_addresses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM treatment_center_onboarding tco 
    WHERE tco.id = onboarding_addresses.onboarding_id 
    AND (tco.user_id = auth.uid() OR public.has_role(auth.uid(), 'onboardingTeam'))
  ));

CREATE POLICY "Users can manage their onboarding contacts"
  ON onboarding_contacts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM treatment_center_onboarding tco 
    WHERE tco.id = onboarding_contacts.onboarding_id 
    AND (tco.user_id = auth.uid() OR public.has_role(auth.uid(), 'onboardingTeam'))
  ));

CREATE POLICY "Users can manage their principal owners"
  ON onboarding_principal_owners FOR ALL
  USING (EXISTS (
    SELECT 1 FROM treatment_center_onboarding tco 
    WHERE tco.id = onboarding_principal_owners.onboarding_id 
    AND (tco.user_id = auth.uid() OR public.has_role(auth.uid(), 'onboardingTeam'))
  ));

CREATE POLICY "Users can manage their controlling entities"
  ON onboarding_controlling_entities FOR ALL
  USING (EXISTS (
    SELECT 1 FROM treatment_center_onboarding tco 
    WHERE tco.id = onboarding_controlling_entities.onboarding_id 
    AND (tco.user_id = auth.uid() OR public.has_role(auth.uid(), 'onboardingTeam'))
  ));

CREATE POLICY "Users can manage their references"
  ON onboarding_references FOR ALL
  USING (EXISTS (
    SELECT 1 FROM treatment_center_onboarding tco 
    WHERE tco.id = onboarding_references.onboarding_id 
    AND (tco.user_id = auth.uid() OR public.has_role(auth.uid(), 'onboardingTeam'))
  ));

CREATE POLICY "Users can manage their additional licenses"
  ON onboarding_additional_licenses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM treatment_center_onboarding tco 
    WHERE tco.id = onboarding_additional_licenses.onboarding_id 
    AND (tco.user_id = auth.uid() OR public.has_role(auth.uid(), 'onboardingTeam'))
  ));

CREATE POLICY "Users can manage their document uploads"
  ON onboarding_document_uploads FOR ALL
  USING (EXISTS (
    SELECT 1 FROM treatment_center_onboarding tco 
    WHERE tco.id = onboarding_document_uploads.onboarding_id 
    AND (tco.user_id = auth.uid() OR public.has_role(auth.uid(), 'onboardingTeam'))
  ));

CREATE POLICY "Users can view workflow notes for their applications"
  ON onboarding_workflow_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM treatment_center_onboarding tco 
    WHERE tco.id = onboarding_workflow_notes.onboarding_id 
    AND (tco.user_id = auth.uid() OR public.has_role(auth.uid(), 'onboardingTeam'))
  ));

CREATE POLICY "Onboarding team can create workflow notes"
  ON onboarding_workflow_notes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'onboardingTeam'));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_treatment_center_onboarding_updated_at
  BEFORE UPDATE ON treatment_center_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_onboarding_user_id ON treatment_center_onboarding(user_id);
CREATE INDEX idx_onboarding_status ON treatment_center_onboarding(status);
CREATE INDEX idx_onboarding_current_step ON treatment_center_onboarding(current_step);
CREATE INDEX idx_onboarding_addresses_onboarding_id ON onboarding_addresses(onboarding_id);
CREATE INDEX idx_onboarding_contacts_onboarding_id ON onboarding_contacts(onboarding_id);
CREATE INDEX idx_onboarding_workflow_notes_onboarding_id ON onboarding_workflow_notes(onboarding_id);

-- Create storage bucket for onboarding documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('onboarding-documents', 'onboarding-documents', false);

-- Storage policies for onboarding documents
CREATE POLICY "Users can upload their onboarding documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'onboarding-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their onboarding documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'onboarding-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Onboarding team can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'onboarding-documents' 
  AND public.has_role(auth.uid(), 'onboardingTeam')
);
