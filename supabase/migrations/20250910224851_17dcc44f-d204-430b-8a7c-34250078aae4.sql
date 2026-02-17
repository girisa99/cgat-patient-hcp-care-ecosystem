-- Create role-based API access configuration tables

-- Role API Access Configuration
CREATE TABLE public.role_api_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  api_service_id UUID NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('read', 'write', 'admin', 'none')),
  field_mappings JSONB DEFAULT '{}',
  endpoints_allowed TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 100,
  sandbox_access BOOLEAN DEFAULT true,
  production_access BOOLEAN DEFAULT false,
  agent_integration_enabled BOOLEAN DEFAULT true,
  postman_collection_access BOOLEAN DEFAULT true,
  testing_permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, api_service_id)
);

-- API Field Mappings for new column structure
CREATE TABLE public.api_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  api_field TEXT NOT NULL,
  database_column TEXT NOT NULL,
  data_type TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  transformation_rule TEXT,
  validation_rule TEXT,
  role_visibility user_role[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(table_name, api_field, database_column)
);

-- Agent API Configurations
CREATE TABLE public.agent_api_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  api_service_id TEXT NOT NULL,
  user_role user_role NOT NULL,
  enabled_endpoints TEXT[] DEFAULT '{}',
  field_access_rules JSONB DEFAULT '{}',
  rate_limits JSONB DEFAULT '{"requests_per_minute": 100, "requests_per_hour": 1000}',
  data_access_scope JSONB DEFAULT '{"tables": [], "columns": [], "filters": {}}',
  transformation_rules JSONB DEFAULT '{}',
  security_policies JSONB DEFAULT '{"require_approval": true, "audit_all_requests": true, "mask_sensitive_data": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(agent_id, api_service_id)
);

-- Enable RLS
ALTER TABLE public.role_api_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_api_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_api_access
CREATE POLICY "Admins can manage role API access" ON public.role_api_access
  FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can view role API access" ON public.role_api_access
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for api_field_mappings
CREATE POLICY "Admins can manage field mappings" ON public.api_field_mappings
  FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can view field mappings" ON public.api_field_mappings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for agent_api_configurations
CREATE POLICY "Users can manage their agent API configs" ON public.agent_api_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_api_configurations.agent_id 
      AND agents.created_by = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_role_api_access_role ON public.role_api_access(role);
CREATE INDEX idx_role_api_access_api_service ON public.role_api_access(api_service_id);
CREATE INDEX idx_api_field_mappings_table ON public.api_field_mappings(table_name);
CREATE INDEX idx_api_field_mappings_role_visibility ON public.api_field_mappings USING GIN(role_visibility);
CREATE INDEX idx_agent_api_configs_agent ON public.agent_api_configurations(agent_id);
CREATE INDEX idx_agent_api_configs_role ON public.agent_api_configurations(user_role);

-- Update timestamp triggers
CREATE TRIGGER update_role_api_access_updated_at 
  BEFORE UPDATE ON public.role_api_access 
  FOR EACH ROW EXECUTE FUNCTION public.update_import_timestamp();

CREATE TRIGGER update_api_field_mappings_updated_at 
  BEFORE UPDATE ON public.api_field_mappings 
  FOR EACH ROW EXECUTE FUNCTION public.update_import_timestamp();

CREATE TRIGGER update_agent_api_configs_updated_at 
  BEFORE UPDATE ON public.agent_api_configurations 
  FOR EACH ROW EXECUTE FUNCTION public.update_import_timestamp();

-- Insert default role API access configurations
INSERT INTO public.role_api_access (role, api_service_id, access_level, endpoints_allowed, sandbox_access, production_access, agent_integration_enabled, postman_collection_access) VALUES
('superAdmin', 'internal_api_suite', 'admin', ARRAY['/api/v1/*'], true, true, true, true),
('onboardingTeam', 'internal_api_suite', 'write', ARRAY['/api/v1/onboarding/*', '/api/v1/facilities/*'], true, false, true, true),
('patientCaregiver', 'internal_api_suite', 'read', ARRAY['/api/v1/patients/*', '/api/v1/treatments/*'], true, false, true, false),
('demoUser', 'internal_api_suite', 'read', ARRAY['/api/v1/demo/*'], true, false, false, false);

-- Insert field mappings for updated column structure
INSERT INTO public.api_field_mappings (table_name, api_field, database_column, data_type, is_required, role_visibility) VALUES
-- Treatment Center Onboarding mappings
('treatment_center_onboarding', 'legal_name', 'legal_name', 'text', true, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),
('treatment_center_onboarding', 'dba_name', 'dba_name', 'text', false, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),
('treatment_center_onboarding', 'federal_tax_id', 'federal_tax_id', 'text', true, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),
('treatment_center_onboarding', 'business_phone', 'business_phone', 'text', true, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),
('treatment_center_onboarding', 'business_email', 'business_email', 'text', true, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),

-- Enrollment Instances mappings
('enrollment_instances', 'patient_name', 'patient_name', 'text', true, ARRAY['superAdmin', 'onboardingTeam', 'patientCaregiver']::user_role[]),
('enrollment_instances', 'patient_dob', 'patient_dob', 'date', true, ARRAY['superAdmin', 'onboardingTeam', 'patientCaregiver']::user_role[]),
('enrollment_instances', 'primary_insurance', 'primary_insurance', 'text', false, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),
('enrollment_instances', 'secondary_insurance', 'secondary_insurance', 'text', false, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),

-- Insurance Coverages mappings
('insurance_coverages', 'insurance_company', 'insurance_company', 'text', true, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),
('insurance_coverages', 'policy_number', 'policy_number', 'text', true, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),
('insurance_coverages', 'group_number', 'group_number', 'text', false, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),
('insurance_coverages', 'coverage_type', 'coverage_type', 'text', true, ARRAY['superAdmin', 'onboardingTeam']::user_role[]),

-- Treatment Assessments mappings
('treatment_assessments', 'assessment_type', 'assessment_type', 'text', true, ARRAY['superAdmin', 'patientCaregiver']::user_role[]),
('treatment_assessments', 'assessment_date', 'assessment_date', 'date', true, ARRAY['superAdmin', 'patientCaregiver']::user_role[]),
('treatment_assessments', 'clinician_name', 'clinician_name', 'text', true, ARRAY['superAdmin', 'patientCaregiver']::user_role[]),
('treatment_assessments', 'treatment_recommendations', 'treatment_recommendations', 'text', false, ARRAY['superAdmin', 'patientCaregiver']::user_role[]);