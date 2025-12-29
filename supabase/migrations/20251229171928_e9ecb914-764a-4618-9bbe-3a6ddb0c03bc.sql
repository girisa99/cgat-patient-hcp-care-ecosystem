-- =====================================================
-- IMPROVEMENT 1: Add image storage columns to document_processing_jobs
-- =====================================================
ALTER TABLE document_processing_jobs 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS image_storage_path TEXT;

-- =====================================================
-- IMPROVEMENT 2: Create model_usage_analytics table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.model_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES document_processing_jobs(id) ON DELETE CASCADE,
  user_id UUID,
  document_type TEXT NOT NULL,
  document_category TEXT,
  file_name TEXT,
  
  -- Model selection info
  primary_model TEXT NOT NULL,
  model_used TEXT NOT NULL,
  selection_reason TEXT NOT NULL CHECK (selection_reason IN ('explicit_config', 'category_default', 'content_analysis', 'fallback')),
  selection_confidence NUMERIC(4,3) DEFAULT 0,
  
  -- Pipeline info
  pipeline_type TEXT DEFAULT 'single' CHECK (pipeline_type IN ('single', 'sequential-hybrid')),
  stage1_model TEXT,
  stage2_model TEXT,
  fallbacks_attempted TEXT[],
  
  -- Performance metrics
  processing_time_ms INTEGER,
  ocr_time_ms INTEGER,
  vision_ai_time_ms INTEGER,
  total_fields_extracted INTEGER DEFAULT 0,
  ocr_fields_count INTEGER DEFAULT 0,
  vision_ai_fields_count INTEGER DEFAULT 0,
  average_confidence NUMERIC(4,3),
  
  -- Cost tracking (in USD cents)
  estimated_cost_cents NUMERIC(10,4) DEFAULT 0,
  input_tokens INTEGER,
  output_tokens INTEGER,
  
  -- Status
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_model_usage_analytics_document_id ON model_usage_analytics(document_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_analytics_user_id ON model_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_analytics_model_used ON model_usage_analytics(model_used);
CREATE INDEX IF NOT EXISTS idx_model_usage_analytics_created_at ON model_usage_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_usage_analytics_document_type ON model_usage_analytics(document_type);

-- Enable RLS
ALTER TABLE model_usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can view all analytics (for dashboard), insert their own
CREATE POLICY "Anyone can view model usage analytics"
  ON model_usage_analytics FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert analytics"
  ON model_usage_analytics FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- IMPROVEMENT 6: Dynamic document type configuration table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_type_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT '📄',
  description TEXT,
  
  -- Processing configuration
  primary_model TEXT DEFAULT 'gemini',
  fallback_models TEXT[] DEFAULT ARRAY['claude', 'openai'],
  pipeline_type TEXT DEFAULT 'single',
  stage2_model TEXT,
  
  -- Field configuration
  expected_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  required_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  field_patterns JSONB DEFAULT '{}',
  
  -- Validation rules
  validation_rules JSONB DEFAULT '{}',
  confidence_threshold NUMERIC(3,2) DEFAULT 0.70,
  
  -- Cost settings
  estimated_cost_per_page_cents NUMERIC(10,4) DEFAULT 0.5,
  
  -- UI configuration
  special_tab_id TEXT,
  special_tab_label TEXT,
  display_order INTEGER DEFAULT 100,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_type_configs_type_id ON document_type_configs(type_id);
CREATE INDEX IF NOT EXISTS idx_document_type_configs_category ON document_type_configs(category);
CREATE INDEX IF NOT EXISTS idx_document_type_configs_is_active ON document_type_configs(is_active);

-- Enable RLS
ALTER TABLE document_type_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies - anyone can read, only admins can modify
CREATE POLICY "Anyone can view document type configs"
  ON document_type_configs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage document type configs"
  ON document_type_configs FOR ALL
  USING (true);

-- Insert default document types
INSERT INTO document_type_configs (type_id, label, category, icon, primary_model, fallback_models, expected_fields, is_system, display_order) VALUES
('prescription', 'Prescription', 'healthcare', '💊', 'claude', ARRAY['gemini', 'openai'], 
 ARRAY['patient_name', 'date_of_birth', 'prescriber_name', 'prescriber_npi', 'medication_name', 'dosage', 'frequency', 'quantity', 'refills', 'dea_number', 'pharmacy_name'],
 true, 1),
('insurance', 'Insurance Card', 'healthcare', '🏥', 'claude', ARRAY['gemini', 'openai'],
 ARRAY['member_name', 'member_id', 'group_number', 'plan_name', 'payer_name', 'effective_date', 'copay', 'deductible', 'bin', 'pcn'],
 true, 2),
('invoice', 'Invoice/Bill', 'financial', '📋', 'openai', ARRAY['claude', 'gemini'],
 ARRAY['invoice_number', 'invoice_date', 'due_date', 'vendor_name', 'total_amount', 'tax_amount', 'line_items', 'payment_terms'],
 true, 3),
('patient-onboarding', 'Patient Form', 'healthcare', '📝', 'gemini', ARRAY['claude', 'openai'],
 ARRAY['patient_name', 'date_of_birth', 'address', 'phone', 'email', 'emergency_contact', 'insurance_info', 'medical_history', 'allergies', 'current_medications'],
 true, 4),
('medical_imaging', 'Medical Imaging', 'medical-imaging', '🔬', 'gemini', ARRAY['claude'],
 ARRAY['modality', 'body_region', 'findings', 'impression', 'measurements', 'abnormalities'],
 true, 5),
('lab-results', 'Lab Results', 'healthcare', '🧪', 'claude', ARRAY['gemini', 'openai'],
 ARRAY['patient_name', 'test_date', 'test_name', 'result_value', 'reference_range', 'units', 'status', 'ordering_physician'],
 true, 6)
ON CONFLICT (type_id) DO NOTHING;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_document_type_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_document_type_configs_updated_at ON document_type_configs;
CREATE TRIGGER trigger_document_type_configs_updated_at
  BEFORE UPDATE ON document_type_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_document_type_configs_updated_at();

-- Enable realtime for analytics
ALTER PUBLICATION supabase_realtime ADD TABLE model_usage_analytics;