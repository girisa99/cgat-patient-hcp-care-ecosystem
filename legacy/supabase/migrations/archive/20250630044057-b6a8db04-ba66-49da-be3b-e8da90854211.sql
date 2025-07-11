
-- Create enum for therapy types
CREATE TYPE therapy_type AS ENUM (
  'car_t_cell',
  'gene_therapy',
  'advanced_biologics',
  'personalized_medicine',
  'radioligand_therapy',
  'cell_therapy',
  'immunotherapy',
  'other_cgat'
);

-- Create enum for modality types
CREATE TYPE modality_type AS ENUM (
  'autologous',
  'allogeneic',
  'viral_vector',
  'non_viral',
  'protein_based',
  'antibody_drug_conjugate',
  'radioligand',
  'combination'
);

-- Create enum for product status
CREATE TYPE product_status AS ENUM (
  'preclinical',
  'phase_1',
  'phase_2',
  'phase_3',
  'approved',
  'discontinued'
);

-- Create enum for trial status
CREATE TYPE trial_status AS ENUM (
  'not_yet_recruiting',
  'recruiting',
  'active_not_recruiting',
  'completed',
  'suspended',
  'terminated',
  'withdrawn'
);

-- Create table for therapies
CREATE TABLE public.therapies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  therapy_type therapy_type NOT NULL,
  description TEXT,
  indication TEXT,
  target_population TEXT,
  mechanism_of_action TEXT,
  special_handling_requirements JSONB DEFAULT '{}',
  regulatory_designations TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for modalities
CREATE TABLE public.modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  modality_type modality_type NOT NULL,
  description TEXT,
  manufacturing_complexity TEXT CHECK (manufacturing_complexity IN ('low', 'medium', 'high', 'very_high')),
  cold_chain_requirements JSONB DEFAULT '{}',
  shelf_life_considerations TEXT,
  administration_requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for manufacturers
CREATE TABLE public.manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer_type TEXT CHECK (manufacturer_type IN ('pharma', 'biotech', 'cdmo', 'academic', 'other')),
  headquarters_location TEXT,
  regulatory_status JSONB DEFAULT '{}',
  manufacturing_capabilities TEXT[] DEFAULT '{}',
  quality_certifications TEXT[] DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  partnership_tier TEXT CHECK (partnership_tier IN ('preferred', 'standard', 'limited')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for products (links therapies, modalities, and manufacturers)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_name TEXT,
  therapy_id UUID REFERENCES public.therapies(id) ON DELETE CASCADE,
  modality_id UUID REFERENCES public.modalities(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  product_status product_status NOT NULL,
  ndc_number TEXT,
  approval_date DATE,
  indication TEXT,
  dosing_information JSONB DEFAULT '{}',
  contraindications TEXT[] DEFAULT '{}',
  special_populations JSONB DEFAULT '{}',
  distribution_requirements JSONB DEFAULT '{}',
  pricing_information JSONB DEFAULT '{}',
  market_access_considerations JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for clinical trials
CREATE TABLE public.clinical_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nct_number TEXT UNIQUE,
  title TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  trial_status trial_status NOT NULL,
  phase TEXT CHECK (phase IN ('preclinical', 'phase_1', 'phase_1_2', 'phase_2', 'phase_2_3', 'phase_3', 'phase_4')),
  primary_indication TEXT,
  patient_population TEXT,
  enrollment_target INTEGER,
  enrollment_current INTEGER DEFAULT 0,
  primary_endpoint TEXT,
  secondary_endpoints TEXT[] DEFAULT '{}',
  investigational_sites JSONB DEFAULT '{}',
  sponsor_info JSONB DEFAULT '{}',
  start_date DATE,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  trial_locations TEXT[] DEFAULT '{}',
  eligibility_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for commercial products (approved products with commercial data)
CREATE TABLE public.commercial_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  launch_date DATE,
  market_regions TEXT[] DEFAULT '{}',
  reimbursement_status JSONB DEFAULT '{}',
  patient_access_programs JSONB DEFAULT '{}',
  distribution_channels TEXT[] DEFAULT '{}',
  volume_projections JSONB DEFAULT '{}',
  competitive_landscape JSONB DEFAULT '{}',
  key_opinion_leaders TEXT[] DEFAULT '{}',
  medical_affairs_contacts JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create enhanced onboarding therapy selections table
CREATE TABLE public.onboarding_therapy_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  therapy_id UUID REFERENCES public.therapies(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  selected_provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE,
  clinical_trial_id UUID REFERENCES public.clinical_trials(id) ON DELETE SET NULL,
  commercial_product_id UUID REFERENCES public.commercial_products(id) ON DELETE SET NULL,
  patient_volume_estimate INTEGER,
  treatment_readiness_level TEXT CHECK (treatment_readiness_level IN ('planning', 'preparing', 'ready', 'active')),
  infrastructure_requirements JSONB DEFAULT '{}',
  staff_training_needs JSONB DEFAULT '{}',
  timeline_considerations JSONB DEFAULT '{}',
  special_requirements JSONB DEFAULT '{}',
  selection_rationale TEXT,
  priority_level TEXT CHECK (priority_level IN ('high', 'medium', 'low')) DEFAULT 'medium',
  preferred_start_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_therapy_selections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for therapies
CREATE POLICY "Therapies are viewable by authenticated users"
  ON public.therapies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage therapies"
  ON public.therapies FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for modalities
CREATE POLICY "Modalities are viewable by authenticated users"
  ON public.modalities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage modalities"
  ON public.modalities FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for manufacturers
CREATE POLICY "Manufacturers are viewable by authenticated users"
  ON public.manufacturers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage manufacturers"
  ON public.manufacturers FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for products
CREATE POLICY "Products are viewable by authenticated users"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage products"
  ON public.products FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for clinical trials
CREATE POLICY "Clinical trials are viewable by authenticated users"
  ON public.clinical_trials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage clinical trials"
  ON public.clinical_trials FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for commercial products
CREATE POLICY "Commercial products are viewable by authenticated users"
  ON public.commercial_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage commercial products"
  ON public.commercial_products FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for onboarding therapy selections
CREATE POLICY "Users can view their own therapy selections"
  ON public.onboarding_therapy_selections FOR SELECT
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own therapy selections"
  ON public.onboarding_therapy_selections FOR INSERT
  WITH CHECK (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own therapy selections"
  ON public.onboarding_therapy_selections FOR UPDATE
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own therapy selections"
  ON public.onboarding_therapy_selections FOR DELETE
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all therapy selections"
  ON public.onboarding_therapy_selections FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create indexes for better performance
CREATE INDEX idx_therapies_therapy_type ON public.therapies(therapy_type);
CREATE INDEX idx_modalities_modality_type ON public.modalities(modality_type);
CREATE INDEX idx_manufacturers_manufacturer_type ON public.manufacturers(manufacturer_type);
CREATE INDEX idx_products_therapy_id ON public.products(therapy_id);
CREATE INDEX idx_products_modality_id ON public.products(modality_id);
CREATE INDEX idx_products_manufacturer_id ON public.products(manufacturer_id);
CREATE INDEX idx_products_product_status ON public.products(product_status);
CREATE INDEX idx_clinical_trials_product_id ON public.clinical_trials(product_id);
CREATE INDEX idx_clinical_trials_trial_status ON public.clinical_trials(trial_status);
CREATE INDEX idx_clinical_trials_nct_number ON public.clinical_trials(nct_number);
CREATE INDEX idx_commercial_products_product_id ON public.commercial_products(product_id);
CREATE INDEX idx_onboarding_therapy_selections_onboarding_id ON public.onboarding_therapy_selections(onboarding_id);
CREATE INDEX idx_onboarding_therapy_selections_therapy_id ON public.onboarding_therapy_selections(therapy_id);
CREATE INDEX idx_onboarding_therapy_selections_product_id ON public.onboarding_therapy_selections(product_id);

-- Add audit triggers for the new tables
CREATE TRIGGER audit_therapies
  AFTER INSERT OR UPDATE OR DELETE ON public.therapies
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_modalities
  AFTER INSERT OR UPDATE OR DELETE ON public.modalities
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_manufacturers
  AFTER INSERT OR UPDATE OR DELETE ON public.manufacturers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_clinical_trials
  AFTER INSERT OR UPDATE OR DELETE ON public.clinical_trials
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_commercial_products
  AFTER INSERT OR UPDATE OR DELETE ON public.commercial_products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_therapy_selections
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_therapy_selections
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Add updated_at triggers
CREATE TRIGGER update_therapies_updated_at
  BEFORE UPDATE ON public.therapies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modalities_updated_at
  BEFORE UPDATE ON public.modalities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manufacturers_updated_at
  BEFORE UPDATE ON public.manufacturers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinical_trials_updated_at
  BEFORE UPDATE ON public.clinical_trials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commercial_products_updated_at
  BEFORE UPDATE ON public.commercial_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_therapy_selections_updated_at
  BEFORE UPDATE ON public.onboarding_therapy_selections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
