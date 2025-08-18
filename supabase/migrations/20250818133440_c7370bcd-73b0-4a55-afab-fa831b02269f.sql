-- Create use_cases table to store predefined and user-created use cases
CREATE TABLE public.use_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  complexity TEXT NOT NULL DEFAULT 'moderate', -- 'simple', 'moderate', 'complex'
  industry TEXT,
  recommended_journey JSONB DEFAULT '[]'::jsonb,
  required_components JSONB DEFAULT '[]'::jsonb,
  optional_components JSONB DEFAULT '[]'::jsonb,
  templates JSONB DEFAULT '{}'::jsonb,
  is_system_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view active use cases"
ON public.use_cases
FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create their own use cases"
ON public.use_cases
FOR INSERT
WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update their own use cases"
ON public.use_cases
FOR UPDATE
USING (auth.uid() = created_by OR is_system_template = true)
WITH CHECK (auth.uid() = created_by OR is_system_template = true);

CREATE POLICY "Users can delete their own use cases"
ON public.use_cases
FOR DELETE
USING (auth.uid() = created_by AND is_system_template = false);

-- Create indexes for better performance
CREATE INDEX idx_use_cases_category ON public.use_cases(category);
CREATE INDEX idx_use_cases_industry ON public.use_cases(industry);
CREATE INDEX idx_use_cases_active ON public.use_cases(is_active);
CREATE INDEX idx_use_cases_created_by ON public.use_cases(created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_use_cases_updated_at
  BEFORE UPDATE ON public.use_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default system templates
INSERT INTO public.use_cases (
  name,
  description,
  category,
  complexity,
  industry,
  recommended_journey,
  required_components,
  optional_components,
  templates,
  is_system_template,
  is_active
) VALUES 
(
  'Patient Intake Assistant',
  'Automated patient registration and initial assessment for healthcare providers',
  'healthcare',
  'moderate',
  'healthcare',
  '[
    {"id": "patient_info", "title": "Gather Patient Information", "type": "information_gathering", "components_involved": []},
    {"id": "insurance_verify", "title": "Insurance Verification", "type": "action_required", "components_involved": []},
    {"id": "schedule_appointment", "title": "Schedule Appointment", "type": "action_required", "components_involved": []}
  ]'::jsonb,
  '[
    {"id": "forms_integration", "name": "Forms Integration", "category": "integration", "dependencies": [], "provides": ["patient_data"]},
    {"id": "ehr_connector", "name": "EHR Connector", "category": "integration", "dependencies": [], "provides": ["medical_records"]}
  ]'::jsonb,
  '[
    {"id": "voice_interface", "name": "Voice Interface", "category": "enhancement", "dependencies": [], "provides": ["voice_interaction"]}
  ]'::jsonb,
  '{
    "canvas_layout": {"type": "vertical", "auto_layout": true},
    "default_actions": [
      {"name": "collect_patient_info", "type": "form", "config": {}},
      {"name": "verify_insurance", "type": "api_call", "config": {}}
    ],
    "suggested_connectors": ["epic_fhir", "insurance_api"],
    "knowledge_sources": ["medical_terminology", "insurance_policies"],
    "voice_config": {"enabled": true, "language": "en-US"}
  }'::jsonb,
  true,
  true
),
(
  'Customer Support Agent',
  'Intelligent customer service automation with ticket routing and resolution',
  'customer_service',
  'moderate',
  'general',
  '[
    {"id": "ticket_intake", "title": "Ticket Creation and Classification", "type": "information_gathering", "components_involved": []},
    {"id": "knowledge_search", "title": "Knowledge Base Search", "type": "action_required", "components_involved": []},
    {"id": "response_generation", "title": "Generate Response", "type": "action_required", "components_involved": []},
    {"id": "escalation_check", "title": "Escalation Assessment", "type": "decision_point", "components_involved": []}
  ]'::jsonb,
  '[
    {"id": "ticketing_system", "name": "Ticketing Integration", "category": "integration", "dependencies": [], "provides": ["ticket_data"]},
    {"id": "knowledge_base", "name": "Knowledge Base", "category": "knowledge", "dependencies": [], "provides": ["support_content"]}
  ]'::jsonb,
  '[
    {"id": "sentiment_analysis", "name": "Sentiment Analysis", "category": "enhancement", "dependencies": [], "provides": ["emotion_detection"]}
  ]'::jsonb,
  '{
    "canvas_layout": {"type": "horizontal", "auto_layout": true},
    "default_actions": [
      {"name": "classify_ticket", "type": "classification", "config": {}},
      {"name": "search_knowledge", "type": "search", "config": {}},
      {"name": "generate_response", "type": "generation", "config": {}}
    ],
    "suggested_connectors": ["zendesk", "salesforce_service", "slack"],
    "knowledge_sources": ["product_documentation", "faq", "troubleshooting_guides"],
    "voice_config": {"enabled": true, "language": "en-US"}
  }'::jsonb,
  true,
  true
),
(
  'Document Processing Workflow',
  'Automated document analysis, extraction, and processing system',
  'document_processing',
  'complex',
  'general',
  '[
    {"id": "document_upload", "title": "Document Upload and Validation", "type": "information_gathering", "components_involved": []},
    {"id": "content_extraction", "title": "Content Extraction", "type": "action_required", "components_involved": []},
    {"id": "data_validation", "title": "Data Validation and Quality Check", "type": "action_required", "components_involved": []},
    {"id": "storage_routing", "title": "Storage and Routing", "type": "action_required", "components_involved": []}
  ]'::jsonb,
  '[
    {"id": "ocr_service", "name": "OCR Service", "category": "integration", "dependencies": [], "provides": ["text_extraction"]},
    {"id": "document_storage", "name": "Document Storage", "category": "storage", "dependencies": [], "provides": ["file_management"]}
  ]'::jsonb,
  '[
    {"id": "ai_classification", "name": "AI Document Classification", "category": "enhancement", "dependencies": [], "provides": ["smart_routing"]}
  ]'::jsonb,
  '{
    "canvas_layout": {"type": "vertical", "auto_layout": true},
    "default_actions": [
      {"name": "extract_text", "type": "extraction", "config": {}},
      {"name": "validate_data", "type": "validation", "config": {}},
      {"name": "store_document", "type": "storage", "config": {}}
    ],
    "suggested_connectors": ["aws_textract", "google_document_ai", "dropbox", "sharepoint"],
    "knowledge_sources": ["document_templates", "validation_rules"],
    "voice_config": {"enabled": false}
  }'::jsonb,
  true,
  true
);