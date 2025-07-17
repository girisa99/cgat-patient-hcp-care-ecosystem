-- Create supporting tables for comprehensive API management
CREATE TABLE IF NOT EXISTS public.api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_integration_id UUID REFERENCES public.api_integration_registry(id) ON DELETE CASCADE,
  endpoint_path TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  description TEXT,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  requires_authentication BOOLEAN DEFAULT true,
  rate_limit_config JSONB DEFAULT '{"requests": 1000, "period": "hour"}',
  request_schema JSONB DEFAULT '{}',
  response_schema JSONB DEFAULT '{}',
  example_request JSONB DEFAULT '{}',
  example_response JSONB DEFAULT '{}',
  sandbox_available BOOLEAN DEFAULT true,
  testing_status TEXT DEFAULT 'pending',
  documentation_url TEXT,
  postman_collection_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create API mapping fields table
CREATE TABLE IF NOT EXISTS public.api_mapping_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_integration_id UUID REFERENCES public.api_integration_registry(id) ON DELETE CASCADE,
  source_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  field_type TEXT NOT NULL,
  transformation_rule TEXT,
  validation_rules JSONB DEFAULT '[]',
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  field_category TEXT,
  mapping_direction TEXT CHECK (mapping_direction IN ('inbound', 'outbound', 'bidirectional')),
  data_sensitivity TEXT DEFAULT 'standard' CHECK (data_sensitivity IN ('public', 'standard', 'sensitive', 'restricted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create API documentation table
CREATE TABLE IF NOT EXISTS public.api_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_integration_id UUID REFERENCES public.api_integration_registry(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('specification', 'guide', 'tutorial', 'reference', 'postman')),
  title TEXT NOT NULL,
  content TEXT,
  format TEXT DEFAULT 'markdown',
  version TEXT DEFAULT '1.0',
  audience TEXT DEFAULT 'developer' CHECK (audience IN ('developer', 'business', 'technical', 'external')),
  is_public BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create API testing configurations table
CREATE TABLE IF NOT EXISTS public.api_testing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_integration_id UUID REFERENCES public.api_integration_registry(id) ON DELETE CASCADE,
  config_name TEXT NOT NULL,
  testing_type TEXT NOT NULL CHECK (testing_type IN ('unit', 'integration', 'load', 'security', 'compliance')),
  test_parameters JSONB DEFAULT '{}',
  postman_collection JSONB DEFAULT '{}',
  sandbox_config JSONB DEFAULT '{}',
  expected_results JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the missing APIs into the registry
INSERT INTO public.api_integration_registry (
  name, description, type, category, direction, purpose, status, 
  base_url, version, lifecycle_stage, endpoints_count, data_mappings_count, rls_policies_count
) VALUES 
('Twilio SMS API', 'SMS and voice communication services for patient notifications', 'external', 'healthcare', 'inbound', 'Communication and notifications', 'active', 'https://api.twilio.com', '2010-04-01', 'production', 15, 8, 3),
('DocuSign eSignature API', 'Electronic signature and document management for healthcare compliance', 'external', 'healthcare', 'bidirectional', 'Document management and compliance', 'active', 'https://demo.docusign.net', 'v2.1', 'production', 25, 12, 5),
('Business NPI Registry API', 'National Provider Identifier lookup and validation services', 'external', 'healthcare', 'inbound', 'Provider verification and validation', 'active', 'https://npiregistry.cms.hhs.gov', 'v2.1', 'production', 8, 4, 2),
('Claude AI API', 'Advanced language model for healthcare AI and documentation assistance', 'external', 'healthcare', 'inbound', 'AI-powered content generation and analysis', 'active', 'https://api.anthropic.com', 'v1', 'production', 12, 6, 4),
('OpenAPI Specification', 'API documentation and specification management system', 'internal', 'healthcare', 'bidirectional', 'API documentation and schema management', 'active', 'https://api.platform.local', 'v3.0', 'production', 30, 15, 8),
('CMS Blue Button API', 'Centers for Medicare & Medicaid Services patient data access', 'external', 'healthcare', 'inbound', 'Medicare claims and coverage data', 'active', 'https://api.bluebutton.cms.gov', 'v2', 'production', 18, 10, 6),
('Open FDA API', 'FDA drug, device, and food safety data access', 'external', 'healthcare', 'inbound', 'Regulatory and safety data access', 'active', 'https://api.fda.gov', 'v1', 'production', 22, 8, 4),
('Patient Management API', 'Core patient data management and CRUD operations', 'internal', 'healthcare', 'bidirectional', 'Patient data management', 'active', 'https://api.platform.local/patients', 'v2.0', 'production', 45, 25, 12),
('Provider Network API', 'Healthcare provider network management and directory', 'internal', 'healthcare', 'bidirectional', 'Provider network management', 'active', 'https://api.platform.local/providers', 'v2.0', 'production', 35, 20, 10),
('Facility Management API', 'Healthcare facility and location management system', 'internal', 'healthcare', 'bidirectional', 'Facility operations management', 'active', 'https://api.platform.local/facilities', 'v2.0', 'production', 28, 15, 8),
('Sandbox Testing Environment', 'Complete testing environment for API development', 'internal', 'healthcare', 'bidirectional', 'Development and testing support', 'active', 'https://sandbox.platform.local', 'v1.0', 'development', 50, 30, 15),
('API Validation Service', 'Real-time API validation and compliance checking', 'internal', 'healthcare', 'bidirectional', 'API quality assurance', 'active', 'https://api.platform.local/validation', 'v1.0', 'production', 20, 10, 5);

-- Enable RLS on new tables
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_mapping_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_testing_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view API endpoints" ON public.api_endpoints FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage API endpoints" ON public.api_endpoints FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can view API mapping fields" ON public.api_mapping_fields FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage API mapping fields" ON public.api_mapping_fields FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can view public API documentation" ON public.api_documentation FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage API documentation" ON public.api_documentation FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can view API testing configs" ON public.api_testing_configs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage API testing configs" ON public.api_testing_configs FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_api_endpoints_updated_at BEFORE UPDATE ON public.api_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_mapping_fields_updated_at BEFORE UPDATE ON public.api_mapping_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_documentation_updated_at BEFORE UPDATE ON public.api_documentation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_testing_configs_updated_at BEFORE UPDATE ON public.api_testing_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();