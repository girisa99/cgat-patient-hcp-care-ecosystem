-- Conversation Export and RAG System for Healthcare AI Agents

-- Table for storing conversations
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'exported')),
  conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  healthcare_context JSONB DEFAULT '{}'::jsonb, -- Cell, Gene, therapy data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for conversation exports
CREATE TABLE IF NOT EXISTS conversation_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  export_type TEXT NOT NULL CHECK (export_type IN ('email', 'pdf', 'json', 'compliance_report')),
  recipient_email TEXT,
  export_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  compliance_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Knowledge base for RAG system
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('cell_therapy', 'gene_therapy', 'radioland_treatment', 'personalized_medicine', 'clinical_protocols', 'regulatory', 'general')),
  source_type TEXT NOT NULL CHECK (source_type IN ('document_upload', 'html_link', 'web_crawl', 'manual_entry', 'api_integration')),
  source_url TEXT,
  content_type TEXT CHECK (content_type IN ('text', 'html', 'pdf', 'markdown', 'structured_data')),
  raw_content TEXT,
  processed_content TEXT,
  embeddings VECTOR(1536), -- For OpenAI embeddings
  metadata JSONB DEFAULT '{}'::jsonb,
  healthcare_tags TEXT[] DEFAULT '{}',
  modality_type TEXT CHECK (modality_type IN ('cell_therapy', 'gene_therapy', 'small_molecule', 'biologics', 'device', 'combination')),
  treatment_category TEXT,
  regulatory_status TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RAG recommendations and next best actions
CREATE TABLE IF NOT EXISTS rag_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES agent_conversations(id),
  knowledge_base_ids UUID[] DEFAULT '{}',
  query_context TEXT NOT NULL,
  recommendations JSONB NOT NULL,
  next_best_actions JSONB NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  healthcare_context JSONB DEFAULT '{}'::jsonb,
  treatment_recommendations JSONB DEFAULT '{}'::jsonb,
  clinical_insights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document processing queue for knowledge base
CREATE TABLE IF NOT EXISTS document_processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_base_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
  file_path TEXT,
  url TEXT,
  processing_type TEXT NOT NULL CHECK (processing_type IN ('text_extraction', 'embedding_generation', 'web_crawl', 'html_parse')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  error_message TEXT,
  progress_data JSONB DEFAULT '{}'::jsonb,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- MCP and AI model integrations
CREATE TABLE IF NOT EXISTS ai_model_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('llm', 'small_language_model', 'vision_language_model', 'embedding_model', 'multimodal')),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'huggingface', 'local', 'mcp', 'custom')),
  model_config JSONB NOT NULL,
  api_endpoint TEXT,
  api_key_reference TEXT, -- Reference to stored secret
  capabilities TEXT[] DEFAULT '{}',
  healthcare_specialization TEXT[] DEFAULT '{}',
  max_context_length INTEGER,
  supports_function_calling BOOLEAN DEFAULT false,
  supports_vision BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Connected systems and devices
CREATE TABLE IF NOT EXISTS connected_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  system_type TEXT NOT NULL CHECK (system_type IN ('ehr', 'lims', 'clinical_trial', 'laboratory', 'imaging', 'genomics', 'cell_processing', 'iot_device', 'mcp_server')),
  connection_config JSONB NOT NULL,
  authentication_method TEXT CHECK (authentication_method IN ('api_key', 'oauth', 'basic_auth', 'certificate', 'mcp_protocol')),
  capabilities JSONB DEFAULT '{}'::jsonb,
  data_formats TEXT[] DEFAULT '{}',
  healthcare_standards TEXT[] DEFAULT '{}', -- HL7, FHIR, DICOM, etc.
  compliance_requirements TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error', 'maintenance')),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Labeling studio integration for training data
CREATE TABLE IF NOT EXISTS labeling_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('text_classification', 'named_entity_recognition', 'image_segmentation', 'object_detection', 'genomic_annotation', 'clinical_coding')),
  healthcare_domain TEXT CHECK (healthcare_domain IN ('cell_therapy', 'gene_therapy', 'radiology', 'pathology', 'genomics', 'clinical_notes')),
  labeling_config JSONB NOT NULL,
  dataset_info JSONB DEFAULT '{}'::jsonb,
  annotation_guidelines TEXT,
  quality_metrics JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent compliance and safety monitoring
CREATE TABLE IF NOT EXISTS agent_compliance_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  conversation_id UUID REFERENCES agent_conversations(id),
  compliance_check_type TEXT NOT NULL CHECK (compliance_check_type IN ('hipaa', 'gdpr', 'fda_guidance', 'clinical_validation', 'safety_monitoring')),
  check_result JSONB NOT NULL,
  violations JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  auto_remediation_applied BOOLEAN DEFAULT false,
  remediation_actions JSONB DEFAULT '[]'::jsonb,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_id ON agent_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_healthcare_tags ON knowledge_base USING GIN(healthcare_tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_modality_type ON knowledge_base(modality_type);
CREATE INDEX IF NOT EXISTS idx_rag_recommendations_conversation_id ON rag_recommendations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_connected_systems_type ON connected_systems(system_type);
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_agent_id ON agent_compliance_monitoring(agent_id);

-- Enable Row Level Security
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE labeling_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_compliance_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_conversations
CREATE POLICY "Users can view their own conversations" ON agent_conversations
  FOR SELECT USING (auth.uid() = user_id OR is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can create conversations" ON agent_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON agent_conversations
  FOR UPDATE USING (auth.uid() = user_id OR is_admin_user_safe(auth.uid()));

-- RLS Policies for conversation_exports
CREATE POLICY "Users can manage their own exports" ON conversation_exports
  FOR ALL USING (auth.uid() = user_id OR is_admin_user_safe(auth.uid()));

-- RLS Policies for knowledge_base
CREATE POLICY "Authenticated users can view knowledge base" ON knowledge_base
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create knowledge base entries" ON knowledge_base
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators and admins can update knowledge base" ON knowledge_base
  FOR UPDATE USING (auth.uid() = created_by OR is_admin_user_safe(auth.uid()));

-- RLS Policies for other tables
CREATE POLICY "Authenticated users can view RAG recommendations" ON rag_recommendations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view AI model integrations" ON ai_model_integrations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage AI model integrations" ON ai_model_integrations
  FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Authenticated users can view connected systems" ON connected_systems
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage connected systems" ON connected_systems
  FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can manage their labeling projects" ON labeling_projects
  FOR ALL USING (auth.uid() = created_by OR is_admin_user_safe(auth.uid()));

CREATE POLICY "Authenticated users can view compliance monitoring" ON agent_compliance_monitoring
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage compliance monitoring" ON agent_compliance_monitoring
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_conversations_updated_at
  BEFORE UPDATE ON agent_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_model_integrations_updated_at
  BEFORE UPDATE ON ai_model_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connected_systems_updated_at
  BEFORE UPDATE ON connected_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_labeling_projects_updated_at
  BEFORE UPDATE ON labeling_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();