-- Document Type Configurations (Configuration-Driven Router)
CREATE TABLE IF NOT EXISTS public.document_type_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  patterns JSONB DEFAULT '[]',
  target_orchestrator TEXT,
  sub_agents TEXT[] DEFAULT '{}',
  extraction_fields TEXT[] DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Document Classification Learning (Auto-Classification)
CREATE TABLE IF NOT EXISTS public.document_classification_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID,
  original_classification TEXT,
  corrected_classification TEXT,
  confidence_score NUMERIC(5,4) DEFAULT 0,
  features JSONB DEFAULT '{}',
  feedback_type TEXT CHECK (feedback_type IN ('correction', 'confirmation', 'rejection')),
  learned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  applied_to_model BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document Classification Patterns (ML Training Data)
CREATE TABLE IF NOT EXISTS public.document_classification_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  pattern_type TEXT CHECK (pattern_type IN ('keyword', 'regex', 'structure', 'entity', 'layout')),
  pattern_value TEXT NOT NULL,
  weight NUMERIC(5,4) DEFAULT 1.0,
  match_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document Routing History (Audit Trail)
CREATE TABLE IF NOT EXISTS public.document_routing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID,
  source_type TEXT,
  classified_type TEXT,
  routed_to_domain TEXT,
  routed_to_orchestrator TEXT,
  confidence_score NUMERIC(5,4),
  classification_method TEXT CHECK (classification_method IN ('config', 'pattern', 'ml', 'manual', 'fallback')),
  processing_time_ms INTEGER,
  was_correct BOOLEAN,
  feedback_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.document_type_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_classification_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_classification_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_routing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_type_configurations (read by all authenticated, write by admins)
CREATE POLICY "Anyone can read document type configurations"
  ON public.document_type_configurations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert document type configurations"
  ON public.document_type_configurations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own configurations"
  ON public.document_type_configurations FOR UPDATE
  USING (auth.uid() = created_by OR created_by IS NULL);

-- RLS Policies for document_classification_learning
CREATE POLICY "Users can read all classification learning data"
  ON public.document_classification_learning FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own learning data"
  ON public.document_classification_learning FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning data"
  ON public.document_classification_learning FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for document_classification_patterns
CREATE POLICY "Anyone can read classification patterns"
  ON public.document_classification_patterns FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage patterns"
  ON public.document_classification_patterns FOR ALL
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for document_routing_history
CREATE POLICY "Users can read all routing history"
  ON public.document_routing_history FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own routing history"
  ON public.document_routing_history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for performance
CREATE INDEX idx_doc_type_config_type ON public.document_type_configurations(document_type);
CREATE INDEX idx_doc_type_config_domain ON public.document_type_configurations(domain);
CREATE INDEX idx_doc_classification_learning_type ON public.document_classification_learning(corrected_classification);
CREATE INDEX idx_doc_classification_patterns_type ON public.document_classification_patterns(document_type);
CREATE INDEX idx_doc_routing_history_document ON public.document_routing_history(document_id);

-- Seed initial document type configurations
INSERT INTO public.document_type_configurations (document_type, domain, display_name, description, keywords, target_orchestrator, sub_agents, extraction_fields, priority)
VALUES 
  ('patient_enrollment', 'insurance', 'Patient Enrollment', 'Patient enrollment and registration forms', ARRAY['enrollment', 'registration', 'new patient', 'member'], 'insurance_orchestrator', ARRAY['eligibility_agent', 'enrollment_agent'], ARRAY['patient_name', 'dob', 'ssn', 'address', 'insurance_id'], 10),
  ('prescription_refill', 'adherence', 'Prescription Refill', 'Prescription refill requests', ARRAY['refill', 'prescription', 'medication', 'rx'], 'adherence_orchestrator', ARRAY['refill_agent', 'pharmacy_agent'], ARRAY['medication_name', 'dosage', 'quantity', 'prescriber', 'pharmacy'], 10),
  ('prior_auth_request', 'insurance', 'Prior Authorization', 'Prior authorization requests for treatments', ARRAY['prior auth', 'authorization', 'approval', 'pa request'], 'insurance_orchestrator', ARRAY['prior_auth_agent', 'clinical_review_agent'], ARRAY['procedure_code', 'diagnosis', 'provider_npi', 'urgency'], 15),
  ('claim_submission', 'insurance', 'Claim Submission', 'Insurance claim submissions', ARRAY['claim', 'billing', 'reimbursement', 'hcfa', 'cms-1500'], 'insurance_orchestrator', ARRAY['claims_agent', 'coding_agent'], ARRAY['claim_number', 'cpt_codes', 'icd_codes', 'charges'], 10),
  ('lab_result', 'medical_coding', 'Lab Result', 'Laboratory test results', ARRAY['lab', 'test result', 'blood work', 'urinalysis'], 'medical_coding_orchestrator', ARRAY['lab_agent', 'coding_agent'], ARRAY['test_name', 'result_value', 'reference_range', 'ordering_provider'], 10),
  ('medical_record', 'medical_coding', 'Medical Record', 'General medical records and charts', ARRAY['medical record', 'chart', 'progress note', 'clinical'], 'medical_coding_orchestrator', ARRAY['records_agent', 'coding_agent'], ARRAY['patient_name', 'encounter_date', 'diagnosis', 'procedures'], 5),
  ('insurance_card', 'insurance', 'Insurance Card', 'Insurance ID cards', ARRAY['insurance card', 'member id', 'group number', 'payer'], 'insurance_orchestrator', ARRAY['eligibility_agent'], ARRAY['member_id', 'group_number', 'payer_name', 'plan_type'], 10),
  ('prescription', 'adherence', 'Prescription', 'New prescriptions', ARRAY['prescription', 'rx', 'script', 'medication order'], 'adherence_orchestrator', ARRAY['prescription_agent', 'drug_interaction_agent'], ARRAY['medication_name', 'dosage', 'frequency', 'quantity', 'prescriber_npi'], 10)
ON CONFLICT (document_type) DO NOTHING;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_document_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_document_type_configurations_timestamp
  BEFORE UPDATE ON public.document_type_configurations
  FOR EACH ROW EXECUTE FUNCTION update_document_config_timestamp();

CREATE TRIGGER update_document_classification_patterns_timestamp
  BEFORE UPDATE ON public.document_classification_patterns
  FOR EACH ROW EXECUTE FUNCTION update_document_config_timestamp();