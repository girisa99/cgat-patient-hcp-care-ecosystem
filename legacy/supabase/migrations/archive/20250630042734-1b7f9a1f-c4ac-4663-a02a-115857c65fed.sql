
-- Create enum for service types
CREATE TYPE service_type AS ENUM (
  '3pl',
  'specialty_distribution', 
  'specialty_pharmacy',
  'order_management',
  'patient_hub_services'
);

-- Create enum for service provider types
CREATE TYPE service_provider_type AS ENUM (
  'internal',
  'external_partner',
  'third_party'
);

-- Create table for service providers
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type service_provider_type NOT NULL,
  description TEXT,
  contact_info JSONB DEFAULT '{}',
  capabilities TEXT[] DEFAULT '{}',
  geographic_coverage TEXT[] DEFAULT '{}',
  certification_details JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type service_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  service_provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE,
  requirements JSONB DEFAULT '{}',
  pricing_model JSONB DEFAULT '{}',
  sla_requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for onboarding service selections (what services treatment centers select)
CREATE TABLE public.onboarding_service_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  selected_provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE,
  therapy_area TEXT, -- Store therapy area as text for now since therapy table doesn't exist
  selection_rationale TEXT,
  custom_requirements JSONB DEFAULT '{}',
  estimated_volume JSONB DEFAULT '{}',
  preferred_start_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for service provider capabilities (detailed capabilities matrix)
CREATE TABLE public.service_provider_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE,
  therapy_area TEXT, -- Store therapy area as text for now
  service_type service_type NOT NULL,
  capability_level TEXT CHECK (capability_level IN ('basic', 'advanced', 'specialized')),
  experience_years INTEGER,
  volume_capacity JSONB DEFAULT '{}',
  geographic_restrictions TEXT[] DEFAULT '{}',
  regulatory_compliance JSONB DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_provider_id, therapy_area, service_type)
);

-- Enable RLS on all new tables
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_service_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_capabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_providers
CREATE POLICY "Service providers are viewable by authenticated users"
  ON public.service_providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage service providers"
  ON public.service_providers FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for services
CREATE POLICY "Services are viewable by authenticated users"
  ON public.services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage services"
  ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for onboarding_service_selections
CREATE POLICY "Users can view their own service selections"
  ON public.onboarding_service_selections FOR SELECT
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own service selections"
  ON public.onboarding_service_selections FOR INSERT
  WITH CHECK (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own service selections"
  ON public.onboarding_service_selections FOR UPDATE
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own service selections"
  ON public.onboarding_service_selections FOR DELETE
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all service selections"
  ON public.onboarding_service_selections FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for service_provider_capabilities
CREATE POLICY "Service provider capabilities are viewable by authenticated users"
  ON public.service_provider_capabilities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage service provider capabilities"
  ON public.service_provider_capabilities FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create indexes for better performance
CREATE INDEX idx_services_service_type ON public.services(service_type);
CREATE INDEX idx_services_provider_id ON public.services(service_provider_id);
CREATE INDEX idx_onboarding_service_selections_onboarding_id ON public.onboarding_service_selections(onboarding_id);
CREATE INDEX idx_onboarding_service_selections_therapy_area ON public.onboarding_service_selections(therapy_area);
CREATE INDEX idx_service_provider_capabilities_provider_id ON public.service_provider_capabilities(service_provider_id);
CREATE INDEX idx_service_provider_capabilities_therapy_area ON public.service_provider_capabilities(therapy_area);

-- Add audit triggers for the new tables
CREATE TRIGGER audit_service_providers
  AFTER INSERT OR UPDATE OR DELETE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_services
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_service_selections
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_service_selections
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_service_provider_capabilities
  AFTER INSERT OR UPDATE OR DELETE ON public.service_provider_capabilities
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Add updated_at triggers
CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_service_selections_updated_at
  BEFORE UPDATE ON public.onboarding_service_selections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_provider_capabilities_updated_at
  BEFORE UPDATE ON public.service_provider_capabilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
