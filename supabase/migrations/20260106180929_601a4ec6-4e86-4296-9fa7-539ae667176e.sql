-- Agent Configuration Table - stores non-secret settings and metadata
-- Secrets are stored in Supabase secrets, referenced by key name here

CREATE TABLE public.agent_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type_id TEXT NOT NULL, -- e.g., 'insurance-verification', 'prior-auth', 'npi-verification'
  user_id UUID REFERENCES auth.users(id),
  
  -- Configuration metadata
  display_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  
  -- API Configuration (non-secret parts)
  api_base_url TEXT,
  api_version TEXT,
  environment TEXT DEFAULT 'sandbox', -- 'sandbox' | 'production'
  
  -- Required data fields for this agent
  required_fields JSONB DEFAULT '[]'::jsonb, -- e.g., ['member_id', 'group_number', 'provider_npi']
  optional_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Secret key references (names only, actual secrets in Supabase secrets)
  secret_key_refs JSONB DEFAULT '{}'::jsonb, -- e.g., {"api_key": "INSURANCE_VERIFY_API_KEY", "client_secret": "INSURANCE_CLIENT_SECRET"}
  
  -- Data source configuration
  data_source_config JSONB DEFAULT '{}'::jsonb, -- inline_upload, navigate_upload, ai_assist, extracted_data
  
  -- Agent behavior settings
  agent_settings JSONB DEFAULT '{}'::jsonb, -- timeout, retry_count, fallback_behavior
  
  -- Validation status
  is_validated BOOLEAN DEFAULT false,
  last_validated_at TIMESTAMPTZ,
  validation_result JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own agent configurations"
ON public.agent_configurations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent configurations"
ON public.agent_configurations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent configurations"
ON public.agent_configurations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent configurations"
ON public.agent_configurations FOR DELETE
USING (auth.uid() = user_id);

-- Index for quick lookup by agent type
CREATE INDEX idx_agent_configurations_agent_type ON public.agent_configurations(agent_type_id);
CREATE INDEX idx_agent_configurations_user_id ON public.agent_configurations(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_agent_configurations_updated_at
BEFORE UPDATE ON public.agent_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Agent Data Requirements Table - defines what data each agent type needs
CREATE TABLE public.agent_data_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type_id TEXT NOT NULL UNIQUE,
  
  -- Agent metadata
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'insurance', 'clinical', 'verification', 'cost'
  
  -- Required API configuration
  required_api_fields JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{"name": "api_key", "label": "API Key", "type": "secret", "required": true}]
  
  -- Required data from documents
  required_document_data JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{"field": "member_id", "source": "insurance_card", "fallback": "manual_input"}]
  
  -- Optional data that improves results
  optional_document_data JSONB DEFAULT '[]'::jsonb,
  
  -- Supported data collection methods
  supported_data_methods JSONB DEFAULT '["inline_upload", "navigate_upload", "ai_assist", "manual_entry"]'::jsonb,
  
  -- Default settings
  default_settings JSONB DEFAULT '{}'::jsonb,
  
  -- Documentation
  setup_instructions TEXT,
  documentation_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (public read, admin write)
ALTER TABLE public.agent_data_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agent data requirements"
ON public.agent_data_requirements FOR SELECT
USING (true);

-- Insert data requirements for the 5 core agents
INSERT INTO public.agent_data_requirements (agent_type_id, display_name, description, category, required_api_fields, required_document_data, optional_document_data, supported_data_methods, setup_instructions) VALUES
(
  'insurance-verification',
  'Insurance Verification Agent',
  'Verifies insurance eligibility and coverage in real-time via payer APIs',
  'insurance',
  '[
    {"name": "api_key", "label": "Payer API Key", "type": "secret", "required": true, "description": "API key for Availity, Change Healthcare, or direct payer API"},
    {"name": "api_secret", "label": "API Secret", "type": "secret", "required": false},
    {"name": "provider_npi", "label": "Provider NPI", "type": "text", "required": true, "description": "Your organization''s NPI number"},
    {"name": "submitter_id", "label": "Submitter ID", "type": "text", "required": false}
  ]'::jsonb,
  '[
    {"field": "member_id", "label": "Member ID", "source": "insurance_card", "fallback": "manual_input", "required": true},
    {"field": "payer_id", "label": "Payer ID", "source": "insurance_card", "fallback": "lookup", "required": true},
    {"field": "patient_dob", "label": "Patient DOB", "source": "patient_record", "fallback": "manual_input", "required": true}
  ]'::jsonb,
  '[
    {"field": "group_number", "label": "Group Number", "source": "insurance_card"},
    {"field": "subscriber_name", "label": "Subscriber Name", "source": "insurance_card"},
    {"field": "service_date", "label": "Date of Service", "source": "calculated"}
  ]'::jsonb,
  '["inline_upload", "navigate_upload", "ai_assist", "manual_entry"]'::jsonb,
  'To set up insurance verification:\n1. Obtain API credentials from your clearinghouse (Availity, Change Healthcare) or direct payer\n2. Register your Provider NPI with the clearinghouse\n3. Configure your submitter ID if required\n4. Test with sandbox credentials first'
),
(
  'prior-auth',
  'Prior Authorization Agent',
  'Automates prior authorization requests and status tracking',
  'insurance',
  '[
    {"name": "covermymeds_api_key", "label": "CoverMyMeds API Key", "type": "secret", "required": false, "description": "CoverMyMeds API credentials (alternative to SureScripts)"},
    {"name": "surescripts_api_key", "label": "SureScripts API Key", "type": "secret", "required": false, "description": "SureScripts ePA credentials"},
    {"name": "provider_npi", "label": "Provider NPI", "type": "text", "required": true},
    {"name": "provider_dea", "label": "Provider DEA", "type": "text", "required": false, "description": "Required for controlled substances"}
  ]'::jsonb,
  '[
    {"field": "medication_name", "label": "Medication Name", "source": "prescription", "required": true},
    {"field": "ndc", "label": "NDC Code", "source": "prescription", "fallback": "ndc_lookup", "required": true},
    {"field": "diagnosis_code", "label": "Diagnosis Code (ICD-10)", "source": "prescription", "fallback": "manual_input", "required": true},
    {"field": "member_id", "label": "Member ID", "source": "insurance_card", "required": true},
    {"field": "payer_id", "label": "Payer ID", "source": "insurance_card", "required": true}
  ]'::jsonb,
  '[
    {"field": "quantity", "label": "Quantity", "source": "prescription"},
    {"field": "days_supply", "label": "Days Supply", "source": "prescription"},
    {"field": "prescriber_phone", "label": "Prescriber Phone", "source": "prescription"}
  ]'::jsonb,
  '["inline_upload", "navigate_upload", "ai_assist", "manual_entry"]'::jsonb,
  'To set up Prior Authorization:\n1. Register with CoverMyMeds or SureScripts ePA network\n2. Complete EPCS certification if handling controlled substances\n3. Configure provider NPI and DEA numbers\n4. Set up webhook endpoints for PA status updates'
),
(
  'npi-verification',
  'NPI Verification Agent',
  'Real-time NPI verification via NPPES Registry API',
  'verification',
  '[
    {"name": "nppes_api_url", "label": "NPPES API URL", "type": "text", "required": false, "default": "https://npiregistry.cms.hhs.gov/api/", "description": "NPPES API is free and public - no key required"}
  ]'::jsonb,
  '[
    {"field": "npi_number", "label": "NPI Number", "source": "prescription", "fallback": "manual_input", "required": true}
  ]'::jsonb,
  '[
    {"field": "provider_name", "label": "Provider Name", "source": "prescription"},
    {"field": "provider_specialty", "label": "Specialty", "source": "prescription"}
  ]'::jsonb,
  '["extracted_data", "manual_entry"]'::jsonb,
  'NPI Verification uses the free NPPES Registry API. No API key required.\n\nThe agent will:\n1. Validate NPI format (10 digits with Luhn check)\n2. Query NPPES for provider details\n3. Return provider name, specialty, address, and status'
),
(
  'ndc-lookup',
  'NDC Code Lookup Agent',
  'Real-time NDC lookup via FDA OpenFDA API',
  'clinical',
  '[
    {"name": "openfda_api_key", "label": "OpenFDA API Key", "type": "secret", "required": false, "description": "Optional - increases rate limits. Free at https://open.fda.gov/apis/authentication/"}
  ]'::jsonb,
  '[
    {"field": "medication_name", "label": "Medication Name", "source": "prescription", "fallback": "manual_input", "required": true}
  ]'::jsonb,
  '[
    {"field": "ndc", "label": "NDC Code", "source": "prescription"},
    {"field": "strength", "label": "Strength", "source": "prescription"},
    {"field": "dosage_form", "label": "Dosage Form", "source": "prescription"}
  ]'::jsonb,
  '["extracted_data", "manual_entry"]'::jsonb,
  'NDC Lookup uses OpenFDA API which is free and public.\n\nOptional: Register for an API key at https://open.fda.gov/apis/authentication/ to increase rate limits from 240/min to 120,000/day.'
),
(
  'cost-analysis',
  'Cost & Copay Analysis Agent',
  'Analyzes medication costs, copays, and patient assistance programs',
  'cost',
  '[
    {"name": "goodrx_api_key", "label": "GoodRx API Key", "type": "secret", "required": false, "description": "For real-time pharmacy pricing"},
    {"name": "rxnav_api_url", "label": "RxNav API URL", "type": "text", "required": false, "default": "https://rxnav.nlm.nih.gov/REST/", "description": "NIH RxNav is free and public"}
  ]'::jsonb,
  '[
    {"field": "medication_name", "label": "Medication Name", "source": "prescription", "required": true},
    {"field": "ndc", "label": "NDC Code", "source": "ndc_lookup", "fallback": "prescription", "required": false}
  ]'::jsonb,
  '[
    {"field": "quantity", "label": "Quantity", "source": "prescription"},
    {"field": "pharmacy_zip", "label": "Pharmacy ZIP", "source": "manual_input"},
    {"field": "insurance_bin", "label": "Insurance BIN", "source": "insurance_card"},
    {"field": "insurance_pcn", "label": "Insurance PCN", "source": "insurance_card"}
  ]'::jsonb,
  '["extracted_data", "inline_upload", "manual_entry", "ai_assist"]'::jsonb,
  'Cost Analysis can work with or without API keys:\n\n**Without API keys (AI-powered):**\n- Uses AI to estimate costs based on public data\n- Suggests generic alternatives\n- Identifies patient assistance programs\n\n**With GoodRx API:**\n- Real-time pharmacy pricing\n- Coupon availability\n- Price comparison across pharmacies'
);

-- Trigger for updated_at
CREATE TRIGGER update_agent_data_requirements_updated_at
BEFORE UPDATE ON public.agent_data_requirements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();