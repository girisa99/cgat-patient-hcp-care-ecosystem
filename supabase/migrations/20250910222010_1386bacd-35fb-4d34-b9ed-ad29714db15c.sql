-- Expand profiles table for comprehensive patient data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS race TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line_2 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_care_physician TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referring_physician TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medical_record_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS patient_height_feet INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS patient_height_inches INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS patient_weight_lbs DECIMAL(5,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_medications TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medical_conditions TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS previous_hospitalizations TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_medical_history TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_history TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smoking_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alcohol_use TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_preferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accessibility_needs TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_for_treatment BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_for_communication BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hipaa_acknowledgment BOOLEAN DEFAULT false;

-- Create therapies table with individual fields
CREATE TABLE IF NOT EXISTS therapies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  therapy_type TEXT NOT NULL CHECK (therapy_type IN ('car_t_cell', 'gene_therapy', 'advanced_biologics', 'personalized_medicine', 'radioligand_therapy', 'cell_therapy', 'immunotherapy', 'other_cgat')),
  description TEXT,
  indication TEXT,
  target_population TEXT,
  mechanism_of_action TEXT,
  
  -- Special handling requirements as individual fields
  temperature_requirements TEXT,
  storage_conditions TEXT,
  handling_precautions TEXT[],
  transportation_requirements TEXT,
  shelf_life_hours INTEGER,
  preparation_time_minutes INTEGER,
  administration_time_minutes INTEGER,
  monitoring_requirements TEXT[],
  
  -- Regulatory designations
  regulatory_designations TEXT[],
  fda_approval_status TEXT,
  breakthrough_therapy_designation BOOLEAN DEFAULT false,
  orphan_drug_designation BOOLEAN DEFAULT false,
  fast_track_designation BOOLEAN DEFAULT false,
  regenerative_medicine_designation BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create modalities table with individual fields
CREATE TABLE IF NOT EXISTS modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  modality_type TEXT NOT NULL CHECK (modality_type IN ('autologous', 'allogeneic', 'viral_vector', 'non_viral', 'protein_based', 'antibody_drug_conjugate', 'radioligand', 'combination')),
  description TEXT,
  manufacturing_complexity TEXT CHECK (manufacturing_complexity IN ('low', 'medium', 'high', 'very_high')),
  
  -- Cold chain requirements as individual fields
  min_temperature_celsius DECIMAL(5,2),
  max_temperature_celsius DECIMAL(5,2),
  humidity_requirements TEXT,
  light_sensitivity BOOLEAN DEFAULT false,
  freezer_requirements BOOLEAN DEFAULT false,
  dry_ice_shipping BOOLEAN DEFAULT false,
  temperature_monitoring_required BOOLEAN DEFAULT true,
  
  shelf_life_considerations TEXT,
  
  -- Administration requirements as individual fields
  infusion_time_minutes INTEGER,
  premedication_required BOOLEAN DEFAULT false,
  premedication_protocols TEXT[],
  special_equipment_needed TEXT[],
  sterile_preparation_required BOOLEAN DEFAULT true,
  pharmacy_compounding_required BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create manufacturers table with individual fields  
CREATE TABLE IF NOT EXISTS manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer_type TEXT CHECK (manufacturer_type IN ('pharma', 'biotech', 'cdmo', 'academic', 'other')),
  headquarters_location TEXT,
  
  -- Regulatory status as individual fields
  fda_registration_status TEXT,
  ema_registration_status TEXT,
  gmp_certification BOOLEAN DEFAULT false,
  iso_certification TEXT,
  regulatory_compliance_level TEXT,
  
  manufacturing_capabilities TEXT[],
  quality_certifications TEXT[],
  
  -- Contact info as individual fields
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  business_address TEXT,
  shipping_address TEXT,
  billing_contact_email TEXT,
  regulatory_contact_email TEXT,
  
  partnership_tier TEXT CHECK (partnership_tier IN ('preferred', 'standard', 'limited')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table with individual fields
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_name TEXT,
  therapy_id UUID REFERENCES therapies(id),
  modality_id UUID REFERENCES modalities(id),
  manufacturer_id UUID REFERENCES manufacturers(id),
  product_status TEXT CHECK (product_status IN ('preclinical', 'phase_1', 'phase_2', 'phase_3', 'approved', 'discontinued')),
  ndc_number TEXT,
  approval_date DATE,
  indication TEXT,
  
  -- Dosing information as individual fields
  standard_dose_amount DECIMAL(10,4),
  dose_unit TEXT,
  dosing_frequency TEXT,
  dose_calculation_method TEXT,
  weight_based_dosing BOOLEAN DEFAULT false,
  bsa_based_dosing BOOLEAN DEFAULT false,
  maximum_dose DECIMAL(10,4),
  minimum_dose DECIMAL(10,4),
  
  contraindications TEXT[],
  
  -- Special populations as individual fields
  pediatric_approved BOOLEAN DEFAULT false,
  geriatric_considerations TEXT,
  pregnancy_category TEXT,
  renal_impairment_dosing TEXT,
  hepatic_impairment_dosing TEXT,
  
  -- Distribution requirements as individual fields
  restricted_distribution BOOLEAN DEFAULT false,
  rems_program_required BOOLEAN DEFAULT false,
  specialty_pharmacy_only BOOLEAN DEFAULT false,
  hospital_only_distribution BOOLEAN DEFAULT false,
  patient_registry_required BOOLEAN DEFAULT false,
  
  -- Pricing information as individual fields
  wholesale_acquisition_cost DECIMAL(12,2),
  average_selling_price DECIMAL(12,2),
  medicare_reimbursement_rate DECIMAL(12,2),
  medicaid_reimbursement_rate DECIMAL(12,2),
  
  -- Market access considerations as individual fields
  prior_authorization_required BOOLEAN DEFAULT false,
  step_therapy_requirements TEXT,
  quantity_limits TEXT,
  coverage_limitations TEXT,
  appeals_process_info TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create clinical_trials table with individual fields
CREATE TABLE IF NOT EXISTS clinical_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nct_number TEXT,
  title TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  trial_status TEXT CHECK (trial_status IN ('not_yet_recruiting', 'recruiting', 'active_not_recruiting', 'completed', 'suspended', 'terminated', 'withdrawn')),
  phase TEXT CHECK (phase IN ('preclinical', 'phase_1', 'phase_1_2', 'phase_2', 'phase_2_3', 'phase_3', 'phase_4')),
  primary_indication TEXT,
  patient_population TEXT,
  enrollment_target INTEGER,
  enrollment_current INTEGER DEFAULT 0,
  primary_endpoint TEXT,
  secondary_endpoints TEXT[],
  
  -- Investigational sites as individual fields
  principal_investigator_name TEXT,
  principal_investigator_contact TEXT,
  site_locations TEXT[],
  coordinating_center TEXT,
  
  -- Sponsor info as individual fields
  sponsor_name TEXT,
  sponsor_type TEXT,
  sponsor_contact_info TEXT,
  funding_source TEXT,
  
  start_date DATE,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  trial_locations TEXT[],
  
  -- Eligibility criteria as individual fields
  minimum_age INTEGER,
  maximum_age INTEGER,
  gender_requirements TEXT,
  inclusion_criteria TEXT[],
  exclusion_criteria TEXT[],
  performance_status_requirements TEXT,
  biomarker_requirements TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create commercial_products table with individual fields
CREATE TABLE IF NOT EXISTS commercial_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  launch_date DATE,
  market_regions TEXT[],
  
  -- Reimbursement status as individual fields
  medicare_coverage_status TEXT,
  medicaid_coverage_status TEXT,
  commercial_coverage_percentage DECIMAL(5,2),
  average_coverage_percentage DECIMAL(5,2),
  
  -- Patient access programs as individual fields
  copay_assistance_available BOOLEAN DEFAULT false,
  patient_assistance_program BOOLEAN DEFAULT false,
  free_drug_program BOOLEAN DEFAULT false,
  foundation_assistance_available BOOLEAN DEFAULT false,
  manufacturer_bridge_program BOOLEAN DEFAULT false,
  
  distribution_channels TEXT[],
  
  -- Volume projections as individual fields
  projected_annual_patients INTEGER,
  projected_quarterly_patients INTEGER,
  market_share_percentage DECIMAL(5,2),
  growth_rate_percentage DECIMAL(5,2),
  
  -- Competitive landscape as individual fields
  main_competitors TEXT[],
  competitive_advantages TEXT[],
  market_position TEXT,
  
  key_opinion_leaders TEXT[],
  
  -- Medical affairs contacts as individual fields
  medical_director_name TEXT,
  medical_director_contact TEXT,
  field_medical_team TEXT[],
  medical_information_contact TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for therapies
CREATE POLICY "Users can view therapies" ON therapies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage therapies" ON therapies FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Create RLS policies for modalities
CREATE POLICY "Users can view modalities" ON modalities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage modalities" ON modalities FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Create RLS policies for manufacturers
CREATE POLICY "Users can view manufacturers" ON manufacturers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage manufacturers" ON manufacturers FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Create RLS policies for products
CREATE POLICY "Users can view products" ON products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Create RLS policies for clinical_trials
CREATE POLICY "Users can view clinical trials" ON clinical_trials FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage clinical trials" ON clinical_trials FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Create RLS policies for commercial_products
CREATE POLICY "Users can view commercial products" ON commercial_products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage commercial products" ON commercial_products FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Update existing onboarding_therapy_selections to use individual fields instead of JSONB
ALTER TABLE onboarding_therapy_selections DROP COLUMN IF EXISTS infrastructure_requirements;
ALTER TABLE onboarding_therapy_selections DROP COLUMN IF EXISTS staff_training_needs;
ALTER TABLE onboarding_therapy_selections DROP COLUMN IF EXISTS timeline_considerations;
ALTER TABLE onboarding_therapy_selections DROP COLUMN IF EXISTS special_requirements;

-- Add individual infrastructure requirement fields
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS clean_room_required BOOLEAN DEFAULT false;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS isolation_room_required BOOLEAN DEFAULT false;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS specialized_equipment TEXT[];
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS hvac_requirements TEXT;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS electrical_requirements TEXT;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS plumbing_requirements TEXT;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS security_requirements TEXT[];

-- Add individual staff training fields
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS required_certifications TEXT[];
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS training_hours_required INTEGER;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS competency_assessments TEXT[];
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS ongoing_education_requirements TEXT[];
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS specialized_roles_needed TEXT[];

-- Add individual timeline fields
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS planning_phase_weeks INTEGER;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS preparation_phase_weeks INTEGER;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS implementation_phase_weeks INTEGER;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS go_live_target_date DATE;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS milestones TEXT[];

-- Add individual special requirement fields
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS regulatory_submissions_needed TEXT[];
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS additional_approvals_required TEXT[];
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS vendor_partnerships_needed TEXT[];
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS patient_registry_participation BOOLEAN DEFAULT false;
ALTER TABLE onboarding_therapy_selections ADD COLUMN IF NOT EXISTS data_sharing_agreements TEXT[];