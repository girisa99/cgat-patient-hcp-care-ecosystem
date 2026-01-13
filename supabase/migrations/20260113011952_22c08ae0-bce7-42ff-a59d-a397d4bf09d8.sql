-- P0 #67: Module Registry Database for Genie Product Suite
-- Defines module definitions and access rules per subscription tier

-- Create module_registry table
CREATE TABLE IF NOT EXISTS public.module_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  product TEXT NOT NULL, -- mind, spark, vibe, studio, productionHub
  category TEXT NOT NULL DEFAULT 'feature',
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_subscription BOOLEAN NOT NULL DEFAULT false,
  min_tier TEXT DEFAULT 'free', -- free, starter, business, pro, enterprise
  allowed_tiers TEXT[] DEFAULT ARRAY['free', 'starter', 'business', 'pro', 'enterprise', 'beta'],
  usage_limit_free INTEGER DEFAULT 0,
  usage_limit_starter INTEGER DEFAULT 10,
  usage_limit_business INTEGER DEFAULT 100,
  usage_limit_pro INTEGER DEFAULT -1, -- -1 means unlimited
  credit_cost INTEGER DEFAULT 0,
  feature_flags JSONB DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_registry ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Modules are readable by everyone (public registry)
CREATE POLICY "Modules are readable by everyone"
ON public.module_registry
FOR SELECT
USING (true);

-- Only authenticated users with admin role can modify
CREATE POLICY "Admins can manage modules"
ON public.module_registry
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'superAdmin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_module_registry_updated_at
  BEFORE UPDATE ON public.module_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default modules for Genie Product Suite
INSERT INTO public.module_registry (id, name, display_name, description, product, category, min_tier, usage_limit_free, usage_limit_starter, usage_limit_business, usage_limit_pro, credit_cost, sort_order) VALUES
-- Mind Modules
('mind-document-analysis', 'document_analysis', 'Document Analysis', 'AI-powered document processing and analysis', 'mind', 'ai', 'starter', 5, 50, 500, -1, 1, 10),
('mind-rag-search', 'rag_search', 'Knowledge Search', 'Vector-powered semantic search', 'mind', 'ai', 'starter', 10, 100, 1000, -1, 1, 11),
('mind-knowledge-graph', 'knowledge_graph', 'Knowledge Graph', 'Visual knowledge connections', 'mind', 'visualization', 'business', 0, 0, 50, -1, 2, 12),

-- Spark Modules
('spark-script-generation', 'script_generation', 'Script Generation', 'AI script writing from prompts', 'spark', 'ai', 'starter', 5, 25, 150, -1, 2, 20),
('spark-templates', 'templates', 'Template Library', 'Pre-built content templates', 'spark', 'content', 'free', 5, 25, 100, -1, 0, 21),
('spark-custom-templates', 'custom_templates', 'Custom Templates', 'Create and save custom templates', 'spark', 'content', 'business', 0, 0, 50, -1, 0, 22),

-- Vibe Modules
('vibe-recording', 'recording', 'Video Recording', 'Multi-source video capture', 'vibe', 'recording', 'starter', 1, 5, 25, -1, 0, 30),
('vibe-tts', 'tts', 'Text-to-Speech', 'AI voice generation', 'vibe', 'ai', 'starter', 5, 30, 200, -1, 1, 31),
('vibe-voice-clone', 'voice_clone', 'Voice Cloning', 'Custom voice training', 'vibe', 'ai', 'pro', 0, 0, 0, 5, 5, 32),
('vibe-teleprompter', 'teleprompter', 'Teleprompter', 'Script reading assistance', 'vibe', 'recording', 'free', -1, -1, -1, -1, 0, 33),
('vibe-editing', 'editing', 'Video Editing', 'Timeline and clip editing', 'vibe', 'editing', 'starter', 3, 10, 50, -1, 0, 34),
('vibe-export', 'export', 'Video Export', 'Multi-format export', 'vibe', 'export', 'free', 3, 10, 50, -1, 0, 35),

-- Studio Modules (unified)
('studio-workflow', 'workflow', 'Unified Workflow', 'Mind to Media pipeline', 'studio', 'workflow', 'starter', 3, 15, 100, -1, 0, 40),
('studio-collaboration', 'collaboration', 'Real-time Collaboration', 'Team editing features', 'studio', 'team', 'business', 0, 0, 10, -1, 0, 41),

-- Production Hub (Arc) Modules
('arc-shows', 'shows', 'Show Management', 'Episode and series management', 'productionHub', 'management', 'business', 0, 0, 5, -1, 0, 50),
('arc-guests', 'guests', 'Guest Coordination', 'Multi-guest session management', 'productionHub', 'coordination', 'pro', 0, 0, 0, 10, 0, 51),
('arc-approvals', 'approvals', 'Approval Workflows', 'Content approval chains', 'productionHub', 'workflow', 'business', 0, 0, 20, -1, 0, 52),
('arc-streaming', 'streaming', 'Live Streaming', 'Real-time broadcast', 'productionHub', 'streaming', 'pro', 0, 0, 0, 5, 0, 53),
('arc-analytics', 'analytics', 'Production Analytics', 'Performance tracking', 'productionHub', 'analytics', 'business', 0, 0, 100, -1, 0, 54)

ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  min_tier = EXCLUDED.min_tier,
  usage_limit_free = EXCLUDED.usage_limit_free,
  usage_limit_starter = EXCLUDED.usage_limit_starter,
  usage_limit_business = EXCLUDED.usage_limit_business,
  usage_limit_pro = EXCLUDED.usage_limit_pro,
  credit_cost = EXCLUDED.credit_cost,
  updated_at = now();

-- Create user_module_usage table to track per-user usage
CREATE TABLE IF NOT EXISTS public.user_module_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL REFERENCES public.module_registry(id) ON DELETE CASCADE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
  period_end TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id, period_start)
);

-- Enable RLS on user_module_usage
ALTER TABLE public.user_module_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own module usage"
ON public.user_module_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert/update their own usage
CREATE POLICY "Users can manage own module usage"
ON public.user_module_usage
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for usage
CREATE TRIGGER update_user_module_usage_updated_at
  BEFORE UPDATE ON public.user_module_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_registry_product ON public.module_registry(product);
CREATE INDEX IF NOT EXISTS idx_module_registry_min_tier ON public.module_registry(min_tier);
CREATE INDEX IF NOT EXISTS idx_user_module_usage_user ON public.user_module_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_usage_period ON public.user_module_usage(period_start, period_end);