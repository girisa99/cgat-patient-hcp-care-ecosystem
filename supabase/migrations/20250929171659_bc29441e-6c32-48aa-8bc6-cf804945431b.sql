-- Create brand/organization configurations table (fixed)
CREATE TABLE public.genie_brand_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  business_unit TEXT,
  
  -- Theme Configuration
  theme_config JSONB NOT NULL DEFAULT '{
    "primaryColor": "#2563eb",
    "secondaryColor": "#8b5cf6", 
    "accentColor": "#06b6d4",
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937",
    "borderRadius": "8px",
    "fontFamily": "system-ui",
    "logoUrl": null,
    "brandingText": "GENIE AI"
  }'::jsonb,
  
  -- Model Configuration
  model_config JSONB NOT NULL DEFAULT '{
    "defaultMode": "single",
    "allowedModes": ["single", "multi"],
    "defaultModels": [
      {"provider": "google", "model": "gemini-2.5-flash", "category": "llm"}
    ],
    "maxModels": 6,
    "temperature": 0.4,
    "maxTokens": 1500,
    "enabledFeatures": ["medical", "vision"]
  }'::jsonb,
  
  -- RAG Configuration
  rag_config JSONB NOT NULL DEFAULT '{
    "enabled": true,
    "knowledgeBaseIds": [],
    "contextWindowSize": 10,
    "enableFutureContext": true,
    "ragEnhancementLevel": "standard"
  }'::jsonb,
  
  -- System Prompt Configuration
  system_prompt TEXT DEFAULT 'You are GENIE AI, a helpful healthcare technology assistant.',
  welcome_message TEXT DEFAULT 'Hello! I''m GENIE AI, your healthcare technology navigator. How can I help you today?',
  
  -- Deployment Configuration
  deployment_config JSONB NOT NULL DEFAULT '{
    "embedType": "popup",
    "position": "bottom-right",
    "triggerText": "Chat with GENIE",
    "allowedDomains": [],
    "customCSS": "",
    "enableAnalytics": true,
    "requireAuth": false,
    "privacyPolicy": null,
    "termsOfService": null
  }'::jsonb,
  
  -- MCP Configuration
  mcp_config JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "enabledTools": [],
    "customTools": [],
    "mcpServerConfigs": []
  }'::jsonb,
  
  -- Status and metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brand-specific knowledge bases table
CREATE TABLE public.genie_brand_knowledge_bases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_config_id UUID NOT NULL REFERENCES public.genie_brand_configs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Knowledge base content
  knowledge_entries JSONB NOT NULL DEFAULT '[]'::jsonb,
  document_urls TEXT[],
  faq_entries JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Configuration
  indexing_config JSONB NOT NULL DEFAULT '{
    "autoIndex": true,
    "vectorEmbeddings": true,
    "semanticSearch": true,
    "contentTypes": ["text", "pdf", "web"]
  }'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brand conversations table for analytics
CREATE TABLE public.genie_brand_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_config_id UUID NOT NULL REFERENCES public.genie_brand_configs(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_identifier TEXT, -- Optional user tracking
  
  -- Conversation data
  conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Analytics
  message_count INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  models_used TEXT[],
  topics_discussed TEXT[],
  user_satisfaction_score INTEGER, -- 1-5 rating
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deployment embed codes table
CREATE TABLE public.genie_deployment_embeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_config_id UUID NOT NULL REFERENCES public.genie_brand_configs(id) ON DELETE CASCADE,
  
  embed_code TEXT NOT NULL,
  embed_type TEXT NOT NULL DEFAULT 'popup' CHECK (embed_type IN ('popup', 'inline', 'fullscreen', 'sidebar')),
  domain TEXT NOT NULL,
  
  -- Access control
  api_key TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  allowed_origins TEXT[],
  
  -- Usage tracking
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genie_brand_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_brand_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_brand_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_deployment_embeds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Brand configs: Users can manage their own configs
CREATE POLICY "Users can manage their own brand configs"
ON public.genie_brand_configs
FOR ALL
USING (created_by = auth.uid() OR is_admin_user_safe(auth.uid()));

-- Knowledge bases: Linked to brand configs
CREATE POLICY "Users can manage knowledge bases for their brand configs"
ON public.genie_brand_knowledge_bases
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.genie_brand_configs bc
    WHERE bc.id = genie_brand_knowledge_bases.brand_config_id
    AND (bc.created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

-- Conversations: Brand owners can view analytics
CREATE POLICY "Brand owners can view their conversations"
ON public.genie_brand_conversations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.genie_brand_configs bc
    WHERE bc.id = genie_brand_conversations.brand_config_id
    AND (bc.created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

-- Public read for conversations (for analytics from deployed embeds)
CREATE POLICY "Public read access for deployed embeds"
ON public.genie_brand_conversations
FOR SELECT
USING (true);

-- Deployment embeds: Brand owners manage
CREATE POLICY "Brand owners can manage deployment embeds"
ON public.genie_deployment_embeds
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.genie_brand_configs bc
    WHERE bc.id = genie_deployment_embeds.brand_config_id
    AND (bc.created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

-- Create indexes for performance
CREATE INDEX idx_genie_brand_configs_active ON public.genie_brand_configs(is_active) WHERE is_active = true;
CREATE INDEX idx_genie_brand_knowledge_bases_config ON public.genie_brand_knowledge_bases(brand_config_id);
CREATE INDEX idx_genie_brand_conversations_config ON public.genie_brand_conversations(brand_config_id);
CREATE INDEX idx_genie_brand_conversations_session ON public.genie_brand_conversations(session_id);
CREATE INDEX idx_genie_deployment_embeds_config ON public.genie_deployment_embeds(brand_config_id);
CREATE INDEX idx_genie_deployment_embeds_domain ON public.genie_deployment_embeds(domain);

-- Create trigger for updated_at columns  
CREATE TRIGGER update_genie_brand_configs_updated_at
    BEFORE UPDATE ON public.genie_brand_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genie_brand_knowledge_bases_updated_at
    BEFORE UPDATE ON public.genie_brand_knowledge_bases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genie_brand_conversations_updated_at
    BEFORE UPDATE ON public.genie_brand_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();