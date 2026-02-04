-- =====================================================
-- DYNAMIC MARKETING REGISTRY TABLES
-- Replaces hardcoded GENIE_PRODUCTS and TARGET_AUDIENCES
-- Enables white-label, enterprise, and freelancer use cases
-- =====================================================

-- 1. Marketing Products Table
CREATE TABLE public.marketing_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  icon TEXT DEFAULT 'Package',
  category TEXT DEFAULT 'general',
  features JSONB DEFAULT '[]'::jsonb,
  primary_color TEXT,
  secondary_color TEXT,
  is_system_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Marketing Audiences Table
CREATE TABLE public.marketing_audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  pain_points JSONB DEFAULT '[]'::jsonb,
  messaging_angles JSONB DEFAULT '[]'::jsonb,
  is_system_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Marketing Brand Assets Table
CREATE TABLE public.marketing_brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.marketing_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'icon', 'screenshot', 'banner', 'color_palette', 'font')),
  asset_url TEXT,
  asset_metadata JSONB DEFAULT '{}'::jsonb,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Marketing Languages Table
CREATE TABLE public.marketing_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  language_name TEXT NOT NULL,
  region TEXT,
  is_rtl BOOLEAN DEFAULT false,
  tts_provider TEXT,
  tts_voice_id TEXT,
  is_enabled BOOLEAN DEFAULT true,
  is_system_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_languages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users see system defaults + their own data
CREATE POLICY "View system defaults and own products"
ON public.marketing_products FOR SELECT
USING (is_system_default = true OR user_id = auth.uid());

CREATE POLICY "Manage own products"
ON public.marketing_products FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "View system defaults and own audiences"
ON public.marketing_audiences FOR SELECT
USING (is_system_default = true OR user_id = auth.uid());

CREATE POLICY "Manage own audiences"
ON public.marketing_audiences FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "View own brand assets"
ON public.marketing_brand_assets FOR SELECT
USING (user_id = auth.uid() OR product_id IN (
  SELECT id FROM public.marketing_products WHERE is_system_default = true
));

CREATE POLICY "Manage own brand assets"
ON public.marketing_brand_assets FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "View system defaults and own languages"
ON public.marketing_languages FOR SELECT
USING (is_system_default = true OR user_id = auth.uid());

CREATE POLICY "Manage own languages"
ON public.marketing_languages FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_marketing_products_user ON public.marketing_products(user_id);
CREATE INDEX idx_marketing_products_system ON public.marketing_products(is_system_default) WHERE is_system_default = true;
CREATE INDEX idx_marketing_audiences_user ON public.marketing_audiences(user_id);
CREATE INDEX idx_marketing_audiences_system ON public.marketing_audiences(is_system_default) WHERE is_system_default = true;
CREATE INDEX idx_marketing_brand_assets_product ON public.marketing_brand_assets(product_id);
CREATE INDEX idx_marketing_languages_user ON public.marketing_languages(user_id);

-- Updated_at triggers
CREATE TRIGGER update_marketing_products_updated_at
  BEFORE UPDATE ON public.marketing_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_audiences_updated_at
  BEFORE UPDATE ON public.marketing_audiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_brand_assets_updated_at
  BEFORE UPDATE ON public.marketing_brand_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_languages_updated_at
  BEFORE UPDATE ON public.marketing_languages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED SYSTEM DEFAULTS (Genie Products)
-- =====================================================

INSERT INTO public.marketing_products (name, tagline, description, icon, category, features, primary_color, secondary_color, is_system_default, sort_order) VALUES
('Genie Studio', 'The Production Hub', 'Central workspace for AI-powered content creation', 'Wand2', 'production', '["Multi-modal AI", "Unified workspace", "Team collaboration"]'::jsonb, '#6366f1', '#8b5cf6', true, 1),
('Genie Spark', 'Ignite Your Ideas', 'AI ideation and brainstorming companion', 'Sparkles', 'create', '["Idea generation", "Creative prompts", "Concept exploration"]'::jsonb, '#f59e0b', '#fbbf24', true, 2),
('Genie Mind', 'AI That Understands', 'Intelligent content analysis and enhancement', 'Brain', 'create', '["Content analysis", "Smart suggestions", "Context awareness"]'::jsonb, '#10b981', '#34d399', true, 3),
('Genie Vibe', 'Script to Screen', 'Video production and editing suite', 'Video', 'produce', '["Video editing", "Avatar generation", "3D elements"]'::jsonb, '#ec4899', '#f472b6', true, 4),
('Genie Arc', 'Your Production Journey', 'Project management and workflow orchestration', 'GitBranch', 'manage', '["Workflow automation", "Progress tracking", "Team coordination"]'::jsonb, '#3b82f6', '#60a5fa', true, 5),
('Genie Deck', 'Ideas to Impact', 'Presentation and pitch deck creation', 'Presentation', 'produce', '["Slide generation", "Design templates", "Export options"]'::jsonb, '#8b5cf6', '#a78bfa', true, 6),
('Genie Cast', 'Make It. Show It. Scale It.', 'Marketing video production and distribution', 'Megaphone', 'publish', '["Multi-language", "Batch generation", "Auto-publishing"]'::jsonb, '#ef4444', '#f87171', true, 7),
('Ask Genie', 'Your Wish is My Command', 'Universal AI assistant across the ecosystem', 'MessageCircle', 'support', '["Natural language", "Cross-product", "Contextual help"]'::jsonb, '#06b6d4', '#22d3ee', true, 8);

-- =====================================================
-- SEED SYSTEM DEFAULTS (Target Audiences - 20 segments)
-- =====================================================

INSERT INTO public.marketing_audiences (label, description, industry, pain_points, messaging_angles, is_system_default, sort_order) VALUES
('Content Creators', 'YouTubers, podcasters, and digital content producers', 'Media', '["Time-consuming editing", "Creative blocks", "Algorithm changes"]'::jsonb, '["Save hours weekly", "Never run out of ideas", "Stay ahead of trends"]'::jsonb, true, 1),
('Influencers', 'Social media personalities and brand ambassadors', 'Media', '["Content fatigue", "Audience engagement", "Multi-platform demands"]'::jsonb, '["Scale your presence", "Authentic engagement", "Cross-platform consistency"]'::jsonb, true, 2),
('Knowledge Sharers', 'Course creators, coaches, and educators', 'Education', '["Monetizing expertise", "Production quality", "Audience building"]'::jsonb, '["Turn knowledge into income", "Professional production", "Build loyal following"]'::jsonb, true, 3),
('Marketing Teams', 'In-house marketing departments', 'Marketing', '["Content velocity", "Brand consistency", "Campaign ROI"]'::jsonb, '["10x content output", "On-brand always", "Measurable results"]'::jsonb, true, 4),
('Sales Teams', 'B2B and B2C sales professionals', 'Sales', '["Pitch personalization", "Demo creation", "Proposal turnaround"]'::jsonb, '["Personalized at scale", "Compelling demos", "Faster closes"]'::jsonb, true, 5),
('Agencies & Freelancers', 'Creative agencies and independent contractors', 'Services', '["Client deliverables", "Scaling projects", "White-label needs"]'::jsonb, '["Deliver more, faster", "Scale without hiring", "Your brand, our tech"]'::jsonb, true, 6),
('Entrepreneurs', 'Startup founders and small business owners', 'Business', '["Resource constraints", "Professional output", "Time-to-market"]'::jsonb, '["Enterprise quality, startup budget", "Launch faster", "Compete with giants"]'::jsonb, true, 7),
('SMB', 'Small and medium business owners', 'Business', '["Limited budget", "Competing with big brands", "DIY content"]'::jsonb, '["Affordable excellence", "Level the playing field", "No expertise needed"]'::jsonb, true, 8),
('Enterprise Teams', 'Large organization departments', 'Enterprise', '["Compliance", "Collaboration", "Brand governance"]'::jsonb, '["Enterprise-grade security", "Team workflows", "Centralized control"]'::jsonb, true, 9),
('Product Managers', 'Product and program managers', 'Technology', '["Stakeholder communication", "Roadmap visualization", "Feature demos"]'::jsonb, '["Show, don''t tell", "Visual roadmaps", "Instant demos"]'::jsonb, true, 10),
('Customer Success', 'CS managers and support teams', 'Technology', '["Onboarding content", "Tutorial creation", "Support scalability"]'::jsonb, '["Self-service onboarding", "Reduce support tickets", "Scale 1:many"]'::jsonb, true, 11),
('Executive Leadership', 'C-suite and senior executives', 'Enterprise', '["Board presentations", "Investor updates", "Internal comms"]'::jsonb, '["Executive presence", "Investor-ready", "Inspire teams"]'::jsonb, true, 12),
('Developers & Tech Teams', 'Software engineers and technical staff', 'Technology', '["Documentation", "API demos", "Technical tutorials"]'::jsonb, '["Doc that writes itself", "Interactive demos", "Dev-friendly"]'::jsonb, true, 13),
('HR & Recruiters', 'Human resources professionals', 'HR', '["Employer branding", "Onboarding videos", "Culture content"]'::jsonb, '["Attract top talent", "Engaging onboarding", "Show your culture"]'::jsonb, true, 14),
('L&D Professionals', 'Learning and development specialists', 'HR', '["Engagement", "Scalability", "Learning retention"]'::jsonb, '["Engaging training", "Scale learning", "Measurable outcomes"]'::jsonb, true, 15),
('Educators', 'Teachers and academic professionals', 'Education', '["Student engagement", "Content creation time", "Remote learning"]'::jsonb, '["Captivate students", "Create in minutes", "Hybrid-ready"]'::jsonb, true, 16),
('Healthcare Professionals', 'Doctors, nurses, and medical staff', 'Healthcare', '["Patient education", "Compliance requirements", "Clinical training"]'::jsonb, '["Clear patient comms", "HIPAA-aware", "Evidence-based"]'::jsonb, true, 17),
('Compliance & Legal', 'Compliance officers and legal teams', 'Legal', '["Policy communication", "Audit documentation", "Training requirements"]'::jsonb, '["Clear policies", "Audit-ready", "Compliance training"]'::jsonb, true, 18),
('Travel & Hospitality', 'Hotels, airlines, and tourism businesses', 'Travel', '["Destination marketing", "Multilingual content", "Seasonal campaigns"]'::jsonb, '["Inspire wanderlust", "Global reach", "Timely promotions"]'::jsonb, true, 19),
('Real Estate', 'Agents, brokers, and property managers', 'Real Estate', '["Property showcases", "Virtual tours", "Market updates"]'::jsonb, '["Stunning listings", "Virtual presence", "Market authority"]'::jsonb, true, 20);

-- =====================================================
-- SEED SYSTEM DEFAULTS (Languages - 14 core languages)
-- =====================================================

INSERT INTO public.marketing_languages (language_code, language_name, region, is_rtl, tts_provider, is_system_default, sort_order) VALUES
('en', 'English', 'Global', false, 'elevenlabs', true, 1),
('es', 'Spanish', 'LATAM/Spain', false, 'elevenlabs', true, 2),
('pt', 'Portuguese', 'Brazil/Portugal', false, 'azure', true, 3),
('fr', 'French', 'France/Canada', false, 'elevenlabs', true, 4),
('de', 'German', 'DACH', false, 'azure', true, 5),
('it', 'Italian', 'Italy', false, 'azure', true, 6),
('nl', 'Dutch', 'Netherlands/Belgium', false, 'azure', true, 7),
('ja', 'Japanese', 'Japan', false, 'azure', true, 8),
('ko', 'Korean', 'Korea', false, 'azure', true, 9),
('zh', 'Chinese', 'China/Taiwan', false, 'azure', true, 10),
('ar', 'Arabic', 'MENA', true, 'azure', true, 11),
('hi', 'Hindi', 'India', false, 'azure', true, 12),
('tr', 'Turkish', 'Turkey', false, 'azure', true, 13),
('ru', 'Russian', 'Russia/CIS', false, 'azure', true, 14);